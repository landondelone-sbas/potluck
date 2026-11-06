/**
 * Amounts for the recipe view (PRD REC-2, REC-5, SET-5). A dish stores one amount per category for
 * two servings, in metric: grams, millilitres, or a plain count. The display scales it to the
 * servings asked for and writes it in the unit system the user picked.
 */

export type AmountUnit = 'g' | 'ml' | 'n';

export interface Amount {
  qty: number;
  unit: AmountUnit;
}

export type UnitSystem = 'us' | 'metric';

/** Every amount in the library is written for this many servings. */
export const BASE_SERVINGS = 2;
export const MIN_SERVINGS = 1;
export const MAX_SERVINGS = 8;

const GRAMS_PER_OUNCE = 28.35;
const ML_PER_TSP = 4.93;
const ML_PER_TBSP = 14.79;
const ML_PER_CUP = 236.6;

const FRACTIONS: Readonly<Record<number, string>> = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

/** Round to a step, then write whole numbers and quarters as "1½", "¾" and so on. */
function mixed(value: number, step: number): string {
  const rounded = Math.round(value / step) * step;
  const whole = Math.floor(rounded);
  const part = Math.round((rounded - whole) * 100) / 100;
  const fraction = FRACTIONS[part];
  if (part === 0) return String(whole);
  if (fraction === undefined) return String(rounded);
  return whole === 0 ? fraction : `${whole}${fraction}`;
}

/** A tidy metric number: coarser as the amount grows. */
function tidy(value: number): number {
  if (value < 10) return Math.round(value * 2) / 2;
  if (value < 100) return Math.round(value / 5) * 5;
  return Math.round(value / 10) * 10;
}

function metric(qty: number, unit: 'g' | 'ml'): string {
  const value = tidy(qty);
  if (value >= 1000) return `${Math.round(value / 100) / 10} ${unit === 'g' ? 'kg' : 'L'}`;
  return `${value} ${unit}`;
}

function usWeight(grams: number): string {
  const ounces = grams / GRAMS_PER_OUNCE;
  // 450 g is 15.9 oz and reads as a pound: decide on the rounded figure.
  if (Math.round(ounces * 2) / 2 >= 16) return `${mixed(ounces / 16, 0.25)} lb`;
  return `${mixed(Math.max(ounces, 0.5), 0.5)} oz`;
}

function usVolume(ml: number): string {
  if (ml < 3 * ML_PER_TSP) return `${mixed(Math.max(ml / ML_PER_TSP, 0.25), 0.25)} tsp`;
  if (ml < 4 * ML_PER_TBSP) return `${mixed(ml / ML_PER_TBSP, 0.5)} tbsp`;
  return `${mixed(ml / ML_PER_CUP, 0.25)} ${ml / ML_PER_CUP <= 1.125 ? 'cup' : 'cups'}`;
}

/** The amount for `servings` people, written in `system`. Counts are the same in both systems. */
export function formatAmount(
  amount: Amount,
  system: UnitSystem,
  servings: number = BASE_SERVINGS,
): string {
  const qty = (amount.qty * servings) / BASE_SERVINGS;
  if (amount.unit === 'n') return String(Math.max(1, Math.round(qty)));
  if (system === 'metric') return metric(qty, amount.unit);
  return amount.unit === 'g' ? usWeight(qty) : usVolume(qty);
}

/** When `count` items share a category they share its amount, so each gets an equal part. */
export function splitAmount(amount: Amount, count: number): Amount {
  if (count <= 1) return amount;
  return { qty: amount.qty / count, unit: amount.unit };
}
