import { CATEGORIES } from '@potluck/engine';

import { contrastRatio as contrast } from '@/theme/contrast';
import { colors, type ColorToken, type ThemeName } from '@/theme/tokens';

const THEMES: ThemeName[] = ['light', 'dark'];

describe('design tokens', () => {
  test('light and dark define the same tokens', () => {
    expect(Object.keys(colors.dark).sort()).toEqual(Object.keys(colors.light).sort());
  });

  test('every color is a six-digit hex value', () => {
    for (const theme of THEMES) {
      for (const value of Object.values(colors[theme])) expect(value).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  // PRD section 12.4: text contrast of at least 4.5:1 in light and dark themes.
  describe.each(THEMES)('%s theme text contrast (at least 4.5:1)', (theme) => {
    const c = colors[theme];
    const pairs: [string, ColorToken, ColorToken][] = [
      ['ink on bg', 'ink', 'bg'],
      ['ink on surface', 'ink', 'surface'],
      ['ink on surface2', 'ink', 'surface2'],
      ['ink2 on bg', 'ink2', 'bg'],
      ['ink2 on surface', 'ink2', 'surface'],
      ['ink2 on surface2', 'ink2', 'surface2'],
      ['danger on bg', 'danger', 'bg'],
      ['danger on surface', 'danger', 'surface'],
      ['potText on bg', 'potText', 'bg'],
      ['potText on surface', 'potText', 'surface'],
      ['onPot on pot', 'onPot', 'pot'],
      ['brothInk on broth', 'brothInk', 'broth'],
      // The count badge on a category tab: bg-colored text on an ink circle.
      ['badge text (bg on ink)', 'bg', 'ink'],
    ];
    test.each(pairs)('%s', (_label, fg, bg) => {
      expect(contrast(c[fg], c[bg])).toBeGreaterThanOrEqual(4.5);
    });
  });

  // Category colors mark chips and borders, not text, so the 3:1 non-text bar applies.
  describe.each(THEMES)('%s theme category colors (at least 3:1 on surface)', (theme) => {
    test.each(CATEGORIES)('%s', (category) => {
      expect(contrast(colors[theme][category], colors[theme].surface)).toBeGreaterThanOrEqual(3);
    });
  });
});
