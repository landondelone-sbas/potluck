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

/**
 * When every pick is the same format but a close dish of the other format exists, the last pick
 * gives way to the best of that other format, so the user sees a choice between a one-pot dish and a
 * plated meal. The order of the picks stays by rank.
 */
function mixFormats(picks: DishEvaluation[], close: readonly DishEvaluation[]): DishEvaluation[] {
  const first = picks[0];
  if (!first || picks.length < 2) return picks;
  if (picks.some((p) => p.dish.format !== first.dish.format)) return picks;
  const other = close.find((r) => r.dish.format !== first.dish.format);
  if (!other) return picks;
  return [...picks.slice(0, -1), other].sort(rank);
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
export function cook(
  items: readonly PotItem[],
  dishes: readonly Dish[],
  pantry?: readonly PotItem[],
): CookResult | null {
  if (items.length === 0) return null;

  // Stable sort: within a category the pot keeps its order, so "first protein" is the first added.
  const pot = [...items].sort((a, b) => categoryIndex(a.category) - categoryIndex(b.category));

  const all = dishes.map((dish, index) => evaluateDish(dish, pot, index)).sort(rank);

  // When the pot gives a dish no protein, the chef supplies one. With a pantry given, that is the
  // first pantry protein the dish accepts, and a dish none of them suit is not offered. If that
  // would leave nothing to offer, every dish is kept with its own default protein.
  const chefProteins = new Map<DishEvaluation, PotItem>();
  let ranked = all;
  if (pantry) {
    const proteins = pantry.filter((item) => item.category === 'protein');
    const offered = all.filter((evaluation) => {
      if (evaluation.used.some((item) => item.category === 'protein')) return true;
      const wants = evaluation.dish.wants.protein;
      const match = proteins.find((item) => item.tags.some((tag) => wants.includes(tag)));
      if (match) chefProteins.set(evaluation, match);
      return match !== undefined;
    });
    if (offered.length > 0) ranked = offered;
    else chefProteins.clear();
  }

  const top = ranked[0];
  if (!top) return null;

  const close = ranked.filter(
    (r) => isCloseEnough(r.score, top.score) && r.used.length >= top.used.length - 1,
  );
  const candidates = mixFormats(close.slice(0, MAX_RESULTS), close);

  return {
    potSize: pot.length,
    mode: candidates.length === 1 ? 'single' : 'multi',
    results: candidates.map((evaluation) => buildResult(evaluation, chefProteins.get(evaluation))),
    wildcard: pot.length >= 2 ? wildcardName(pot) : null,
  };
}
