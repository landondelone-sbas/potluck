import type { PotItem } from './types';

export type PlateNudge =
  /** Nothing in the pot yet. */
  | 'empty'
  /** Protein, veg and starch are all in. */
  | 'balanced'
  /** Protein and starch but no veg: aim for about half the plate. */
  | 'needs-veg'
  /** None of protein, veg or starch: add one for sharper matches. */
  | 'needs-base'
  /** Anything else: skipped categories are left to the chef. */
  | 'chef-fills';

/** Which plate-nudge message applies to this pot (PRD section 9.6). */
export function plateNudge(pot: readonly PotItem[]): PlateNudge {
  if (pot.length === 0) return 'empty';
  const has = (category: PotItem['category']) => pot.some((item) => item.category === category);
  const protein = has('protein');
  const veg = has('veg');
  const starch = has('starch');

  if (protein && veg && starch) return 'balanced';
  if (protein && starch && !veg) return 'needs-veg';
  if (!protein && !veg && !starch) return 'needs-base';
  return 'chef-fills';
}
