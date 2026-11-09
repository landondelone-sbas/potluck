import { Image, StyleSheet } from 'react-native';

import { strings } from '@/content/strings';
import { useTheme } from '@/theme/use-theme';

const LIGHT = require('../../assets/images/header-logo.png') as number;
const DARK = require('../../assets/images/header-logo-dark.png') as number;

/** The pot and wordmark in the pot screen's header: dark lettering in light mode, cream in dark. */
export function HeaderLogo() {
  const { scheme } = useTheme();
  return (
    <Image
      accessibilityLabel={strings.appName}
      accessibilityRole="header"
      resizeMode="contain"
      source={scheme === 'dark' ? DARK : LIGHT}
      style={styles.logo}
    />
  );
}

const styles = StyleSheet.create({
  logo: { height: 46, width: 152 },
});
