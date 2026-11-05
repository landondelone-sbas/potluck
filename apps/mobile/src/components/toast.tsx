import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

const VISIBLE_MS = 2800;

/** A short message that clears itself. `say` also announces it to screen readers. */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const say = useCallback((text: string) => {
    setMessage(text);
    AccessibilityInfo.announceForAccessibility(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), VISIBLE_MS);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { message, say };
}

export function Toast({ message }: { message: string | null }) {
  const { colors } = useTheme();
  if (!message) return null;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[styles.toast, { backgroundColor: colors.ink }]}
      >
        <Text style={[type.smallStrong, { color: colors.bg }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: space.md,
    right: space.md,
    bottom: space.md,
    alignItems: 'center',
  },
  toast: { borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm },
});
