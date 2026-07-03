import { useCallback, useEffect, useMemo, useState } from 'react';
import { useValue } from '@legendapp/state/react';
import { api } from '@/lib/api';
import { chatStore$, syncPendingMessages } from '@/store/chatStore';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import type { ChatMessage, DisplayChatMessage, InviteStatus, ChatAttachmentType } from '@/types/chat';

function deriveDisplayMessages(messages: ChatMessage[], currentUserId: string | undefined): DisplayChatMessage[] {
  return messages.map((m, index) => {
    const prevMsg = messages[index - 1];
    const isMe = m.senderId === currentUserId;
    const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== m.senderId);
    const isGroupContinuation = !!prevMsg && prevMsg.senderId === m.senderId;
    return { ...m, showAvatar, isGroupContinuation };
  });
}

interface UseChatMessagesOptions {
  roomId: string | null;
  currentUserId: string | undefined;
  pageSize?: number;
}

const EMPTY_ARRAY: ChatMessage[] = [];

export function useChatMessages({ roomId, currentUserId, pageSize = 30 }: UseChatMessagesOptions) {
  // Ensure the room exists in the observable store
  const roomMessages$ = useMemo(() => {
    if (!roomId) return null;
    const room$ = chatStore$.messagesByRoom[roomId];
    if (!room$.peek()) {
      room$.set({
        list: [],
        nextCursor: null,
        hasMore: true,
      });
    }
    return room$;
  }, [roomId]);

  // Read message list and pagination reactively from LegendState
  const roomState = useValue(() => roomMessages$?.get());
  const rawMessages = roomState?.list || EMPTY_ARRAY;
  const hasMoreOlder = roomState?.hasMore ?? true;
  const nextCursor = roomState?.nextCursor ?? null;

  const [isLoadingInitial, setIsLoadingInitial] = useState(rawMessages.length === 0);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  useEffect(() => {
    if (!roomId || !roomMessages$) return;
    const currentRoomId = roomId;
    const activeRoomMessages$ = roomMessages$;
    let active = true;

    async function loadInitial() {
      const currentList = activeRoomMessages$.list.peek() || [];
      if (currentList.length === 0) {
        setIsLoadingInitial(true);
      }
      try {
        const page = await api.chat.messages(currentRoomId, { limit: pageSize });
        if (!active) return;

        // Overwrite list with latest messages, and update cursors
        activeRoomMessages$.set({
          list: page.messages,
          nextCursor: page.pagination.nextCursor,
          hasMore: page.pagination.hasMore,
        });
      } catch (err) {
        console.error('Failed to load messages', err);
      } finally {
        if (active) setIsLoadingInitial(false);
      }
    }

    loadInitial();
    return () => {
      active = false;
    };
  }, [roomId, pageSize, roomMessages$]);

  const loadOlderMessages = useCallback(async () => {
    if (!roomId || !roomMessages$ || !hasMoreOlder || isLoadingOlder || isLoadingInitial || !nextCursor) return;
    setIsLoadingOlder(true);
    try {
      const page = await api.chat.messages(roomId, { cursor: nextCursor, limit: pageSize });

      const currentList = roomMessages$.list.peek() || [];
      // Deduplicate messages
      const newMessages = page.messages.filter(newMsg => !currentList.some(m => m.id === newMsg.id));

      roomMessages$.list.set([...newMessages, ...currentList]);
      roomMessages$.nextCursor.set(page.pagination.nextCursor);
      roomMessages$.hasMore.set(page.pagination.hasMore);
    } catch (err) {
      console.error('Failed to load older messages', err);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [roomId, roomMessages$, hasMoreOlder, isLoadingOlder, isLoadingInitial, nextCursor, pageSize]);

  // Merge/Replace temporary local message with confirmed server message on incoming socket
  const handleIncomingWsMessage = useCallback((incoming: ChatMessage) => {
    if (!roomId || !roomMessages$) return;
    const currentList = roomMessages$.list.peek() || [];

    // Check if we have an optimistic/pending temp message that matches
    const tempIndex = currentList.findIndex(m => {
      if (!m.id.startsWith('temp_')) return false;
      if (incoming.attachmentUrl && m.attachmentUrl) {
        return incoming.attachmentUrl === m.attachmentUrl;
      }
      if (incoming.campaignId && m.campaignId) {
        return incoming.campaignId === m.campaignId;
      }
      return incoming.content === m.content && incoming.senderId === m.senderId;
    });

    if (tempIndex !== -1) {
      // Replace temporary message with official server one
      const updated = [...currentList];
      updated[tempIndex] = incoming;
      roomMessages$.list.set(updated);
    } else {
      // Normal append if it doesn't already exist
      if (!currentList.some(m => m.id === incoming.id)) {
        roomMessages$.list.set([...currentList, incoming]);
      }
    }
  }, [roomId, roomMessages$]);

  const appendLocalMessage = handleIncomingWsMessage;

  const handleInviteStatusUpdate = useCallback((inviteId: string, status: InviteStatus) => {
    if (!roomId || !roomMessages$) return;
    const currentList = roomMessages$.list.peek() || [];
    const updated = currentList.map((m) =>
      m.inviteId === inviteId ? { ...m, inviteStatus: status } : m
    );
    roomMessages$.list.set(updated);
  }, [roomId, roomMessages$]);

  const handleReadReceipt = useCallback((messageIds: string[], readAt: string) => {
    if (!roomId || !roomMessages$) return;
    const currentList = roomMessages$.list.peek() || [];
    const idSet = new Set(messageIds);
    const updated = currentList.map((m) =>
      idSet.has(m.id) ? { ...m, readAt } : m
    );
    roomMessages$.list.set(updated);
  }, [roomId, roomMessages$]);

  // A local-first robust send method that does optimistic updates and queues on failure
  const sendMessage = useCallback(async (
    payload: {
      content?: string;
      campaignId?: string;
      attachment?: { attachmentUrl: string; attachmentType: ChatAttachmentType; attachmentDurationSec: number };
    },
    sendJson?: (p: any) => boolean
  ): Promise<ChatMessage | null> => {
    if (!roomId || !roomMessages$ || !currentUserId) return null;

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = useAuthStore.getState().session;
    const activeInfluencerProfileId = useProfilesStore.getState().activeInfluencerProfileId;
    const activeInfluencer = useProfilesStore.getState().influencerProfiles.find((p) => p.id === activeInfluencerProfileId);
    const activeBrandProfileId = useProfilesStore.getState().activeBrandProfileId;
    const activeBrand = useProfilesStore.getState().brandProfiles.find((p) => p.id === activeBrandProfileId);

    let senderName = 'Me';
    let senderAvatar = undefined;

    if (activeInfluencer) {
      senderName = activeInfluencer.instagramHandle ? `@${activeInfluencer.instagramHandle}` : (session?.user?.name || 'Me');
      senderAvatar = activeInfluencer.avatar || undefined;
    } else if (activeBrand) {
      senderName = activeBrand.companyName || session?.user?.name || 'Me';
      senderAvatar = activeBrand.logo || undefined;
    }

    const tempMsg: ChatMessage = {
      id: tempId,
      content: payload.content || '',
      createdAt: new Date().toISOString(),
      senderId: currentUserId,
      senderName,
      senderAvatar,
      campaignId: payload.campaignId,
      attachmentUrl: payload.attachment?.attachmentUrl,
      attachmentType: payload.attachment?.attachmentType,
      attachmentDurationSec: payload.attachment?.attachmentDurationSec,
    };

    // 1. Optimistic append to list
    const currentList = roomMessages$.list.peek() || [];
    roomMessages$.list.set([...currentList, tempMsg]);

    // 2. Try sending over WebSocket first
    const wsPayload = {
      content: payload.content,
      campaignId: payload.campaignId,
      attachmentUrl: payload.attachment?.attachmentUrl,
      attachmentType: payload.attachment?.attachmentType,
      attachmentDurationSec: payload.attachment?.attachmentDurationSec,
    };

    if (sendJson && sendJson(wsPayload)) {
      // WS successfully dispatched, server will send back the message.
      return tempMsg;
    }

    // 3. Fallback to REST API
    try {
      const res = await api.chat.send(roomId, payload.content, payload.campaignId, payload.attachment);

      // Update optimistic item with resolved message
      const latestList = roomMessages$.list.peek() || [];
      const idx = latestList.findIndex(m => m.id === tempId);
      if (idx !== -1) {
        const updated = [...latestList];
        updated[idx] = res;
        roomMessages$.list.set(updated);
      }
      return res;
    } catch (err) {
      console.warn('[useChatMessages] REST send failed, queuing message locally', err);

      // 4. Save to pending queue for background retry
      chatStore$.pendingMessages.push({
        roomId,
        tempId,
        content: payload.content,
        campaignId: payload.campaignId,
        attachment: payload.attachment,
        createdAt: tempMsg.createdAt,
      });

      // Try triggering a sync in the background (will succeed if temporary glitch, otherwise retried by poller)
      syncPendingMessages().catch(() => {});

      return tempMsg;
    }
  }, [roomId, currentUserId, roomMessages$]);

  const messages = useMemo(() => deriveDisplayMessages(rawMessages, currentUserId), [rawMessages, currentUserId]);

  return {
    messages,
    isLoadingInitial,
    isLoadingOlder,
    hasMoreOlder,
    loadOlderMessages,
    handleIncomingWsMessage,
    handleInviteStatusUpdate,
    handleReadReceipt,
    appendLocalMessage,
    sendMessage,
  };
}
