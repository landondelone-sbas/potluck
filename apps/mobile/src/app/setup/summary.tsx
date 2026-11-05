import { CATEGORIES } from '@potluck/engine';
import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { CATEGORY_LABELS, strings } from '@/content/strings';
import { usePotluck } from '@/state/store';
import { categoryColor, radius, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

const NAMES_SHOWN = 6;

/** The last setup screen: counts and names per category, then "Open the pot" (ONB-5). */
export default function SummaryScreen() {
  const insets = useSafeAreaInsets();
  const { scheme, colors } = useTheme();
  const favorites = usePotluck((s) => s.favorites);
  const completeOnboarding = usePotluck((s) => s.completeOnboarding);
  const setupReopened = usePotluck((s) => s.setupReopened);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ title: strings.setup.summaryTitle }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={[type.title, { color: colors.ink }]}>
          {strings.setup.summaryTitle}
        </Text>
        <Text style={[type.small, { color: colors.ink2 }]}>{strings.setup.summaryHint}</Text>

        {CATEGORIES.map((category) => {
          const names = favorites.filter((f) => f.category === category).map((f) => f.name);
          const shown = names.slice(0, NAMES_SHOWN).join(', ');
          const more =
            names.length > NAMES_SHOWN ? strings.setup.summaryMore(names.length - NAMES_SHOWN) : '';
          return (
            <View
              key={category}
              accessible
              style={[
                styles.row,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.line,
                  borderLeftColor: categoryColor(scheme, category),
                },
              ]}
              testID={`summary-${category}`}
            >
              <Text style={[type.heading, { color: colors.ink }]}>
                {`${CATEGORY_LABELS[category]} · ${names.length}`}
              </Text>
              <Text style={[type.small, { color: colors.ink2 }]}>
                {names.length > 0 ? `${shown}${more}` : strings.setup.summaryNone}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <Button
          label={setupReopened ? strings.setup.backToPot : strings.setup.open}
          onPress={completeOnboarding}
          testID="open-pot"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: space.md, gap: space.md },
  row: {
    borderWidth: 1,
    borderLeftWidth: 6,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.xs,
  },
  footer: { paddingHorizontal: space.md, paddingTop: space.sm },
});
