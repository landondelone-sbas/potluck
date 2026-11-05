import { CATEGORIES } from '@potluck/engine';
import { z } from 'zod';

import type { CookLogEntry } from '@/domain/cook-log';
import { MAX_NAME_LENGTH, type Favorite } from '@/domain/favorites';
import { addToPot } from '@/domain/pot';

/**
 * Version of the saved data (X-6). Raise it whenever the saved shape changes, and add a migration
 * for the old version to `MIGRATIONS`.
 */
export const PERSIST_VERSION = 1;

/** Light, dark, or follow the phone (SET-1). */
export const APPEARANCES = ['system', 'light', 'dark'] as const;
export type AppearanceSetting = (typeof APPEARANCES)[number];

/** Everything that is saved on the device. Anything else in the store is per-session. */
export interface PersistedState {
  favorites: Favorite[];
  /** Favorite ids, in the order they were added. */
  pot: string[];
  onboardingComplete: boolean;
  cookLog: CookLogEntry[];
  appearance: AppearanceSetting;
  /** Keep the screen awake on the recipe screen (REC-3). */
  keepAwake: boolean;
}

/** What a fresh install, or a reset, starts from. */
export const DEFAULT_PERSISTED: PersistedState = {
  favorites: [],
  pot: [],
  onboardingComplete: false,
  cookLog: [],
  appearance: 'system',
  keepAwake: false,
};

const FavoriteSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(MAX_NAME_LENGTH),
  category: z.enum(CATEGORIES),
  createdAt: z.number(),
});

const CookLogEntrySchema = z.object({
  id: z.string().min(1),
  dishId: z.string().min(1),
  title: z.string(),
  pot: z.array(z.object({ name: z.string().min(1), category: z.enum(CATEGORIES) })),
  cookedAt: z.number(),
  rating: z.enum(['up', 'down']).nullable(),
});

/** Keep the entries that parse and drop the rest, so one bad record never costs the others. */
function validEntries<T>(schema: z.ZodType<T>, value: unknown): T[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const parsed = schema.safeParse(entry);
    return parsed.success ? [parsed.data] : [];
  });
}

/**
 * Turn whatever was read from storage into a valid state. Lenient by design: a damaged record is
 * dropped on its own and the rest survives, because losing a user's favorites is the worst outcome.
 */
export function restore(raw: unknown): PersistedState {
  const source = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};

  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const favorites = validEntries(FavoriteSchema, source.favorites).filter((f) => {
    const nameKey = `${f.category}:${f.name.toLowerCase()}`;
    if (seenIds.has(f.id) || seenNames.has(nameKey)) return false;
    seenIds.add(f.id);
    seenNames.add(nameKey);
    return true;
  });

  // Replay the saved pot through the normal rules so limits and missing favorites are enforced.
  let pot: string[] = [];
  if (Array.isArray(source.pot)) {
    for (const id of source.pot) {
      if (typeof id !== 'string') continue;
      const change = addToPot(pot, favorites, id);
      if (change.ok) pot = change.pot;
    }
  }

  return {
    favorites,
    pot,
    onboardingComplete: source.onboardingComplete === true,
    cookLog: validEntries(CookLogEntrySchema, source.cookLog),
    appearance: APPEARANCES.find((value) => value === source.appearance) ?? 'system',
    keepAwake: source.keepAwake === true,
  };
}

/** Turns saved data of version N into version N + 1. */
export type Migration = (state: unknown) => unknown;

/** Keyed by the version being migrated from. There is nothing before version 1 yet. */
export const MIGRATIONS: Readonly<Record<number, Migration>> = {};

/** Bring saved data from `fromVersion` up to `target` by running each step in order. */
export function runMigrations(
  raw: unknown,
  fromVersion: number,
  migrations: Readonly<Record<number, Migration>> = MIGRATIONS,
  target: number = PERSIST_VERSION,
): unknown {
  let state = raw;
  for (let version = fromVersion; version < target; version += 1) {
    const step = migrations[version];
    if (step) state = step(state);
  }
  return state;
}
