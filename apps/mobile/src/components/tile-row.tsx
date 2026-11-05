import type { Category } from '@potluck/engine';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { strings } from '@/content/strings';
import type { Favorite } from '@/domain/favorites';
import { categoryColor, radius, space } from '@/theme/tokens';
import { type } from '@/theme/type';
import { useTextScale } from '@/theme/use-text-scale';
import { useTheme } from '@/theme/use-theme';

import { PantryTile, TILE_HEIGHT, TILE_WIDTH } from './pantry-tile';

interface TileRowProps {
  category: Category;
  favorites: readonly Favorite[];
  inPot: ReadonlySet<string>;
  editing: boolean;
  onTilePress: (favorite: Favorite) => void;
  onRemoveFavorite: (favorite: Favorite) => void;
  onAdd: () => void;
}

/** The selected category's favorites as a horizontally scrolling row of tiles (PAN-2, PAN-3). */
export function TileRow({
  category,
  favorites,
  inPot,
  editing,
  onTilePress,
  onRemoveFavorite,
  onAdd,
}: TileRowProps) {
  const { scheme, colors } = useTheme();
  const accent = categoryColor(scheme, category);
  const textScale = useTextScale();

  return (
    <ScrollView
      contentContainerStyle={styles.row}
      horizontal
      keyboardShouldPersistTaps="handled"
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      testID="tile-row"
    >
      {favorites.length === 0 && !editing ? (
        <Text style={[type.small, styles.empty, { color: colors.ink2 }]}>
          {strings.pot.noFavorites(category)}
        </Text>
      ) : null}

      {favorites.map((favorite) => (
        <PantryTile
          key={favorite.id}
          editing={editing}
          favorite={favorite}
          inPot={inPot.has(favorite.id)}
          onPress={() => onTilePress(favorite)}
          onRemoveFavorite={() => onRemoveFavorite(favorite)}
        />
      ))}

      {editing ? null : (
        <Pressable
          accessibilityLabel={strings.pot.addTileLabel(category)}
          accessibilityRole="button"
          onPress={onAdd}
          style={[
            styles.addTile,
            { width: Math.round(TILE_WIDTH * textScale), borderColor: accent },
          ]}
          testID="add-tile"
        >
          <Text allowFontScaling={false} style={[styles.plus, { color: accent }]}>
            +
          </Text>
          <Text style={[type.smallStrong, { color: colors.ink2 }]}>{strings.pot.add}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // A ScrollView grows and shrinks by default. This row should keep its own height.
  scroll: { flexGrow: 0, flexShrink: 0 },
  row: {
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    alignItems: 'stretch',
  },
  empty: { alignSelf: 'center', maxWidth: 220 },
  addTile: {
    minHeight: TILE_HEIGHT,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  plus: { fontSize: 28, lineHeight: 32 },
});
