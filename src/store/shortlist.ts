import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export interface ShortlistedService {
  id: string;
  name: string;
  price: number;
  deliveryTime: string;
  videoUrl?: string;
  exampleUrl?: string;
  thumbnailUrl?: string | null;
  category?: string;
  subCategory?: string;
  description?: string;
  creator: {
    id: string;
    name: string;
    handle: string;
    followers: string;
    engagement: string;
    rating: string;
    avatar: string | null;
    tone?: 'rose' | 'ox';
    niche?: string[];
  };
}

interface ShortlistState {
  shortlistedServices: ShortlistedService[];
  loadShortlist: (userId: string) => Promise<void>;
  toggleShortlist: (userId: string, service: ShortlistedService) => Promise<void>;
  removeShortlist: (userId: string, serviceId: string) => Promise<void>;
  clearShortlist: (userId: string) => Promise<void>;
  isShortlisted: (serviceId: string) => boolean;
}

function getStorageKey(userId: string) {
  return `rr_shortlist_services_${userId}`;
}

async function writeStorage(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function readStorage(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

export const useShortlistStore = create<ShortlistState>((set, get) => ({
  shortlistedServices: [],

  loadShortlist: async (userId) => {
    const key = getStorageKey(userId);
    try {
      const raw = await readStorage(key);
      if (raw) {
        set({ shortlistedServices: JSON.parse(raw) });
      } else {
        set({ shortlistedServices: [] });
      }
    } catch (err) {
      console.warn('loadShortlist failed:', err);
    }
  },

  toggleShortlist: async (userId, service) => {
    const key = getStorageKey(userId);
    const { shortlistedServices } = get();
    const exists = shortlistedServices.some((s) => s.id === service.id);
    let updated: ShortlistedService[];

    if (exists) {
      updated = shortlistedServices.filter((s) => s.id !== service.id);
    } else {
      updated = [...shortlistedServices, service];
    }

    try {
      await writeStorage(key, JSON.stringify(updated));
      set({ shortlistedServices: updated });
    } catch (err) {
      console.error('toggleShortlist failed:', err);
    }
  },

  removeShortlist: async (userId, serviceId) => {
    const key = getStorageKey(userId);
    const { shortlistedServices } = get();
    const updated = shortlistedServices.filter((s) => s.id !== serviceId);

    try {
      await writeStorage(key, JSON.stringify(updated));
      set({ shortlistedServices: updated });
    } catch (err) {
      console.error('removeShortlist failed:', err);
    }
  },

  clearShortlist: async (userId) => {
    const key = getStorageKey(userId);
    try {
      await writeStorage(key, JSON.stringify([]));
      set({ shortlistedServices: [] });
    } catch (err) {
      console.error('clearShortlist failed:', err);
    }
  },

  isShortlisted: (serviceId) => {
    return get().shortlistedServices.some((s) => s.id === serviceId);
  },
}));
