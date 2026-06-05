export type UserRole = 'influencer' | 'brand' | 'admin';
export type OtpMethod = 'email' | 'whatsapp';
export type OtpMode = 'login' | 'signup';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  verified?: boolean;
}

export interface Session {
  user: User;
  token: string;
}

export interface Campaign {
  id: string;
  brand: string;
  cat: string;
  verified: boolean;
  title: string;
  budget: string;
  budgetNum: number;
  type: string;
  platform: string;
  deadline: string;
  applicants: number;
  followers: string;
  tone: 'rose' | 'ox' | 'cream';
  about: string;
  deliverables: string[];
}

export interface Contest {
  id: string;
  title: string;
  brand: string;
  prize: string;
  entries: number;
  daysLeft: number;
  progress: number;
  tone: 'rose' | 'ox';
  desc: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  handle: string;
  pts: number;
  tone: 'rose' | 'ox';
  verified: boolean;
  up: boolean;
  me?: boolean;
}

export interface ActivityItem {
  who: string;
  act: string;
  detail: string;
  time: string;
  tone: 'rose' | 'ox';
  icon: string;
  verified?: boolean;
}

export interface MusicTrack {
  title: string;
  artist: string;
  reels: string;
  dur: string;
  tone: 'rose' | 'ox';
}

export interface ChatRoom {
  id: string;
  name: string;
  verified: boolean;
  last: string;
  time: string;
  unread: number;
  online: boolean;
  tone: 'rose' | 'ox';
  thread: ChatMessage[];
}

export interface ChatMessage {
  me: boolean;
  t: string;
  time: string;
}

export interface Account {
  id: string;
  name: string;
  handle: string;
  kind: string;
  followers: string;
  verified: boolean;
  tone: 'rose' | 'ox';
  current: boolean;
}

export interface PortfolioItem {
  tone: 'rose' | 'ox';
  tag: string;
  views: string;
}
