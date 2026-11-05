import type { Category } from '@potluck/engine';

import { findFavorite, type Favorite } from './favorites';
import { addToPot } from './pot';

export interface Mood {
  id: string;
  label: string;
  /** Favorites the mood reaches for, by category and name. */
  picks: readonly { category: Category; name: string }[];
}

/** The four mood starters from prototype v1 (POT-7). */
export const MOODS: readonly Mood[] = [
  {
    id: 'cozy',
    label: 'Cozy night',
    picks: [
      { category: 'protein', name: 'Chicken thighs' },
      { category: 'veg', name: 'Carrots' },
      { category: 'starch', name: 'Baby potatoes' },
      { category: 'spice', name: 'Italian herbs' },
    ],
  },
  {
    id: 'fresh',
    label: 'Fresh and light',
    picks: [
      { category: 'protein', name: 'Salmon' },
      { category: 'veg', name: 'Zucchini' },
      { category: 'starch', name: 'Quinoa' },
      { category: 'spice', name: 'Lemon pepper' },
      { category: 'sauce', name: 'Pesto' },
    ],
  },
  {
    id: 'spicy',
    label: 'Spicy kick',
    picks: [
      { category: 'protein', name: 'Ground beef' },
      { category: 'veg', name: 'Bell peppers' },
      { category: 'starch', name: 'Jasmine rice' },
      { category: 'spice', name: 'Cumin' },
      { category: 'sauce', name: 'Salsa verde' },
    ],
  },
  {
    id: 'ten-minute',
    label: 'Ten-minute meal',
    picks: [
      { category: 'protein', name: 'Eggs' },
      { category: 'veg', name: 'Spinach' },
      { category: 'starch', name: 'Sourdough' },
      { category: 'spice', name: 'Chili flakes' },
    ],
  },
];

/**
 * The pot a mood makes from the user's own favorites. Picks the user does not have are skipped.
 * Names match ignoring case, within the pick's category. The pot limits still apply.
 */
export function moodPot(mood: Mood, favorites: readonly Favorite[]): string[] {
  let pot: string[] = [];
  for (const pick of mood.picks) {
    const favorite = findFavorite(favorites, pick.category, pick.name);
    if (!favorite) continue;
    const change = addToPot(pot, favorites, favorite.id);
    if (change.ok) pot = change.pot;
  }
  return pot;
}
