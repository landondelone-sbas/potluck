import type { Category } from '@potluck/engine';
import { Pressable, StyleSheet, Text } from 'react-native';

import { iconFor } from '@/domain/icons';
import { categoryColor, minTouchTarget, radius, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

interface SuggestionTileProps {
  category: Category;
  name: string;
  selected: boolean;
  onPress: () => void;
}

/** A setup suggestion. Tapping toggles it on or off (ONB-2). */
export function SuggestionTile({ category, name, selected, onPress }: SuggestionTileProps) {
  const { scheme, colors } = useTheme();
  const accent = categoryColor(scheme, category);

  return (
    <Pressable
      accessibilityLabel={name}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        {
          borderColor: accent,
          backgroundColor: selected ? `${accent}26` : colors.surface,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      testID={`suggestion-${name}`}
    >
      <Text allowFontScaling={false} style={styles.emoji}>
        {iconFor(category, name)}
      </Text>
      <Text style={[type.bodyStrong, { color: colors.ink }]}>{name}</Text>
      {selected ? <Text style={[styles.check, { color: accent }]}>✓</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: minTouchTarget,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingVertical: space.xs,
    paddingHorizontal: space.md,
  },
  emoji: { fontSize: 20 },
  check: { fontSize: 16, fontWeight: '700' },
});
