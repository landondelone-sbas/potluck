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
    ['Brisket', ['beef', 'roast']],
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
    expect(tagsFor('protein', 'CHICKEN BREAST')).toEqual(['chicken', 'breast']);
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

describe('tags for Thai, Korean and Caribbean cooking (docs/decisions/0010)', () => {
  test.each([
    ['spice', 'Jerk seasoning', ['jerk']],
    ['spice', 'Allspice', ['jerk']],
    ['spice', 'Lime zest', ['lemon']],
    ['sauce', 'Fish sauce', ['soy']],
    ['sauce', 'Miso paste', ['soy']],
    ['sauce', 'Gochujang', ['hot']],
    ['sauce', 'Coconut milk', ['coconut']],
    ['spice', 'Green curry paste', ['curry']],
    ['veg', 'Kimchi', ['cabbage']],
  ] as const)('%s "%s" gets %j', (category, name, expected) => {
    expect(tagsFor(category, name)).toEqual(expected);
  });
});

describe('tags for the ingredients in the recipe sheets', () => {
  test.each([
    ['protein', 'Beef chuck roast', ['beef', 'roast']],
    ['protein', 'Prime rib', ['beef']],
    ['protein', 'Beef short ribs', ['beef', 'roast']],
    ['protein', 'Flat iron steak', ['beef', 'steak']],
    ['protein', 'Tomahawk', ['beef', 'steak']],
    ['protein', 'Carne asada', ['beef']],
    ['protein', 'Baby back ribs', ['pork']],
    ['protein', 'St. Louis style ribs', ['pork']],
    ['protein', 'Lamb ribs', ['lamb']],
    ['protein', 'Pepperoni', ['sausage']],
    ['protein', 'Andouille', ['sausage']],
    ['protein', 'Salt cod (bacalao)', ['fish']],
    ['protein', 'Red snapper', ['fish']],
    ['veg', 'Parsnips', ['carrot']],
    ['veg', 'Okra', ['okra']],
    ['veg', 'Eggplant', ['eggplant']],
    ['spice', 'Fresh cilantro', ['herbs']],
    ['spice', 'Tarragon', ['herbs']],
    ['sauce', 'Oyster sauce', ['soy']],
    ['sauce', 'Doubanjiang', ['hot']],
    ['sauce', 'Garlic butter', ['cream']],
    ['sauce', 'Peanut butter sauce', ['peanut']],
    ['starch', 'Linguini', ['pasta']],
    ['starch', 'Gnocchi', ['pasta']],
    ['starch', 'Naan flatbread', ['bread']],
    ['starch', 'Cheese grits', ['grits']],
    ['starch', 'Plantains', ['plantain']],
  ] as const)('%s "%s" gets %j', (category, name, expected) => {
    expect(tagsFor(category, name)).toEqual(expected);
  });
});

describe('potato kinds', () => {
  test.each([
    ['Baby potatoes', ['potato']],
    ['Red potatoes', ['potato']],
    ['Yukon gold potatoes', ['potato']],
    ['Russet potatoes', ['potato', 'bakingpotato']],
    ['Baked potatoes', ['potato', 'bakingpotato']],
    ['Idaho potatoes', ['potato', 'bakingpotato']],
    ['Sweet potato', ['sweetpotato', 'potato']],
    ['French fries', ['potato']],
  ] as const)('starch "%s" gets %j', (name, expected) => {
    expect(tagsFor('starch', name)).toEqual(expected);
  });
});

describe('roast and breast', () => {
  test.each([
    ['Beef roast', ['beef', 'roast']],
    ['Chuck roast', ['beef', 'roast']],
    ['Pot roast', ['beef', 'roast']],
    ['Pork shoulder roast', ['pork', 'roast']],
    ['Lamb roast', ['lamb', 'roast']],
    ['Top round', ['beef']],
    ['Roast chicken', ['chicken']],
    ['Chicken breast', ['chicken', 'breast']],
    ['Turkey breast', ['turkey', 'breast']],
    ['Turkey tenderloin', ['turkey', 'breast']],
    ['Ground turkey', ['turkey', 'ground']],
    ['Chicken thighs', ['chicken']],
    ['Pork tenderloin', ['pork']],
  ] as const)('protein "%s" gets %j', (name, expected) => {
    expect(tagsFor('protein', name)).toEqual(expected);
  });

  test('marmalade and jam count as honey-type sauces', () => {
    expect(tagsFor('sauce', 'Orange marmalade')).toEqual(['honey']);
    expect(tagsFor('sauce', 'Strawberry jam')).toEqual(['honey']);
  });
});
