import { Stack } from 'expo-router';

import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/use-theme';

/** The first-run flow: welcome, one step per category, then a summary (PRD section 7.1). */
export default function SetupLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTintColor: colors.ink,
        headerTitleStyle: { fontFamily: fonts.bold },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
