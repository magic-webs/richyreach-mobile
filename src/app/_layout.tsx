import '../global.css';

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
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { getOnboardingSeen, getToken } from '@/lib/storage';
import { SplashLoader } from '@/components/splash-loader';
import { ActionModal } from '@/components/ui/action-modal';

SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const session = useAuthStore((s) => s.session);
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
            await setSession({ user: data.user, token });
            useAuthStore.setState({ role: data.user.role });
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
  }, []);

  useEffect(() => {
    if (isLoading || onboardingSeen === null) return;
    const inAuth = segments[0] === '(auth)';
    const inOnboarding = inAuth && segments[1] === 'onboarding';

    if (!session) {
      if (!onboardingSeen) {
        if (!inOnboarding) {
          router.replace('/(auth)/onboarding');
        }
      } else {
        if (!inAuth || inOnboarding) {
          router.replace('/(auth)');
        }
      }
    } else {
      if (inAuth) {
        router.replace('/(tabs)');
      }
    }
  }, [session, segments, isLoading, onboardingSeen]);

  const isAllowed = React.useMemo(() => {
    if (isLoading || onboardingSeen === null) return false;
    const inAuth = segments[0] === '(auth)';
    const inOnboarding = inAuth && segments[1] === 'onboarding';

    if (!session) {
      if (!onboardingSeen) {
        return inOnboarding;
      } else {
        return inAuth && !inOnboarding;
      }
    } else {
      return !inAuth;
    }
  }, [session, segments, isLoading, onboardingSeen]);

  if (!isAllowed) return <SplashLoader />;

  return <>{children}</>;
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
        <BottomSheetModalProvider>
          <AuthGuard>
            <Slot />
            <ActionModal />
          </AuthGuard>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
