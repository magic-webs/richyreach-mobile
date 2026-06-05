import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { chats } from '@/data/mock';
import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
        <View style={styles.editBtn}>
          <Icon name="edit" size={19} color={Colors.cream} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color={Colors.rose} />
          <Text style={styles.searchPlaceholder}>Search messages…</Text>
        </View>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: c }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: c.id } })}
            activeOpacity={0.8}
            style={styles.chatRow}
          >
            <View style={styles.avatarWrap}>
              <PlaceholderImage tone={c.tone} height={52} width={52} borderRadius={99} />
              {c.online && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.chatInfo}>
              <View style={styles.chatTopRow}>
                <Text style={styles.chatName} numberOfLines={1}>{c.name}</Text>
                {c.verified && <Icon name="verified" size={14} color={Colors.rose} />}
                <Text style={[styles.chatTime, c.unread > 0 && styles.chatTimeUnread]}>{c.time}</Text>
              </View>
              <View style={styles.chatBottomRow}>
                <Text style={[styles.chatLast, c.unread > 0 && styles.chatLastUnread]} numberOfLines={1}>{c.last}</Text>
                {c.unread > 0 && (
                  <GradientView variant="rose" style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{c.unread}</Text>
                  </GradientView>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'rgba(244,236,228,0.9)', borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.07)' },
  backBtn: { width: 38, height: 38, borderRadius: 99, backgroundColor: 'rgba(63,3,11,0.06)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FontFamily.serif, fontSize: 24, fontWeight: '700', color: Colors.ink },
  editBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.oxblood, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'rgba(244,236,228,0.9)' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, ...Shadow.card },
  searchPlaceholder: { fontSize: 14, color: 'rgba(63,3,11,0.4)' },

  chatRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 16 },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 14, height: 14, borderRadius: 99, backgroundColor: '#3ec97a', borderWidth: 2.5, borderColor: Colors.creamLite },
  chatInfo: { flex: 1, minWidth: 0 },
  chatTopRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chatName: { fontWeight: '700', fontSize: 15, color: Colors.ink, flex: 1, minWidth: 0 },
  chatTime: { fontSize: 11.5, color: 'rgba(63,3,11,0.4)', fontWeight: '600', flexShrink: 0 },
  chatTimeUnread: { color: Colors.rose },
  chatBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  chatLast: { flex: 1, fontSize: 13, color: 'rgba(63,3,11,0.5)', fontWeight: '400' },
  chatLastUnread: { color: 'rgba(42,2,7,0.85)', fontWeight: '600' },
  unreadBadge: { minWidth: 18, height: 18, borderRadius: 99, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, flexShrink: 0 },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
