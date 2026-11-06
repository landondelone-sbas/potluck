import {
  MIGRATIONS,
  PERSIST_VERSION,
  restore,
  runMigrations,
  type Migration,
} from '@/state/persisted';

const good = {
  id: 'a',
  name: 'Salmon',
  category: 'protein',
  createdAt: 1,
};

describe('restore', () => {
  test('gives an empty, valid state for nothing or for garbage', () => {
    const empty = {
      favorites: [],
      pot: [],
      onboardingComplete: false,
      cookLog: [],
      appearance: 'system',
      keepAwake: false,
      units: 'us',
    };
    expect(restore(undefined)).toEqual(empty);
    expect(restore(null)).toEqual(empty);
    expect(restore('nope')).toEqual(empty);
    expect(restore({ favorites: 'x', pot: 5, cookLog: {}, appearance: 7 })).toEqual(empty);
  });

  test('keeps a saved unit system and falls back to US for anything else (SET-5)', () => {
    expect(restore({ units: 'metric' }).units).toBe('metric');
    expect(restore({ units: 'us' }).units).toBe('us');
    expect(restore({ units: 'furlongs' }).units).toBe('us');
    expect(restore({}).units).toBe('us');
  });

  test('keeps good favorites and drops damaged ones without losing the rest', () => {
    const state = restore({
      favorites: [
        good,
        { id: 'b', name: '', category: 'veg', createdAt: 1 },
        { id: 'c', name: 'Corn', category: 'fruit', createdAt: 1 },
        { id: 'd', name: 'Rice', category: 'starch' },
        { id: 'e', name: 'Carrots', category: 'veg', createdAt: 2 },
      ],
    });
    expect(state.favorites.map((f) => f.name)).toEqual(['Salmon', 'Carrots']);
  });

  test('drops duplicate ids and duplicate names within a category', () => {
    const state = restore({
      favorites: [
        good,
        { ...good, name: 'Other' },
        { ...good, id: 'z', name: 'SALMON' },
        { ...good, id: 'y', category: 'sauce' },
      ],
    });
    expect(state.favorites.map((f) => f.id)).toEqual(['a', 'y']);
  });

  test('replays the saved pot through the pot rules', () => {
    const favorites = ['a', 'b', 'c', 'd'].map((id) => ({ ...good, id, name: `Protein ${id}` }));
    const state = restore({ favorites, pot: ['a', 'ghost', 7, 'b', 'a', 'c', 'd'] });
    // The ghost, the number and the repeat are dropped, and the fourth protein is over the limit.
    expect(state.pot).toEqual(['a', 'b', 'c']);
  });

  test('onboardingComplete is true only when it is exactly true', () => {
    expect(restore({ onboardingComplete: true }).onboardingComplete).toBe(true);
    expect(restore({ onboardingComplete: 'yes' }).onboardingComplete).toBe(false);
  });

  test('keeps valid cook log entries and drops invalid ones', () => {
    const entry = {
      id: 'l1',
      dishId: 'stirfry',
      title: 'Salmon Stir-Fry',
      pot: [{ name: 'Salmon', category: 'protein' }],
      cookedAt: 5,
      rating: null,
    };
    const state = restore({
      cookLog: [entry, { id: 'l2' }, { ...entry, id: 'l3', rating: 'meh' }],
    });
    expect(state.cookLog).toEqual([entry]);
  });
});

describe('runMigrations', () => {
  const addOne: Migration = (s) => ({ ...(s as object), a: 1 });
  const addTwo: Migration = (s) => ({ ...(s as object), b: 2 });

  test('applies each step from the saved version up to the target, in order', () => {
    const order: number[] = [];
    const migrations = {
      1: (s: unknown) => (order.push(1), addOne(s)),
      2: (s: unknown) => (order.push(2), addTwo(s)),
    };
    expect(runMigrations({}, 1, migrations, 3)).toEqual({ a: 1, b: 2 });
    expect(order).toEqual([1, 2]);
  });

  test('starts from the saved version, not from the beginning', () => {
    expect(runMigrations({}, 2, { 1: addOne, 2: addTwo }, 3)).toEqual({ b: 2 });
  });

  test('does nothing when the data is already current', () => {
    const state = { keep: true };
    expect(runMigrations(state, 3, { 1: addOne, 2: addTwo }, 3)).toBe(state);
  });

  test('every version below the current one has a migration registered', () => {
    for (let version = 1; version < PERSIST_VERSION; version += 1) {
      expect(MIGRATIONS[version]).toBeDefined();
    }
  });
});
