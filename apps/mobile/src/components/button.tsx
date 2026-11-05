import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { minTouchTarget, radius, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  /** `primary` is the one main action on a screen. `quiet` is everything else. */
  variant?: 'primary' | 'quiet';
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const primary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        primary
          ? { backgroundColor: colors.pot, borderBottomWidth: 3, borderBottomColor: colors.potLo }
          : { borderWidth: 1.5, borderColor: colors.line },
        { opacity: disabled ? 0.6 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <Text style={[type.button, { color: primary ? colors.onPot : colors.ink2 }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: minTouchTarget,
    minWidth: minTouchTarget,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
