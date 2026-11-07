import { fireEvent, screen } from '@testing-library/react-native';

import SetupStepScreen from '@/app/setup/[category]';
import WelcomeScreen from '@/app/setup/index';
import SummaryScreen from '@/app/setup/summary';
import { SUGGESTIONS } from '@/domain/catalog';
import { usePotluck } from '@/state/store';

import { resetStore } from '../../test-utils/pantry';
import { renderScreen } from '../../test-utils/render';
import { mockParams, mockRouter } from '../../test-utils/router-mock';

jest.mock('expo-router', () => jest.requireActual('../../test-utils/router-mock'));

const names = () => usePotluck.getState().favorites.map((f) => f.name);

beforeEach(() => {
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
  mockParams.current = { category: 'protein' };
  resetStore();
  usePotluck.setState({ onboardingComplete: false });
});

describe('welcome', () => {
  test('explains the idea and starts the first step', async () => {
    await renderScreen(<WelcomeScreen />);
    expect(screen.getByText('Cook from the food you already love')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('get-started'));
    expect(mockRouter.push).toHaveBeenCalledWith('/setup/protein');
  });
});

describe('a setup step', () => {
  test('asks the category’s question and offers 12 to 18 suggestions (ONB-2)', async () => {
    await renderScreen(<SetupStepScreen />);
    expect(screen.getByText('Which proteins do you actually enjoy?')).toBeTruthy();
    expect(SUGGESTIONS.protein.length).toBeGreaterThanOrEqual(12);
    expect(SUGGESTIONS.protein.length).toBeLessThanOrEqual(18);
    for (const name of SUGGESTIONS.protein) {
      expect(screen.getByTestId(`suggestion-${name}`)).toBeTruthy();
    }
  });

  test('every category offers 12 to 14 suggestions, and proteins up to 18', () => {
    for (const [category, list] of Object.entries(SUGGESTIONS)) {
      expect(list.length).toBeGreaterThanOrEqual(12);
      expect(list.length).toBeLessThanOrEqual(category === 'protein' ? 18 : 14);
    }
  });

  test('tapping a suggestion picks it, and tapping again un-picks it', async () => {
    await renderScreen(<SetupStepScreen />);
    const tile = screen.getByTestId('suggestion-Salmon');
    await fireEvent.press(tile);
    expect(names()).toEqual(['Salmon']);
    expect(screen.getByTestId('suggestion-Salmon')).toBeChecked();

    await fireEvent.press(screen.getByTestId('suggestion-Salmon'));
    expect(names()).toEqual([]);
    expect(screen.getByTestId('suggestion-Salmon')).not.toBeChecked();
  });

  test('picks go into the category of the step', async () => {
    mockParams.current = { category: 'sauce' };
    await renderScreen(<SetupStepScreen />);
    await fireEvent.press(screen.getByTestId('suggestion-Pesto'));
    expect(usePotluck.getState().favorites[0]).toMatchObject({ name: 'Pesto', category: 'sauce' });
  });

  test('the button skips with nothing picked and says Next once something is', async () => {
    await renderScreen(<SetupStepScreen />);
    expect(screen.getByText('Skip')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('suggestion-Eggs'));
    expect(screen.getByText('Next')).toBeTruthy();
  });

  test('skipping is allowed and moves on (ONB-4)', async () => {
    await renderScreen(<SetupStepScreen />);
    await fireEvent.press(screen.getByTestId('next'));
    expect(mockRouter.push).toHaveBeenCalledWith('/setup/veg');
    expect(names()).toEqual([]);
  });

  test.each([
    ['protein', '/setup/veg'],
    ['veg', '/setup/spice'],
    ['spice', '/setup/sauce'],
    ['sauce', '/setup/starch'],
    ['starch', '/setup/summary'],
  ])(
    'the %s step leads to %s (ONB-1: Protein, Veg, Spice, Sauce, Starch, then the summary)',
    async (category, next) => {
      mockParams.current = { category };
      await renderScreen(<SetupStepScreen />);
      await fireEvent.press(screen.getByTestId('next'));
      expect(mockRouter.push).toHaveBeenCalledWith(next);
    },
  );

  test('the last step says Finish once something is picked', async () => {
    mockParams.current = { category: 'starch' };
    await renderScreen(<SetupStepScreen />);
    await fireEvent.press(screen.getByTestId('suggestion-Quinoa'));
    expect(screen.getByText('Finish')).toBeTruthy();
  });

  test('your own entry is trimmed, picked, and shown among the tiles (ONB-3)', async () => {
    await renderScreen(<SetupStepScreen />);
    await fireEvent.changeText(screen.getByTestId('setup-add-input'), '  venison   roast ');
    await fireEvent.press(screen.getByTestId('setup-add-button'));
    expect(names()).toEqual(['Venison roast']);
    expect(screen.getByTestId('suggestion-Venison roast')).toBeChecked();
  });

  test('the field caps entries at 40 characters (ONB-3)', async () => {
    await renderScreen(<SetupStepScreen />);
    expect(screen.getByTestId('setup-add-input').props.maxLength).toBe(40);
  });

  test('a duplicate, in any case, is refused with a message', async () => {
    await renderScreen(<SetupStepScreen />);
    await fireEvent.press(screen.getByTestId('suggestion-Salmon'));
    await fireEvent.changeText(screen.getByTestId('setup-add-input'), 'SALMON');
    await fireEvent.press(screen.getByTestId('setup-add-button'));
    expect(screen.getByText('Salmon is already in your favorites.')).toBeTruthy();
    expect(names()).toEqual(['Salmon']);
  });

  test('an unknown category goes back to the welcome screen', async () => {
    mockParams.current = { category: 'dessert' };
    await renderScreen(<SetupStepScreen />);
    expect(mockRouter.replace).toHaveBeenCalledWith('/setup');
  });
});

describe('the summary', () => {
  test('shows a count and the names for each category, and says so when one is empty (ONB-5)', async () => {
    const { addFavorite } = usePotluck.getState();
    addFavorite('protein', 'Salmon');
    addFavorite('protein', 'Eggs');
    addFavorite('veg', 'Carrots');

    await renderScreen(<SummaryScreen />);
    expect(screen.getByTestId('summary-protein')).toHaveTextContent(/Protein · 2/);
    expect(screen.getByTestId('summary-protein')).toHaveTextContent(/Salmon, Eggs/);
    expect(screen.getByTestId('summary-veg')).toHaveTextContent(/Veg · 1/);
    expect(screen.getByTestId('summary-spice')).toHaveTextContent(
      /Nothing picked\. The chef will choose\./,
    );
  });

  test('a user can finish setup with no favorites at all (ONB-4)', async () => {
    await renderScreen(<SummaryScreen />);
    await fireEvent.press(screen.getByTestId('open-pot'));
    expect(usePotluck.getState().onboardingComplete).toBe(true);
  });

  test('long lists are shortened', async () => {
    const { addFavorite } = usePotluck.getState();
    for (const name of SUGGESTIONS.veg.slice(0, 9)) addFavorite('veg', name);
    await renderScreen(<SummaryScreen />);
    expect(screen.getByTestId('summary-veg')).toHaveTextContent(/and 3 more/);
  });
});
