import { buildResult, evaluateDish, howToCook, tagsFor } from '../src';
import { makeDish } from './helpers';

const side = (category: 'veg' | 'starch', name: string) => ({
  name,
  tags: tagsFor(category, name),
});

describe('howToCook', () => {
  test.each([
    [
      'starch',
      'Jasmine rice',
      'Cook the jasmine rice in water following the package directions, then fluff it with a fork.',
    ],
    [
      'starch',
      'Rice noodles',
      'Boil the rice noodles in well-salted water until just tender, then drain.',
    ],
    ['starch', 'Penne', 'Boil the penne in well-salted water until just tender, then drain.'],
    [
      'starch',
      'Baby potatoes',
      'Cut the baby potatoes into chunks and roast at 425°F (220°C) until golden and fork-tender, about 30 minutes.',
    ],
    [
      'starch',
      'Sweet potato',
      'Cut the sweet potato into chunks and roast at 425°F (220°C) until fork-tender, about 30 minutes.',
    ],
    ['starch', 'Corn tortillas', 'Warm the corn tortillas in a dry pan until soft and pliable.'],
    ['starch', 'Sourdough', 'Warm or toast the sourdough.'],
    ['starch', 'Mystery grain', 'Prepare the mystery grain the way you like it.'],
    [
      'veg',
      'Broccoli',
      'Toss the broccoli with oil and salt and roast at 425°F (220°C) until tender and browned at the edges, about 15 to 25 minutes.',
    ],
    ['veg', 'Spinach', 'Wilt the spinach in a hot pan with a little oil until just soft.'],
    ['veg', 'Cucumber', 'Slice the cucumber and dress it with a little salt, oil and lemon.'],
    ['veg', 'Cabbage', 'Shred the cabbage and sauté it in a hot pan until just tender.'],
  ] as const)('%s "%s"', (category, name, expected) => {
    expect(howToCook(category, [side(category, name)])).toBe(expected);
  });

  test('items that need the same method share one sentence', () => {
    expect(howToCook('starch', [side('starch', 'Penne'), side('starch', 'Spaghetti')])).toBe(
      'Boil the penne and spaghetti in well-salted water until just tender, then drain.',
    );
  });

  test('items that need different methods each get a sentence', () => {
    expect(howToCook('starch', [side('starch', 'Jasmine rice'), side('starch', 'Penne')])).toBe(
      'Cook the jasmine rice in water following the package directions, then fluff it with a fork. Boil the penne in well-salted water until just tender, then drain.',
    );
  });
});

describe('a plated dish cooks its sides by what the cook picked', () => {
  const plate = makeDish({
    format: 'plate',
    steps: ['Sear the {p}.', '{veg_how}', '{starch_how}', 'Plate it all with the {sauce}.'],
  });
  const item = (category: 'protein' | 'veg' | 'starch', name: string) => ({
    name,
    category,
    tags: tagsFor(category, name),
  });

  test('uses the picked sides', () => {
    const pot = [
      item('protein', 'Chicken thighs'),
      item('veg', 'Broccoli'),
      item('starch', 'Penne'),
    ];
    const card = buildResult(evaluateDish(plate, pot, 0));
    expect(card.steps[1]).toContain('roast at 425°F');
    expect(card.steps[2]).toBe(
      'Boil the penne in well-salted water until just tender, then drain.',
    );
  });

  test('uses the dish defaults when the pot has no sides', () => {
    const card = buildResult(evaluateDish(plate, [item('protein', 'Chicken thighs')], 0));
    expect(card.steps[1]).toContain('carrots');
    expect(card.steps[2]).toContain('rice');
  });
});
