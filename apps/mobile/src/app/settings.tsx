import { useRouter } from 'expo-router';
import { useEffect, useRef, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { strings } from '@/content/strings';
import { APPEARANCES, UNIT_SYSTEMS } from '@/state/persisted';
import { usePotluck } from '@/state/store';
import { minTouchTarget, radius, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

/** Appearance, a way back into setup, About, and Reset all data (SET-1 to SET-3, ONB-6). */
export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const appearance = usePotluck((s) => s.appearance);
  const setAppearance = usePotluck((s) => s.setAppearance);
  const units = usePotluck((s) => s.units);
  const setUnits = usePotluck((s) => s.setUnits);
  const setupReopened = usePotluck((s) => s.setupReopened);
  const reopenSetup = usePotluck((s) => s.reopenSetup);
  const resetAll = usePotluck((s) => s.resetAll);

  // Setup is closed once it is done. Open it first, then go there once the app has allowed it.
  const wantsSetup = useRef(false);
  useEffect(() => {
    if (wantsSetup.current && setupReopened) {
      wantsSetup.current = false;
      router.push('/setup/protein');
    }
  }, [setupReopened, router]);

  const confirmReset = () => {
    Alert.alert(strings.settings.resetTitle, strings.settings.resetBody, [
      { text: strings.settings.cancel, style: 'cancel' },
      { text: strings.settings.resetConfirm, style: 'destructive', onPress: resetAll },
    ]);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.root, { backgroundColor: colors.bg }]}
    >
      <Section title={strings.settings.appearance}>
        <View accessibilityRole="radiogroup" style={styles.group}>
          {APPEARANCES.map((option) => {
            const selected = option === appearance;
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => setAppearance(option)}
                style={[
                  styles.row,
                  {
                    backgroundColor: colors.surface,
                    borderColor: selected ? colors.pot : colors.line,
                  },
                ]}
                testID={`appearance-${option}`}
              >
                <Text style={[type.bodyStrong, styles.rowLabel, { color: colors.ink }]}>
                  {strings.settings.appearanceOptions[option]}
                </Text>
                {selected ? <Text style={[type.heading, { color: colors.potText }]}>✓</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title={strings.settings.units}>
        <View accessibilityRole="radiogroup" style={styles.group}>
          {UNIT_SYSTEMS.map((option) => {
            const selected = option === units;
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => setUnits(option)}
                style={[
                  styles.row,
                  {
                    backgroundColor: colors.surface,
                    borderColor: selected ? colors.pot : colors.line,
                  },
                ]}
                testID={`units-${option}`}
              >
                <Text style={[type.bodyStrong, styles.rowLabel, { color: colors.ink }]}>
                  {strings.settings.unitOptions[option]}
                </Text>
                {selected ? <Text style={[type.heading, { color: colors.potText }]}>✓</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title={strings.settings.pantry}>
        <Pressable
          accessibilityHint={strings.settings.addMoreHint}
          accessibilityRole="button"
          onPress={() => {
            wantsSetup.current = true;
            reopenSetup();
          }}
          style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.line }]}
          testID="add-more"
        >
          <Text style={[type.bodyStrong, styles.rowLabel, { color: colors.ink }]}>
            {strings.settings.addMore}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/about')}
          style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.line }]}
          testID="about"
        >
          <Text style={[type.bodyStrong, styles.rowLabel, { color: colors.ink }]}>
            {strings.settings.about}
          </Text>
        </Pressable>
      </Section>

      <Section title={strings.settings.data}>
        <Pressable
          accessibilityRole="button"
          onPress={confirmReset}
          style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.line }]}
          testID="reset"
        >
          <Text style={[type.bodyStrong, styles.rowLabel, { color: colors.danger }]}>
            {strings.settings.reset}
          </Text>
        </Pressable>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[type.eyebrow, { color: colors.ink2 }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: space.md, gap: space.lg },
  section: { gap: space.sm },
  group: { gap: space.sm },
  row: {
    minHeight: minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  rowLabel: { flex: 1 },
});
