import { act, fireEvent, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Dimensions, StyleSheet } from 'react-native';

import AboutScreen from '@/app/about';
import PotScreen from '@/app/index';
import CookLogScreen from '@/app/log';
import RecipeScreen from '@/app/recipe/[id]';
import ResultsScreen from '@/app/results';
import SettingsScreen from '@/app/settings';
import SetupStepScreen from '@/app/setup/[category]';
import WelcomeScreen from '@/app/setup/index';
import SummaryScreen from '@/app/setup/summary';
import { usePotluck } from '@/state/store';

import { idOf, seedFullPantry } from '../../test-utils/pantry';
import { renderScreen } from '../../test-utils/render';
import { mockParams, mockRouter } from '../../test-utils/router-mock';

jest.mock('expo-router', () => jest.requireActual('../../test-utils/router-mock'));
jest.mock('expo-keep-awake');
// The system "reduce motion" setting is on for this whole file.
jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated');
  return { ...actual, __esModule: true, default: actual.default, useReducedMotion: () => true };
});

const realGet = Dimensions.get.bind(Dimensions);

/** Pretend the phone has this window size and text size. */
function setWindow({ width = 390, height = 780, fontScale = 1 } = {}) {
  jest.spyOn(Dimensions, 'get').mockImplementation((dimension) => ({
    ...realGet(dimension),
    width,
    height,
    scale: 3,
    fontScale,
  }));
}

beforeEach(() => {
  jest.restoreAllMocks();
  jest.useFakeTimers();
  mockRouter.push.mockClear();
  seedFullPantry();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('screen reader announcements (PRD 12.4: the pot announces its changes)', () => {
  test('adding, removing and emptying are announced with the new count', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    await renderScreen(<PotScreen />);

    await fireEvent.press(screen.getByTestId('tile-Salmon'));
    expect(announce).toHaveBeenLastCalledWith('Salmon added to the pot. 1 in the pot.');

    await fireEvent.press(screen.getByTestId('tile-Eggs'));
    expect(announce).toHaveBeenLastCalledWith('Eggs added to the pot. 2 in the pot.');

    await fireEvent.press(screen.getByTestId('token-Salmon'));
    expect(announce).toHaveBeenLastCalledWith('Salmon taken out of the pot. 1 in the pot.');

    await fireEvent.press(screen.getByTestId('empty-pot'));
    expect(announce).toHaveBeenLastCalledWith('The pot is empty.');
  });

  test('a refused add is announced too', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    await renderScreen(<PotScreen />);
    for (const name of ['Chicken thighs', 'Chicken breast', 'Ground beef', 'Steak']) {
      await fireEvent.press(screen.getByTestId(`tile-${name}`));
    }
    expect(announce).toHaveBeenLastCalledWith(
      'Three protein picks is the limit. Take one out to swap.',
    );
  });

  test('every tile offers an add or remove action by name', async () => {
    await renderScreen(<PotScreen />);
    const tile = screen.getByTestId('tile-Salmon');
    expect(tile.props.accessibilityActions).toEqual([
      { name: 'activate', label: 'Add Salmon to the pot' },
    ]);
    await fireEvent.press(tile);
    expect(screen.getByTestId('tile-Salmon').props.accessibilityActions).toEqual([
      { name: 'activate', label: 'Remove Salmon from the pot' },
    ]);
  });
});

describe('enlarged text (PRD 12.4: up to 200 percent without clipping)', () => {
  test('at normal size the pot screen is fixed, so a drag never fights a scroll', async () => {
    setWindow();
    await renderScreen(<PotScreen />);
    expect(screen.getByTestId('body-fixed')).toBeTruthy();
    expect(screen.queryByTestId('body-scroll')).toBeNull();
  });

  test('with enlarged text the screen scrolls instead of clipping', async () => {
    setWindow({ fontScale: 2 });
    await renderScreen(<PotScreen />);
    expect(screen.getByTestId('body-scroll')).toBeTruthy();
    expect(screen.queryByTestId('body-fixed')).toBeNull();
  });

  test('on a short phone the screen scrolls so nothing is out of reach', async () => {
    setWindow({ height: 568 });
    await renderScreen(<PotScreen />);
    expect(screen.getByTestId('body-scroll')).toBeTruthy();
  });

  test('pantry tiles and category tabs grow with the text, so words fit', async () => {
    setWindow({ fontScale: 1 });
    const normal = await renderScreen(<PotScreen />);
    const normalTile = StyleSheet.flatten(screen.getByTestId('tile-Salmon').props.style);
    const normalTab = StyleSheet.flatten(screen.getByTestId('category-veg').props.style);
    await normal.unmount();

    setWindow({ fontScale: 2 });
    await renderScreen(<PotScreen />);
    const bigTile = StyleSheet.flatten(screen.getByTestId('tile-Salmon').props.style);
    const bigTab = StyleSheet.flatten(screen.getByTestId('category-veg').props.style);

    expect(normalTile.width).toBe(84);
    expect(bigTile.width).toBe(168);
    expect(bigTab.flexBasis).toBe(2 * (normalTab.flexBasis as number));
  });

  test('growth stops at 200 percent, however large the setting', async () => {
    setWindow({ fontScale: 3.2 });
    await renderScreen(<PotScreen />);
    expect(StyleSheet.flatten(screen.getByTestId('tile-Salmon').props.style).width).toBe(168);
  });
});

describe('reduce motion (PRD 12.3)', () => {
  test('results appear immediately: no simmer wait', async () => {
    await renderScreen(<PotScreen />);
    await fireEvent.press(screen.getByTestId('tile-Salmon'));
    await fireEvent.press(screen.getByTestId('cook'));
    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    expect(mockRouter.push).toHaveBeenCalledWith('/results');
  });
});

describe('every button has a name a screen reader can say', () => {
  function expectNamedButtons() {
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) expect(button).toHaveAccessibleName();
  }

  function cookAndLog() {
    const state = usePotluck.getState();
    for (const name of ['Salmon', 'Zucchini', 'Quinoa', 'Ground beef']) state.addToPot(idOf(name));
    const run = state.cook();
    const entry = state.logCooked(run?.result.results[0]?.dish.id ?? '');
    return entry?.id ?? '';
  }

  test('the pot screen', async () => {
    await renderScreen(<PotScreen />);
    await fireEvent.press(screen.getByTestId('tile-Salmon'));
    expectNamedButtons();
  });

  test('the pot screen in remove mode', async () => {
    await renderScreen(<PotScreen />);
    await fireEvent.press(screen.getByTestId('edit-toggle'));
    expectNamedButtons();
  });

  test('results', async () => {
    cookAndLog();
    await renderScreen(<ResultsScreen />);
    expectNamedButtons();
  });

  test('the recipe', async () => {
    mockParams.current = { id: cookAndLog() };
    await renderScreen(<RecipeScreen />);
    expect(screen.getByLabelText('Keep the screen on while cooking')).toBeTruthy();
  });

  test('the cook log', async () => {
    cookAndLog();
    await renderScreen(<CookLogScreen />);
    expectNamedButtons();
  });

  test('settings', async () => {
    await renderScreen(<SettingsScreen />);
    expectNamedButtons();
    for (const radio of screen.getAllByRole('radio')) expect(radio).toHaveAccessibleName();
  });

  test('about', async () => {
    await renderScreen(<AboutScreen />);
    expect(screen.getAllByRole('header').length).toBeGreaterThan(0);
  });

  test('setup: welcome, a step and the summary', async () => {
    await renderScreen(<WelcomeScreen />);
    expectNamedButtons();
    await screen.unmount();

    mockParams.current = { category: 'veg' };
    await renderScreen(<SetupStepScreen />);
    expectNamedButtons();
    for (const box of screen.getAllByRole('checkbox')) expect(box).toHaveAccessibleName();
    await screen.unmount();

    await renderScreen(<SummaryScreen />);
    expectNamedButtons();
  });
});

describe('structure', () => {
  test.each([
    ['results', <ResultsScreen key="r" />],
    ['settings', <SettingsScreen key="s" />],
    ['about', <AboutScreen key="a" />],
  ])('%s has a heading', async (_name, element) => {
    const state = usePotluck.getState();
    state.addToPot(idOf('Salmon'));
    state.cook();
    await renderScreen(element);
    expect(screen.getAllByRole('header').length).toBeGreaterThan(0);
  });
});
