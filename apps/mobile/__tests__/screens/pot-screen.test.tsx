import { act, fireEvent, screen } from '@testing-library/react-native';

import PotScreen from '@/app/index';
import { usePotluck } from '@/state/store';

import { mockRouter } from '../../test-utils/router-mock';
import { resetStore, seedFullPantry } from '../../test-utils/pantry';
import { renderScreen } from '../../test-utils/render';

jest.mock('expo-router', () => jest.requireActual('../../test-utils/router-mock'));

const goldenPot = ['Chicken thighs', 'Broccoli', 'Ginger', 'Soy sauce', 'Jasmine rice'];

async function pressTile(name: string) {
  await fireEvent.press(screen.getByTestId(`tile-${name}`));
}

async function openCategory(category: string) {
  await fireEvent.press(screen.getByTestId(`category-${category}`));
}

/** Put the five golden-pot items in the pot by tapping, switching category as a user would. */
async function tapGoldenPot() {
  await pressTile('Chicken thighs');
  await openCategory('veg');
  await pressTile('Broccoli');
  await openCategory('spice');
  await pressTile('Ginger');
  await openCategory('sauce');
  await pressTile('Soy sauce');
  await openCategory('starch');
  await pressTile('Jasmine rice');
}

async function finishSimmer() {
  await act(async () => {
    jest.advanceTimersByTime(1200);
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  mockRouter.push.mockClear();
  seedFullPantry();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('filling the pot by tapping', () => {
  test('an empty pot says how to start and shows nothing selected', async () => {
    await renderScreen(<PotScreen />);
    expect(screen.getByText('Drag a favorite in, or tap one.')).toBeTruthy();
    expect(screen.getByText('0 in the pot')).toBeTruthy();
    expect(screen.getByTestId('nudge')).toHaveTextContent(
      'Start anywhere. Categories you skip are left to the chef.',
    );
  });

  test('tapping a tile puts it in the pot, and tapping it again takes it out', async () => {
    await renderScreen(<PotScreen />);
    await pressTile('Salmon');
    expect(screen.getByTestId('token-Salmon')).toBeTruthy();
    expect(screen.getByTestId('contents')).toHaveTextContent('Salmon');
    expect(screen.getByText('1 in the pot')).toBeTruthy();

    await pressTile('Salmon');
    expect(screen.queryByTestId('token-Salmon')).toBeNull();
    expect(screen.getByText('0 in the pot')).toBeTruthy();
  });

  test('tapping a token takes it out of the pot', async () => {
    await renderScreen(<PotScreen />);
    await pressTile('Salmon');
    await fireEvent.press(screen.getByTestId('token-Salmon'));
    expect(screen.queryByTestId('token-Salmon')).toBeNull();
    expect(usePotluck.getState().pot).toEqual([]);
  });

  test('the category strip shows each category’s tiles and a count of what is in the pot', async () => {
    await renderScreen(<PotScreen />);
    await pressTile('Salmon');
    await openCategory('veg');
    expect(screen.getByTestId('tile-Broccoli')).toBeTruthy();
    expect(screen.queryByTestId('tile-Salmon')).toBeNull();
    expect(screen.getByLabelText('Protein, 1 in the pot')).toBeTruthy();
    expect(screen.getByLabelText('Veg')).toBeTruthy();
  });

  test('a fourth item of one category is refused with a message', async () => {
    await renderScreen(<PotScreen />);
    for (const name of ['Chicken thighs', 'Chicken breast', 'Ground beef', 'Steak']) {
      await pressTile(name);
    }
    expect(
      screen.getByText('Three protein picks is the limit. Take one out to swap.'),
    ).toBeTruthy();
    expect(usePotluck.getState().pot).toHaveLength(3);
  });

  test('Empty clears the pot', async () => {
    await renderScreen(<PotScreen />);
    await pressTile('Salmon');
    await pressTile('Eggs');
    await fireEvent.press(screen.getByTestId('empty-pot'));
    expect(usePotluck.getState().pot).toEqual([]);
    expect(screen.getByText('0 in the pot')).toBeTruthy();
  });

  test('the plate nudge follows what is in the pot (PRD 9.6)', async () => {
    await renderScreen(<PotScreen />);
    await pressTile('Salmon');
    await openCategory('starch');
    await pressTile('Quinoa');
    expect(screen.getByTestId('nudge')).toHaveTextContent(
      'Nudge: no vegetable yet. Aim for about half the plate.',
    );
    await openCategory('veg');
    await pressTile('Zucchini');
    expect(screen.getByTestId('nudge')).toHaveTextContent(
      'Balanced plate: protein, veg and starch are all in.',
    );
  });
});

describe('cooking', () => {
  test('an empty pot asks for a favorite and does not cook', async () => {
    await renderScreen(<PotScreen />);
    await fireEvent.press(screen.getByTestId('cook'));
    expect(screen.getByText('The pot is empty. Add a favorite first.')).toBeTruthy();
    await finishSimmer();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  test('Cook it up simmers, then opens the results with the PRD golden dishes', async () => {
    await renderScreen(<PotScreen />);
    await tapGoldenPot();
    await fireEvent.press(screen.getByTestId('cook'));

    // Mid-simmer: the button says so, and nothing has happened yet.
    expect(screen.getByText('Simmering…')).toBeTruthy();
    expect(mockRouter.push).not.toHaveBeenCalled();

    await finishSimmer();
    expect(mockRouter.push).toHaveBeenCalledWith('/results');
    const run = usePotluck.getState().run;
    expect(run?.result.results.map((r) => r.dish.id)).toEqual([
      'stirfry',
      'friedrice',
      'glazebowl',
    ]);
    expect(run?.pot.map((item) => item.name)).toEqual(goldenPot);
  });

  test('a mood starter fills the pot from the favorites and cooks', async () => {
    await renderScreen(<PotScreen />);
    await fireEvent.press(screen.getByTestId('mood-cozy'));
    expect(usePotluck.getState().pot).toHaveLength(4);
    await finishSimmer();
    expect(mockRouter.push).toHaveBeenCalledWith('/results');
    expect(usePotluck.getState().run?.result.results.map((r) => r.dish.id)).toEqual([
      'sheetpan',
      'stew',
      'hash',
    ]);
  });

  test('a mood starter says so when none of its favorites are in the pantry', async () => {
    resetStore();
    usePotluck.getState().addFavorite('veg', 'Kale');
    await renderScreen(<PotScreen />);
    await fireEvent.press(screen.getByTestId('mood-spicy'));
    expect(
      screen.getByText('None of those favorites are in your pantry. Add some from the pantry.'),
    ).toBeTruthy();
    await finishSimmer();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  test('results are marked out of date once the pot changes, and the link says so', async () => {
    await renderScreen(<PotScreen />);
    await pressTile('Salmon');
    await fireEvent.press(screen.getByTestId('cook'));
    await finishSimmer();

    expect(screen.getByTestId('see-results')).toHaveTextContent('See results');
    await pressTile('Eggs');
    expect(screen.getByTestId('see-results')).toHaveTextContent('Results are out of date');
    expect(usePotluck.getState().stale).toBe(true);
  });
});

describe('the pantry', () => {
  test('Edit puts the row in remove mode: a tap removes the favorite and takes it out of the pot', async () => {
    await renderScreen(<PotScreen />);
    await pressTile('Salmon');
    await fireEvent.press(screen.getByTestId('edit-toggle'));
    await pressTile('Salmon');
    expect(usePotluck.getState().favorites.some((f) => f.name === 'Salmon')).toBe(false);
    expect(usePotluck.getState().pot).toEqual([]);
    expect(screen.queryByTestId('tile-Salmon')).toBeNull();
    expect(screen.queryByTestId('add-tile')).toBeNull();

    await fireEvent.press(screen.getByTestId('edit-toggle'));
    expect(screen.getByTestId('add-tile')).toBeTruthy();
  });

  test('+ Add opens a field, and a new favorite appears in the selected category', async () => {
    await renderScreen(<PotScreen />);
    await fireEvent.press(screen.getByTestId('add-tile'));
    await fireEvent.changeText(screen.getByTestId('add-favorite-input'), '  venison  ');
    await fireEvent.press(screen.getByTestId('add-favorite-button'));

    expect(screen.getByTestId('tile-Venison')).toBeTruthy();
    expect(screen.getByText('Added Venison to your favorites.')).toBeTruthy();
    expect(usePotluck.getState().favorites.find((f) => f.name === 'Venison')?.category).toBe(
      'protein',
    );
  });

  test('adding a duplicate says so and adds nothing', async () => {
    await renderScreen(<PotScreen />);
    await fireEvent.press(screen.getByTestId('add-tile'));
    await fireEvent.changeText(screen.getByTestId('add-favorite-input'), 'salmon');
    await fireEvent.press(screen.getByTestId('add-favorite-button'));
    expect(screen.getByText('Salmon is already in your favorites.')).toBeTruthy();
    expect(usePotluck.getState().favorites.filter((f) => f.name === 'Salmon')).toHaveLength(1);
  });

  test('a category with no favorites explains how to add one', async () => {
    resetStore();
    await renderScreen(<PotScreen />);
    expect(screen.getByText('No protein favorites yet. Add one with the + tile.')).toBeTruthy();
  });
});
