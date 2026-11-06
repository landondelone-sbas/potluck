import { CLOSE_PERCENT, MAX_RESULTS, cook, isCloseEnough, type Dish } from '../src';
import { item, makeDish, must } from './helpers';

/** A dish that only fits chicken, so it scores 13 against a lone chicken pot. */
const chickenOnly = (id: string, overrides: Partial<Dish> = {}) =>
  makeDish({
    id,
    ...overrides,
    wants: { ...makeDish().wants, protein: ['chicken', 'beef'] },
  });

describe('isCloseEnough (PRD section 9.4)', () => {
  test('the line is exactly 88 percent', () => {
    expect(CLOSE_PERCENT).toBe(88);
    expect(isCloseEnough(88, 100)).toBe(true);
    expect(isCloseEnough(87, 100)).toBe(false);
  });

  test('has no float edge cases where 88 percent lands on a whole number', () => {
    expect(isCloseEnough(22, 25)).toBe(true);
    expect(isCloseEnough(44, 50)).toBe(true);
    expect(isCloseEnough(21, 25)).toBe(false);
  });
});

describe('cook', () => {
  const chicken = [item('protein', 'Chicken thighs')];

  test('returns null for an empty pot', () => {
    expect(cook([], [makeDish()])).toBeNull();
  });

  test('returns null when there are no dishes', () => {
    expect(cook(chicken, [])).toBeNull();
  });

  test('one clear winner is a single result', () => {
    const winner = chickenOnly('winner');
    const loser = makeDish({
      id: 'loser',
      wants: { ...makeDish().wants, protein: ['tofu'] },
    });
    const result = must(cook(chicken, [loser, winner]));
    expect(result.mode).toBe('single');
    expect(result.results.map((r) => r.dish.id)).toEqual(['winner']);
  });

  test('close scores give several results', () => {
    const result = must(cook(chicken, [chickenOnly('a'), chickenOnly('b')]));
    expect(result.mode).toBe('multi');
    expect(result.results.map((r) => r.dish.id)).toEqual(['a', 'b']);
  });

  test('equal scores keep library order', () => {
    const dishes = ['c', 'a', 'b'].map((id) => chickenOnly(id));
    const result = must(cook(chicken, dishes));
    expect(result.results.map((r) => r.dish.id)).toEqual(['c', 'a', 'b']);
  });

  test('shows at most three results', () => {
    const dishes = ['a', 'b', 'c', 'd', 'e'].map((id) => chickenOnly(id));
    const result = must(cook(chicken, dishes));
    expect(MAX_RESULTS).toBe(3);
    expect(result.results).toHaveLength(3);
  });

  test('a higher score ranks first even if later in the library', () => {
    // A protein list of six scores 12 (bonus 2) against strong's 13: close enough to both show.
    const weak = makeDish({
      id: 'weak',
      wants: { ...makeDish().wants, protein: ['chicken', 'a', 'b', 'c', 'd', 'e'] },
    });
    const strong = chickenOnly('strong');
    const result = must(cook(chicken, [weak, strong]));
    expect(result.results.map((r) => r.dish.id)).toEqual(['strong', 'weak']);
  });

  test('a dish that uses far fewer items is dropped even with a close score', () => {
    const pot = [
      item('protein', 'Chicken thighs'),
      item('veg', 'Broccoli'),
      item('spice', 'Ginger'),
      item('starch', 'Jasmine rice'),
    ];
    // Uses all four: 13 + 14 + 14 + 12 = 53.
    const full = makeDish({ id: 'full' });
    // Uses two (chicken, ginger) for 13 + 14, leaves out veg and starch for 1 each, then three
    // signature matches add 18: 47 in all. That clears 88 percent of 53 but uses 2, not 3 or more.
    const sparse = makeDish({
      id: 'sparse',
      wants: { ...makeDish().wants, veg: ['corn'], starch: ['pasta'] },
      signature: [
        { category: 'protein', tag: 'chicken' },
        { category: 'veg', tag: 'broccoli' },
        { category: 'starch', tag: 'rice' },
      ],
    });
    expect(isCloseEnough(47, 53)).toBe(true);
    const result = must(cook(pot, [sparse, full]));
    expect(result.results.map((r) => r.dish.id)).toEqual(['full']);
    expect(result.mode).toBe('single');
  });

  test('sorts the pot by category, keeping order within a category', () => {
    const pot = [
      item('veg', 'Carrots'),
      item('protein', 'Beef'),
      item('protein', 'Chicken thighs'),
    ];
    const result = must(cook(pot, [makeDish()]));
    expect(must(result.results[0]).title).toBe('Beef & Carrots Fixture');
  });

  test('is deterministic', () => {
    const pot = [item('protein', 'Chicken thighs'), item('veg', 'Broccoli')];
    const dishes = [chickenOnly('a'), chickenOnly('b')];
    expect(cook(pot, dishes)).toEqual(cook(pot, dishes));
  });

  test('has a wildcard name only when the pot has two or more items', () => {
    expect(must(cook(chicken, [makeDish()])).wildcard).toBeNull();
    const two = [item('protein', 'Chicken thighs'), item('veg', 'Broccoli')];
    expect(must(cook(two, [makeDish()])).wildcard).toBe('Chicken Thighs & Broccoli Skillet');
  });

  test('reports the pot size', () => {
    const two = [item('protein', 'Chicken thighs'), item('veg', 'Broccoli')];
    expect(must(cook(two, [makeDish()])).potSize).toBe(2);
  });
});

describe('cook with a pantry', () => {
  const salmonDish = makeDish({
    id: 'salmon',
    wants: { ...makeDish().wants, protein: ['fish'] },
    defaults: { ...makeDish().defaults, protein: 'salmon' },
    steps: ['Cook the {p} until {doneness}.'],
  });
  const chickenDish = makeDish({ id: 'chicken' });
  const veg = [item('veg', 'Broccoli')];

  test('a dish with no protein from the pot uses a pantry protein it accepts, not its default', () => {
    const pantry = [item('protein', 'Chicken thighs'), item('protein', 'Cod')];
    const result = must(cook(veg, [salmonDish], pantry));
    const card = must(result.results[0]);
    expect(card.chefAdds.find((add) => add.category === 'protein')?.name).toBe('cod');
    expect(card.steps[0]).toBe('Cook the cod until cooked through (cod 145°F / 63°C).');
  });

  test('a dish no pantry protein suits is not offered', () => {
    const pantry = [item('protein', 'Chicken thighs')];
    const result = must(cook(veg, [salmonDish, chickenDish], pantry));
    expect(result.results.map((r) => r.dish.id)).toEqual(['chicken']);
    expect(must(result.results[0]).chefAdds.find((a) => a.category === 'protein')?.name).toBe(
      'chicken thighs',
    );
  });

  test('a protein in the pot is used as before', () => {
    const pot = [item('protein', 'Chicken thighs')];
    const result = must(cook(pot, [chickenDish], [item('protein', 'Beef')]));
    expect(must(result.results[0]).chefAdds.some((a) => a.category === 'protein')).toBe(false);
  });

  test('falls back to the dishes defaults when no pantry protein suits any dish', () => {
    const result = must(cook(veg, [salmonDish], [item('protein', 'Chicken thighs')]));
    expect(must(result.results[0]).chefAdds.find((a) => a.category === 'protein')?.name).toBe(
      'salmon',
    );
  });

  test('without a pantry nothing changes', () => {
    const result = must(cook(veg, [salmonDish]));
    expect(must(result.results[0]).chefAdds.find((a) => a.category === 'protein')?.name).toBe(
      'salmon',
    );
  });
});
