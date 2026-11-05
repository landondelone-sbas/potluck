import { tagsFor, type Category, type Dish, type PotItem } from '../src';

/** A pot item with tags derived the way the app derives them. */
export function item(category: Category, name: string): PotItem {
  return { name, category, tags: tagsFor(category, name) };
}

/** Unwrap a value that must exist, so tests fail loudly instead of through `undefined`. */
export function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('expected a value');
  return value;
}

/**
 * A small dish with known list lengths, so expected scores are easy to work out:
 * protein list of 2 (bonus 3), veg list of 1 (bonus 4), starch list of 6 (bonus 2).
 */
export function makeDish(overrides: Partial<Dish> = {}): Dish {
  return {
    id: 'fixture',
    cuisine: 'asian',
    title: '{p} & {v} Fixture',
    minutes: 20,
    feel: 'Quick',
    wants: {
      protein: ['chicken', 'beef'],
      veg: ['broccoli'],
      spice: ['ginger'],
      sauce: ['peanut'],
      starch: ['rice', 'noodles', 'pasta', 'potato', 'bread', 'quinoa'],
    },
    signature: [],
    defaults: {
      protein: 'tofu',
      veg: 'carrots',
      spice: 'garlic',
      sauce: 'soy sauce',
      starch: 'rice',
    },
    steps: ['Cook the {s}.', 'Add the {p} and {v} with {spice}.', 'Finish with {sauce}.'],
    tip: 'Add more veg.',
    ...overrides,
  };
}
