import { buildResult, cook, evaluateDish, type Category } from '@potluck/engine';

import { dishes } from '../src';
import { must, potOf } from './helpers';

/**
 * Thai, Korean and Caribbean (M3), the dishes that needed new cuisines in the engine
 * (docs/decisions/0010). As in the earlier batches, each pot is a dish's own chef's pick, written
 * out so a reader can see it. These are outcomes someone has read and agreed with. Look at a
 * changed answer before updating it here.
 */
type Row = [protein: string, veg: string, spice: string, sauce: string, starch: string];

const BATCH_4: { dish: string; pot: Row; ids: string[]; titles: string[] }[] = [
  {
    dish: 'thaicurry',
    pot: ['Chicken breast', 'Bell peppers', 'Green curry paste', 'Coconut milk', 'Jasmine rice'],
    ids: ['curry', 'caribbeancurry', 'thaicurry'],
    titles: [
      'Chicken Breast & Bell Peppers Curry',
      'Chicken Breast & Bell Peppers Island Curry',
      'Chicken Breast & Bell Peppers Coconut Curry',
    ],
  },
  {
    dish: 'padthai',
    pot: ['Chicken breast', 'Carrots', 'Lime', 'Peanut sauce', 'Rice noodles'],
    ids: ['padthai', 'noodles'],
    titles: ['Pad Thai with Chicken Breast', 'Chicken Breast & Carrots Noodle Bowl'],
  },
  {
    dish: 'basilstirfry',
    pot: ['Ground pork', 'Bell peppers', 'Thai basil', 'Soy sauce', 'Jasmine rice'],
    ids: ['basilstirfry'],
    titles: ['Spicy Basil Ground Pork'],
  },
  {
    dish: 'bibimbap',
    pot: ['Eggs', 'Carrots', 'Garlic', 'Gochujang', 'Short-grain rice'],
    ids: ['friedrice', 'bibimbap', 'eggfooyoung'],
    titles: ['Eggs Fried Rice', 'Bibimbap with Eggs', 'Egg Foo Young with Carrots'],
  },
  {
    dish: 'bulgogi',
    pot: ['Sliced beef', 'Onions', 'Garlic', 'Soy sauce', 'Short-grain rice'],
    ids: ['bulgogi', 'stirfry', 'basilstirfry'],
    titles: [
      'Sliced Beef Bulgogi Bowl',
      'Sliced Beef & Onions Stir-Fry',
      'Spicy Basil Sliced Beef',
    ],
  },
  {
    dish: 'spicynoodles',
    pot: ['Chicken breast', 'Kimchi', 'Garlic', 'Gochujang', 'Udon noodles'],
    ids: ['spicynoodles', 'brothnoodles', 'padthai'],
    titles: [
      'Spicy Chicken Breast & Kimchi Noodles',
      'Chicken Breast & Kimchi Broth Noodles',
      'Pad Thai with Chicken Breast',
    ],
  },
  {
    dish: 'jerk',
    pot: ['Chicken thighs', 'Bell peppers', 'Jerk seasoning', 'Hot sauce', 'Coconut rice'],
    ids: ['jerk'],
    titles: ['Jerk Chicken Thighs with Bell Peppers'],
  },
  {
    dish: 'riceandbeans',
    pot: ['Red beans', 'Bell peppers', 'Thyme', 'Coconut milk', 'Long-grain rice'],
    ids: ['riceandbeans', 'caribbeancurry'],
    titles: ['Coconut Rice & Beans with Bell Peppers', 'Red Beans & Bell Peppers Island Curry'],
  },
  {
    dish: 'caribbeancurry',
    pot: ['Chicken thighs', 'Carrots', 'Curry powder', 'Coconut milk', 'Long-grain rice'],
    ids: ['curry', 'caribbeancurry', 'thaicurry'],
    titles: [
      'Chicken Thighs & Carrots Curry',
      'Chicken Thighs & Carrots Island Curry',
      'Chicken Thighs & Carrots Coconut Curry',
    ],
  },
];

describe('batch 4 goldens: Thai, Korean and Caribbean dishes', () => {
  test.each(BATCH_4)('$dish', ({ pot, ids, titles }) => {
    const [protein, veg, spice, sauce, starch] = pot;
    const result = must(
      cook(
        potOf([
          ['protein', protein],
          ['veg', veg],
          ['spice', spice],
          ['sauce', sauce],
          ['starch', starch],
        ]),
        dishes,
      ),
    );
    expect(result.results.map((r) => r.dish.id)).toEqual(ids);
    expect(result.results.map((r) => r.title)).toEqual(titles);
  });
});

/**
 * The dishes' own lists decide most of what they use. `VIBE` decides the rest: a spice or sauce
 * that is not on a dish's list is used if it suits the dish's cuisine, and left out if not. These
 * pin the rows added for the new cuisines, which the goldens above do not reach.
 */
type Case = [id: string, category: Category, name: string, why: string];

describe('which spices and sauces suit the new cuisines (VIBE)', () => {
  // Score the dish directly: with one spice or sauce and a chicken breast, it may not be among the
  // top three, and what is under test is how the item is treated, not whether the dish wins.
  const cardOf = (id: string, extra: [Category, string][]) => {
    const dish = must(dishes.find((d) => d.id === id));
    const pot = potOf([['protein', 'Chicken breast'], ...extra]);
    return buildResult(evaluateDish(dish, pot, 0));
  };
  const used = (id: string, extra: [Category, string][]) =>
    cardOf(id, extra).used.map((i) => i.name);
  const leftOut = (id: string, extra: [Category, string][]) =>
    cardOf(id, extra).leftOut.map((i) => i.name);

  test.each<Case>([
    ['bibimbap', 'sauce', 'Teriyaki', 'Korean takes a glaze'],
    ['bibimbap', 'sauce', 'BBQ sauce', 'Korean takes a barbecue sauce'],
    ['padthai', 'sauce', 'Coconut milk', 'Thai takes coconut'],
    ['padthai', 'sauce', 'Fish sauce', 'Thai takes fish sauce, which is soy'],
    ['jerk', 'spice', 'Cumin', 'Caribbean takes cumin'],
    ['jerk', 'spice', 'Smoked paprika', 'Caribbean takes smoky spices'],
    ['jerk', 'spice', 'Allspice', 'Caribbean takes allspice, which is jerk'],
  ])('%s uses %s "%s": %s', (id, category, name) => {
    expect(used(id, [[category, name]])).toContain(name);
  });

  test.each<Case>([
    ['bibimbap', 'sauce', 'Alfredo', 'Korean has no cream'],
    ['bibimbap', 'sauce', 'Ranch', 'Korean has no ranch'],
    ['padthai', 'sauce', 'Salsa', 'Thai has no salsa'],
    ['jerk', 'spice', 'Cajun seasoning', 'Caribbean does not take Cajun spice'],
    ['jerk', 'sauce', 'Alfredo', 'Caribbean has no cream'],
  ])('%s leaves out %s "%s": %s', (id, category, name) => {
    expect(leftOut(id, [[category, name]])).toContain(name);
  });
});
