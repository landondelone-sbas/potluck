import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { strings } from '@/content/strings';
import { MOODS, type Mood } from '@/domain/moods';
import { minTouchTarget, radius, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

/** Mood starters (POT-7): one tap fills the pot from the user's favorites and cooks. */
export function MoodStarters({
  onPick,
  disabled,
}: {
  onPick: (mood: Mood) => void;
  disabled: boolean;
}) {
  const { colors } = useTheme();

  return (
    <ScrollView
      accessibilityLabel={strings.pot.moods}
      contentContainerStyle={styles.row}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
    >
      {MOODS.map((mood) => (
        <Pressable
          key={mood.id}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => onPick(mood)}
          style={({ pressed }) => [
            styles.pill,
            {
              backgroundColor: colors.surface,
              borderColor: colors.line,
              opacity: disabled ? 0.6 : pressed ? 0.8 : 1,
            },
          ]}
          testID={`mood-${mood.id}`}
        >
          <Text style={[type.smallStrong, { color: colors.ink }]}>{mood.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // A ScrollView grows and shrinks by default. This row should keep its own height.
  scroll: { flexGrow: 0, flexShrink: 0 },
  row: { gap: space.sm, paddingHorizontal: space.md, alignItems: 'center' },
  pill: {
    minHeight: minTouchTarget,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    justifyContent: 'center',
  },
});
