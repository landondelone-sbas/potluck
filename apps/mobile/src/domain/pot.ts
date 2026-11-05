import { CATEGORIES, categoryIndex, type Category } from '@potluck/engine';

import type { Favorite } from './favorites';

/** Pot limits (POT-5). */
export const MAX_PER_CATEGORY = 3;
export const MAX_TOTAL = 12;

export type PotRejection =
  /** Twelve items are already in. */
  | 'full'
  /** Three of this category are already in. */
  | 'category-full'
  | 'duplicate'
  /** The id is not one of the user's favorites. */
  | 'unknown';

export type PotChange =
  { ok: true; pot: string[] } | { ok: false; reason: PotRejection; category?: Category };

/** Favorites in the pot, ordered by category and then by the order they were added. */
export function potFavorites(favorites: readonly Favorite[], pot: readonly string[]): Favorite[] {
  const byId = new Map(favorites.map((f) => [f.id, f]));
  return pot
    .map((id) => byId.get(id))
    .filter((f): f is Favorite => f !== undefined)
    .sort((a, b) => categoryIndex(a.category) - categoryIndex(b.category));
}

export function countsByCategory(
  items: readonly { category: Category }[],
): Record<Category, number> {
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;
  for (const item of items) counts[item.category] += 1;
  return counts;
}

/** Try to put a favorite in the pot. Never throws: a refusal says why (POT-5). */
export function addToPot(
  pot: readonly string[],
  favorites: readonly Favorite[],
  id: string,
): PotChange {
  const favorite = favorites.find((f) => f.id === id);
  if (!favorite) return { ok: false, reason: 'unknown' };
  if (pot.includes(id)) return { ok: false, reason: 'duplicate' };
  if (pot.length >= MAX_TOTAL) return { ok: false, reason: 'full' };

  const inCategory = potFavorites(favorites, pot).filter((f) => f.category === favorite.category);
  if (inCategory.length >= MAX_PER_CATEGORY) {
    return { ok: false, reason: 'category-full', category: favorite.category };
  }
  return { ok: true, pot: [...pot, id] };
}

export function removeFromPot(pot: readonly string[], id: string): string[] {
  return pot.filter((x) => x !== id);
}

/** Drop ids that are no longer favorites, for example after a removal or a restore. */
export function pruneMissing(pot: readonly string[], favorites: readonly Favorite[]): string[] {
  const known = new Set(favorites.map((f) => f.id));
  return pot.filter((id) => known.has(id));
}
