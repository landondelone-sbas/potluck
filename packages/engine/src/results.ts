import { CATEGORIES, type Category } from './categories';
import { donenessFor } from './doneness';
import type { DishEvaluation } from './score';
import { howToCook, type SideItem } from './sides';
import { tagsFor } from './tags';
import { fillTemplate, joinAnd, titleCase } from './text';
import type { ChefAdd, DishResult, PotItem } from './types';

/**
 * What the chef supplies, by category, where the pot gives a dish nothing: an item from the user's
 * own pantry that the dish accepts. A category with no pick falls back to the dish's own default.
 */
export type ChefPicks = Partial<Record<Category, PotItem>>;

/**
 * `{?tag:text}` keeps `text` only when something in the dish has that tag, and `{?!tag:text}` only
 * when nothing does. The text may hold simple placeholders such as `{s}`. It lets a step talk about
 * eggs or shrimp only when the dish really has them, and say how to cook the potato the cook picked.
 */
const CONDITIONAL = /\{\?(!?)(\w+):((?:[^{}]|\{\w+\})*)\}/g;

/**
 * Build the card for one evaluated dish (PRD section 9.5).
 * `chefPicks` are pantry items the chef uses where the pot has none the dish uses. Without them
 * the chef falls back to the dish's own defaults.
 */
export function buildResult(evaluation: DishEvaluation, chefPicks: ChefPicks = {}): DishResult {
  const { dish, used, leftOut, score } = evaluation;

  const usedIn = (category: Category) => used.filter((item) => item.category === category);

  const fallbackName = (category: Category): string =>
    chefPicks[category]?.name.toLowerCase() ?? dish.defaults[category];

  // What is cooked in a category: the pot's items, or the chef's pick or default when it has none.
  const cookedIn = (category: Category): readonly SideItem[] => {
    const picked = usedIn(category);
    if (picked.length > 0) return picked;
    const chef = chefPicks[category];
    return [
      chef
        ? { name: chef.name, tags: chef.tags }
        : { name: dish.defaults[category], tags: tagsFor(category, dish.defaults[category]) },
    ];
  };

  const names = (category: Category): string => {
    const picked = usedIn(category).map((item) => item.name.toLowerCase());
    return picked.length > 0 ? joinAnd(picked) : fallbackName(category);
  };

  const firstName = (category: Category): string =>
    titleCase(usedIn(category)[0]?.name ?? fallbackName(category));

  const doneness = donenessFor(cookedIn('protein'));

  const present = new Set(
    CATEGORIES.flatMap((category) => cookedIn(category).flatMap((i) => i.tags)),
  );
  const withConditionals = (step: string): string =>
    step.replace(CONDITIONAL, (_match, negate: string, tag: string, text: string) =>
      present.has(tag) !== (negate === '!') ? text : '',
    );

  const stepValues = {
    veg_how: howToCook('veg', cookedIn('veg')),
    starch_how: howToCook('starch', cookedIn('starch')),
    doneness,
    p: names('protein'),
    v: names('veg'),
    s: names('starch'),
    spice: names('spice'),
    sauce: names('sauce'),
  };

  const chefAdds: ChefAdd[] = CATEGORIES.filter(
    (category) => dish.defaults[category] && usedIn(category).length === 0,
  ).map((category) => ({ category, name: fallbackName(category) }));

  return {
    dish,
    score,
    used,
    leftOut,
    chefAdds,
    title: fillTemplate(dish.title, { p: firstName('protein'), v: firstName('veg') }),
    steps: dish.steps.map((step) => fillTemplate(withConditionals(step), stepValues)),
  };
}
