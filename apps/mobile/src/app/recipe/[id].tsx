import { dishes } from '@potluck/dishes';
import {
  BASE_SERVINGS,
  MAX_SERVINGS,
  MIN_SERVINGS,
  formatAmount,
  splitAmount,
  type Category,
} from '@potluck/engine';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { strings } from '@/content/strings';
import { rebuildResult } from '@/domain/cook-log';
import { normalizeName } from '@/domain/favorites';
import { iconFor } from '@/domain/icons';
import { formatDay } from '@/lib/format';
import { usePotluck } from '@/state/store';
import { categoryColor, minTouchTarget, radius, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

const KEEP_AWAKE_TAG = 'recipe';

/**
 * The recipe for one dish in the cook log (REC-1): large type, easy to read at arm's length, with
 * the ingredients (from the pot, added by the chef, pantry staples) and the numbered steps.
 */
export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { scheme, colors } = useTheme();
  const entry = usePotluck((s) => s.cookLog.find((e) => e.id === id));
  const keepAwake = usePotluck((s) => s.keepAwake);
  const setKeepAwake = usePotluck((s) => s.setKeepAwake);
  const units = usePotluck((s) => s.units);
  const [servings, setServings] = useState(BASE_SERVINGS);

  const recipe = useMemo(() => (entry ? rebuildResult(entry, dishes) : null), [entry]);

  useEffect(() => {
    if (!keepAwake) return;
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    return () => {
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, [keepAwake]);

  // Items in one category share that category's amount, so each gets an equal part.
  const amountFor = (category: Category, sharedBy: number): string | undefined => {
    const amount = recipe?.dish.amounts[category];
    return amount ? formatAmount(splitAmount(amount, sharedBy), units, servings) : undefined;
  };

  if (!entry) {
    return (
      <View style={[styles.root, styles.empty, { backgroundColor: colors.bg }]}>
        <Text style={[type.body, styles.centered, { color: colors.ink2 }]}>
          {strings.recipe.notFound}
        </Text>
        <Button
          label={strings.recipe.backToLog}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/log'))}
          variant="quiet"
        />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.root, { backgroundColor: colors.bg }]}
    >
      <Text style={[type.eyebrow, { color: colors.ink2 }]}>
        {recipe
          ? `${strings.results.format[recipe.dish.format]} · ${strings.results.minutes(recipe.dish.minutes)} · ${recipe.dish.feel}`
          : formatDay(entry.cookedAt)}
      </Text>
      <Text accessibilityRole="header" style={[type.display, { color: colors.ink }]}>
        {entry.title}
      </Text>
      <Text style={[type.small, { color: colors.ink2 }]}>
        {strings.recipe.saved(formatDay(entry.cookedAt))}
      </Text>

      {recipe ? (
        <>
          <View style={styles.section}>
            <Text accessibilityRole="header" style={[type.title, { color: colors.ink }]}>
              {strings.recipe.ingredients}
            </Text>

            <View style={styles.servings}>
              <Text style={[type.bodyStrong, styles.big, { color: colors.ink }]}>
                {strings.recipe.servingsLabel(servings)}
              </Text>
              <View style={styles.stepper}>
                <StepButton
                  disabled={servings <= MIN_SERVINGS}
                  label={strings.recipe.fewer}
                  mark="−"
                  onPress={() => setServings((count) => Math.max(MIN_SERVINGS, count - 1))}
                  testID="servings-fewer"
                />
                <StepButton
                  disabled={servings >= MAX_SERVINGS}
                  label={strings.recipe.more}
                  mark="+"
                  onPress={() => setServings((count) => Math.min(MAX_SERVINGS, count + 1))}
                  testID="servings-more"
                />
              </View>
            </View>

            <IngredientGroup title={strings.recipe.fromPot}>
              {recipe.used.map((item) => (
                <IngredientRow
                  key={`${item.category}-${item.name}`}
                  accent={categoryColor(scheme, item.category)}
                  emoji={iconFor(item.category, item.name)}
                  amount={amountFor(
                    item.category,
                    recipe.used.filter((other) => other.category === item.category).length,
                  )}
                  name={item.name}
                />
              ))}
            </IngredientGroup>

            {recipe.chefAdds.length > 0 ? (
              <IngredientGroup title={strings.recipe.chefAdds}>
                {recipe.chefAdds.map((add) => (
                  <IngredientRow
                    key={add.category}
                    accent={categoryColor(scheme, add.category)}
                    emoji={iconFor(add.category, add.name)}
                    amount={amountFor(add.category, 1)}
                    name={normalizeName(add.name)}
                  />
                ))}
              </IngredientGroup>
            ) : null}

            <IngredientGroup title={strings.recipe.staplesTitle}>
              <Text style={[type.body, styles.big, { color: colors.ink }]}>
                {strings.recipe.staples}
              </Text>
            </IngredientGroup>

            <Text style={[type.small, { color: colors.ink2 }]}>{strings.recipe.amountsNote}</Text>

            {recipe.leftOut.length > 0 ? (
              <IngredientGroup title={strings.recipe.leftOut}>
                {recipe.leftOut.map((item) => (
                  <IngredientRow
                    key={`${item.category}-${item.name}`}
                    accent={categoryColor(scheme, item.category)}
                    emoji={iconFor(item.category, item.name)}
                    name={item.name}
                    struck
                  />
                ))}
              </IngredientGroup>
            ) : null}
          </View>

          <View style={styles.section}>
            <Text accessibilityRole="header" style={[type.title, { color: colors.ink }]}>
              {strings.recipe.steps}
            </Text>
            {recipe.steps.map((step, index) => (
              <View key={index} style={styles.step}>
                <Text style={[type.title, styles.stepNumber, { color: colors.potText }]}>
                  {`${index + 1}.`}
                </Text>
                <Text style={[type.body, styles.big, styles.stepText, { color: colors.ink }]}>
                  {step}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[type.body, { color: colors.ink2 }]}>
            <Text style={type.bodyStrong}>{`${strings.results.lighterTip} `}</Text>
            {recipe.dish.tip}
          </Text>
        </>
      ) : (
        <View style={[styles.note, { borderColor: colors.line, backgroundColor: colors.surface }]}>
          <Text style={[type.body, { color: colors.ink }]}>{strings.recipe.missing}</Text>
        </View>
      )}

      <View
        style={[styles.keepAwake, { borderColor: colors.line, backgroundColor: colors.surface }]}
      >
        <Text style={[type.bodyStrong, styles.keepAwakeLabel, { color: colors.ink }]}>
          {strings.recipe.keepAwake}
        </Text>
        <Switch
          accessibilityLabel={strings.recipe.keepAwake}
          onValueChange={setKeepAwake}
          trackColor={{ true: colors.pot, false: colors.line }}
          value={keepAwake}
        />
      </View>
    </ScrollView>
  );
}

function IngredientGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.group}>
      <Text style={[type.eyebrow, { color: colors.ink2 }]}>{title}</Text>
      {children}
    </View>
  );
}

function StepButton({
  disabled,
  label,
  mark,
  onPress,
  testID,
}: {
  disabled: boolean;
  label: string;
  mark: string;
  onPress: () => void;
  testID: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.stepButton,
        { borderColor: colors.line, backgroundColor: colors.surface, opacity: disabled ? 0.4 : 1 },
      ]}
      testID={testID}
    >
      <Text allowFontScaling={false} style={[styles.stepMark, { color: colors.ink }]}>
        {mark}
      </Text>
    </Pressable>
  );
}

function IngredientRow({
  accent,
  amount,
  emoji,
  name,
  struck = false,
}: {
  accent: string;
  amount?: string | undefined;
  emoji: string;
  name: string;
  struck?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={amount ? strings.recipe.amountRow(name, amount) : name}
      style={styles.row}
    >
      <View style={[styles.rowDot, { backgroundColor: accent }]} />
      <Text allowFontScaling={false} style={styles.rowEmoji}>
        {emoji}
      </Text>
      <Text
        style={[
          type.body,
          styles.big,
          styles.rowName,
          { color: colors.ink },
          struck ? { textDecorationLine: 'line-through', color: colors.ink2 } : null,
        ]}
      >
        {name}
      </Text>
      {amount ? (
        <Text style={[type.bodyStrong, styles.big, { color: colors.ink2 }]}>{amount}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.lg },
  centered: { textAlign: 'center' },
  content: { padding: space.md, gap: space.md, paddingBottom: space.xxl },
  section: { gap: space.md },
  group: { gap: space.sm },
  // Larger than body text: this screen is read at arm's length over a hot pan.
  big: { fontSize: 19, lineHeight: 28 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rowDot: { width: 8, height: 8, borderRadius: 4 },
  rowEmoji: { fontSize: 22 },
  rowName: { flex: 1 },
  servings: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: { flexDirection: 'row', gap: space.sm },
  stepButton: {
    minHeight: minTouchTarget,
    minWidth: minTouchTarget,
    borderWidth: 1.5,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepMark: { fontSize: 24, lineHeight: 28, fontWeight: '700' },
  step: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  stepNumber: { minWidth: 36 },
  stepText: { flex: 1 },
  note: { borderWidth: 1.5, borderRadius: radius.md, padding: space.md },
  keepAwake: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
  },
  keepAwakeLabel: { flex: 1 },
});
