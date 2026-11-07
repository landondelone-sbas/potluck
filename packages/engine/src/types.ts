import type { Amount } from './amounts';
import type { Category } from './categories';
import type { Cuisine } from './cuisines';

/** What the engine needs to know about something in the pot. */
export interface PotItem {
  name: string;
  category: Category;
  /** Output of `tagsFor`. Empty means the item is unknown to the engine. */
  tags: readonly string[];
}

/**
 * How a dish is served. `pot`: everything cooks together (a stir-fry, a stew, a bowl). `plate`: a
 * protein with two sides, each cooked on its own, so the steps run the parts side by side.
 */
export type DishFormat = 'pot' | 'plate';

/** A bundled, read-only dish record (PRD section 10). */
export interface Dish {
  id: string;
  cuisine: Cuisine;
  format: DishFormat;
  /** Template with `{p}` (first protein) and `{v}` (first veg) placeholders. */
  title: string;
  minutes: number;
  feel: string;
  /** Tags allowed for each category. */
  wants: Readonly<Record<Category, readonly string[]>>;
  /** Items that pull strongly toward this dish. */
  signature: readonly { category: Category; tag: string }[];
  /** What the chef adds when a category is empty. */
  defaults: Readonly<Record<Category, string>>;
  /** One amount per category for two servings, in metric (see `formatAmount`). */
  amounts: Readonly<Record<Category, Amount>>;
  /** Placeholders: `{p}` `{v}` `{s}` `{spice}` `{sauce}` and `{doneness}` (see `donenessFor`). */
  steps: readonly string[];
  tip: string;
}

export interface ChefAdd {
  category: Category;
  name: string;
}

/** One dish card, computed from a pot. Never stored. */
export interface DishResult {
  dish: Dish;
  score: number;
  used: readonly PotItem[];
  leftOut: readonly PotItem[];
  chefAdds: readonly ChefAdd[];
  title: string;
  steps: readonly string[];
  /** True for the card made from the pot itself, not from a dish in the library (ADR 0016). */
  freestyle?: boolean | undefined;
}

export interface CookResult {
  potSize: number;
  /** `single` when exactly one dish qualified: show it as the hero card. */
  mode: 'single' | 'multi';
  results: readonly DishResult[];
  /**
   * A dinner made from exactly what is in the pot, whether or not any dish fits it. Null only when
   * the pot has no protein, vegetable or starch to cook.
   */
  freestyle: DishResult | null;
  /** Placeholder name for the AI step. Null when the pot has fewer than two items. */
  wildcard: string | null;
}
