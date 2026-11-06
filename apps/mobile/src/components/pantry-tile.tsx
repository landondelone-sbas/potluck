import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

import { CATEGORY_LABELS, strings } from '@/content/strings';
import type { Favorite } from '@/domain/favorites';
import { GHOST_LIFT, isOverRect } from '@/domain/hit-test';
import { iconFor } from '@/domain/icons';
import { categoryColor, radius, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTextScale } from '@/theme/use-text-scale';
import { useTheme } from '@/theme/use-theme';

import { useDrag } from './drag/drag-context';

/** About 84 pt wide, sized for a thumb (PAN-2). */
export const TILE_WIDTH = 84;
export const TILE_HEIGHT = 96;

/** Vertical travel that starts a drag, in points. */
const DRAG_SLOP = 10;
/** Sideways travel that hands the touch to the scrolling row instead (POT-3). */
const SCROLL_SLOP = 12;

interface PantryTileProps {
  favorite: Favorite;
  inPot: boolean;
  /** Remove mode (PAN-4): a tap removes the favorite and dragging is off. */
  editing: boolean;
  /** Tap: add to the pot, or take out if it is already in. */
  onPress: () => void;
  onRemoveFavorite: () => void;
}

export function PantryTile({
  favorite,
  inPot,
  editing,
  onPress,
  onRemoveFavorite,
}: PantryTileProps) {
  const { scheme, colors } = useTheme();
  const drag = useDrag();
  const accent = categoryColor(scheme, favorite.category);
  const categoryLabel = CATEGORY_LABELS[favorite.category];
  const textScale = useTextScale();

  // Only plain shared values and JS callbacks are used inside the gesture callbacks below. They run
  // on the UI thread, so nothing React-owned (refs, the favorite's component) may be captured.
  const { ghostX, ghostY, ghostOpacity, overPot, potRect, layerOrigin } = drag;
  const { remeasure, beginDrag, endDrag, recentlyDragged } = drag;

  const pan = usePanGesture({
    enabled: !editing,
    // A mostly vertical drag lifts the tile. A sideways one fails this gesture, and the row scrolls.
    activeOffsetY: [-DRAG_SLOP, DRAG_SLOP],
    failOffsetX: [-SCROLL_SLOP, SCROLL_SLOP],
    onBegin: () => {
      'worklet';
      scheduleOnRN(remeasure);
    },
    onActivate: (event) => {
      'worklet';
      const origin = layerOrigin.get();
      ghostX.set(event.absoluteX - origin.x);
      ghostY.set(event.absoluteY - GHOST_LIFT - origin.y);
      ghostOpacity.set(1);
      scheduleOnRN(beginDrag, favorite);
    },
    onUpdate: (event) => {
      'worklet';
      const origin = layerOrigin.get();
      ghostX.set(event.absoluteX - origin.x);
      ghostY.set(event.absoluteY - GHOST_LIFT - origin.y);
      overPot.set(isOverRect(event.absoluteX, event.absoluteY - GHOST_LIFT, potRect.get()));
    },
    onDeactivate: (event) => {
      'worklet';
      const over =
        !event.canceled && isOverRect(event.absoluteX, event.absoluteY - GHOST_LIFT, potRect.get());
      scheduleOnRN(endDrag, favorite.id, over);
    },
  });

  const label = editing
    ? strings.a11y.removeFavorite(favorite.name)
    : strings.a11y.tileLabel(favorite.name, categoryLabel, inPot);
  const actionLabel = inPot
    ? strings.a11y.removeFromPot(favorite.name)
    : strings.a11y.addToPot(favorite.name);

  return (
    // Web only: the tile owns vertical touches (the drag), so sideways swipes still scroll the row.
    <GestureDetector gesture={pan} touchAction="pan-x">
      <View collapsable={false}>
        <Pressable
          accessibilityLabel={label}
          accessibilityHint={editing ? undefined : strings.a11y.tileHint}
          accessibilityActions={editing ? undefined : [{ name: 'activate', label: actionLabel }]}
          accessibilityRole="button"
          accessibilityState={editing ? undefined : { selected: inPot }}
          onPress={() => {
            // On the web a drag ends with a click on the tile: that is not a tap.
            if (recentlyDragged()) return;
            if (editing) onRemoveFavorite();
            else onPress();
          }}
          style={[
            styles.tile,
            {
              width: Math.round(TILE_WIDTH * textScale),
              borderColor: accent,
              backgroundColor: inPot ? `${accent}26` : colors.surface,
            },
          ]}
          testID={`tile-${favorite.name}`}
        >
          <Text allowFontScaling={false} style={styles.emoji}>
            {iconFor(favorite.category, favorite.name)}
          </Text>
          <Text style={[type.smallStrong, styles.name, { color: colors.ink }]}>
            {favorite.name}
          </Text>
          {inPot && !editing ? <Text style={[styles.badge, { color: accent }]}>✓</Text> : null}
          {editing ? (
            <View style={[styles.remove, { backgroundColor: colors.ink }]}>
              <Text style={[styles.removeMark, { color: colors.bg }]}>×</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  tile: {
    minHeight: TILE_HEIGHT,
    borderWidth: 2,
    borderRadius: radius.lg,
    paddingVertical: space.sm,
    paddingHorizontal: space.xs,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  emoji: { fontSize: 28, lineHeight: 34 },
  name: { textAlign: 'center' },
  badge: { position: 'absolute', top: 2, right: 6, fontSize: 14, fontWeight: '700' },
  remove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeMark: { fontSize: 16, lineHeight: 18, fontWeight: '700' },
});
