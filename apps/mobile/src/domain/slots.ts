/**
 * Where tokens sit in the pot, as [x, y] percentages of the pot drawing's width and height. The
 * middle row fills first, then the row below, then two above it and one on top, so a full pot
 * looks heaped. Laid out for the cropped pot drawing in `pot-view.tsx`.
 */
export const POT_SLOTS: readonly (readonly [number, number])[] = [
  [50, 40],
  [38.5, 40],
  [61.5, 40],
  [27, 40],
  [73, 40],
  [44, 58],
  [56, 58],
  [32.5, 58],
  [67.5, 58],
  [44, 22],
  [56, 22],
  [50, 8],
];

/**
 * Give each id in the pot a slot. An id keeps the slot it had, so removing one token does not
 * make the others jump. New ids take the lowest free slot.
 */
export function assignSlots(
  pot: readonly string[],
  previous: Readonly<Record<string, number>>,
): Record<string, number> {
  const next: Record<string, number> = {};
  const taken = new Set<number>();

  for (const id of pot) {
    const slot = previous[id];
    if (slot !== undefined && !taken.has(slot)) {
      next[id] = slot;
      taken.add(slot);
    }
  }
  for (const id of pot) {
    if (next[id] !== undefined) continue;
    let slot = 0;
    while (taken.has(slot)) slot += 1;
    next[id] = slot;
    taken.add(slot);
  }
  return next;
}
