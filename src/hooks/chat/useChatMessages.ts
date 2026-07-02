import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { ChatMessage, DisplayChatMessage, InviteStatus } from '@/types/chat';

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

export function useChatMessages({ roomId, currentUserId, pageSize = 30 }: UseChatMessagesOptions) {
  const [rawMessages, setRawMessages] = useState<ChatMessage[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const oldestCursorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const currentRoomId = roomId;
    let active = true;

    async function loadInitial() {
      setIsLoadingInitial(true);
      setRawMessages([]);
      oldestCursorRef.current = null;
      setHasMoreOlder(true);
      try {
        const page = await api.chat.messages(currentRoomId, { limit: pageSize });
        if (!active) return;
        setRawMessages(page.messages);
        oldestCursorRef.current = page.pagination.nextCursor;
        setHasMoreOlder(page.pagination.hasMore);
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
  }, [roomId, pageSize]);

  const loadOlderMessages = useCallback(async () => {
    if (!roomId || !hasMoreOlder || isLoadingOlder || isLoadingInitial || !oldestCursorRef.current) return;
    setIsLoadingOlder(true);
    try {
      const page = await api.chat.messages(roomId, { cursor: oldestCursorRef.current, limit: pageSize });
      setRawMessages((prev) => [...page.messages, ...prev]);
      oldestCursorRef.current = page.pagination.nextCursor;
      setHasMoreOlder(page.pagination.hasMore);
    } catch (err) {
      console.error('Failed to load older messages', err);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [roomId, hasMoreOlder, isLoadingOlder, isLoadingInitial, pageSize]);

  const appendLocalMessage = useCallback((message: ChatMessage) => {
    setRawMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
  }, []);

  const handleIncomingWsMessage = appendLocalMessage;

  const handleInviteStatusUpdate = useCallback((inviteId: string, status: InviteStatus) => {
    setRawMessages((prev) => prev.map((m) => (m.inviteId === inviteId ? { ...m, inviteStatus: status } : m)));
  }, []);

  const handleReadReceipt = useCallback((messageIds: string[], readAt: string) => {
    const idSet = new Set(messageIds);
    setRawMessages((prev) => prev.map((m) => (idSet.has(m.id) ? { ...m, readAt } : m)));
  }, []);

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
  };
}
