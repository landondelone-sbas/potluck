import { CATEGORIES, type Category } from '@potluck/engine';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddFavoriteField } from '@/components/add-favorite-field';
import { Button } from '@/components/button';
import { SuggestionTile } from '@/components/suggestion-tile';
import { Toast, useToast } from '@/components/toast';
import { SETUP_QUESTIONS, strings } from '@/content/strings';
import { SUGGESTIONS } from '@/domain/catalog';
import { findFavorite } from '@/domain/favorites';
import { usePotluck } from '@/state/store';
import { space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

function isCategory(value: string | undefined): value is Category {
  return (CATEGORIES as readonly string[]).includes(value ?? '');
}

export default function SetupStepScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  if (!isCategory(category)) return <Redirect href="/setup" />;
  return <SetupStep category={category} />;
}

/** One setup step: tap suggestions, add your own, or skip (ONB-1 to ONB-4). */
function SetupStep({ category }: { category: Category }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { message, say } = useToast();
  const favorites = usePotluck((s) => s.favorites);
  const toggleFavorite = usePotluck((s) => s.toggleFavorite);
  const addFavorite = usePotluck((s) => s.addFavorite);

  const step = CATEGORIES.indexOf(category);
  const last = step === CATEGORIES.length - 1;

  // The suggestions, then anything the user typed in that is not one of them.
  const names = useMemo(() => {
    const suggested = SUGGESTIONS[category];
    const lower = new Set(suggested.map((n) => n.toLowerCase()));
    const custom = favorites
      .filter((f) => f.category === category && !lower.has(f.name.toLowerCase()))
      .map((f) => f.name);
    return [...suggested, ...custom];
  }, [category, favorites]);

  const picked = favorites.filter((f) => f.category === category).length;

  const onAdd = (text: string): boolean => {
    const outcome = addFavorite(category, text);
    if (outcome.status === 'duplicate') say(strings.setup.duplicate(outcome.existing.name));
    return outcome.status === 'added';
  };

  const next = () => {
    const following = CATEGORIES[step + 1];
    router.push(following ? `/setup/${following}` : '/setup/summary');
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ title: strings.setup.step(step + 1, CATEGORIES.length) }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={[type.title, { color: colors.ink }]}>
          {SETUP_QUESTIONS[category]}
        </Text>
        <Text style={[type.small, { color: colors.ink2 }]}>{strings.setup.hint(picked)}</Text>

        <View style={styles.grid}>
          {names.map((name) => (
            <SuggestionTile
              key={name}
              category={category}
              name={name}
              onPress={() => toggleFavorite(category, name)}
              selected={findFavorite(favorites, category, name) !== undefined}
            />
          ))}
        </View>

        <AddFavoriteField
          buttonLabel={strings.setup.addButton}
          label={strings.setup.addLabel}
          onSubmit={onAdd}
          placeholder={strings.setup.addPlaceholder(category)}
          testID="setup-add"
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <Button
          label={
            picked === 0 ? strings.setup.skip : last ? strings.setup.finish : strings.setup.next
          }
          onPress={next}
          testID="next"
        />
      </View>
      <Toast message={message} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: space.md, gap: space.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  footer: { paddingHorizontal: space.md, paddingTop: space.sm },
});
