import { create } from 'zustand';

export type ArenaType = 'reel_reach' | 'google_review';

export interface ArenaWizardState {
  createStep: 1 | 2 | 3 | 4 | 5;
  // Step 1: Type selection
  arenaType: ArenaType;
  // Step 2: Basics
  title: string;
  description: string;
  category: string;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  // Step 3: Budget & Coins
  totalBudgetCoins: number;
  entryFeeCoins: number;
  rewardPerReview: number;
  // Step 4: Google Review / Guidelines
  businessName: string;
  googleMapsLink: string;
  reviewGuidelines: string;
  verificationRules: string;
  bannerUrl: string | null;

  // Actions
  setStep: (step: ArenaWizardState['createStep']) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const DEFAULT_STATE: Omit<ArenaWizardState, 'setStep' | 'nextStep' | 'prevStep' | 'reset'> = {
  createStep: 1,
  arenaType: 'reel_reach',
  title: '',
  description: '',
  category: 'General',
  maxParticipants: 100,
  startDate: '',
  endDate: '',
  totalBudgetCoins: 200000,   // 2,00,000 coins = ₹2000
  entryFeeCoins: 2000,         // fixed: 2000 coins = ₹20
  rewardPerReview: 2500,       // 2,500 coins = ₹25
  businessName: '',
  googleMapsLink: '',
  reviewGuidelines: '',
  verificationRules: '',
  bannerUrl: null,
};

export const useArenaWizardStore = create<ArenaWizardState>((set, get) => ({
  ...DEFAULT_STATE,

  setStep: (step) => set({ createStep: step }),

  nextStep: () => {
    const current = get().createStep;
    if (current < 5) set({ createStep: (current + 1) as ArenaWizardState['createStep'] });
  },

  prevStep: () => {
    const current = get().createStep;
    if (current > 1) set({ createStep: (current - 1) as ArenaWizardState['createStep'] });
  },

  reset: () => set({ ...DEFAULT_STATE }),
}));
