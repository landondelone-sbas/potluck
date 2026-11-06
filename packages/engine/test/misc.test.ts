import { fillTemplate, joinAnd, plateNudge, titleCase, wildcardName } from '../src';
import { item } from './helpers';

describe('text helpers', () => {
  test('titleCase capitalizes after spaces, dashes, slashes and ampersands', () => {
    expect(titleCase('chicken thighs')).toBe('Chicken Thighs');
    expect(titleCase('stir-fry')).toBe('Stir-Fry');
    expect(titleCase('salt/pepper & oil')).toBe('Salt/Pepper & Oil');
  });

  test('joinAnd', () => {
    expect(joinAnd([])).toBe('');
    expect(joinAnd(['a'])).toBe('a');
    expect(joinAnd(['a', 'b'])).toBe('a and b');
    expect(joinAnd(['a', 'b', 'c'])).toBe('a, b and c');
  });

  test('fillTemplate blanks unknown placeholders', () => {
    expect(fillTemplate('{p} with {x}', { p: 'beef' })).toBe('beef with ');
  });
});

describe('plateNudge (PRD section 9.6)', () => {
  const protein = item('protein', 'Chicken thighs');
  const veg = item('veg', 'Broccoli');
  const starch = item('starch', 'Jasmine rice');
  const spice = item('spice', 'Ginger');

  test('empty pot', () => expect(plateNudge([])).toBe('empty'));
  test('protein, veg and starch is balanced', () => {
    expect(plateNudge([protein, veg, starch])).toBe('balanced');
  });
  test('protein and starch without veg nudges toward veg', () => {
    expect(plateNudge([protein, starch])).toBe('needs-veg');
  });
  test('none of protein, veg or starch asks for one', () => {
    expect(plateNudge([spice])).toBe('needs-base');
  });
  test('anything else is left to the chef', () => {
    expect(plateNudge([protein, veg])).toBe('chef-fills');
    expect(plateNudge([protein, spice])).toBe('chef-fills');
  });
});

describe('wildcardName (PRD section 9.5)', () => {
  test('protein, veg, starch style and sauce', () => {
    const pot = [
      item('protein', 'Chicken thighs'),
      item('veg', 'Broccoli'),
      item('sauce', 'Soy sauce'),
      item('starch', 'Rice noodles'),
    ];
    expect(wildcardName(pot)).toBe('Chicken Thighs & Broccoli Noodle Bowl with Soy Sauce');
  });

  test('no starch gives Skillet', () => {
    expect(wildcardName([item('protein', 'Beef'), item('veg', 'Carrots')])).toBe(
      'Beef & Carrots Skillet',
    );
  });

  test('a starch with no style gives Bowl', () => {
    expect(wildcardName([item('protein', 'Beef'), item('starch', 'Cassava')])).toBe('Beef Bowl');
  });

  test('with neither protein nor veg it is a pantry dish', () => {
    expect(wildcardName([item('spice', 'Garlic'), item('sauce', 'Pesto')])).toBe(
      'Pantry Skillet with Pesto',
    );
  });

  test('picks the style from the first starch tag that has one', () => {
    // "Sweet potato" is tagged sweetpotato and potato; sweetpotato comes first.
    expect(wildcardName([item('starch', 'Sweet potato')])).toBe('Pantry Sweet Potato Roast');
  });
});
