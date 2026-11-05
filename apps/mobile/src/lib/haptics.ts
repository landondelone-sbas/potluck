import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback (POT-12). Every call is fire and forget: a device without a haptic engine, or
 * with haptics switched off, must never break a drag.
 */
function safely(run: () => Promise<void>): void {
  run().catch(() => undefined);
}

/** A tile is lifted. */
export function pickUp(): void {
  safely(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** An item landed in the pot. */
export function dropped(): void {
  safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

/** An item was refused, for example because the pot is full. */
export function rejected(): void {
  safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}
