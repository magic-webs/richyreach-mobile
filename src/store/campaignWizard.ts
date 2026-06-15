import { create } from 'zustand';

export interface CampaignWizardState {
  createStep: 1 | 2 | 3 | 4 | 5;
  campName: string;
  brandName: string;
  selectedBrandProfileId: string | null; // tracks which profile chip is highlighted
  campObjective: 'Brand Awareness' | 'Product Launch' | 'App Installs' | 'Website Traffic' | 'Sales/Conversions' | 'Lead Generation';
  campDescription: string;
  campLocationType: 'Pan India' | 'State' | 'City' | 'Pincode Radius';
  campLocationValue: string;
  campNiche: 'Fashion' | 'Real Estate' | 'Beauty' | 'Food' | 'Tech' | 'Finance' | 'Education' | 'Gaming' | 'Travel' | 'Fitness';
  campPriority: 'Normal' | 'High' | 'Urgent';

  // Step 2
  reelCount: number;
  storyCount: number;
  postCount: number;
  carouselCount: number;
  ytShortCount: number;
  ytVideoCount: number;
  liveCount: number;

  paymentType: 'Paid' | 'Barter' | 'Hybrid';
  costPerCreator: string;
  numCreators: string;
  paymentMethod: 'Bank Transfer' | 'UPI' | 'Wallet';
  paymentTimeline: 'Before Posting' | 'After Approval' | '15 Days' | '30 Days';

  // Barter product
  prodName: string;
  prodValue: string;
  prodDescription: string;
  prodSku: string;
  prodUrl: string;
  prodShipping: string;

  // Step 3
  selectedPlatforms: string[];
  minFollowers: string;
  minEngagementRate: string;
  targetGender: 'Male' | 'Female' | 'All';
  targetAgeRange: '18–24' | '25–34' | '35–44' | 'Custom';
  creatorSize: string;
  targetLanguage: string;
  audienceGenderPct: string;
  audienceAgePct: string;

  // Step 4
  mustMention: string;
  cta: 'Download App' | 'Visit Website' | 'Buy Now' | 'Use Coupon';
  hashtags: string;
  brandKeywords: string;
  brandTone: 'Professional' | 'Fun' | 'Luxury' | 'Casual';
  dos: string[];
  donts: string[];

  // Step 5
  campaignBanner: string;
  brandLogo: string;
  sampleCreative: string;
  referenceLinks: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;

  // Media URIs for File Uploads
  audioInstructionUri: string | null;
  campaignBannerUri: string | null;
  brandLogoUri: string | null;
  sampleCreativeUri: string | null;

  // Legal
  contentUsageRights: boolean;
  whitelistingPermission: boolean;
  paidAdsPermission: boolean;
  exclusivityMonths: string;
  ndaRequired: boolean;
  contractRequired: boolean;

  // Workflow
  autoApprove: boolean;
  revisionCount: string;

  // Advanced
  couponCode: string;
  trackingLink: string;
  affiliateCommType: 'Fixed' | 'Percentage';
  affiliateCommValue: string;
  appQuestions: string[];
}

interface CampaignWizardActions {
  updateField: <K extends keyof CampaignWizardState>(key: K, value: CampaignWizardState[K]) => void;
  updateState: (fields: Partial<CampaignWizardState>) => void;
  resetStore: () => void;
  togglePlatform: (platform: string) => void;
  addDo: (item: string) => void;
  removeDo: (index: number) => void;
  addDont: (item: string) => void;
  removeDont: (index: number) => void;
  addQuestion: (item: string) => void;
  removeQuestion: (index: number) => void;
}

export type CampaignWizardStore = CampaignWizardState & CampaignWizardActions;

const initialValues: CampaignWizardState = {
  createStep: 1,
  campName: '',
  brandName: '',
  selectedBrandProfileId: null,
  campObjective: 'Brand Awareness',
  campDescription: '',
  campLocationType: 'Pan India',
  campLocationValue: '',
  campNiche: 'Fashion',
  campPriority: 'Normal',

  reelCount: 0,
  storyCount: 0,
  postCount: 0,
  carouselCount: 0,
  ytShortCount: 0,
  ytVideoCount: 0,
  liveCount: 0,

  paymentType: 'Paid',
  costPerCreator: '5000',
  numCreators: '5',
  paymentMethod: 'Bank Transfer',
  paymentTimeline: 'After Approval',

  prodName: '',
  prodValue: '',
  prodDescription: '',
  prodSku: '',
  prodUrl: '',
  prodShipping: '',

  selectedPlatforms: ['Instagram'],
  minFollowers: '10K',
  minEngagementRate: '3%',
  targetGender: 'All',
  targetAgeRange: '25–34',
  creatorSize: 'Micro (10K-100K)',
  targetLanguage: 'English',
  audienceGenderPct: '60% Female',
  audienceAgePct: '70% 18-34',

  mustMention: '',
  cta: 'Download App',
  hashtags: '#RichyReach',
  brandKeywords: '',
  brandTone: 'Fun',

  dos: [
    'Show product clearly in the first 3 seconds',
    'Mention the discount code in the caption and video',
    'Use natural lighting and high-definition video',
  ],
  donts: [
    'Do not mention competing brands',
    'Avoid political or sensitive topics',
    'Do not use low-light or blurry video footage',
  ],

  campaignBanner: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1080&auto=format&fit=crop',
  brandLogo: '',
  sampleCreative: '',
  referenceLinks: '',

  audioInstructionUri: null,
  campaignBannerUri: null,
  brandLogoUri: null,
  sampleCreativeUri: null,

  startDate: '2026-07-01',
  endDate: '2026-07-30',
  applicationDeadline: '2026-06-25',

  contentUsageRights: true,
  whitelistingPermission: false,
  paidAdsPermission: false,
  exclusivityMonths: '1',
  ndaRequired: false,
  contractRequired: true,

  autoApprove: false,
  revisionCount: '2',

  couponCode: '',
  trackingLink: '',
  affiliateCommType: 'Percentage',
  affiliateCommValue: '10',
  appQuestions: [
    'Why are you suitable for this campaign?',
    'Share a link to your previous work or portfolio.',
  ],
};

export const useCampaignWizardStore = create<CampaignWizardStore>((set) => ({
  ...initialValues,

  updateField: (key, value) => set({ [key]: value } as any),

  updateState: (fields) => set(fields),

  resetStore: () => set(initialValues),

  togglePlatform: (platform) => set((state) => {
    const { selectedPlatforms } = state;
    if (selectedPlatforms.includes(platform)) {
      if (selectedPlatforms.length > 1) {
        return { selectedPlatforms: selectedPlatforms.filter((p) => p !== platform) };
      }
      return {};
    } else {
      return { selectedPlatforms: [...selectedPlatforms, platform] };
    }
  }),

  addDo: (item) => set((state) => ({ dos: [...state.dos, item] })),

  removeDo: (index) => set((state) => ({ dos: state.dos.filter((_, i) => i !== index) })),

  addDont: (item) => set((state) => ({ donts: [...state.donts, item] })),

  removeDont: (index) => set((state) => ({ donts: state.donts.filter((_, i) => i !== index) })),

  addQuestion: (item) => set((state) => ({ appQuestions: [...state.appQuestions, item] })),

  removeQuestion: (index) => set((state) => ({ appQuestions: state.appQuestions.filter((_, i) => i !== index) })),
}));
