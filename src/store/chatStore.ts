import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api';
import type { ChatRoomSummary, ChatMessage } from '@/types/chat';

export interface RoomMessagesState {
  list: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface PendingMessage {
  roomId: string;
  tempId: string;
  content?: string;
  campaignId?: string;
  attachment?: {
    attachmentUrl: string;
    attachmentType: 'audio';
    attachmentDurationSec: number;
  };
  createdAt: string;
}

export const chatStore$ = observable({
  rooms: [] as ChatRoomSummary[],
  messagesByRoom: {} as Record<string, RoomMessagesState>,
  pendingMessages: [] as PendingMessage[],
});

// Sync the store with local AsyncStorage for local-first retrieval
syncObservable(chatStore$, {
  persist: {
    name: 'richyreach_chat_v3_store',
    plugin: observablePersistAsyncStorage({
      AsyncStorage,
    }),
  },
});

let isSyncing = false;

/** Synchronize any pending messages in the queue with the remote server. */
export async function syncPendingMessages() {
  if (isSyncing) return;
  const pending = chatStore$.pendingMessages.get();
  if (!pending || pending.length === 0) return;

  isSyncing = true;
  const remaining: PendingMessage[] = [];

  for (const msg of pending) {
    try {
      // Send message to server via REST API
      const res = await api.chat.send(
        msg.roomId,
        msg.content,
        msg.campaignId,
        msg.attachment
      );

      // Swap the temporary message in the room messages list with the server message
      const roomMsgs$ = chatStore$.messagesByRoom[msg.roomId];
      if (roomMsgs$.get()) {
        const currentList = roomMsgs$.list.peek() || [];
        const index = currentList.findIndex((m) => m.id === msg.tempId);
        if (index !== -1) {
          const updated = [...currentList];
          updated[index] = res;
          roomMsgs$.list.set(updated);
        }
      }
    } catch (err) {
      console.warn(`[ChatStore] Failed to sync pending message ${msg.tempId}`, err);
      remaining.push(msg); // Keep in queue to retry later
    }
  }

  chatStore$.pendingMessages.set(remaining);
  isSyncing = false;
}

// Background poller to retry sending pending messages if any exist
setInterval(() => {
  if (chatStore$.pendingMessages.peek().length > 0) {
    syncPendingMessages().catch((err) =>
      console.error('[ChatStore] Error in background pending sync:', err)
    );
  }
}, 10000);

export function updateRoomLastMessage(roomId: string, message: ChatMessage) {
  const currentRooms = chatStore$.rooms.peek() || [];
  const index = currentRooms.findIndex((r) => r.roomId === roomId);
  if (index !== -1) {
    const updatedRooms = [...currentRooms];
    const room = updatedRooms[index];
    updatedRooms[index] = {
      ...room,
      lastMessage: message.content || (message.attachmentType === 'audio' ? 'Voice note' : 'New attachment'),
      lastMessageCreatedAt: message.createdAt,
      lastMessageSenderId: message.senderId,
      unreadCount: message.senderId === room.lastMessageSenderId ? room.unreadCount : room.unreadCount + 1,
    };

    // Sort rooms so that the most recently updated room is at the top
    updatedRooms.sort((a, b) => {
      const timeA = new Date(a.lastMessageCreatedAt || a.createdAt).getTime();
      const timeB = new Date(b.lastMessageCreatedAt || b.createdAt).getTime();
      return timeB - timeA;
    });

    chatStore$.rooms.set(updatedRooms);
  }
}

export function clearRoomUnreadCount(roomId: string) {
  const currentRooms = chatStore$.rooms.peek() || [];
  const index = currentRooms.findIndex((r) => r.roomId === roomId);
  if (index !== -1) {
    const updatedRooms = [...currentRooms];
    updatedRooms[index] = {
      ...updatedRooms[index],
      unreadCount: 0,
    };
    chatStore$.rooms.set(updatedRooms);
  }
}

