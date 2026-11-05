import { fireEvent, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';

import AboutScreen from '@/app/about';

import { renderScreen } from '../../test-utils/render';

jest.mock('expo-router', () => jest.requireActual('../../test-utils/router-mock'));
jest.mock('@/config', () => ({ PRIVACY_POLICY_URL: 'https://example.test/privacy' }));

test('with a policy URL set, About links to it (SET-2)', async () => {
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  await renderScreen(<AboutScreen />);
  await fireEvent.press(screen.getByTestId('privacy-link'));
  expect(open).toHaveBeenCalledWith('https://example.test/privacy');
});
