import { dishes } from '@potluck/dishes';
import { cook, type Category } from '@potluck/engine';
import { create } from 'zustand';
import { persist, type StateStorage } from 'zustand/middleware';

import { makeLogEntry, type CookLogEntry, type CookRun } from '@/domain/cook-log';
import {
  addFavorite,
  findFavorite,
  removeFavorite,
  toPotItem,
  type AddFavoriteOutcome,
} from '@/domain/favorites';
import { addToPot, potFavorites, pruneMissing, removeFromPot, type PotChange } from '@/domain/pot';
import { assignSlots } from '@/domain/slots';
import { newId } from '@/lib/ids';

import { createSafeJsonStorage, unreadableKey } from './json-storage';
import { deviceStorage } from './storage';
import {
  DEFAULT_PERSISTED,
  PERSIST_VERSION,
  restore,
  runMigrations,
  type AppearanceSetting,
  type PersistedState,
} from './persisted';

export interface PotluckState extends PersistedState {
  /** The last Cook it up. Per-session: results are computed, never saved. */
  run: CookRun | null;
  /** True once the pot or pantry has changed since `run` was cooked. */
  stale: boolean;
  /** `runId:dishId` to the id of the cook log entry made from that dish in that cook. */
  logged: Record<string, string>;
  /** True while the user is adding favorites from Settings after setup was already done. */
  setupReopened: boolean;
  /** Where each item in the pot sits (see `domain/slots.ts`). Kept so tokens never jump. */
  slots: Record<string, number>;

  addFavorite: (category: Category, name: string) => AddFavoriteOutcome;
  removeFavorite: (id: string) => void;
  /** Setup tiles: add the favorite if it is missing, remove it if it is there. */
  toggleFavorite: (category: Category, name: string) => void;
  addToPot: (id: string) => PotChange;
  removeFromPot: (id: string) => void;
  clearPot: () => void;
  /** Replace the pot, for mood starters. */
  setPot: (ids: string[]) => void;
  /** Score the pot. Returns null, and changes nothing, when the pot is empty. */
  cook: () => CookRun | null;
  /**
   * Make a dish tonight: record it in the cook log and return the entry. Asking again for the same
   * dish from the same cook returns the entry already made, so the log never doubles up.
   */
  logCooked: (dishId: string) => CookLogEntry | null;
  completeOnboarding: () => void;
  setAppearance: (appearance: AppearanceSetting) => void;
  setKeepAwake: (keepAwake: boolean) => void;
  /** Open the setup steps again from Settings. Favorites are kept. */
  reopenSetup: () => void;
  /** Erase everything: favorites, pot, cook log and settings (SET-3). */
  resetAll: () => void;
}

/** The key the app's data is saved under. */
const STORAGE_NAME = 'potluck.state';

/** The state changes every pot edit makes: the new pot, where its tokens sit, and staleness. */
function potUpdate(state: PotluckState, pot: string[]) {
  return { pot, slots: assignSlots(pot, state.slots), stale: state.run !== null };
}

/** A store backed by the given storage. Tests pass an in-memory one. */
export function createPotluckStore(storage: StateStorage) {
  return create<PotluckState>()(
    persist(
      (set, get) => ({
        ...DEFAULT_PERSISTED,
        run: null,
        stale: false,
        logged: {},
        setupReopened: false,
        slots: {},

        addFavorite: (category, name) => {
          const outcome = addFavorite(get().favorites, category, name, {
            id: newId(),
            now: Date.now(),
          });
          if (outcome.status === 'added') set({ favorites: outcome.favorites });
          return outcome;
        },

        removeFavorite: (id) => {
          const state = get();
          const favorites = removeFavorite(state.favorites, id);
          const pot = pruneMissing(state.pot, favorites);
          set({ favorites, ...(pot.length === state.pot.length ? {} : potUpdate(state, pot)) });
        },

        toggleFavorite: (category, name) => {
          const existing = findFavorite(get().favorites, category, name);
          if (existing) get().removeFavorite(existing.id);
          else get().addFavorite(category, name);
        },

        addToPot: (id) => {
          const state = get();
          const change = addToPot(state.pot, state.favorites, id);
          if (change.ok) set(potUpdate(state, change.pot));
          return change;
        },

        removeFromPot: (id) => {
          const state = get();
          if (!state.pot.includes(id)) return;
          set(potUpdate(state, removeFromPot(state.pot, id)));
        },

        clearPot: () => {
          const state = get();
          if (state.pot.length === 0) return;
          set(potUpdate(state, []));
        },

        setPot: (ids) => {
          const state = get();
          set(potUpdate(state, pruneMissing(ids, state.favorites)));
        },

        cook: () => {
          const { favorites, pot } = get();
          const members = potFavorites(favorites, pot);
          const result = cook(members.map(toPotItem), dishes);
          if (!result) return null;
          const run: CookRun = {
            runId: newId(),
            result,
            pot: members.map(({ name, category }) => ({ name, category })),
            cookedAt: Date.now(),
          };
          set({ run, stale: false });
          return run;
        },

        logCooked: (dishId) => {
          const { run, logged, cookLog } = get();
          if (!run) return null;
          const card = run.result.results.find((r) => r.dish.id === dishId);
          if (!card) return null;
          const key = `${run.runId}:${dishId}`;
          const existing = cookLog.find((entry) => entry.id === logged[key]);
          if (existing) return existing;
          const entry = makeLogEntry(card, run, { id: newId(), now: Date.now() });
          set({ cookLog: [entry, ...cookLog], logged: { ...logged, [key]: entry.id } });
          return entry;
        },

        completeOnboarding: () => set({ onboardingComplete: true, setupReopened: false }),

        setAppearance: (appearance) => set({ appearance }),

        setKeepAwake: (keepAwake) => set({ keepAwake }),

        reopenSetup: () => set({ setupReopened: true }),

        resetAll: () => {
          set({
            ...DEFAULT_PERSISTED,
            run: null,
            stale: false,
            logged: {},
            setupReopened: false,
            slots: {},
          });
          // "All data" includes any copy kept of data that could not be read.
          void Promise.resolve(storage.removeItem(unreadableKey(STORAGE_NAME))).catch(
            () => undefined,
          );
        },
      }),
      {
        name: STORAGE_NAME,
        version: PERSIST_VERSION,
        storage: createSafeJsonStorage<PersistedState>(storage),
        partialize: ({
          favorites,
          pot,
          onboardingComplete,
          cookLog,
          appearance,
          keepAwake,
        }): PersistedState => ({
          favorites,
          pot,
          onboardingComplete,
          cookLog,
          appearance,
          keepAwake,
        }),
        migrate: (persisted, version) => {
          try {
            return runMigrations(persisted, version) as PotluckState;
          } catch {
            // A failed migration must not stop the app. `merge` below still salvages what it can.
            return persisted as PotluckState;
          }
        },
        // Runs for every load, current version or not: damaged records are dropped one by one.
        // With nothing saved yet (first launch) zustand still calls this: keep what is in memory.
        merge: (persisted, current) => {
          if (persisted == null) return current;
          const restored = restore(persisted);
          return { ...current, ...restored, slots: assignSlots(restored.pot, {}) };
        },
      },
    ),
  );
}

/** The app's store, saved on the device. */
export const usePotluck = createPotluckStore(deviceStorage);
