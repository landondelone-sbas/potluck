import { AccessibilityInfo } from 'react-native';

/**
 * Say something to screen reader users without moving focus, for changes they cannot see, such as
 * an item landing in the pot. Does nothing when no screen reader is running.
 */
export function announce(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}
