import type { Dish, PotItem } from './types';
import { VIBE } from './vibe';

/** Bonus points for each signature match (PRD section 9.3). */
export const SIGNATURE_BONUS = 6;

export interface ItemScore {
  points: number;
  /** False means the item is left out of this dish. */
  used: boolean;
}

/** 0 to 4 extra points: the shorter a dish's list for a category, the more a fit says. */
export function specificityBonus(listLength: number): number {
  return Math.round(4 * (1 - Math.min(listLength, 12) / 12));
}

/** Score one pot item against one dish (PRD section 9.3). */
export function scoreItem(item: PotItem, dish: Dish): ItemScore {
  const wants = dish.wants[item.category];

  // Fit: a tag is on the dish's list for this category.
  if (item.tags.some((tag) => wants.includes(tag))) {
    return { points: 10 + specificityBonus(wants.length), used: true };
  }

  if (item.category === 'spice' || item.category === 'sauce') {
    if (item.tags.length === 0) return { points: 4, used: true };
    const suits = item.tags.some((tag) => {
      const cuisines = VIBE[tag];
      return cuisines !== undefined && (cuisines.includes('*') || cuisines.includes(dish.cuisine));
    });
    return suits ? { points: 5, used: true } : { points: 0, used: false };
  }

  // Protein, veg or starch: known but unused, or unknown.
  return item.tags.length > 0 ? { points: 1, used: false } : { points: 3, used: true };
}

export interface DishEvaluation {
  dish: Dish;
  /** Position in the library. Breaks ties so ranking is stable. */
  index: number;
  score: number;
  used: PotItem[];
  leftOut: PotItem[];
}

/** Sum the item scores and signature bonuses for a dish. */
export function evaluateDish(dish: Dish, pot: readonly PotItem[], index: number): DishEvaluation {
  let score = 0;
  const used: PotItem[] = [];
  const leftOut: PotItem[] = [];

  for (const item of pot) {
    const result = scoreItem(item, dish);
    score += result.points;
    (result.used ? used : leftOut).push(item);
  }

  for (const { category, tag } of dish.signature) {
    if (pot.some((item) => item.category === category && item.tags.includes(tag))) {
      score += SIGNATURE_BONUS;
    }
  }

  return { dish, index, score, used, leftOut };
}
