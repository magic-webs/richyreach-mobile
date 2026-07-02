import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, Location01Icon, ExternalLinkIcon } from '@hugeicons/core-free-icons';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { Icon } from '@/components/ui/icon';
import { useProfilesStore } from '@/store/profiles';


const ARENA_TYPE_LABELS: Record<string, string> = {
  reel_reach: 'Reel Reach',
  google_review: 'Google Review',
};

const STATUS_COLORS: Record<string, string> = {
  active: Colors.green,
  paused: '#c07000',
  completed: Colors.rose,
  cancelled: '#888',
  draft: '#888',
};

function LeaderboardRow({ rank, participant }: { rank: number; participant: any }) {
  const isTop3 = rank <= 3;
  const rankColors = ['#f3c969', '#d1d1d6', '#c08a3e'];

  return (
    <View style={styles.lbRow}>
      <View style={styles.lbRank}>
        {isTop3 ? (
          <View style={{
            backgroundColor: rankColors[rank - 1],
            width: 22,
            height: 22,
            borderRadius: 11,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: rankColors[rank - 1],
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
          }}>
            <Text style={{
              fontFamily: FontFamily.sansMedium,
              fontSize: 11.5,
              fontWeight: '700',
              color: Colors.oxblood,
            }}>{rank}</Text>
          </View>
        ) : (
          <Text style={styles.lbRankText}>#{rank}</Text>
        )}
      </View>
      <View style={styles.lbAvatar}>
        <Image
          source={{ uri: participant.avatar || 'https://pub-c7a89526fe7541b0a1d6bc2d831710d2.r2.dev/plaform-images/avatar.png' }}
          style={{ width: '100%', height: '100%', borderRadius: 18 }}
          contentFit="cover"
        />
      </View>
      <View style={styles.lbInfo}>
        <Text style={styles.lbName}>{participant.name || 'Influencer'}</Text>
        <Text style={styles.lbHandle}>@{participant.instagramHandle || '—'}</Text>
      </View>
      <View style={styles.lbRight}>
        {participant.coinsAwarded > 0 && (
          <Text style={styles.lbCoins}>+{participant.coinsAwarded.toLocaleString()} <Text style={styles.coinEmojiOverride}>🪙</Text></Text>
        )}
      </View>
    </View>
  );
}

export default function BrandArenaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showModal = useUIStore((s) => s.showModal);
  const queryClient = useQueryClient();
  const { activeBrandProfileId } = useProfilesStore();

  const { data: arena, isLoading } = useQuery({
    queryKey: ['arena', id],
    queryFn: () => api.arena.get(id),
    enabled: !!id,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['arenaLeaderboard', id],
    queryFn: () => api.arena.leaderboard(id),
    enabled: !!id,
  });

  const pauseMutation = useMutation({
    mutationFn: () => api.arena.pause(id, activeBrandProfileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arena', id] });
      queryClient.invalidateQueries({ queryKey: ['brandArenas'] });
      showModal({ title: 'Arena Paused', message: 'The arena has been paused. Participants cannot join until resumed.' });
    },
    onError: (err: any) => showModal({ title: 'Error', message: err.message }),
  });

  const resumeMutation = useMutation({
    mutationFn: () => api.arena.resume(id, activeBrandProfileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arena', id] });
      queryClient.invalidateQueries({ queryKey: ['brandArenas'] });
      showModal({ title: 'Arena Resumed', message: 'The arena is active again.' });
    },
    onError: (err: any) => showModal({ title: 'Error', message: err.message }),
  });

  if (isLoading || !arena) {
    return (
      <View style={[styles.root, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.loadingText}>Loading arena...</Text>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[arena.status] || '#888';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)/brand/arena')} activeOpacity={0.7}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color={Colors.oxblood} strokeWidth={2} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{arena.title}</Text>
          <Text style={[styles.headerStatus, { color: statusColor }]}>
            ● {arena.status?.toUpperCase()}  ·  {ARENA_TYPE_LABELS[arena.arenaType] || arena.arenaType}
          </Text>
        </View>
        {/* Pause / Resume */}
        {arena.status === 'active' && (
          <TouchableOpacity
            style={[styles.actionBtn, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}
            onPress={() => pauseMutation.mutate()}
            activeOpacity={0.8}
          >
            <Icon name="pause" size={12} color={Colors.cream} />
            <Text style={styles.actionBtnText}>Pause</Text>
          </TouchableOpacity>
        )}
        {arena.status === 'paused' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.green, flexDirection: 'row', alignItems: 'center', gap: 4 }]}
            onPress={() => resumeMutation.mutate()}
            activeOpacity={0.8}
          >
            <Icon name="play" size={12} color="#fff" />
            <Text style={[styles.actionBtnText, { color: '#fff' }]}>Resume</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        style={styles.body}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Prize Pool</Text>
            <Text style={styles.statValue}>{arena.totalBudgetCoins.toLocaleString()} <Text style={styles.coinEmojiOverride}>🪙</Text></Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Participants</Text>
            <Text style={styles.statValue}>{arena.participantCount || 0}</Text>
            <Text style={styles.statSub}>/ {arena.maxParticipants} max</Text>
          </View>
        </View>

        {/* Google Review Info */}
        {arena.arenaType === 'google_review' && arena.businessName && (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <HugeiconsIcon icon={Location01Icon} size={16} color={Colors.oxblood} strokeWidth={2} />
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Business Info</Text>
            </View>
            <View style={styles.rewardCard}>
              <Text style={styles.businessName}>{arena.businessName}</Text>
              {arena.googleMapsLink && (
                <TouchableOpacity
                  style={styles.mapsLinkBtn}
                  onPress={() => Linking.openURL(arena.googleMapsLink).catch(() => { })}
                  activeOpacity={0.8}
                >
                  <HugeiconsIcon icon={Location01Icon} size={14} color={Colors.green} strokeWidth={2} />
                  <Text style={styles.mapsLinkText}>Open in Google Maps</Text>
                  <HugeiconsIcon icon={ExternalLinkIcon} size={13} color={Colors.green} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Leaderboard */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Icon name="trophy" size={16} color={Colors.oxblood} />
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Leaderboard</Text>
          </View>
          {leaderboard.length === 0 ? (
            <View style={styles.emptyLb}>
              <Text style={styles.emptyLbText}>No participants yet</Text>
            </View>
          ) : (
            <View style={styles.leaderboard}>
              {leaderboard.map((p: any, i: number) => (
                <LeaderboardRow key={p.id} rank={i + 1} participant={p} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  loadingText: { fontFamily: FontFamily.sansMedium, fontSize: 16, color: Colors.oxblood },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.08)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  headerStatus: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    marginTop: 1,
  },
  actionBtn: {
    backgroundColor: Colors.oxblood,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.cream,
    fontWeight: '700',
  },
  body: { paddingHorizontal: 18, paddingTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cream,
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.1)',
    gap: 2,
    ...Shadow.card,
  },
  statLabel: { fontFamily: FontFamily.sansRegular, fontSize: 9.5, color: 'rgba(63, 3, 11, 0.5)' },
  statValue: { fontFamily: FontFamily.sansMedium, fontSize: 17, fontWeight: '700', color: Colors.oxblood },
  statSub: { fontFamily: FontFamily.sansRegular, fontSize: 10, color: 'rgba(63, 3, 11, 0.4)' },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.oxblood,
    marginBottom: 10,
  },
  rewardCard: {
    backgroundColor: Colors.cream,
    borderRadius: Radius.lg,
    padding: 14,
    gap: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.1)',
    ...Shadow.card,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  rewardLabel: { fontFamily: FontFamily.sansRegular, fontSize: 12.5, color: 'rgba(63, 3, 11, 0.55)', flex: 1 },
  rewardValue: { fontFamily: FontFamily.sansMedium, fontSize: 13, fontWeight: '700', color: Colors.oxblood },
  businessName: { fontFamily: FontFamily.sansMedium, fontSize: 16, fontWeight: '700', color: Colors.oxbloodDeep },
  mapsLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(42,122,90,0.15)',
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  mapsLinkText: { fontFamily: FontFamily.sansMedium, fontSize: 12, color: Colors.green, fontWeight: '700' },
  guidelinesCard: {
    backgroundColor: Colors.cream,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.1)',
  },
  guidelinesText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(63, 3, 11, 0.75)',
    lineHeight: 20,
  },
  leaderboard: {
    backgroundColor: Colors.cream,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.1)',
    ...Shadow.card,
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.08)',
    gap: 10,
  },
  lbRank: { width: 28, alignItems: 'center' },
  lbRankText: { fontSize: 15, color: 'rgba(63, 3, 11, 0.5)' },
  lbAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  lbAvatarText: { fontFamily: FontFamily.sans, fontSize: 14, fontWeight: '800', color: Colors.oxblood },
  lbInfo: { flex: 1 },
  lbName: { fontFamily: FontFamily.sansMedium, fontSize: 13.5, color: Colors.oxblood },
  lbHandle: { fontFamily: FontFamily.sansRegular, fontSize: 11, color: 'rgba(63, 3, 11, 0.5)' },
  lbRight: { alignItems: 'flex-end', gap: 2 },
  lbStatus: { fontSize: 16 },
  lbCoins: { fontFamily: FontFamily.sansMedium, fontSize: 11, color: Colors.oxblood, fontWeight: '700' },
  emptyLb: {
    backgroundColor: Colors.cream,
    borderRadius: Radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.1)',
    ...Shadow.card,
  },
  emptyLbText: { fontFamily: FontFamily.sansRegular, fontSize: 14, color: 'rgba(63, 3, 11, 0.45)' },
  coinEmojiOverride: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
  },
});
