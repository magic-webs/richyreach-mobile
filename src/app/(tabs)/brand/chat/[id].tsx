import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Attachment01FreeIcons } from '@hugeicons/core-free-icons';
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
import { CampaignPickerSheet } from '@/components/chat/CampaignPickerSheet';

export default function BrandChatConversationScreen() {
  const { id: routeId, name: routeName, avatar: routeAvatar } = useLocalSearchParams<{ id: string; name?: string; avatar?: string }>();
  const router = useRouter();
  const { session } = useAuthStore();
  const { showModal } = useUIStore();
  const currentUserId = session?.user?.id;

  const [roomId, setRoomId] = useState<string | null>(routeId && typeof routeId === 'string' && routeId.startsWith('ip_') ? null : (routeId || null));
  const [roomName, setRoomName] = useState<string | null>(routeName || null);
  const [roomAvatar, setRoomAvatar] = useState<string | null>(routeAvatar || null);
  const [isLoading, setIsLoading] = useState(!!routeId);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSendingVoiceNote, setIsSendingVoiceNote] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

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
          if (routeId.startsWith('ip_')) {
            // Create (or get existing) room between this brand profile and the influencer
            const room = await api.chat.createRoom(routeId);
            resolvedId = room.id;
            setRoomId(room.id);
            if (room.name) setRoomName(room.name);
            if (room.avatar) setRoomAvatar(room.avatar);
          } else {
            setRoomId(routeId);
          }
        }

        const allRooms = await api.chat.rooms();
        const found = allRooms.find((r: any) => r.roomId === resolvedId);
        if (found && active) {
          setRoomName(found.instagramHandle ? `@${found.instagramHandle}` : (found.name || routeName || 'Creator'));
          setRoomAvatar(found.avatar || routeAvatar || null);
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
    appendLocalMessage,
  } = useChatMessages({ roomId, currentUserId });

  const { sendJson } = useChatSocket({
    roomId,
    activeProfileId: useProfilesStore.getState().activeBrandProfileId,
    onMessage: handleIncomingWsMessage,
    onInviteStatusUpdate: handleInviteStatusUpdate,
    onReadReceipt: handleReadReceipt,
  });

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || !roomId || isSending) return;

    setIsSending(true);
    const sentOverSocket = sendJson({ content: trimmed });
    if (sentOverSocket) {
      setText('');
      setIsSending(false);
      return;
    }

    try {
      const res: any = await api.chat.send(roomId, trimmed);
      setText('');
      const activeBrandProfileId = useProfilesStore.getState().activeBrandProfileId;
      const activeProfile = useProfilesStore.getState().brandProfiles.find((p) => p.id === activeBrandProfileId);
      appendLocalMessage({
        id: res.id,
        content: res.content,
        createdAt: res.createdAt,
        senderId: currentUserId!,
        senderName: activeProfile?.companyName || session?.user?.name || 'Me',
        senderAvatar: activeProfile?.logo || undefined,
      });
    } catch (err) {
      console.error('Error sending message via API', err);
      showModal({ title: 'Message Not Sent', message: 'Please check your connection and try again.' });
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
      const sentOverSocket = sendJson({ attachmentUrl: url, attachmentType: 'audio', attachmentDurationSec });
      if (!sentOverSocket) {
        const res: any = await api.chat.send(roomId, undefined, undefined, { attachmentUrl: url, attachmentType: 'audio', attachmentDurationSec });
        const activeBrandProfileId = useProfilesStore.getState().activeBrandProfileId;
        const activeProfile = useProfilesStore.getState().brandProfiles.find((p) => p.id === activeBrandProfileId);
        appendLocalMessage({
          id: res.id,
          content: res.content ?? '',
          createdAt: res.createdAt,
          senderId: currentUserId!,
          senderName: activeProfile?.companyName || session?.user?.name || 'Me',
          senderAvatar: activeProfile?.logo || undefined,
          attachmentUrl: res.attachmentUrl ?? url,
          attachmentType: 'audio',
          attachmentDurationSec: res.attachmentDurationSec ?? attachmentDurationSec,
        });
      }
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
    const payload = { content: "I've invited you to collaborate on our campaign!", campaignId };

    const sentOverSocket = sendJson(payload);
    if (sentOverSocket) {
      setShowCampaignModal(false);
      return;
    }

    try {
      await api.chat.send(roomId, payload.content, campaignId);
      // The plain create response doesn't include campaign/invite enrichment (title, budget,
      // inviteId) — those only come from getMessages' joins. A single-item fetch (not a full
      // refetch) gets the enriched message without discarding any older pages already loaded.
      const latestPage = await api.chat.messages(roomId, { limit: 1 });
      if (latestPage.messages.length > 0) {
        appendLocalMessage(latestPage.messages[latestPage.messages.length - 1]);
      }
      setShowCampaignModal(false);
    } catch (err) {
      console.error('Failed to send campaign invite', err);
      showModal({ title: 'Invite Failed', message: 'Could not send the campaign invitation. Please try again.' });
    }
  };

  const respondToInvite = async (inviteId: string, status: 'accepted' | 'declined') => {
    // Brands never respond to their own invites — kept for MessageList's shared prop signature.
    void inviteId;
    void status;
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
        />
      )}

      <ChatInputBar
        text={text}
        onChangeText={setText}
        onSend={send}
        isSending={isSending}
        onSendVoiceNote={sendVoiceNote}
        isSendingVoiceNote={isSendingVoiceNote}
        attachSlot={
          <TouchableOpacity onPress={openCampaignPicker} style={styles.attachBtn} activeOpacity={0.8}>
            <HugeiconsIcon icon={Attachment01FreeIcons} size={20} color={Colors.oxblood} />
          </TouchableOpacity>
        }
      />

      <CampaignPickerSheet
        visible={showCampaignModal}
        isLoading={isLoadingCampaigns}
        campaigns={campaigns}
        onClose={() => setShowCampaignModal(false)}
        onInvite={inviteCampaign}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  attachBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(63,3,11,0.04)', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end', marginBottom: 4 },
});
