import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Linking,
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

const ARENA_TYPE_LABELS: Record<string, string> = {
  reel_reach: '🎬 Reel Reach',
  google_review: '⭐ Google Review',
};

const STATUS_COLORS: Record<string, string> = {
  active: Colors.green,
  paused: '#c07000',
  completed: Colors.rose,
  cancelled: '#888',
  draft: '#888',
};

function LeaderboardRow({ rank, participant }: { rank: number; participant: any }) {
  return (
    <View style={styles.lbRow}>
      <View style={styles.lbRank}>
        <Text style={styles.lbRankText}>
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
        </Text>
      </View>
      <View style={styles.lbAvatar}>
        {participant.avatar ? (
          <Image source={{ uri: participant.avatar }} style={{ width: '100%', height: '100%', borderRadius: 18 }} contentFit="cover" />
        ) : (
          <Text style={styles.lbAvatarText}>{(participant.name || '?').charAt(0)}</Text>
        )}
      </View>
      <View style={styles.lbInfo}>
        <Text style={styles.lbName}>{participant.name || 'Influencer'}</Text>
        <Text style={styles.lbHandle}>@{participant.instagramHandle || '—'}</Text>
      </View>
      <View style={styles.lbRight}>
        <Text style={styles.lbStatus}>
          {participant.verificationStatus === 'approved' ? '✅' : participant.verificationStatus === 'rejected' ? '❌' : '⏳'}
        </Text>
        {participant.coinsAwarded > 0 && (
          <Text style={styles.lbCoins}>+{participant.coinsAwarded.toLocaleString()} 🪙</Text>
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
    mutationFn: () => api.arena.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arena', id] });
      queryClient.invalidateQueries({ queryKey: ['brandArenas'] });
      showModal({ title: 'Arena Paused', message: 'The arena has been paused. Participants cannot join until resumed.' });
    },
    onError: (err: any) => showModal({ title: 'Error', message: err.message }),
  });

  const resumeMutation = useMutation({
    mutationFn: () => api.arena.resume(id),
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
  const budgetRupees = (arena.totalBudgetCoins / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  const winnerPool = Math.floor(arena.totalBudgetCoins * 0.5);
  const participantPool = arena.totalBudgetCoins - winnerPool;
  const approvedCount = leaderboard.filter((p: any) => p.verificationStatus === 'approved').length;
  const pendingCount = leaderboard.filter((p: any) => p.verificationStatus === 'pending').length;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color={Colors.cream} strokeWidth={2} />
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
            style={styles.actionBtn}
            onPress={() => pauseMutation.mutate()}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnText}>⏸ Pause</Text>
          </TouchableOpacity>
        )}
        {arena.status === 'paused' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.green }]}
            onPress={() => resumeMutation.mutate()}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionBtnText, { color: '#fff' }]}>▶ Resume</Text>
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
            <Text style={styles.statValue}>{arena.totalBudgetCoins.toLocaleString()} 🪙</Text>
            <Text style={styles.statSub}>{budgetRupees}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Participants</Text>
            <Text style={styles.statValue}>{arena.participantCount || 0}</Text>
            <Text style={styles.statSub}>/ {arena.maxParticipants} max</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Verified</Text>
            <Text style={styles.statValue}>{approvedCount}</Text>
            <Text style={styles.statSub}>{pendingCount} pending</Text>
          </View>
        </View>

        {/* Coin Economy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Reward Structure</Text>
          <View style={styles.rewardCard}>
            <View style={styles.rewardRow}>
              <Text style={styles.rewardLabel}>Entry Fee (per influencer)</Text>
              <Text style={styles.rewardValue}>{arena.entryFeeCoins.toLocaleString()} 🪙 = ₹{(arena.entryFeeCoins / 100).toFixed(0)}</Text>
            </View>
            {arena.arenaType !== 'google_review' ? (
              <>
                <View style={styles.rewardRow}>
                  <Text style={styles.rewardLabel}>🥇 Winner Prize (50%)</Text>
                  <Text style={[styles.rewardValue, { color: Colors.gold }]}>{winnerPool.toLocaleString()} 🪙</Text>
                </View>
                <View style={styles.rewardRow}>
                  <Text style={styles.rewardLabel}>👥 Participant Pool (50%)</Text>
                  <Text style={styles.rewardValue}>{participantPool.toLocaleString()} 🪙</Text>
                </View>
              </>
            ) : (
              <View style={styles.rewardRow}>
                <Text style={styles.rewardLabel}>Per Verified Review</Text>
                <Text style={[styles.rewardValue, { color: Colors.gold }]}>{(arena.rewardPerReview || 2500).toLocaleString()} 🪙 = ₹{((arena.rewardPerReview || 2500) / 100).toFixed(0)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Google Review Info */}
        {arena.arenaType === 'google_review' && arena.businessName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Business Info</Text>
            <View style={styles.rewardCard}>
              <Text style={styles.businessName}>{arena.businessName}</Text>
              {arena.googleMapsLink && (
                <TouchableOpacity
                  style={styles.mapsLinkBtn}
                  onPress={() => Linking.openURL(arena.googleMapsLink).catch(() => {})}
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

        {/* Guidelines */}
        {arena.reviewGuidelines && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Guidelines</Text>
            <View style={styles.guidelinesCard}>
              <Text style={styles.guidelinesText}>{arena.reviewGuidelines}</Text>
            </View>
          </View>
        )}

        {/* Leaderboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>
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
  root: { flex: 1, backgroundColor: Colors.oxbloodDeep },
  loadingText: { fontFamily: FontFamily.sansMedium, fontSize: 16, color: Colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(232,216,204,0.1)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(232,216,204,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.cream,
  },
  headerStatus: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    marginTop: 1,
  },
  actionBtn: {
    backgroundColor: 'rgba(232,216,204,0.12)',
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
  body: { paddingHorizontal: 18, paddingTop: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(232,216,204,0.07)',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.15)',
    gap: 2,
  },
  statLabel: { fontFamily: FontFamily.sansRegular, fontSize: 9.5, color: 'rgba(232,216,204,0.45)' },
  statValue: { fontFamily: FontFamily.sansMedium, fontSize: 17, fontWeight: '700', color: Colors.cream },
  statSub: { fontFamily: FontFamily.sansRegular, fontSize: 10, color: 'rgba(232,216,204,0.4)' },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.cream,
    marginBottom: 10,
  },
  rewardCard: {
    backgroundColor: 'rgba(232,216,204,0.07)',
    borderRadius: Radius.lg,
    padding: 14,
    gap: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.12)',
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  rewardLabel: { fontFamily: FontFamily.sansRegular, fontSize: 12.5, color: 'rgba(232,216,204,0.55)', flex: 1 },
  rewardValue: { fontFamily: FontFamily.sansMedium, fontSize: 13, fontWeight: '700', color: Colors.cream },
  businessName: { fontFamily: FontFamily.sansMedium, fontSize: 16, fontWeight: '700', color: Colors.cream },
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
    backgroundColor: 'rgba(232,216,204,0.07)',
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.12)',
  },
  guidelinesText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(232,216,204,0.75)',
    lineHeight: 20,
  },
  leaderboard: {
    backgroundColor: 'rgba(232,216,204,0.07)',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.12)',
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(232,216,204,0.08)',
    gap: 10,
  },
  lbRank: { width: 28, alignItems: 'center' },
  lbRankText: { fontSize: 15 },
  lbAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(232,216,204,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  lbAvatarText: { fontFamily: FontFamily.sans, fontSize: 14, fontWeight: '800', color: Colors.cream },
  lbInfo: { flex: 1 },
  lbName: { fontFamily: FontFamily.sansMedium, fontSize: 13.5, color: Colors.cream },
  lbHandle: { fontFamily: FontFamily.sansRegular, fontSize: 11, color: 'rgba(232,216,204,0.45)' },
  lbRight: { alignItems: 'flex-end', gap: 2 },
  lbStatus: { fontSize: 16 },
  lbCoins: { fontFamily: FontFamily.sansMedium, fontSize: 11, color: Colors.gold, fontWeight: '700' },
  emptyLb: {
    backgroundColor: 'rgba(232,216,204,0.07)',
    borderRadius: Radius.lg,
    padding: 24,
    alignItems: 'center',
  },
  emptyLbText: { fontFamily: FontFamily.sansRegular, fontSize: 14, color: 'rgba(232,216,204,0.4)' },
});
