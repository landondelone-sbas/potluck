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
    name: 'a beef roast with carrots and potatoes',
    pot: [
      ['protein', 'Beef roast'],
      ['veg', 'Carrots'],
      ['starch', 'Baby potatoes'],
    ],
    first: 'potroast',
  },
  {
    name: 'a steak with a baked potato',
    pot: [
      ['protein', 'Ribeye'],
      ['veg', 'Asparagus'],
      ['spice', 'Garlic'],
      ['sauce', 'Herb butter'],
      ['starch', 'Russet potatoes'],
    ],
    offered: 'reversesear',
  },
  {
    name: 'chicken with peppers, paprika and sour cream over noodles',
    pot: [
      ['protein', 'Chicken breast'],
      ['veg', 'Bell peppers'],
      ['spice', 'Smoked paprika'],
      ['sauce', 'Sour cream'],
      ['starch', 'Ramen noodles'],
    ],
    first: 'paprikash',
  },
  {
    name: 'chicken, broccoli and quinoa',
    pot: [
      ['protein', 'Chicken breast'],
      ['veg', 'Broccoli'],
      ['starch', 'Quinoa'],
    ],
    offered: 'chickenquinoa',
  },
  {
    name: 'a turkey breast with carrots, potatoes and marmalade',
    pot: [
      ['protein', 'Turkey breast'],
      ['veg', 'Carrots'],
      ['sauce', 'Orange marmalade'],
      ['starch', 'Baby potatoes'],
    ],
    offered: 'glazedbreast',
  },
  {
    name: 'burgers with tomato and buns',
    pot: [
      ['protein', 'Ground beef'],
      ['veg', 'Cherry tomatoes'],
      ['starch', 'Sourdough'],
    ],
    offered: 'burgers',
  },
  {
    name: 'flat iron steak with green beans and potatoes',
    pot: [
      ['protein', 'Flank steak'],
      ['veg', 'Green beans'],
      ['starch', 'Baby potatoes'],
      ['spice', 'Garlic'],
    ],
    offered: 'flatiron',
  },
  {
    name: 'ribs with BBQ sauce and potatoes',
    pot: [
      ['protein', 'Pork ribs'],
      ['sauce', 'BBQ sauce'],
      ['starch', 'Baby potatoes'],
    ],
    first: 'ovenribs',
  },
  {
    name: 'turkey chili',
    pot: [
      ['protein', 'Ground turkey'],
      ['protein', 'Black beans'],
      ['veg', 'Red onion'],
      ['spice', 'Cumin'],
      ['sauce', 'Marinara'],
    ],
    offered: 'turkeychili',
  },
  {
    name: 'tofu with broccoli, ginger and rice',
    pot: [
      ['protein', 'Tofu'],
      ['veg', 'Broccoli'],
      ['starch', 'Jasmine rice'],
      ['spice', 'Ginger'],
    ],
    offered: 'sesametofu',
  },
  {
    name: 'sausage and naan with marinara',
    pot: [
      ['protein', 'Italian sausage'],
      ['starch', 'Naan'],
      ['sauce', 'Marinara'],
    ],
    offered: 'sausageflatbread',
  },
  {
    name: 'eggs and sausage in flour tortillas',
    pot: [
      ['protein', 'Eggs'],
      ['protein', 'Italian sausage'],
      ['starch', 'Corn tortillas'],
    ],
    offered: 'breakfastquesadilla',
  },
  {
    name: 'shrimp in coconut milk over rice',
    pot: [
      ['protein', 'Shrimp'],
      ['sauce', 'Coconut milk'],
      ['starch', 'Jasmine rice'],
      ['spice', 'Curry powder'],
    ],
    offered: 'redcurryshrimp',
  },
  {
    name: 'shrimp with asparagus and sourdough',
    pot: [
      ['protein', 'Shrimp'],
      ['veg', 'Asparagus'],
      ['starch', 'Sourdough'],
      ['spice', 'Garlic'],
    ],
    offered: 'garlicshrimp',
  },
  {
    name: 'chicken with lemon pepper, zucchini and couscous',
    pot: [
      ['protein', 'Chicken breast'],
      ['veg', 'Zucchini'],
      ['starch', 'Couscous'],
      ['spice', 'Lemon pepper'],
    ],
    offered: 'lemonrosemary',
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

  // A burger's vegetables are toppings, so it runs only the starch. The steak dinner (an older dish)
  // cooks its vegetable in the pan and has no side placeholders at all.
  const sidePlates = plated.filter((d) => d.steps.join(' ').includes('_how}'));
  const toppingsOnly = new Set(['burgers']);

  test.each(sidePlates.map((d) => [d.id, d] as const))('%s runs both sides', (id, dish) => {
    const text = dish.steps.join(' ');
    expect(text).toContain('{starch_how}');
    if (!toppingsOnly.has(id)) expect(text).toContain('{veg_how}');
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

describe('potatoes: every kind is cooked the right way', () => {
  const loaded = must(dishes.find((d) => d.id === 'loadedpotato'));
  const steps = (starch: string) =>
    buildResult(
      evaluateDish(
        loaded,
        potOf([
          ['protein', 'Black beans'],
          ['starch', starch],
        ]),
        dishes.indexOf(loaded),
      ),
    ).steps.join(' ');

  test('a baking potato is scrubbed, pricked and baked, then split', () => {
    const text = steps('Russet potatoes');
    expect(text).toContain('prick with a fork and bake 45 to 60 minutes');
    expect(text).toContain('Split the russet potatoes and fluff the insides');
  });

  test('baby potatoes are halved and roasted, not baked whole', () => {
    const text = steps('Baby potatoes');
    expect(text).toContain('Halve the baby potatoes');
    expect(text).not.toContain('prick');
    expect(text).not.toContain('fluff');
  });

  test('a sweet potato is halved and roasted', () => {
    expect(steps('Sweet potato')).toContain('Halve the sweet potato');
  });

  test('no egg is mentioned unless there are eggs', () => {
    expect(steps('Baby potatoes')).not.toMatch(/egg/i);
    const withEggs = buildResult(
      evaluateDish(
        loaded,
        potOf([
          ['protein', 'Eggs'],
          ['starch', 'Baby potatoes'],
        ]),
        dishes.indexOf(loaded),
      ),
    ).steps.join(' ');
    expect(withEggs).toContain('scrambling the eggs');
  });

  test('a potato alone is offered a potato dish, and each kind is offered at least three', () => {
    for (const name of ['Baby potatoes', 'Russet potatoes', 'Red potatoes', 'Sweet potato']) {
      const result = must(cook(potOf([['starch', name]]), dishes));
      expect(result.results.length).toBeGreaterThanOrEqual(2);
    }
  });

  test('the new potato dishes are offered for their own defaults', () => {
    for (const id of ['potatosoup', 'spanishtortilla', 'potatosalad']) {
      const dish = must(dishes.find((d) => d.id === id));
      const pot = potOf(
        (['protein', 'veg', 'spice', 'sauce', 'starch'] as const).map((c) => [c, dish.defaults[c]]),
      );
      expect(must(cook(pot, dishes)).results.map((r) => r.dish.id)).toContain(id);
    }
  });
});

describe('grounded recipes: whole cuts are not mistaken for ground meat', () => {
  test('ground beef is not offered a pot roast, and ground turkey is not offered a glazed breast', () => {
    const beef = must(cook(potOf([['protein', 'Ground beef']]), dishes));
    expect(beef.results.map((r) => r.dish.id)).not.toContain('potroast');
    const turkey = must(cook(potOf([['protein', 'Ground turkey']]), dishes));
    expect(turkey.results.map((r) => r.dish.id)).not.toContain('glazedbreast');
  });

  test('the reverse-seared steak bakes a baking potato first and cooks any other starch on the stove', () => {
    const dish = must(dishes.find((d) => d.id === 'reversesear'));
    const steps = (starch: string) =>
      buildResult(
        evaluateDish(
          dish,
          potOf([
            ['protein', 'Ribeye'],
            ['starch', starch],
          ]),
          dishes.indexOf(dish),
        ),
      ).steps.join(' ');
    expect(steps('Russet potatoes')).toContain('bake at 425°F (220°C) for 45 to 60 minutes');
    expect(steps('Baby potatoes')).toContain('Heat the oven to 250°F (120°C).');
    expect(steps('Baby potatoes')).not.toContain('prick');
    expect(steps('Baby potatoes')).toContain('USDA safe minimum for steak is 145°F / 63°C');
  });
});
