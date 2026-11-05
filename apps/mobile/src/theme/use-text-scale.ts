import { useWindowDimensions } from 'react-native';

/** The most the layout grows for: PRD section 12.4 asks for at least 200 percent. */
const MAX_SCALE = 2;

/**
 * How much the user has enlarged text, from 1 (normal) to 2. Fixed-size boxes that hold text, like
 * pantry tiles, multiply their width by this so enlarged words fit instead of being clipped.
 */
export function useTextScale(): number {
  const { fontScale } = useWindowDimensions();
  return Math.min(MAX_SCALE, Math.max(1, fontScale));
}
