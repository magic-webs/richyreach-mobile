import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, Location01Icon, ExternalLinkIcon } from '@hugeicons/core-free-icons';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { TactileButton } from '@/components/ui/tactile-button';
import { useProfilesStore } from '@/store/profiles';

const TYPE_LABELS: Record<string, string> = {
  reel_reach: '🎬 Reel Reach',
  google_review: '⭐ Google Review',
};

function LeaderboardRow({ rank, p }: { rank: number; p: any }) {
  return (
    <View style={styles.lbRow}>
      <Text style={styles.lbRank}>
        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
      </Text>
      <View style={styles.lbAvatar}>
        <Text style={styles.lbAvatarText}>{(p.name || '?')[0]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.lbName}>{p.name || 'Influencer'}</Text>
        <Text style={styles.lbHandle}>@{p.instagramHandle || '—'}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Text style={styles.lbStatus}>
          {p.verificationStatus === 'approved'
            ? '✅'
            : p.verificationStatus === 'rejected'
              ? '❌'
              : '⏳'}
        </Text>
        {p.accountReach > 0 && (
          <Text style={styles.lbReach}>{p.accountReach.toLocaleString()} views</Text>
        )}
        {p.coinsAwarded > 0 && (
          <Text style={styles.lbCoins}>+{p.coinsAwarded.toLocaleString()} <Text style={styles.coinEmojiOverride}>🪙</Text></Text>
        )}
      </View>
    </View>
  );
}

export default function ArenaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showModal = useUIStore((s) => s.showModal);
  const queryClient = useQueryClient();
  const { activeInfluencerProfileId } = useProfilesStore();

  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const submitForm = useForm<{ collaborationLink: string; reviewLink: string }>({
    mode: 'onSubmit',
    defaultValues: { collaborationLink: '', reviewLink: '' },
  });

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

  const { data: participations = [] } = useQuery({
    queryKey: ['myParticipations'],
    queryFn: () => api.arena.myParticipations(activeInfluencerProfileId),
    enabled: !!activeInfluencerProfileId,
  });

  const myParticipation = participations.find((p: any) => p.arenaId === id);
  const isJoined = !!myParticipation;
  const isGoogleReview = arena?.arenaType === 'google_review';

  const joinMutation = useMutation({
    mutationFn: () => api.arena.join(id, activeInfluencerProfileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myParticipations'] });
      queryClient.invalidateQueries({ queryKey: ['arena', id] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      showModal({
        title: 'Joined!',
        message: `You have joined "${arena?.title}". ${arena?.entryFeeCoins?.toLocaleString()} coins deducted. Now upload your submission!`,
      });
      setShowSubmitForm(true);
    },
    onError: (err: any) => showModal({ title: 'Join Failed', message: err.message }),
  });

  const submitMutation = useMutation({
    mutationFn: (data: { collaborationLink: string; reviewLink: string }) =>
      isGoogleReview
        ? api.arena.submit(id, { reviewLink: data.reviewLink }, activeInfluencerProfileId)
        : api.arena.submit(id, { collaborationLink: data.collaborationLink }, activeInfluencerProfileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myParticipations'] });
      queryClient.invalidateQueries({ queryKey: ['arenaLeaderboard', id] });
      submitForm.reset();
      showModal({
        title: '✅ Submission Uploaded!',
        message: 'Your entry has been submitted and is pending verification.',
      });
      setShowSubmitForm(false);
    },
    onError: (err: any) => showModal({ title: 'Submit Failed', message: err.message }),
  });

  const handleJoin = () => {
    if (!arena) return;
    const isFree = arena.entryFeeCoins === 0;
    const message = isFree
      ? `Join "${arena.title}" for free. No entry fee for this Google Review arena.`
      : `Joining "${arena.title}" will deduct ${arena.entryFeeCoins?.toLocaleString()} coins (₹${(arena.entryFeeCoins / 100).toFixed(0)}) from your wallet. Continue?`;

    showModal({
      title: 'Join Arena',
      message: message,
      actions: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isFree ? 'Join Free' : 'Join & Pay',
          style: 'destructive',
          onPress: () => joinMutation.mutate(),
        },
      ],
    });
  };

  if (isLoading || !arena) {
    return (
      <View style={[styles.root, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.loadingText}>Loading arena...</Text>
      </View>
    );
  }

  const daysLeft = Math.max(0, Math.ceil((new Date(arena.endDate).getTime() - Date.now()) / 864e5));
  const winnerPool = Math.floor(arena.totalBudgetCoins * 0.5);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* Glows */}
        <View style={styles.glow1} pointerEvents="none" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color={Colors.cream} strokeWidth={2} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{arena.title}</Text>
            <Text style={styles.headerMeta}>
              {TYPE_LABELS[arena.arenaType] || arena.arenaType}  ·  {daysLeft}d left
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 130 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Prize Pool</Text>
              <Text style={[styles.statValue, { color: Colors.gold }]}>
                {arena.totalBudgetCoins.toLocaleString()} <Text style={styles.coinEmojiOverride}>🪙</Text>
              </Text>
              <Text style={styles.statSub}>
                = ₹{(arena.totalBudgetCoins / 100).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Entry Fee</Text>
              <Text style={styles.statValue}>{arena.entryFeeCoins.toLocaleString()} <Text style={styles.coinEmojiOverride}>🪙</Text></Text>
              <Text style={styles.statSub}>= ₹{(arena.entryFeeCoins / 100).toFixed(0)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Joined</Text>
              <Text style={styles.statValue}>{arena.participantCount}</Text>
              <Text style={styles.statSub}>/ {arena.maxParticipants} max</Text>
            </View>
          </View>

          {/* Prize breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Prize Breakdown</Text>
            <View style={styles.prizeCard}>
              {isGoogleReview ? (
                <View style={styles.prizeRow}>
                  <Text style={styles.prizeRowLabel}>Per Verified Review</Text>
                  <Text style={[styles.prizeRowValue, { color: Colors.gold }]}>
                    {(arena.rewardPerReview || 2500).toLocaleString()} <Text style={styles.coinEmojiOverride}>🪙</Text>
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.prizeRow}>
                    <Text style={styles.prizeRowLabel}>🥇 Winner Prize (50%)</Text>
                    <Text style={[styles.prizeRowValue, { color: Colors.gold }]}>
                      {winnerPool.toLocaleString()} <Text style={styles.coinEmojiOverride}>🪙</Text>
                    </Text>
                  </View>
                  <View style={styles.prizeRow}>
                    <Text style={styles.prizeRowLabel}>👥 Others (50% split by reach)</Text>
                    <Text style={styles.prizeRowValue}>
                      {(arena.totalBudgetCoins - winnerPool).toLocaleString()} <Text style={styles.coinEmojiOverride}>🪙</Text>
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Google Review business info */}
          {isGoogleReview && arena.businessName && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Business to Review</Text>
              <View style={styles.businessCard}>
                <Text style={styles.businessName}>{arena.businessName}</Text>
                {arena.googleMapsLink && (
                  <TouchableOpacity
                    style={styles.mapsBtn}
                    onPress={() => Linking.openURL(arena.googleMapsLink).catch(() => { })}
                    activeOpacity={0.8}
                  >
                    <HugeiconsIcon icon={Location01Icon} size={14} color={Colors.green} strokeWidth={2} />
                    <Text style={styles.mapsBtnText}>Open Google Maps</Text>
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
              <View style={styles.guideCard}>
                <Text style={styles.guideText}>{arena.reviewGuidelines}</Text>
              </View>
            </View>
          )}

          {/* My participation status */}
          {isJoined && myParticipation && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 My Status</Text>
              <View style={styles.myStatusCard}>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Verification</Text>
                  <Text style={styles.statusValue}>
                    {myParticipation.verificationStatus === 'approved'
                      ? '✅ Approved'
                      : myParticipation.verificationStatus === 'rejected'
                        ? '❌ Rejected'
                        : '⏳ Pending'}
                  </Text>
                </View>
                {myParticipation.coinsAwarded > 0 && (
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Earned</Text>
                    <Text style={[styles.statusValue, { color: Colors.gold }]}>
                      +{myParticipation.coinsAwarded.toLocaleString()} <Text style={styles.coinEmojiOverride}>🪙</Text>
                    </Text>
                  </View>
                )}
                {/* Submit / resubmit form toggle */}
                {myParticipation.verificationStatus !== 'approved' && (
                  <TouchableOpacity
                    style={styles.toggleSubmitBtn}
                    onPress={() => setShowSubmitForm(!showSubmitForm)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.toggleSubmitBtnText}>
                      {showSubmitForm ? '▲ Hide Form' : '📤 Upload Submission'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Submission form */}
          {isJoined && showSubmitForm && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📤 Submit Entry</Text>
              <View style={styles.submitForm}>
                {!isGoogleReview && (
                  <Controller
                    control={submitForm.control}
                    name="collaborationLink"
                    rules={{
                      required: 'Collaboration link is required',
                      validate: (v) =>
                        v.includes('instagram.com') || 'Must be a valid Instagram URL',
                    }}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <View style={styles.formField}>
                        <Text style={styles.formLabel}>Instagram Collaboration Link *</Text>
                        <TextInput
                          style={[styles.formInput, error && styles.formInputError]}
                          placeholder="https://www.instagram.com/reel/..."
                          placeholderTextColor="rgba(232,216,204,0.3)"
                          value={value}
                          onChangeText={onChange}
                          keyboardType="url"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        {error ? (
                          <Text style={styles.formError}>{error.message}</Text>
                        ) : (
                          <Text style={styles.formHint}>
                            {'Invite @richyreach_official' +
                              (arena.brandInstagramPage ? ` and @${arena.brandInstagramPage}` : '') +
                              ' as collaborators on your reel, then paste the link here. Reach is auto-fetched.'}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                )}
                {isGoogleReview && (
                  <Controller
                    control={submitForm.control}
                    name="reviewLink"
                    rules={{ required: 'Google Review link is required' }}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <View style={styles.formField}>
                        <Text style={styles.formLabel}>Google Review Link *</Text>
                        <TextInput
                          style={[styles.formInput, error && styles.formInputError]}
                          placeholder="https://maps.google.com/...your-review..."
                          placeholderTextColor="rgba(232,216,204,0.3)"
                          value={value}
                          onChangeText={onChange}
                          keyboardType="url"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        {error && <Text style={styles.formError}>{error.message}</Text>}
                      </View>
                    )}
                  />
                )}

                <TactileButton
                  text={submitMutation.isPending ? 'Submitting...' : '📤 Submit Entry'}
                  variant="green"
                  fullWidth
                  onPress={submitForm.handleSubmit((data) => submitMutation.mutate(data))}
                  loading={submitMutation.isPending}
                />
              </View>
            </View>
          )}

          {/* Leaderboard */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>
            {leaderboard.length === 0 ? (
              <View style={styles.emptyLb}>
                <Text style={styles.emptyLbText}>No participants yet — be the first!</Text>
              </View>
            ) : (
              <View style={styles.lbList}>
                {leaderboard.map((p: any, i: number) => (
                  <LeaderboardRow key={p.id} rank={i + 1} p={p} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Join CTA */}
        {!isJoined && arena.status === 'active' && (
          <View style={[styles.joinCta, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.joinCtaInfo}>
              <Text style={styles.joinCtaLabel}>Entry Fee</Text>
              {arena.entryFeeCoins === 0 ? (
                <Text style={[styles.joinCtaCoins, { color: Colors.green }]}>Free 🎁</Text>
              ) : (
                <Text style={styles.joinCtaCoins}>
                  {arena.entryFeeCoins.toLocaleString()} <Text style={styles.coinEmojiOverride}>🪙</Text> = ₹{(arena.entryFeeCoins / 100).toFixed(0)}
                </Text>
              )}
            </View>
            <TactileButton
              text={joinMutation.isPending ? 'Joining...' : 'Join Arena'}
              variant="rose"
              onPress={handleJoin}
              loading={joinMutation.isPending}
              size="lg"
            />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(180,106,116,0.2)',
  },
  loadingText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    color: Colors.cream,
  },
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
  headerMeta: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(232,216,204,0.45)',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(232,216,204,0.07)',
    borderRadius: Radius.md,
    padding: 12,
    gap: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.12)',
  },
  statLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 9.5,
    color: 'rgba(232,216,204,0.45)',
  },
  statValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.cream,
    marginTop: 2,
  },
  statSub: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 9.5,
    color: 'rgba(232,216,204,0.35)',
  },
  section: { paddingHorizontal: 18, marginBottom: 20 },
  sectionTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.cream,
    marginBottom: 10,
  },
  prizeCard: {
    backgroundColor: 'rgba(232,216,204,0.07)',
    borderRadius: Radius.lg,
    padding: 16,
    gap: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.12)',
  },
  prizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prizeRowLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(232,216,204,0.6)',
  },
  prizeRowValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.cream,
  },
  businessCard: {
    backgroundColor: 'rgba(42,122,90,0.12)',
    borderRadius: Radius.lg,
    padding: 16,
    gap: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(42,122,90,0.25)',
  },
  businessName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.cream,
  },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(42,122,90,0.2)',
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  mapsBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.green,
    fontWeight: '700',
  },
  guideCard: {
    backgroundColor: 'rgba(232,216,204,0.07)',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.12)',
  },
  guideText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13.5,
    color: 'rgba(232,216,204,0.8)',
    lineHeight: 21,
  },
  myStatusCard: {
    backgroundColor: 'rgba(232,216,204,0.07)',
    borderRadius: Radius.lg,
    padding: 16,
    gap: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.12)',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(232,216,204,0.55)',
  },
  statusValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.cream,
  },
  toggleSubmitBtn: {
    backgroundColor: 'rgba(232,216,204,0.1)',
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'center',
    marginTop: 4,
  },
  toggleSubmitBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.cream,
  },
  submitForm: {
    backgroundColor: 'rgba(232,216,204,0.07)',
    borderRadius: Radius.lg,
    padding: 16,
    gap: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.12)',
  },
  formField: { gap: 6 },
  formHint: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: 'rgba(232,216,204,0.45)',
    lineHeight: 17,
  },
  formError: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: Colors.rose,
  },
  formInputError: {
    borderColor: Colors.rose,
  },
  formLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(232,216,204,0.7)',
  },
  formInput: {
    backgroundColor: 'rgba(232,216,204,0.07)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(232,216,204,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: FontFamily.sansRegular,
    fontSize: 13.5,
    color: Colors.cream,
  },
  lbList: {
    backgroundColor: 'rgba(232,216,204,0.07)',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.12)',
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(232,216,204,0.07)',
  },
  lbRank: { fontSize: 16, minWidth: 28, textAlign: 'center' },
  lbAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(232,216,204,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbAvatarText: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.cream,
  },
  lbName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    color: Colors.cream,
  },
  lbHandle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(232,216,204,0.4)',
  },
  lbStatus: { fontSize: 15 },
  lbReach: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10.5,
    color: 'rgba(232,216,204,0.4)',
  },
  lbCoins: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gold,
  },
  emptyLb: {
    backgroundColor: 'rgba(232,216,204,0.07)',
    borderRadius: Radius.lg,
    padding: 24,
    alignItems: 'center',
  },
  emptyLbText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13.5,
    color: 'rgba(232,216,204,0.4)',
    textAlign: 'center',
  },
  joinCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 99,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(42,2,7,0.95)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(232,216,204,0.1)',
  },
  joinCtaInfo: { gap: 2 },
  joinCtaLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10,
    color: 'rgba(232,216,204,0.45)',
  },
  joinCtaCoins: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.gold,
  },
  coinEmojiOverride: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
  },
});
