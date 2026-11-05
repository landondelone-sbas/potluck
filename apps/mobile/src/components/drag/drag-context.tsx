import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import type { HostInstance } from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

import type { Favorite } from '@/domain/favorites';
import type { Rect } from '@/domain/hit-test';
import { pickUp } from '@/lib/haptics';

/** Out of reach until the pot has been measured, so nothing can be "over" it by accident. */
/** A press this soon after a drag ended is the browser's click on the dragged tile, not a tap. */
const TAP_AFTER_DRAG_MS = 250;

const UNMEASURED: Rect = { x: -10000, y: -10000, width: 0, height: 0 };

interface DragContextValue {
  /** The favorite being dragged or flown, or null. Drives what the ghost shows. */
  ghost: Favorite | null;
  /** Center of the ghost, in the ghost layer's own coordinates. */
  ghostX: SharedValue<number>;
  ghostY: SharedValue<number>;
  ghostOpacity: SharedValue<number>;
  /** True while the dragged ghost is over the pot. */
  overPot: SharedValue<boolean>;
  /** The pot's position in window coordinates. */
  potRect: SharedValue<Rect>;
  /** The ghost layer's own position in window coordinates. */
  layerOrigin: SharedValue<{ x: number; y: number }>;
  potRef: RefObject<HostInstance | null>;
  layerRef: RefObject<HostInstance | null>;
  /** Measure the pot and the ghost layer again. Cheap: called when a touch starts on a tile. */
  remeasure: () => void;
  beginDrag: (favorite: Favorite) => void;
  endDrag: (favoriteId: string, droppedOnPot: boolean) => void;
  /** True just after a drag ended. A tap in that moment is the tail of the drag, not a tap. */
  recentlyDragged: () => boolean;
}

const DragContext = createContext<DragContextValue | null>(null);

export function useDrag(): DragContextValue {
  const value = useContext(DragContext);
  if (!value) throw new Error('useDrag must be used inside <DragProvider>');
  return value;
}

interface DragProviderProps {
  children: ReactNode;
  /** An item was dropped on the pot. The screen decides whether the pot takes it. */
  onDropOnPot: (favoriteId: string) => void;
}

/**
 * Shared state for dragging a tile into the pot. Tapping a tile does not use this: the token
 * animates in by itself. The ghost position and the "over the pot" flag are
 * Reanimated shared values, so the finger is followed on the UI thread with no React render per
 * frame. Only the start and the end of a drag cross to React.
 */
export function DragProvider({ children, onDropOnPot }: DragProviderProps) {
  const [ghost, setGhost] = useState<Favorite | null>(null);

  const ghostX = useSharedValue(0);
  const ghostY = useSharedValue(0);
  const ghostOpacity = useSharedValue(0);
  const overPot = useSharedValue(false);
  const potRect = useSharedValue<Rect>(UNMEASURED);
  const layerOrigin = useSharedValue({ x: 0, y: 0 });
  const potRef = useRef<HostInstance | null>(null);
  const layerRef = useRef<HostInstance | null>(null);
  const lastDragEnd = useRef(0);

  const remeasure = useCallback(() => {
    potRef.current?.measureInWindow((x, y, width, height) => {
      potRect.set({ x, y, width, height });
    });
    layerRef.current?.measureInWindow((x, y) => {
      layerOrigin.set({ x, y });
    });
  }, [potRect, layerOrigin]);

  const beginDrag = useCallback(
    (favorite: Favorite) => {
      setGhost(favorite);
      pickUp();
    },
    [setGhost],
  );

  const endDrag = useCallback(
    (favoriteId: string, droppedOnPot: boolean) => {
      lastDragEnd.current = Date.now();
      ghostOpacity.set(0);
      overPot.set(false);
      setGhost(null);
      if (droppedOnPot) onDropOnPot(favoriteId);
    },
    [ghostOpacity, overPot, onDropOnPot],
  );

  const recentlyDragged = useCallback(
    () => Date.now() - lastDragEnd.current < TAP_AFTER_DRAG_MS,
    [],
  );

  const value = useMemo<DragContextValue>(
    () => ({
      ghost,
      ghostX,
      ghostY,
      ghostOpacity,
      overPot,
      potRect,
      layerOrigin,
      potRef,
      layerRef,
      remeasure,
      beginDrag,
      endDrag,
      recentlyDragged,
    }),
    [
      ghost,
      ghostX,
      ghostY,
      ghostOpacity,
      overPot,
      potRect,
      layerOrigin,
      remeasure,
      beginDrag,
      endDrag,
      recentlyDragged,
    ],
  );

  return <DragContext.Provider value={value}>{children}</DragContext.Provider>;
}
