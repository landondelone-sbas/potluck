import { useColorScheme } from 'react-native';

import { colors, type ThemeName } from './tokens';

/** Colors for the current system light or dark setting. */
export function useTheme() {
  const scheme: ThemeName = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { scheme, colors: colors[scheme] };
}
