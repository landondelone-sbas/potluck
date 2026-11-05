import { tagsFor, type Category, type PotItem } from '@potluck/engine';

/** Longest favorite name we keep (ONB-3). */
export const MAX_NAME_LENGTH = 40;

/**
 * A food the user likes. Tags and icon are derived from the name on demand, not stored, so an app
 * update that improves the tag rules improves existing favorites too, with no migration.
 */
export interface Favorite {
  id: string;
  name: string;
  category: Category;
  /** Milliseconds since the epoch. */
  createdAt: number;
}

/** Collapse whitespace, trim, cap the length and capitalise the first letter. */
export function normalizeName(raw: string): string {
  const collapsed = raw.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH).trim();
  return collapsed.charAt(0).toUpperCase() + collapsed.slice(1);
}

function sameName(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export function findFavorite(
  favorites: readonly Favorite[],
  category: Category,
  name: string,
): Favorite | undefined {
  return favorites.find((f) => f.category === category && sameName(f.name, name));
}

export type AddFavoriteOutcome =
  | { status: 'added'; favorite: Favorite; favorites: Favorite[] }
  | { status: 'duplicate'; existing: Favorite; favorites: Favorite[] }
  | { status: 'empty'; favorites: Favorite[] };

/**
 * Add a favorite to a category. Pure: the caller supplies the id and the time.
 * Duplicates are judged within the category only, ignoring case (ONB-3).
 */
export function addFavorite(
  favorites: readonly Favorite[],
  category: Category,
  rawName: string,
  meta: { id: string; now: number },
): AddFavoriteOutcome {
  const name = normalizeName(rawName);
  if (!name) return { status: 'empty', favorites: [...favorites] };

  const existing = findFavorite(favorites, category, name);
  if (existing) return { status: 'duplicate', existing, favorites: [...favorites] };

  const favorite: Favorite = { id: meta.id, name, category, createdAt: meta.now };
  return { status: 'added', favorite, favorites: [...favorites, favorite] };
}

export function removeFavorite(favorites: readonly Favorite[], id: string): Favorite[] {
  return favorites.filter((f) => f.id !== id);
}

/** What the engine sees for a favorite. */
export function toPotItem(favorite: Favorite): PotItem {
  return {
    name: favorite.name,
    category: favorite.category,
    tags: tagsFor(favorite.category, favorite.name),
  };
}
