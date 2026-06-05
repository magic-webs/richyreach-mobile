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
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { getToken } from '@/lib/storage';

SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const session = useAuthStore((s) => s.session);
  const setSession = useAuthStore((s) => s.setSession);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
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
      } finally {
        useAuthStore.setState({ isLoading: false });
      }
    })();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === '(auth)';
    if (!session && !inAuth) {
      router.replace('/(auth)');
    } else if (session && inAuth) {
      router.replace('/(tabs)');
    }
  }, [session, segments, isLoading]);

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
    <SafeAreaProvider>
      <AuthGuard>
        <Slot />
      </AuthGuard>
    </SafeAreaProvider>
  );
}
