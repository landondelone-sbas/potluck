export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Slack around the pot that still counts as over it (PRD section 12.2: the pot plus a margin). */
export const DROP_MARGIN = 10;

/** How far above the finger the dragged ghost sits, so the finger does not hide it. */
export const GHOST_LIFT = 36;

/**
 * True when the point is over the rectangle, allowing `margin` points of slack on every side.
 * Runs on the UI thread during a drag, hence the directive.
 */
export function isOverRect(
  px: number,
  py: number,
  rect: Rect,
  margin: number = DROP_MARGIN,
): boolean {
  'worklet';
  return (
    px >= rect.x - margin &&
    px <= rect.x + rect.width + margin &&
    py >= rect.y - margin &&
    py <= rect.y + rect.height + margin
  );
}
