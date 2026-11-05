import { addFavorite, normalizeName, removeFavorite, toPotItem } from '@/domain/favorites';

import { fav } from './helpers';

describe('normalizeName', () => {
  test('trims, collapses spaces and capitalises the first letter', () => {
    expect(normalizeName('   hot    honey ')).toBe('Hot honey');
  });

  test('caps the length at 40 characters', () => {
    expect(normalizeName('a'.repeat(60))).toHaveLength(40);
  });

  test('gives an empty string for blank input', () => {
    expect(normalizeName('   \n ')).toBe('');
  });
});

describe('addFavorite', () => {
  const meta = { id: 'new', now: 1000 };

  test('adds a favorite and leaves the original list alone', () => {
    const before = [fav('protein', 'Salmon')];
    const outcome = addFavorite(before, 'veg', ' broccoli ', meta);
    expect(outcome.status).toBe('added');
    expect(outcome.favorites).toHaveLength(2);
    expect(before).toHaveLength(1);
    if (outcome.status === 'added') {
      expect(outcome.favorite).toEqual({
        id: 'new',
        name: 'Broccoli',
        category: 'veg',
        createdAt: 1000,
      });
    }
  });

  test('refuses a duplicate in the same category, ignoring case', () => {
    const existing = fav('protein', 'Salmon');
    const outcome = addFavorite([existing], 'protein', 'SALMON', meta);
    expect(outcome.status).toBe('duplicate');
    if (outcome.status === 'duplicate') expect(outcome.existing).toBe(existing);
    expect(outcome.favorites).toHaveLength(1);
  });

  test('allows the same name in a different category', () => {
    const outcome = addFavorite([fav('sauce', 'Pesto')], 'spice', 'Pesto', meta);
    expect(outcome.status).toBe('added');
  });

  test('refuses an empty name', () => {
    expect(addFavorite([], 'veg', '   ', meta).status).toBe('empty');
  });
});

describe('removeFavorite', () => {
  test('removes only the matching id', () => {
    const a = fav('veg', 'Carrots');
    const b = fav('veg', 'Corn');
    expect(removeFavorite([a, b], a.id)).toEqual([b]);
  });
});

describe('toPotItem', () => {
  test('derives engine tags from the name', () => {
    const item = toPotItem(fav('protein', 'Chicken thighs'));
    expect(item).toEqual({ name: 'Chicken thighs', category: 'protein', tags: ['chicken'] });
  });

  test('an unrecognised food has no tags, so the engine treats it as unknown', () => {
    expect(toPotItem(fav('veg', 'Dragon fruit')).tags).toEqual([]);
  });
});
