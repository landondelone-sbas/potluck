import type { TextStyle } from 'react-native';

import { fonts } from './fonts';
import { fontSize } from './tokens';

/**
 * Text styles. Colors are applied where the text is used, so a style works in light and dark.
 * No `fontWeight` here: each weight is its own font family (see fonts.ts).
 */
export const type = {
  display: { fontFamily: fonts.display, fontSize: fontSize.display, lineHeight: 36 },
  title: { fontFamily: fonts.display, fontSize: fontSize.title, lineHeight: 28 },
  heading: { fontFamily: fonts.bold, fontSize: fontSize.bodyLarge, lineHeight: 24 },
  body: { fontFamily: fonts.body, fontSize: fontSize.body, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: fontSize.body, lineHeight: 22 },
  small: { fontFamily: fonts.body, fontSize: fontSize.small, lineHeight: 18 },
  smallStrong: { fontFamily: fonts.semibold, fontSize: fontSize.small, lineHeight: 18 },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: fontSize.caption,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  button: { fontFamily: fonts.bold, fontSize: fontSize.body, lineHeight: 20 },
} as const satisfies Record<string, TextStyle>;
