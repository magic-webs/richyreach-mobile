import { useEffect, useRef } from 'react';
import { ActivityIndicator, FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily } from '@/constants/brand';
import type { DisplayChatMessage, ChatMessage } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

const NEAR_BOTTOM_THRESHOLD_PX = 80;

interface MessageListProps {
  messages: DisplayChatMessage[];
  currentUserId: string | undefined;
  isLoadingOlder: boolean;
  hasMoreOlder: boolean;
  onLoadOlder: () => void;
  isInviteRespondable: boolean;
  onRespondToInvite: (inviteId: string, status: 'accepted' | 'declined') => void;
  collabStepsRoute: (campaignId: string) => { pathname: string; params: { id: string } };
  partnerIsTyping?: boolean;
  onReply?: (message: ChatMessage) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

export function MessageList({
  messages,
  currentUserId,
  isLoadingOlder,
  hasMoreOlder,
  onLoadOlder,
  isInviteRespondable,
  onRespondToInvite,
  collabStepsRoute,
  partnerIsTyping = false,
  onReply,
  onReact,
}: MessageListProps) {
  const listRef = useRef<FlatList<DisplayChatMessage>>(null);
  const isNearBottomRef = useRef(true);
  const lastMessageIdRef = useRef<string | null>(null);

  // Initialize lastMessageIdRef on first messages render
  useEffect(() => {
    if (messages.length > 0 && lastMessageIdRef.current === null) {
      lastMessageIdRef.current = messages[messages.length - 1].id;
    }
  }, [messages]);

  // Distinguishes a new-message *append* (scroll-worthy) from an older-page *prepend*
  // by checking whether the LAST element changed, not just the length.
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    const isAppend = lastMessageIdRef.current !== null && lastMessageIdRef.current !== lastMessage.id;
    lastMessageIdRef.current = lastMessage.id;
    if (!isAppend) return;

    const isSelfSent = lastMessage.senderId === currentUserId;
    if (isSelfSent || isNearBottomRef.current) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages, currentUserId]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = e.nativeEvent;
    isNearBottomRef.current = contentOffset.y < NEAR_BOTTOM_THRESHOLD_PX;
  };

  const lastMessage = messages[messages.length - 1];
  const showSeenIndicator = !!lastMessage && lastMessage.senderId === currentUserId && !!lastMessage.readAt;

  // Inverted FlatList requires reverse chronological order
  const reversedData = messages.slice().reverse();

  const scrollToMessage = (messageId: string) => {
    const index = reversedData.findIndex((m) => m.id === messageId);
    if (index !== -1) {
      try {
        listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      } catch (err) {
        console.warn('scrollToIndex failed', err);
      }
    }
  };

  return (
    <FlatList
      ref={listRef}
      data={reversedData}
      inverted={true}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MessageBubble
          message={item}
          isMe={item.senderId === currentUserId}
          isInviteRespondable={isInviteRespondable}
          onRespondToInvite={onRespondToInvite}
          collabStepsRoute={collabStepsRoute}
          onReply={onReply}
          onReact={onReact}
          currentUserId={currentUserId || ''}
          onScrollToMessage={scrollToMessage}
        />
      )}
      onScrollToIndexFailed={(info) => {
        const promise = new Promise((resolve) => setTimeout(resolve, 80));
        promise.then(() => {
          try {
            listRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.5 });
          } catch (e) {
            console.warn('Fallback scrollToIndex failed', e);
          }
        });
      }}
      onEndReached={() => {
        if (hasMoreOlder && !isLoadingOlder) onLoadOlder();
      }}
      onEndReachedThreshold={0.2}
      ListHeaderComponent={
        (partnerIsTyping || showSeenIndicator) ? (
          <View style={styles.bottomHeaderContainer}>
            {partnerIsTyping && <TypingIndicator />}
            {showSeenIndicator && (
              <Text style={styles.seenText}>
                Seen {new Date(lastMessage.readAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
        ) : null
      }
      ListFooterComponent={isLoadingOlder ? <ActivityIndicator style={styles.olderLoader} color={Colors.rose} /> : null}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      contentContainerStyle={styles.messageList}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  messageList: { paddingHorizontal: 16, paddingVertical: 12 },
  olderLoader: { paddingVertical: 12 },
  bottomHeaderContainer: {
    paddingVertical: 4,
  },
  seenText: {
    fontSize: 11,
    color: 'rgba(63,3,11,0.4)',
    fontFamily: FontFamily.sansRegular,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 4,
    marginBottom: 4,
  },
});

