import {
  addToPot,
  countsByCategory,
  potFavorites,
  pruneMissing,
  removeFromPot,
} from '@/domain/pot';

import { fav } from './helpers';

describe('addToPot', () => {
  const a = fav('protein', 'Salmon', 'a');
  const b = fav('protein', 'Eggs', 'b');
  const c = fav('protein', 'Tofu', 'c');
  const d = fav('protein', 'Turkey', 'd');
  const all = [a, b, c, d];

  test('adds a favorite', () => {
    expect(addToPot([], all, 'a')).toEqual({ ok: true, pot: ['a'] });
  });

  test('refuses an id that is not a favorite', () => {
    expect(addToPot([], all, 'zzz')).toEqual({ ok: false, reason: 'unknown' });
  });

  test('refuses a second copy', () => {
    expect(addToPot(['a'], all, 'a')).toEqual({ ok: false, reason: 'duplicate' });
  });

  test('allows three of a category and refuses the fourth', () => {
    expect(addToPot(['a', 'b'], all, 'c').ok).toBe(true);
    expect(addToPot(['a', 'b', 'c'], all, 'd')).toEqual({
      ok: false,
      reason: 'category-full',
      category: 'protein',
    });
  });

  test('refuses a thirteenth item even when its category has room', () => {
    const favorites = (['protein', 'veg', 'spice', 'sauce'] as const).flatMap((category) =>
      [1, 2, 3].map((n) => fav(category, `${category} ${n}`)),
    );
    const starch = fav('starch', 'Rice');
    const pot = favorites.map((f) => f.id);
    expect(pot).toHaveLength(12);
    expect(addToPot(pot, [...favorites, starch], starch.id)).toEqual({ ok: false, reason: 'full' });
  });
});

describe('pot helpers', () => {
  const protein = fav('protein', 'Salmon', 'p');
  const veg1 = fav('veg', 'Carrots', 'v1');
  const veg2 = fav('veg', 'Corn', 'v2');
  const starch = fav('starch', 'Rice', 's');
  const all = [protein, veg1, veg2, starch];

  test('potFavorites orders by category, then by the order added', () => {
    const names = potFavorites(all, ['s', 'v2', 'p', 'v1']).map((f) => f.name);
    expect(names).toEqual(['Salmon', 'Corn', 'Carrots', 'Rice']);
  });

  test('potFavorites skips ids that are no longer favorites', () => {
    expect(potFavorites(all, ['p', 'gone'])).toEqual([protein]);
  });

  test('removeFromPot removes one id', () => {
    expect(removeFromPot(['p', 'v1'], 'p')).toEqual(['v1']);
  });

  test('pruneMissing drops ids that are not favorites', () => {
    expect(pruneMissing(['p', 'gone', 's'], all)).toEqual(['p', 's']);
  });

  test('countsByCategory counts every category, including empty ones', () => {
    expect(countsByCategory(potFavorites(all, ['p', 'v1', 'v2']))).toEqual({
      protein: 1,
      veg: 2,
      spice: 0,
      sauce: 0,
      starch: 0,
    });
  });
});
