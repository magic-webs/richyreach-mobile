import { useEffect, useRef } from 'react';
import { ActivityIndicator, FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text } from 'react-native';
import { Colors, FontFamily } from '@/constants/brand';
import type { DisplayChatMessage } from '@/types/chat';
import { MessageBubble } from './MessageBubble';

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
}: MessageListProps) {
  const listRef = useRef<FlatList<DisplayChatMessage>>(null);
  const hasDoneInitialScrollRef = useRef(false);
  const isNearBottomRef = useRef(true);
  const lastMessageIdRef = useRef<string | null>(null);

  // Distinguishes a new-message *append* (scroll-worthy) from an older-page *prepend*
  // (must never scroll) by checking whether the LAST element changed, not just the length.
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    const isAppend = lastMessageIdRef.current !== null && lastMessageIdRef.current !== lastMessage.id;
    lastMessageIdRef.current = lastMessage.id;
    if (!isAppend) return;

    const isSelfSent = lastMessage.senderId === currentUserId;
    if (isSelfSent || isNearBottomRef.current) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages, currentUserId]);

  const handleContentSizeChange = () => {
    if (!hasDoneInitialScrollRef.current && messages.length > 0) {
      hasDoneInitialScrollRef.current = true;
      lastMessageIdRef.current = messages[messages.length - 1].id;
      listRef.current?.scrollToEnd({ animated: false });
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    isNearBottomRef.current = distanceFromBottom < NEAR_BOTTOM_THRESHOLD_PX;
  };

  const lastMessage = messages[messages.length - 1];
  const showSeenIndicator = !!lastMessage && lastMessage.senderId === currentUserId && !!lastMessage.readAt;

  return (
    <FlatList
      ref={listRef}
      data={messages}
      inverted={false}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MessageBubble
          message={item}
          isMe={item.senderId === currentUserId}
          isInviteRespondable={isInviteRespondable}
          onRespondToInvite={onRespondToInvite}
          collabStepsRoute={collabStepsRoute}
        />
      )}
      onStartReached={() => {
        if (hasMoreOlder && !isLoadingOlder) onLoadOlder();
      }}
      onStartReachedThreshold={0.5}
      maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
      ListHeaderComponent={isLoadingOlder ? <ActivityIndicator style={styles.olderLoader} color={Colors.rose} /> : null}
      onContentSizeChange={handleContentSizeChange}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      contentContainerStyle={styles.messageList}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={
        showSeenIndicator ? (
          <Text style={styles.seenText}>
            Seen {new Date(lastMessage.readAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  messageList: { paddingHorizontal: 16, paddingVertical: 12 },
  olderLoader: { paddingVertical: 12 },
  seenText: {
    fontSize: 11,
    color: 'rgba(63,3,11,0.4)',
    fontFamily: FontFamily.sansRegular,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 4,
  },
});
