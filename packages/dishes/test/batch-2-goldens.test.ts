import { cook } from '@potluck/engine';

import { dishes } from '../src';
import { must, potOf } from './helpers';

/**
 * Batch 2 (M3): Mexican, Mediterranean and Cajun. As in `batch-goldens.test.ts`, each pot is a
 * dish's own chef's pick (its `defaults`), written out so a reader can see it. These are outcomes
 * someone has read and agreed with. Look at a changed answer before updating it here.
 */
type Row = [protein: string, veg: string, spice: string, sauce: string, starch: string];

const BATCH_2: { dish: string; pot: Row; ids: string[]; titles: string[] }[] = [
  {
    dish: 'quesadilla',
    pot: ['Chicken breast', 'Bell peppers', 'Cumin', 'Shredded cheese', 'Flour tortillas'],
    ids: ['quesadilla', 'fajita', 'enchilada'],
    titles: [
      'Chicken Breast Quesadilla',
      'Chicken Breast Fajita Skillet',
      'Chicken Breast Enchilada Bake',
    ],
  },
  {
    dish: 'chilaquiles',
    pot: ['Eggs', 'Red onion', 'Chili powder', 'Salsa', 'Corn tortillas'],
    ids: ['chilaquiles', 'tacos', 'scramble'],
    titles: ['Chilaquiles with Eggs', 'Eggs Tacos', 'Red Onion & Egg Scramble'],
  },
  {
    dish: 'fajita',
    pot: ['Chicken breast', 'Bell peppers', 'Chili powder', 'Salsa', 'Flour tortillas'],
    ids: ['fajita', 'tacos', 'quesadilla'],
    titles: ['Chicken Breast Fajita Skillet', 'Chicken Breast Tacos', 'Chicken Breast Quesadilla'],
  },
  {
    dish: 'enchilada',
    pot: ['Chicken breast', 'Corn', 'Cumin', 'Enchilada sauce and cheese', 'Corn tortillas'],
    ids: ['quesadilla', 'enchilada', 'tacos'],
    titles: ['Chicken Breast Quesadilla', 'Chicken Breast Enchilada Bake', 'Chicken Breast Tacos'],
  },
  {
    dish: 'tortillasoup',
    pot: ['Chicken breast', 'Corn', 'Chili powder', 'Chicken broth', 'Corn tortillas'],
    ids: ['tortillasoup'],
    titles: ['Chicken Breast Tortilla Soup'],
  },
  {
    dish: 'shakshuka',
    pot: ['Eggs', 'Bell peppers', 'Cumin', 'Crushed tomatoes', 'Pita'],
    ids: ['shakshuka'],
    titles: ['Bell Peppers Shakshuka'],
  },
  {
    dish: 'gyro',
    pot: ['Chicken breast', 'Cucumber', 'Oregano', 'Tzatziki', 'Pita'],
    ids: ['gyro', 'greeksalad', 'medbowl'],
    titles: [
      'Chicken Breast Pita Wrap',
      'Greek Salad with Chicken Breast',
      'Chicken Breast Grain Bowl',
    ],
  },
  {
    dish: 'stuffedpeppers',
    pot: ['Ground turkey', 'Bell peppers', 'Italian herbs', 'Tomato sauce', 'Brown rice'],
    ids: ['stuffedpeppers', 'cacciatore'],
    titles: ['Stuffed Peppers with Ground Turkey', 'Ground Turkey & Bell Peppers Cacciatore'],
  },
  {
    dish: 'tagine',
    pot: ['Chicken thighs', 'Carrots', 'Cinnamon', 'Chicken broth', 'Couscous'],
    ids: ['tagine'],
    titles: ['Chicken Thighs & Carrots Tagine'],
  },
  {
    dish: 'greeksalad',
    pot: ['Chickpeas', 'Cucumber', 'Oregano', 'Olive oil and lemon', 'Pita'],
    ids: ['greeksalad', 'panzanella'],
    titles: ['Greek Salad with Chickpeas', 'Panzanella with Chickpeas'],
  },
  {
    dish: 'jambalaya',
    pot: [
      'Andouille sausage',
      'Bell peppers',
      'Cajun seasoning',
      'Tomato sauce',
      'Long-grain rice',
    ],
    ids: ['jambalaya', 'cajun'],
    titles: [
      'Andouille Sausage & Bell Peppers Jambalaya',
      'Andouille Sausage & Bell Peppers Cajun Skillet',
    ],
  },
  {
    dish: 'redbeans',
    pot: ['Red beans', 'Celery', 'Cajun seasoning', 'Hot sauce', 'Long-grain rice'],
    ids: ['redbeans'],
    titles: ['Cajun Red Beans & Celery with Rice'],
  },
  {
    dish: 'blackened',
    pot: ['Tilapia', 'Corn', 'Cajun seasoning', 'Hot sauce', 'Long-grain rice'],
    ids: ['blackened', 'cajun'],
    titles: ['Blackened Tilapia with Corn', 'Tilapia & Corn Cajun Skillet'],
  },
];

describe('batch 2 goldens: Mexican, Mediterranean and Cajun dishes', () => {
  test.each(BATCH_2)('$dish', ({ pot, ids, titles }) => {
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
