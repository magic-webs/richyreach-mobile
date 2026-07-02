import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import type { ChatRoomSummary } from '@/types/chat';

interface ChatRoomListItemProps {
  room: ChatRoomSummary;
  currentUserId: string | undefined;
  titleName: string;
  subtitleWhenNoMessages?: string;
  imageUrl: string | null;
  onPress: () => void;
}

export function ChatRoomListItem({ room, currentUserId, titleName, subtitleWhenNoMessages, imageUrl, onPress }: ChatRoomListItemProps) {
  const isOnline = room.online ?? false;

  let timeStr = '';
  const displayTime = room.lastMessageCreatedAt || room.createdAt;
  if (displayTime) {
    const d = new Date(displayTime);
    const today = new Date();
    timeStr = d.toDateString() === today.toDateString()
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.chatRow}>
      <View style={styles.avatarWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatarImage} contentFit="cover" />
        ) : (
          <PlaceholderImage tone="rose" height={52} width={52} borderRadius={99} />
        )}
        {isOnline && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatTopRow}>
          <Text style={styles.chatName} numberOfLines={1}>{titleName}</Text>
          {timeStr ? <Text style={[styles.chatTime, room.unreadCount > 0 && styles.chatTimeUnread]}>{timeStr}</Text> : null}
        </View>
        <View style={styles.chatBottomRow}>
          <Text style={[styles.chatLast, room.unreadCount > 0 && styles.chatLastUnread]} numberOfLines={1}>
            {room.lastMessage
              ? (room.lastMessageSenderId === currentUserId ? `You: ${room.lastMessage}` : room.lastMessage)
              : (subtitleWhenNoMessages || 'No messages yet')}
          </Text>
          {room.unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{room.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chatRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 14, paddingVertical: 14, borderRadius: 16, backgroundColor: '#fff', ...Shadow.card },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatarImage: { width: 52, height: 52, borderRadius: 26 },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 14, height: 14, borderRadius: 99, backgroundColor: '#3ec97a', borderWidth: 2.5, borderColor: '#fff' },
  chatInfo: { flex: 1, minWidth: 0 },
  chatTopRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chatName: { fontWeight: '700', fontSize: 15.5, color: Colors.ink, flex: 1, minWidth: 0 },
  chatTime: { fontSize: 11, color: 'rgba(63,3,11,0.4)', fontWeight: '600', flexShrink: 0 },
  chatBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  chatLast: { flex: 1, fontSize: 13, color: 'rgba(63,3,11,0.45)', fontWeight: '400' },
  chatLastUnread: { color: Colors.ink, fontWeight: '600' },
  chatTimeUnread: { color: Colors.rose, fontWeight: '700' },
  unreadBadge: {
    backgroundColor: Colors.rose,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    flexShrink: 0,
  },
  unreadBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', fontFamily: FontFamily.sans },
});
