import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { api, setActiveProfileHeader } from '@/lib/api';

// ─── Brand Profile ────────────────────────────────────────────────────────────
export interface BrandProfile {
  id: string;
  companyName: string;
  website: string;
  logo: string | null;
  category: string;
  description: string | null;
}

// ─── Influencer Profile ───────────────────────────────────────────────────────
export interface InfluencerProfile {
  id: string;
  instagramHandle: string;
  niche: string;
  pricing: number;
  followers: number;
  level: string;
  avatar: string | null;
  bio: string | null;
  verified: boolean;
}

interface ProfilesState {
  // Brand
  brandProfiles: BrandProfile[];
  activeBrandProfileId: string | null;
  loadBrandProfiles: (userId: string, currentBackendProfile?: any) => Promise<void>;
  saveBrandProfile: (userId: string, profile: BrandProfile) => Promise<void>;
  setActiveBrandProfileId: (userId: string, profileId: string) => Promise<void>;

  // Influencer
  influencerProfiles: InfluencerProfile[];
  activeInfluencerProfileId: string | null;
  loadInfluencerProfiles: (userId: string, currentBackendProfile?: any) => Promise<void>;
  saveInfluencerProfile: (userId: string, profile: InfluencerProfile) => Promise<void>;
  setActiveInfluencerProfileId: (userId: string, profileId: string) => Promise<void>;

  // Legacy alias (brand) for backward-compatibility
  profiles: BrandProfile[];
  activeProfileId: string | null;
  loadProfiles: (userId: string, currentBackendProfile?: any) => Promise<void>;
  saveProfile: (userId: string, profile: BrandProfile) => Promise<void>;
  setActiveProfileId: (userId: string, profileId: string) => Promise<void>;
}

function getStorageKey(userId: string, subKey: string) {
  return `rr_${subKey}_${userId}`;
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

export const useProfilesStore = create<ProfilesState>((set, get) => ({
  // ─── Brand state ─────────────────────────────────────────────────────────────
  brandProfiles: [],
  activeBrandProfileId: null,

  loadBrandProfiles: async (userId, currentBackendProfile) => {
    const listKey = getStorageKey(userId, 'brand_profiles_list');
    const activeKey = getStorageKey(userId, 'brand_active_profile_id');

    try {
      const listRaw = await readStorage(listKey);
      // Read persisted active ID before touching anything else
      const persistedActiveId = await readStorage(activeKey);

      let savedProfiles: BrandProfile[] = listRaw ? JSON.parse(listRaw) : [];
      let activeId = persistedActiveId || null;

      if (savedProfiles.length === 0 && currentBackendProfile && currentBackendProfile.id) {
        const seedProfile: BrandProfile = {
          id: currentBackendProfile.id,
          companyName: currentBackendProfile.companyName || 'My Brand',
          website: currentBackendProfile.website || '',
          logo: currentBackendProfile.logo || null,
          category: currentBackendProfile.category || 'Fashion',
          description: currentBackendProfile.description || null,
        };
        savedProfiles = [seedProfile];
        if (!activeId) activeId = seedProfile.id;
      }

      // Fetch fresh profiles list from the backend
      try {
        const backendProfiles = await api.brands.profiles();
        if (backendProfiles && backendProfiles.length > 0) {
          savedProfiles = backendProfiles;
          // Only reset to first profile if there is no persisted choice or the persisted
          // profile no longer exists in the backend list.
          if (!activeId || !backendProfiles.some((p) => p.id === activeId)) {
            activeId = backendProfiles[0].id;
          }
          await writeStorage(listKey, JSON.stringify(savedProfiles));
          // Always persist the resolved active ID so refreshes remember it
          if (activeId) {
            await writeStorage(activeKey, activeId);
          }
        }
      } catch (backendErr) {
        console.warn('Failed to fetch brand profiles from backend, using local/cached profiles:', backendErr);
      }

      setActiveProfileHeader(activeId);
      set({ brandProfiles: savedProfiles, activeBrandProfileId: activeId, profiles: savedProfiles, activeProfileId: activeId });
    } catch (err) {
      console.warn('loadBrandProfiles failed:', err);
    }
  },

  saveBrandProfile: async (userId, profile) => {
    const listKey = getStorageKey(userId, 'brand_profiles_list');
    const activeKey = getStorageKey(userId, 'brand_active_profile_id');
    const { brandProfiles } = get();

    try {
      const existingIdx = brandProfiles.findIndex((p) => p.id === profile.id);
      let updatedProfiles: BrandProfile[];

      if (existingIdx > -1) {
        updatedProfiles = [...brandProfiles];
        updatedProfiles[existingIdx] = profile;
      } else {
        updatedProfiles = [...brandProfiles, profile];
      }

      const newActiveId = get().activeBrandProfileId || profile.id;

      await writeStorage(listKey, JSON.stringify(updatedProfiles));
      await writeStorage(activeKey, newActiveId);

      setActiveProfileHeader(newActiveId);
      set({ brandProfiles: updatedProfiles, activeBrandProfileId: newActiveId, profiles: updatedProfiles, activeProfileId: newActiveId });
    } catch (err) {
      console.error('saveBrandProfile failed:', err);
      throw err;
    }
  },

  setActiveBrandProfileId: async (userId, profileId) => {
    const activeKey = getStorageKey(userId, 'brand_active_profile_id');
    try {
      await writeStorage(activeKey, profileId);
      setActiveProfileHeader(profileId);
      set({ activeBrandProfileId: profileId, activeProfileId: profileId });
    } catch (err) {
      console.error('setActiveBrandProfileId failed:', err);
      throw err;
    }
  },

  // ─── Influencer state ─────────────────────────────────────────────────────────
  influencerProfiles: [],
  activeInfluencerProfileId: null,

  loadInfluencerProfiles: async (userId, currentBackendProfile) => {
    const listKey = getStorageKey(userId, 'influencer_profiles_list');
    const activeKey = getStorageKey(userId, 'influencer_active_profile_id');

    try {
      const listRaw = await readStorage(listKey);
      // Read persisted active ID before touching anything else
      const persistedActiveId = await readStorage(activeKey);

      let savedProfiles: InfluencerProfile[] = listRaw ? JSON.parse(listRaw) : [];
      let activeId = persistedActiveId || null;

      if (savedProfiles.length === 0 && currentBackendProfile && currentBackendProfile.id) {
        const seedProfile: InfluencerProfile = {
          id: currentBackendProfile.id,
          instagramHandle: currentBackendProfile.instagramHandle || '',
          niche: currentBackendProfile.niche || 'Lifestyle',
          pricing: currentBackendProfile.pricing || 0,
          followers: currentBackendProfile.followers || 0,
          level: currentBackendProfile.level || 'micro',
          avatar: currentBackendProfile.avatar || null,
          bio: currentBackendProfile.bio || null,
          verified: currentBackendProfile.verified || false,
        };
        savedProfiles = [seedProfile];
        if (!activeId) activeId = seedProfile.id;
      }

      // Fetch fresh profiles list from the backend
      try {
        const backendProfiles = await api.influencers.profiles();
        if (backendProfiles && backendProfiles.length > 0) {
          savedProfiles = backendProfiles;
          // Only reset to first profile if there is no persisted choice or the persisted
          // profile no longer exists in the backend list.
          if (!activeId || !backendProfiles.some((p) => p.id === activeId)) {
            activeId = backendProfiles[0].id;
          }
          await writeStorage(listKey, JSON.stringify(savedProfiles));
          // Always persist the resolved active ID so refreshes remember it
          if (activeId) {
            await writeStorage(activeKey, activeId);
          }
        }
      } catch (backendErr) {
        console.warn('Failed to fetch influencer profiles from backend, using local/cached profiles:', backendErr);
      }

      setActiveProfileHeader(activeId);
      set({ influencerProfiles: savedProfiles, activeInfluencerProfileId: activeId });
    } catch (err) {
      console.warn('loadInfluencerProfiles failed:', err);
    }
  },

  saveInfluencerProfile: async (userId, profile) => {
    const listKey = getStorageKey(userId, 'influencer_profiles_list');
    const activeKey = getStorageKey(userId, 'influencer_active_profile_id');
    const { influencerProfiles } = get();

    try {
      const existingIdx = influencerProfiles.findIndex((p) => p.id === profile.id);
      let updatedProfiles: InfluencerProfile[];

      if (existingIdx > -1) {
        updatedProfiles = [...influencerProfiles];
        updatedProfiles[existingIdx] = profile;
      } else {
        updatedProfiles = [...influencerProfiles, profile];
      }

      const newActiveId = get().activeInfluencerProfileId || profile.id;

      await writeStorage(listKey, JSON.stringify(updatedProfiles));
      await writeStorage(activeKey, newActiveId);

      setActiveProfileHeader(newActiveId);
      set({ influencerProfiles: updatedProfiles, activeInfluencerProfileId: newActiveId });
    } catch (err) {
      console.error('saveInfluencerProfile failed:', err);
      throw err;
    }
  },

  setActiveInfluencerProfileId: async (userId, profileId) => {
    const activeKey = getStorageKey(userId, 'influencer_active_profile_id');
    try {
      await writeStorage(activeKey, profileId);
      setActiveProfileHeader(profileId);
      set({ activeInfluencerProfileId: profileId });
    } catch (err) {
      console.error('setActiveInfluencerProfileId failed:', err);
      throw err;
    }
  },

  // ─── Legacy aliases (brand) for backward-compatibility ─────────────────────
  profiles: [],
  activeProfileId: null,
  loadProfiles: async (userId, currentBackendProfile) => get().loadBrandProfiles(userId, currentBackendProfile),
  saveProfile: async (userId, profile) => get().saveBrandProfile(userId, profile),
  setActiveProfileId: async (userId, profileId) => get().setActiveBrandProfileId(userId, profileId),
}));
