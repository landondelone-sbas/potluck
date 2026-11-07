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

describe('cook mixes one-pot and plated dishes', () => {
  const chicken = [item('protein', 'Chicken thighs')];
  const pot = (id: string) => chickenOnly(id);
  const plate = (id: string, overrides: Partial<Dish> = {}) =>
    chickenOnly(id, { format: 'plate', ...overrides });

  // Takes beef only, so a chicken pot scores it far below the chicken dishes.
  const weakPlate = makeDish({
    id: 'p',
    format: 'plate',
    wants: { ...makeDish().wants, protein: ['beef'] },
  });

  test('three one-pot dishes and a close plated dish: the plate takes the last place', () => {
    const library = [pot('a'), pot('b'), pot('c'), plate('p')];
    const result = must(cook(chicken, library));
    expect(result.results.map((r) => r.dish.id)).toEqual(['a', 'b', 'p']);
  });

  test('the mix keeps the picks in rank order', () => {
    const library = [pot('a'), plate('p'), pot('b'), pot('c')];
    const result = must(cook(chicken, library));
    expect(result.results.map((r) => r.dish.id)).toEqual(['a', 'p', 'b']);
  });

  test('already mixed picks are left alone', () => {
    const library = [pot('a'), plate('p'), pot('b'), plate('q')];
    const result = must(cook(chicken, library));
    expect(result.results.map((r) => r.dish.id)).toEqual(['a', 'p', 'b']);
  });

  test('a plate that is not close enough is never forced in', () => {
    const weak = weakPlate;
    const library = [pot('a'), pot('b'), pot('c'), weak];
    const result = must(cook(chicken, library));
    expect(result.results.map((r) => r.dish.id)).toEqual(['a', 'b', 'c']);
  });

  test('a plate further down the list does not push out a pick', () => {
    const library = [pot('a'), pot('b'), pot('c'), pot('d'), plate('p')];
    const result = must(cook(chicken, library));
    expect(result.results.map((r) => r.dish.id)).toEqual(['a', 'b', 'c']);
  });

  test('one pick is never swapped', () => {
    const library = [pot('a'), weakPlate];
    expect(must(cook(chicken, library)).results.map((r) => r.dish.id)).toEqual(['a']);
  });
});

describe('cook with a pantry: the chef uses what the user owns in every category', () => {
  const dish = makeDish({
    id: 'veggie',
    wants: { ...makeDish().wants, veg: ['broccoli', 'carrot'], starch: ['rice', 'potato'] },
    defaults: { ...makeDish().defaults, veg: 'carrots', starch: 'rice' },
  });
  const chicken = [item('protein', 'Chicken thighs')];
  const adds = (pot: ReturnType<typeof item>[], pantry: ReturnType<typeof item>[]) =>
    must(cook(pot, [dish], pantry)).results[0]!.chefAdds;

  test('a vegetable and a starch from the pantry replace the defaults', () => {
    const pantry = [...chicken, item('veg', 'Broccoli'), item('starch', 'Baby potatoes')];
    const result = adds(chicken, pantry);
    expect(result).toEqual(
      expect.arrayContaining([
        { category: 'veg', name: 'broccoli' },
        { category: 'starch', name: 'baby potatoes' },
      ]),
    );
  });

  test('a pantry item the dish does not accept is not used', () => {
    const result = adds(chicken, [...chicken, item('veg', 'Spinach'), item('starch', 'Naan')]);
    expect(result).toEqual(
      expect.arrayContaining([
        { category: 'veg', name: 'carrots' },
        { category: 'starch', name: 'rice' },
      ]),
    );
  });

  test('without a pantry nothing changes', () => {
    const result = must(cook(chicken, [dish])).results[0]!.chefAdds;
    expect(result).toEqual(
      expect.arrayContaining([
        { category: 'veg', name: 'carrots' },
        { category: 'starch', name: 'rice' },
      ]),
    );
  });
});
