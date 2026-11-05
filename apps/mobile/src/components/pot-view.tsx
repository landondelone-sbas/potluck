import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Keyframe,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

import { strings } from '@/content/strings';
import { iconFor } from '@/domain/icons';
import { POT_SLOTS } from '@/domain/slots';
import { categoryColor, minTouchTarget, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

import { useDrag } from './drag/drag-context';
import type { Favorite } from '@/domain/favorites';

/** The simmer animation, from PRD section 12.3 and RES-1: 1.1 seconds or less. */
export const SIMMER_MS = 1100;

/** The pot drawing's shape (width over height) and the range of heights it may take. */
const POT_ASPECT = 420 / 232;
const POT_MAX_HEIGHT = 198;
const POT_MIN_HEIGHT = 120;

/** How a token arrives: `rise` from the tile row after a tap, `plop` after a drop. */
export type EntryMode = 'rise' | 'plop';

const entryModes = new Map<string, EntryMode>();

/**
 * Say how an item's token should arrive. Call it just before the item goes in the pot: the token
 * reads it as it mounts. Anything not set plops.
 */
export function setEntryMode(id: string, mode: EntryMode): void {
  entryModes.set(id, mode);
}

const rise = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 110 }, { scale: 0.5 }] },
  100: {
    opacity: 1,
    transform: [{ translateY: 0 }, { scale: 1 }],
    easing: Easing.out(Easing.back(1.4)),
  },
}).duration(380);

const plop = ZoomIn.duration(220);

interface PotViewProps {
  items: readonly Favorite[];
  /** Slot index of each item in the pot. */
  slots: Readonly<Record<string, number>>;
  cooking: boolean;
  onRemove: (id: string) => void;
}

/** A small stable tilt per token, so a full pot looks piled and not gridded. */
function tilt(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) % 997;
  return (hash % 13) - 6;
}

export function PotView({ items, slots, cooking, onRemove }: PotViewProps) {
  const { colors } = useTheme();
  const { potRef, remeasure, overPot } = useDrag();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const [box, setBox] = useState({ width: 358, height: POT_MAX_HEIGHT });

  // The pot takes the room the rest of the screen leaves, within limits, so short phones still
  // show the pot and the pantry together (POT-1). Tokens shrink with it.
  const available = { width: box.width - space.md * 2, height: box.height };
  const potHeight = Math.min(
    POT_MAX_HEIGHT,
    Math.max(POT_MIN_HEIGHT, available.height),
    available.width / POT_ASPECT,
  );
  const potWidth = potHeight * POT_ASPECT;
  const tokenSize = Math.max(30, Math.min(40, Math.round(potHeight * 0.2)));

  useEffect(() => {
    if (cooking && !reduceMotion) {
      progress.set(0);
      progress.set(withTiming(1, { duration: SIMMER_MS, easing: Easing.linear }));
    } else {
      progress.set(0);
    }
  }, [cooking, reduceMotion, progress]);

  const shake = useAnimatedStyle(() => {
    const p = progress.get();
    const hover = overPot.get();
    return {
      transform: [{ rotate: `${Math.sin(p * Math.PI * 6) * 1.4}deg` }, { scale: hover ? 1.03 : 1 }],
    };
  });

  return (
    <View
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setBox({ width, height });
      }}
      style={styles.outer}
    >
      <View
        ref={potRef}
        collapsable={false}
        onLayout={remeasure}
        style={{ width: potWidth, height: potHeight }}
        testID="pot"
      >
        <Animated.View style={[StyleSheet.absoluteFill, shake]}>
          <PotArt />
        </Animated.View>

        <Steam progress={progress} />

        {items.length === 0 ? (
          <View pointerEvents="none" style={styles.hintWrap}>
            <Text style={[type.smallStrong, styles.hint, { color: colors.onPot }]}>
              {strings.pot.emptyHint}
            </Text>
          </View>
        ) : null}

        {items.map((item) => (
          <Token
            key={item.id}
            favorite={item}
            progress={progress}
            size={tokenSize}
            slot={slots[item.id] ?? 0}
            onRemove={() => onRemove(item.id)}
          />
        ))}
      </View>
    </View>
  );
}

function PotArt() {
  const { colors } = useTheme();
  // The viewBox crops prototype v1's pot to the pot itself: the steam is animated separately.
  return (
    <Svg
      aria-hidden
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 90 420 232"
      width="100%"
    >
      <Defs>
        <LinearGradient id="body" x1="0" x2="1" y1="0" y2="0">
          <Stop offset="0" stopColor={colors.potHi} />
          <Stop offset="0.26" stopColor={colors.pot} />
          <Stop offset="0.6" stopColor={colors.pot} />
          <Stop offset="1" stopColor={colors.potLo} />
        </LinearGradient>
        <RadialGradient id="broth" cx="0.5" cy="0.35" r="0.75">
          <Stop offset="0" stopColor={colors.broth} />
          <Stop offset="1" stopColor={colors.brothDeep} />
        </RadialGradient>
      </Defs>
      <Ellipse cx="210" cy="306" rx="158" ry="13" fill={colors.ink} opacity={0.14} />
      <G fill="none" stroke={colors.potLo} strokeLinecap="round" strokeWidth={11}>
        <Path d="M62 150q-36 3-36 30 0 22 32 27" />
        <Path d="M358 150q36 3 36 30 0 22-32 27" />
      </G>
      <Path
        d="M60 128C52 200 66 264 104 290Q210 304 316 290C354 264 368 200 360 128Z"
        fill="url(#body)"
      />
      <Path
        d="M90 156C86 208 94 252 120 276"
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeWidth={7}
        opacity={0.28}
      />
      <Ellipse cx="210" cy="128" rx="154" ry="35" fill={colors.potHi} />
      <Ellipse cx="210" cy="131" rx="141" ry="29" fill={colors.potLo} />
      <Ellipse cx="210" cy="134" rx="133" ry="24" fill="url(#broth)" />
    </Svg>
  );
}

function Steam({ progress }: { progress: SharedValue<number> }) {
  const { colors } = useTheme();
  return (
    <View pointerEvents="none" style={styles.steam}>
      {[0, 1, 2].map((i) => (
        <Wisp key={i} index={i} progress={progress} color={colors.ink2} />
      ))}
    </View>
  );
}

function Wisp({
  index,
  progress,
  color,
}: {
  index: number;
  progress: SharedValue<number>;
  color: string;
}) {
  const style = useAnimatedStyle(() => {
    const p = progress.get();
    const phase = Math.min(1, Math.max(0, p * 1.4 - index * 0.12));
    return {
      opacity: p === 0 ? 0 : Math.sin(phase * Math.PI) * 0.55,
      transform: [{ translateY: -phase * 26 }, { scaleY: 0.8 + phase * 0.5 }],
    };
  });
  return <Animated.View style={[styles.wisp, { backgroundColor: color }, style]} />;
}

interface TokenProps {
  favorite: Favorite;
  slot: number;
  size: number;
  progress: SharedValue<number>;
  onRemove: () => void;
}

function Token({ favorite, slot, size, progress, onRemove }: TokenProps) {
  const { scheme, colors } = useTheme();
  const accent = categoryColor(scheme, favorite.category);
  const [x, y] = POT_SLOTS[slot] ?? POT_SLOTS[0]!;
  const rotation = tilt(favorite.id);
  const mode = entryModes.get(favorite.id) ?? 'plop';

  const bob = useAnimatedStyle(() => {
    const p = progress.get();
    return { transform: [{ translateY: p === 0 ? 0 : Math.sin(p * Math.PI * 4 + slot) * 3 }] };
  });

  return (
    <Animated.View
      entering={mode === 'rise' ? rise : plop}
      style={[
        styles.token,
        {
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
        },
      ]}
    >
      <Animated.View style={bob}>
        <Pressable
          accessibilityLabel={strings.a11y.takeOut(favorite.name)}
          accessibilityRole="button"
          hitSlop={Math.max(space.xs, (minTouchTarget - size) / 2)}
          onPress={onRemove}
          style={[
            styles.tokenFace,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.surface,
              borderColor: accent,
              transform: [{ rotate: `${rotation}deg` }],
            },
          ]}
          testID={`token-${favorite.name}`}
        >
          <Text allowFontScaling={false} style={{ fontSize: Math.round(size * 0.5) }}>
            {iconFor(favorite.category, favorite.name)}
          </Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    minHeight: POT_MIN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  steam: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -18,
    height: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 44,
  },
  wisp: { width: 6, height: 26, borderRadius: 3, opacity: 0 },
  hintWrap: {
    ...StyleSheet.absoluteFill,
    top: '34%',
    alignItems: 'center',
  },
  hint: { opacity: 0.9, textAlign: 'center' },
  token: { position: 'absolute' },
  tokenFace: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
