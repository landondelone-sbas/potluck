import { CATEGORIES, categoryIndex, type Category } from './categories';
import { buildResult, type ChefPicks } from './results';
import { evaluateDish, type DishEvaluation } from './score';
import type { CookResult, Dish, PotItem } from './types';
import { freestyle } from './freestyle';
import { wildcardName } from './wildcard';

/** A dish is a candidate when it scores at least this percent of the top dish. */
export const CLOSE_PERCENT = 88;

/** The most dishes shown at once. */
export const MAX_RESULTS = 3;

function rank(a: DishEvaluation, b: DishEvaluation): number {
  return b.score - a.score || b.used.length - a.used.length || a.index - b.index;
}

/**
 * When every pick is the same format and the very next dish down is a close one of the other
 * format, the last pick gives way to it, so the user sees a choice between a one-pot dish and a
 * plated meal. Only the next dish down counts: a plate further away does not push out a pick that
 * clearly earned its place. The picks stay in rank order.
 */
function mixFormats(picks: DishEvaluation[], close: readonly DishEvaluation[]): DishEvaluation[] {
  const first = picks[0];
  if (!first || picks.length < 2) return picks;
  if (picks.some((p) => p.dish.format !== first.dish.format)) return picks;
  const next = close[picks.length];
  if (!next || next.dish.format === first.dish.format) return picks;
  return [...picks.slice(0, -1), next].sort(rank);
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

  // Where the pot gives a dish nothing in a category, the chef supplies something. With a pantry
  // given, that is the first pantry item the dish accepts, so the cook is never told to use
  // something they do not own. A protein is required: a dish none of the user's proteins suit is not
  // offered, unless that would leave nothing, when every dish keeps its own default protein. For the
  // other categories a pantry with nothing suitable leaves the dish's default (the chef adds it).
  const chefPicks = new Map<DishEvaluation, ChefPicks>();
  let ranked = all;
  if (pantry) {
    const fromPantry = (evaluation: DishEvaluation, category: Category): PotItem | undefined => {
      if (evaluation.used.some((item) => item.category === category)) return undefined;
      const wants = evaluation.dish.wants[category];
      return pantry.find(
        (item) => item.category === category && item.tags.some((tag) => wants.includes(tag)),
      );
    };
    const picksFor = (evaluation: DishEvaluation): ChefPicks => {
      const picks: ChefPicks = {};
      for (const category of CATEGORIES) {
        const pick = fromPantry(evaluation, category);
        if (pick) picks[category] = pick;
      }
      return picks;
    };
    const offered = all.filter((evaluation) => {
      const noProteinUsed = !evaluation.used.some((item) => item.category === 'protein');
      const picks = picksFor(evaluation);
      if (noProteinUsed && !picks.protein) return false;
      chefPicks.set(evaluation, picks);
      return true;
    });
    if (offered.length > 0) ranked = offered;
    else chefPicks.clear();
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
    results: candidates.map((evaluation) => buildResult(evaluation, chefPicks.get(evaluation))),
    freestyle: freestyle(pot),
    wildcard: pot.length >= 2 ? wildcardName(pot) : null,
  };
}
