import { evaluateDish, scoreItem, specificityBonus } from '../src';
import { item, makeDish } from './helpers';

describe('specificityBonus', () => {
  test.each([
    [1, 4],
    [2, 3],
    [6, 2],
    [9, 1],
    [12, 0],
    [40, 0],
  ])('a list of %i earns %i', (length, bonus) => {
    expect(specificityBonus(length)).toBe(bonus);
  });
});

describe('scoreItem (PRD section 9.3)', () => {
  const dish = makeDish();

  test('fit: 10 plus the specificity bonus', () => {
    expect(scoreItem(item('protein', 'Chicken thighs'), dish)).toEqual({ points: 13, used: true });
    expect(scoreItem(item('veg', 'Broccoli'), dish)).toEqual({ points: 14, used: true });
    expect(scoreItem(item('starch', 'Jasmine rice'), dish)).toEqual({ points: 12, used: true });
  });

  test('a spice or sauce that suits the cuisine scores 5', () => {
    // soy suits asian but is not on this dish's sauce list
    expect(scoreItem(item('sauce', 'Soy sauce'), dish)).toEqual({ points: 5, used: true });
  });

  test('a universal tag such as garlic suits every cuisine', () => {
    expect(scoreItem(item('spice', 'Garlic'), dish)).toEqual({ points: 5, used: true });
  });

  test('a spice that clashes with the cuisine scores 0 and is left out', () => {
    expect(scoreItem(item('spice', 'Cumin'), dish)).toEqual({ points: 0, used: false });
  });

  test('an unknown spice or sauce scores 4 and is used', () => {
    expect(scoreItem(item('spice', 'Mystery blend'), dish)).toEqual({ points: 4, used: true });
    expect(scoreItem(item('sauce', 'Grandma special'), dish)).toEqual({ points: 4, used: true });
  });

  test('an unknown protein, veg or starch scores 3 and is used', () => {
    expect(scoreItem(item('protein', 'Dragon fruit'), dish)).toEqual({ points: 3, used: true });
    expect(scoreItem(item('veg', 'Kohlrabi'), dish)).toEqual({ points: 3, used: true });
    expect(scoreItem(item('starch', 'Plantain'), dish)).toEqual({ points: 3, used: true });
  });

  test('a known protein, veg or starch the dish does not use scores 1 and is left out', () => {
    expect(scoreItem(item('protein', 'Salmon'), dish)).toEqual({ points: 1, used: false });
    expect(scoreItem(item('veg', 'Corn'), dish)).toEqual({ points: 1, used: false });
    expect(scoreItem(item('starch', 'Corn tortillas'), dish)).toEqual({ points: 1, used: false });
  });
});

describe('evaluateDish', () => {
  test('sums item scores and splits used from left out', () => {
    const pot = [item('protein', 'Chicken thighs'), item('veg', 'Corn'), item('spice', 'Cumin')];
    const result = evaluateDish(makeDish(), pot, 7);
    expect(result.score).toBe(13 + 1 + 0);
    expect(result.used.map((i) => i.name)).toEqual(['Chicken thighs']);
    expect(result.leftOut.map((i) => i.name)).toEqual(['Corn', 'Cumin']);
    expect(result.index).toBe(7);
  });

  test('adds 6 for each signature match', () => {
    const dish = makeDish({
      signature: [
        { category: 'sauce', tag: 'peanut' },
        { category: 'starch', tag: 'rice' },
        { category: 'protein', tag: 'tofu' },
      ],
    });
    const pot = [item('sauce', 'Peanut sauce'), item('starch', 'Jasmine rice')];
    // sauce fit (10 + bonus 4 for a list of 1) + starch fit (12) + two signatures (12)
    expect(evaluateDish(dish, pot, 0).score).toBe(14 + 12 + 12);
  });

  test('a signature counts once however many items match it', () => {
    const dish = makeDish({ signature: [{ category: 'starch', tag: 'rice' }] });
    const pot = [item('starch', 'Jasmine rice'), item('starch', 'Brown rice')];
    expect(evaluateDish(dish, pot, 0).score).toBe(12 + 12 + 6);
  });
});
