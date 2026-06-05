import { create } from 'zustand';
import { deleteToken, saveToken } from '@/lib/storage';
import type { Session, UserRole } from '@/types';

interface AuthState {
  session: Session | null;
  role: UserRole;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setRole: (role: UserRole) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  role: 'influencer',
  isLoading: true,

  setSession: async (session) => {
    if (session) await saveToken(session.token);
    else await deleteToken();
    set({ session, isLoading: false });
  },

  setRole: (role) => set({ role }),

  logout: async () => {
    await deleteToken();
    set({ session: null });
  },
}));
