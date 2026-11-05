import { useSyncExternalStore } from 'react';

import { usePotluck } from './store';

const subscribe = (onChange: () => void) => usePotluck.persist.onFinishHydration(onChange);
const getSnapshot = () => usePotluck.persist.hasHydrated();

/**
 * False until the saved data has been read from the device. The app shows nothing until then, so a
 * returning user never sees the setup flow flash up before their saved state arrives.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
