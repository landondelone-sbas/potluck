import { act, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Appearance } from 'react-native';

import RootLayout from '@/app/_layout';
import AboutScreen from '@/app/about';
import PotScreen from '@/app/index';
import CookLogScreen from '@/app/log';
import RecipeScreen from '@/app/recipe/[id]';
import ResultsScreen from '@/app/results';
import SettingsScreen from '@/app/settings';
import SetupStepScreen from '@/app/setup/[category]';
import SetupLayout from '@/app/setup/_layout';
import WelcomeScreen from '@/app/setup/index';
import SummaryScreen from '@/app/setup/summary';
import { usePotluck } from '@/state/store';

import { resetStore } from '../../test-utils/pantry';

// Fonts and the splash screen are native. Pretend they are ready.
jest.mock('expo-font', () => ({
  ...jest.requireActual('expo-font'),
  useFonts: () => [true, null],
}));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve(true)),
  hideAsync: jest.fn(() => Promise.resolve(true)),
}));

const routes = {
  _layout: RootLayout,
  index: PotScreen,
  results: ResultsScreen,
  'recipe/[id]': RecipeScreen,
  log: CookLogScreen,
  settings: SettingsScreen,
  about: AboutScreen,
  'setup/_layout': SetupLayout,
  'setup/index': WelcomeScreen,
  'setup/[category]': SetupStepScreen,
  'setup/summary': SummaryScreen,
};

beforeEach(() => {
  resetStore();
});

describe('first run and the pot are separate (PRD 7.1, ONB-1)', () => {
  test('a new user lands on the welcome screen, not the pot', async () => {
    usePotluck.setState({ onboardingComplete: false });
    await renderRouter(routes, { initialUrl: '/' });
    await waitFor(() => expect(screen).toHavePathname('/setup'));
    expect(screen.getByText('Cook from the food you already love')).toBeTruthy();
    expect(screen.queryByTestId('cook')).toBeNull();
  });

  test('a returning user lands on the pot, not on setup', async () => {
    usePotluck.setState({ onboardingComplete: true });
    await renderRouter(routes, { initialUrl: '/' });
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(screen.getByTestId('cook')).toBeTruthy();
  });

  test('a returning user who opens the setup link is sent to the pot', async () => {
    usePotluck.setState({ onboardingComplete: true });
    await renderRouter(routes, { initialUrl: '/setup' });
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(screen.getByTestId('cook')).toBeTruthy();
  });

  test('Open the pot ends setup and shows the pot', async () => {
    usePotluck.setState({ onboardingComplete: false });
    await renderRouter(routes, { initialUrl: '/setup/summary' });
    await waitFor(() => expect(screen.getByTestId('open-pot')).toBeTruthy());
    await fireEvent.press(screen.getByTestId('open-pot'));
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(screen.getByTestId('cook')).toBeTruthy();
  });
});

describe('settings reach the right places', () => {
  test('the pot screen links to the cook log and to settings', async () => {
    usePotluck.setState({ onboardingComplete: true });
    await renderRouter(routes, { initialUrl: '/' });
    await waitFor(() => expect(screen.getByTestId('open-log')).toBeTruthy());

    await fireEvent.press(screen.getByTestId('open-log'));
    await waitFor(() => expect(screen).toHavePathname('/log'));

    // Back at the pot, settings is the other link.
    await act(async () => {
      router.back();
    });
    await waitFor(() => expect(screen).toHavePathname('/'));
    await fireEvent.press(screen.getByTestId('open-settings'));
    await waitFor(() => expect(screen).toHavePathname('/settings'));
  });

  test('Add more favorites opens the setup steps again, and finishing returns to the pot (ONB-6)', async () => {
    usePotluck.setState({ onboardingComplete: true });
    await renderRouter(routes, { initialUrl: '/settings' });
    await waitFor(() => expect(screen.getByTestId('add-more')).toBeTruthy());

    await fireEvent.press(screen.getByTestId('add-more'));
    await waitFor(() => expect(screen).toHavePathname('/setup/protein'));
    expect(usePotluck.getState().onboardingComplete).toBe(true);

    await act(async () => {
      usePotluck.getState().completeOnboarding();
    });
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(screen.getByTestId('cook')).toBeTruthy();
  });

  test('Reset all data sends the user back to setup', async () => {
    usePotluck.setState({ onboardingComplete: true });
    await renderRouter(routes, { initialUrl: '/settings' });
    await waitFor(() => expect(screen.getByTestId('reset')).toBeTruthy());

    await act(async () => {
      usePotluck.getState().resetAll();
    });
    await waitFor(() => expect(screen).toHavePathname('/setup'));
    expect(screen.getByText('Cook from the food you already love')).toBeTruthy();
  });
});

describe('appearance is applied to the whole app (SET-1)', () => {
  test.each([
    ['dark', 'dark'],
    ['light', 'light'],
    ['system', 'auto'],
  ] as const)('%s sets the app color scheme to %s', async (setting, scheme) => {
    const spy = jest.spyOn(Appearance, 'setColorScheme').mockImplementation(() => undefined);
    usePotluck.setState({ onboardingComplete: true, appearance: setting });
    await renderRouter(routes, { initialUrl: '/' });
    await waitFor(() => expect(spy).toHaveBeenCalledWith(scheme));
    spy.mockRestore();
  });
});
