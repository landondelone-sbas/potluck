import { FREESTYLE_ID, cook, freestyle } from '../src';
import { item, makeDish, must } from './helpers';

const fridge = [
  item('protein', 'Shrimp'),
  item('veg', 'Spinach'),
  item('veg', 'Asparagus'),
  item('starch', 'Jasmine rice'),
];

describe('freestyle: a dinner made from exactly what is in the pot', () => {
  test('a pot no dish fits still gets a full plan that uses every item', () => {
    const card = must(freestyle(fridge));
    expect(card.freestyle).toBe(true);
    expect(card.dish.id).toBe(FREESTYLE_ID);
    expect(card.title).toBe('Shrimp with Spinach and Asparagus over Jasmine Rice');
    expect(card.used).toHaveLength(4);
    expect(card.leftOut).toEqual([]);
    expect(card.chefAdds).toEqual([]);
  });

  test('every item is named in the steps', () => {
    const text = must(freestyle(fridge)).steps.join(' ').toLowerCase();
    for (const word of ['shrimp', 'spinach', 'asparagus', 'jasmine rice'])
      expect(text).toContain(word);
  });

  test('shrimp are cooked until pink and opaque, and the rice is cooked on its own', () => {
    const steps = must(freestyle(fridge)).steps;
    expect(steps.some((s) => s.includes('pink and opaque'))).toBe(true);
    expect(steps[0]).toContain('Cook the jasmine rice');
  });

  test('quick vegetables are sautéed first, then the shrimp, and the greens go in last', () => {
    const steps = must(freestyle(fridge)).steps;
    const quick = steps.findIndex((s) => s.includes('Sauté the asparagus'));
    const shrimp = steps.findIndex(
      (s) => s.includes('Push the vegetables to one side') && s.includes('shrimp'),
    );
    const greens = steps.findIndex((s) => s.includes('spinach at the end'));
    expect(quick).toBeGreaterThan(-1);
    expect(shrimp).toBeGreaterThan(quick);
    expect(greens).toBeGreaterThan(shrimp);
  });

  test('each protein is cooked its own way, with its own safe temperature', () => {
    const card = must(
      freestyle([item('protein', 'Chicken thighs'), item('protein', 'Italian sausage')]),
    );
    const text = card.steps.join(' ');
    expect(text).toContain('chicken thighs');
    expect(text).toContain('165°F / 74°C');
    expect(text).toContain('Slice the italian sausage');
  });

  test('a steak carries the USDA minimum and the lower-doneness warning', () => {
    const text = must(freestyle([item('protein', 'Ribeye'), item('veg', 'Asparagus')])).steps.join(
      ' ',
    );
    expect(text).toContain('145°F / 63°C');
    expect(text).toMatch(/lower doneness is your choice/);
    expect(text).toMatch(/Rest 5 minutes/);
  });

  test('ground meat is cooked to 160°F, and a roast takes its vegetables in the pot', () => {
    expect(must(freestyle([item('protein', 'Ground beef')])).steps.join(' ')).toContain(
      '160°F / 71°C',
    );
    const roast = must(
      freestyle([
        item('protein', 'Beef roast'),
        item('veg', 'Carrots'),
        item('starch', 'Baby potatoes'),
      ]),
    );
    expect(roast.steps.join(' ')).toContain('325°F (160°C) oven about 2 hours');
    expect(roast.steps.join(' ')).toContain('Add the carrots to the pot');
    expect(roast.dish.minutes).toBe(150);
  });

  test('eggs are scrambled until set and tofu is pan-fried', () => {
    expect(must(freestyle([item('protein', 'Eggs')])).steps.join(' ')).toContain('scramble');
    expect(must(freestyle([item('protein', 'Tofu')])).steps.join(' ')).toContain('pan-fry');
  });

  test('an ingredient the engine does not know is still cooked and named', () => {
    const card = must(freestyle([item('protein', 'Venison'), item('veg', 'Romanesco')]));
    const text = card.steps.join(' ');
    expect(text).toContain('venison');
    expect(text).toContain('piping hot');
    expect(text).toContain('romanesco');
  });

  test('a pot with no protein still makes a plate and suggests adding one', () => {
    const card = must(freestyle([item('veg', 'Broccoli'), item('starch', 'Jasmine rice')]));
    expect(card.title).toBe('Broccoli over Jasmine Rice');
    expect(card.dish.tip).toContain('Add an egg, beans or tofu');
  });

  test('a protein alone is enough', () => {
    expect(must(freestyle([item('protein', 'Salmon')])).title).toBe('Salmon');
  });

  test('only a spice or a sauce gives no card', () => {
    expect(freestyle([item('spice', 'Garlic'), item('sauce', 'Soy sauce')])).toBeNull();
  });

  test('a spice and a sauce are used when they are there, and have fallbacks when not', () => {
    const withBoth = must(
      freestyle([...fridge, item('spice', 'Garlic'), item('sauce', 'Pesto')]),
    ).steps.join(' ');
    expect(withBoth).toContain('Season everything with the garlic');
    expect(withBoth).toContain('Finish with the pesto');
    const without = must(freestyle(fridge)).steps.join(' ');
    expect(without).toContain('Season with salt, pepper and a squeeze of lemon');
  });

  test('potatoes and bread are served with, not under', () => {
    expect(
      must(freestyle([item('protein', 'Chicken breast'), item('starch', 'Baby potatoes')])).title,
    ).toBe('Chicken Breast with Baby Potatoes');
  });

  test('every temperature pair is consistent between Fahrenheit and Celsius', () => {
    const pots = [
      [item('protein', 'Ribeye')],
      [item('protein', 'Ground beef')],
      [item('protein', 'Chicken breast')],
      [item('protein', 'Pork chops')],
      [item('protein', 'Salmon')],
      [item('protein', 'Beef roast')],
    ];
    for (const pot of pots) {
      for (const [, f, c] of must(freestyle(pot))
        .steps.join(' ')
        .matchAll(/(\d+)°F \/ (\d+)°C/g)) {
        expect(Math.round(((Number(f) - 32) * 5) / 9)).toBe(Number(c));
      }
    }
  });
});

describe('cook returns the freestyle card alongside the dishes', () => {
  test('even when a dish matches, and even when no dish matches', () => {
    const dish = makeDish();
    const matching = must(
      cook([item('protein', 'Chicken thighs'), item('veg', 'Broccoli')], [dish]),
    );
    expect(matching.freestyle?.dish.id).toBe(FREESTYLE_ID);
    expect(matching.results.map((r) => r.dish.id)).not.toContain(FREESTYLE_ID);
    const other = must(cook(fridge, [dish]));
    expect(other.freestyle?.title).toBe('Shrimp with Spinach and Asparagus over Jasmine Rice');
  });

  test('is null when the pot has only a spice', () => {
    expect(must(cook([item('spice', 'Garlic')], [makeDish()])).freestyle).toBeNull();
  });
});

describe('freestyle titles read naturally', () => {
  test.each([
    [
      [item('protein', 'Eggs'), item('veg', 'Spinach'), item('starch', 'Sourdough')],
      'Eggs with Spinach and Sourdough',
    ],
    [
      [item('protein', 'Chicken breast'), item('starch', 'Baby potatoes')],
      'Chicken Breast with Baby Potatoes',
    ],
    [
      [item('protein', 'Chicken thighs'), item('veg', 'Broccoli'), item('starch', 'Penne')],
      'Chicken Thighs with Broccoli over Penne',
    ],
    [[item('veg', 'Carrots'), item('starch', 'Baby potatoes')], 'Carrots with Baby Potatoes'],
  ] as const)('%#', (pot, title) => {
    expect(must(freestyle(pot)).title).toBe(title);
  });
});
