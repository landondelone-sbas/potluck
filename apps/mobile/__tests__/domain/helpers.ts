import type { Category } from '@potluck/engine';

import type { Favorite } from '@/domain/favorites';

let counter = 0;

/** A favorite with a predictable id: pass an id to refer to it later. */
export function fav(category: Category, name: string, id?: string): Favorite {
  counter += 1;
  return { id: id ?? `f${counter}`, name, category, createdAt: counter };
}

export function namesOf(favorites: readonly Favorite[], ids: readonly string[]): string[] {
  return ids.map((id) => {
    const found = favorites.find((f) => f.id === id);
    if (!found) throw new Error(`No favorite with id ${id}`);
    return found.name;
  });
}
