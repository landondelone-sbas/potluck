import { act, fireEvent, screen } from '@testing-library/react-native';

import ResultsScreen from '@/app/results';
import { usePotluck } from '@/state/store';

import { idOf, resetStore, seedFullPantry } from '../../test-utils/pantry';
import { renderScreen } from '../../test-utils/render';
import { mockRouter } from '../../test-utils/router-mock';

jest.mock('expo-router', () => jest.requireActual('../../test-utils/router-mock'));

/** Fill the pot with these favorites and cook, as the pot screen does. */
function cookWith(names: string[]) {
  const state = usePotluck.getState();
  for (const name of names) state.addToPot(idOf(name));
  return state.cook();
}

const goldenPot = ['Chicken thighs', 'Broccoli', 'Jasmine rice', 'Ginger', 'Soy sauce'];
const freshPot = ['Salmon', 'Zucchini', 'Quinoa', 'Lemon pepper', 'Pesto'];

beforeEach(() => {
  mockRouter.back.mockClear();
  mockRouter.push.mockClear();
  seedFullPantry();
});

describe('with several dishes', () => {
  test('shows each dish with its title, a headline and the chef’s wildcard', async () => {
    const run = cookWith(goldenPot);
    await renderScreen(<ResultsScreen />);

    expect(screen.getByText('Chicken Thighs & Broccoli Stir-Fry')).toBeTruthy();
    expect(screen.getByText('Chicken Thighs Fried Rice')).toBeTruthy();
    expect(screen.getByText('Glazed Chicken Thighs & Broccoli Bowl')).toBeTruthy();
    expect(screen.getByTestId('headline')).toHaveTextContent(/A few ways to go\./);
    expect(screen.getByText(run?.result.wildcard ?? 'missing')).toBeTruthy();
    expect(screen.getByText(/AI preview/)).toBeTruthy();
  });

  test('says how much of the pot each dish used, and marks what was used', async () => {
    cookWith(goldenPot);
    await renderScreen(<ResultsScreen />);
    expect(screen.getAllByText('Uses 5 of 5 picks')).toHaveLength(3);
    expect(screen.getAllByLabelText('Ginger').length).toBeGreaterThan(0);
  });

  test('marks what the chef adds and what is left out, in words as well as styling', async () => {
    // Eggs and bread suit the pasta-less dishes; the chef supplies what the pot lacks.
    cookWith(['Eggs', 'Spinach', 'Sourdough', 'Chili flakes']);
    await renderScreen(<ResultsScreen />);
    expect(screen.getAllByLabelText(/the chef adds this/).length).toBeGreaterThan(0);
  });

  test('the steps start closed and open on tap', async () => {
    const run = cookWith(goldenPot);
    await renderScreen(<ResultsScreen />);
    const first = run?.result.results[0];
    expect(first).toBeDefined();
    const step = first?.steps[0] ?? '';
    expect(screen.queryByText(step)).toBeNull();

    await fireEvent.press(screen.getByTestId(`steps-toggle-${first?.dish.id}`));
    expect(screen.getByText(step)).toBeTruthy();
  });
});

describe('with one clear winner', () => {
  test('shows the single dish as the hero, with the steps open', async () => {
    const run = cookWith(freshPot);
    await renderScreen(<ResultsScreen />);

    expect(run?.result.mode).toBe('single');
    expect(screen.getByText('Lemon-Herb Salmon with Zucchini')).toBeTruthy();
    expect(screen.getByTestId('headline')).toHaveTextContent(/One clear winner\./);
    expect(screen.getByText(run?.result.results[0]?.steps[0] ?? 'missing')).toBeTruthy();
  });
});

describe('Make this tonight', () => {
  test('saves the dish to the cook log once and says so', async () => {
    cookWith(goldenPot);
    await renderScreen(<ResultsScreen />);

    await fireEvent.press(screen.getByTestId('make-stirfry'));
    const log = usePotluck.getState().cookLog;
    expect(log).toHaveLength(1);
    expect(log[0]).toMatchObject({
      dishId: 'stirfry',
      title: 'Chicken Thighs & Broccoli Stir-Fry',
      pot: [
        { name: 'Chicken thighs', category: 'protein' },
        { name: 'Broccoli', category: 'veg' },
        { name: 'Ginger', category: 'spice' },
        { name: 'Soy sauce', category: 'sauce' },
        { name: 'Jasmine rice', category: 'starch' },
      ],
    });
    expect(mockRouter.push).toHaveBeenCalledWith(`/recipe/${log[0]?.id}`);
  });

  test('pressing it again opens the same recipe and does not log it twice', async () => {
    cookWith(goldenPot);
    await renderScreen(<ResultsScreen />);

    await fireEvent.press(screen.getByTestId('make-stirfry'));
    expect(screen.getByTestId('make-stirfry')).toHaveTextContent('Open the recipe');
    await fireEvent.press(screen.getByTestId('make-stirfry'));

    const log = usePotluck.getState().cookLog;
    expect(log).toHaveLength(1);
    expect(mockRouter.push).toHaveBeenCalledTimes(2);
    expect(mockRouter.push).toHaveBeenLastCalledWith(`/recipe/${log[0]?.id}`);
  });
});

describe('what the chips mean', () => {
  test('touching a chef-added ingredient says so in words', async () => {
    cookWith(['Eggs', 'Spinach', 'Sourdough', 'Chili flakes']);
    await renderScreen(<ResultsScreen />);
    const chef = screen.getAllByLabelText(/the chef adds this/)[0];
    expect(chef).toBeTruthy();
    if (chef) await fireEvent.press(chef);
    expect(screen.getByText(/: the chef adds this\./)).toBeTruthy();
  });

  test('touching a left-out ingredient says why it is struck through', async () => {
    cookWith(['Salmon', 'Zucchini', 'Quinoa', 'Lemon pepper', 'Pesto', 'Ground beef']);
    await renderScreen(<ResultsScreen />);
    const left = screen.queryAllByLabelText(/left out of this dish/)[0];
    expect(left).toBeTruthy();
    if (left) await fireEvent.press(left);
    expect(screen.getByText(/: left out of this dish\./)).toBeTruthy();
  });
});

describe('when the pot has changed', () => {
  test('says the results are out of date and dims them, but keeps them', async () => {
    cookWith(goldenPot);
    await act(async () => {
      usePotluck.getState().removeFromPot(idOf('Ginger'));
    });
    await renderScreen(<ResultsScreen />);
    expect(screen.getByTestId('stale-note')).toHaveTextContent(
      /The pot changed since these were made/,
    );
    expect(screen.getByText('Chicken Thighs Fried Rice')).toBeTruthy();
  });

  test('shows no note when nothing has changed', async () => {
    cookWith(goldenPot);
    await renderScreen(<ResultsScreen />);
    expect(screen.queryByTestId('stale-note')).toBeNull();
  });
});

describe('without results', () => {
  test('explains and offers a way back', async () => {
    resetStore();
    await renderScreen(<ResultsScreen />);
    expect(screen.getByText(/Nothing has come out yet/)).toBeTruthy();
    await fireEvent.press(screen.getByText('Back to the pot'));
    expect(mockRouter.back).toHaveBeenCalled();
  });
});

test('Back to the pot goes back', async () => {
  cookWith(goldenPot);
  await renderScreen(<ResultsScreen />);
  await fireEvent.press(screen.getByTestId('back-to-pot'));
  expect(mockRouter.back).toHaveBeenCalled();
});
