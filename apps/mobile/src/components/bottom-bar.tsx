import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { strings } from '@/content/strings';
import { space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

import { Button } from './button';

interface BottomBarProps {
  count: number;
  cooking: boolean;
  onEmpty: () => void;
  onCook: () => void;
}

/** The item count, Empty and Cook it up (PRD section 12.1). Sits under the pantry. */
export function BottomBar({ count, cooking, onEmpty, onCook }: BottomBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          paddingBottom: Math.max(insets.bottom, space.sm),
        },
      ]}
    >
      <Text style={[type.bodyStrong, styles.count, { color: colors.ink }]}>
        {strings.pot.count(count)}
      </Text>
      <Button
        accessibilityLabel={strings.pot.emptyLabel}
        disabled={cooking || count === 0}
        label={strings.pot.empty}
        onPress={onEmpty}
        testID="empty-pot"
        variant="quiet"
      />
      <Button
        disabled={cooking}
        label={cooking ? strings.pot.simmering : strings.pot.cook}
        onPress={onCook}
        testID="cook"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    borderTopWidth: 1,
  },
  count: { flexGrow: 1, flexBasis: 100 },
});
