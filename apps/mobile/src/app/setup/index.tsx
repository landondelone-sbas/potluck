import { CATEGORIES } from '@potluck/engine';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { strings } from '@/content/strings';
import { categoryColor, radius, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scheme, colors } = useTheme();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.bg,
          paddingTop: insets.top + space.xl,
          paddingBottom: insets.bottom + space.lg,
        },
      ]}
    >
      <View style={styles.copy}>
        <View aria-hidden style={styles.dots}>
          {CATEGORIES.map((category) => (
            <View
              key={category}
              style={[styles.dot, { backgroundColor: categoryColor(scheme, category) }]}
            />
          ))}
        </View>
        <Text accessibilityRole="header" style={[type.display, { color: colors.ink }]}>
          {strings.welcome.title}
        </Text>
        <Text style={[type.body, { color: colors.ink }]}>{strings.welcome.body}</Text>
        <Text style={[type.small, { color: colors.ink2 }]}>{strings.welcome.note}</Text>
      </View>
      <Button
        label={strings.welcome.start}
        onPress={() => router.push('/setup/protein')}
        testID="get-started"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: space.lg, justifyContent: 'space-between' },
  copy: { gap: space.md },
  dots: { flexDirection: 'row', gap: space.sm },
  dot: { width: 16, height: 16, borderRadius: radius.pill },
});
