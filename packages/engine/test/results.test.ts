import { buildResult, evaluateDish } from '../src';
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
