import { CATEGORIES, type Category } from './categories';
import { donenessFor } from './doneness';
import type { DishEvaluation } from './score';
import { tagsFor } from './tags';
import { fillTemplate, joinAnd, titleCase } from './text';
import type { ChefAdd, DishResult } from './types';

/** Build the card for one evaluated dish (PRD section 9.5). */
export function buildResult(evaluation: DishEvaluation): DishResult {
  const { dish, used, leftOut, score } = evaluation;

  const usedIn = (category: Category) => used.filter((item) => item.category === category);

  const names = (category: Category): string => {
    const picked = usedIn(category).map((item) => item.name.toLowerCase());
    return picked.length > 0 ? joinAnd(picked) : dish.defaults[category];
  };

  const firstName = (category: Category): string =>
    titleCase(usedIn(category)[0]?.name ?? dish.defaults[category]);

  // The proteins that are cooked: the pot's, or the chef's pick when the pot has none.
  const cooked = usedIn('protein');
  const doneness = donenessFor(
    cooked.length > 0
      ? cooked
      : [{ name: dish.defaults.protein, tags: tagsFor('protein', dish.defaults.protein) }],
  );

  const stepValues = {
    doneness,
    p: names('protein'),
    v: names('veg'),
    s: names('starch'),
    spice: names('spice'),
    sauce: names('sauce'),
  };

  const chefAdds: ChefAdd[] = CATEGORIES.filter(
    (category) => dish.defaults[category] && usedIn(category).length === 0,
  ).map((category) => ({ category, name: dish.defaults[category] }));

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
