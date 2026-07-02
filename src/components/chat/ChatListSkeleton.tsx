import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { Shadow } from '@/constants/brand';

export function ChatListSkeleton() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      {[1, 2, 3, 4].map((key) => (
        <View key={key} style={styles.chatRow}>
          <View style={styles.avatarWrap}>
            <Skeleton width={52} height={52} borderRadius={26} variant="circle" />
          </View>
          <View style={styles.chatInfo}>
            <View style={styles.chatTopRow}>
              <Skeleton width="45%" height={16} borderRadius={4} />
              <View style={{ flex: 1 }} />
              <Skeleton width={45} height={12} borderRadius={4} />
            </View>
            <View style={styles.chatBottomRow}>
              <Skeleton width="70%" height={13} borderRadius={4} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chatRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 14, paddingVertical: 14, borderRadius: 16, backgroundColor: '#fff', ...Shadow.card },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  chatInfo: { flex: 1, minWidth: 0, gap: 8 },
  chatTopRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chatBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
