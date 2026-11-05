import { fireEvent, screen } from '@testing-library/react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import CookLogScreen from '@/app/log';
import RecipeScreen from '@/app/recipe/[id]';
import { formatDay } from '@/lib/format';
import { usePotluck } from '@/state/store';

import { idOf, resetStore, seedFullPantry } from '../../test-utils/pantry';
import { renderScreen } from '../../test-utils/render';
import { mockParams, mockRouter } from '../../test-utils/router-mock';

jest.mock('expo-router', () => jest.requireActual('../../test-utils/router-mock'));
jest.mock('expo-keep-awake');

/** Cook these favorites, make the first dish, and return its cook log entry. */
function makeTonight(names: string[]) {
  const state = usePotluck.getState();
  for (const name of names) state.addToPot(idOf(name));
  const run = state.cook();
  const entry = state.logCooked(run?.result.results[0]?.dish.id ?? '');
  if (!entry || !run) throw new Error('nothing was made');
  return { entry, card: run.result.results[0]! };
}

beforeEach(() => {
  jest.clearAllMocks();
  seedFullPantry();
});

describe('the recipe screen', () => {
  test('shows the title, the numbered steps and the tip, from the cook log entry (REC-1)', async () => {
    const { entry, card } = makeTonight(['Chicken thighs', 'Broccoli', 'Ginger', 'Soy sauce']);
    mockParams.current = { id: entry.id };
    await renderScreen(<RecipeScreen />);

    expect(screen.getByText(card.title)).toBeTruthy();
    card.steps.forEach((step, index) => {
      expect(screen.getByText(step)).toBeTruthy();
      expect(screen.getByText(`${index + 1}.`)).toBeTruthy();
    });
    expect(screen.getByText(card.dish.tip, { exact: false })).toBeTruthy();
  });

  test('lists what came from the pot, what the chef adds, and the pantry staples', async () => {
    const { entry, card } = makeTonight(['Eggs', 'Spinach', 'Sourdough', 'Chili flakes']);
    mockParams.current = { id: entry.id };
    await renderScreen(<RecipeScreen />);

    for (const item of card.used)
      expect(screen.getAllByLabelText(item.name).length).toBeGreaterThan(0);
    expect(card.chefAdds.length).toBeGreaterThan(0);
    expect(screen.getByText('The chef adds')).toBeTruthy();
    expect(screen.getByText(/Oil, salt, pepper and water/)).toBeTruthy();
  });

  test('lists what was left out of this dish', async () => {
    // Find a cook where some dish really does leave something out, so the test cannot pass by luck.
    const pots = [
      ['Salmon', 'Ground beef', 'Zucchini'],
      ['Eggs', 'Spinach', 'Sourdough', 'Cumin', 'Salsa verde'],
      ['Chicken thighs', 'Broccoli', 'Jasmine rice', 'Cinnamon', 'Ranch'],
    ];
    let made: ReturnType<typeof makeTonight> | undefined;
    for (const names of pots) {
      usePotluck.getState().clearPot();
      const state = usePotluck.getState();
      for (const name of names) state.addToPot(idOf(name));
      const run = state.cook();
      const withLeftOut = run?.result.results.find((card) => card.leftOut.length > 0);
      if (withLeftOut) {
        const entry = state.logCooked(withLeftOut.dish.id);
        if (entry) made = { entry, card: withLeftOut };
        break;
      }
    }
    if (!made) throw new Error('No candidate pot left anything out');

    mockParams.current = { id: made.entry.id };
    await renderScreen(<RecipeScreen />);
    expect(screen.getByText('Left out of this dish')).toBeTruthy();
    for (const item of made.card.leftOut) {
      expect(screen.getAllByLabelText(item.name).length).toBeGreaterThan(0);
    }
  });

  test('works from the log alone: the pantry can change and the recipe is the same', async () => {
    const { entry, card } = makeTonight(['Salmon', 'Zucchini', 'Quinoa', 'Lemon pepper', 'Pesto']);
    usePotluck.getState().resetAll();
    usePotluck.setState({ cookLog: [entry], onboardingComplete: true });
    mockParams.current = { id: entry.id };
    await renderScreen(<RecipeScreen />);

    expect(screen.getByText(card.title)).toBeTruthy();
    expect(screen.getByText(card.steps[0]!)).toBeTruthy();
  });

  test('says when the dish is no longer in the app, and still shows the entry', async () => {
    const { entry } = makeTonight(['Salmon', 'Zucchini']);
    usePotluck.setState({ cookLog: [{ ...entry, dishId: 'removed-dish' }] });
    mockParams.current = { id: entry.id };
    await renderScreen(<RecipeScreen />);

    expect(screen.getByText(entry.title)).toBeTruthy();
    expect(screen.getByText(/no longer in the app/)).toBeTruthy();
  });

  test('says so for an entry that does not exist', async () => {
    mockParams.current = { id: 'nope' };
    await renderScreen(<RecipeScreen />);
    expect(screen.getByText('That cook log entry could not be found.')).toBeTruthy();
  });

  test('keeps the screen awake only when the user switches it on (REC-3)', async () => {
    const { entry } = makeTonight(['Salmon', 'Zucchini']);
    mockParams.current = { id: entry.id };
    const view = await renderScreen(<RecipeScreen />);
    expect(activateKeepAwakeAsync).not.toHaveBeenCalled();

    await fireEvent(screen.getByLabelText('Keep the screen on while cooking'), 'valueChange', true);
    expect(usePotluck.getState().keepAwake).toBe(true);
    expect(activateKeepAwakeAsync).toHaveBeenCalledTimes(1);

    await view.unmount();
    expect(deactivateKeepAwake).toHaveBeenCalledTimes(1);
  });

  test('turns it off again when the switch is turned off', async () => {
    const { entry } = makeTonight(['Salmon', 'Zucchini']);
    usePotluck.setState({ keepAwake: true });
    mockParams.current = { id: entry.id };
    await renderScreen(<RecipeScreen />);
    expect(activateKeepAwakeAsync).toHaveBeenCalledTimes(1);

    await fireEvent(
      screen.getByLabelText('Keep the screen on while cooking'),
      'valueChange',
      false,
    );
    expect(deactivateKeepAwake).toHaveBeenCalledTimes(1);
  });
});

describe('the cook log screen', () => {
  test('explains itself when nothing has been cooked', async () => {
    resetStore();
    await renderScreen(<CookLogScreen />);
    expect(screen.getByTestId('log-empty')).toHaveTextContent(/Nothing cooked yet/);
  });

  test('lists dishes made, newest first, with the day (REC-4)', async () => {
    const older = makeTonight(['Salmon', 'Zucchini']).entry;
    usePotluck.getState().clearPot();
    const newer = makeTonight(['Eggs', 'Spinach']).entry;
    usePotluck.setState({
      cookLog: [
        { ...newer, cookedAt: new Date(2026, 10, 4, 12).getTime() },
        { ...older, cookedAt: new Date(2026, 10, 3, 12).getTime() },
      ],
    });

    await renderScreen(<CookLogScreen />);
    const rows = screen.getAllByTestId(/^log-/);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAccessibleName(
      new RegExp(`^${newer.title}, ${formatDay(new Date(2026, 10, 4, 12).getTime())}`),
    );
    expect(rows[1]).toHaveAccessibleName(new RegExp(`^${older.title}`));
  });

  test('opening an entry opens its recipe', async () => {
    const { entry } = makeTonight(['Salmon', 'Zucchini']);
    await renderScreen(<CookLogScreen />);
    await fireEvent.press(screen.getByTestId(`log-${entry.id}`));
    expect(mockRouter.push).toHaveBeenCalledWith(`/recipe/${entry.id}`);
  });
});
