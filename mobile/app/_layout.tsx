import { useCallback, useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import { AppProvider } from '@/src/providers/AppProvider';
import { CurrencyProvider } from '@/src/lib/currency-context';

SplashScreen.preventAutoHideAsync().catch(() => {});

const isDesigner =
  process.env.EXPO_PUBLIC_RAPIDNATIVE_MODE === 'designer' ||
  process.env.EXPO_PUBLIC_RAPIDNATIVE_MODE === 'staging';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  const hideSplash = useCallback(async () => {
    if (fontsLoaded || fontError || isDesigner) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    hideSplash();
  }, [hideSplash]);

  if (!fontsLoaded && !fontError && !isDesigner) {
    return null;
  }

  return (
    <AppProvider>
      <CurrencyProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </CurrencyProvider>
    </AppProvider>
  );
}
