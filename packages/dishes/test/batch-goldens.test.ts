import { cook } from '@potluck/engine';

import { dishes } from '../src';
import { must, potOf, type PotSpec } from './helpers';

/**
 * What the dishes added after prototype v1 should give for plain pots. Unlike `golden.test.ts`,
 * which holds the prototype's outcomes, these are outcomes someone has read and agreed with.
 * When a later batch of dishes changes one, look at the new answer before updating it here.
 *
 * Batch 1 (M3): Italian and Indian. Each pot is a dish's own chef's pick (its `defaults`),
 * written out so a reader can see the pot, plus two pots built the way a person might.
 */
const BATCH_GOLDEN: { name: string; pot: PotSpec; ids: string[]; titles: string[] }[] = [
  {
    name: 'risotto',
    pot: [
      ['protein', 'Chicken breast'],
      ['veg', 'Mushrooms'],
      ['spice', 'Garlic'],
      ['sauce', 'Parmesan cheese'],
      ['starch', 'Arborio rice'],
    ],
    ids: ['risotto', 'saag', 'tikkamasala'],
    titles: [
      'Chicken Breast & Mushrooms Risotto',
      'Creamy Saag with Chicken Breast',
      'Chicken Breast Tikka Masala',
    ],
  },
  {
    name: 'cacciatore',
    pot: [
      ['protein', 'Chicken thighs'],
      ['veg', 'Bell peppers'],
      ['spice', 'Italian herbs'],
      ['sauce', 'Marinara'],
      ['starch', 'Crusty bread'],
    ],
    ids: ['cacciatore'],
    titles: ['Chicken Thighs & Bell Peppers Cacciatore'],
  },
  {
    name: 'minestrone',
    pot: [
      ['protein', 'White beans'],
      ['veg', 'Carrots'],
      ['spice', 'Italian herbs'],
      ['sauce', 'Vegetable broth'],
      ['starch', 'Small pasta'],
    ],
    ids: ['minestrone', 'chickensoup', 'stew'],
    titles: [
      'White Beans & Carrots Soup',
      'White Beans & Carrots Noodle Soup',
      'Hearty White Beans & Carrots Stew',
    ],
  },
  {
    name: 'panzanella',
    pot: [
      ['protein', 'White beans'],
      ['veg', 'Tomatoes'],
      ['spice', 'Italian herbs'],
      ['sauce', 'Balsamic vinaigrette'],
      ['starch', 'Ciabatta'],
    ],
    ids: ['panzanella', 'greeksalad'],
    titles: ['Panzanella with White Beans', 'Greek Salad with White Beans'],
  },
  {
    name: 'frittata',
    pot: [
      ['protein', 'Eggs'],
      ['veg', 'Spinach'],
      ['spice', 'Italian herbs'],
      ['sauce', 'Parmesan cheese'],
      ['starch', 'Crusty bread'],
    ],
    ids: ['frittata'],
    titles: ['Spinach Frittata'],
  },
  {
    name: 'piccata',
    pot: [
      ['protein', 'Chicken breast'],
      ['veg', 'Asparagus'],
      ['spice', 'Lemon pepper'],
      ['sauce', 'Chicken stock'],
      ['starch', 'Linguine'],
    ],
    ids: ['piccata'],
    titles: ['Chicken Breast Piccata with Asparagus'],
  },
  {
    name: 'tikka masala',
    pot: [
      ['protein', 'Chicken breast'],
      ['veg', 'Onions'],
      ['spice', 'Garam masala'],
      ['sauce', 'Tomato cream sauce'],
      ['starch', 'Basmati rice'],
    ],
    ids: ['tikkamasala', 'pilaf', 'saag'],
    titles: [
      'Chicken Breast Tikka Masala',
      'Spiced Chicken Breast & Onions Pilaf',
      'Creamy Saag with Chicken Breast',
    ],
  },
  {
    name: 'dal',
    pot: [
      ['protein', 'Red lentils'],
      ['veg', 'Spinach'],
      ['spice', 'Cumin'],
      ['sauce', 'Coconut milk'],
      ['starch', 'Basmati rice'],
    ],
    ids: ['dal', 'pilaf', 'saag'],
    titles: [
      'Spiced Red Lentils & Spinach Dal',
      'Spiced Red Lentils & Spinach Pilaf',
      'Creamy Saag with Red Lentils',
    ],
  },
  {
    name: 'saag',
    pot: [
      ['protein', 'Tofu'],
      ['veg', 'Spinach'],
      ['spice', 'Cumin'],
      ['sauce', 'Cream'],
      ['starch', 'Naan'],
    ],
    ids: ['saag', 'tikkamasala'],
    titles: ['Creamy Saag with Tofu', 'Tofu Tikka Masala'],
  },
  {
    name: 'pilaf',
    pot: [
      ['protein', 'Chicken thighs'],
      ['veg', 'Carrots'],
      ['spice', 'Garam masala'],
      ['sauce', 'Crushed tomatoes'],
      ['starch', 'Basmati rice'],
    ],
    ids: ['pilaf', 'curry', 'caribbeancurry'],
    titles: [
      'Spiced Chicken Thighs & Carrots Pilaf',
      'Chicken Thighs & Carrots Curry',
      'Chicken Thighs & Carrots Island Curry',
    ],
  },
  {
    name: 'egg curry',
    pot: [
      ['protein', 'Eggs'],
      ['veg', 'Tomatoes'],
      ['spice', 'Curry powder'],
      ['sauce', 'Crushed tomatoes'],
      ['starch', 'Basmati rice'],
    ],
    ids: ['eggcurry', 'curry'],
    titles: ['Egg Curry with Tomatoes', 'Eggs & Tomatoes Curry'],
  },
  {
    name: 'lentils, spinach and cumin make a dal and nothing else',
    pot: [
      ['protein', 'Lentils'],
      ['veg', 'Spinach'],
      ['spice', 'Cumin'],
    ],
    ids: ['dal'],
    titles: ['Spiced Lentils & Spinach Dal'],
  },
  {
    name: 'sausage, peppers, marinara and spaghetti: pasta or cacciatore',
    pot: [
      ['protein', 'Italian sausage'],
      ['veg', 'Bell peppers'],
      ['sauce', 'Marinara'],
      ['starch', 'Spaghetti'],
    ],
    ids: ['pasta', 'cacciatore'],
    titles: ['Italian Sausage & Bell Peppers Pasta', 'Italian Sausage & Bell Peppers Cacciatore'],
  },
];

describe('batch 1 goldens: Italian and Indian dishes', () => {
  test.each(BATCH_GOLDEN)('$name', ({ pot, ids, titles }) => {
    const result = must(cook(potOf(pot), dishes));
    expect(result.results.map((r) => r.dish.id)).toEqual(ids);
    expect(result.results.map((r) => r.title)).toEqual(titles);
  });
});
