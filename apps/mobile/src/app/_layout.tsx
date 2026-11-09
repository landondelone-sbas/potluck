import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Appearance, Image, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { PotHeaderActions } from '@/components/pot-header-actions';
import { strings } from '@/content/strings';
import { usePotluck } from '@/state/store';
import { useHydrated } from '@/state/use-hydrated';
import { fontAssets, fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/use-theme';

const touchIcon: number = require('../../assets/images/apple-touch-icon.png');

// Keep the splash screen up until the fonts and the saved data are ready.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colors } = useTheme();
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const hydrated = useHydrated();
  const onboardingComplete = usePotluck((s) => s.onboardingComplete);
  const setupReopened = usePotluck((s) => s.setupReopened);
  const appearance = usePotluck((s) => s.appearance);

  // If a font fails to load the app still opens, in the system font.
  const ready = (fontsLoaded || fontError !== null) && hydrated;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  // SET-1: light, dark, or follow the phone. Setting it here changes every screen and the system
  // parts (header, keyboard) together.
  useEffect(() => {
    if (!hydrated) return;
    // The browser build has no phone override. useTheme reads the choice itself, and the page's own
    // color scheme is set here so scrollbars and form fields match.
    if (Platform.OS === 'web') {
      document.documentElement.style.colorScheme =
        appearance === 'system' ? 'light dark' : appearance;
      // The icon for "Add to Home Screen" in iOS Safari. The favicon comes from app.json.
      const href = Image.resolveAssetSource(touchIcon)?.uri;
      if (href && !document.querySelector('link[rel="apple-touch-icon"]')) {
        const link = document.createElement('link');
        link.rel = 'apple-touch-icon';
        link.href = href;
        document.head.appendChild(link);
      }
    }
    if (typeof Appearance.setColorScheme !== 'function') return;
    Appearance.setColorScheme(appearance === 'system' ? 'auto' : appearance);
  }, [appearance, hydrated]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontFamily: fonts.display },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        {/* Setup runs on first launch, and again when Settings reopens it. */}
        <Stack.Protected guard={!onboardingComplete || setupReopened}>
          <Stack.Screen name="setup" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={onboardingComplete}>
          <Stack.Screen
            name="index"
            options={{ title: strings.appName, headerRight: () => <PotHeaderActions /> }}
          />
          <Stack.Screen name="results" options={{ title: strings.results.title }} />
          <Stack.Screen name="recipe/[id]" options={{ title: strings.recipe.title }} />
          <Stack.Screen name="log" options={{ title: strings.log.title }} />
          <Stack.Screen name="settings" options={{ title: strings.settings.title }} />
          <Stack.Screen name="about" options={{ title: strings.about.title }} />
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
}
