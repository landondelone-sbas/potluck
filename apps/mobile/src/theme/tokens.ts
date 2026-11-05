/**
 * Design tokens, ported from prototype v1's CSS custom properties.
 *
 * Cool stone neutrals, a cobalt enamel pot, and five cookware-glaze hues, one per food category.
 * Category color is never the only signal: labels always accompany it (PRD section 12.2).
 */
import type { Category } from '@potluck/engine';

export type ThemeName = 'light' | 'dark';

export const colors = {
  light: {
    bg: '#EDF0EF',
    surface: '#FFFFFF',
    surface2: '#E2E8E5',
    ink: '#14201D',
    ink2: '#4A5A55',
    line: '#C9D2CE',
    pot: '#2E4DB0',
    potHi: '#5878DE',
    potLo: '#1C3280',
    potText: '#2E4DB0',
    onPot: '#FFFFFF',
    broth: '#F0BB55',
    brothDeep: '#D9962B',
    brothInk: '#4A3000',
    protein: '#D9482B',
    veg: '#2F8F4E',
    starch: '#B98300',
    spice: '#B02A68',
    sauce: '#6C4FB3',
    danger: '#B3261E',
  },
  dark: {
    bg: '#0F1514',
    surface: '#171F1D',
    surface2: '#212B29',
    ink: '#E8EFEC',
    ink2: '#9FB1AB',
    line: '#2B3835',
    pot: '#4A6AD8',
    potHi: '#7C99F0',
    potLo: '#2B44A0',
    potText: '#93ABF6',
    onPot: '#FFFFFF',
    broth: '#D8A04A',
    brothDeep: '#B77A22',
    brothInk: '#2E1D00',
    protein: '#F2785C',
    veg: '#5CC07A',
    starch: '#E8B93E',
    spice: '#E0609C',
    sauce: '#A48CE6',
    danger: '#FF8A80',
  },
} as const;

export type ColorToken = keyof (typeof colors)['light'];

export function categoryColor(theme: ThemeName, category: Category): string {
  return colors[theme][category];
}

/** 4-point spacing scale. */
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 64 } as const;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

/** Type sizes in points. Text must scale with the system font size (PRD section 12.4). */
export const fontSize = {
  caption: 12,
  small: 13,
  body: 15,
  bodyLarge: 17,
  title: 22,
  display: 30,
} as const;

/** Smallest touch target: 44 pt on iOS, 48 dp on Android (PRD section 12.4). */
export const minTouchTarget = 48;
