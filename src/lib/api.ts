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
  if (!(options?.body instanceof FormData)) {
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
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error ?? 'Request failed');
  return json.data as T;
}

export const api = {
  auth: {
    requestOtp: (identifier: string, method: 'email' | 'whatsapp', mode?: 'login' | 'signup') =>
      request('/auth/request-otp', { method: 'POST', body: JSON.stringify({ identifier, method, mode }) }),
    verifyOtp: (identifier: string, code: string, role?: string, name?: string) =>
      request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ identifier, code, role, name }) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    session: () => request('/auth/session'),
  },
  campaigns: {
    list: () => request('/campaigns'),
    get: (id: string) => request(`/campaigns/${id}`),
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
  },
  influencers: {
    list: () => request('/influencers'),
    get: (id: string) => request(`/influencers/${id}`),
    marketplace: () => request('/influencers/marketplace-campaigns'),
    dashboard: () => request('/influencers/dashboard'),
    earnings: () => request<any[]>('/influencers/earnings'),
    profile: () => request('/influencers/profile'),
    profiles: () => request<any[]>('/influencers/profiles'),
    updateProfile: (data: FormData | any) => {
      const isFormData = data instanceof FormData;
      return request('/influencers/profile', {
        method: 'POST',
        body: isFormData ? data : JSON.stringify(data),
      });
    },
    apply: (campaignId: string, proposal: string = "Excited to collaborate on this campaign!") =>
      request(`/influencers/apply/${campaignId}`, { method: 'POST', body: JSON.stringify({ proposal }) }),
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
    profile: () => request('/brands/profile'),
    profiles: () => request<any[]>('/brands/profiles'),
    updateProfile: (data: any) => request('/brands/profile', { method: 'POST', body: JSON.stringify(data) }),
    dashboard: () => request('/brands/dashboard'),
  },
  chat: {
    rooms: () => request('/chat/rooms'),
    messages: (roomId: string) => request(`/chat/messages/${roomId}`),
    send: (roomId: string, content: string) =>
      request(`/chat/message/${roomId}`, { method: 'POST', body: JSON.stringify({ content }) }),
  },
  arena: {
    list: () => request('/arena'),
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
};
