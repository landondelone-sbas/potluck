/** The five food categories, in the order they appear on screen and in the pot. */
export const CATEGORIES = ['protein', 'veg', 'spice', 'sauce', 'starch'] as const;

export type Category = (typeof CATEGORIES)[number];

export function categoryIndex(category: Category): number {
  return CATEGORIES.indexOf(category);
}
