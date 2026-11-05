import { cook } from '@potluck/engine';

import { dishes } from '../src';
import { must, potOf, type PotSpec } from './helpers';

/**
 * Acceptance tests for the engine: PRD section 9.7. These are the outcomes prototype v1
 * produced, and the ported engine must reproduce them exactly.
 */
const GOLDEN: {
  name: string;
  pot: PotSpec;
  ids: string[];
  titles: string[];
}[] = [
  {
    name: 'default pot',
    pot: [
      ['protein', 'Chicken thighs'],
      ['veg', 'Broccoli'],
      ['starch', 'Jasmine rice'],
      ['spice', 'Ginger'],
      ['sauce', 'Soy sauce'],
    ],
    ids: ['stirfry', 'friedrice', 'glazebowl'],
    titles: [
      'Chicken Thighs & Broccoli Stir-Fry',
      'Chicken Thighs Fried Rice',
      'Glazed Chicken Thighs & Broccoli Bowl',
    ],
  },
  {
    name: 'Cozy night',
    pot: [
      ['protein', 'Chicken thighs'],
      ['veg', 'Carrots'],
      ['starch', 'Baby potatoes'],
      ['spice', 'Italian herbs'],
    ],
    ids: ['sheetpan', 'stew', 'hash'],
    titles: [
      'Sheet-Pan Chicken Thighs & Carrots',
      'Hearty Chicken Thighs & Carrots Stew',
      'Chicken Thighs & Carrots Skillet Hash',
    ],
  },
  {
    name: 'Fresh and light',
    pot: [
      ['protein', 'Salmon'],
      ['veg', 'Zucchini'],
      ['starch', 'Quinoa'],
      ['spice', 'Lemon pepper'],
      ['sauce', 'Pesto'],
    ],
    ids: ['lemonherb'],
    titles: ['Lemon-Herb Salmon with Zucchini'],
  },
  {
    name: 'Spicy kick',
    pot: [
      ['protein', 'Ground beef'],
      ['veg', 'Bell peppers'],
      ['starch', 'Jasmine rice'],
      ['spice', 'Cumin'],
      ['sauce', 'Salsa verde'],
    ],
    ids: ['burritobowl'],
    titles: ['Ground Beef Burrito Bowl'],
  },
  {
    name: 'Ten-minute meal',
    pot: [
      ['protein', 'Eggs'],
      ['veg', 'Spinach'],
      ['starch', 'Sourdough'],
      ['spice', 'Chili flakes'],
    ],
    ids: ['scramble'],
    titles: ['Spinach & Egg Scramble'],
  },
];

describe('golden tests (PRD section 9.7)', () => {
  test.each(GOLDEN)('$name', ({ pot, ids, titles }) => {
    const result = must(cook(potOf(pot), dishes));
    expect(result.results.map((r) => r.dish.id)).toEqual(ids);
    expect(result.results.map((r) => r.title)).toEqual(titles);
    expect(result.mode).toBe(ids.length === 1 ? 'single' : 'multi');
  });

  test('Cozy night: each result uses 4 of 4', () => {
    const pot = must(GOLDEN[1]).pot;
    const result = must(cook(potOf(pot), dishes));
    expect(result.potSize).toBe(4);
    for (const card of result.results) expect(card.used).toHaveLength(4);
  });
});
