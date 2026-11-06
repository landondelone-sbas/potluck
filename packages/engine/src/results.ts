import { CATEGORIES, type Category } from './categories';
import { donenessFor } from './doneness';
import type { DishEvaluation } from './score';
import { howToCook, type SideCategory } from './sides';
import { tagsFor } from './tags';
import { fillTemplate, joinAnd, titleCase } from './text';
import type { ChefAdd, DishResult, PotItem } from './types';

/**
 * Build the card for one evaluated dish (PRD section 9.5).
 * `chefProtein` is a protein from the user's pantry that the chef cooks when the pot has none the
 * dish uses. Without it the chef falls back to the dish's own default protein.
 */
export function buildResult(evaluation: DishEvaluation, chefProtein?: PotItem): DishResult {
  const { dish, used, leftOut, score } = evaluation;

  const usedIn = (category: Category) => used.filter((item) => item.category === category);

  const fallback = (category: Category): string =>
    category === 'protein' && chefProtein
      ? chefProtein.name.toLowerCase()
      : dish.defaults[category];

  const names = (category: Category): string => {
    const picked = usedIn(category).map((item) => item.name.toLowerCase());
    return picked.length > 0 ? joinAnd(picked) : fallback(category);
  };

  const firstName = (category: Category): string =>
    titleCase(usedIn(category)[0]?.name ?? fallback(category));

  // The proteins that are cooked: the pot's, or the chef's pick when the pot has none.
  const cooked = usedIn('protein');
  const doneness = donenessFor(
    cooked.length > 0
      ? cooked
      : [
          {
            name: fallback('protein'),
            tags: chefProtein?.tags ?? tagsFor('protein', fallback('protein')),
          },
        ],
  );

  // The sides a plated dish cooks: the pot's, or the chef's default when the pot has none.
  const sides = (category: SideCategory) => {
    const picked = usedIn(category);
    return howToCook(
      category,
      picked.length > 0
        ? picked
        : [{ name: dish.defaults[category], tags: tagsFor(category, dish.defaults[category]) }],
    );
  };

  const stepValues = {
    veg_how: sides('veg'),
    starch_how: sides('starch'),
    doneness,
    p: names('protein'),
    v: names('veg'),
    s: names('starch'),
    spice: names('spice'),
    sauce: names('sauce'),
  };

  const chefAdds: ChefAdd[] = CATEGORIES.filter(
    (category) => dish.defaults[category] && usedIn(category).length === 0,
  ).map((category) => ({ category, name: fallback(category) }));

  return {
    dish,
    score,
    used,
    leftOut,
    chefAdds,
    title: fillTemplate(dish.title, { p: firstName('protein'), v: firstName('veg') }),
    steps: dish.steps.map((step) => fillTemplate(step, stepValues)),
  };
}
