import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { ResultCard } from '@/components/result-card';
import { Toast, useToast } from '@/components/toast';
import { strings } from '@/content/strings';
import { dropped } from '@/lib/haptics';
import { usePotluck } from '@/state/store';
import { radius, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

export default function ResultsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { message, say } = useToast();
  const run = usePotluck((s) => s.run);
  const stale = usePotluck((s) => s.stale);
  const logged = usePotluck((s) => s.logged);
  const logCooked = usePotluck((s) => s.logCooked);

  const backToPot = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!run) {
    return (
      <View style={[styles.root, styles.empty, { backgroundColor: colors.bg }]}>
        <Text style={[type.body, styles.centered, { color: colors.ink2 }]}>
          {strings.results.noRun}
        </Text>
        <Button label={strings.results.backToPot} onPress={backToPot} variant="quiet" />
      </View>
    );
  }

  const { result } = run;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Button
          label={strings.results.backToPot}
          onPress={backToPot}
          style={styles.back}
          testID="back-to-pot"
          variant="quiet"
        />

        <Text accessibilityRole="header" style={[type.display, { color: colors.ink }]}>
          {strings.results.title}
        </Text>
        <Text style={[type.small, { color: colors.ink2 }]}>{strings.results.legend}</Text>

        <Text style={[type.body, { color: colors.ink }]} testID="headline">
          <Text style={type.bodyStrong}>
            {`${result.mode === 'single' ? strings.results.single : strings.results.multi} `}
          </Text>
          {result.mode === 'single' ? strings.results.singleBody : strings.results.multiBody}
        </Text>

        {stale ? (
          <View
            style={[
              styles.staleNote,
              { borderColor: colors.line, backgroundColor: colors.surface2 },
            ]}
          >
            <Text style={[type.smallStrong, { color: colors.ink }]} testID="stale-note">
              {strings.results.stale}
            </Text>
          </View>
        ) : null}

        {result.results.map((card) => (
          <ResultCard
            key={card.dish.id}
            card={card}
            hero={result.mode === 'single'}
            onExplain={say}
            onMakeTonight={() => {
              const entry = logCooked(card.dish.id);
              if (!entry) return;
              dropped();
              router.push(`/recipe/${entry.id}`);
            }}
            potSize={result.potSize}
            saved={`${run.runId}:${card.dish.id}` in logged}
            stale={stale}
          />
        ))}

        {result.wildcard ? (
          <View style={[styles.wildcard, { borderColor: colors.line }]} testID="wildcard">
            <Text style={[type.eyebrow, { color: colors.ink2 }]}>
              {strings.results.wildcardEyebrow}
            </Text>
            <Text style={[type.heading, { color: colors.ink }]}>{result.wildcard}</Text>
            <Text style={[type.small, { color: colors.ink2 }]}>{strings.results.wildcardBody}</Text>
          </View>
        ) : null}
      </ScrollView>
      <Toast message={message} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.lg },
  centered: { textAlign: 'center' },
  content: { padding: space.md, gap: space.md, paddingBottom: space.xxl },
  back: { alignSelf: 'flex-start' },
  staleNote: { borderWidth: 1.5, borderRadius: radius.md, padding: space.md },
  wildcard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.xs,
  },
});
