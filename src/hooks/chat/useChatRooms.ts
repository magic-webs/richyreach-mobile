import { useCallback, useState, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { useValue } from '@legendapp/state/react';
import { api } from '@/lib/api';
import { chatStore$ } from '@/store/chatStore';
import type { ChatRoomSummary } from '@/types/chat';

export function useChatRooms() {
  const rooms = useValue(chatStore$.rooms) || [];
  const [isLoading, setIsLoading] = useState(rooms.length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const playedErrorRef = useRef(false);
  const intervalRef = useRef<any>(null);

  const fetchRooms = useCallback(async () => {
    try {
      const data = await api.chat.rooms();
      chatStore$.rooms.set(data as ChatRoomSummary[]);
      playedErrorRef.current = false;
    } catch (err: any) {
      const errMsg = err?.message || '';
      console.warn('Failed to load chat rooms:', errMsg || err);
      
      // Stop polling if a profile is required to prevent console spam
      if (errMsg.includes('profile required')) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }

      if (!playedErrorRef.current) {
        playedErrorRef.current = true;
        try {
          const { playSound } = require('@/lib/sound');
          playSound('error2');
        } catch (e) {}
        
        if (errMsg.includes('Influencer profile required')) {
          const { useUIStore } = require('@/store/ui');
          const { router } = require('expo-router');
          
          useUIStore.getState().showModal({
            title: 'Influencer Profile Required',
            message: 'You need to create an influencer profile to access chat rooms. Would you like to create one now?',
            actions: [
              {
                text: 'Create Profile',
                onPress: () => {
                  useUIStore.getState().hideModal();
                  router.push({ pathname: '/(tabs)/profile', params: { create: 'true' } });
                }
              },
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => useUIStore.getState().hideModal()
              }
            ]
          });
        } else if (errMsg.includes('Brand profile required')) {
          const { useUIStore } = require('@/store/ui');
          const { router } = require('expo-router');
          
          useUIStore.getState().showModal({
            title: 'Brand Profile Required',
            message: 'You need to create a brand profile to access chat rooms. Would you like to create one now?',
            actions: [
              {
                text: 'Create Brand Profile',
                onPress: () => {
                  useUIStore.getState().hideModal();
                  router.push({ pathname: '/(tabs)/brand/profile', params: { create: 'true' } });
                }
              },
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => useUIStore.getState().hideModal()
              }
            ]
          });
        }
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      playedErrorRef.current = false;
      fetchRooms();
      intervalRef.current = setInterval(fetchRooms, 5000);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [fetchRooms])
  );

  const refresh = () => {
    setIsRefreshing(true);
    playedErrorRef.current = false;
    fetchRooms();
  };

  return { rooms, isLoading, isRefreshing, refresh };
}
