import { formatAmount, splitAmount } from '../src';

const g = (qty: number) => ({ qty, unit: 'g' as const });
const ml = (qty: number) => ({ qty, unit: 'ml' as const });
const n = (qty: number) => ({ qty, unit: 'n' as const });

describe('formatAmount in US units', () => {
  test.each([
    [g(340), '12 oz'],
    [g(450), '1 lb'],
    [g(150), '5½ oz'],
    [g(680), '1½ lb'],
    [ml(5), '1 tsp'],
    [ml(2), '½ tsp'],
    [ml(30), '2 tbsp'],
    [ml(60), '¼ cup'],
    [ml(120), '½ cup'],
    [ml(250), '1 cup'],
    [ml(400), '1¾ cups'],
    [ml(750), '3¼ cups'],
  ])('%j is %s', (amount, expected) => {
    expect(formatAmount(amount, 'us')).toBe(expected);
  });
});

describe('formatAmount in metric', () => {
  test.each([
    [g(340), '340 g'],
    [g(450), '450 g'],
    [g(1200), '1.2 kg'],
    [ml(5), '5 ml'],
    [ml(2.5), '2.5 ml'],
    [ml(30), '30 ml'],
    [ml(750), '750 ml'],
    [ml(1500), '1.5 L'],
  ])('%j is %s', (amount, expected) => {
    expect(formatAmount(amount, 'metric')).toBe(expected);
  });
});

describe('counts and scaling', () => {
  test('a count is a plain number in both systems', () => {
    expect(formatAmount(n(4), 'us')).toBe('4');
    expect(formatAmount(n(4), 'metric')).toBe('4');
  });

  test('scales from two servings', () => {
    expect(formatAmount(g(340), 'metric', 4)).toBe('680 g');
    expect(formatAmount(g(340), 'metric', 1)).toBe('170 g');
    expect(formatAmount(n(4), 'us', 6)).toBe('12');
    expect(formatAmount(n(2), 'us', 1)).toBe('1');
  });

  test('a count never drops below one', () => {
    expect(formatAmount(n(1), 'us', 1)).toBe('1');
  });

  test('items sharing a category split its amount equally', () => {
    expect(splitAmount(g(340), 2)).toEqual(g(170));
    expect(splitAmount(g(340), 1)).toEqual(g(340));
  });
});
