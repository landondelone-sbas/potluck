import type { Category } from './categories';
import { donenessFor } from './doneness';
import { howToCook } from './sides';
import { joinAnd, titleCase } from './text';
import type { Amount } from './amounts';
import type { Dish, DishResult, PotItem } from './types';

/** The id every freestyle card has. It is not in the library: it is made from the pot. */
export const FREESTYLE_ID = 'freestyle';

const STEAK_SAFETY =
  'The USDA safe minimum for steak is 145°F / 63°C. A lower doneness is your choice and carries more risk.';

/** How to cook a protein, by its tag. The first tag with a method wins. `{n}` is the name(s). */
const PROTEIN_METHODS: readonly (readonly [tag: string, method: string, minutes: number])[] = [
  [
    'steak',
    'Pat the {n} dry, season with salt, and sear in a very hot oiled pan 3 to 4 minutes a side. Check the thickest part with a thermometer. ' +
      STEAK_SAFETY +
      ' Rest 5 minutes, then slice against the grain.',
    20,
  ],
  ['ground', 'Brown the {n} in a hot pan, breaking it up, until {doneness}.', 12],
  [
    'shrimp',
    'Pat the {n} dry, season with salt, and cook in a hot oiled skillet about 2 minutes a side, until {doneness}. Each shrimp curls into a loose "C" when done; a tight "O" means it is overcooked.',
    5,
  ],
  [
    'fish',
    'Season the {n} and pan-sear 3 to 4 minutes a side, or bake at 400°F (204°C) for about 10 minutes per inch of thickness, until it flakes easily and is {doneness}.',
    12,
  ],
  [
    'egg',
    'Beat the {n} with a pinch of salt and scramble in a lightly oiled pan over gentle medium-low heat until {doneness}.',
    5,
  ],
  [
    'tofu',
    'Press the {n} between towels under a weight for 15 minutes, cube it and dust with cornstarch, then pan-fry in hot oil, turning, 8 to 10 minutes until golden.',
    15,
  ],
  [
    'beans',
    'Drain and rinse the {n}, then warm through in the pan. This assumes canned beans; dried beans need soaking and boiling first.',
    5,
  ],
  ['sausage', 'Slice the {n} and brown in a skillet 5 to 6 minutes, until {doneness}.', 12],
  [
    'roast',
    'Season the {n} and sear on all sides in a heavy ovenproof pot. Add a cup of water or stock, cover, and cook in a 325°F (160°C) oven about 2 hours, until fork-tender (about 195°F / 91°C to 205°F / 96°C inside). It is safe once {doneness}, and well past that by then.',
    150,
  ],
];

/** Chicken, turkey, pork, lamb, beef cuts and anything else the engine knows: sear in pieces. */
const POULTRY_METHOD =
  'Pat the {n} dry with paper towels (do not rinse raw poultry), cut into bite-size pieces, season with salt, and cook in a hot oiled skillet until browned and {doneness}. Bone-in pieces take longer, so roast them at 425°F (220°C) for 35 to 45 minutes instead.';
const PIECES_METHOD =
  'Cut the {n} into bite-size pieces, season with salt, and cook in a hot oiled skillet until browned and {doneness}. Bone-in pieces take longer, so roast them at 425°F (220°C) for 35 to 45 minutes instead.';
const UNKNOWN_PROTEIN_METHOD =
  'Cook the {n} in a hot oiled pan until it is cooked through and piping hot.';

/** Vegetables, by how they cook on the stove. */
const GREENS = new Set(['greens']);
const RAW = new Set(['cucumber', 'avocado']);
const ROOTS = new Set(['carrot']);
const QUICK = new Set([
  'broccoli',
  'pepper',
  'tomato',
  'onion',
  'mushroom',
  'zucchini',
  'cabbage',
  'corn',
  'cauliflower',
  'asparagus',
  'greenbeans',
  'celery',
  'okra',
  'eggplant',
]);

const OVER = new Set(['rice', 'noodles', 'pasta', 'quinoa', 'couscous', 'grits']);

/** Starch time on its own, in minutes, by tag. */
const STARCH_MINUTES: readonly (readonly [string, number])[] = [
  ['bakingpotato', 60],
  ['sweetpotato', 35],
  ['potato', 35],
  ['rice', 25],
  ['quinoa', 20],
  ['couscous', 10],
  ['grits', 20],
  ['pasta', 15],
  ['noodles', 15],
  ['plantain', 10],
  ['tortilla', 5],
  ['bread', 5],
];

function group<T>(items: readonly T[], keyOf: (item: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>();
  for (const item of items) out.set(keyOf(item), [...(out.get(keyOf(item)) ?? []), item]);
  return out;
}

const lower = (item: PotItem) => item.name.toLowerCase();

function proteinMethod(item: PotItem): readonly [method: string, minutes: number] {
  for (const [tag, method, minutes] of PROTEIN_METHODS) {
    if (item.tags.includes(tag)) return [method, minutes];
  }
  if (item.tags.includes('chicken') || item.tags.includes('turkey')) return [POULTRY_METHOD, 25];
  return item.tags.length > 0 ? [PIECES_METHOD, 25] : [UNKNOWN_PROTEIN_METHOD, 20];
}

function amountFor(category: Category, items: readonly PotItem[]): Amount {
  const tags = items.flatMap((i) => i.tags);
  switch (category) {
    case 'protein':
      if (tags.includes('egg')) return { qty: 4, unit: 'n' };
      if (tags.includes('tofu')) return { qty: 400, unit: 'g' };
      if (tags.includes('beans')) return { qty: 240, unit: 'g' };
      if (tags.includes('roast')) return { qty: 700, unit: 'g' };
      return { qty: 340, unit: 'g' };
    case 'veg':
      return { qty: 250, unit: 'g' };
    case 'starch':
      if (tags.includes('tortilla') || tags.includes('bread')) return { qty: 4, unit: 'n' };
      if (tags.includes('potato') || tags.includes('sweetpotato')) return { qty: 450, unit: 'g' };
      if (tags.includes('pasta') || tags.includes('noodles')) return { qty: 200, unit: 'g' };
      return { qty: 150, unit: 'g' };
    case 'spice':
      return { qty: 5, unit: 'ml' };
    case 'sauce':
      return { qty: 30, unit: 'ml' };
  }
}

/**
 * A dinner made from exactly what is in the pot, whether or not any dish in the library fits it
 * (ADR 0016). It never leaves an item out. The steps come from how each kind of item is cooked, with
 * the same safe temperatures as every other card. Returns null when the pot has no protein, no
 * vegetable and no starch to cook (only a spice or a sauce).
 */
export function freestyle(pot: readonly PotItem[]): DishResult | null {
  const by = (category: Category) => pot.filter((item) => item.category === category);
  const proteins = by('protein');
  const vegs = by('veg');
  const starches = by('starch');
  const spices = by('spice');
  const sauces = by('sauce');
  if (proteins.length === 0 && vegs.length === 0 && starches.length === 0) return null;

  const roast = proteins.some((p) => p.tags.includes('roast'));
  const steps: string[] = [];

  if (starches.length > 0 && !roast) {
    steps.push(howToCook('starch', starches));
  }

  // Proteins: one sentence per method, so the shrimp and the sausage are each cooked right. A protein
  // that cooks in a few minutes (shrimp, eggs, beans) goes in after the vegetables, so it is not
  // left to overcook while they finish. A slower one goes first.
  const methods = group(proteins, (p) => proteinMethod(p)[0]);
  let proteinMinutes = 0;
  const slow: string[] = [];
  const fast: string[] = [];
  for (const [method, items] of methods) {
    const minutes = proteinMethod(items[0]!)[1];
    proteinMinutes = Math.max(proteinMinutes, minutes);
    const text = method
      .replace('{n}', joinAnd(items.map(lower)))
      .replace('{doneness}', donenessFor(items));
    (minutes <= 5 ? fast : slow).push(text);
  }
  steps.push(...slow);

  // Vegetables, hardest first, greens last.
  const kind = (v: PotItem): 'raw' | 'greens' | 'roots' | 'quick' | 'other' =>
    v.tags.some((t) => GREENS.has(t))
      ? 'greens'
      : v.tags.some((t) => RAW.has(t))
        ? 'raw'
        : v.tags.some((t) => ROOTS.has(t))
          ? 'roots'
          : v.tags.some((t) => QUICK.has(t))
            ? 'quick'
            : 'other';
  const vegByKind = group(vegs, kind);
  const names = (key: string) => joinAnd((vegByKind.get(key) ?? []).map(lower));
  const cooked = vegByKind.has('roots') || vegByKind.has('quick') || vegByKind.has('other');
  if (roast) {
    steps.push(...fast);
    if (vegs.length > 0) {
      steps.push(`Add the ${joinAnd(vegs.map(lower))} to the pot for the last hour.`);
    }
  } else {
    if (vegByKind.has('roots')) {
      steps.push(
        `Slice the ${names('roots')} thin and sauté in the same pan with a splash of water, 8 to 10 minutes, until tender.`,
      );
    }
    if (vegByKind.has('quick')) {
      steps.push(
        `Sauté the ${names('quick')} in the same pan with a little oil, 5 to 8 minutes, until tender-crisp.`,
      );
    }
    if (vegByKind.has('other')) {
      steps.push(`Slice the ${names('other')} and sauté in the same pan until tender.`);
    }
    // The quick proteins cook in the same pan, with the vegetables pushed to one side.
    for (const text of fast)
      steps.push(cooked ? `Push the vegetables to one side of the pan. ${text}` : text);
    if (vegByKind.has('greens')) {
      steps.push(
        `Stir in the ${names('greens')} at the end and cook about 1 minute, until just wilted.`,
      );
    }
    if (vegByKind.has('raw')) {
      steps.push(`Slice the ${names('raw')} and serve fresh on the side.`);
    }
  }

  // Seasoning and sauce.
  steps.push(
    spices.length > 0
      ? `Season everything with the ${joinAnd(spices.map(lower))}, a little at a time, and taste.`
      : 'Season with salt, pepper and a squeeze of lemon, and taste.',
  );
  steps.push(
    sauces.length > 0
      ? `Finish with the ${joinAnd(sauces.map(lower))}, tossed through or spooned over.`
      : 'Finish with a drizzle of olive oil, or a splash of broth to make a little sauce.',
  );

  // Serve.
  const mains = [...proteins, ...vegs].map(lower);
  const starchNames = starches.map(lower);
  const over = starches.every((s) => s.tags.some((t) => OVER.has(t)));
  const servedWith =
    starches.length === 0
      ? 'Serve together on a plate.'
      : `Serve the ${joinAnd(mains)} ${over ? 'over' : 'with'} the ${joinAnd(starchNames)}.`;
  steps.push(mains.length > 0 ? servedWith : `Serve the ${joinAnd(starchNames)} warm.`);

  // Title.
  const meat = joinAnd(proteins.map((p) => titleCase(p.name)));
  const veg = joinAnd(vegs.map((v) => titleCase(v.name)));
  const starch = joinAnd(starches.map((s) => titleCase(s.name)));
  const front = [meat && (veg ? `${meat} with ${veg}` : meat), !meat && veg]
    .filter(Boolean)
    .join('');
  // "Eggs with Spinach and Sourdough", never "Eggs with Spinach with Sourdough".
  const joiner = over ? 'over' : front.includes(' with ') ? 'and' : 'with';
  const title = starch ? (front ? `${front} ${joiner} ${starch}` : starch) : front;

  // Time.
  const starchMinutes = Math.max(
    0,
    ...starches.map((s) => STARCH_MINUTES.find(([tag]) => s.tags.includes(tag))?.[1] ?? 20),
  );
  const cookMinutes =
    (proteins.length > 0 ? proteinMinutes : 0) + (vegs.length > 0 && !roast ? 10 : 0);
  const minutes = roast
    ? 150
    : Math.max(10, Math.ceil((Math.max(starchMinutes, cookMinutes) + 5) / 5) * 5);

  const perCategory = <T>(f: (category: Category) => T): Record<Category, T> => ({
    protein: f('protein'),
    veg: f('veg'),
    spice: f('spice'),
    sauce: f('sauce'),
    starch: f('starch'),
  });
  const amounts = perCategory((c) => amountFor(c, by(c)));
  const dish: Dish = {
    id: FREESTYLE_ID,
    cuisine: 'comfort',
    format: 'plate',
    title,
    minutes,
    feel: 'Freestyle',
    wants: perCategory((c) => [...new Set(by(c).flatMap((i) => i.tags))]),
    signature: [],
    defaults: perCategory((c) => by(c)[0]?.name.toLowerCase() ?? ''),
    amounts,
    steps,
    tip:
      proteins.length === 0
        ? 'Add an egg, beans or tofu to make it a full meal.'
        : vegs.length === 0
          ? 'Add a vegetable to fill half the plate.'
          : 'Fill half the plate with the vegetables, and keep the protein to a palm-size portion.',
  };

  return {
    dish,
    score: 0,
    used: [...pot],
    leftOut: [],
    chefAdds: [],
    title,
    steps,
    freestyle: true,
  };
}
