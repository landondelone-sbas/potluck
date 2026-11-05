import type { Category } from './categories';
import { titleCase } from './text';
import type { PotItem } from './types';

/** Style word chosen by the starch's tag. */
const STARCH_STYLES: Readonly<Record<string, string>> = {
  noodles: 'Noodle Bowl',
  pasta: 'Skillet Pasta',
  rice: 'Rice Bowl',
  sweetpotato: 'Sweet Potato Roast',
  potato: 'Potato Skillet',
  bread: 'Melt',
  tortilla: 'Wraps',
  quinoa: 'Grain Bowl',
  couscous: 'Grain Bowl',
};

/**
 * Placeholder name for the wildcard card, where the AI chef goes later (PRD section 9.5).
 * Built from the first protein, first veg, a style from the starch, and the sauce.
 */
export function wildcardName(pot: readonly PotItem[]): string {
  const first = (category: Category) => pot.find((item) => item.category === category);
  const protein = first('protein');
  const veg = first('veg');
  const starch = first('starch');
  const sauce = first('sauce');

  let style = 'Skillet';
  if (starch) {
    const key = starch.tags.find((tag) => STARCH_STYLES[tag] !== undefined);
    style = (key !== undefined && STARCH_STYLES[key]) || 'Bowl';
  }

  const base =
    [protein && titleCase(protein.name), veg && titleCase(veg.name)].filter(Boolean).join(' & ') ||
    'Pantry';

  return `${base} ${style}${sauce ? ` with ${titleCase(sauce.name)}` : ''}`;
}
