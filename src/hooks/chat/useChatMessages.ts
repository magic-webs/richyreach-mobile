import { useCallback, useEffect, useMemo, useState } from 'react';
import { useValue } from '@legendapp/state/react';
import { api } from '@/lib/api';
import { playSound } from '@/lib/sound';
import { uploadMediaFile } from '@/lib/uploadVoiceNote';
import { chatStore$, syncPendingMessages } from '@/store/chatStore';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import type { ChatMessage, DisplayChatMessage, InviteStatus, ChatAttachmentType } from '@/types/chat';

function deriveDisplayMessages(messages: ChatMessage[], currentUserId: string | undefined): DisplayChatMessage[] {
  const uniqueMessages: ChatMessage[] = [];
  const seenIds = new Set<string>();
  for (const m of messages) {
    if (!seenIds.has(m.id)) {
      seenIds.add(m.id);
      uniqueMessages.push(m);
    }
  }

  return uniqueMessages.map((m, index) => {
    const prevMsg = uniqueMessages[index - 1];
    const nextMsg = uniqueMessages[index + 1];
    const isMe = m.senderId === currentUserId;
    const showAvatar = !isMe && (!nextMsg || nextMsg.senderId !== m.senderId);
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

    // 1. If a message with this exact server ID already exists, skip entirely
    if (currentList.some(m => m.id === incoming.id)) return;

    // 2. Try to find a matching optimistic temp message to replace
    const tempIndex = currentList.findIndex(m => {
      if (!m.id.startsWith('temp_')) return false;
      // Must be from the same sender
      if (m.senderId !== incoming.senderId) return false;
      // Match by attachment URL (most reliable for media messages)
      if (incoming.attachmentUrl && m.attachmentUrl && incoming.attachmentUrl === m.attachmentUrl) return true;
      // Match by campaign invite
      if (incoming.campaignId && m.campaignId && incoming.campaignId === m.campaignId) return true;
      // Match by content text (for regular text messages)
      if (incoming.content && m.content && incoming.content === m.content) return true;
      return false;
    });

    if (tempIndex !== -1) {
      // Replace the temp message with the confirmed server message
      const updated = [...currentList];
      updated[tempIndex] = incoming;
      roomMessages$.list.set(updated);
    } else {
      // New message from another user (or a message we didn't send optimistically)
      roomMessages$.list.set([...currentList, incoming]);
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
      replyToId?: string;
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

    let replyToContent = undefined;
    let replyToSenderName = undefined;
    const currentList = roomMessages$.list.peek() || [];
    if (payload.replyToId) {
      const parent = currentList.find(m => m.id === payload.replyToId);
      if (parent) {
        replyToContent = parent.content;
        replyToSenderName = parent.senderName;
      }
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
      replyToId: payload.replyToId,
      replyToContent,
      replyToSenderName,
    };

    // 1. Optimistic append to list
    roomMessages$.list.set([...currentList, tempMsg]);
    playSound('messageSent');

    // 2. Try sending over WebSocket first
    const wsPayload = {
      content: payload.content,
      campaignId: payload.campaignId,
      attachmentUrl: payload.attachment?.attachmentUrl,
      attachmentType: payload.attachment?.attachmentType,
      attachmentDurationSec: payload.attachment?.attachmentDurationSec,
      replyToId: payload.replyToId,
    };

    if (sendJson && sendJson(wsPayload)) {
      // WS successfully dispatched, server will send back the message.
      return tempMsg;
    }

    // 3. Fallback to REST API
    try {
      const res = await api.chat.send(roomId, payload.content, payload.campaignId, payload.attachment, payload.replyToId);

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

  const sendMediaMessage = useCallback(async (
    localUri: string,
    type: 'image' | 'video',
    replyToId?: string,
    sendJson?: (p: any) => boolean
  ) => {
    if (!roomId || !roomMessages$ || !currentUserId) return;

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

    let replyToContent = undefined;
    let replyToSenderName = undefined;
    const currentList = roomMessages$.list.peek() || [];
    if (replyToId) {
      const parent = currentList.find(m => m.id === replyToId);
      if (parent) {
        replyToContent = parent.content;
        replyToSenderName = parent.senderName;
      }
    }

    const tempMsg: ChatMessage = {
      id: tempId,
      content: '',
      createdAt: new Date().toISOString(),
      senderId: currentUserId,
      senderName,
      senderAvatar,
      attachmentUrl: localUri,
      attachmentType: type,
      attachmentDurationSec: 0,
      replyToId,
      replyToContent,
      replyToSenderName,
    };

    // 1. Optimistic append local message with local uri
    roomMessages$.list.set([...currentList, tempMsg]);
    playSound('messageSent');

    try {
      // 2. Upload the file to S3 in background
      const { url } = await uploadMediaFile(localUri, type);

      // 3. Update the local temporary message's attachmentUrl to the public URL
      const latestList = roomMessages$.list.peek() || [];
      const idx = latestList.findIndex(m => m.id === tempId);
      if (idx !== -1) {
        const updated = [...latestList];
        updated[idx] = { ...updated[idx], attachmentUrl: url };
        roomMessages$.list.set(updated);
      }

      // 4. Dispatch using WS or fallback REST with the final public URL
      const payload = {
        attachment: { attachmentUrl: url, attachmentType: type, attachmentDurationSec: 0 },
        replyToId,
      };

      const wsPayload = {
        attachmentUrl: url,
        attachmentType: type,
        attachmentDurationSec: 0,
        replyToId,
      };

      if (sendJson && sendJson(wsPayload)) {
        // Sent successfully via WebSocket
        return;
      }

      // Fallback: Send via REST API
      const res = await api.chat.send(roomId, undefined, undefined, payload.attachment, replyToId);
      
      // Update optimistic item with resolved message
      const finalIndexList = roomMessages$.list.peek() || [];
      const fIdx = finalIndexList.findIndex(m => m.id === tempId);
      if (fIdx !== -1) {
        const updated = [...finalIndexList];
        updated[fIdx] = res;
        roomMessages$.list.set(updated);
      }
    } catch (err) {
      console.error('[useChatMessages] Failed to upload/send media optimistically', err);
      // Remove the optimistic temporary message on complete failure
      const finalIndexList = roomMessages$.list.peek() || [];
      const updated = finalIndexList.filter(m => m.id !== tempId);
      roomMessages$.list.set(updated);
      throw err;
    }
  }, [roomId, currentUserId, roomMessages$]);

  const handleReactionUpdate = useCallback((messageId: string, userId: string, reaction: string) => {
    if (!roomId || !roomMessages$) return;
    const currentList = roomMessages$.list.peek() || [];
    const msgIndex = currentList.findIndex(m => m.id === messageId);
    
    if (msgIndex !== -1) {
      const msg = currentList[msgIndex];
      const reactions = msg.reactions || [];
      const existingIdx = reactions.findIndex(r => r.userId === userId);
      
      let updatedReactions = [...reactions];
      if (existingIdx !== -1) {
        if (!reaction) {
          updatedReactions.splice(existingIdx, 1);
        } else {
          updatedReactions[existingIdx] = { ...reactions[existingIdx], reaction };
        }
      } else if (reaction) {
        updatedReactions.push({ id: `react_${Date.now()}`, userId, reaction });
      }
      
      const updatedList = [...currentList];
      updatedList[msgIndex] = { ...msg, reactions: updatedReactions };
      roomMessages$.list.set(updatedList);
    }
  }, [roomId, roomMessages$]);

  const toggleReaction = useCallback(async (messageId: string, emoji: string, sendJson?: (p: any) => boolean) => {
    if (!roomId || !roomMessages$ || !currentUserId) return;
    
    const currentList = roomMessages$.list.peek() || [];
    const msgIndex = currentList.findIndex(m => m.id === messageId);
    
    if (msgIndex !== -1) {
      const msg = currentList[msgIndex];
      const reactions = msg.reactions || [];
      const existingIdx = reactions.findIndex(r => r.userId === currentUserId);
      
      let updatedReactions = [...reactions];
      if (existingIdx !== -1) {
        if (reactions[existingIdx].reaction === emoji || !emoji) {
          updatedReactions.splice(existingIdx, 1);
        } else {
          updatedReactions[existingIdx] = { ...reactions[existingIdx], reaction: emoji };
        }
      } else if (emoji) {
        updatedReactions.push({ id: `temp_react_${Date.now()}`, userId: currentUserId, reaction: emoji });
      }
      
      const updatedList = [...currentList];
      updatedList[msgIndex] = { ...msg, reactions: updatedReactions };
      roomMessages$.list.set(updatedList);
    }
    
    const wsPayload = { type: 'reaction' as const, messageId, reaction: emoji };
    if (sendJson && sendJson(wsPayload)) {
      return;
    }
    
    try {
      const isAdmin = currentUserId.startsWith('usr_') ? false : true;
      await api.chat.react(messageId, emoji, roomId, isAdmin);
    } catch (err) {
      console.warn('Failed to send reaction via REST', err);
    }
  }, [roomId, roomMessages$, currentUserId]);

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
    sendMediaMessage,
    handleReactionUpdate,
    toggleReaction,
  };
}
