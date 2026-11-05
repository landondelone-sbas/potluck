import { categoryIndex } from './categories';
import { buildResult } from './results';
import { evaluateDish, type DishEvaluation } from './score';
import type { CookResult, Dish, PotItem } from './types';
import { wildcardName } from './wildcard';

/** A dish is a candidate when it scores at least this percent of the top dish. */
export const CLOSE_PERCENT = 88;

/** The most dishes shown at once. */
export const MAX_RESULTS = 3;

function rank(a: DishEvaluation, b: DishEvaluation): number {
  return b.score - a.score || b.used.length - a.used.length || a.index - b.index;
}

/** True when `score` is at least CLOSE_PERCENT of `topScore`. Integer math: no float edge cases. */
export function isCloseEnough(score: number, topScore: number): boolean {
  return score * 100 >= topScore * CLOSE_PERCENT;
}

/**
 * Score every dish against the pot and pick one winner or up to three (PRD section 9.4).
 * Pure: the same pot and library always give the same result.
 * Returns null for an empty pot or an empty library.
 */
export function cook(items: readonly PotItem[], dishes: readonly Dish[]): CookResult | null {
  if (items.length === 0) return null;

  // Stable sort: within a category the pot keeps its order, so "first protein" is the first added.
  const pot = [...items].sort((a, b) => categoryIndex(a.category) - categoryIndex(b.category));

  const ranked = dishes.map((dish, index) => evaluateDish(dish, pot, index)).sort(rank);
  const top = ranked[0];
  if (!top) return null;

  const candidates = ranked
    .filter((r) => isCloseEnough(r.score, top.score) && r.used.length >= top.used.length - 1)
    .slice(0, MAX_RESULTS);

  return {
    potSize: pot.length,
    mode: candidates.length === 1 ? 'single' : 'multi',
    results: candidates.map(buildResult),
    wildcard: pot.length >= 2 ? wildcardName(pot) : null,
  };
}
