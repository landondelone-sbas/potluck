import { cook, type Category } from '@potluck/engine';

import { dishes } from '../src';
import { must, potOf } from './helpers';

/**
 * Whole-cut steak (docs/decisions/0007). A pot with a steak cut (steak, ribeye, NY strip) is offered
 * the dishes that cook it to a doneness, and a pot with steak and the makings of tacos, noodles
 * or pasta is offered those dishes, because steak is also beef. Ground beef is never offered a
 * steak-cut dish.
 */
type Spec = [Category, string][];

const STEAK: { name: string; pot: Spec; ids: string[]; titles: string[] }[] = [
  {
    name: 'ribeye alone: every steak-cut dish',
    pot: [['protein', 'Ribeye']],
    ids: ['steakdinner', 'steakpotato', 'steaksalad'],
    titles: ['Seared Ribeye with Asparagus', 'Ribeye & Potato Skillet', 'Steak Salad with Arugula'],
  },
  {
    name: 'ribeye dinner from its own chef pick',
    pot: [
      ['protein', 'Ribeye'],
      ['veg', 'Asparagus'],
      ['spice', 'Black pepper'],
      ['sauce', 'Mustard'],
      ['starch', 'Baby potatoes'],
    ],
    ids: ['steakdinner'],
    titles: ['Seared Ribeye with Asparagus'],
  },
  {
    name: 'steak and potatoes',
    pot: [
      ['protein', 'Steak'],
      ['starch', 'Baby potatoes'],
    ],
    ids: ['steakpotato'],
    titles: ['Steak & Potato Skillet'],
  },
  {
    name: 'NY strip, arugula and vinaigrette: the salad',
    pot: [
      ['protein', 'NY strip'],
      ['veg', 'Arugula'],
      ['sauce', 'Balsamic vinaigrette'],
    ],
    ids: ['steaksalad'],
    titles: ['Steak Salad with Arugula'],
  },
  {
    name: 'steak with tortillas and salsa: tacos, not a seared steak',
    pot: [
      ['protein', 'Steak'],
      ['starch', 'Corn tortillas'],
      ['sauce', 'Salsa'],
    ],
    ids: ['tacos', 'quesadilla', 'fajita'],
    titles: ['Steak Tacos', 'Steak Quesadilla', 'Steak Fajita Skillet'],
  },
  {
    name: 'steak with noodles and soy: stir-fry and bowls',
    pot: [
      ['protein', 'Steak'],
      ['veg', 'Broccoli'],
      ['starch', 'Rice noodles'],
      ['sauce', 'Soy sauce'],
    ],
    ids: ['glazebowl', 'noodles', 'stirfry'],
    titles: [
      'Glazed Steak & Broccoli Bowl',
      'Steak & Broccoli Noodle Bowl',
      'Steak & Broccoli Stir-Fry',
    ],
  },
  {
    name: 'steak with pasta and marinara: pasta',
    pot: [
      ['protein', 'Steak'],
      ['starch', 'Penne'],
      ['sauce', 'Marinara'],
    ],
    ids: ['pasta'],
    titles: ['Steak & Spinach Pasta'],
  },
  {
    name: 'ground beef with potatoes and gravy: no steak dish',
    pot: [
      ['protein', 'Ground beef'],
      ['starch', 'Baby potatoes'],
      ['sauce', 'Gravy'],
    ],
    ids: ['cottagepie'],
    titles: ['Ground Beef & Carrots Potato Pie'],
  },
];

describe('steak goldens: whole cuts and beef in other dishes', () => {
  test.each(STEAK)('$name', ({ pot, ids, titles }) => {
    const result = must(cook(potOf(pot), dishes));
    expect(result.results.map((r) => r.dish.id)).toEqual(ids);
    expect(result.results.map((r) => r.title)).toEqual(titles);
  });
});

describe('ground meat (docs/decisions/0008)', () => {
  const ids = (pot: Spec) => must(cook(potOf(pot), dishes)).results.map((r) => r.dish.id);

  test('steak is not offered the dishes that take only ground meat', () => {
    const potato: Spec = [
      ['veg', 'Carrots'],
      ['spice', 'Thyme'],
      ['sauce', 'Gravy'],
      ['starch', 'Baby potatoes'],
    ];
    expect(ids([['protein', 'Ground beef'], ...potato])).toContain('cottagepie');
    expect(ids([['protein', 'Steak'], ...potato])).not.toContain('cottagepie');
    expect(ids([['protein', 'Ribeye'], ...potato])).not.toContain('cottagepie');
  });

  test('ground turkey, lamb and beef all fill a stuffed pepper', () => {
    for (const name of ['Ground turkey', 'Ground lamb', 'Ground beef']) {
      const pot: Spec = [
        ['protein', name],
        ['veg', 'Bell peppers'],
        ['sauce', 'Tomato sauce'],
        ['starch', 'Brown rice'],
      ];
      expect(ids(pot)).toContain('stuffedpeppers');
    }
    const steak: Spec = [
      ['protein', 'Steak'],
      ['veg', 'Bell peppers'],
      ['sauce', 'Tomato sauce'],
      ['starch', 'Brown rice'],
    ];
    // The peppers, sauce and rice still make a stuffed pepper, but the steak is left out of it.
    const card = must(cook(potOf(steak), dishes)).results.find(
      (r) => r.dish.id === 'stuffedpeppers',
    );
    expect(card?.used.map((i) => i.name)).not.toContain('Steak');
    expect(card?.leftOut.map((i) => i.name)).toContain('Steak');
  });
});
