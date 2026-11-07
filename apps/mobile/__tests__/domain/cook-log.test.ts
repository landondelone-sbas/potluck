import { dishes } from '@potluck/dishes';
import { cook, tagsFor, type Category, type PotItem } from '@potluck/engine';

import { makeLogEntry, rebuildResult, type CookRun } from '@/domain/cook-log';
import { formatDay } from '@/lib/format';

function potOf(...items: [Category, string][]): PotItem[] {
  return items.map(([category, name]) => ({ category, name, tags: tagsFor(category, name) }));
}

const POTS: Record<string, PotItem[]> = {
  golden: potOf(
    ['protein', 'Chicken thighs'],
    ['veg', 'Broccoli'],
    ['starch', 'Jasmine rice'],
    ['spice', 'Ginger'],
    ['sauce', 'Soy sauce'],
  ),
  cozy: potOf(
    ['protein', 'Chicken thighs'],
    ['veg', 'Carrots'],
    ['starch', 'Baby potatoes'],
    ['spice', 'Italian herbs'],
  ),
  fresh: potOf(
    ['protein', 'Salmon'],
    ['veg', 'Zucchini'],
    ['starch', 'Quinoa'],
    ['spice', 'Lemon pepper'],
    ['sauce', 'Pesto'],
  ),
  // Items the dish leaves out, and items the engine has never heard of.
  leftOut: potOf(['protein', 'Salmon'], ['protein', 'Ground beef'], ['veg', 'Zucchini']),
  unknown: potOf(['protein', 'Venison'], ['veg', 'Romanesco'], ['spice', 'Sumac']),
  single: potOf(['protein', 'Eggs']),
};

function runFor(pot: PotItem[], pantry?: PotItem[]): CookRun {
  const result = cook(pot, dishes, pantry);
  if (!result) throw new Error('no result');
  return {
    runId: 'r',
    result,
    pot: pot.map(({ name, category }) => ({ name, category })),
    cookedAt: 1,
  };
}

describe('rebuildResult with a chef-chosen protein', () => {
  // A veg-only pot, with only cod and chicken in the pantry: the chef cooks one of those.
  const pot = potOf(['veg', 'Asparagus'], ['starch', 'Quinoa']);
  const pantry = potOf(
    ['protein', 'Cod'],
    ['protein', 'Chicken thighs'],
    ...pot.map((i) => [i.category, i.name] as [Category, string]),
  );
  const run = runFor(pot, pantry);

  test.each(run.result.results.map((card) => [card.dish.id, card] as const))(
    'rebuilds %s with the same protein the card named',
    (_id, card) => {
      const entry = makeLogEntry(card, run, { id: 'e', now: 2 });
      const chosen = card.chefAdds.find((add) => add.category === 'protein');
      expect(chosen).toBeDefined();
      expect(entry.chefPicks?.protein).toBe(chosen?.name);
      expect(rebuildResult(entry, dishes)).toEqual(card);
    },
  );

  test('an entry that saved only the chef protein (an older build) still rebuilds with it', () => {
    const card = run.result.results[0]!;
    const protein = card.chefAdds.find((a) => a.category === 'protein')!.name;
    const { chefPicks: _dropped, ...old } = makeLogEntry(card, run, { id: 'e', now: 2 });
    const rebuilt = rebuildResult({ ...old, chefProtein: protein }, dishes);
    expect(rebuilt?.chefAdds.find((a) => a.category === 'protein')?.name).toBe(protein);
  });

  test('the chef picks a pantry vegetable and starch too, and the recipe keeps them', () => {
    const run2 = runFor(
      potOf(['protein', 'Salmon']),
      potOf(['protein', 'Salmon'], ['veg', 'Green beans'], ['starch', 'Baby potatoes']),
    );
    const card = run2.result.results.find((r) => r.dish.id === 'bakedsalmon')!;
    const entry = makeLogEntry(card, run2, { id: 'e', now: 2 });
    expect(entry.chefPicks).toMatchObject({ veg: 'green beans', starch: 'baby potatoes' });
    expect(rebuildResult(entry, dishes)).toEqual(card);
  });

  test('an older entry with no saved picks still rebuilds, with the dish default', () => {
    const card = run.result.results[0]!;
    const { chefPicks: _dropped, ...old } = makeLogEntry(card, run, { id: 'e', now: 2 });
    const rebuilt = rebuildResult(old, dishes);
    expect(rebuilt?.chefAdds.find((a) => a.category === 'protein')?.name).toBe(
      card.dish.defaults.protein,
    );
  });
});

describe('rebuildResult', () => {
  // The cook log keeps only the pot and the dish. The recipe must come back exactly as shown.
  describe.each(Object.keys(POTS))('the %s pot', (name) => {
    const run = runFor(POTS[name]!);
    test.each(run.result.results.map((card) => [card.dish.id, card] as const))(
      'rebuilds %s exactly as it was shown',
      (_id, card) => {
        const entry = makeLogEntry(card, run, { id: 'e', now: 2 });
        expect(rebuildResult(entry, dishes)).toEqual(card);
      },
    );
  });

  test('is independent of the order the pot was saved in', () => {
    const run = runFor(POTS.golden!);
    const card = run.result.results[0]!;
    const entry = makeLogEntry(card, run, { id: 'e', now: 2 });
    const shuffled = { ...entry, pot: [...entry.pot].reverse() };
    expect(rebuildResult(shuffled, dishes)).toEqual(card);
  });

  test('gives null when the dish is no longer in the library', () => {
    const run = runFor(POTS.golden!);
    const entry = makeLogEntry(run.result.results[0]!, run, { id: 'e', now: 2 });
    expect(rebuildResult({ ...entry, dishId: 'removed-dish' }, dishes)).toBeNull();
    expect(rebuildResult(entry, [])).toBeNull();
  });
});

describe('makeLogEntry', () => {
  test('copies the pot, so later changes to the run cannot change the log', () => {
    const run = runFor(POTS.golden!);
    const entry = makeLogEntry(run.result.results[0]!, run, { id: 'e', now: 5 });
    run.pot[0]!.name = 'Changed';
    expect(entry.pot[0]!.name).toBe('Chicken thighs');
    expect(entry).toMatchObject({ id: 'e', cookedAt: 5, rating: null });
  });
});

describe('formatDay', () => {
  test('gives a short weekday, month and day', () => {
    expect(formatDay(new Date(2026, 10, 3, 12).getTime(), 'en-US')).toBe('Tue, Nov 3');
  });
});
