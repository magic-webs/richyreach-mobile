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
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const session = useAuthStore((s) => s.session);
  const setSession = useAuthStore((s) => s.setSession);
  const isLoading = useAuthStore((s) => s.isLoading);
  const onboardingSeen = useAuthStore((s) => s.onboardingSeen);
  const role = useAuthStore((s) => s.role);

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
        if (role === 'brand') {
          router.replace('/brand');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        // Redirection guards for route protection
        const isBrandRoute = segments[0] === '(tabs)' && segments[1] === 'brand';
        const isCreatorRoute = segments[0] === '(tabs)' && segments[1] !== 'brand';

        if (role === 'brand' && isCreatorRoute) {
          if (segments[1] === 'marketplace') {
            router.replace('/brand/marketplace' as any);
          } else if (segments[1] === 'arena') {
            router.replace('/brand/arena' as any);
          } else if (segments[1] === 'profile') {
            router.replace('/brand/profile' as any);
          } else {
            router.replace('/brand' as any);
          }
        } else if (role !== 'brand' && isBrandRoute) {
          if (segments[2] === 'marketplace') {
            router.replace('/marketplace' as any);
          } else if (segments[2] === 'arena') {
            router.replace('/arena' as any);
          } else if (segments[2] === 'profile') {
            router.replace('/profile' as any);
          } else {
            router.replace('/(tabs)' as any);
          }
        }
      }
    }
  }, [session, segments, isLoading, onboardingSeen, role]);

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
