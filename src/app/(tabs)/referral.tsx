import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { Icon } from '@/components/ui/icon';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { GradientView } from '@/components/ui/gradient-view';

export default function ReferralScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showModal = useUIStore((s) => s.showModal);
  const queryClient = useQueryClient();

  const [converting, setConverting] = useState(false);

  // Fetch stats & history
  const { data: stats, isLoading, refetch } = useQuery<any>({
    queryKey: ['referralStats'],
    queryFn: () => api.referrals.getStats(),
  });

  // Convert points mutation
  const convertMutation = useMutation({
    mutationFn: (points: number) => api.referrals.convertPoints(points),
    onSuccess: (data: any) => {
      showModal({
        title: 'Points Converted! 🎉',
        message: data.message || 'Successfully converted points to wallet balance.',
      });
      queryClient.invalidateQueries({ queryKey: ['referralStats'] });
      queryClient.invalidateQueries({ queryKey: ['influencerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['brandProfile'] });
      queryClient.invalidateQueries({ queryKey: ['influencerDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['brandDashboard'] });
    },
    onError: (error: any) => {
      showModal({
        title: 'Conversion Failed',
        message: error.message || 'Failed to convert points. Please check your points balance and try again.',
      });
    },
    onSettled: () => {
      setConverting(false);
    },
  });

  const handleShare = async () => {
    if (!stats?.referralCode) return;
    try {
      const shareUrl = `https://app.richyreach.com/signup?ref=${stats.referralCode}`;
      await Share.share({
        message: `Join me on RichyReach, the platform where creators get Rich and brands get Reach! Register using my referral code [${stats.referralCode}] to get a ₹200 signup bonus instantly: ${shareUrl}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleConvertPoints = (amount: number) => {
    if ((stats?.reachPoints || 0) < amount) {
      showModal({
        title: 'Insufficient Points',
        message: `You need at least ${amount.toLocaleString()} reach points to convert into wallet balance.`,
      });
      return;
    }
    setConverting(true);
    convertMutation.mutate(amount);
  };

  if (isLoading) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.oxblood} />
        <Text style={styles.loadingText}>Loading referral program...</Text>
      </View>
    );
  }

  const reachPoints = stats?.reachPoints || 0;
  const referralCode = stats?.referralCode || 'RR_CODE';
  const totalReferrals = stats?.totalReferrals || 0;
  const totalPointsEarned = stats?.totalPointsEarned || 0;
  const totalWalletEarned = stats?.totalWalletEarned || 0;
  const referredUsersList = stats?.referrals || [];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Icon name="back" size={20} color={Colors.oxblood} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section / Points Balance */}
        <GradientView variant="oxblood" style={styles.heroCard}>
          <View style={styles.heroContentRow}>
            <View style={styles.heroLeftCol}>
              <Text style={styles.heroSubTitle}>YOUR POINTS BALANCE</Text>
              <Text style={styles.heroPointsValue}>{reachPoints.toLocaleString()}</Text>
              <Text style={styles.heroPointsLabel}>Reach Points</Text>

              <View style={styles.codeRow}>
                <View style={styles.codeContainer}>
                  <Text style={styles.codeText}>{referralCode}</Text>
                </View>
                <TouchableOpacity
                  onPress={handleShare}
                  style={styles.shareBtn}
                  activeOpacity={0.8}
                >
                  <Icon name="share" size={14} color={Colors.cream} />
                  <Text style={styles.shareBtnText}>Share</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.heroFootnote}>Share your code with other creators & brands</Text>
            </View>

            <View style={styles.heroRightCol}>
              <Image
                source={require('@/assets/images/referral_gift.png')}
                style={styles.heroGiftImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </GradientView>

        {/* Stats Grid */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statIconWrap}>
              <Icon name="users" size={16} color={Colors.oxblood} />
            </View>
            <View style={styles.statTextWrap}>
              <Text style={styles.statValue}>{totalReferrals}</Text>
              <Text style={styles.statLabel}>Total Invites</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statIconWrap}>
              <Icon name="wallet" size={16} color={Colors.oxblood} />
            </View>
            <View style={styles.statTextWrap}>
              <Text style={styles.statValue}>₹{(totalWalletEarned / 100).toLocaleString()}</Text>
              <Text style={styles.statLabel}>Wallet Earned</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statIconWrap}>
              <Icon name="star" size={16} color={Colors.oxblood} />
            </View>
            <View style={styles.statTextWrap}>
              <Text style={styles.statValue}>{totalPointsEarned.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Points Earned</Text>
            </View>
          </View>
        </View>

        {/* Reward Steps */}
        <Text style={styles.sectionHeading}>
          How it works <Text style={{ color: Colors.roseSoft }}>✦</Text>
        </Text>
        <View style={styles.stepsCard}>
          {/* Step 1 */}
          <View style={styles.stepRow}>
            <View style={styles.stepLeftColumn}>
              <View style={styles.stepNumberWrap}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepLine} />
            </View>
            <View style={styles.stepRightColumn}>
              <View style={styles.stepIconWrapBig}>
                <Icon name="share" size={20} color={Colors.oxblood} />
              </View>
              <View style={styles.stepTextWrapBig}>
                <Text style={styles.stepTitleBig}>Invite other creators</Text>
                <Text style={styles.stepDescBig}>
                  Share your unique referral link or code with your creator friends.
                </Text>
              </View>
            </View>
          </View>

          {/* Step 2 */}
          <View style={styles.stepRow}>
            <View style={styles.stepLeftColumn}>
              <View style={styles.stepNumberWrap}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepLine} />
            </View>
            <View style={styles.stepRightColumn}>
              <View style={styles.stepIconWrapBig}>
                <Icon name="addUser" size={20} color={Colors.oxblood} />
              </View>
              <View style={styles.stepTextWrapBig}>
                <Text style={styles.stepTitleBig}>They join & add service</Text>
                <Text style={styles.stepDescBig}>
                  When they register and add their first service with a video to verify their profile.
                </Text>
              </View>
            </View>
          </View>

          {/* Step 3 */}
          <View style={styles.stepRow}>
            <View style={styles.stepLeftColumn}>
              <View style={styles.stepNumberWrap}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
            </View>
            <View style={styles.stepRightColumn}>
              <View style={styles.stepIconWrapBig}>
                <Icon name="gift" size={20} color={Colors.oxblood} />
              </View>
              <View style={styles.stepTextWrapBig}>
                <Text style={styles.stepTitleBig}>Both get rewarded!</Text>
                <Text style={styles.stepDescBig}>
                  Once completed, you get ₹100 wallet balance and 10,000 points. They get ₹200 wallet balance and 200,000 points.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Points Converter */}
        <Text style={styles.sectionHeading}>
          Convert Points to Balance <Text style={{ color: Colors.roseSoft }}>✦</Text>
        </Text>
        <View style={styles.converterCard}>
          <View style={styles.converterLeftCol}>
            <View style={styles.converterIconWrap}>
              <Icon name="wallet" size={20} color={Colors.cream} />
            </View>
            <Text style={styles.converterTitle}>Instant Points Conversion</Text>
            <Text style={styles.converterDesc}>
              Convert your reach points directly into wallet cash! Every 10,000 reach points can be converted to ₹100.
            </Text>
          </View>

          <View style={styles.converterRightCol}>
            <TouchableOpacity
              onPress={() => handleConvertPoints(10000)}
              style={styles.convertButton}
              activeOpacity={0.8}
              disabled={converting}
            >
              <Text style={styles.convertBtnText}>Convert 10k Pts ➜ ₹100</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleConvertPoints(50000)}
              style={[styles.convertButton, { backgroundColor: Colors.roseDeep }]}
              activeOpacity={0.8}
              disabled={converting}
            >
              <Text style={styles.convertBtnText}>Convert 50k Pts ➜ ₹500</Text>
            </TouchableOpacity>
          </View>

          {converting && (
            <View style={styles.convertingOverlay}>
              <ActivityIndicator size="small" color={Colors.oxblood} />
              <Text style={styles.convertingText}>Converting...</Text>
            </View>
          )}
        </View>

        {/* Invited History */}
        <Text style={styles.sectionHeading}>
          Referral Tracking <Text style={{ color: Colors.roseSoft }}>✦</Text>
        </Text>
        {referredUsersList.length === 0 ? (
          <View style={styles.emptyTrackingCard}>
            <View style={styles.emptyLeftCol}>
              <Icon name="users" size={36} color="rgba(63,3,11,0.25)" />
            </View>
            <View style={styles.emptyRightCol}>
              <Text style={styles.emptyTitle}>No referrals made yet.</Text>
              <Text style={styles.emptyDesc}>Share your code to start earning!</Text>
              <TouchableOpacity
                onPress={handleShare}
                style={styles.emptyShareBtn}
                activeOpacity={0.8}
              >
                <Icon name="share" size={14} color={Colors.oxblood} />
                <Text style={styles.emptyShareBtnText}>Share Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.historyListCard}>
            {referredUsersList.map((item: any, idx: number) => {
              const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              const isPending = item.status === 'pending';

              return (
                <View
                  key={item.id || idx}
                  style={[
                    styles.historyItem,
                    idx < referredUsersList.length - 1 && styles.historyItemBorder,
                  ]}
                >
                  <View style={styles.historyItemLeft}>
                    <View style={styles.historyAvatar}>
                      <Text style={styles.historyAvatarLetter}>
                        {(item.name || item.email || '?').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.historyName}>{item.name || 'RichyReach User'}</Text>
                        {isPending && (
                          <View style={styles.pendingBadge}>
                            <Text style={styles.pendingBadgeText}>Pending</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.historyDate}>{formattedDate} · {item.role}</Text>
                    </View>
                  </View>
                  <View style={styles.historyItemRight}>
                    <Text style={[styles.historyPoints, isPending && styles.pendingText]}>
                      +{isPending ? '10,000' : item.pointsRewarded?.toLocaleString()} pts
                    </Text>
                    <Text style={[styles.historyWallet, isPending && styles.pendingText]}>
                      +₹{isPending ? '100' : (item.walletRewarded / 100).toFixed(0)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF7F4',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: FontFamily.sansMedium,
    color: Colors.rose,
    fontSize: 14,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(250, 247, 244, 0.9)',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(63,3,11,0.05)',
  },
  headerTitle: {
    fontFamily: FontFamily.serif,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 60,
  },
  heroCard: {
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 20,
    ...Shadow.card,
  },
  heroContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  heroLeftCol: {
    flex: 1.3,
    alignItems: 'flex-start',
    paddingRight: 8,
  },
  heroRightCol: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  heroGiftImage: {
    width: 140,
    height: 140,
  },
  heroSubTitle: {
    fontSize: 10,
    fontFamily: FontFamily.sans,
    color: 'rgba(232, 216, 204, 0.7)',
    letterSpacing: 1,
    fontWeight: '700',
  },
  heroPointsValue: {
    fontFamily: FontFamily.serif,
    fontSize: 44,
    fontWeight: '700',
    color: Colors.gold,
    marginTop: 4,
  },
  heroPointsLabel: {
    fontSize: 12,
    fontFamily: FontFamily.sansMedium,
    color: Colors.cream,
    fontWeight: '600',
    marginTop: 2,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    width: '100%',
  },
  codeContainer: {
    flex: 1.3,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  codeText: {
    fontFamily: FontFamily.sans,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.cream,
    letterSpacing: 0.5,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  shareBtnText: {
    fontFamily: FontFamily.sans,
    color: Colors.cream,
    fontSize: 12,
    fontWeight: '700',
  },
  heroFootnote: {
    fontSize: 10,
    fontFamily: FontFamily.sansMedium,
    color: 'rgba(232, 216, 204, 0.5)',
    marginTop: 12,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 8,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadow.card,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 2,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(180, 106, 116, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextWrap: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontFamily: FontFamily.serif,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(63, 3, 11, 0.4)',
    fontFamily: FontFamily.sansMedium,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(63, 3, 11, 0.08)',
  },
  sectionHeading: {
    fontSize: 12,
    fontFamily: FontFamily.sans,
    fontWeight: '700',
    color: Colors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 4,
  },
  stepsCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    ...Shadow.card,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 85,
  },
  stepLeftColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  stepNumberWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(180, 106, 116, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.roseDeep,
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    width: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.1)',
    marginVertical: 4,
  },
  stepRightColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingBottom: 16,
  },
  stepIconWrapBig: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(180, 106, 116, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTextWrapBig: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitleBig: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
  },
  stepDescBig: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.55)',
    lineHeight: 18,
    marginTop: 4,
  },
  converterCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    position: 'relative',
    ...Shadow.card,
  },
  converterLeftCol: {
    flex: 1.1,
    alignItems: 'flex-start',
  },
  converterIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  converterTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  converterDesc: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.5)',
    lineHeight: 16,
    marginTop: 4,
  },
  converterRightCol: {
    flex: 1,
    gap: 8,
  },
  convertButton: {
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  convertBtnText: {
    color: Colors.cream,
    fontFamily: FontFamily.sans,
    fontWeight: '700',
    fontSize: 11,
  },
  convertingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  convertingText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.oxblood,
    fontFamily: FontFamily.sansMedium,
  },
  emptyTrackingCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...Shadow.card,
  },
  emptyLeftCol: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(180, 106, 116, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRightCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  emptyTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  emptyDesc: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.5)',
    marginTop: 4,
    marginBottom: 12,
  },
  emptyShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.oxblood,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  emptyShareBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  historyListCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    ...Shadow.card,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  historyItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.06)',
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  historyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(63,3,11,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyAvatarLetter: {
    fontFamily: FontFamily.sans,
    fontWeight: '700',
    color: Colors.oxblood,
    fontSize: 15,
  },
  historyName: {
    fontSize: 14,
    fontFamily: FontFamily.sans,
    fontWeight: '700',
    color: Colors.ink,
  },
  historyDate: {
    fontSize: 11.5,
    color: 'rgba(63,3,11,0.4)',
    marginTop: 2,
    fontWeight: '600',
    fontFamily: FontFamily.sansMedium,
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyPoints: {
    fontSize: 13,
    fontFamily: FontFamily.sans,
    fontWeight: '700',
    color: Colors.roseDeep,
  },
  historyWallet: {
    fontSize: 11,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '600',
    color: '#2a7a5a',
    marginTop: 2,
  },
  pendingBadge: {
    backgroundColor: '#fff3cd',
    borderWidth: 0.5,
    borderColor: '#ffeeba',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pendingBadgeText: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    fontWeight: '700',
    color: '#856404',
    textTransform: 'uppercase',
  },
  pendingText: {
    color: 'rgba(63, 3, 11, 0.3)',
  },
});
