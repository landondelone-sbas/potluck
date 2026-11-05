import { fireEvent, screen } from '@testing-library/react-native';
import { Alert, type AlertButton } from 'react-native';

import AboutScreen from '@/app/about';
import SettingsScreen from '@/app/settings';
import { usePotluck } from '@/state/store';

import { idOf, seedFullPantry } from '../../test-utils/pantry';
import { renderScreen } from '../../test-utils/render';
import { mockRouter } from '../../test-utils/router-mock';

jest.mock('expo-router', () => jest.requireActual('../../test-utils/router-mock'));

beforeEach(() => {
  jest.restoreAllMocks();
  mockRouter.push.mockClear();
  seedFullPantry();
});

describe('appearance (SET-1)', () => {
  test('offers match my phone, light and dark, with the current one selected', async () => {
    await renderScreen(<SettingsScreen />);
    expect(screen.getByTestId('appearance-system')).toBeChecked();
    expect(screen.getByTestId('appearance-light')).not.toBeChecked();
    expect(screen.getByTestId('appearance-dark')).not.toBeChecked();
    expect(screen.getByText('Match my phone')).toBeTruthy();
  });

  test('choosing one saves it and selects it', async () => {
    await renderScreen(<SettingsScreen />);
    await fireEvent.press(screen.getByTestId('appearance-dark'));
    expect(usePotluck.getState().appearance).toBe('dark');
    expect(screen.getByTestId('appearance-dark')).toBeChecked();
    expect(screen.getByTestId('appearance-system')).not.toBeChecked();
  });
});

describe('reset all data (SET-3)', () => {
  test('asks first, and cancelling changes nothing', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    usePotluck.getState().addToPot(idOf('Salmon'));
    await renderScreen(<SettingsScreen />);
    await fireEvent.press(screen.getByTestId('reset'));

    expect(alert).toHaveBeenCalledTimes(1);
    const [title, message, buttons] = alert.mock.calls[0] ?? [];
    expect(title).toBe('Reset all data?');
    expect(message).toMatch(/cannot be undone/);
    const cancel = (buttons as AlertButton[]).find((b) => b.style === 'cancel');
    cancel?.onPress?.();
    expect(usePotluck.getState().favorites.length).toBeGreaterThan(0);
    expect(usePotluck.getState().pot).toHaveLength(1);
  });

  test('confirming erases everything and starts setup again', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    usePotluck.getState().addToPot(idOf('Salmon'));
    usePotluck.getState().setAppearance('dark');
    await renderScreen(<SettingsScreen />);
    await fireEvent.press(screen.getByTestId('reset'));

    const buttons = (jest.mocked(Alert.alert).mock.calls[0]?.[2] ?? []) as AlertButton[];
    buttons.find((b) => b.style === 'destructive')?.onPress?.();

    const state = usePotluck.getState();
    expect(state.favorites).toEqual([]);
    expect(state.pot).toEqual([]);
    expect(state.appearance).toBe('system');
    expect(state.onboardingComplete).toBe(false);
  });

  test('the confirmation has a cancel and a destructive button', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await renderScreen(<SettingsScreen />);
    await fireEvent.press(screen.getByTestId('reset'));
    const buttons = (jest.mocked(Alert.alert).mock.calls[0]?.[2] ?? []) as AlertButton[];
    expect(buttons.map((b) => b.style)).toEqual(['cancel', 'destructive']);
  });
});

describe('the settings menu', () => {
  test('About opens the About screen', async () => {
    await renderScreen(<SettingsScreen />);
    await fireEvent.press(screen.getByTestId('about'));
    expect(mockRouter.push).toHaveBeenCalledWith('/about');
  });

  test('Add more favorites reopens setup and keeps what is there (ONB-6)', async () => {
    const before = usePotluck.getState().favorites.length;
    await renderScreen(<SettingsScreen />);
    await fireEvent.press(screen.getByTestId('add-more'));
    expect(usePotluck.getState().setupReopened).toBe(true);
    expect(usePotluck.getState().favorites).toHaveLength(before);
    expect(mockRouter.push).toHaveBeenCalledWith('/setup/protein');
  });
});

describe('About (SET-2)', () => {
  test('shows the disclaimers from PRD section 16', async () => {
    await renderScreen(<AboutScreen />);
    expect(screen.getByTestId('notice')).toHaveTextContent(/not medical or dietary advice/);
    expect(screen.getByTestId('notice')).toHaveTextContent(/not a guarantee of allergen safety/);
    expect(screen.getByTestId('notice')).toHaveTextContent(/Check every ingredient yourself/);
  });

  test('says nothing is collected: no account, data stays on the phone', async () => {
    await renderScreen(<AboutScreen />);
    expect(
      screen.getByText(/No account\. Your favorites and your cook log stay on this phone\./),
    ).toBeTruthy();
  });

  test('has no privacy policy link until a policy URL is set', async () => {
    await renderScreen(<AboutScreen />);
    expect(screen.queryByTestId('privacy-link')).toBeNull();
  });
});
