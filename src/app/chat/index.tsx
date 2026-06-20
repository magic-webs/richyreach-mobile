import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthStore();

  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRooms = async () => {
    try {
      const data = await api.chat.rooms();
      setRooms(data);
    } catch (err) {
      console.error("Failed to load chat rooms", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRooms();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
            <Icon name="back" size={22} color={Colors.oxblood} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
      </View>

      {/* Rooms List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.rose} />
        </View>
      ) : rooms.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No chat conversations yet.</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.roomId}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          renderItem={({ item: c }) => {
            // Determine name and avatar based on properties present (dynamic role layout)
            const titleName = c.companyName || c.name || c.instagramHandle || "Support Team";
            const imageUrl = c.logo || c.avatar || null;
            const isOnline = c.online ?? false;
            
            // Format creation date
            let timeStr = "";
            if (c.createdAt) {
              const d = new Date(c.createdAt);
              timeStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }

            return (
              <TouchableOpacity
                onPress={() => router.push({
                  pathname: '/chat/[id]',
                  params: {
                    id: c.roomId,
                    name: titleName,
                    avatar: imageUrl || "",
                  }
                })}
                activeOpacity={0.8}
                style={styles.chatRow}
              >
                <View style={styles.avatarWrap}>
                  <PlaceholderImage tone="rose" height={52} width={52} borderRadius={99} />
                  {isOnline && <View style={styles.onlineDot} />}
                </View>
                <View style={styles.chatInfo}>
                  <View style={styles.chatTopRow}>
                    <Text style={styles.chatName} numberOfLines={1}>{titleName}</Text>
                    {timeStr ? <Text style={styles.chatTime}>{timeStr}</Text> : null}
                  </View>
                  <View style={styles.chatBottomRow}>
                    <Text style={styles.chatLast} numberOfLines={1}>
                      Click to open conversation
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'rgba(244,236,228,0.9)', borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.07)' },
  backBtn: { width: 38, height: 38, borderRadius: 99, backgroundColor: 'rgba(63,3,11,0.06)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FontFamily.serif, fontSize: 24, fontWeight: '700', color: Colors.ink },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: 'rgba(63,3,11,0.5)', fontSize: 14 },

  chatRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 14, paddingVertical: 14, borderRadius: 16, backgroundColor: '#fff', ...Shadow.card },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 14, height: 14, borderRadius: 99, backgroundColor: '#3ec97a', borderWidth: 2.5, borderColor: '#fff' },
  chatInfo: { flex: 1, minWidth: 0 },
  chatTopRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chatName: { fontWeight: '700', fontSize: 15.5, color: Colors.ink, flex: 1, minWidth: 0 },
  chatTime: { fontSize: 11, color: 'rgba(63,3,11,0.4)', fontWeight: '600', flexShrink: 0 },
  chatBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  chatLast: { flex: 1, fontSize: 13, color: 'rgba(63,3,11,0.45)', fontWeight: '400' },
});
