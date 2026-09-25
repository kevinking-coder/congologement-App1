import { Stack } from 'expo-router';
import { AppProvider } from '@/src/providers/AppProvider';
import { CurrencyProvider } from '@/src/lib/currency-context';

export default function AppLayout() {
  return (
    <AppProvider>
      <CurrencyProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="listing/[id]" />
          <Stack.Screen name="seller/[sellerId]" />
          <Stack.Screen name="favorites" />
          <Stack.Screen name="saved-searches" />
          <Stack.Screen name="legal" />
        </Stack>
      </CurrencyProvider>
    </AppProvider>
  );
}
