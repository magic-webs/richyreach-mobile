import { useEffect, useRef, useState } from 'react';
import { getToken } from '@/lib/storage';
import type { ChatMessage, InviteStatus, SendMessagePayload } from '@/types/chat';

interface UseChatSocketOptions {
  roomId: string | null;
  activeProfileId: string | null;
  onMessage: (message: ChatMessage) => void;
  onInviteStatusUpdate: (inviteId: string, status: InviteStatus) => void;
  onReadReceipt: (messageIds: string[], readAt: string) => void;
}

type OutgoingPayload = SendMessagePayload | { type: 'status-update'; inviteId: string; status: InviteStatus };

export function useChatSocket({ roomId, activeProfileId, onMessage, onInviteStatusUpdate, onReadReceipt }: UseChatSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbacksRef = useRef({ onMessage, onInviteStatusUpdate, onReadReceipt });
  callbacksRef.current = { onMessage, onInviteStatusUpdate, onReadReceipt };

  useEffect(() => {
    if (!roomId) return;
    const currentRoomId = roomId;
    let isMounted = true;

    async function connect() {
      try {
        // Read token async from SecureStore — same path as REST API calls.
        // Using session?.token from Zustand is unreliable on mobile because
        // the store may not be populated yet when this effect fires.
        const token = await getToken();
        if (!token || !isMounted) return;

        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }

        if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
          wsRef.current.onclose = null;
          wsRef.current.close();
        }

        const rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';
        const wsBaseUrl = rawApiUrl.replace(/^https/, 'wss').replace(/^http(?!s)/, 'ws');
        const wsUrl = `${wsBaseUrl}/chat/ws/${currentRoomId}?token=${encodeURIComponent(token)}&activeProfileId=${encodeURIComponent(activeProfileId || '')}`;

        console.log('[WS] Connecting to:', wsUrl.replace(token, '***'));

        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          console.log('[WS] Connected for room:', currentRoomId);
          if (isMounted) setIsConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'message' && isMounted) {
              callbacksRef.current.onMessage(data.message);
            } else if (data.type === 'invite-status-update' && isMounted) {
              callbacksRef.current.onInviteStatusUpdate(data.inviteId, data.status);
            } else if (data.type === 'read-receipt' && isMounted) {
              callbacksRef.current.onReadReceipt(data.messageIds, data.readAt);
            }
          } catch (err) {
            console.error('[WS] Error parsing message:', err);
          }
        };

        socket.onerror = (e) => {
          console.warn('[WS] Error:', e);
        };

        socket.onclose = (e) => {
          console.log('[WS] Closed. Code:', e.code, 'Reason:', e.reason);
          wsRef.current = null;
          if (isMounted) setIsConnected(false);
          if (isMounted && e.code !== 1000) {
            reconnectTimerRef.current = setTimeout(() => {
              if (isMounted) connect();
            }, 3000);
          }
        };
      } catch (err) {
        console.error('[WS] Connection error:', err);
        if (isMounted) {
          reconnectTimerRef.current = setTimeout(() => {
            if (isMounted) connect();
          }, 3000);
        }
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null; // detach handler to prevent reconnect
        wsRef.current.close(1000, 'component unmounted');
        wsRef.current = null;
      }
      setIsConnected(false);
    };
    // activeProfileId is deliberately read once per connect, not a reactive dependency —
    // matches today's behavior where switching active profile mid-session doesn't reconnect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const sendJson = (payload: OutgoingPayload): boolean => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      return true;
    }
    return false;
  };

  return { sendJson, isConnected };
}
