import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { iconFor } from '@/domain/icons';
import { categoryColor } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { useDrag } from './drag-context';

export const GHOST_SIZE = 48;

/**
 * Draws the item being dragged or flown above everything else. It ignores touches, so it never
 * blocks the tile that is being dragged. Fill the screen with it, inside the screen's root view.
 */
export function GhostLayer() {
  const { ghost, ghostX, ghostY, ghostOpacity, layerRef } = useDrag();
  const { scheme, colors } = useTheme();

  const style = useAnimatedStyle(() => ({
    opacity: ghostOpacity.get(),
    transform: [
      { translateX: ghostX.get() - GHOST_SIZE / 2 },
      { translateY: ghostY.get() - GHOST_SIZE / 2 },
    ],
  }));

  return (
    <View
      ref={layerRef}
      collapsable={false}
      pointerEvents="none"
      aria-hidden
      style={StyleSheet.absoluteFill}
    >
      <Animated.View
        style={[
          styles.ghost,
          {
            backgroundColor: colors.surface,
            borderColor: ghost ? categoryColor(scheme, ghost.category) : colors.line,
          },
          style,
        ]}
      >
        <Text allowFontScaling={false} style={styles.emoji}>
          {ghost ? iconFor(ghost.category, ghost.name) : ''}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  ghost: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: GHOST_SIZE,
    height: GHOST_SIZE,
    borderRadius: GHOST_SIZE / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  emoji: { fontSize: 24 },
});
