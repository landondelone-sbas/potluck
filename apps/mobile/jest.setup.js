/* global jest */
// AsyncStorage is a native module and does not exist under Jest. The library ships its own mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Worklets has no native runtime under Jest. The library ships a mock that runs worklets inline.
jest.mock('react-native-worklets', () => require('react-native-worklets/lib/module/mock'));

// Screens read the safe-area insets. The library ships a mock provider with zero insets.
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

// There is no haptic engine under Jest.
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));
