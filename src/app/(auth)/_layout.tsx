import { useAuthStore } from '@/store/auth';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  const onboardingSeen = useAuthStore((s) => s.onboardingSeen);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Protected guard={!onboardingSeen}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={!!onboardingSeen}>
        <Stack.Screen name="index" />
        <Stack.Screen name="magic-login" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="privacy" />
      </Stack.Protected>
    </Stack>
  );
}
