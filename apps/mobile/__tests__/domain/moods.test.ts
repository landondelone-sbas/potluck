import { dishes } from '@potluck/dishes';
import { CATEGORIES, cook } from '@potluck/engine';

import { SUGGESTIONS } from '@/domain/catalog';
import { toPotItem, type Favorite } from '@/domain/favorites';
import { MOODS, moodPot } from '@/domain/moods';
import { potFavorites } from '@/domain/pot';

import { fav, namesOf } from './helpers';

/** A user who picked every suggestion in setup. */
function everyone(): Favorite[] {
  return CATEGORIES.flatMap((category) => SUGGESTIONS[category].map((name) => fav(category, name)));
}

function mood(id: string) {
  const found = MOODS.find((m) => m.id === id);
  if (!found) throw new Error(`No mood ${id}`);
  return found;
}

describe('moodPot', () => {
  test('fills the pot from the favorites the user has', () => {
    const favorites = everyone();
    const pot = moodPot(mood('cozy'), favorites);
    expect(namesOf(favorites, pot)).toEqual([
      'Chicken thighs',
      'Carrots',
      'Baby potatoes',
      'Italian herbs',
    ]);
  });

  test('skips picks the user does not have', () => {
    const favorites = [fav('protein', 'Salmon'), fav('starch', 'Quinoa')];
    const pot = moodPot(mood('fresh'), favorites);
    expect(namesOf(favorites, pot)).toEqual(['Salmon', 'Quinoa']);
  });

  test('gives an empty pot when none of the picks are favorites', () => {
    expect(moodPot(mood('spicy'), [fav('veg', 'Kale')])).toEqual([]);
  });

  test('matches names ignoring case, within the pick’s own category', () => {
    const rightCategory = fav('sauce', 'pesto');
    const wrongCategory = fav('spice', 'Pesto');
    const pot = moodPot(mood('fresh'), [wrongCategory, rightCategory]);
    expect(pot).toEqual([rightCategory.id]);
  });
});

describe('mood starters cook to the PRD golden results (section 9.7)', () => {
  const expected: Record<string, string[]> = {
    cozy: ['sheetpan', 'stew', 'hash'],
    fresh: ['lemonherb'],
    spicy: ['burritobowl'],
    'ten-minute': ['scramble'],
  };

  test.each(MOODS.map((m) => [m.label, m.id] as const))('%s', (_label, id) => {
    const favorites = everyone();
    const pot = moodPot(mood(id), favorites);
    const result = cook(potFavorites(favorites, pot).map(toPotItem), dishes);
    expect(result?.results.map((r) => r.dish.id)).toEqual(expected[id]);
  });
});
