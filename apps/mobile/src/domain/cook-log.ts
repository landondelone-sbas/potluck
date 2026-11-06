import {
  buildResult,
  categoryIndex,
  evaluateDish,
  tagsFor,
  type Category,
  type CookResult,
  type Dish,
  type DishResult,
  type PotItem,
} from '@potluck/engine';

/** One item that was in the pot. Enough to work the recipe out again, whatever happens to the pantry. */
export interface PotSnapshotItem {
  name: string;
  category: Category;
}

export interface CookLogEntry {
  id: string;
  dishId: string;
  /** The title as it was shown, built from the user's own items. */
  title: string;
  /** What was in the pot. */
  pot: PotSnapshotItem[];
  /** Milliseconds since the epoch. */
  cookedAt: number;
  /**
   * The protein the chef cooked when the pot had none: a pantry protein the dish accepts. Kept so
   * the recipe, rebuilt later, names the same protein the card did. Absent for older entries.
   */
  chefProtein?: string | undefined;
  /** Reserved for ratings (RES-7, v1.1). */
  rating: 'up' | 'down' | null;
}

/** What the last Cook it up produced, kept for the session and never saved (PRD section 10). */
export interface CookRun {
  /** Identifies one press of Cook it up. */
  runId: string;
  result: CookResult;
  pot: PotSnapshotItem[];
  cookedAt: number;
}

export function makeLogEntry(
  card: DishResult,
  run: CookRun,
  meta: { id: string; now: number },
): CookLogEntry {
  const chefProtein = card.chefAdds.find((add) => add.category === 'protein')?.name;
  return {
    id: meta.id,
    dishId: card.dish.id,
    title: card.title,
    pot: run.pot.map(({ name, category }) => ({ name, category })),
    cookedAt: meta.now,
    rating: null,
    ...(chefProtein ? { chefProtein } : {}),
  };
}

/**
 * Build a logged dish's recipe again: which items it used, what the chef adds, the steps. The
 * engine is deterministic, so the same pot and dish give the same card. Returns null when the dish
 * is no longer in the library, for example after an app update removed it.
 */
export function rebuildResult(entry: CookLogEntry, library: readonly Dish[]): DishResult | null {
  const index = library.findIndex((dish) => dish.id === entry.dishId);
  const dish = library[index];
  if (!dish) return null;

  // Same order as `cook`: by category, and within a category as they were added.
  const pot: PotItem[] = [...entry.pot]
    .sort((a, b) => categoryIndex(a.category) - categoryIndex(b.category))
    .map(({ name, category }) => ({ name, category, tags: tagsFor(category, name) }));

  const chef: PotItem | undefined = entry.chefProtein
    ? { name: entry.chefProtein, category: 'protein', tags: tagsFor('protein', entry.chefProtein) }
    : undefined;

  return buildResult(evaluateDish(dish, pot, index), chef);
}
