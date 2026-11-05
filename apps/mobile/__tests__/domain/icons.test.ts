import { CATEGORIES } from '@potluck/engine';

import { SUGGESTIONS } from '@/domain/catalog';
import { FALLBACK_ICON, ICON_RULES, MAX_EMOJI_VERSION, iconFor } from '@/domain/icons';

describe('iconFor', () => {
  test('picks the first matching rule', () => {
    expect(iconFor('protein', 'Chicken thighs')).toBe('🍗');
    expect(iconFor('starch', 'Sweet potato')).toBe('🍠');
  });

  test('falls back to the category icon for unknown foods', () => {
    expect(iconFor('veg', 'Dragon fruit')).toBe(FALLBACK_ICON.veg);
  });

  test('falls back instead of using an emoji newer than the baseline (PRD 12.6)', () => {
    // Bell pepper, onion, garlic and leafy greens all need Emoji 11 or newer.
    expect(iconFor('veg', 'Bell peppers')).toBe(FALLBACK_ICON.veg);
    expect(iconFor('veg', 'Red onion')).toBe(FALLBACK_ICON.veg);
    expect(iconFor('veg', 'Spinach')).toBe(FALLBACK_ICON.veg);
    expect(iconFor('spice', 'Garlic')).toBe(FALLBACK_ICON.spice);
  });

  test('never returns an emoji newer than the baseline, for any suggestion', () => {
    const newer = new Set(
      CATEGORIES.flatMap((c) => ICON_RULES[c].filter((r) => r.since > MAX_EMOJI_VERSION)).map(
        (r) => r.emoji,
      ),
    );
    expect(newer.size).toBeGreaterThan(0);
    for (const category of CATEGORIES) {
      for (const name of SUGGESTIONS[category]) {
        expect(newer.has(iconFor(category, name))).toBe(false);
      }
    }
  });
});
