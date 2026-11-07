import {
  buildResult,
  categoryIndex,
  evaluateDish,
  freestyle,
  FREESTYLE_ID,
  tagsFor,
  type Category,
  type ChefPicks,
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
   * What the chef supplied where the pot had nothing for the dish: a pantry item the dish accepts,
   * or the dish's own default, by category. Kept so the recipe, rebuilt later, names the same things
   * the card did.
   */
  chefPicks?: Partial<Record<Category, string>> | undefined;
  /** Older entries kept only the protein. Read as `chefPicks.protein`. */
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
  const chefPicks: Partial<Record<Category, string>> = {};
  for (const add of card.chefAdds) chefPicks[add.category] = add.name;
  return {
    id: meta.id,
    dishId: card.dish.id,
    title: card.title,
    pot: run.pot.map(({ name, category }) => ({ name, category })),
    cookedAt: meta.now,
    rating: null,
    ...(card.chefAdds.length > 0 ? { chefPicks } : {}),
  };
}

/**
 * Build a logged dish's recipe again: which items it used, what the chef adds, the steps. The
 * engine is deterministic, so the same pot and dish give the same card. Returns null when the dish
 * is no longer in the library, for example after an app update removed it.
 */
export function rebuildResult(entry: CookLogEntry, library: readonly Dish[]): DishResult | null {
  // A freestyle dinner is not in the library: it is made from the pot, so it is made from it again.
  if (entry.dishId === FREESTYLE_ID) {
    return freestyle(
      entry.pot.map(({ name, category }) => ({ name, category, tags: tagsFor(category, name) })),
    );
  }

  const index = library.findIndex((dish) => dish.id === entry.dishId);
  const dish = library[index];
  if (!dish) return null;

  // Same order as `cook`: by category, and within a category as they were added.
  const pot: PotItem[] = [...entry.pot]
    .sort((a, b) => categoryIndex(a.category) - categoryIndex(b.category))
    .map(({ name, category }) => ({ name, category, tags: tagsFor(category, name) }));

  const saved: Partial<Record<Category, string>> = {
    ...(entry.chefProtein ? { protein: entry.chefProtein } : {}),
    ...entry.chefPicks,
  };
  const picks: ChefPicks = {};
  for (const [category, name] of Object.entries(saved) as [Category, string][]) {
    picks[category] = { name, category, tags: tagsFor(category, name) };
  }

  return buildResult(evaluateDish(dish, pot, index), picks);
}
