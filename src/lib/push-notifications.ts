import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import type { useRouter } from 'expo-router';
import { getOrCreateDeviceId } from './storage';

type Router = ReturnType<typeof useRouter>;
import type { DeviceRegistrationInfo } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<DeviceRegistrationInfo | null> {
  if (!Device.isDevice) {
    // Push tokens can't be issued to simulators/emulators.
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn('[push-notifications] Missing EAS projectId, cannot fetch Expo push token');
    return null;
  }

  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
  const deviceId = await getOrCreateDeviceId();

  return {
    expoPushToken,
    deviceId,
    platform: Platform.OS as 'ios' | 'android' | 'web',
    appVersion: Constants.expoConfig?.version,
    deviceName: Device.modelName ?? undefined,
  };
}

/** Wires the notification-tap deep link handler. Call once from the root layout; returns an unsubscribe function. */
export function setupNotificationResponseListener(router: Router): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const deepLink = response.notification.request.content.data?.deepLink;
    if (typeof deepLink === 'string' && deepLink.length > 0) {
      router.push(deepLink as any);
    }
  });

  return () => subscription.remove();
}
