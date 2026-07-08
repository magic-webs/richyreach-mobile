import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

interface SavedCampaignsState {
  savedCampaignIds: string[];
  loadSavedCampaigns: (userId: string) => Promise<void>;
  toggleSaveCampaign: (userId: string, campaignId: string) => Promise<void>;
  isSaved: (campaignId: string) => boolean;
}

function getStorageKey(userId: string) {
  return `rr_saved_campaigns_${userId}`;
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

export const useSavedCampaignsStore = create<SavedCampaignsState>((set, get) => ({
  savedCampaignIds: [],

  loadSavedCampaigns: async (userId) => {
    const key = getStorageKey(userId);
    try {
      const raw = await readStorage(key);
      if (raw) {
        set({ savedCampaignIds: JSON.parse(raw) });
      } else {
        set({ savedCampaignIds: [] });
      }
    } catch (err) {
      console.warn('loadSavedCampaigns failed:', err);
    }
  },

  toggleSaveCampaign: async (userId, campaignId) => {
    const key = getStorageKey(userId);
    const { savedCampaignIds } = get();
    const exists = savedCampaignIds.includes(campaignId);
    let updated: string[];

    if (exists) {
      updated = savedCampaignIds.filter((id) => id !== campaignId);
    } else {
      updated = [...savedCampaignIds, campaignId];
    }

    try {
      await writeStorage(key, JSON.stringify(updated));
      set({ savedCampaignIds: updated });
    } catch (err) {
      console.error('toggleSaveCampaign failed:', err);
    }
  },

  isSaved: (campaignId) => {
    return get().savedCampaignIds.includes(campaignId);
  },
}));
