import '../global.css';

import { SplashLoader } from '@/components/splash-loader';
import { ActionModal } from '@/components/ui/action-modal';
import { api } from '@/lib/api';
import { getOnboardingSeen, getToken } from '@/lib/storage';
import { useAuthStore } from '@/store/auth';
import {
  BodoniModa_400Regular,
  BodoniModa_500Medium_Italic,
  BodoniModa_700Bold,
  useFonts as useBodoni,
} from '@expo-google-fonts/bodoni-moda';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_700Bold,
  useFonts as useMontserrat,
} from '@expo-google-fonts/montserrat';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});


SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const isLoading = useAuthStore((s) => s.isLoading);
  const onboardingSeen = useAuthStore((s) => s.onboardingSeen);

  useEffect(() => {
    (async () => {
      try {
        const [token, seen] = await Promise.all([getToken(), getOnboardingSeen()]);
        useAuthStore.setState({ onboardingSeen: seen });
        if (token) {
          const data = await api.auth.session() as any;
          if (data && data.user) {
            useAuthStore.setState({ role: data.user.role });
            await setSession({ user: data.user, token });
          } else {
            await setSession(null);
          }
        } else {
          await setSession(null);
        }
      } catch (err) {
        console.error("Failed to restore session:", err);
        useAuthStore.setState({ onboardingSeen: false });
      } finally {
        useAuthStore.setState({ isLoading: false });
      }
    })();
  }, [setSession]);

  if (isLoading || onboardingSeen === null) return <SplashLoader />;

  return <>{children}</>;
}

function NavigationLayout() {
  const session = useAuthStore((s) => s.session);
  const isLoggedIn = !!session;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="collab" />
        <Stack.Screen name="insights" />
        <Stack.Screen name="referral" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [bodoniLoaded] = useBodoni({ BodoniModa_400Regular, BodoniModa_500Medium_Italic, BodoniModa_700Bold });
  const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold });

  useEffect(() => {
    if (bodoniLoaded && montserratLoaded) {
      SplashScreen.hideAsync();
    }
  }, [bodoniLoaded, montserratLoaded]);

  if (!bodoniLoaded || !montserratLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <AuthGuard>
              <NavigationLayout />
              <ActionModal />
            </AuthGuard>
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
