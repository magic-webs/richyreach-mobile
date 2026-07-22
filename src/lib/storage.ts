import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'rr_session_token';
const ONBOARDING_KEY = 'rr_onboarding_seen';
const DEVICE_ID_KEY = 'rr_device_id';

function generateDeviceId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getOrCreateDeviceId(): Promise<string> {
  if (Platform.OS === 'web') {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const id = generateDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  }

  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = generateDeviceId();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  return id;
}

export async function saveToken(token: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function deleteToken() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export async function getOnboardingSeen(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return !!localStorage.getItem(ONBOARDING_KEY);
  }
  const val = await SecureStore.getItemAsync(ONBOARDING_KEY);
  return val === 'true';
}

export async function setOnboardingSeen() {
  if (Platform.OS === 'web') {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  } else {
    await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
  }
}

