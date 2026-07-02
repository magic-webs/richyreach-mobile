export type InviteStatus = 'pending' | 'accepted' | 'declined';
export type ChatAttachmentType = 'audio';

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  campaignId?: string | null;
  campaignTitle?: string | null;
  campaignBudget?: number | null;
  campaignDescription?: string | null;
  inviteId?: string | null;
  inviteStatus?: InviteStatus | null;
  attachmentUrl?: string | null;
  attachmentType?: ChatAttachmentType | null;
  attachmentDurationSec?: number | null;
  readAt?: string | null;
}

/** ChatMessage augmented with derived, render-only grouping flags. */
export interface DisplayChatMessage extends ChatMessage {
  showAvatar: boolean;
  isGroupContinuation: boolean;
}

export interface ChatRoomSummary {
  roomId: string;
  createdAt: string;
  companyName?: string | null;
  logo?: string | null;
  brandId?: string;
  name?: string | null;
  instagramHandle?: string | null;
  avatar?: string | null;
  influencerId?: string;
  lastMessage?: string | null;
  lastMessageCreatedAt?: string | null;
  lastMessageSenderId?: string | null;
  unreadCount: number;
  online?: boolean;
}

export interface ChatPaginationMeta {
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface ChatMessagesPage {
  messages: ChatMessage[];
  pagination: ChatPaginationMeta;
}

/** Payload shape sent both over WS (top-level JSON object) and as the REST POST body. */
export interface SendMessagePayload {
  content?: string;
  campaignId?: string;
  attachmentUrl?: string;
  attachmentType?: ChatAttachmentType;
  attachmentDurationSec?: number;
}
