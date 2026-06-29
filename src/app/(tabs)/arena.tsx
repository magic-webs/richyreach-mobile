import { Chip } from '@/components/ui/chip';
import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '@/store/ui';
import { useProfilesStore } from '@/store/profiles';

const ARENA_FILTER_TABS = [
  { key: null, label: 'All', icon: null },
  { key: 'reel_reach', label: 'Reel Reach', icon: 'reel' },
  { key: 'google_review', label: 'Google Review', icon: 'star' },
];

const TYPE_CONFIG: Record<string, { label: string; icon: string; bg: string; color: string }> = {
  reel_reach: { label: 'Reel Reach', icon: 'reel', bg: 'rgba(180,106,116,0.15)', color: '#b46a74' },
  google_review: { label: 'Google Review', icon: 'star', bg: 'rgba(42,122,90,0.12)', color: '#2a7a5a' },
};

function ArenaCard({
  arena,
  isJoined,
  onPress,
}: {
  arena: any;
  isJoined: boolean;
  onPress: () => void;
}) {
  const typeConf = TYPE_CONFIG[arena.arenaType] || TYPE_CONFIG.reel_reach;
  const daysLeft = arena.endDate
    ? Math.max(0, Math.ceil((new Date(arena.endDate).getTime() - Date.now()) / 864e5))
    : 0;
  const fillPct = Math.min(
    1,
    (arena.participantCount || 0) / (arena.maxParticipants || 1)
  );

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.arenaCard,
        isJoined && { borderColor: 'rgba(95,211,155,0.25)', backgroundColor: 'rgba(95,211,155,0.03)' }
      ]}
    >
      {/* Top strip */}
      <View style={styles.cardHeader}>
        <View style={[styles.typeBadge, { backgroundColor: typeConf.bg, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
          <Icon name={typeConf.icon} size={10} color={typeConf.color} />
          <Text style={[styles.typeBadgeText, { color: typeConf.color }]}>
            {typeConf.label}
          </Text>
        </View>
        <View style={styles.daysChip}>
          <View style={[styles.liveDot, { backgroundColor: daysLeft > 3 ? '#2a7a5a' : '#ff6b6b' }]} />
          <Text style={styles.daysText}>{daysLeft}d left</Text>
        </View>
      </View>

      <Text style={styles.arenaTitle} numberOfLines={2}>{arena.title}</Text>

      {/* Brand info */}
      <Text style={styles.brandInfo} numberOfLines={1}>
        by {arena.brandName || 'Brand'}  ·  {arena.category || 'General'}
      </Text>

      {/* Participants bar */}
      <View style={styles.barRow}>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${Math.round(fillPct * 100)}%` as any }]} />
        </View>
        <Text style={styles.barLabel}>
          {arena.participantCount}/{arena.maxParticipants} joined
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.prizeSmallLabel}>Prize Pool</Text>
          <Text style={styles.prizeCoins}>
            {(arena.totalBudgetCoins || 0).toLocaleString()} <Text style={styles.coinEmojiOverride}>🪙</Text>
          </Text>
          <Text style={styles.prizeRupee}>
            = ₹{((arena.totalBudgetCoins || 0) / 100).toLocaleString('en-IN')}
          </Text>
        </View>

        <View style={styles.entryBlock}>
          <Text style={styles.entryLabel}>Entry</Text>
          <Text style={styles.entryCoins}>
            {(arena.entryFeeCoins || 2000).toLocaleString()} <Text style={styles.coinEmojiOverride}>🪙</Text>
          </Text>
          {isJoined ? (
            <View style={styles.joinedBadge}>
              <Icon name="check" size={11} color="#fff" />
              <Text style={styles.joinedBadgeText}>Joined</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.joinBtn, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}
              activeOpacity={0.85}
              onPress={onPress}
            >
              <Text style={styles.joinBtnText}>Join</Text>
              <Icon name="arrow" size={10} color={Colors.cream} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ArenaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showModal = useUIStore((s) => s.showModal);
  const queryClient = useQueryClient();
  const { activeInfluencerProfileId } = useProfilesStore();

  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  // Public arenas list
  const { data: arenas = [], isLoading, refetch } = useQuery({
    queryKey: ['activeArenas', typeFilter],
    queryFn: () => api.arena.list(typeFilter || undefined),
  });

  // My participations
  const { data: participations = [] } = useQuery({
    queryKey: ['myParticipations', activeInfluencerProfileId],
    queryFn: () => api.arena.myParticipations(activeInfluencerProfileId),
    enabled: !!activeInfluencerProfileId,
  });

  // Wallet balance
  const { data: walletData } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: () => api.wallet.balance(),
  });

  // Join mutation
  const joinMutation = useMutation({
    mutationFn: (arenaId: string) => api.arena.join(arenaId, activeInfluencerProfileId),
    onSuccess: (newParticipant, arenaId) => {
      // Optimistically update the participations cache to instantly reflect the joined status
      queryClient.setQueryData<any[]>(['myParticipations', activeInfluencerProfileId], (old = []) => {
        if (old.some((p: any) => p.arenaId === arenaId)) return old;
        const targetArena = arenas.find((a: any) => a.id === arenaId);
        return [
          {
            ...newParticipant,
            arenaTitle: targetArena?.title,
            arenaType: targetArena?.arenaType,
            arenaStatus: targetArena?.status,
            arenaBannerUrl: targetArena?.bannerUrl,
            entryFeeCoins: targetArena?.entryFeeCoins,
          },
          ...old,
        ];
      });

      queryClient.invalidateQueries({ queryKey: ['activeArenas'] });
      queryClient.invalidateQueries({ queryKey: ['myParticipations'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      
      const targetArena = arenas.find((a: any) => a.id === arenaId);
      const isGoogleReview = targetArena?.arenaType === 'google_review';
      showModal({
        title: 'Joined!',
        message: isGoogleReview
          ? 'Successfully joined! Submit your Google Review proof to earn coins.'
          : `${(targetArena?.entryFeeCoins || 2000).toLocaleString()} coins deducted. Upload your submission to compete for the prize!`,
      });
    },
    onError: (err: any) =>
      showModal({ title: 'Join Failed', message: err.message }),
  });

  const joinedArenaIds = new Set(participations.map((p: any) => p.arenaId));

  // Stats from participations
  const totalCoinsWon = participations.reduce(
    (s: number, p: any) => s + (p.coinsAwarded || 0),
    0
  );
  const activeParticipations = participations.filter(
    (p: any) => p.arenaStatus === 'active'
  ).length;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Glows */}
      <View style={styles.glow1} pointerEvents="none" />
      <View style={styles.glow2} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <GradientView variant="rose" style={styles.headerIcon}>
            <Icon name="trophy" size={20} color={Colors.cream} />
          </GradientView>
          <View>
            <Text style={styles.headerSub}>COMPETE & WIN</Text>
            <Text style={styles.headerTitle}>The Arena</Text>
          </View>
        </View>

        {/* Coin balance pill */}
        <View style={styles.walletPill}>
          <Text style={styles.walletPillText}>
            <Text style={styles.coinEmojiOverride}>🪙</Text> {(walletData?.coinBalance || 0).toLocaleString()}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              refetch();
              queryClient.invalidateQueries({ queryKey: ['myParticipations'] });
            }}
            tintColor={Colors.cream}
          />
        }
      >
        {/* Your stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name="wallet" size={16} color={Colors.gold} />
            <Text style={styles.statValue}>
              {totalCoinsWon.toLocaleString()} 🪙
            </Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="arena" size={16} color={Colors.roseSoft} />
            <Text style={styles.statValue}>{participations.length}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="bolt" size={16} color="#5fd39b" />
            <Text style={styles.statValue}>{activeParticipations}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        {/* My active participations (quick access) */}
        {participations.filter((p: any) => p.arenaStatus === 'active').length > 0 && (
          <View style={styles.myArenasSection}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Icon name="pin" size={13} color={Colors.cream} />
              <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>My Active Arenas</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.myArenasRow}
            >
              {participations
                .filter((p: any) => p.arenaStatus === 'active')
                .map((p: any) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.myArenaChip}
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push({
                        pathname: '/arena/[id]',
                        params: { id: p.arenaId },
                      } as any)
                    }
                  >
                    <View
                      style={[
                        styles.verificationDot,
                        {
                          backgroundColor:
                            p.verificationStatus === 'approved'
                              ? '#2a7a5a'
                              : p.verificationStatus === 'rejected'
                              ? '#b46a74'
                              : '#f3c969',
                        },
                      ]}
                    />
                    <Text style={styles.myArenaChipText} numberOfLines={1}>
                      {p.arenaTitle}
                    </Text>
                    <Icon
                      name={
                        p.verificationStatus === 'approved'
                          ? 'check'
                          : p.verificationStatus === 'rejected'
                          ? 'x'
                          : 'clock'
                      }
                      size={12}
                      color={
                        p.verificationStatus === 'approved'
                          ? '#2a7a5a'
                          : p.verificationStatus === 'rejected'
                          ? '#b46a74'
                          : '#f3c969'
                      }
                    />
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}

        {/* Filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={{ marginTop: 4 }}
        >
          {ARENA_FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={String(tab.key)}
              style={[
                styles.filterTab,
                typeFilter === tab.key && styles.filterTabActive,
                { flexDirection: 'row', alignItems: 'center', gap: 6 }
              ]}
              onPress={() => setTypeFilter(tab.key)}
              activeOpacity={0.8}
            >
              {tab.icon && (
                <Icon
                  name={tab.icon}
                  size={12}
                  color={typeFilter === tab.key ? Colors.oxblood : 'rgba(232,216,204,0.65)'}
                />
              )}
              <Text
                style={[
                  styles.filterTabText,
                  typeFilter === tab.key && styles.filterTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Arenas list */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionLabel}>Live Arenas</Text>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveCount}>{arenas.length} open</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Loading arenas...</Text>
            </View>
          ) : arenas.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="arena" size={40} color="rgba(232,216,204,0.2)" />
              <Text style={styles.emptyText}>No arenas right now</Text>
              <Text style={styles.emptySubText}>
                Check back soon — brands are launching new arenas every day.
              </Text>
            </View>
          ) : (
            <View style={styles.arenaList}>
              {arenas.map((arena: any) => (
                <ArenaCard
                  key={arena.id}
                  arena={arena}
                  isJoined={joinedArenaIds.has(arena.id)}
                  onPress={() =>
                    router.push({
                      pathname: '/arena/[id]',
                      params: { id: arena.id },
                    } as any)
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.oxbloodDeep },
  glow1: {
    position: 'absolute',
    top: 30,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(180,106,116,0.25)',
  },
  glow2: {
    position: 'absolute',
    bottom: 100,
    left: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(141,71,80,0.18)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(232,216,204,0.1)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.button,
    shadowColor: Colors.roseDeep,
  },
  headerSub: {
    fontFamily: FontFamily.sans,
    fontSize: 9.5,
    color: 'rgba(232,216,204,0.5)',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.cream,
    marginTop: -2,
  },
  walletPill: {
    backgroundColor: 'rgba(243,201,105,0.15)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(243,201,105,0.3)',
  },
  walletPillText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 16,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(232,216,204,0.07)',
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.12)',
  },
  statValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.cream,
    marginTop: 4,
  },
  statLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10,
    color: 'rgba(232,216,204,0.45)',
  },
  myArenasSection: { paddingHorizontal: 18, marginTop: 16 },
  sectionLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.cream,
    marginBottom: 10,
  },
  myArenasRow: { gap: 8, paddingRight: 4 },
  myArenaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(232,216,204,0.1)',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.18)',
    maxWidth: 180,
  },
  verificationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  myArenaChipText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.cream,
    flex: 1,
  },
  myArenaStatus: { fontSize: 13 },
  filterRow: { gap: 8, paddingHorizontal: 18, paddingVertical: 16 },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(232,216,204,0.07)',
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.15)',
  },
  filterTabActive: {
    backgroundColor: Colors.cream,
    borderColor: Colors.cream,
  },
  filterTabText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: 'rgba(232,216,204,0.65)',
  },
  filterTabTextActive: {
    color: Colors.oxblood,
    fontWeight: '700',
  },
  listSection: { paddingHorizontal: 18 },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(95,211,155,0.1)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5fd39b' },
  liveCount: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: '#5fd39b',
    fontWeight: '700',
  },
  arenaList: { gap: 14 },
  arenaCard: {
    backgroundColor: 'rgba(232,216,204,0.07)',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.14)',
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    fontWeight: '700',
  },
  daysChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(232,216,204,0.06)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  daysText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10.5,
    color: Colors.cream,
    fontWeight: '700',
  },
  arenaTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.cream,
    lineHeight: 22,
  },
  brandInfo: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: 'rgba(232,216,204,0.45)',
    marginTop: -4,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  barBg: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(232,216,204,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.rose,
    borderRadius: 3,
  },
  barLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10,
    color: 'rgba(232,216,204,0.4)',
    minWidth: 70,
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(232,216,204,0.08)',
  },
  prizeSmallLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 9.5,
    color: 'rgba(232,216,204,0.4)',
  },
  prizeCoins: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '800',
    color: Colors.gold,
    marginTop: 2,
  },
  prizeRupee: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10.5,
    color: 'rgba(243,201,105,0.5)',
  },
  entryBlock: { alignItems: 'flex-end', gap: 4 },
  entryLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 9.5,
    color: 'rgba(232,216,204,0.4)',
  },
  entryCoins: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.cream,
  },
  joinBtn: {
    backgroundColor: Colors.rose,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 4,
  },
  joinBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    fontWeight: '800',
    color: Colors.cream,
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(42,122,90,0.25)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 4,
  },
  joinedBadgeText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    fontWeight: '700',
    color: '#5fd39b',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 6,
  },
  emptyText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.cream,
  },
  emptySubText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(232,216,204,0.45)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  coinEmojiOverride: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
  },
});
