/**
 * Every user-facing string, in one place, ready for translation (X-4). Plain and direct: controls
 * say exactly what they do (PRD section 12.5).
 */
import type { Category, PlateNudge } from '@potluck/engine';

import type { PotRejection } from '@/domain/pot';

export const CATEGORY_LABELS: Readonly<Record<Category, string>> = {
  protein: 'Protein',
  veg: 'Veg',
  spice: 'Spice',
  sauce: 'Sauce',
  starch: 'Starch',
};

/** The singular word for one item of a category, used inside sentences. */
export const CATEGORY_ONE: Readonly<Record<Category, string>> = {
  protein: 'protein',
  veg: 'vegetable',
  spice: 'spice',
  sauce: 'sauce',
  starch: 'starch',
};

/** Shown above the tile row for the selected category. */
export const CATEGORY_PROMPTS: Readonly<Record<Category, string>> = {
  protein: 'What is the star of the plate?',
  veg: 'What should fill half of it?',
  spice: 'How should it taste?',
  sauce: 'How do you want to finish it?',
  starch: 'What carries it?',
};

/** The question each setup step asks. */
export const SETUP_QUESTIONS: Readonly<Record<Category, string>> = {
  protein: 'Which proteins do you actually enjoy?',
  veg: 'Which vegetables do you actually enjoy?',
  spice: 'Which spices and seasonings do you reach for?',
  sauce: 'Which sauces do you love?',
  starch: 'Which starches do you like to build a meal on?',
};

export const strings = {
  appName: 'Tonight’s Pot',

  welcome: {
    title: 'Cook from the food you already love',
    body: 'Pick your favorites in five quick steps. After that, deciding what to eat is a mood: drop favorites in the pot and get a dish back.',
    note: 'You can skip any step and add more later.',
    start: 'Get started',
  },

  setup: {
    step: (n: number, total: number) => `Step ${n} of ${total}`,
    hint: (picked: number) =>
      `Tap everything you would happily eat. ${picked} picked so far. You can skip this category and add more later.`,
    addLabel: 'Add your own',
    addPlaceholder: (category: Category) => `Add your own ${CATEGORY_ONE[category]}`,
    addButton: 'Add',
    next: 'Next',
    skip: 'Skip',
    finish: 'Finish',
    summaryTitle: 'Your pantry is ready.',
    summaryHint: 'This is what the pot will draw from. You can add more any time from the pantry.',
    summaryNone: 'Nothing picked. The chef will choose.',
    summaryMore: (n: number) => ` and ${n} more`,
    open: 'Open the pot',
    backToPot: 'Back to the pot',
    duplicate: (name: string) => `${name} is already in your favorites.`,
  },

  pot: {
    moods: 'Mood starters',
    emptyHint: 'Drag a favorite in, or tap one.',
    potLabel: (names: string[]) =>
      names.length === 0 ? 'The pot is empty' : `The pot has ${names.join(', ')}`,
    count: (n: number) => `${n} in the pot`,
    empty: 'Empty',
    emptyLabel: 'Empty the pot',
    cook: 'Cook it up',
    simmering: 'Simmering…',
    seeResults: 'See results',
    outOfDate: 'Results are out of date',
    edit: 'Edit',
    done: 'Done',
    add: 'Add',
    noFavorites: (category: Category) =>
      `No ${CATEGORY_ONE[category]} favorites yet. Add one with the + tile.`,
    addPlaceholder: (category: Category) => `Add a favorite ${CATEGORY_ONE[category]}`,
    addFieldLabel: 'Add a favorite',
    categoryStrip: 'Food categories',
    addTileLabel: (category: Category) => `Add a favorite ${CATEGORY_ONE[category]}`,
    badge: (label: string, n: number) => (n > 0 ? `${label}, ${n} in the pot` : label),
  },

  nudge: {
    empty: 'Start anywhere. Categories you skip are left to the chef.',
    balanced: 'Balanced plate: protein, veg and starch are all in.',
    'needs-veg': 'Nudge: no vegetable yet. Aim for about half the plate.',
    'needs-base': 'Add a protein, veg or starch for sharper matches.',
    'chef-fills': 'Skipped categories are left to the chef.',
  } satisfies Record<PlateNudge, string>,

  messages: {
    rejected: (reason: PotRejection, category?: Category): string => {
      switch (reason) {
        case 'full':
          return 'The pot is full. Take something out first.';
        case 'category-full':
          return `Three ${category ? CATEGORY_LABELS[category].toLowerCase() : 'of that kind of'} picks is the limit. Take one out to swap.`;
        case 'duplicate':
          return 'Already in the pot.';
        case 'unknown':
          return 'That favorite is no longer in your pantry.';
      }
    },
    potEmpty: 'The pot is empty. Add a favorite first.',
    moodNone: 'None of those favorites are in your pantry. Add some from the pantry.',
    added: (name: string) => `Added ${name} to your favorites.`,
    duplicate: (name: string) => `${name} is already in your favorites.`,
    saved: 'Saved to your cook log.',
  },

  a11y: {
    addToPot: (name: string) => `Add ${name} to the pot`,
    removeFromPot: (name: string) => `Remove ${name} from the pot`,
    takeOut: (name: string) => `Take ${name} out of the pot`,
    addedToPot: (name: string, count: number) => `${name} added to the pot. ${count} in the pot.`,
    removedFromPot: (name: string, count: number) =>
      `${name} taken out of the pot. ${count} in the pot.`,
    potEmptied: 'The pot is empty.',
    removeFavorite: (name: string) => `Remove ${name} from favorites`,
    tileLabel: (name: string, category: string, inPot: boolean) =>
      `${name}, ${category}${inPot ? ', in the pot' : ''}`,
    tileHint: 'Double tap to add to the pot. Touch and drag up to drop it in.',
    pot: 'A cobalt enamel pot',
  },

  results: {
    title: 'Tonight’s dishes',
    legend: 'Solid: from your pot. Dashed: the chef adds it. Struck through: left out.',
    single: 'One clear winner.',
    singleBody: 'Everything in your pot points at the same dish.',
    multi: 'A few ways to go.',
    multiBody: 'Each one uses most of what you picked. Choose by mood.',
    stale:
      'The pot changed since these were made. Go back to the pot and press Cook it up to refresh.',
    backToPot: 'Back to the pot',
    uses: (used: number, total: number) => `Uses ${used} of ${total} picks`,
    howTo: 'How to make it',
    lighterTip: 'Lighter tip.',
    makeTonight: 'Make this tonight',
    makeTonightHint: 'Saves it to your cook log and opens the recipe.',
    openRecipe: 'Open the recipe',
    wildcardEyebrow: 'Chef’s wildcard · AI preview',
    wildcardBody:
      'A template for now. Later, AI writes a full recipe around your exact pot, your diet and what is in your kitchen.',
    chefAdds: 'The chef adds this',
    leftOut: 'Left out of this dish',
    noRun: 'Nothing has come out yet. Fill the pot, then press Cook it up.',
    explainChef: (name: string) => `${name}: the chef adds this.`,
    explainLeftOut: (name: string) => `${name}: left out of this dish.`,
    minutes: (n: number) => `${n} min`,
    format: { pot: 'One pot', plate: 'Protein + 2 sides' },
  },

  nav: {
    cookLog: 'Cook log',
    settings: 'Settings',
  },

  recipe: {
    title: 'Recipe',
    ingredients: 'Ingredients',
    fromPot: 'From your pot',
    chefAdds: 'The chef adds',
    staplesTitle: 'Pantry staples',
    staples: 'Oil, salt, pepper and water. These are assumed, so they never need a pick.',
    leftOut: 'Left out of this dish',
    steps: 'Steps',
    servings: 'Servings',
    servingsLabel: (count: number) => `${count} ${count === 1 ? 'serving' : 'servings'}`,
    fewer: 'Fewer servings',
    more: 'More servings',
    amountsNote: 'Amounts are a guide. Adjust to taste.',
    amountRow: (name: string, amount: string) => `${name}, ${amount}`,
    keepAwake: 'Keep the screen on while cooking',
    saved: (day: string) => `In your cook log: ${day}`,
    missing: 'This recipe is no longer in the app. Your cook log entry is kept.',
    notFound: 'That cook log entry could not be found.',
    backToLog: 'Back to the cook log',
  },

  log: {
    title: 'Cook log',
    empty: 'Nothing cooked yet. Dishes you make from the results show up here.',
    entry: (title: string, day: string, items: string) => `${title}, ${day}, ${items}`,
  },

  settings: {
    title: 'Settings',
    appearance: 'Appearance',
    appearanceOptions: {
      system: 'Match my phone',
      light: 'Light',
      dark: 'Dark',
    },
    units: 'Units',
    unitOptions: { us: 'US (oz, cups)', metric: 'Metric (g, ml)' },
    pantry: 'Pantry',
    addMore: 'Add more favorites',
    addMoreHint: 'Walk through the setup steps again. Your favorites stay.',
    about: 'About Tonight’s Pot',
    data: 'Your data',
    reset: 'Reset all data',
    resetTitle: 'Reset all data?',
    resetBody:
      'This removes your favorites, your cook log and your settings from this phone. It cannot be undone.',
    resetConfirm: 'Reset',
    cancel: 'Cancel',
  },

  about: {
    title: 'About',
    version: (version: string) => `Version ${version}`,
    tagline: 'Tonight’s Pot finds dinner from the foods you already love.',
    privacyTitle: 'Privacy',
    privacyBody: 'No account. Your favorites and your cook log stay on this phone.',
    privacyLink: 'Read the privacy policy',
    noticeTitle: 'Please note',
    notice:
      'Tonight’s Pot gives cooking ideas, not medical or dietary advice. Suggestions are not a guarantee of allergen safety. Check every ingredient yourself.',
  },
} as const;
