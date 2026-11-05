import { render } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

/** The app's root provides this. Gesture detectors refuse to render without it. */
function Root({ children }: { children: ReactNode }) {
  return <GestureHandlerRootView style={{ flex: 1 }}>{children}</GestureHandlerRootView>;
}

/** Render a screen the way the app does, inside a gesture handler root. */
export function renderScreen(ui: ReactElement) {
  return render(ui, { wrapper: Root });
}
