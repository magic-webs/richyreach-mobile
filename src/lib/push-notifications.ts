import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import type { useRouter } from 'expo-router';
import { getOrCreateDeviceId } from './storage';
import type { DeviceRegistrationInfo } from './api';

type Router = ReturnType<typeof useRouter>;

/**
 * Android channel the backend targets via `android.channelId` in the Expo push payload.
 *
 * Channels are immutable once created — Android only allows `name` and `description` to
 * change afterwards — so the importance/vibration/visibility below apply to fresh installs
 * only. Changing any of those for existing users means bumping this id AND updating
 * `channelId` in richyreach-backend/src/services/push-notification.service.ts to match,
 * or pushes land on a fallback channel that plays the stock system tone.
 *
 * The sound is the one exception, as long as the raw resource keeps its name: the channel
 * stores `android.resource://<package>/raw/main_notification`, which re-resolves on every
 * app update. That is why the tone was swapped in place rather than shipped under a new
 * filename — existing installs pick it up without a channel migration.
 */
const ANDROID_CHANNEL_ID = 'default';

/** Basename must match an entry in the expo-notifications `sounds` array in app.json. */
const NOTIFICATION_SOUND = 'main_notification.wav';

/**
 * Creates or updates the Android notification channel. Idempotent, and safe to call before
 * permission is granted. Must run before the first push arrives: a payload naming a channel
 * that does not exist falls back to expo_notifications_fallback_notification_channel, which
 * plays the default system sound instead of ours.
 */
export async function setupAndroidNotificationChannelAsync(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'General',
      description: 'Campaign updates, chat messages and wallet activity.',
      importance: Notifications.AndroidImportance.HIGH,
      sound: NOTIFICATION_SOUND,
      // Without this the tone can be routed to the media stream and track media volume.
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.NOTIFICATION,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      },
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
      enableLights: true,
      lightColor: '#208AEF',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      showBadge: true,
    });
  } catch (err) {
    console.warn('[push-notifications] Failed to configure Android notification channel:', err);
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false, // Disables system double-sound in foreground; we trigger playSound('notification') programmatically
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

  if (Platform.OS === 'web') {
    return null;
  }

  await setupAndroidNotificationChannelAsync();

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

/** Wires the foreground notification received listener. Call once from the root layout; returns an unsubscribe function. */
export function setupNotificationReceivedListener(onNotification: (notification: Notifications.Notification) => void): () => void {
  const subscription = Notifications.addNotificationReceivedListener(onNotification);
  return () => subscription.remove();
}
