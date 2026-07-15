import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Attachment01FreeIcons } from '@hugeicons/core-free-icons';
import { Colors } from '@/constants/brand';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import { useUIStore } from '@/store/ui';
import { api } from '@/lib/api';
import { uploadVoiceNote, uploadMediaFile } from '@/lib/uploadVoiceNote';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useChatSocket } from '@/hooks/chat/useChatSocket';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInputBar } from '@/components/chat/ChatInputBar';
import { CampaignPickerSheet } from '@/components/chat/CampaignPickerSheet';
import type { ChatMessage } from '@/types/chat';

export default function BrandChatConversationScreen() {
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
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const [localIsTyping, setLocalIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const localTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const partnerTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (localTypingTimeoutRef.current) clearTimeout(localTypingTimeoutRef.current);
      if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
    };
  }, []);

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
            const room = await api.chat.createRoom(routeId);
            resolvedId = room.id;
            setRoomId(room.id);
          } else {
            setRoomId(routeId);
          }
        }

        const allRooms = await api.chat.rooms();
        const found = allRooms.find((r: any) => r.roomId === resolvedId);
        if (found && active) {
          setRoomName(found.companyName || found.name || routeName || 'Creator');
          setRoomAvatar(found.logo || found.avatar || routeAvatar || null);
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
  }, [routeId, routeName, routeAvatar]);

  const {
    messages,
    isLoadingInitial,
    isLoadingOlder,
    hasMoreOlder,
    loadOlderMessages,
    handleIncomingWsMessage,
    handleInviteStatusUpdate,
    handleReadReceipt,
    handleReactionUpdate,
    toggleReaction,
    sendMessage,
    sendMediaMessage,
  } = useChatMessages({ roomId, currentUserId });

  const { sendJson } = useChatSocket({
    roomId,
    activeProfileId: useProfilesStore.getState().activeBrandProfileId,
    onMessage: handleIncomingWsMessage,
    onInviteStatusUpdate: handleInviteStatusUpdate,
    onReadReceipt: handleReadReceipt,
    onReactionUpdate: handleReactionUpdate,
    onTypingStatusChange: (userId, isTyping) => {
      if (userId === currentUserId) return;
      setPartnerIsTyping(isTyping);
      if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
      if (isTyping) {
        partnerTypingTimeoutRef.current = setTimeout(() => {
          setPartnerIsTyping(false);
        }, 5000);
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

    if (localTypingTimeoutRef.current) clearTimeout(localTypingTimeoutRef.current);
    localTypingTimeoutRef.current = setTimeout(() => {
      setLocalIsTyping(false);
      sendJson({ type: 'typing', isTyping: false });
    }, 2000);
  };

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || !roomId || isSending) return;
    setIsSending(true);
    if (localTypingTimeoutRef.current) clearTimeout(localTypingTimeoutRef.current);
    setLocalIsTyping(false);
    sendJson({ type: 'typing', isTyping: false });
    try {
      setText('');
      const replyId = replyingTo?.id;
      setReplyingTo(null);
      await sendMessage({ content: trimmed, replyToId: replyId }, sendJson);
    } catch (err) {
      console.error('Error sending message', err);
    } finally {
      setIsSending(false);
    }
  };

  const sendMedia = async (localUri: string, type: 'image' | 'video') => {
    if (!roomId) return;
    const replyId = replyingTo?.id;
    setReplyingTo(null);
    try {
      await sendMediaMessage(localUri, type, replyId, sendJson);
    } catch (err) {
      showModal({ title: 'Upload Failed', message: 'Could not send the media attachment. Please try again.' });
    }
  };

  const sendVoiceNote = async (localUri: string, durationSec: number) => {
    if (!roomId || isSendingVoiceNote) return;
    setIsSendingVoiceNote(true);
    try {
      const { url } = await uploadVoiceNote(localUri);
      const attachmentDurationSec = Math.round(durationSec);
      const replyId = replyingTo?.id;
      setReplyingTo(null);
      await sendMessage({
        attachment: { attachmentUrl: url, attachmentType: 'audio', attachmentDurationSec },
        replyToId: replyId,
      }, sendJson);
    } catch (err) {
      console.error('Failed to send voice note', err);
      showModal({ title: 'Voice Note Not Sent', message: 'Please check your connection and try again.' });
    } finally {
      setIsSendingVoiceNote(false);
    }
  };

  const openCampaignPicker = async () => {
    try {
      setShowCampaignModal(true);
      setIsLoadingCampaigns(true);
      const data = (await api.campaigns.list()) as any[];
      setCampaigns(data.filter((c: any) => c.status === 'active'));
    } catch (err) {
      console.error('Failed to load campaigns', err);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  const inviteCampaign = async (campaignId: string) => {
    if (!roomId) return;
    const content = "I've invited you to collaborate on our campaign!";
    try {
      await sendMessage({ content, campaignId }, sendJson);
      setShowCampaignModal(false);
    } catch (err) {
      console.error('Failed to send campaign invite', err);
      showModal({ title: 'Invite Failed', message: 'Could not send the campaign invitation. Please try again.' });
    }
  };

  const respondToInvite = async (inviteId: string, status: 'accepted' | 'declined') => {
    // Brands never respond to their own invites — kept for MessageList's shared signature.
    void inviteId;
    void status;
  };

  const handleReact = (messageId: string, emoji: string) => {
    toggleReaction(messageId, emoji, sendJson);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior="padding">
      <ChatHeader name={roomName || 'Creator'} avatarUrl={roomAvatar} onBackPress={() => router.replace('/brand/chat' as any)} />
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
          isInviteRespondable={false}
          onRespondToInvite={respondToInvite}
          collabStepsRoute={(campaignId) => ({ pathname: '/brand/campaign/[id]', params: { id: campaignId } })}
          partnerIsTyping={partnerIsTyping}
          onReply={setReplyingTo}
          onReact={handleReact}
        />
      )}

      <ChatInputBar
        text={text}
        onChangeText={handleTextChange}
        onSend={send}
        isSending={isSending}
        onSendVoiceNote={sendVoiceNote}
        isSendingVoiceNote={isSendingVoiceNote}
        onSendMedia={sendMedia}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      // attachSlot={
      //   <TouchableOpacity onPress={openCampaignPicker} style={styles.attachBtn} activeOpacity={0.8}>
      //     <HugeiconsIcon icon={Attachment01FreeIcons} size={20} color={Colors.oxblood} />
      //   </TouchableOpacity>
      // }
      />
      {/* TODO: Campaign picker sheet */}
      {/* <CampaignPickerSheet
        visible={showCampaignModal}
        isLoading={isLoadingCampaigns}
        campaigns={campaigns}
        onClose={() => setShowCampaignModal(false)}
        onInvite={inviteCampaign}
      /> */}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  attachBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(63,3,11,0.04)', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end', marginBottom: 4 },
});
