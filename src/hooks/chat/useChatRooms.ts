import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';
import type { ChatRoomSummary } from '@/types/chat';

export function useChatRooms() {
  const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      const data = await api.chat.rooms();
      setRooms(data as ChatRoomSummary[]);
    } catch (err) {
      console.error('Failed to load chat rooms', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRooms();
      const interval = setInterval(fetchRooms, 5000);
      return () => clearInterval(interval);
    }, [fetchRooms])
  );

  const refresh = () => {
    setIsRefreshing(true);
    fetchRooms();
  };

  return { rooms, isLoading, isRefreshing, refresh };
}
