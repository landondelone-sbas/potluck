import fs from 'node:fs';
import path from 'node:path';

import { buildResult, CATEGORIES, CUISINES, cook, evaluateDish, tagsFor } from '@potluck/engine';

import { DISH_FILES, dishes } from '../src';
import { must, potOf, PROTOTYPE_DISH_COUNT } from './helpers';

const DATA_DIR = path.join(__dirname, '../data');

describe('dish library (PRD section 11)', () => {
  test('every dish file in data/ is registered in the index, and nothing else is', () => {
    const onDisk = fs
      .readdirSync(DATA_DIR)
      .filter((f) => f.endsWith('.json'))
      .sort();
    const registered = dishes.map((d) => `${d.id}.json`).sort();
    expect(registered).toEqual(onDisk);
    expect(DISH_FILES).toHaveLength(onDisk.length);
  });

  test('each file is named after its dish id', () => {
    for (const file of fs.readdirSync(DATA_DIR)) {
      const raw: { id: string } = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
      expect(`${raw.id}.json`).toBe(file);
    }
  });

  test('ids are unique', () => {
    expect(new Set(dishes.map((d) => d.id)).size).toBe(dishes.length);
  });

  test('has at least the 16 prototype dishes', () => {
    expect(dishes.length).toBeGreaterThanOrEqual(PROTOTYPE_DISH_COUNT);
  });

  test('covers every cuisine', () => {
    const covered = new Set(dishes.map((d) => d.cuisine));
    for (const cuisine of CUISINES) expect(covered).toContain(cuisine);
  });

  test.each(dishes.map((d) => [d.id, d] as const))('%s is complete', (_id, dish) => {
    expect(dish.steps.length).toBeGreaterThanOrEqual(3);
    expect(dish.steps.length).toBeLessThanOrEqual(dish.format === 'plate' ? 7 : 5);
    expect(dish.tip.length).toBeGreaterThan(0);
    for (const category of CATEGORIES) {
      expect(dish.defaults[category].length).toBeGreaterThan(0);
      expect(dish.wants[category].length).toBeGreaterThan(0);
    }
  });
});

describe('steps read right for any item (PRD section 11: plain steps)', () => {
  const added = dishes.slice(PROTOTYPE_DISH_COUNT).map((d) => [d.id, d] as const);

  // `{p}` can be "chicken thighs", "beans" or "shrimp and tofu", so a step cannot say what it
  // "is" or "starts", and "it" has no single thing to point at.
  test.each(added)('%s: no verb or pronoun depends on an item being singular', (_id, dish) => {
    for (const step of dish.steps) {
      expect(step).not.toMatch(/\{(p|v|s|spice|sauce)\} (is|are|was|were|starts|has|have)\b/);
      expect(step).not.toMatch(/\b(set|brown|put|take) it\b/);
    }
  });
});

describe('every dish can be reached', () => {
  const all = dishes.map((d) => [d.id, d] as const);

  test.each(all)('%s: what the chef adds fits the dish', (_id, dish) => {
    for (const category of CATEGORIES) {
      const tags = tagsFor(category, dish.defaults[category]);
      expect(tags.some((tag) => dish.wants[category].includes(tag))).toBe(true);
    }
  });

  // A dish that never comes up is dead weight. Cooking its own defaults is the plainest pot
  // that should bring it up, so this fails when a new dish is outscored by an older one.
  test.each(all)('%s: is offered for a pot of its own defaults', (_id, dish) => {
    const pot = CATEGORIES.map((category) => [category, dish.defaults[category]] as const);
    const result = must(cook(potOf(pot), dishes));
    expect(result.results.map((r) => r.dish.id)).toContain(dish.id);
  });
});

describe('food safety wording (PRD section 11)', () => {
  // The prototype's 16 dishes predate this rule and are still waiting for their content review.
  const added = dishes.slice(PROTOTYPE_DISH_COUNT).map((d) => [d.id, d] as const);
  const NEEDS_TEMPERATURE = [
    'chicken',
    'turkey',
    'pork',
    'sausage',
    'beef',
    'steak',
    'lamb',
    'fish',
  ];

  test.each(added)('%s says how to tell raw meat, fish and shrimp are done', (_id, dish) => {
    // A step can name the temperature itself, or ask the engine for it with {doneness}.
    const steps = dish.steps.join(' ');
    const asks = steps.includes('{doneness}');
    if (dish.wants.protein.some((tag) => NEEDS_TEMPERATURE.includes(tag))) {
      expect(asks || /\d+°F \/ \d+°C/.test(steps)).toBe(true);
    }
    if (dish.wants.protein.includes('shrimp')) expect(asks || /opaque/.test(steps)).toBe(true);
  });

  // The test that matters for {doneness}: cook each dish with one protein at a time, as the app
  // would, and read what the step says (docs/decisions/0009).
  const SAMPLES: [name: string, expected: string][] = [
    ['Chicken breast', '165°F / 74°C'],
    ['Turkey', '165°F / 74°C'],
    ['Italian sausage', '165°F / 74°C'],
    ['Ground beef', '160°F / 71°C'],
    ['Ground pork', '160°F / 71°C'],
    ['Ground lamb', '160°F / 71°C'],
    ['Pork chops', '145°F / 63°C'],
    ['Lamb chops', '145°F / 63°C'],
    ['Brisket', '145°F / 63°C'],
    ['Salmon', '145°F / 63°C'],
    ['Shrimp', 'pink and opaque'],
    ['Steak', 'cooked through'],
    ['Black beans', 'heated through'],
  ];
  const asking = dishes.filter((d) => d.steps.some((s) => s.includes('{doneness}')));

  test('some dishes use {doneness}', () => {
    expect(asking.length).toBeGreaterThanOrEqual(10);
  });

  test.each(asking.map((d) => [d.id, d] as const))(
    '%s names the right temperature for each protein it takes',
    (_id, dish) => {
      let checked = 0;
      for (const [name, expected] of SAMPLES) {
        const item = { name, category: 'protein' as const, tags: tagsFor('protein', name) };
        if (!item.tags.some((tag) => dish.wants.protein.includes(tag))) continue;
        const card = buildResult(evaluateDish(dish, [item], 0));
        expect(card.used.map((i) => i.name)).toContain(name);
        expect(card.steps.join(' ')).toContain(expected);
        checked++;
      }
      expect(checked).toBeGreaterThan(0);
    },
  );

  // Dishes that take only a whole-cut steak are where doneness matters (docs/decisions/0007).
  const steakCuts = dishes
    .filter((d) => d.wants.protein.length === 1 && d.wants.protein[0] === 'steak')
    .map((d) => [d.id, d] as const);

  test('there are steak-cut dishes', () => {
    expect(steakCuts.length).toBeGreaterThanOrEqual(3);
  });

  test.each(steakCuts)('%s gives the USDA minimum and a rest for steak', (_id, dish) => {
    const steps = dish.steps.join(' ');
    expect(steps).toContain('145°F / 63°C');
    expect(steps).toMatch(/\brest/i);
    expect(steps).toMatch(/lower doneness|choice/i);
  });

  // Beef can be ground or a steak, and a fixed step cannot tell which it will meet. So a dish that
  // takes beef either says "any meat" or "at least 165°F" (safe for both), or gives the ground and
  // whole-cut temperatures (docs/decisions/0008).
  const takesBeef = added.filter(
    ([, d]) => d.wants.protein.includes('beef') && !steakCuts.some(([id]) => id === d.id),
  );

  test.each(takesBeef)('%s is safe for ground beef and for steak', (_id, dish) => {
    const steps = dish.steps.join(' ');
    const blanket = /any meat|at least 165°F|\{doneness\}/.test(steps);
    const both = /ground/.test(steps) && /160°F \/ 71°C/.test(steps) && /145°F \/ 63°C/.test(steps);
    expect(blanket || both).toBe(true);
  });

  test.each(dishes.map((d) => [d.id, d] as const))(
    '%s: every temperature is the same in °F and °C',
    (_id, dish) => {
      for (const [, f, c] of dish.steps.join(' ').matchAll(/(\d+)°F \/ (\d+)°C/g)) {
        expect(Math.round(((Number(f) - 32) * 5) / 9)).toBe(Number(c));
      }
    },
  );
});
