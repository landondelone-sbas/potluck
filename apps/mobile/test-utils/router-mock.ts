/**
 * A stand-in for expo-router's hooks, so a screen can be rendered on its own. Use it with
 * `jest.mock('expo-router', () => require('../../test-utils/router-mock'))`.
 */
import { Fragment } from 'react';

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
};

export const mockParams: { current: Record<string, string> } = { current: {} };

export const useRouter = () => mockRouter;
export const useLocalSearchParams = () => mockParams.current;
export const Redirect = ({ href }: { href: string }) => {
  mockRouter.replace(href);
  return null;
};
export const Stack = Object.assign(Fragment, { Screen: () => null, Protected: Fragment });
