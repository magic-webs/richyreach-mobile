import { getToken } from './storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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
    create: (data: any) => request('/campaigns/create', { method: 'POST', body: JSON.stringify(data) }),
  },
  influencers: {
    list: () => request('/influencers'),
    marketplace: () => request('/influencers/marketplace-campaigns'),
    dashboard: () => request('/influencers/dashboard'),
    apply: (campaignId: string, proposal: string = "Excited to collaborate on this campaign!") =>
      request(`/influencers/apply/${campaignId}`, { method: 'POST', body: JSON.stringify({ proposal }) }),
  },
  brands: {
    profile: () => request('/brands/profile'),
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
};
