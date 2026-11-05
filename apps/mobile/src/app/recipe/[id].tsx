import { dishes } from '@potluck/dishes';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { strings } from '@/content/strings';
import { rebuildResult } from '@/domain/cook-log';
import { normalizeName } from '@/domain/favorites';
import { iconFor } from '@/domain/icons';
import { formatDay } from '@/lib/format';
import { usePotluck } from '@/state/store';
import { categoryColor, radius, space } from '@/theme/tokens';
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

  const recipe = useMemo(() => (entry ? rebuildResult(entry, dishes) : null), [entry]);

  useEffect(() => {
    if (!keepAwake) return;
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    return () => {
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, [keepAwake]);

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
          ? `${strings.results.minutes(recipe.dish.minutes)} · ${recipe.dish.feel}`
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

            <IngredientGroup title={strings.recipe.fromPot}>
              {recipe.used.map((item) => (
                <IngredientRow
                  key={`${item.category}-${item.name}`}
                  accent={categoryColor(scheme, item.category)}
                  emoji={iconFor(item.category, item.name)}
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

function IngredientRow({
  accent,
  emoji,
  name,
  struck = false,
}: {
  accent: string;
  emoji: string;
  name: string;
  struck?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View accessible accessibilityLabel={name} style={styles.row}>
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
