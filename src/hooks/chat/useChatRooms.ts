import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useValue } from '@legendapp/state/react';
import { api } from '@/lib/api';
import { chatStore$ } from '@/store/chatStore';
import type { ChatRoomSummary } from '@/types/chat';

export function useChatRooms() {
  const rooms = useValue(chatStore$.rooms) || [];
  const [isLoading, setIsLoading] = useState(rooms.length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      const data = await api.chat.rooms();
      chatStore$.rooms.set(data as ChatRoomSummary[]);
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
