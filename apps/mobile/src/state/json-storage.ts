import type { PersistStorage, StateStorage, StorageValue } from 'zustand/middleware';

/** Where unreadable data for `name` is kept. */
export function unreadableKey(name: string): string {
  return `${name}.unreadable`;
}

/**
 * JSON storage for the persisted store that cannot stop the app from starting. zustand's own
 * `createJSONStorage` throws on unreadable data, and the app waits for loading to finish before it
 * shows anything, so one damaged value would leave it on the splash screen for good.
 *
 * - A read that fails, or data that is not valid JSON, loads as "nothing saved".
 * - Unreadable data is copied to `unreadableKey(name)` first, so it is never silently overwritten.
 * - A write that fails is dropped. The next change writes again.
 */
export function createSafeJsonStorage<S>(storage: StateStorage): PersistStorage<S> {
  return {
    getItem: async (name) => {
      let raw: string | null;
      try {
        raw = await storage.getItem(name);
      } catch {
        return null;
      }
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as StorageValue<S>;
      } catch {
        try {
          await storage.setItem(unreadableKey(name), raw);
        } catch {
          // Nothing more can be done: carry on with an empty state.
        }
        return null;
      }
    },
    setItem: async (name, value) => {
      try {
        await storage.setItem(name, JSON.stringify(value));
      } catch {
        // Dropped: the next change writes the whole state again.
      }
    },
    removeItem: async (name) => {
      try {
        await storage.removeItem(name);
      } catch {
        // Nothing to remove, or it cannot be removed: either way the app carries on.
      }
    },
  };
}
