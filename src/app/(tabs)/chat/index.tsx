import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { useAuthStore } from '@/store/auth';
import { Colors, FontFamily } from '@/constants/brand';
import { useChatRooms } from '@/hooks/chat/useChatRooms';
import { ChatRoomListItem } from '@/components/chat/ChatRoomListItem';
import { ChatListSkeleton } from '@/components/chat/ChatListSkeleton';

export default function InfluencerChatListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthStore();
  const currentUserId = session?.user?.id;
  const { rooms, isLoading, isRefreshing, refresh } = useChatRooms();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={Colors.oxblood} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Brand Messages</Text>
        </View>
      </View>

      {isLoading ? (
        <ChatListSkeleton />
      ) : rooms.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No brand conversations yet.</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.roomId}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshing={isRefreshing}
          onRefresh={refresh}
          renderItem={({ item: room }) => (
            <ChatRoomListItem
              room={room}
              currentUserId={currentUserId}
              titleName={room.companyName || room.name || 'RichyReach Team'}
              imageUrl={room.logo || room.avatar || null}
              onPress={() => router.push({ pathname: '/chat/[id]', params: { id: room.roomId } })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'rgba(244,236,228,0.9)', borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.07)' },
  backBtn: { width: 38, height: 38, borderRadius: 99, backgroundColor: 'rgba(63,3,11,0.06)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FontFamily.sansMedium, fontSize: 24, fontWeight: '700', color: Colors.ink },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: 'rgba(63,3,11,0.5)', fontSize: 14 },
});
