import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/src/hooks';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const isDesigner =
    process.env.EXPO_PUBLIC_RAPIDNATIVE_MODE === 'designer' ||
    process.env.EXPO_PUBLIC_RAPIDNATIVE_MODE === 'staging';

  // A signed-in user should not stay on the auth screens — send them to the app.
  // Exempt the designer preview (always signed-in demo user) so these artboards
  // remain renderable.
  if (!isLoading && isAuthenticated && !isDesigner) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
