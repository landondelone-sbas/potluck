import { DROP_MARGIN, isOverRect } from '@/domain/hit-test';
import { POT_SLOTS, assignSlots } from '@/domain/slots';

describe('assignSlots', () => {
  test('new ids take the lowest free slots, in order', () => {
    expect(assignSlots(['a', 'b', 'c'], {})).toEqual({ a: 0, b: 1, c: 2 });
  });

  test('an id keeps its slot when another is removed', () => {
    const first = assignSlots(['a', 'b', 'c'], {});
    expect(assignSlots(['a', 'c'], first)).toEqual({ a: 0, c: 2 });
  });

  test('a freed slot is reused by the next new id', () => {
    const first = assignSlots(['a', 'b', 'c'], {});
    expect(assignSlots(['a', 'c', 'd'], first)).toEqual({ a: 0, c: 2, d: 1 });
  });

  test('twelve ids get twelve different slots that exist', () => {
    const ids = Array.from({ length: 12 }, (_, i) => `id${i}`);
    const slots = Object.values(assignSlots(ids, {}));
    expect(new Set(slots).size).toBe(12);
    expect(Math.max(...slots)).toBeLessThan(POT_SLOTS.length);
  });
});

describe('isOverRect', () => {
  const rect = { x: 100, y: 200, width: 150, height: 120 };

  test('is true inside', () => {
    expect(isOverRect(150, 250, rect)).toBe(true);
  });

  test('is true within the margin and false just past it', () => {
    expect(isOverRect(100 - DROP_MARGIN, 200, rect)).toBe(true);
    expect(isOverRect(100 - DROP_MARGIN - 1, 200, rect)).toBe(false);
    expect(isOverRect(250 + DROP_MARGIN, 320 + DROP_MARGIN, rect)).toBe(true);
    expect(isOverRect(250, 320 + DROP_MARGIN + 1, rect)).toBe(false);
  });

  test('is false well outside', () => {
    expect(isOverRect(10, 10, rect)).toBe(false);
  });
});
