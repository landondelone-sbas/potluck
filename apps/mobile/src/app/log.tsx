import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '@/content/strings';
import { formatDay } from '@/lib/format';
import { usePotluck } from '@/state/store';
import { minTouchTarget, radius, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTheme } from '@/theme/use-theme';

/** Dishes made, newest first, with the day. Tap one to open its recipe again (REC-4). */
export default function CookLogScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const cookLog = usePotluck((s) => s.cookLog);

  if (cookLog.length === 0) {
    return (
      <View style={[styles.root, styles.empty, { backgroundColor: colors.bg }]}>
        <Text style={[type.body, styles.centered, { color: colors.ink2 }]} testID="log-empty">
          {strings.log.empty}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={cookLog}
      keyExtractor={(entry) => entry.id}
      renderItem={({ item }) => {
        const day = formatDay(item.cookedAt);
        const items = item.pot.map((p) => p.name).join(' · ');
        return (
          <Pressable
            accessibilityLabel={strings.log.entry(item.title, day, items)}
            accessibilityRole="button"
            onPress={() => router.push(`/recipe/${item.id}`)}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: colors.surface,
                borderColor: colors.line,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            testID={`log-${item.id}`}
          >
            <Text style={[type.heading, { color: colors.ink }]}>{item.title}</Text>
            <Text style={[type.smallStrong, { color: colors.ink2 }]}>{day}</Text>
            <Text style={[type.small, { color: colors.ink2 }]}>{items}</Text>
          </Pressable>
        );
      }}
      style={[styles.root, { backgroundColor: colors.bg }]}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  empty: { alignItems: 'center', justifyContent: 'center', padding: space.lg },
  centered: { textAlign: 'center' },
  content: { padding: space.md, gap: space.sm },
  row: {
    minHeight: minTouchTarget,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.xs,
  },
});
