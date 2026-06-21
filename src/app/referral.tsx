import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors, FontFamily, Shadow, Radius } from '@/constants/brand';
import { Icon } from '@/components/ui/icon';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';

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
      // Refetch dashboard, profile, and referral stats
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
      const shareUrl = `https://richyreach.com/signup?ref=${stats.referralCode}`;
      await Share.share({
        message: `Join me on RichyReach, the platform where creators get Rich and brands get Reach! Register using my referral code [${stats.referralCode}] to get a ₹200 signup bonus instantly: ${shareUrl}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyCode = async () => {
    if (!stats?.referralCode) return;
    try {
      await Share.share({
        message: stats.referralCode,
      });
      showModal({
        title: 'Copy Referral Code',
        message: `Your referral code is: ${stats.referralCode}. Use the system dialog to copy or send.`,
      });
    } catch (error) {
      console.error('Error copying code:', error);
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
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section / Points Balance */}
        <View style={styles.heroCard}>
          <Text style={styles.heroSubTitle}>YOUR POINTS BALANCE</Text>
          <Text style={styles.heroPointsValue}>{reachPoints.toLocaleString()}</Text>
          <Text style={styles.heroPointsLabel}>Reach Points</Text>

          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{referralCode}</Text>
            <TouchableOpacity
              onPress={handleShare}
              style={styles.copyBtn}
              activeOpacity={0.8}
            >
              <Icon name="share" size={18} color={Colors.cream} />
            </TouchableOpacity>
          </View>
          <Text style={styles.heroFootnote}>Share your code with other creators & brands</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statValue}>{totalReferrals}</Text>
            <Text style={styles.statLabel}>Total Invites</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statValue}>₹{(totalWalletEarned / 100).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Wallet Earned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statValue}>{totalPointsEarned.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
        </View>

        {/* Reward Steps */}
        <Text style={styles.sectionHeading}>How it works</Text>
        <View style={styles.stepsCard}>
          <View style={styles.stepRow}>
            <View style={styles.stepIconWrap}>
              <Icon name="share" size={18} color={Colors.oxblood} />
            </View>
            <View style={styles.stepTextWrap}>
              <Text style={styles.stepTitle}>1. Invite creators or brands</Text>
              <Text style={styles.stepDesc}>Share your unique referral link or code with your colleagues and friends.</Text>
            </View>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepRow}>
            <View style={styles.stepIconWrap}>
              <Icon name="addUser" size={18} color={Colors.oxblood} />
            </View>
            <View style={styles.stepTextWrap}>
              <Text style={styles.stepTitle}>2. They register & join</Text>
              <Text style={styles.stepDesc}>When they create an account with your code, they immediately get ₹200 wallet balance and 200,000 points.</Text>
            </View>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepRow}>
            <View style={styles.stepIconWrap}>
              <Icon name="gift" size={18} color={Colors.oxblood} />
            </View>
            <View style={styles.stepTextWrap}>
              <Text style={styles.stepTitle}>3. You get rewarded!</Text>
              <Text style={styles.stepDesc}>You immediately get ₹100 wallet balance and 10,000 reach points credit to your profile.</Text>
            </View>
          </View>
        </View>

        {/* Points Converter */}
        <Text style={styles.sectionHeading}>Convert Points to Balance</Text>
        <View style={styles.converterCard}>
          <View style={styles.converterHeader}>
            <Icon name="wallet" size={22} color={Colors.oxblood} />
            <Text style={styles.converterTitle}>Instant Points Conversion</Text>
          </View>
          <Text style={styles.converterDesc}>
            Convert your reach points directly into wallet cash! Every 10,000 reach points can be converted to ₹100 of wallet balance.
          </Text>

          <View style={styles.conversionOptionRow}>
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
              <Text style={styles.convertingText}>Processing conversion...</Text>
            </View>
          )}
        </View>

        {/* Invited History */}
        <Text style={styles.sectionHeading}>Referral Tracking</Text>
        {referredUsersList.length === 0 ? (
          <View style={styles.emptyHistoryCard}>
            <Icon name="users" size={32} color="rgba(63,3,11,0.2)" />
            <Text style={styles.emptyHistoryText}>No referrals made yet. Share your code to start earning!</Text>
          </View>
        ) : (
          <View style={styles.historyListCard}>
            {referredUsersList.map((item: any, idx: number) => {
              const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

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
                      <Text style={styles.historyName}>{item.name || 'RichyReach User'}</Text>
                      <Text style={styles.historyDate}>{formattedDate} · {item.role}</Text>
                    </View>
                  </View>
                  <View style={styles.historyItemRight}>
                    <Text style={styles.historyPoints}>+{item.pointsRewarded?.toLocaleString()} pts</Text>
                    <Text style={styles.historyWallet}>+₹{(item.walletRewarded / 100).toFixed(0)}</Text>
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
    backgroundColor: Colors.creamLite,
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
    backgroundColor: 'rgba(244,236,228,0.9)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.07)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(63,3,11,0.04)',
  },
  headerTitle: {
    fontFamily: FontFamily.serif,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.ink,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },
  heroCard: {
    backgroundColor: Colors.oxbloodDeep,
    borderRadius: 24,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...Shadow.card,
  },
  heroSubTitle: {
    fontSize: 11,
    fontFamily: FontFamily.sansMedium,
    color: 'rgba(244,236,228,0.6)',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  heroPointsValue: {
    fontFamily: FontFamily.serif,
    fontSize: 48,
    fontWeight: '700',
    color: Colors.gold,
    marginTop: 6,
  },
  heroPointsLabel: {
    fontSize: 13,
    color: Colors.cream,
    fontWeight: '600',
    marginTop: 2,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingLeft: 24,
    paddingRight: 6,
    paddingVertical: 6,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  codeText: {
    fontFamily: FontFamily.sans,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.cream,
    letterSpacing: 1,
    marginRight: 18,
  },
  copyBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFootnote: {
    fontSize: 11,
    color: 'rgba(244,236,228,0.5)',
    marginTop: 12,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...Shadow.card,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 0.5,
    height: 28,
    backgroundColor: 'rgba(63,3,11,0.1)',
  },
  statValue: {
    fontFamily: FontFamily.serif,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(63,3,11,0.4)',
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 26,
    marginBottom: 10,
    marginLeft: 4,
  },
  stepsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    ...Shadow.card,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  stepIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(180,106,116,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTextWrap: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  stepDesc: {
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.6)',
    lineHeight: 18,
    marginTop: 3,
  },
  stepLine: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(63,3,11,0.08)',
    marginLeft: 18,
    marginVertical: 4,
  },
  converterCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    position: 'relative',
    ...Shadow.card,
  },
  converterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  converterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  converterDesc: {
    fontSize: 13,
    color: 'rgba(63,3,11,0.6)',
    lineHeight: 20,
    marginBottom: 18,
  },
  conversionOptionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  convertButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convertBtnText: {
    color: Colors.cream,
    fontWeight: '700',
    fontSize: 13,
  },
  convertingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  convertingText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.oxblood,
  },
  emptyHistoryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadow.card,
  },
  emptyHistoryText: {
    fontSize: 13,
    color: 'rgba(63,3,11,0.4)',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18,
  },
  historyListCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
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
    fontWeight: '700',
    color: Colors.oxblood,
    fontSize: 16,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
  },
  historyDate: {
    fontSize: 11.5,
    color: 'rgba(63,3,11,0.4)',
    marginTop: 2,
    fontWeight: '600',
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyPoints: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.roseDeep,
  },
  historyWallet: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2a7a5a',
    marginTop: 2,
  },
});
