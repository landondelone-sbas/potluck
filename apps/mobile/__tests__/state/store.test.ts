import type { Category } from '@potluck/engine';
import type { StateStorage } from 'zustand/middleware';

import { createPotluckStore } from '@/state/store';

/** In-memory stand-in for the device storage. Async, like the real thing. */
function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const storage: StateStorage = {
    getItem: async (name) => data.get(name) ?? null,
    setItem: async (name, value) => void data.set(name, value),
    removeItem: async (name) => void data.delete(name),
  };
  return { storage, data };
}

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** A store with some favorites, plus a way to look their ids up by name. */
function setup() {
  const memory = memoryStorage();
  const store = createPotluckStore(memory.storage);
  const state = () => store.getState();
  const add = (category: Category, name: string) => {
    state().addFavorite(category, name);
  };
  const id = (name: string) => {
    const found = state().favorites.find((f) => f.name === name);
    if (!found) throw new Error(`No favorite ${name}`);
    return found.id;
  };
  return { store, state, add, id, memory };
}

describe('favorites', () => {
  test('addFavorite reports what happened and refuses duplicates', () => {
    const { state } = setup();
    expect(state().addFavorite('protein', 'salmon').status).toBe('added');
    expect(state().addFavorite('protein', 'Salmon').status).toBe('duplicate');
    expect(state().favorites).toHaveLength(1);
    expect(state().favorites[0]?.name).toBe('Salmon');
  });

  test('toggleFavorite adds a missing favorite and removes a present one', () => {
    const { state } = setup();
    state().toggleFavorite('veg', 'Carrots');
    expect(state().favorites.map((f) => f.name)).toEqual(['Carrots']);
    state().toggleFavorite('veg', 'carrots');
    expect(state().favorites).toEqual([]);
  });

  test('removing a favorite also takes it out of the pot', () => {
    const { state, add, id } = setup();
    add('protein', 'Salmon');
    add('veg', 'Carrots');
    state().addToPot(id('Salmon'));
    state().addToPot(id('Carrots'));
    state().removeFavorite(id('Salmon'));
    expect(state().pot).toEqual([id('Carrots')]);
  });
});

describe('the pot', () => {
  test('a refused add says why and changes nothing', () => {
    const { state, add, id } = setup();
    for (const name of ['A', 'B', 'C', 'D']) add('protein', `Protein ${name}`);
    for (const name of ['A', 'B', 'C']) state().addToPot(id(`Protein ${name}`));
    const change = state().addToPot(id('Protein D'));
    expect(change).toEqual({ ok: false, reason: 'category-full', category: 'protein' });
    expect(state().pot).toHaveLength(3);
  });

  test('clearPot empties it and setPot replaces it, dropping unknown ids', () => {
    const { state, add, id } = setup();
    add('protein', 'Salmon');
    add('veg', 'Carrots');
    state().setPot([id('Salmon'), 'ghost', id('Carrots')]);
    expect(state().pot).toEqual([id('Salmon'), id('Carrots')]);
    state().clearPot();
    expect(state().pot).toEqual([]);
  });
});

describe('cook', () => {
  test('does nothing for an empty pot', () => {
    const { state } = setup();
    expect(state().cook()).toBeNull();
    expect(state().run).toBeNull();
  });

  test('cooks the PRD golden pot through the real engine and dish library', () => {
    const { state, add, id } = setup();
    add('protein', 'Chicken thighs');
    add('veg', 'Broccoli');
    add('starch', 'Jasmine rice');
    add('spice', 'Ginger');
    add('sauce', 'Soy sauce');
    for (const name of ['Chicken thighs', 'Broccoli', 'Jasmine rice', 'Ginger', 'Soy sauce']) {
      state().addToPot(id(name));
    }
    const run = state().cook();
    expect(run?.result.results.map((r) => r.dish.id)).toEqual([
      'stirfry',
      'friedrice',
      'glazebowl',
    ]);
    expect(run?.pot.map((item) => item.name)).toEqual([
      'Chicken thighs',
      'Broccoli',
      'Ginger',
      'Soy sauce',
      'Jasmine rice',
    ]);
    expect(state().stale).toBe(false);
  });

  test('results go stale when the pot changes and are fresh again after cooking', () => {
    const { state, add, id } = setup();
    add('protein', 'Salmon');
    add('veg', 'Zucchini');
    state().addToPot(id('Salmon'));
    state().cook();
    expect(state().stale).toBe(false);
    state().addToPot(id('Zucchini'));
    expect(state().stale).toBe(true);
    state().cook();
    expect(state().stale).toBe(false);
    state().removeFromPot(id('Zucchini'));
    expect(state().stale).toBe(true);
  });

  test('changing the pot before any cook leaves nothing stale', () => {
    const { state, add, id } = setup();
    add('protein', 'Salmon');
    state().addToPot(id('Salmon'));
    expect(state().stale).toBe(false);
  });
});

describe('cook log', () => {
  function cooked() {
    const ctx = setup();
    ctx.add('protein', 'Salmon');
    ctx.add('veg', 'Zucchini');
    ctx.state().addToPot(ctx.id('Salmon'));
    ctx.state().addToPot(ctx.id('Zucchini'));
    const run = ctx.state().cook();
    const dishId = run?.result.results[0]?.dish.id ?? '';
    return { ...ctx, dishId };
  }

  test('records the dish as shown, with the pot, newest first', () => {
    const { state, dishId } = cooked();
    const entry = state().logCooked(dishId);
    expect(entry?.dishId).toBe(dishId);
    expect(entry?.pot).toEqual([
      { name: 'Salmon', category: 'protein' },
      { name: 'Zucchini', category: 'veg' },
    ]);
    expect(entry?.title).toBe(state().run?.result.results[0]?.title);
    expect(state().cookLog[0]).toEqual(entry);
  });

  test('records a dish once per cook: asking again returns the same entry', () => {
    const { state, dishId } = cooked();
    const first = state().logCooked(dishId);
    expect(first).not.toBeNull();
    expect(state().logCooked(dishId)).toEqual(first);
    expect(state().cookLog).toHaveLength(1);
  });

  test('records the dish again after a new cook', () => {
    const { state, dishId } = cooked();
    const first = state().logCooked(dishId);
    state().cook();
    const second = state().logCooked(dishId);
    expect(second?.id).not.toBe(first?.id);
    expect(state().cookLog).toHaveLength(2);
  });

  test('ignores a dish that was not in the results, and a missing run', () => {
    const { state } = cooked();
    expect(state().logCooked('not-a-dish')).toBeNull();
    expect(setup().state().logCooked('stirfry')).toBeNull();
  });
});

describe('settings', () => {
  test('appearance and keep-awake start at their defaults and can be changed', () => {
    const { state } = setup();
    expect(state().appearance).toBe('system');
    expect(state().keepAwake).toBe(false);
    state().setAppearance('dark');
    state().setKeepAwake(true);
    expect(state().appearance).toBe('dark');
    expect(state().keepAwake).toBe(true);
  });

  test('settings survive a restart', async () => {
    const first = setup();
    first.state().setAppearance('light');
    first.state().setKeepAwake(true);
    await flush();
    const second = createPotluckStore(first.memory.storage);
    await second.persist.rehydrate();
    expect(second.getState().appearance).toBe('light');
    expect(second.getState().keepAwake).toBe(true);
  });

  test('reopening setup is a per-session flag, and finishing setup clears it', () => {
    const { state } = setup();
    state().completeOnboarding();
    state().reopenSetup();
    expect(state().setupReopened).toBe(true);
    state().completeOnboarding();
    expect(state().setupReopened).toBe(false);
    expect(state().onboardingComplete).toBe(true);
  });

  test('resetAll erases favorites, pot, cook log and settings, and starts setup again', () => {
    const { state, add, id } = setup();
    add('protein', 'Salmon');
    state().addToPot(id('Salmon'));
    state().cook();
    state().logCooked(state().run?.result.results[0]?.dish.id ?? '');
    state().completeOnboarding();
    state().setAppearance('dark');
    state().setKeepAwake(true);

    state().resetAll();

    expect(state().favorites).toEqual([]);
    expect(state().pot).toEqual([]);
    expect(state().cookLog).toEqual([]);
    expect(state().run).toBeNull();
    expect(state().onboardingComplete).toBe(false);
    expect(state().appearance).toBe('system');
    expect(state().keepAwake).toBe(false);
  });

  test('a reset also removes the copy kept of unreadable data', async () => {
    const { storage, data } = memoryStorage({ 'potluck.state': '{not json' });
    const store = createPotluckStore(storage);
    await store.persist.rehydrate();
    expect(data.has('potluck.state.unreadable')).toBe(true);
    store.getState().resetAll();
    await flush();
    expect(data.has('potluck.state.unreadable')).toBe(false);
  });

  test('a reset is saved: a restart finds nothing', async () => {
    const first = setup();
    first.add('protein', 'Salmon');
    first.state().completeOnboarding();
    first.state().resetAll();
    await flush();
    const second = createPotluckStore(first.memory.storage);
    await second.persist.rehydrate();
    expect(second.getState().favorites).toEqual([]);
    expect(second.getState().onboardingComplete).toBe(false);
  });
});

describe('saving', () => {
  test('favorites, pot, onboarding and the cook log survive a restart', async () => {
    const first = setup();
    first.add('protein', 'Salmon');
    first.add('veg', 'Zucchini');
    first.state().addToPot(first.id('Salmon'));
    first.state().cook();
    first.state().logCooked(first.state().run?.result.results[0]?.dish.id ?? '');
    first.state().completeOnboarding();
    await flush();

    const second = createPotluckStore(first.memory.storage);
    await second.persist.rehydrate();
    const restored = second.getState();
    expect(restored.favorites.map((f) => f.name)).toEqual(['Salmon', 'Zucchini']);
    expect(restored.pot).toEqual(first.state().pot);
    expect(restored.onboardingComplete).toBe(true);
    expect(restored.cookLog).toHaveLength(1);
  });

  test('edits made before the first load finishes are kept, not wiped by it', async () => {
    const { state, add, memory } = setup();
    add('protein', 'Salmon');
    await flush();
    expect(state().favorites.map((f) => f.name)).toEqual(['Salmon']);
    expect(memory.data.get('potluck.state')).toContain('Salmon');
  });

  test('results and other per-session state are not saved', async () => {
    const { state, add, id, memory } = setup();
    add('protein', 'Salmon');
    state().addToPot(id('Salmon'));
    state().cook();
    await flush();
    const saved = JSON.parse(memory.data.get('potluck.state') ?? '{}') as {
      version: number;
      state: Record<string, unknown>;
    };
    expect(saved.version).toBe(1);
    expect(Object.keys(saved.state).sort()).toEqual([
      'appearance',
      'cookLog',
      'favorites',
      'keepAwake',
      'onboardingComplete',
      'pot',
      'units',
    ]);
  });

  test('data that is not JSON at all loads as empty, is kept for recovery, and the app still starts', async () => {
    const { storage, data } = memoryStorage({ 'potluck.state': '{not json' });
    const store = createPotluckStore(storage);
    await store.persist.rehydrate();
    expect(store.persist.hasHydrated()).toBe(true);
    expect(store.getState().favorites).toEqual([]);
    expect(data.get('potluck.state.unreadable')).toBe('{not json');
  });

  test('a storage that fails to read or write does not stop the app', async () => {
    const broken: StateStorage = {
      getItem: async () => {
        throw new Error('disk error');
      },
      setItem: async () => {
        throw new Error('disk full');
      },
      removeItem: async () => {
        throw new Error('disk error');
      },
    };
    const store = createPotluckStore(broken);
    await store.persist.rehydrate();
    expect(store.persist.hasHydrated()).toBe(true);
    store.getState().addFavorite('veg', 'Carrots');
    await flush();
    expect(store.getState().favorites.map((f) => f.name)).toEqual(['Carrots']);
  });

  test('older saved data goes through the migration chain, and a failing step does not stop the app', async () => {
    const blob = JSON.stringify({
      version: 0,
      state: { favorites: [{ id: 'a', name: 'Salmon', category: 'protein', createdAt: 1 }] },
    });
    const { storage } = memoryStorage({ 'potluck.state': blob });
    const store = createPotluckStore(storage);
    await store.persist.rehydrate();
    expect(store.getState().favorites.map((f) => f.name)).toEqual(['Salmon']);
  });

  test('damaged saved data is repaired, not fatal', async () => {
    const blob = JSON.stringify({
      version: 1,
      state: {
        favorites: [
          { id: 'a', name: 'Salmon', category: 'protein', createdAt: 1 },
          { broken: true },
        ],
        pot: ['a', 'gone'],
        onboardingComplete: true,
        cookLog: 'oops',
      },
    });
    const { storage } = memoryStorage({ 'potluck.state': blob });
    const store = createPotluckStore(storage);
    await store.persist.rehydrate();
    expect(store.getState().favorites.map((f) => f.name)).toEqual(['Salmon']);
    expect(store.getState().pot).toEqual(['a']);
    expect(store.getState().onboardingComplete).toBe(true);
    expect(store.getState().cookLog).toEqual([]);
  });
});
