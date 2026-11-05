import type { Category } from '@potluck/engine';

/**
 * Newest Unicode Emoji version we rely on. PRD section 12.6: use emoji only where they render on
 * the oldest supported OS, otherwise fall back to a category icon. Android 8.0 (API 26) shows
 * Emoji 5.0; iOS 16 shows far newer. Raise this when the minimum Android version rises, and the
 * rules below that need it switch on by themselves. Confirm the Android mapping on a real device.
 */
export const MAX_EMOJI_VERSION = 5;

interface IconRule {
  pattern: RegExp;
  emoji: string;
  /** Unicode Emoji version that introduced this emoji. */
  since: number;
}

export const ICON_RULES: Readonly<Record<Category, readonly IconRule[]>> = {
  protein: [
    { pattern: /chicken|wings?/, emoji: '🍗', since: 1 },
    {
      pattern:
        /beef|steak|ribeye|sirloin|filet mignon|flank|skirt|porterhouse|t-bone|tri-tip|ny strip|pork|lamb|brisket|burger|\bham\b/,
      emoji: '🥩',
      since: 3,
    },
    { pattern: /bacon/, emoji: '🥓', since: 3 },
    { pattern: /sausage|hot dog|chorizo/, emoji: '🌭', since: 1 },
    { pattern: /shrimp|prawn/, emoji: '🍤', since: 1 },
    { pattern: /salmon|tuna|fish|cod|trout|tilapia/, emoji: '🐟', since: 1 },
    { pattern: /\begg/, emoji: '🥚', since: 3 },
    { pattern: /turkey/, emoji: '🦃', since: 1 },
  ],
  veg: [
    { pattern: /broccoli/, emoji: '🥦', since: 5 },
    { pattern: /pepper/, emoji: '🫑', since: 13 },
    { pattern: /tomato/, emoji: '🍅', since: 1 },
    { pattern: /spinach|kale|greens|lettuce|cabbage|chard|arugula/, emoji: '🥬', since: 11 },
    { pattern: /mushroom/, emoji: '🍄', since: 1 },
    { pattern: /zucchini|cucumber/, emoji: '🥒', since: 3 },
    { pattern: /onion/, emoji: '🧅', since: 12 },
    { pattern: /carrot/, emoji: '🥕', since: 3 },
    { pattern: /corn/, emoji: '🌽', since: 1 },
    { pattern: /avocado/, emoji: '🥑', since: 3 },
  ],
  spice: [
    { pattern: /garlic/, emoji: '🧄', since: 12 },
    { pattern: /chili|cayenne|chipotle|jalape|flakes/, emoji: '🌶️', since: 1 },
    { pattern: /lemon|lime|citrus/, emoji: '🍋', since: 1 },
    { pattern: /herb|oregano|basil|thyme|rosemary|parsley|dill|sage/, emoji: '🌿', since: 1 },
  ],
  sauce: [
    { pattern: /tomato|marinara/, emoji: '🍅', since: 1 },
    { pattern: /peanut/, emoji: '🥜', since: 3 },
    { pattern: /honey/, emoji: '🍯', since: 1 },
    { pattern: /coconut/, emoji: '🥥', since: 5 },
    { pattern: /pesto/, emoji: '🌿', since: 1 },
    { pattern: /hot|sriracha|buffalo/, emoji: '🌶️', since: 1 },
  ],
  starch: [
    { pattern: /rice/, emoji: '🍚', since: 1 },
    { pattern: /spaghetti|pasta|penne|macaroni/, emoji: '🍝', since: 1 },
    { pattern: /noodle|ramen|udon/, emoji: '🍜', since: 1 },
    { pattern: /sweet potato|yam/, emoji: '🍠', since: 1 },
    { pattern: /potato|fries/, emoji: '🥔', since: 3 },
    { pattern: /bread|sourdough|toast|bagel|baguette/, emoji: '🍞', since: 1 },
    { pattern: /tortilla|wrap|naan|pita/, emoji: '🌮', since: 1 },
    { pattern: /quinoa|couscous|farro|barley|grain/, emoji: '🌾', since: 1 },
  ],
};

/** Shown when no rule matches. All are old enough for every supported OS. */
export const FALLBACK_ICON: Readonly<Record<Category, string>> = {
  protein: '🍖',
  veg: '🥗',
  spice: '🥄',
  sauce: '🥫',
  starch: '🌾',
};

/** The emoji to show for a favorite: the first rule that matches and renders everywhere. */
export function iconFor(category: Category, name: string): string {
  const lower = name.toLowerCase();
  const rule = ICON_RULES[category].find(
    (r) => r.since <= MAX_EMOJI_VERSION && r.pattern.test(lower),
  );
  return rule?.emoji ?? FALLBACK_ICON[category];
}
