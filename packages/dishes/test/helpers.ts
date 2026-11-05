import { tagsFor, type Category, type PotItem } from '@potluck/engine';

/**
 * The library starts with prototype v1's 16 dishes, in the prototype's order. Dishes added after
 * that come later, so ties still go to the older ones.
 */
export const PROTOTYPE_DISH_COUNT = 16;

export type PotSpec = readonly (readonly [Category, string])[];

/** Build engine pot items from `[category, name]` pairs, tagging them the way the app does. */
export function potOf(spec: PotSpec): PotItem[] {
  return spec.map(([category, name]) => ({ name, category, tags: tagsFor(category, name) }));
}

export function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('expected a value');
  return value;
}
