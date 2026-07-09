import { SplashLoader } from '@/components/splash-loader';
import { ActionModal } from '@/components/ui/action-modal';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import LottieView from 'lottie-react-native';
import { Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { getOnboardingSeen, getToken } from '@/lib/storage';
import { registerForPushNotificationsAsync, setupNotificationResponseListener, setupNotificationReceivedListener } from '@/lib/push-notifications';
import { playSound } from '@/lib/sound';
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
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});


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
            registerForPushNotificationsAsync()
              .then((device) => (device ? api.devices.register(device) : null))
              .catch((err) => console.error('Failed to register push token:', err));
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
  const router = useRouter();

  useEffect(() => {
    const unsubResponse = setupNotificationResponseListener(router);
    const unsubReceived = setupNotificationReceivedListener(() => {
      playSound('notification');
    });
    return () => {
      unsubResponse();
      unsubReceived();
    };
  }, [router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="collab/[id]" />
        <Stack.Screen name="insights" />
      </Stack.Protected>

      {/* Public Shared Pages */}
      <Stack.Screen name="shared/[id]" />
    </Stack>
  );
}

export default function RootLayout() {
  const [bodoniLoaded] = useBodoni({ BodoniModa_400Regular, BodoniModa_500Medium_Italic, BodoniModa_700Bold });
  const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold });
  const fontsLoaded = bodoniLoaded && montserratLoaded;

  const confettiVisible = useUIStore((s) => s.confettiVisible);
  const setConfettiVisible = useUIStore((s) => s.setConfettiVisible);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <BottomSheetModalProvider>
              {!fontsLoaded ? (
                <SplashLoader />
              ) : (
                <AuthGuard>
                  <StatusBar style="dark" />
                  <NavigationLayout />
                  <ActionModal />
                  <Modal visible={confettiVisible} transparent animationType="fade" onRequestClose={() => setConfettiVisible(false)}>
                    <TouchableWithoutFeedback onPress={() => setConfettiVisible(false)}>
                      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                        <LottieView
                          source={require('@/assets/lottie-animation/coffeti.json')}
                          autoPlay
                          loop={false}
                          style={StyleSheet.absoluteFill}
                          onAnimationFinish={() => setConfettiVisible(false)}
                        />
                      </View>
                    </TouchableWithoutFeedback>
                  </Modal>
                </AuthGuard>
              )}
            </BottomSheetModalProvider>
          </QueryClientProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
