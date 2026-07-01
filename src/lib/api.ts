import { getToken } from './storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

/** Reads the active profile ID from SecureStore (or localStorage on web) synchronously via module-level cache. */
let _activeProfileId: string | null = null;

/** Called by the profiles store whenever the active profile changes. */
export function setActiveProfileHeader(id: string | null) {
  _activeProfileId = id;
}

async function request<T>(path: string, options?: RequestInit & { activeProfileId?: string | null }): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  const isFormData = options?.body instanceof FormData || (options?.body && typeof options.body === 'object' && typeof (options.body as any).append === 'function');
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Attach active profile header if available
  const profileId = options?.activeProfileId !== undefined ? options.activeProfileId : _activeProfileId;
  if (profileId) {
    headers['x-active-profile-id'] = profileId;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  });

  const raw = await res.text();
  let json: any;
  try {
    json = raw ? JSON.parse(raw) : {};
  } catch {
    // Response was not JSON (404 page, proxy/tunnel error, server crash, etc.)
    const snippet = raw.slice(0, 120).trim();
    throw new Error(`Server error (${res.status})${snippet ? `: ${snippet}` : ''}`);
  }

  if (!res.ok || !json.success) {
    const msg =
      typeof json.error === 'string'
        ? json.error
        : json.error?.message ?? json.message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return json.data as T;
}

export const api = {
  auth: {
    requestOtp: (identifier: string, method: 'email' | 'whatsapp', mode?: 'login' | 'signup') =>
      request('/auth/request-otp', { method: 'POST', body: JSON.stringify({ identifier, method, mode }) }),
    verifyOtp: (identifier: string, code: string, role?: string, name?: string, referralCode?: string) =>
      request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ identifier, code, role, name, referralCode }) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    session: () => request('/auth/session'),
  },
  campaigns: {
    list: () => request('/campaigns'),
    get: (id: string) => request(`/campaigns/${id}`),
    getPublic: (id: string) => request(`/campaigns/public/${id}`),
    getTemplates: () => request<any[]>('/campaigns/templates'),
    create: (data: FormData | any, activeProfileId?: string | null) => {
      const isFormData = data instanceof FormData;
      return request('/campaigns/create', {
        method: 'POST',
        body: isFormData ? data : JSON.stringify(data),
        activeProfileId,
      });
    },
    update: (id: string, data: any) => request(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request(`/campaigns/${id}`, {
      method: 'DELETE',
    }),
    invite: (influencerId: string, campaignId: string) =>
      request('/campaigns/invite', { method: 'POST', body: JSON.stringify({ influencerId, campaignId }) }),
  },
  influencers: {
    list: () => request('/influencers'),
    get: (id: string) => request(`/influencers/${id}`),
    marketplace: () => request('/influencers/marketplace-campaigns'),
    dashboard: () => request('/influencers/dashboard'),
    earnings: () => request<any[]>('/influencers/earnings'),
    profile: () => request('/influencers/profile'),
    profiles: () => request<any[]>('/influencers/profiles'),
    verifyProfile: () => request<any>('/influencers/profile/verify', { method: 'POST' }),
    updateProfile: (data: FormData | any) => {
      const isFormData = data instanceof FormData;
      return request('/influencers/profile', {
        method: 'POST',
        body: isFormData ? data : JSON.stringify(data),
      });
    },
    apply: (campaignId: string, proposal: string, bidAmount: number, reelCount?: number, storyCount?: number) =>
      request(`/influencers/apply/${campaignId}`, { method: 'POST', body: JSON.stringify({ proposal, bidAmount, reelCount, storyCount }) }),
    acceptCounterOffer: (id: string) =>
      request(`/influencers/applications/${id}/accept-counter`, { method: 'POST' }),
    counterOffer: (id: string, bidAmount: number) =>
      request(`/influencers/applications/${id}/counter`, { method: 'POST', body: JSON.stringify({ bidAmount }) }),
    submitScript: (id: string, scriptUrl: string) =>
      request(`/influencers/applications/${id}/submit-script`, { method: 'POST', body: JSON.stringify({ scriptUrl }) }),
    submitVideo: (id: string, videoUrl: string) =>
      request(`/influencers/applications/${id}/submit-video`, { method: 'POST', body: JSON.stringify({ videoUrl }) }),
    submitIgHandle: (id: string, igHandle: string) =>
      request(`/influencers/applications/${id}/submit-ig-handle`, { method: 'POST', body: JSON.stringify({ igHandle }) }),
    submitPostLink: (id: string, postLink: string) =>
      request(`/influencers/applications/${id}/submit-post-link`, { method: 'POST', body: JSON.stringify({ postLink }) }),
    workspace: (campaignId: string) => request<any>(`/influencers/workspace/${campaignId}`),
    services: {
      list: () => request<any[]>('/influencers/services'),
      create: (data: FormData | any) => {
        const isFormData = data instanceof FormData;
        return request<any>('/influencers/services', {
          method: 'POST',
          body: isFormData ? data : JSON.stringify(data),
        });
      },
      update: (id: string, data: FormData | any) => {
        const isFormData = data instanceof FormData;
        return request<any>(`/influencers/services/${id}`, {
          method: 'PUT',
          body: isFormData ? data : JSON.stringify(data),
        });
      },
      delete: (id: string) => request<any>(`/influencers/services/${id}`, { method: 'DELETE' }),
    },
  },
  brands: {
    profile: (activeProfileId?: string | null) => request('/brands/profile', { activeProfileId }),
    profiles: () => request<any[]>('/brands/profiles'),
    updateProfile: (data: any, activeProfileId?: string | null) => request('/brands/profile', { method: 'POST', body: JSON.stringify(data), activeProfileId }),
    dashboard: (activeProfileId?: string | null) => request('/brands/dashboard', { activeProfileId }),
    applications: (status?: string, activeProfileId?: string | null) => request<any[]>(`/brands/applications${status ? `?status=${status}` : ''}`, { activeProfileId }),
    rejectApplication: (id: string, activeProfileId?: string | null) => request(`/brands/applications/${id}/reject`, { method: 'POST', activeProfileId }),
    acceptApplication: (id: string, activeProfileId?: string | null) => request(`/brands/applications/${id}/accept`, { method: 'POST', activeProfileId }),
    negotiateApplication: (id: string, counterAmount: number, activeProfileId?: string | null) =>
      request(`/brands/applications/${id}/negotiate`, { method: 'POST', body: JSON.stringify({ counterAmount }), activeProfileId }),
    reviewScript: (id: string, status: 'approved' | 'rejected', activeProfileId?: string | null) =>
      request(`/brands/applications/${id}/review-script`, { method: 'POST', body: JSON.stringify({ status }), activeProfileId }),
    reviewVideo: (id: string, status: 'approved' | 'rejected', feedbackType: 'none' | 'text' | 'voice' = 'none', feedbackText?: string, feedbackVoiceUrl?: string, activeProfileId?: string | null) =>
      request(`/brands/applications/${id}/review-video`, { method: 'POST', body: JSON.stringify({ status, feedbackType, feedbackText, feedbackVoiceUrl }), activeProfileId }),
    completeCollaboration: (id: string, activeProfileId?: string | null) =>
      request(`/brands/applications/${id}/complete`, { method: 'POST', activeProfileId }),
    wallet: {
      balance: (activeProfileId?: string | null) =>
        request<any>('/brands/wallet', { activeProfileId }),
      createOrder: (coins: number, activeProfileId?: string | null) =>
        request<any>('/brands/wallet/create-order', { method: 'POST', body: JSON.stringify({ coins }), activeProfileId }),
      verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; baseCoins: number; gstCoins: number }, activeProfileId?: string | null) =>
        request<any>('/brands/wallet/verify', { method: 'POST', body: JSON.stringify(data), activeProfileId }),
      transactions: (filter?: string, page?: number, activeProfileId?: string | null) =>
        request<any>(`/brands/wallet/transactions?filter=${filter ?? 'all'}&page=${page ?? 1}`, { activeProfileId }),
    },
  },
  chat: {
    rooms: () => request<any[]>('/chat/rooms'),
    createRoom: (targetId: string, campaignId?: string) =>
      request<any>('/chat/room', {
        method: 'POST',
        body: JSON.stringify(
          targetId.startsWith('bp_')
            ? { brandId: targetId, campaignId }
            : { influencerId: targetId, campaignId }
        ),
      }),
    messages: (roomId: string) => request<any[]>(`/chat/messages/${roomId}`),
    send: (roomId: string, content: string, campaignId?: string) =>
      request(`/chat/message/${roomId}`, { method: 'POST', body: JSON.stringify({ content, campaignId }) }),
    respondInvite: (inviteId: string, status: 'accepted' | 'declined') =>
      request(`/chat/invite/${inviteId}/respond`, { method: 'POST', body: JSON.stringify({ status }) }),
  },
  arena: {
    list: (type?: string) =>
      request<any[]>(`/arena${type ? `?type=${type}` : ''}`),
    mine: (activeProfileId?: string | null) =>
      request<any[]>('/arena/brand/mine', { activeProfileId }),
    get: (id: string) => request<any>(`/arena/${id}`),
    create: (data: any, activeProfileId?: string | null) =>
      request<any>('/arena/create', {
        method: 'POST',
        body: JSON.stringify(data),
        activeProfileId,
      }),
    update: (id: string, data: any, activeProfileId?: string | null) =>
      request<any>(`/arena/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        activeProfileId,
      }),
    delete: (id: string, activeProfileId?: string | null) =>
      request<any>(`/arena/${id}`, { method: 'DELETE', activeProfileId }),
    pause: (id: string, activeProfileId?: string | null) =>
      request<any>(`/arena/${id}/pause`, { method: 'POST', activeProfileId }),
    resume: (id: string, activeProfileId?: string | null) =>
      request<any>(`/arena/${id}/resume`, { method: 'POST', activeProfileId }),
    join: (id: string, activeProfileId?: string | null) =>
      request<any>(`/arena/${id}/join`, { method: 'POST', activeProfileId }),
    submit: (
      id: string,
      data: { collaborationLink?: string; reviewLink?: string; reviewEmail?: string; screenshotUrl?: string; postUrl?: string; submissionUrl?: string; accountReach?: number },
      activeProfileId?: string | null
    ) =>
      request<any>(`/arena/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          submissionUrl: data.screenshotUrl || data.submissionUrl,
        }),
        activeProfileId,
      }),
    myParticipations: (activeProfileId?: string | null) =>
      request<any[]>('/arena/influencer/participations', { activeProfileId }),
    leaderboard: (id: string) => request<any[]>(`/arena/${id}/leaderboard`),
    adminAll: () => request<any[]>('/arena/admin/all'),
    verifySubmission: (participantId: string, action: 'approve' | 'reject', notes?: string) =>
      request<any>(`/arena/submissions/${participantId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ action, notes }),
      }),
    distributeRewards: (id: string) =>
      request<any>(`/arena/${id}/distribute`, { method: 'POST' }),
  },
  banners: {
    list: (position?: string) => request<any[]>(`/banners${position ? `?position=${position}` : ''}`),
  },
  songs: {
    list: () => request<any[]>('/trending-songs'),
  },
  notifications: {
    list: () => request<any[]>('/notifications'),
    read: (id?: string) => request<any>(`/notifications/read${id ? `?id=${id}` : ''}`, { method: 'PUT' }),
  },
  referrals: {
    getStats: () => request<any>('/referral/stats'),
    convertPoints: (points: number) => request<any>('/referral/convert', { method: 'POST', body: JSON.stringify({ points }) }),
  },
  media: {
    upload: (fileData: FormData, activeProfileId?: string | null) =>
      request<{ url: string; key: string }>('/media/upload', {
        method: 'POST',
        body: fileData,
        activeProfileId,
      }),
  },
  places: {
    autocomplete: (input: string) =>
      request<{ predictions: any[] }>(`/places/autocomplete?input=${encodeURIComponent(input)}`),
  },
  wallet: {
    balance: () => request<{ coinBalance: number; rupeeValue: number; transactions: any[] }>('/wallet'),
    createOrder: (coins: number) =>
      request<any>('/wallet/create-order', { method: 'POST', body: JSON.stringify({ coins }) }),
    verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; coins: number }) =>
      request<any>('/wallet/verify', { method: 'POST', body: JSON.stringify(data) }),
    withdraw: (coins: number) =>
      request<any>('/wallet/withdraw', { method: 'POST', body: JSON.stringify({ coins }) }),
  },
};
