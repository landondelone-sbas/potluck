import { TAG_VOCABULARY, tagsFor } from '../src';

describe('tagsFor', () => {
  test.each([
    ['protein', 'Chicken thighs', ['chicken']],
    ['sauce', 'Hot honey', ['hot', 'honey']],
    ['spice', 'Smoked paprika', ['paprika', 'smoky']],
    ['starch', 'Rice noodles', ['noodles', 'rice']],
    ['spice', 'Lemon pepper', ['pepper', 'lemon']],
    ['spice', 'Italian herbs', ['herbs']],
  ] as const)('%s "%s" gets %j (PRD section 9.2)', (category, name, expected) => {
    expect(tagsFor(category, name)).toEqual(expected);
  });

  test.each([
    ['Steak', ['beef', 'steak']],
    ['Ribeye', ['beef', 'steak']],
    ['NY strip', ['beef', 'steak']],
    ['Filet mignon', ['beef', 'steak']],
    ['Flank steak', ['beef', 'steak']],
    ['Ground beef', ['beef', 'ground']],
    ['Burgers', ['beef', 'ground']],
    ['Brisket', ['beef']],
    ['Salmon steak', ['beef', 'fish']],
    ['Pork steak', ['beef', 'pork']],
    ['Cube steak', ['beef']],
    ['Chicken fried steak', ['chicken', 'beef']],
    ['Cheesesteak', ['beef']],
    ['Pork tenderloin', ['pork']],
  ] as const)('whole-cut steak: protein "%s" gets %j', (name, expected) => {
    expect(tagsFor('protein', name)).toEqual(expected);
  });

  test.each([
    ['Ground turkey', ['turkey', 'ground']],
    ['Ground chicken', ['chicken', 'ground']],
    ['Ground pork', ['pork', 'ground']],
    ['Ground lamb', ['lamb', 'ground']],
    ['Meatballs', ['ground']],
    ['Italian sausage', ['sausage']],
  ] as const)('ground meat: protein "%s" gets %j', (name, expected) => {
    expect(tagsFor('protein', name)).toEqual(expected);
  });

  test('ground only tags proteins', () => {
    expect(tagsFor('veg', 'Ground cherries')).toEqual([]);
    expect(tagsFor('spice', 'Ground cumin')).toEqual(['cumin']);
  });

  test('matches regardless of case', () => {
    expect(tagsFor('protein', 'CHICKEN BREAST')).toEqual(['chicken']);
  });

  test('items that match nothing have no tags', () => {
    expect(tagsFor('protein', 'Dragon fruit')).toEqual([]);
    expect(tagsFor('spice', 'Mystery blend')).toEqual([]);
  });

  test('the same word tags differently in different categories', () => {
    expect(tagsFor('veg', 'Bell peppers')).toEqual(['pepper']);
    expect(tagsFor('spice', 'Black pepper')).toEqual(['pepper']);
    expect(tagsFor('spice', 'Bell peppers')).toEqual([]);
    expect(tagsFor('sauce', 'Marinara')).toEqual(['tomato']);
  });
});

describe('TAG_VOCABULARY', () => {
  test('lists every tag the rules can produce, once', () => {
    for (const tags of Object.values(TAG_VOCABULARY)) {
      expect(new Set(tags).size).toBe(tags.length);
      expect(tags.length).toBeGreaterThan(0);
    }
    expect(TAG_VOCABULARY.protein).toContain('chicken');
    expect(TAG_VOCABULARY.starch).toContain('tortilla');
  });
});
