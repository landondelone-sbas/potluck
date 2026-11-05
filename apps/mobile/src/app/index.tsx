import { plateNudge, type Category } from '@potluck/engine';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { AddFavoriteField } from '@/components/add-favorite-field';
import { BottomBar } from '@/components/bottom-bar';
import { CategoryStrip } from '@/components/category-strip';
import { DragProvider } from '@/components/drag/drag-context';
import { GhostLayer } from '@/components/drag/ghost-layer';
import { MoodStarters } from '@/components/mood-starters';
import { PotView, SIMMER_MS, setEntryMode, type EntryMode } from '@/components/pot-view';
import { TileRow } from '@/components/tile-row';
import { Toast, useToast } from '@/components/toast';
import { CATEGORY_PROMPTS, strings } from '@/content/strings';
import { toPotItem, type Favorite } from '@/domain/favorites';
import { moodPot, type Mood } from '@/domain/moods';
import { countsByCategory, potFavorites } from '@/domain/pot';
import { announce } from '@/lib/accessibility';
import { dropped, rejected } from '@/lib/haptics';
import { usePotluck } from '@/state/store';
import { minTouchTarget, radius, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

/**
 * The screen is fixed so a drag never fights a scroll. Past these limits the content no longer
 * fits, so it scrolls instead: enlarged text is never clipped (PRD 12.4) and a short phone can
 * still reach everything. Tapping works in both layouts.
 */
const SCROLL_FONT_SCALE = 1.3;
const SCROLL_BELOW_HEIGHT = 600;

export default function PotScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const { fontScale, height: windowHeight } = useWindowDimensions();
  const { message, say } = useToast();

  const favorites = usePotluck((s) => s.favorites);
  const pot = usePotluck((s) => s.pot);
  const slots = usePotluck((s) => s.slots);
  const run = usePotluck((s) => s.run);
  const stale = usePotluck((s) => s.stale);
  const addFavorite = usePotluck((s) => s.addFavorite);
  const removeFavorite = usePotluck((s) => s.removeFavorite);
  const addToPot = usePotluck((s) => s.addToPot);
  const removeFromPot = usePotluck((s) => s.removeFromPot);
  const clearPot = usePotluck((s) => s.clearPot);
  const setPot = usePotluck((s) => s.setPot);
  const cook = usePotluck((s) => s.cook);

  const [category, setCategory] = useState<Category>('protein');
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [cooking, setCooking] = useState(false);

  const cookTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (cookTimer.current) clearTimeout(cookTimer.current);
    },
    [],
  );

  const members = useMemo(() => potFavorites(favorites, pot), [favorites, pot]);
  const counts = useMemo(() => countsByCategory(members), [members]);
  const inPot = useMemo(() => new Set(pot), [pot]);
  const nudge = plateNudge(members.map(toPotItem));
  const inCategory = useMemo(
    () => favorites.filter((f) => f.category === category),
    [favorites, category],
  );

  const tryAdd = useCallback(
    (id: string, mode: EntryMode) => {
      setEntryMode(id, mode);
      const change = addToPot(id);
      if (change.ok) {
        if (mode === 'plop') dropped();
        const state = usePotluck.getState();
        const added = state.favorites.find((f) => f.id === id);
        if (added) announce(strings.a11y.addedToPot(added.name, state.pot.length));
      } else {
        rejected();
        say(strings.messages.rejected(change.reason, change.category));
      }
    },
    [addToPot, say],
  );

  const takeOut = useCallback(
    (id: string) => {
      const name = usePotluck.getState().favorites.find((f) => f.id === id)?.name;
      removeFromPot(id);
      if (name) announce(strings.a11y.removedFromPot(name, usePotluck.getState().pot.length));
    },
    [removeFromPot],
  );

  const onTilePress = (favorite: Favorite) => {
    if (inPot.has(favorite.id)) takeOut(favorite.id);
    else tryAdd(favorite.id, 'rise');
  };

  const startCook = useCallback(() => {
    if (cooking) return;
    if (usePotluck.getState().pot.length === 0) {
      say(strings.messages.potEmpty);
      return;
    }
    setCooking(true);
    cookTimer.current = setTimeout(
      () => {
        const finished = cook();
        setCooking(false);
        if (finished) router.push('/results');
      },
      reduceMotion ? 0 : SIMMER_MS,
    );
  }, [cooking, cook, reduceMotion, router, say]);

  const onMood = (mood: Mood) => {
    const ids = moodPot(mood, favorites);
    if (ids.length === 0) {
      say(strings.messages.moodNone);
      return;
    }
    for (const id of ids) setEntryMode(id, 'plop');
    setPot(ids);
    startCook();
  };

  const onAddFavorite = (text: string): boolean => {
    const outcome = addFavorite(category, text);
    if (outcome.status === 'added') {
      say(strings.messages.added(outcome.favorite.name));
      return true;
    }
    if (outcome.status === 'duplicate') say(strings.messages.duplicate(outcome.existing.name));
    return false;
  };

  const content = (
    <>
      <MoodStarters disabled={cooking} onPick={onMood} />

      <PotView cooking={cooking} items={members} onRemove={takeOut} slots={slots} />

      <View style={styles.status}>
        <Text
          accessibilityLabel={strings.pot.potLabel(members.map((f) => f.name))}
          style={[type.bodyStrong, styles.contents, { color: colors.ink }]}
          testID="contents"
        >
          {members.map((f) => f.name).join(' · ')}
        </Text>
        <Text style={[type.small, styles.nudge, { color: colors.ink2 }]} testID="nudge">
          {strings.nudge[nudge]}
        </Text>
        {run ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/results')}
            style={[styles.resultsLink, { borderColor: stale ? colors.line : colors.pot }]}
            testID="see-results"
          >
            <Text style={[type.smallStrong, { color: stale ? colors.ink2 : colors.potText }]}>
              {stale ? strings.pot.outOfDate : strings.pot.seeResults}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.pantry}>
        <CategoryStrip
          counts={counts}
          onSelect={(next) => {
            setCategory(next);
            setAdding(false);
          }}
          selected={category}
        />
      </View>

      <View style={styles.promptRow}>
        <Text style={[type.bodyStrong, styles.prompt, { color: colors.ink }]}>
          {CATEGORY_PROMPTS[category]}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: editing }}
          onPress={() => {
            setEditing((value) => !value);
            setAdding(false);
          }}
          style={[styles.edit, { borderColor: colors.line }]}
          testID="edit-toggle"
        >
          <Text style={[type.smallStrong, { color: colors.ink2 }]}>
            {editing ? strings.pot.done : strings.pot.edit}
          </Text>
        </Pressable>
      </View>

      <TileRow
        category={category}
        editing={editing}
        favorites={inCategory}
        inPot={inPot}
        onAdd={() => setAdding((value) => !value)}
        onRemoveFavorite={(favorite) => removeFavorite(favorite.id)}
        onTilePress={onTilePress}
      />

      {adding && !editing ? (
        <View style={styles.addField}>
          <AddFavoriteField
            autoFocus
            buttonLabel={strings.pot.add}
            label={strings.pot.addFieldLabel}
            onSubmit={onAddFavorite}
            placeholder={strings.pot.addPlaceholder(category)}
            testID="add-favorite"
          />
        </View>
      ) : null}
    </>
  );

  return (
    <DragProvider onDropOnPot={(id) => tryAdd(id, 'plop')}>
      <KeyboardAvoidingView
        behavior="padding"
        style={[styles.root, { backgroundColor: colors.bg }]}
      >
        {fontScale > SCROLL_FONT_SCALE || windowHeight < SCROLL_BELOW_HEIGHT ? (
          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            style={styles.flex}
            testID="body-scroll"
          >
            {content}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.body]} testID="body-fixed">
            {content}
          </View>
        )}

        <BottomBar
          cooking={cooking}
          count={members.length}
          onCook={startCook}
          onEmpty={() => {
            clearPot();
            announce(strings.a11y.potEmptied);
          }}
        />
        <Toast message={message} />
        <GhostLayer />
      </KeyboardAvoidingView>
    </DragProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  body: { paddingTop: space.sm, gap: space.sm },
  status: { paddingHorizontal: space.md, gap: space.xs, alignItems: 'center' },
  contents: { textAlign: 'center', minHeight: 22 },
  nudge: { textAlign: 'center' },
  resultsLink: {
    minHeight: minTouchTarget,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    justifyContent: 'center',
  },
  pantry: { paddingHorizontal: space.md, paddingTop: space.xs },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    gap: space.sm,
  },
  prompt: { flex: 1 },
  edit: {
    minHeight: minTouchTarget,
    minWidth: minTouchTarget,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addField: { paddingHorizontal: space.md },
});
