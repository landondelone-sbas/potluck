import { CATEGORIES } from '@potluck/engine';

import { SUGGESTIONS } from '@/domain/catalog';
import { usePotluck } from '@/state/store';

const EMPTY = {
  favorites: [],
  pot: [],
  slots: {},
  run: null,
  stale: false,
  logged: {},
  setupReopened: false,
  appearance: 'system' as const,
  keepAwake: false,
  cookLog: [],
  onboardingComplete: true,
};

/** Reset the app's store to a clean state, as if the app had just opened after setup. */
export function resetStore(): void {
  usePotluck.setState(EMPTY);
}

/** A user who picked every setup suggestion. */
export function seedFullPantry(): void {
  resetStore();
  const { addFavorite } = usePotluck.getState();
  for (const category of CATEGORIES) {
    for (const name of SUGGESTIONS[category]) addFavorite(category, name);
  }
}

/** The id of a favorite, by name. */
export function idOf(name: string): string {
  const found = usePotluck.getState().favorites.find((f) => f.name === name);
  if (!found) throw new Error(`No favorite named ${name}`);
  return found.id;
}
