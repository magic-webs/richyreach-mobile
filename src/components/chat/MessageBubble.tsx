import { useState, useMemo } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, TouchableWithoutFeedback, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import type { DisplayChatMessage, ChatMessage } from '@/types/chat';
import { TextMessageContent } from './TextMessageContent';
import { VoiceMessageContent } from './VoiceMessageContent';
import { CampaignInviteCard } from './CampaignInviteCard';
import { CollabAcceptedCard } from './CollabAcceptedCard';
import { Icon } from '@/components/ui/icon';

interface MessageBubbleProps {
  message: DisplayChatMessage;
  isMe: boolean;
  isInviteRespondable: boolean;
  onRespondToInvite: (inviteId: string, status: 'accepted' | 'declined') => void;
  collabStepsRoute: (campaignId: string) => { pathname: string; params: { id: string } };
  onReply?: (message: ChatMessage) => void;
  onReact?: (messageId: string, emoji: string) => void;
  currentUserId: string;
  onScrollToMessage?: (messageId: string) => void;
}

function FullscreenMediaModal({
  visible,
  url,
  type,
  onClose,
}: {
  visible: boolean;
  url: string;
  type: 'image' | 'video';
  onClose: () => void;
}) {
  const player = type === 'video' ? useVideoPlayer(url, (p) => {
    p.loop = false;
    p.play();
  }) : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.fullscreenContainer}>
        <TouchableOpacity style={styles.fullscreenCloseBtn} onPress={onClose}>
          <Icon name="x" size={24} color="#ffffff" />
        </TouchableOpacity>
        {type === 'image' ? (
          <Image source={{ uri: url }} style={styles.fullscreenImage} contentFit="contain" />
        ) : (
          player && (
            <VideoView
              player={player}
              style={styles.fullscreenVideo}
            />
          )
        )}
      </View>
    </Modal>
  );
}

function ActionMenuModal({
  visible,
  onClose,
  onSelectReaction,
  onSelectReply,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectReaction: (emoji: string) => void;
  onSelectReply: () => void;
}) {
  const emojis = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.menuBackdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.menuCard}>
              {/* Emojis row */}
              <View style={styles.emojiRow}>
                {emojis.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => {
                      onSelectReaction(emoji);
                      onClose();
                    }}
                    style={styles.emojiBtn}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Actions */}
              <TouchableOpacity
                onPress={() => {
                  onSelectReply();
                  onClose();
                }}
                style={styles.menuActionBtn}
              >
                <Icon name="chat" size={16} color={Colors.oxblood} />
                <Text style={styles.menuActionText}>Reply</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export function MessageBubble({
  message,
  isMe,
  isInviteRespondable,
  onRespondToInvite,
  collabStepsRoute,
  onReply,
  onReact,
  currentUserId,
  onScrollToMessage,
}: MessageBubbleProps) {
  const [fullscreenMedia, setFullscreenMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const isCollabAccepted = !!message.campaignId && !!message.content?.includes('Collaboration accepted!');
  const isCampaign = !!message.campaignId && !isCollabAccepted && !message.content?.startsWith('Application Proposal:');
  
  const hasAttachment = !!message.attachmentUrl;
  const isVoiceNote = message.attachmentType === 'audio' && hasAttachment;
  const isImage = message.attachmentType === 'image' && hasAttachment;
  const isVideo = message.attachmentType === 'video' && hasAttachment;

  const reactionsGrouped = useMemo(() => {
    if (!message.reactions) return [];
    const groups: { reaction: string; count: number }[] = [];
    for (const r of message.reactions) {
      if (!r.reaction) continue;
      const existing = groups.find((g) => g.reaction === r.reaction);
      if (existing) {
        existing.count++;
      } else {
        groups.push({ reaction: r.reaction, count: 1 });
      }
    }
    return groups;
  }, [message.reactions]);

  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([0, 10])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      if (e.translationX > 0) {
        translateX.value = Math.min(e.translationX, 70);
      } else {
        translateX.value = 0;
      }
    })
    .onEnd((e) => {
      if (translateX.value >= 50 && onReply) {
        scheduleOnRN(onReply, message);
      }
      translateX.value = withTiming(0, { duration: 150 });
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const replyIconStyle = useAnimatedStyle(() => {
    const opacity = translateX.value > 10 ? Math.min((translateX.value - 10) / 30, 1) : 0;
    const scale = translateX.value > 15 ? Math.min((translateX.value - 15) / 25, 1) : 0;
    return {
      opacity,
      transform: [{ scale }],
    };
  });

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
        <GestureDetector gesture={panGesture}>
          <View style={styles.bubbleWrapper}>
            {/* Sliding reply arrow background indicator */}
            <Animated.View style={[styles.replySwipeIconContainer, replyIconStyle, { left: isMe ? -32 : 8 }]}>
              <Icon name="reply" size={14} color={Colors.oxblood} />
            </Animated.View>

            <Animated.View style={[animatedStyle, { width: '100%', position: 'relative' }]}>
              {isCollabAccepted ? (
                <CollabAcceptedCard message={message} viewHref={collabStepsRoute(message.campaignId!)} />
              ) : isCampaign ? (
                <CampaignInviteCard
                  message={message}
                  isMe={isMe}
                  isRespondable={isInviteRespondable}
                  onRespond={onRespondToInvite}
                />
              ) : (
                <TouchableOpacity
                  onLongPress={() => setShowMenu(true)}
                  delayLongPress={300}
                  activeOpacity={0.95}
                  style={[
                    styles.bubble,
                    isMe ? styles.bubbleMe : styles.bubbleThem,
                    (isImage || isVideo) && styles.mediaBubble,
                  ]}
                >
                  {/* Parent Reply Context */}
                  {message.replyToId && (
                    <TouchableOpacity
                      onPress={() => onScrollToMessage?.(message.replyToId!)}
                      activeOpacity={0.8}
                      style={[styles.replyQuoteWrapContainer, isMe ? styles.replyQuoteWrapMe : styles.replyQuoteWrapThem]}
                    >
                      <View style={styles.replyQuoteTextWrap}>
                        <Text style={styles.replyQuoteSender}>{message.replyToSenderName || 'Original message'}</Text>
                        <Text numberOfLines={1} style={styles.replyQuoteContent}>
                          {message.replyToAttachmentType === 'audio'
                            ? '🎤 Voice note'
                            : message.replyToAttachmentType === 'image'
                            ? '📷 Photo'
                            : message.replyToAttachmentType === 'video'
                            ? '🎥 Video'
                            : message.replyToContent || 'Message'}
                        </Text>
                      </View>
                      {(message.replyToAttachmentType === 'image' || message.replyToAttachmentType === 'video') && message.replyToAttachmentUrl && (
                        <Image
                          source={{ uri: message.replyToAttachmentUrl }}
                          style={styles.replyQuoteThumbnail}
                          contentFit="cover"
                        />
                      )}
                    </TouchableOpacity>
                  )}

                  {isVoiceNote ? (
                    <VoiceMessageContent url={message.attachmentUrl!} durationSec={message.attachmentDurationSec ?? 0} isMe={isMe} />
                  ) : isImage ? (
                    <TouchableOpacity
                      onPress={() => setFullscreenMedia({ url: message.attachmentUrl!, type: 'image' })}
                      activeOpacity={0.95}
                    >
                      <Image source={{ uri: message.attachmentUrl || undefined }} style={styles.attachmentMedia} contentFit="cover" />
                    </TouchableOpacity>
                  ) : isVideo ? (
                    <TouchableOpacity
                      onPress={() => setFullscreenMedia({ url: message.attachmentUrl!, type: 'video' })}
                      activeOpacity={0.9}
                      style={styles.videoThumbnailContainer}
                    >
                      <Image source={{ uri: message.attachmentUrl || undefined }} style={styles.attachmentMedia} contentFit="cover" />
                      <View style={styles.playButtonOverlay}>
                        <Icon name="play" size={24} color="#ffffff" />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TextMessageContent content={message.content} isMe={isMe} />
                  )}
                  <Text style={[styles.msgTime, isMe && styles.msgTimeMe, (isImage || isVideo) && styles.msgTimeMedia]}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Active Reaction Badges */}
              {reactionsGrouped.length > 0 && (
                <View style={[styles.reactionsContainer, isMe ? styles.reactionsContainerMe : styles.reactionsContainerThem]}>
                  {reactionsGrouped.map((g, idx) => (
                    <View key={idx} style={styles.reactionBadge}>
                      <Text style={styles.reactionEmoji}>{g.reaction}</Text>
                      {g.count > 1 && <Text style={styles.reactionCount}>{g.count}</Text>}
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>
          </View>
        </GestureDetector>
      </View>

      {/* Modals for Reactions Menu and Fullscreen Preview */}
      {showMenu && (
        <ActionMenuModal
          visible={showMenu}
          onClose={() => setShowMenu(false)}
          onSelectReaction={(emoji) => onReact?.(message.id, emoji)}
          onSelectReply={() => onReply?.(message)}
        />
      )}

      {fullscreenMedia && (
        <FullscreenMediaModal
          visible={!!fullscreenMedia}
          url={fullscreenMedia.url}
          type={fullscreenMedia.type}
          onClose={() => setFullscreenMedia(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  msgRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-end', gap: 8 },
  msgRowMe: { justifyContent: 'flex-end' },
  bubbleAvatarWrap: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden' },
  bubbleAvatar: { width: 32, height: 32 },
  bubbleContentContainer: { maxWidth: '75%', flexDirection: 'column' },
  bubbleContentContainerMe: { alignItems: 'flex-end' },
  bubbleContentContainerThem: { alignItems: 'flex-start' },

  bubbleWrapper: { position: 'relative', paddingBottom: 4 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, position: 'relative' },
  bubbleMe: {
    backgroundColor: Colors.oxblood,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
    shadowColor: Colors.oxblood,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1.5,
  },
  bubbleThem: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
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

  // Media bubble layout
  mediaBubble: { paddingHorizontal: 0, paddingVertical: 0, overflow: 'hidden', borderRadius: 16, width: 220, height: 220 },
  attachmentMedia: { width: 220, height: 220 },
  videoThumbnailContainer: { position: 'relative', width: 220, height: 220 },
  playButtonOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgTimeMedia: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    color: '#ffffff',
    fontSize: 9,
    marginTop: 0,
  },

  // Reply style context
  replyQuoteWrapContainer: {
    borderRadius: 8,
    padding: 6,
    borderLeftWidth: 3,
    borderLeftColor: Colors.rose,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    maxWidth: '100%',
  },
  replyQuoteTextWrap: {
    flexShrink: 1,
    paddingRight: 4,
  },
  replyQuoteThumbnail: {
    width: 30,
    height: 30,
    borderRadius: 4,
    marginLeft: 6,
  },
  replyQuoteWrapMe: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  replyQuoteWrapThem: {
    backgroundColor: 'rgba(63,3,11,0.03)',
  },
  replyQuoteSender: {
    fontSize: 11,
    fontFamily: FontFamily.sans,
    color: Colors.rose,
  },
  replyQuoteContent: {
    fontSize: 11,
    fontFamily: FontFamily.sansMedium,
    color: 'rgba(63,3,11,0.5)',
    marginTop: 2,
  },

  // Reaction badge styles
  reactionsContainer: {
    position: 'absolute',
    bottom: -6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    ...Shadow.card,
    zIndex: 10,
  },
  reactionsContainerMe: { right: 8 },
  reactionsContainerThem: { left: 8 },
  reactionBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  reactionEmoji: { fontSize: 11 },
  reactionCount: { fontSize: 9, color: 'rgba(63,3,11,0.6)', fontFamily: FontFamily.sans },

  // Fullscreen Preview Modal Styles
  fullscreenContainer: { flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  fullscreenCloseBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  fullscreenImage: { width: '100%', height: '80%' },
  fullscreenVideo: { width: '100%', height: '80%' },

  // Swipe Reply Reveal Indicator Style
  replySwipeIconContainer: {
    position: 'absolute',
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(63,3,11,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  // Reaction menu backdrop
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  menuCard: { width: 280, backgroundColor: '#ffffff', borderRadius: 16, padding: 16, ...Shadow.card },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  emojiBtn: { padding: 6 },
  emojiText: { fontSize: 24 },
  menuActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderTopWidth: 0.5, borderTopColor: 'rgba(63,3,11,0.08)' },
  menuActionText: { fontSize: 14, fontFamily: FontFamily.sansMedium, color: Colors.ink },
});
