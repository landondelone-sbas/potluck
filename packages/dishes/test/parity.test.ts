/**
 * Parity with prototype v1.
 *
 * Runs the engine code from `prototype/v1/index.html` as an oracle and checks that the ported
 * engine gives the same answer on thousands of random pots, not just the five golden pots.
 * The prototype is frozen (tag `prototype-v1`), so this stays valid until the engine is
 * deliberately changed. When it is, retire this test and keep the golden tests.
 *
 * The library has grown past the prototype's 16 dishes (docs/decisions/0004). The oracle only knows
 * those 16, so the ported engine is compared on the first 16 dishes of the library. The newer
 * dishes are covered by `library.test.ts` and `batch-goldens.test.ts`.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

import { CATEGORIES, cook, tagsFor, type Category } from '@potluck/engine';

import { dishes } from '../src';
import { PROTOTYPE_DISH_COUNT, potOf } from './helpers';

interface ProtoItem {
  name: string;
  cat: Category;
  tags: string[];
  emoji: string;
}
interface ProtoEval {
  S: number;
  used: number;
  i: number;
  usedItems: ProtoItem[];
  left: ProtoItem[];
}
interface ProtoCard {
  title: string;
  used: ProtoItem[];
  left: ProtoItem[];
  chef: { cat: string; name: string }[];
  steps: string[];
  tip: string;
}
interface ProtoDish {
  id: string;
  cuisine: string;
  title: string;
  time: number;
  feel: string;
  wants: Record<string, string[]>;
  sig: [string, string][];
  def: Record<string, string>;
  steps: string[];
  tip: string;
}
interface Proto {
  CAT: Record<string, { i: number }>;
  CATALOG: Record<Category, string[]>;
  SEED: Record<Category, string[]>;
  DISHES: ProtoDish[];
  tagsFor(cat: Category, name: string): string[];
  evaluate(d: ProtoDish, pot: ProtoItem[], i: number): ProtoEval;
  cardData(ev: ProtoEval, pot: ProtoItem[]): ProtoCard;
  improv(pot: ProtoItem[]): string;
}

function loadPrototype(): Proto {
  const html = fs.readFileSync(path.join(__dirname, '../../../prototype/v1/index.html'), 'utf8');
  const start = html.indexOf('var tc=function');
  const end = html.indexOf('/* ---- state ---- */');
  if (start < 0 || end < 0) throw new Error('prototype engine markers not found');
  const source = `(function(){'use strict';${html.slice(start, end)}
    return {CAT,CATALOG,SEED,DISHES,tagsFor,evaluate,cardData,improv};})()`;
  return vm.runInNewContext(source, { window: {} }) as Proto;
}

const proto = loadPrototype();

/** The dishes the prototype also has. */
const prototypeLibrary = dishes.slice(0, PROTOTYPE_DISH_COUNT);

/**
 * Data fixes made to the library since v1, applied to the oracle too so this test still proves
 * the engine logic is identical. Add an entry here for every deliberate change to a v1 dish.
 *
 * - curry, stew: `potato` was listed as a veg tag. It is a starch tag, so no veg item could match
 *   it. Removing it shortens the veg list from 8 to 7, which lifts the veg specificity bonus by 1.
 */
const dropPotatoFromVeg = (d: ProtoDish) => {
  d.wants.veg = (d.wants.veg ?? []).filter((tag) => tag !== 'potato');
};
const DATA_FIXES: Record<string, (d: ProtoDish) => void> = {
  curry: dropPotatoFromVeg,
  stew: dropPotatoFromVeg,
};
for (const d of proto.DISHES) DATA_FIXES[d.id]?.(d);

/** The prototype's `compute()`, with the pot passed in instead of read from UI state. */
function oracle(spec: [Category, string][]) {
  const pot: ProtoItem[] = spec.map(([cat, name]) => ({
    name,
    cat,
    tags: proto.tagsFor(cat, name),
    emoji: '',
  }));
  pot.sort((a, b) => (proto.CAT[a.cat]?.i ?? 0) - (proto.CAT[b.cat]?.i ?? 0));
  const ranked = proto.DISHES.map((d, i) => proto.evaluate(d, pot, i)).sort(
    (a, b) => b.S - a.S || b.used - a.used || a.i - b.i,
  );
  const top = ranked[0]!;
  const close = ranked.filter((r) => r.S >= top.S * 0.88 && r.used >= top.used - 1).slice(0, 3);
  const cards = close.map((r) => proto.cardData(r, pot));
  return {
    mode: close.length === 1 ? 'single' : 'multi',
    wildcard: pot.length >= 2 ? proto.improv(pot) : null,
    cards: cards.map((c) => ({
      title: c.title,
      used: c.used.map((i) => i.name),
      left: c.left.map((i) => i.name),
      chef: c.chef.map((x) => `${x.cat}:${x.name}`),
      steps: c.steps,
      tip: c.tip,
    })),
  };
}

function ported(spec: [Category, string][]) {
  const result = cook(potOf(spec), prototypeLibrary);
  if (!result) throw new Error('empty pot');
  return {
    mode: result.mode,
    wildcard: result.wildcard,
    cards: result.results.map((r) => ({
      title: r.title,
      used: r.used.map((i) => i.name),
      left: r.leftOut.map((i) => i.name),
      chef: r.chefAdds.map((x) => `${x.category}:${x.name}`),
      steps: [...r.steps],
      tip: r.dish.tip,
    })),
  };
}

/** Small seeded generator so a failure reproduces. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Names the prototype offers, plus awkward ones: unknowns, multi-tag and clashing items. */
const EXTRAS: Record<Category, string[]> = {
  protein: [
    'Dragon fruit',
    'Hot dogs',
    'Pork chops',
    'Lamb chops',
    'Seitan',
    'Bratwurst',
    'Lentils',
  ],
  veg: ['Kohlrabi', 'Green peas', 'Cabbage', 'Celery', 'Sweet corn', 'Bok choy', 'Edamame'],
  spice: [
    'Mystery blend',
    'Garam masala',
    'Old Bay',
    'Rosemary',
    'Cayenne',
    'Lime zest',
    'Bbq rub',
  ],
  sauce: ['Grandma special', 'Buffalo sauce', 'Honey mustard', 'Tahini', 'Hoisin', 'Gochujang'],
  starch: [
    'Plantain',
    'Wild rice',
    'Sweet potato fries',
    'Orzo',
    'Pita',
    'Flour tortillas',
    'Ramen',
  ],
};

const POOLS = Object.fromEntries(
  CATEGORIES.map((c) => [c, [...new Set([...proto.CATALOG[c], ...proto.SEED[c], ...EXTRAS[c]])]]),
) as Record<Category, string[]>;

function randomPot(rand: () => number): [Category, string][] {
  const pick = <T>(list: T[]) => list[Math.floor(rand() * list.length)]!;
  const spec: [Category, string][] = [];
  for (const category of CATEGORIES) {
    const count = Math.floor(rand() * 4); // 0 to 3 per category
    const pool = [...POOLS[category]];
    for (let n = 0; n < count && pool.length > 0; n++) {
      const name = pick(pool);
      pool.splice(pool.indexOf(name), 1);
      spec.push([category, name]);
    }
  }
  // Shuffle so insertion order varies, then cap at the 12-item pot limit.
  for (let i = spec.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [spec[i], spec[j]] = [spec[j]!, spec[i]!];
  }
  return spec.slice(0, 12);
}

describe('parity with prototype v1', () => {
  test('the dish library matches the prototype dishes, in order', () => {
    expect(proto.DISHES).toHaveLength(PROTOTYPE_DISH_COUNT);
    expect(dishes.length).toBeGreaterThanOrEqual(proto.DISHES.length);
    proto.DISHES.forEach((p, i) => {
      const d = dishes[i]!;
      expect({
        id: d.id,
        cuisine: d.cuisine,
        title: d.title,
        minutes: d.minutes,
        feel: d.feel,
        steps: d.steps,
        tip: d.tip,
        sig: d.signature.map((s) => [s.category, s.tag]),
        wants: CATEGORIES.map((c) => d.wants[c]),
        defaults: CATEGORIES.map((c) => d.defaults[c]),
      }).toEqual({
        id: p.id,
        cuisine: p.cuisine,
        title: p.title,
        minutes: p.time,
        feel: p.feel,
        steps: p.steps,
        tip: p.tip,
        sig: p.sig,
        wants: CATEGORIES.map((c) => p.wants[c]),
        defaults: CATEGORIES.map((c) => p.def[c]),
      });
    });
  });

  test('tagging gives the same tags for every known and awkward name', () => {
    const mismatches: string[] = [];
    for (const category of CATEGORIES) {
      for (const name of POOLS[category]) {
        // `steak` and `ground` are tags added after v1 (docs/decisions/0007 and 0008). They never
        // change a v1 dish's score, because no v1 dish lists them, so the comparison leaves them out.
        const a = tagsFor(category, name).filter((tag) => tag !== 'steak' && tag !== 'ground');
        const b = proto.tagsFor(category, name);
        if (JSON.stringify(a) !== JSON.stringify(b)) mismatches.push(`${category}/${name}`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  test('gives the same results as the prototype on 5000 random pots', () => {
    const rand = mulberry32(20261103);
    const mismatches: unknown[] = [];
    const modes = { single: 0, multi: 0 };
    let run = 0;
    while (run < 5000) {
      const spec = randomPot(rand);
      if (spec.length === 0) continue;
      run++;
      const expected = oracle(spec);
      const actual = ported(spec);
      modes[expected.mode as 'single' | 'multi']++;
      if (JSON.stringify(expected) !== JSON.stringify(actual) && mismatches.length < 3) {
        mismatches.push({ pot: spec, expected, actual });
      }
    }
    expect(mismatches).toEqual([]);
    // The sample must exercise both outcomes, or agreement proves little.
    expect(modes.single).toBeGreaterThan(200);
    expect(modes.multi).toBeGreaterThan(200);
  });
});
