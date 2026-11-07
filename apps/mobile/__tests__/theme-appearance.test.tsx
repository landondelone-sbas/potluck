import { renderHook, act } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import { usePotluck } from '@/state/store';
import { colors } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

afterEach(() => {
  jest.restoreAllMocks();
  usePotluck.getState().setAppearance('system');
});

function withSystem(scheme: 'light' | 'dark' | null) {
  jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue(scheme);
}

describe('useTheme follows the look chosen in Settings (SET-1)', () => {
  test('match my phone follows the phone', async () => {
    withSystem('dark');
    expect((await renderHook(() => useTheme())).result.current.scheme).toBe('dark');
    withSystem('light');
    expect((await renderHook(() => useTheme())).result.current.scheme).toBe('light');
  });

  test('dark stays dark when the phone is light', async () => {
    withSystem('light');
    usePotluck.getState().setAppearance('dark');
    const { result } = await renderHook(() => useTheme());
    expect(result.current.scheme).toBe('dark');
    expect(result.current.colors).toBe(colors.dark);
  });

  test('light stays light when the phone is dark', async () => {
    withSystem('dark');
    usePotluck.getState().setAppearance('light');
    const { result } = await renderHook(() => useTheme());
    expect(result.current.scheme).toBe('light');
    expect(result.current.colors).toBe(colors.light);
  });

  test('changing the setting changes the colors right away', async () => {
    withSystem('light');
    const { result } = await renderHook(() => useTheme());
    expect(result.current.scheme).toBe('light');
    await act(async () => usePotluck.getState().setAppearance('dark'));
    expect(result.current.scheme).toBe('dark');
    await act(async () => usePotluck.getState().setAppearance('system'));
    expect(result.current.scheme).toBe('light');
  });

  test('an unknown phone setting is treated as light', async () => {
    withSystem(null);
    expect((await renderHook(() => useTheme())).result.current.scheme).toBe('light');
  });
});
