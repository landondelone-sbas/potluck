import { useColorScheme } from 'react-native';

import { usePotluck } from '@/state/store';

import { colors, type ThemeName } from './tokens';

/**
 * Colors for the look the user chose in Settings (SET-1): light, dark, or follow the phone. The
 * choice is read from the saved settings here, not only from the phone's own override, because the
 * browser build has no override to set. On a phone the override is also set (see the root layout),
 * so the header and keyboard agree with the screens.
 */
export function useTheme() {
  const system = useColorScheme();
  const appearance = usePotluck((s) => s.appearance);
  const scheme: ThemeName =
    appearance === 'system' ? (system === 'dark' ? 'dark' : 'light') : appearance;
  return { scheme, colors: colors[scheme] };
}
