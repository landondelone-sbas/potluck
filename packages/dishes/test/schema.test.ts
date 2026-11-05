import type { Dish } from '@potluck/engine';

import { DishSchema, dishes, parseDishes } from '../src';
import { must } from './helpers';

const valid = (): Dish => structuredClone(must(dishes[0]));

function issues(dish: unknown): string[] {
  const result = DishSchema.safeParse(dish);
  return result.success ? [] : result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
}

describe('DishSchema', () => {
  test('accepts a valid dish', () => {
    expect(issues(valid())).toEqual([]);
  });

  test('rejects a tag the engine cannot produce', () => {
    const dish = valid();
    const bad = { ...dish, wants: { ...dish.wants, protein: ['chickn'] } };
    expect(issues(bad)).toEqual(['wants.protein.0: unknown protein tag "chickn"']);
  });

  test('rejects a tag listed under the wrong category', () => {
    const dish = valid();
    const bad = { ...dish, wants: { ...dish.wants, veg: ['chicken'] } };
    expect(issues(bad)).toEqual(['wants.veg.0: unknown veg tag "chicken"']);
  });

  test('rejects duplicate tags, which would skew the specificity score', () => {
    const dish = valid();
    const bad = { ...dish, wants: { ...dish.wants, protein: ['chicken', 'chicken'] } };
    expect(issues(bad)).toEqual(['wants.protein: duplicate tags change the specificity score']);
  });

  test('rejects an unknown signature tag', () => {
    const bad = { ...valid(), signature: [{ category: 'sauce' as const, tag: 'ketchup' }] };
    expect(issues(bad)).toEqual(['signature.0.tag: unknown sauce tag "ketchup"']);
  });

  test('rejects unknown placeholders in the title and steps', () => {
    expect(issues({ ...valid(), title: '{x} Stir-Fry' })).toEqual([
      'title: unknown placeholder {x}',
    ]);
    const dish = valid();
    expect(issues({ ...dish, steps: [...dish.steps.slice(0, 2), 'Add {nope}.'] })).toEqual([
      'steps.2: unknown placeholder {nope}',
    ]);
  });

  test('rejects too few steps', () => {
    expect(issues({ ...valid(), steps: ['One.', 'Two.'] }).length).toBeGreaterThan(0);
  });

  test('rejects an unknown cuisine', () => {
    expect(issues({ ...valid(), cuisine: 'martian' }).length).toBeGreaterThan(0);
  });

  test('rejects a missing default', () => {
    const dish = valid();
    const { sauce: _sauce, ...rest } = dish.defaults;
    expect(issues({ ...dish, defaults: rest }).length).toBeGreaterThan(0);
  });

  test('rejects unknown fields', () => {
    expect(issues({ ...valid(), calories: 500 }).length).toBeGreaterThan(0);
  });

  test('rejects a bad id', () => {
    expect(issues({ ...valid(), id: 'Stir Fry' }).length).toBeGreaterThan(0);
  });
});

describe('parseDishes', () => {
  test('rejects duplicate ids', () => {
    expect(() => parseDishes([valid(), valid()])).toThrow('Duplicate dish id');
  });
});
