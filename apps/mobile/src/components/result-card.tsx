import { CUISINE_LABELS, type DishResult, type PotItem } from '@potluck/engine';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '@/content/strings';
import { normalizeName } from '@/domain/favorites';
import { iconFor } from '@/domain/icons';
import { categoryColor, minTouchTarget, radius, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

import { Button } from './button';

interface ResultCardProps {
  card: DishResult;
  /** How many items were in the pot. */
  potSize: number;
  /** A single clear winner: shown with the steps open. */
  hero: boolean;
  /** The pot changed since this was cooked. */
  stale: boolean;
  /** This dish was already made from this cook: the button opens its recipe again. */
  saved: boolean;
  onMakeTonight: () => void;
  /** A chip was tapped: say what it means in words (the legend is easy to miss). */
  onExplain: (message: string) => void;
}

/** One dish: what it used, what the chef adds, what it left out, and how to make it (RES-3). */
export function ResultCard({
  card,
  potSize,
  hero,
  stale,
  saved,
  onMakeTonight,
  onExplain,
}: ResultCardProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(hero);
  const { dish } = card;

  return (
    <View
      accessibilityLabel={card.title}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: hero ? colors.pot : colors.line },
        stale ? styles.stale : null,
      ]}
      testID={`dish-${dish.id}`}
    >
      <Text style={[type.eyebrow, { color: colors.ink2 }]}>
        {`${CUISINE_LABELS[dish.cuisine]} · ${strings.results.format[dish.format]} · ${strings.results.minutes(dish.minutes)} · ${dish.feel}`}
      </Text>
      <Text accessibilityRole="header" style={[type.title, { color: colors.ink }]}>
        {card.title}
      </Text>

      <View style={styles.uses}>
        <View aria-hidden style={styles.meter}>
          {Array.from({ length: potSize }, (_, i) => (
            <View
              key={i}
              style={[
                styles.meterDot,
                { backgroundColor: i < card.used.length ? colors.pot : colors.line },
              ]}
            />
          ))}
        </View>
        <Text style={[type.smallStrong, { color: colors.ink2 }]}>
          {strings.results.uses(card.used.length, potSize)}
        </Text>
      </View>

      <View style={styles.chips}>
        {card.used.map((item) => (
          <IngredientChip
            key={`used-${item.category}-${item.name}`}
            item={item}
            kind="used"
            onExplain={onExplain}
          />
        ))}
        {card.chefAdds.map((add) => (
          <IngredientChip
            key={`chef-${add.category}`}
            item={{ category: add.category, name: normalizeName(add.name), tags: [] }}
            kind="chef"
            onExplain={onExplain}
          />
        ))}
        {card.leftOut.map((item) => (
          <IngredientChip
            key={`left-${item.category}-${item.name}`}
            item={item}
            kind="left"
            onExplain={onExplain}
          />
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        style={styles.stepsHeader}
        testID={`steps-toggle-${dish.id}`}
      >
        <Text style={[type.bodyStrong, { color: colors.potText }]}>
          {`${open ? '▾' : '▸'} ${strings.results.howTo}`}
        </Text>
      </Pressable>
      {open ? (
        <View style={styles.steps}>
          {card.steps.map((step, index) => (
            <View key={index} style={styles.step}>
              <Text style={[type.bodyStrong, styles.stepNumber, { color: colors.ink2 }]}>
                {`${index + 1}.`}
              </Text>
              <Text style={[type.body, styles.stepText, { color: colors.ink }]}>{step}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Text style={[type.small, { color: colors.ink2 }]}>
        <Text style={type.smallStrong}>{`${strings.results.lighterTip} `}</Text>
        {dish.tip}
      </Text>

      <Button
        accessibilityHint={saved ? undefined : strings.results.makeTonightHint}
        label={saved ? strings.results.openRecipe : strings.results.makeTonight}
        onPress={onMakeTonight}
        testID={`make-${dish.id}`}
      />
    </View>
  );
}

type ChipKind = 'used' | 'chef' | 'left';

function IngredientChip({
  item,
  kind,
  onExplain,
}: {
  item: PotItem;
  kind: ChipKind;
  onExplain: (message: string) => void;
}) {
  const { scheme, colors } = useTheme();
  const accent = categoryColor(scheme, item.category);
  const label =
    kind === 'chef'
      ? `${item.name}, ${strings.results.chefAdds.toLowerCase()}`
      : kind === 'left'
        ? `${item.name}, ${strings.results.leftOut.toLowerCase()}`
        : item.name;
  // Dashed and struck-through chips are explained in words when touched (PRD 9.5).
  const explain =
    kind === 'chef'
      ? () => onExplain(strings.results.explainChef(item.name))
      : kind === 'left'
        ? () => onExplain(strings.results.explainLeftOut(item.name))
        : undefined;

  return (
    <Pressable
      accessibilityLabel={label}
      accessible
      disabled={explain === undefined}
      onLongPress={explain}
      onPress={explain}
      style={[
        styles.chip,
        {
          borderColor: accent,
          borderStyle: kind === 'chef' ? 'dashed' : 'solid',
          backgroundColor: kind === 'used' ? `${accent}1F` : 'transparent',
          opacity: kind === 'left' ? 0.7 : 1,
        },
      ]}
    >
      <Text allowFontScaling={false} style={styles.chipEmoji}>
        {iconFor(item.category, item.name)}
      </Text>
      <Text
        style={[
          type.smallStrong,
          { color: colors.ink },
          kind === 'left' ? { textDecorationLine: 'line-through' } : null,
        ]}
      >
        {kind === 'chef' ? `+ ${item.name}` : item.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 2, borderRadius: radius.lg, padding: space.md, gap: space.sm },
  stale: { opacity: 0.55 },
  uses: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  meter: { flexDirection: 'row', gap: 3 },
  meterDot: { width: 10, height: 10, borderRadius: 5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
  },
  chipEmoji: { fontSize: 14 },
  stepsHeader: { minHeight: minTouchTarget, justifyContent: 'center' },
  steps: { gap: space.sm },
  step: { flexDirection: 'row', gap: space.sm },
  stepNumber: { width: 24 },
  stepText: { flex: 1 },
});
