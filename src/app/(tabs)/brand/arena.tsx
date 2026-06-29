import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useProfilesStore } from '@/store/profiles';
import { CreateArenaSheet } from '@/components/brand/home/CreateArenaSheet';

const ARENA_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  reel_reach: { label: 'Reel Reach', icon: 'reel', color: '#b46a74', bg: 'rgba(180,106,116,0.12)' },
  google_review: { label: 'Google Review', icon: 'star', color: '#2a7a5a', bg: 'rgba(42,122,90,0.1)' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  draft: { label: 'Draft', color: '#888', dot: '#aaa' },
  active: { label: 'Active', color: '#2a7a5a', dot: '#2a7a5a' },
  paused: { label: 'Paused', color: '#c07000', dot: '#f3c969' },
  completed: { label: 'Completed', color: '#5a1018', dot: '#b46a74' },
  cancelled: { label: 'Cancelled', color: '#999', dot: '#ccc' },
};

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <View style={{ position: 'absolute', top: 12, right: 12 }}>
        <Icon name={icon} size={13} color="rgba(232, 216, 204, 0.4)" />
      </View>
    </View>
  );
}

function ArenaCard({ arena, onManage }: { arena: any; onManage: () => void }) {
  const typeConf = ARENA_TYPE_CONFIG[arena.arenaType] || ARENA_TYPE_CONFIG.reel_reach;
  const statusConf = STATUS_CONFIG[arena.status] || STATUS_CONFIG.draft;
  const budgetRupees = (arena.totalBudgetCoins / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  const daysLeft = Math.max(0, Math.ceil((new Date(arena.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <View style={styles.arenaCard}>
      {/* Card Header */}
      <View style={styles.arenaCardHeader}>
        {/* Banner thumbnail */}
        <View style={[styles.arenaThumbnail, { backgroundColor: typeConf.bg, alignItems: 'center', justifyContent: 'center' }]}>
          {arena.bannerUrl ? (
            <Image source={{ uri: arena.bannerUrl }} style={{ width: '100%', height: '100%', borderRadius: 12 }} contentFit="cover" />
          ) : (
            <Icon name={typeConf.icon} size={22} color={typeConf.color} />
          )}
        </View>
 
         <View style={styles.arenaMeta}>
           {/* Type badge */}
           <View style={[styles.typeBadge, { backgroundColor: typeConf.bg, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
             <Icon name={typeConf.icon} size={10} color={typeConf.color} />
             <Text style={[styles.typeBadgeText, { color: typeConf.color }]}>{typeConf.label}</Text>
           </View>
           <Text style={styles.arenaTitle} numberOfLines={2}>{arena.title}</Text>
           <Text style={styles.arenaStats}>
             {arena.participantCount || 0}/{arena.maxParticipants} participants · {daysLeft}d left
           </Text>
         </View>

        {/* Status */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusConf.dot }]} />
          <Text style={[styles.statusText, { color: statusConf.color }]}>{statusConf.label}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Footer */}
      <View style={styles.arenaCardFooter}>
        <View style={styles.prizeInfo}>
          <Text style={styles.prizeCoinLabel}>Prize Pool</Text>
          <Text style={styles.prizeCoin}>
            {arena.totalBudgetCoins.toLocaleString()} <Text style={styles.coinEmojiOverride}>🪙</Text>
          </Text>
          <Text style={styles.prizeRupee}>{budgetRupees}</Text>
        </View>

        <TouchableOpacity style={styles.manageBtn} activeOpacity={0.8} onPress={onManage}>
          <Text style={styles.manageBtnText}>Manage</Text>
          <Icon name="arrow" size={13} color={Colors.cream} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function BrandArenaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showModal = useUIStore((s) => s.showModal);
  const queryClient = useQueryClient();
  const { activeBrandProfileId } = useProfilesStore();

  const [isCreateArenaOpen, setIsCreateArenaOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const { data: arenas = [], isLoading, refetch } = useQuery({
    queryKey: ['brandArenas', activeBrandProfileId],
    queryFn: () => api.arena.mine(activeBrandProfileId),
    enabled: !!activeBrandProfileId,
  });

  const { data: walletData } = useQuery({
    queryKey: ['walletBalance', activeBrandProfileId],
    queryFn: () => api.brands.wallet.balance(activeBrandProfileId),
    enabled: !!activeBrandProfileId,
  });

  const filtered = typeFilter ? arenas.filter((a: any) => a.arenaType === typeFilter) : arenas;

  // Summary stats
  const totalBudget = arenas.reduce((sum: number, a: any) => sum + (a.totalBudgetCoins || 0), 0);
  const totalParticipants = arenas.reduce((sum: number, a: any) => sum + (a.participantCount || 0), 0);
  const activeCount = arenas.filter((a: any) => a.status === 'active').length;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Glow effects */}
      <View style={styles.glow1} pointerEvents="none" />
      <View style={styles.glow2} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Icon name="trophy" size={20} color={Colors.cream} />
          </View>
          <View>
            <Text style={styles.headerSubtitle}>CONTEST MANAGER</Text>
            <Text style={styles.headerTitle}>The Arena</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Wallet balance pill */}
          {walletData && (
            <View style={styles.walletPill}>
              <Text style={styles.walletPillText}>
                <Text style={styles.coinEmojiOverride}>🪙</Text> {((walletData as any).balance?.coins ?? 0).toLocaleString()}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.launchBtn}
            activeOpacity={0.8}
            onPress={() => setIsCreateArenaOpen(true)}
          >
            <Icon name="plus" size={14} color={Colors.oxblood} />
            <Text style={styles.launchBtnText}>Launch</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        style={styles.body}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={Colors.cream}
          />
        }
      >
        {/* Quick Stats Summary */}
        <View style={styles.statsRow}>
          <StatCard label="Total Budget" value={`₹${(totalBudget / 100).toLocaleString('en-IN')}`} icon="wallet" />
          <StatCard label="Participants" value={totalParticipants.toLocaleString()} icon="users" />
          <StatCard label="Active" value={String(activeCount)} icon="bolt" />
        </View>

        {/* Type Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {[null, 'reel_reach', 'google_review'].map((f) => {
            const isActive = typeFilter === f;
            const conf = f ? ARENA_TYPE_CONFIG[f] : null;
            return (
              <TouchableOpacity
                key={String(f)}
                style={[
                  styles.filterPill, 
                  isActive && styles.filterPillActive,
                  { flexDirection: 'row', alignItems: 'center', gap: 6 }
                ]}
                onPress={() => setTypeFilter(f)}
                activeOpacity={0.8}
              >
                {conf?.icon && (
                  <Icon 
                    name={conf.icon} 
                    size={12} 
                    color={isActive ? Colors.oxblood : 'rgba(232,216,204,0.7)'} 
                  />
                )}
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {f === null ? 'All Arenas' : conf?.label || f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Arenas List */}
        <Text style={styles.sectionTitle}>Your Arenas</Text>

        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Loading arenas...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={{ marginBottom: 10 }}>
              <Icon name="arena" size={44} color="rgba(232,216,204,0.2)" />
            </View>
            <Text style={styles.emptyStateText}>No arenas yet</Text>
            <Text style={styles.emptyStateSub}>
              Launch your first arena to start competitive influencer campaigns powered by coins.
            </Text>
            <TouchableOpacity
              style={styles.emptyLaunchBtn}
              onPress={() => setIsCreateArenaOpen(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyLaunchBtnText}>+ Create First Arena</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.arenaList}>
            {filtered.map((arena: any) => (
              <ArenaCard
                key={arena.id}
                arena={arena}
                onManage={() => router.push({ pathname: '/brand/arena/[id]', params: { id: arena.id } } as any)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Arena Sheet */}
      <CreateArenaSheet
        isOpen={isCreateArenaOpen}
        onClose={() => setIsCreateArenaOpen(false)}
        onSuccess={() => {
          setIsCreateArenaOpen(false);
          queryClient.invalidateQueries({ queryKey: ['brandArenas'] });
          queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.oxbloodDeep,
  },
  glow1: {
    position: 'absolute',
    top: 20,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(180, 106, 116, 0.2)',
  },
  glow2: {
    position: 'absolute',
    bottom: 100,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(141, 71, 80, 0.15)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(232, 216, 204, 0.1)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.roseDeep,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.button,
    shadowColor: Colors.roseDeep,
    shadowOpacity: 0.25,
  },
  headerSubtitle: {
    fontFamily: FontFamily.sans,
    fontSize: 9.5,
    color: Colors.roseSoft,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    color: Colors.cream,
    fontWeight: '700',
    marginTop: -2,
  },
  walletPill: {
    backgroundColor: 'rgba(232,216,204,0.12)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.2)',
  },
  walletPillText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Colors.cream,
    fontWeight: '700',
  },
  launchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.cream,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  launchBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  body: { paddingHorizontal: 20, paddingTop: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(232, 216, 204, 0.07)',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(232, 216, 204, 0.15)',
  },
  statLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9.5,
    color: 'rgba(232, 216, 204, 0.5)',
    letterSpacing: 0.3,
    paddingRight: 16,
  },
  statValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    color: Colors.cream,
    fontWeight: '700',
    marginTop: 4,
  },
  filterRow: { gap: 8, paddingRight: 4, marginBottom: 20 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(232,216,204,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.2)',
  },
  filterPillActive: {
    backgroundColor: Colors.cream,
    borderColor: Colors.cream,
  },
  filterPillText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: 'rgba(232,216,204,0.7)',
  },
  filterPillTextActive: {
    color: Colors.oxblood,
    fontWeight: '700',
  },
  sectionTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    color: Colors.cream,
    fontWeight: '700',
    marginBottom: 14,
  },
  arenaList: { gap: 14 },
  arenaCard: {
    backgroundColor: 'rgba(232, 216, 204, 0.07)',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(232, 216, 204, 0.15)',
  },
  arenaCardHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  arenaThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  arenaMeta: { flex: 1, gap: 4 },
  typeBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    fontWeight: '700',
  },
  arenaTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    color: Colors.cream,
    fontWeight: '700',
    lineHeight: 20,
  },
  arenaStats: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: 'rgba(232,216,204,0.5)',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontFamily: FontFamily.sansMedium, fontSize: 10.5, fontWeight: '700' },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(232, 216, 204, 0.15)',
    marginVertical: 12,
  },
  arenaCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prizeInfo: { gap: 2 },
  prizeCoinLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10,
    color: 'rgba(232,216,204,0.45)',
  },
  prizeCoin: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.gold,
  },
  prizeRupee: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(243,201,105,0.6)',
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.oxblood2,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(232, 216, 204, 0.15)',
  },
  manageBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.cream,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyStateText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 17,
    color: Colors.cream,
    fontWeight: '700',
  },
  emptyStateSub: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(232,216,204,0.5)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  emptyLaunchBtn: {
    marginTop: 16,
    backgroundColor: Colors.cream,
    borderRadius: Radius.full,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyLaunchBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  coinEmojiOverride: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
  },
});
