import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Colors } from '@/constants/brand';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import { useUIStore } from '@/store/ui';
import { api } from '@/lib/api';
import { uploadVoiceNote } from '@/lib/uploadVoiceNote';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useChatSocket } from '@/hooks/chat/useChatSocket';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInputBar } from '@/components/chat/ChatInputBar';
import type { InviteStatus } from '@/types/chat';

export default function InfluencerChatConversationScreen() {
  const { id: routeId, name: routeName, avatar: routeAvatar } = useLocalSearchParams<{ id: string; name?: string; avatar?: string }>();
  const router = useRouter();
  const { session } = useAuthStore();
  const { showModal } = useUIStore();
  const currentUserId = session?.user?.id;

  const [roomId, setRoomId] = useState<string | null>(routeId && typeof routeId === 'string' && routeId.startsWith('bp_') ? null : (routeId || null));
  const [roomName, setRoomName] = useState<string | null>(routeName || null);
  const [roomAvatar, setRoomAvatar] = useState<string | null>(routeAvatar || null);
  const [isLoading, setIsLoading] = useState(!!routeId);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSendingVoiceNote, setIsSendingVoiceNote] = useState(false);

  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const [localIsTyping, setLocalIsTyping] = useState(false);
  const localTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const partnerTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (localTypingTimeoutRef.current) clearTimeout(localTypingTimeoutRef.current);
      if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
    };
  }, []);

  // Resolve room and metadata dynamically on mount
  useEffect(() => {
    if (!routeId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    async function resolve() {
      try {
        setIsLoading(true);
        let resolvedId = routeId;

        if (active && typeof routeId === 'string') {
          if (routeId.startsWith('bp_')) {
            // Create (or get existing) room between this influencer profile and the brand
            const room = await api.chat.createRoom(routeId);
            resolvedId = room.id;
            setRoomId(room.id);
            if (room.companyName) setRoomName(room.companyName);
            if (room.logo) setRoomAvatar(room.logo);
          } else {
            setRoomId(routeId);
          }
        }

        const allRooms = await api.chat.rooms();
        const found = allRooms.find((r: any) => r.roomId === resolvedId);
        if (found && active) {
          setRoomName(found.companyName || routeName || 'Brand');
          setRoomAvatar(found.logo || routeAvatar || null);
        } else if (active) {
          if (routeName) setRoomName(routeName);
          if (routeAvatar) setRoomAvatar(routeAvatar);
        }
      } catch (err) {
        console.error('Failed to resolve room details', err);
        if (active) {
          if (routeName) setRoomName(routeName);
          if (routeAvatar) setRoomAvatar(routeAvatar);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }
    resolve();
    return () => {
      active = false;
    };
  }, [routeId]);

  const {
    messages,
    isLoadingInitial,
    isLoadingOlder,
    hasMoreOlder,
    loadOlderMessages,
    handleIncomingWsMessage,
    handleInviteStatusUpdate,
    handleReadReceipt,
    sendMessage,
  } = useChatMessages({ roomId, currentUserId });

  const { sendJson } = useChatSocket({
    roomId,
    activeProfileId: useProfilesStore.getState().activeInfluencerProfileId,
    onMessage: handleIncomingWsMessage,
    onInviteStatusUpdate: handleInviteStatusUpdate,
    onReadReceipt: handleReadReceipt,
    onTypingStatusChange: (userId, isTyping) => {
      if (userId === currentUserId) return;
      setPartnerIsTyping(isTyping);
      if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
      if (isTyping) {
        partnerTypingTimeoutRef.current = setTimeout(() => {
          setPartnerIsTyping(false);
        }, 5000); // 5s safety timeout
      }
    },
  });

  const handleTextChange = (val: string) => {
    setText(val);
    if (!roomId) return;

    if (!localIsTyping && val.trim().length > 0) {
      setLocalIsTyping(true);
      sendJson({ type: 'typing', isTyping: true });
    } else if (val.trim().length === 0) {
      setLocalIsTyping(false);
      sendJson({ type: 'typing', isTyping: false });
      if (localTypingTimeoutRef.current) clearTimeout(localTypingTimeoutRef.current);
      return;
    }

    if (localTypingTimeoutRef.current) {
      clearTimeout(localTypingTimeoutRef.current);
    }

    localTypingTimeoutRef.current = setTimeout(() => {
      setLocalIsTyping(false);
      sendJson({ type: 'typing', isTyping: false });
    }, 2000);
  };

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || !roomId || isSending) return;

    setIsSending(true);
    if (localTypingTimeoutRef.current) {
      clearTimeout(localTypingTimeoutRef.current);
    }
    setLocalIsTyping(false);
    sendJson({ type: 'typing', isTyping: false });

    try {
      setText('');
      await sendMessage({ content: trimmed }, sendJson);
    } catch (err) {
      console.error('Error sending message', err);
    } finally {
      setIsSending(false);
    }
  };

  const sendVoiceNote = async (localUri: string, durationSec: number) => {
    if (!roomId || isSendingVoiceNote) return;
    setIsSendingVoiceNote(true);
    try {
      const { url } = await uploadVoiceNote(localUri);
      const attachmentDurationSec = Math.round(durationSec);
      await sendMessage({
        attachment: { attachmentUrl: url, attachmentType: 'audio', attachmentDurationSec }
      }, sendJson);
    } catch (err) {
      console.error('Failed to send voice note', err);
      showModal({ title: 'Voice Note Not Sent', message: 'Please check your connection and try again.' });
    } finally {
      setIsSendingVoiceNote(false);
    }
  };

  const respondToInvite = async (inviteId: string, status: 'accepted' | 'declined') => {
    try {
      await api.chat.respondInvite(inviteId, status);
      handleInviteStatusUpdate(inviteId, status as InviteStatus);
      sendJson({ type: 'status-update', inviteId, status });
    } catch (err) {
      console.error('Failed to respond to invite', err);
      showModal({ title: 'Action Failed', message: 'Could not update the invitation. Please try again.' });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior="padding">
      <ChatHeader name={roomName || 'Brand Support'} avatarUrl={roomAvatar} onBackPress={() => router.replace('/chat')} />

      {isLoading || isLoadingInitial ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.rose} />
        </View>
      ) : (
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          isLoadingOlder={isLoadingOlder}
          hasMoreOlder={hasMoreOlder}
          onLoadOlder={loadOlderMessages}
          isInviteRespondable={true}
          onRespondToInvite={respondToInvite}
          collabStepsRoute={(campaignId) => ({ pathname: '/collab/[id]', params: { id: campaignId } })}
          partnerIsTyping={partnerIsTyping}
        />
      )}

      <ChatInputBar
        text={text}
        onChangeText={handleTextChange}
        onSend={send}
        isSending={isSending}
        onSendVoiceNote={sendVoiceNote}
        isSendingVoiceNote={isSendingVoiceNote}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
