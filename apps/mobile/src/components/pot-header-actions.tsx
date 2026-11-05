import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '@/content/strings';
import { minTouchTarget, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

/** Cook log and Settings, in the pot screen's header. */
export function PotHeaderActions() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/log')}
        style={styles.action}
        testID="open-log"
      >
        {/* Navigation chrome keeps to a limit so the title is never pushed out (still readable). */}
        <Text maxFontSizeMultiplier={1.3} style={[type.bodyStrong, { color: colors.potText }]}>
          {strings.nav.cookLog}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/settings')}
        style={styles.action}
        testID="open-settings"
      >
        <Text maxFontSizeMultiplier={1.3} style={[type.bodyStrong, { color: colors.potText }]}>
          {strings.nav.settings}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  action: {
    minHeight: minTouchTarget,
    minWidth: minTouchTarget,
    paddingHorizontal: space.sm,
    justifyContent: 'center',
  },
});
