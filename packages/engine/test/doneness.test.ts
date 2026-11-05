import { buildResult, donenessFor, evaluateDish } from '../src';
import { item, makeDish } from './helpers';

const protein = (name: string) => item('protein', name);

describe('donenessFor (docs/decisions/0009)', () => {
  test.each([
    [['Chicken thighs'], 'cooked through (chicken thighs 165°F / 74°C)'],
    [['Turkey'], 'cooked through (turkey 165°F / 74°C)'],
    [['Italian sausage'], 'cooked through (italian sausage 165°F / 74°C)'],
    [['Ground chicken'], 'cooked through (ground chicken 165°F / 74°C)'],
    [['Ground beef'], 'cooked through (ground beef 160°F / 71°C)'],
    [['Ground lamb'], 'cooked through (ground lamb 160°F / 71°C)'],
    [['Meatballs'], 'cooked through (meatballs 160°F / 71°C)'],
    [['Pork chops'], 'cooked through (pork chops 145°F / 63°C)'],
    [['Lamb chops'], 'cooked through (lamb chops 145°F / 63°C)'],
    [['Brisket'], 'cooked through (brisket 145°F / 63°C)'],
    [['Salmon'], 'cooked through (salmon 145°F / 63°C)'],
    [['Shrimp'], 'cooked through (shrimp pink and opaque)'],
    [['Steak'], 'cooked through'],
    [['Ribeye'], 'cooked through'],
    [['Tofu'], 'heated through'],
    [['Black beans'], 'heated through'],
    [['Eggs'], 'heated through'],
    [['Dragon fruit'], 'heated through'],
    [[], 'heated through'],
  ] as const)('%j gives "%s"', (names, expected) => {
    expect(donenessFor(names.map(protein))).toBe(expected);
  });

  test('names each temperature once, with only what is in the pot', () => {
    expect(donenessFor(['Chicken breast', 'Italian sausage', 'Ground beef'].map(protein))).toBe(
      'cooked through (chicken breast and italian sausage 165°F / 74°C; ground beef 160°F / 71°C)',
    );
    expect(donenessFor(['Salmon', 'Shrimp', 'Pork chops'].map(protein))).toBe(
      'cooked through (salmon and pork chops 145°F / 63°C; shrimp pink and opaque)',
    );
  });

  test('a steak beside another meat names only the other meat', () => {
    expect(donenessFor(['Steak', 'Chicken breast'].map(protein))).toBe(
      'cooked through (chicken breast 165°F / 74°C)',
    );
  });

  test('beans and tofu beside a meat add nothing', () => {
    expect(donenessFor(['Black beans', 'Shrimp'].map(protein))).toBe(
      'cooked through (shrimp pink and opaque)',
    );
  });
});

describe('the {doneness} placeholder', () => {
  const dish = makeDish({
    wants: { ...makeDish().wants, protein: ['chicken', 'beef', 'shrimp', 'fish'] },
    defaults: { ...makeDish().defaults, protein: 'chicken breast' },
    steps: ['Cook the {p} until {doneness}.', 'Serve.', 'Enjoy.'],
  });
  const resultFor = (names: string[]) => buildResult(evaluateDish(dish, names.map(protein), 0));

  test('is filled from the proteins used', () => {
    expect(resultFor(['Ground beef', 'Shrimp']).steps[0]).toBe(
      'Cook the ground beef and shrimp until cooked through (ground beef 160°F / 71°C; shrimp pink and opaque).',
    );
  });

  test('uses the chef pick when the pot has no protein', () => {
    expect(resultFor([]).steps[0]).toBe(
      'Cook the chicken breast until cooked through (chicken breast 165°F / 74°C).',
    );
  });

  test('ignores a protein the dish does not use', () => {
    const step = resultFor(['Chicken breast', 'Tofu']).steps[0];
    expect(step).toContain('chicken breast 165°F / 74°C');
    expect(step).not.toContain('tofu');
  });
});
