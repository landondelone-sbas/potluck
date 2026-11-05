import { CATEGORIES, type Category } from '@potluck/engine';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORY_LABELS, strings } from '@/content/strings';
import { categoryColor, minTouchTarget, radius, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTextScale } from '@/theme/use-text-scale';
import { useTheme } from '@/theme/use-theme';

interface CategoryStripProps {
  selected: Category;
  /** How many of each category are in the pot (PAN-1). */
  counts: Readonly<Record<Category, number>>;
  onSelect: (category: Category) => void;
}

/** The five categories in a fixed order, with a badge for how many are in the pot. */
export function CategoryStrip({ selected, counts, onSelect }: CategoryStripProps) {
  const { scheme, colors } = useTheme();
  const textScale = useTextScale();

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={strings.pot.categoryStrip}
      style={styles.row}
    >
      {CATEGORIES.map((category) => {
        const isSelected = category === selected;
        const accent = categoryColor(scheme, category);
        const count = counts[category];
        return (
          <Pressable
            key={category}
            accessibilityLabel={strings.pot.badge(CATEGORY_LABELS[category], count)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(category)}
            style={[
              styles.tab,
              {
                flexBasis: Math.round(TAB_MIN_WIDTH * textScale),
                backgroundColor: colors.surface2,
                borderColor: isSelected ? accent : 'transparent',
              },
            ]}
            testID={`category-${category}`}
          >
            <View style={[styles.dot, { backgroundColor: accent }]} />
            <Text style={[type.smallStrong, { color: isSelected ? colors.ink : colors.ink2 }]}>
              {CATEGORY_LABELS[category]}
            </Text>
            {count > 0 ? (
              <View style={[styles.badge, { backgroundColor: colors.ink, borderColor: accent }]}>
                <Text style={[styles.badgeText, { color: colors.bg }]}>{count}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** Narrowest a tab goes at normal text. Tabs wrap onto a second row when enlarged text needs more. */
const TAB_MIN_WIDTH = 60;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  tab: {
    flexGrow: 1,
    flexShrink: 0,
    minHeight: minTouchTarget + 8,
    borderWidth: 2,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: space.xs,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
});
