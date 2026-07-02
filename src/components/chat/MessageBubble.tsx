import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors } from '@/constants/brand';
import type { DisplayChatMessage } from '@/types/chat';
import { TextMessageContent } from './TextMessageContent';
import { VoiceMessageContent } from './VoiceMessageContent';
import { CampaignInviteCard } from './CampaignInviteCard';
import { CollabAcceptedCard } from './CollabAcceptedCard';

interface MessageBubbleProps {
  message: DisplayChatMessage;
  isMe: boolean;
  isInviteRespondable: boolean;
  onRespondToInvite: (inviteId: string, status: 'accepted' | 'declined') => void;
  collabStepsRoute: (campaignId: string) => { pathname: string; params: { id: string } };
}

export function MessageBubble({ message, isMe, isInviteRespondable, onRespondToInvite, collabStepsRoute }: MessageBubbleProps) {
  const isCollabAccepted = !!message.campaignId && !!message.content?.includes('Collaboration accepted!');
  const isCampaign = !!message.campaignId && !isCollabAccepted && !message.content?.startsWith('Application Proposal:');
  const isVoiceNote = message.attachmentType === 'audio' && !!message.attachmentUrl;

  return (
    <View style={[styles.msgRow, isMe && styles.msgRowMe, { marginTop: message.isGroupContinuation ? 2 : 12 }]}>
      {!isMe && (
        <View style={styles.bubbleAvatarWrap}>
          {message.showAvatar ? (
            message.senderAvatar ? (
              <Image source={{ uri: message.senderAvatar }} style={styles.bubbleAvatar} contentFit="cover" />
            ) : (
              <PlaceholderImage tone="rose" height={32} width={32} borderRadius={99} />
            )
          ) : null}
        </View>
      )}
      <View style={[styles.bubbleContentContainer, isMe ? styles.bubbleContentContainerMe : styles.bubbleContentContainerThem]}>
        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleThem,
            (isCampaign || isCollabAccepted) && styles.campaignBubble,
          ]}
        >
          {isCollabAccepted ? (
            <CollabAcceptedCard message={message} viewHref={collabStepsRoute(message.campaignId!)} />
          ) : isCampaign ? (
            <CampaignInviteCard
              message={message}
              isMe={isMe}
              isRespondable={isInviteRespondable}
              onRespond={onRespondToInvite}
            />
          ) : isVoiceNote ? (
            <VoiceMessageContent url={message.attachmentUrl!} durationSec={message.attachmentDurationSec ?? 0} isMe={isMe} />
          ) : (
            <TextMessageContent content={message.content} isMe={isMe} />
          )}
          <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  msgRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8 },
  msgRowMe: { justifyContent: 'flex-end' },
  bubbleAvatarWrap: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden' },
  bubbleAvatar: { width: 32, height: 32 },
  bubbleContentContainer: { maxWidth: '82%', flexDirection: 'column' },
  bubbleContentContainerMe: { alignItems: 'flex-end' },
  bubbleContentContainerThem: { alignItems: 'flex-start' },

  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, position: 'relative' },
  bubbleMe: {
    backgroundColor: Colors.oxblood,
    borderBottomRightRadius: 4,
    shadowColor: Colors.oxblood,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1.5,
  },
  bubbleThem: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  campaignBubble: {
    width: 290,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.rose,
    padding: 14,
    shadowColor: Colors.oxblood,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  msgTime: { fontSize: 9.5, color: 'rgba(63,3,11,0.4)', alignSelf: 'flex-end', marginTop: 4 },
  msgTimeMe: { color: 'rgba(244,236,228,0.6)' },
});
