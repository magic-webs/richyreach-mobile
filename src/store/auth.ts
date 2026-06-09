import { create } from 'zustand';
import { deleteToken, saveToken, setOnboardingSeen as saveOnboardingSeen } from '@/lib/storage';
import type { Session, UserRole } from '@/types';

interface AuthState {
  session: Session | null;
  role: UserRole;
  isLoading: boolean;
  onboardingSeen: boolean | null;
  setSession: (session: Session | null) => void;
  setRole: (role: UserRole) => void;
  setOnboardingSeen: (seen: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  role: 'influencer',
  isLoading: true,
  onboardingSeen: null,

  setSession: async (session) => {
    if (session) await saveToken(session.token);
    else await deleteToken();
    set({ session, isLoading: false });
  },

  setRole: (role) => set({ role }),

  setOnboardingSeen: async (seen) => {
    if (seen) {
      await saveOnboardingSeen();
    }
    set({ onboardingSeen: seen });
  },

  logout: async () => {
    await deleteToken();
    set({ session: null });
  },
}));
