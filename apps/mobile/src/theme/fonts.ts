/**
 * Fonts, from prototype v1: Bricolage Grotesque for display, Figtree for body and controls.
 *
 * Each weight is required by its own file, not through the package index: the index requires every
 * weight and Metro would bundle all of them. Android picks a font by family name, so each weight
 * has its own family name and `fontWeight` is never set alongside these.
 */
export const fontAssets = {
  BricolageGrotesque_700Bold: require('@expo-google-fonts/bricolage-grotesque/700Bold/BricolageGrotesque_700Bold.ttf'),
  Figtree_400Regular: require('@expo-google-fonts/figtree/400Regular/Figtree_400Regular.ttf'),
  Figtree_600SemiBold: require('@expo-google-fonts/figtree/600SemiBold/Figtree_600SemiBold.ttf'),
  Figtree_700Bold: require('@expo-google-fonts/figtree/700Bold/Figtree_700Bold.ttf'),
} as const;

export const fonts = {
  display: 'BricolageGrotesque_700Bold',
  body: 'Figtree_400Regular',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
} as const;
