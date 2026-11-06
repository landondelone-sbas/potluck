import { buildResult, cook, evaluateDish, tagsFor } from '@potluck/engine';

import { dishes } from '../src';
import { must, potOf } from './helpers';

/**
 * The recipe pilot (M4): the first dishes from the Gemini recipe sheets, and the first plated ones
 * (docs/decisions/0012 and 0013). Each row is a pot someone would really make, and the dish it should
 * lead with. They record outcomes someone has read and agreed with. Look at a changed answer before
 * updating it here.
 */
const LEADS: {
  name: string;
  pot: [Parameters<typeof tagsFor>[0], string][];
  first?: string;
  offered?: string;
}[] = [
  {
    name: 'a pork chop dinner',
    pot: [
      ['protein', 'Pork chops'],
      ['veg', 'Green beans'],
      ['spice', 'Smoked paprika'],
      ['sauce', 'Hot honey'],
      ['starch', 'Baby potatoes'],
    ],
    first: 'porkchops',
  },
  {
    name: 'salmon with potatoes and green beans',
    pot: [
      ['protein', 'Salmon'],
      ['veg', 'Green beans'],
      ['starch', 'Baby potatoes'],
    ],
    first: 'bakedsalmon',
  },
  {
    name: 'tofu with mushrooms, ginger and chili sauce over rice',
    pot: [
      ['protein', 'Tofu'],
      ['veg', 'Mushrooms'],
      ['spice', 'Ginger'],
      ['sauce', 'Sriracha'],
      ['starch', 'Jasmine rice'],
    ],
    offered: 'mapotofu',
  },
  {
    name: 'okra and shrimp with Cajun seasoning and rice',
    pot: [
      ['protein', 'Shrimp'],
      ['veg', 'Okra'],
      ['spice', 'Cajun seasoning'],
      ['starch', 'Jasmine rice'],
    ],
    first: 'shrimpgumbo',
  },
  {
    name: 'shrimp, tomatoes and spaghetti',
    pot: [
      ['protein', 'Shrimp'],
      ['veg', 'Cherry tomatoes'],
      ['starch', 'Spaghetti'],
      ['spice', 'Garlic'],
    ],
    offered: 'shrimplinguini',
  },
  {
    name: 'shrimp tacos',
    pot: [
      ['protein', 'Shrimp'],
      ['veg', 'Avocado'],
      ['starch', 'Corn tortillas'],
      ['spice', 'Chili flakes'],
    ],
    offered: 'shrimptacos',
  },
];

describe('recipe pilot: the pot offers the dish', () => {
  // Some pots are led by an older dish (bibimbap for tofu and rice, the sausage pasta for shrimp
  // and spaghetti). The new dish is still one of the results.
  test.each(LEADS)('$name', ({ pot, first, offered }) => {
    const result = must(cook(potOf(pot), dishes));
    const ids = result.results.map((r) => r.dish.id);
    if (first) expect(ids[0]).toBe(first);
    if (offered) expect(ids).toContain(offered);
  });
});

describe('recipe pilot: a pot can give both a pot dish and a plated dish', () => {
  test('a chicken dinner offers a plated roast alongside a one-pot dish', () => {
    const result = must(
      cook(
        potOf([
          ['protein', 'Chicken thighs'],
          ['veg', 'Carrots'],
          ['starch', 'Baby potatoes'],
          ['spice', 'Smoked paprika'],
          ['sauce', 'Hot honey'],
        ]),
        dishes,
      ),
    );
    const formats = new Set(result.results.map((r) => r.dish.format));
    expect(formats).toEqual(new Set(['pot', 'plate']));
  });

  test('salmon offers the pot dish and the plated one', () => {
    const result = must(
      cook(
        potOf([
          ['protein', 'Salmon'],
          ['veg', 'Asparagus'],
          ['starch', 'Baby potatoes'],
        ]),
        dishes,
      ),
    );
    const ids = result.results.map((r) => r.dish.id);
    expect(ids).toContain('lemonherb');
    expect(ids).toContain('bakedsalmon');
  });
});

describe('recipe pilot: plated steps cook the sides the cook picked', () => {
  const plated = dishes.filter((d) => d.format === 'plate');

  test('there are plated dishes', () => {
    expect(plated.length).toBeGreaterThanOrEqual(4);
  });

  test.each(plated.map((d) => [d.id, d] as const))('%s runs both sides', (_id, dish) => {
    const text = dish.steps.join(' ');
    expect(text).toContain('{veg_how}');
    expect(text).toContain('{starch_how}');
  });

  test('the sides read differently for different picks', () => {
    const dish = must(dishes.find((d) => d.id === 'porkchops'));
    const render = (veg: string, starch: string) =>
      buildResult(
        evaluateDish(
          dish,
          potOf([
            ['protein', 'Pork chops'],
            ['veg', veg],
            ['starch', starch],
          ]),
          dishes.indexOf(dish),
        ),
      ).steps.join(' ');
    expect(render('Spinach', 'Jasmine rice')).toContain('Wilt the spinach');
    expect(render('Spinach', 'Jasmine rice')).toContain('Cook the jasmine rice');
    expect(render('Broccoli', 'Rice noodles')).toContain('roast at 425°F');
    expect(render('Broccoli', 'Rice noodles')).toContain('Boil the rice noodles');
  });
});

describe('recipe pilot: food safety', () => {
  const doneness = (id: string, pot: [Parameters<typeof tagsFor>[0], string][]) => {
    const dish = must(dishes.find((d) => d.id === id));
    return buildResult(evaluateDish(dish, potOf(pot), dishes.indexOf(dish))).steps.join(' ');
  };

  test('pork is cooked to 145°F with a rest', () => {
    const text = doneness('porkchops', [['protein', 'Pork chops']]);
    expect(text).toContain('145°F / 63°C');
    expect(text).toMatch(/rest 3 minutes/i);
  });

  test('chicken is cooked to 165°F', () => {
    expect(doneness('roastchicken', [['protein', 'Chicken thighs']])).toContain('165°F / 74°C');
  });

  test('ground turkey is cooked to 165°F and ground beef to 160°F', () => {
    expect(doneness('turkeytostadas', [['protein', 'Ground turkey']])).toContain('165°F / 74°C');
    expect(doneness('turkeytostadas', [['protein', 'Ground beef']])).toContain('160°F / 71°C');
  });

  test('salmon is cooked to 145°F and shrimp until pink and opaque', () => {
    expect(doneness('bakedsalmon', [['protein', 'Salmon']])).toContain('145°F / 63°C');
    expect(doneness('shrimptacos', [['protein', 'Shrimp']])).toContain('pink and opaque');
  });
});
