import { buildResult, evaluateDish, type PotItem } from '../src';
import { item, makeDish } from './helpers';

function resultFor(pot: ReturnType<typeof item>[], dish = makeDish()) {
  return buildResult(evaluateDish(dish, pot, 0));
}

describe('buildResult (PRD section 9.5)', () => {
  test('fills the title with the first used protein and first used veg, in title case', () => {
    const result = resultFor([item('protein', 'chicken thighs'), item('veg', 'broccoli')]);
    expect(result.title).toBe('Chicken Thighs & Broccoli Fixture');
  });

  test('uses the dish default in the title when a category is empty', () => {
    expect(resultFor([item('protein', 'Beef')]).title).toBe('Beef & Carrots Fixture');
  });

  test('a left-out protein does not name the dish', () => {
    // salmon is known but not on this dish's list, so it is left out and tofu is the default
    const result = resultFor([item('protein', 'Salmon'), item('veg', 'Broccoli')]);
    expect(result.title).toBe('Tofu & Broccoli Fixture');
  });

  test('lists used and left-out items', () => {
    const result = resultFor([item('protein', 'Beef'), item('protein', 'Salmon')]);
    expect(result.used.map((i) => i.name)).toEqual(['Beef']);
    expect(result.leftOut.map((i) => i.name)).toEqual(['Salmon']);
  });

  test('the chef adds a default for each category with nothing used, in screen order', () => {
    const result = resultFor([item('protein', 'Beef'), item('starch', 'Jasmine rice')]);
    expect(result.chefAdds).toEqual([
      { category: 'veg', name: 'carrots' },
      { category: 'spice', name: 'garlic' },
      { category: 'sauce', name: 'soy sauce' },
    ]);
  });

  test('a left-out item does not stop the chef adding that category', () => {
    const result = resultFor([item('spice', 'Cumin')]);
    expect(result.chefAdds.map((c) => c.category)).toContain('spice');
  });

  test('fills steps with used items, in the order they were added, lowercased', () => {
    const result = resultFor([
      item('protein', 'Chicken thighs'),
      item('protein', 'Beef'),
      item('veg', 'Broccoli'),
      item('starch', 'Jasmine rice'),
    ]);
    expect(result.steps[0]).toBe('Cook the jasmine rice.');
    expect(result.steps[1]).toBe('Add the chicken thighs and beef and broccoli with garlic.');
  });

  test('joins three or more with commas', () => {
    const result = resultFor([
      item('protein', 'Chicken thighs'),
      item('protein', 'Beef'),
      item('protein', 'Chicken breast'),
    ]);
    expect(result.steps[1]).toContain('chicken thighs, beef and chicken breast');
  });

  test('steps fall back to defaults for empty categories', () => {
    const result = resultFor([item('protein', 'Beef')]);
    expect(result.steps).toEqual([
      'Cook the rice.',
      'Add the beef and carrots with garlic.',
      'Finish with soy sauce.',
    ]);
  });

  test('carries the score and dish', () => {
    const dish = makeDish({ id: 'x' });
    const result = resultFor([item('protein', 'Beef')], dish);
    expect(result.dish).toBe(dish);
    expect(result.score).toBe(13);
  });
});

describe('conditional steps', () => {
  const dish = makeDish({
    steps: [
      'Cook the {p}{?egg:, scrambling the eggs}{?sausage:, crumbling the sausage} until done.',
      '{?bakingpotato:Bake the {s}.}{?!bakingpotato:Roast the {s} in chunks.}',
      'Finish with the {sauce}.',
    ],
    wants: {
      ...makeDish().wants,
      protein: ['egg', 'sausage', 'chicken'],
      starch: ['potato', 'rice'],
    },
  });

  const card = (...items: PotItem[]) => buildResult(evaluateDish(dish, items, 0));

  test('keeps text only when something in the dish has the tag', () => {
    expect(card(item('protein', 'Eggs')).steps[0]).toBe(
      'Cook the eggs, scrambling the eggs until done.',
    );
    expect(card(item('protein', 'Italian sausage')).steps[0]).toBe(
      'Cook the italian sausage, crumbling the sausage until done.',
    );
    expect(card(item('protein', 'Chicken thighs')).steps[0]).toBe(
      'Cook the chicken thighs until done.',
    );
  });

  test('both conditions can apply at once', () => {
    expect(card(item('protein', 'Eggs'), item('protein', 'Italian sausage')).steps[0]).toBe(
      'Cook the eggs and italian sausage, scrambling the eggs, crumbling the sausage until done.',
    );
  });

  test('a negated condition is the other branch, and may use placeholders', () => {
    expect(card(item('starch', 'Russet potatoes')).steps[1]).toBe('Bake the russet potatoes.');
    expect(card(item('starch', 'Baby potatoes')).steps[1]).toBe(
      'Roast the baby potatoes in chunks.',
    );
  });

  test('the chef default counts when the pot has nothing for a category', () => {
    // The fixture's default protein is tofu, so there is no egg and no sausage.
    expect(card().steps[0]).toBe('Cook the tofu until done.');
  });

  test('a pantry pick counts too', () => {
    const evaluation = evaluateDish(dish, [], 0);
    const result = buildResult(evaluation, { protein: item('protein', 'Eggs') });
    expect(result.steps[0]).toBe('Cook the eggs, scrambling the eggs until done.');
  });
});

describe('chef picks', () => {
  test('a pick replaces the default in the ingredients and the steps', () => {
    const dish = makeDish({
      steps: ['Cook the {v} with the {sauce}.', 'Cook the {p}.', 'Serve on {s}.'],
    });
    const result = buildResult(evaluateDish(dish, [item('protein', 'Chicken thighs')], 0), {
      veg: item('veg', 'Broccoli'),
      sauce: item('sauce', 'Peanut sauce'),
    });
    expect(result.chefAdds).toEqual(
      expect.arrayContaining([
        { category: 'veg', name: 'broccoli' },
        { category: 'sauce', name: 'peanut sauce' },
        { category: 'starch', name: 'rice' },
      ]),
    );
    expect(result.steps[0]).toBe('Cook the broccoli with the peanut sauce.');
  });
});
