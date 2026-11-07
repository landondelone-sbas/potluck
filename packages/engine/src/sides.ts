import { joinAnd } from './text';

/** The least a side needs to be told how to cook: its name and the engine's tags for it. */
export interface SideItem {
  name: string;
  tags: readonly string[];
}

export type SideCategory = 'veg' | 'starch';

/**
 * One plain sentence for each kind of side. A plated dish ("a protein and two sides") does not know
 * which vegetable or starch the cook will pick, so its steps use `{veg_how}` and `{starch_how}` and
 * these say how to cook whatever it turned out to be. The first tag that has a method wins, so the
 * order matters: a sweet potato is also a `potato`.
 */
const METHODS: Readonly<Record<SideCategory, readonly (readonly [tag: string, method: string])[]>> =
  {
    veg: [
      ['greens', 'Wilt the {name} in a hot pan with a little oil until just soft.'],
      ['cucumber', 'Slice the {name} and dress it with a little salt, oil and lemon.'],
      ['avocado', 'Slice the {name} and dress it with a little salt, oil and lemon.'],
      ['cabbage', 'Shred the {name} and sauté it in a hot pan until just tender.'],
      ['corn', 'Cook the {name} in a hot pan, or boil it, until tender and lightly browned.'],
    ],
    starch: [
      [
        'bakingpotato',
        'Scrub the {name}, prick with a fork, and bake at 425°F (220°C) until soft, 45 to 60 minutes.',
      ],
      [
        'sweetpotato',
        'Cut the {name} into chunks and roast at 425°F (220°C) until fork-tender, about 30 minutes.',
      ],
      [
        'potato',
        'Cut the {name} into chunks and roast at 425°F (220°C) until golden and fork-tender, about 30 minutes.',
      ],
      // Noodles come before rice: a rice noodle is both, and it is boiled, not fluffed.
      ['pasta', 'Boil the {name} in well-salted water until just tender, then drain.'],
      ['noodles', 'Boil the {name} in well-salted water until just tender, then drain.'],
      [
        'rice',
        'Cook the {name} in water following the package directions, then fluff it with a fork.',
      ],
      [
        'quinoa',
        'Cook the {name} in water following the package directions, then fluff it with a fork.',
      ],
      [
        'couscous',
        'Cook the {name} in water following the package directions, then fluff it with a fork.',
      ],
      [
        'grits',
        'Cook the {name} in simmering water or broth, stirring often, until thick and creamy.',
      ],
      ['plantain', 'Slice the {name} and pan-fry it until golden and soft.'],
      ['tortilla', 'Warm the {name} in a dry pan until soft and pliable.'],
      ['bread', 'Warm or toast the {name}.'],
    ],
  };

/** Roast: what most vegetables want. */
const DEFAULT_VEG =
  'Toss the {name} with oil and salt and roast at 425°F (220°C) until tender and browned at the edges, about 15 to 25 minutes.';
/** An item the engine has no method for: say so plainly rather than guess. */
const DEFAULT_STARCH = 'Prepare the {name} the way you like it.';

function templateFor(category: SideCategory, item: SideItem): string {
  for (const [tag, method] of METHODS[category]) {
    if (item.tags.includes(tag)) return method;
  }
  return category === 'veg' ? DEFAULT_VEG : DEFAULT_STARCH;
}

/**
 * How to cook the sides in this category: one sentence for each item, in order. Two items that need
 * the same method share one sentence ("Boil the penne and spaghetti ...").
 */
export function howToCook(category: SideCategory, items: readonly SideItem[]): string {
  const byTemplate = new Map<string, string[]>();
  for (const item of items) {
    const template = templateFor(category, item);
    byTemplate.set(template, [...(byTemplate.get(template) ?? []), item.name.toLowerCase()]);
  }
  return [...byTemplate.entries()]
    .map(([template, names]) => template.replace('{name}', joinAnd(names)))
    .join(' ');
}
