import { cook } from '@potluck/engine';

import { dishes } from '../src';
import { must, potOf } from './helpers';

/**
 * Batch 3 (M3): Comfort and Asian. As in the earlier batches, each pot is a dish's own chef's
 * pick (its `defaults`), written out so a reader can see it. These are outcomes someone has read
 * and agreed with. Look at a changed answer before updating it here.
 */
type Row = [protein: string, veg: string, spice: string, sauce: string, starch: string];

const BATCH_3: { dish: string; pot: Row; ids: string[]; titles: string[] }[] = [
  {
    dish: 'chili',
    pot: ['Ground beef', 'Onions', 'Chili powder', 'Crushed tomatoes', 'Cornbread'],
    ids: ['chili', 'tagine', 'caribbeancurry'],
    titles: [
      'Ground Beef Chili',
      'Ground Beef & Onions Tagine',
      'Ground Beef & Onions Island Curry',
    ],
  },
  {
    dish: 'chickensoup',
    pot: ['Chicken thighs', 'Carrots', 'Italian herbs', 'Chicken broth', 'Egg noodles'],
    ids: ['chickensoup'],
    titles: ['Chicken Thighs & Carrots Noodle Soup'],
  },
  {
    dish: 'cottagepie',
    pot: ['Ground beef', 'Carrots', 'Thyme', 'Gravy', 'Baby potatoes'],
    ids: ['cottagepie', 'stew', 'minestrone'],
    titles: [
      'Ground Beef & Carrots Potato Pie',
      'Hearty Ground Beef & Carrots Stew',
      'Ground Beef & Carrots Soup',
    ],
  },
  {
    dish: 'loadedpotato',
    pot: ['Black beans', 'Broccoli', 'Black pepper', 'Cheese', 'Baked potatoes'],
    ids: ['loadedpotato', 'hash'],
    titles: ['Loaded Potato with Black Beans & Broccoli', 'Black Beans & Broccoli Skillet Hash'],
  },
  {
    dish: 'kungpao',
    pot: ['Chicken breast', 'Bell peppers', 'Chili flakes', 'Peanut sauce', 'Jasmine rice'],
    ids: ['kungpao'],
    titles: ['Kung Pao Chicken Breast'],
  },
  {
    dish: 'brothnoodles',
    pot: ['Chicken breast', 'Bok choy', 'Ginger', 'Chicken broth', 'Ramen noodles'],
    ids: ['brothnoodles'],
    titles: ['Chicken Breast & Bok Choy Broth Noodles'],
  },
  {
    dish: 'eggfooyoung',
    pot: ['Eggs', 'Cabbage', 'Ginger', 'Soy sauce', 'Jasmine rice'],
    ids: ['eggfooyoung', 'stirfry', 'bibimbap'],
    titles: ['Egg Foo Young with Cabbage', 'Eggs & Cabbage Stir-Fry', 'Bibimbap with Eggs'],
  },
  {
    dish: 'lettucewraps',
    pot: ['Ground chicken', 'Carrots', 'Ginger', 'Hoisin sauce', 'Jasmine rice'],
    ids: ['glazebowl', 'friedrice', 'lettucewraps'],
    titles: [
      'Glazed Ground Chicken & Carrots Bowl',
      'Ground Chicken Fried Rice',
      'Ground Chicken Lettuce Wraps',
    ],
  },
];

describe('batch 3 goldens: Comfort and Asian dishes', () => {
  test.each(BATCH_3)('$dish', ({ pot, ids, titles }) => {
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
