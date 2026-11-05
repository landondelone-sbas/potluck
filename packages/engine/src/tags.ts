import type { Category } from './categories';
import { TAG_RULES } from './tag-rules';

/** Tags for a favorite's name within its category. An empty list means unknown. */
export function tagsFor(category: Category, name: string): string[] {
  const lower = name.toLowerCase();
  return TAG_RULES[category].filter(([, pattern]) => pattern.test(lower)).map(([tag]) => tag);
}

function vocabularyFor(category: Category): readonly string[] {
  return TAG_RULES[category].map(([tag]) => tag);
}

/** Every tag the engine can produce, per category. Dish files may only use these. */
export const TAG_VOCABULARY: Readonly<Record<Category, readonly string[]>> = {
  protein: vocabularyFor('protein'),
  veg: vocabularyFor('veg'),
  spice: vocabularyFor('spice'),
  sauce: vocabularyFor('sauce'),
  starch: vocabularyFor('starch'),
};
