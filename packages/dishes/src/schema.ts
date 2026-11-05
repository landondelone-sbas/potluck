import { CATEGORIES, CUISINES, TAG_VOCABULARY, type Dish } from '@potluck/engine';
import { z } from 'zod';

const CategorySchema = z.enum(CATEGORIES);

const TITLE_PLACEHOLDERS = new Set(['p', 'v']);
const STEP_PLACEHOLDERS = new Set(['p', 'v', 's', 'spice', 'sauce', 'doneness']);

function placeholdersIn(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? '');
}

/**
 * One dish file. A malformed dish fails validation, and so fails the build (PRD section 11).
 * Beyond shape, this checks that every tag is one the engine can produce, so a typo cannot
 * silently make a dish unmatchable.
 */
export const DishSchema = z
  .strictObject({
    id: z.string().regex(/^[a-z][a-z0-9-]*$/, 'lowercase letters, digits and dashes'),
    cuisine: z.enum(CUISINES),
    title: z.string().min(1),
    minutes: z.number().int().positive().max(240),
    feel: z.string().min(1),
    wants: z.record(CategorySchema, z.array(z.string().min(1)).min(1)),
    signature: z.array(z.strictObject({ category: CategorySchema, tag: z.string().min(1) })),
    defaults: z.record(CategorySchema, z.string().min(1)),
    steps: z.array(z.string().min(1)).min(3).max(5),
    tip: z.string().min(1),
  })
  .superRefine((dish, ctx) => {
    for (const category of CATEGORIES) {
      const vocabulary = TAG_VOCABULARY[category];
      const list = dish.wants[category];
      list.forEach((tag, i) => {
        if (!vocabulary.includes(tag)) {
          ctx.addIssue({
            code: 'custom',
            path: ['wants', category, i],
            message: `unknown ${category} tag "${tag}"`,
          });
        }
      });
      if (new Set(list).size !== list.length) {
        ctx.addIssue({
          code: 'custom',
          path: ['wants', category],
          message: 'duplicate tags change the specificity score',
        });
      }
    }

    dish.signature.forEach(({ category, tag }, i) => {
      if (!TAG_VOCABULARY[category].includes(tag)) {
        ctx.addIssue({
          code: 'custom',
          path: ['signature', i, 'tag'],
          message: `unknown ${category} tag "${tag}"`,
        });
      }
    });

    for (const key of placeholdersIn(dish.title)) {
      if (!TITLE_PLACEHOLDERS.has(key)) {
        ctx.addIssue({ code: 'custom', path: ['title'], message: `unknown placeholder {${key}}` });
      }
    }
    dish.steps.forEach((step, i) => {
      for (const key of placeholdersIn(step)) {
        if (!STEP_PLACEHOLDERS.has(key)) {
          ctx.addIssue({
            code: 'custom',
            path: ['steps', i],
            message: `unknown placeholder {${key}}`,
          });
        }
      }
    });
  });

/** Validate raw dish records and make sure ids are unique. Throws on the first problem. */
export function parseDishes(raw: readonly unknown[]): Dish[] {
  const dishes = z.array(DishSchema).parse(raw);
  const seen = new Set<string>();
  for (const dish of dishes) {
    if (seen.has(dish.id)) throw new Error(`Duplicate dish id "${dish.id}"`);
    seen.add(dish.id);
  }
  return dishes;
}
