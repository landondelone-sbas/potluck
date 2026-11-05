import { act, render } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DragProvider, useDrag } from '@/components/drag/drag-context';
import type { Favorite } from '@/domain/favorites';
import * as haptics from '@/lib/haptics';

jest.mock('@/lib/haptics');

const salmon: Favorite = { id: 's', name: 'Salmon', category: 'protein', createdAt: 1 };

type Drag = ReturnType<typeof useDrag>;

/** Mount the provider and hand back its API, so the drag logic can be driven without a finger. */
async function mountProvider(onDropOnPot: (id: string) => void) {
  const api: { current: Drag | null } = { current: null };
  function Probe() {
    api.current = useDrag();
    return null;
  }
  await render(
    <GestureHandlerRootView>
      <DragProvider onDropOnPot={onDropOnPot}>
        <Probe />
      </DragProvider>
    </GestureHandlerRootView>,
  );
  const drag = () => {
    if (!api.current) throw new Error('provider not mounted');
    return api.current;
  };
  return drag;
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('DragProvider', () => {
  test('lifting a tile shows its ghost and gives a haptic tap', async () => {
    const drag = await mountProvider(jest.fn());
    expect(drag().ghost).toBeNull();
    await act(async () => drag().beginDrag(salmon));
    expect(drag().ghost).toEqual(salmon);
    expect(haptics.pickUp).toHaveBeenCalledTimes(1);
  });

  test('dropping on the pot hands the favorite to the screen and clears the ghost', async () => {
    const onDrop = jest.fn();
    const drag = await mountProvider(onDrop);
    await act(async () => drag().beginDrag(salmon));
    await act(async () => drag().endDrag('s', true));
    expect(onDrop).toHaveBeenCalledWith('s');
    expect(drag().ghost).toBeNull();
    expect(drag().ghostOpacity.get()).toBe(0);
    expect(drag().overPot.get()).toBe(false);
  });

  test('dropping anywhere else cancels: nothing is added', async () => {
    const onDrop = jest.fn();
    const drag = await mountProvider(onDrop);
    await act(async () => drag().beginDrag(salmon));
    await act(async () => drag().endDrag('s', false));
    expect(onDrop).not.toHaveBeenCalled();
    expect(drag().ghost).toBeNull();
  });

  test('a press just after a drag is ignored, so a drag never also counts as a tap', async () => {
    const drag = await mountProvider(jest.fn());
    expect(drag().recentlyDragged()).toBe(false);

    await act(async () => drag().endDrag('s', false));
    expect(drag().recentlyDragged()).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(drag().recentlyDragged()).toBe(false);
  });
});
