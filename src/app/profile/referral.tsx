import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import {
  Share2,
  Copy,
  CheckCheck,
  Users,
  Wallet,
  Star,
  UserPlus,
  Gift,
} from 'lucide-react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, Share01FreeIcons } from '@hugeicons/core-free-icons';

import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';

const STEPS = [
  {
    Icon: Share2,
    title: 'Share your code',
    desc: 'Send your unique referral link or code to your creator friends.',
  },
  {
    Icon: UserPlus,
    title: 'They join & verify',
    desc: 'When they register and add their first service with a video.',
  },
  {
    Icon: Gift,
    title: 'Both get rewarded!',
    desc: 'You get ₹100 + 10,000 pts. They get ₹200 + 200,000 pts.',
  },
];

export default function ReferralScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showModal = useUIStore((s) => s.showModal);


  const [copied, setCopied] = useState(false);

  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ['referralStats'],
    queryFn: () => api.referrals.getStats(),
  });

  const handleShare = async () => {
    if (!stats?.referralCode) return;
    try {
      const shareUrl = `https://app.richyreach.com/signup?ref=${stats.referralCode}`;
      await Share.share({
        message: `Join me on RichyReach! Get ₹200 signup bonus with my code [${stats.referralCode}]: ${shareUrl}`,
      });
    } catch { }
  };

  const handleCopy = async () => {
    if (!stats?.referralCode) return;
    await Clipboard.setStringAsync(stats.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.oxblood} />
        <Text style={styles.loadingText}>Loading your referral dashboard...</Text>
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
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={28} color={Colors.oxblood} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareHeaderBtn} activeOpacity={0.8}>
          <HugeiconsIcon icon={Share01FreeIcons} size={28} color={Colors.oxblood} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero card ── */}
        <LinearGradient
          colors={['#1e0103', '#3f030b', '#1a0204']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          {/* Decorative ring */}
          <View style={styles.heroRingDecor} />

          <View style={styles.heroInner}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroEyebrow}>YOUR REACH POINTS</Text>
              <Text style={styles.heroPoints}>{reachPoints.toLocaleString()}</Text>
              <Text style={styles.heroPointsLabel}>Points</Text>

              {/* Code pill */}
              <View style={styles.codePill}>
                <Text style={styles.codeLabel}>CODE</Text>
                <Text style={styles.codeValue}>{referralCode}</Text>
                <TouchableOpacity onPress={handleCopy} style={styles.copyBtn} activeOpacity={0.8}>
                  {copied
                    ? <CheckCheck size={13} color={Colors.green} strokeWidth={2.5} />
                    : <Copy size={13} color={Colors.cream} strokeWidth={2.5} />}
                  <Text style={[styles.copyBtnText, copied && { color: Colors.green }]}>
                    {copied ? 'Copied!' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.heroRight}>
              <Image
                source={require('@/assets/images/referral_gift.png')}
                style={styles.heroImage}
                resizeMode="contain"
              />
              <TouchableOpacity onPress={handleShare} style={styles.heroShareBtn} activeOpacity={0.8}>
                <Share2 size={14} color={Colors.cream} strokeWidth={2.2} />
                <Text style={styles.heroShareText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.heroFooter}>Share with creators & brands to earn together</Text>
        </LinearGradient>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          {[
            { LIcon: Users, value: String(totalReferrals), label: 'Invites' },
            { LIcon: Wallet, value: `₹${(totalWalletEarned / 100).toLocaleString()}`, label: 'Earned' },
            { LIcon: Star, value: totalPointsEarned.toLocaleString(), label: 'Points' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.label}>
              <View style={styles.statCell}>
                <View style={styles.statIcon}>
                  <s.LIcon size={15} color={Colors.oxblood} strokeWidth={2.2} />
                </View>
                <Text style={styles.statVal}>{s.value}</Text>
                <Text style={styles.statLbl}>{s.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.statDiv} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Reward banner ── */}
        <View style={styles.rewardBanner}>
          <View style={styles.rewardSide}>
            <Text style={styles.rewardBadge}>YOU GET</Text>
            <Text style={styles.rewardAmount}>₹100</Text>
            <Text style={styles.rewardSub}>+ 10,000 pts</Text>
          </View>
          <View style={styles.rewardDivider}>
            <Text style={styles.rewardDivText}>+</Text>
          </View>
          <View style={styles.rewardSide}>
            <Text style={styles.rewardBadge}>THEY GET</Text>
            <Text style={styles.rewardAmount}>₹200</Text>
            <Text style={styles.rewardSub}>+ 200,000 pts</Text>
          </View>
        </View>

        {/* ── How it works ── */}
        <Text style={styles.sectionLabel}>How it works</Text>
        <View style={styles.stepsCard}>
          {STEPS.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <View style={styles.stepNumBadge}>
                  <Text style={styles.stepNum}>{i + 1}</Text>
                </View>
                {i < STEPS.length - 1 && <View style={styles.stepDash} />}
              </View>
              <View style={styles.stepRight}>
                <View style={styles.stepIconWrap}>
                  <step.Icon size={18} color={Colors.oxblood} strokeWidth={2} />
                </View>
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ── Referral tracking ── */}
        <Text style={styles.sectionLabel}>Referral Tracking</Text>
        {referredUsersList.length === 0 ? (
          <View style={styles.emptyCard}>
            <LottieView
              source={require('@/assets/lottie-animation/empty-ghost.json')}
              autoPlay
              loop
              style={{ width: 140, height: 140, marginBottom: 8 }}
            />
            <Text style={styles.emptyTitle}>No referrals yet</Text>
            <Text style={styles.emptyDesc}>Share your code to start earning rewards!</Text>
            <TouchableOpacity onPress={handleShare} style={styles.emptyBtn} activeOpacity={0.8}>
              <Share2 size={14} color="#fff" strokeWidth={2.2} />
              <Text style={styles.emptyBtnText}>Share Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.historyCard}>
            {referredUsersList.map((item: any, idx: number) => {
              const isPending = item.status === 'pending';
              const date = new Date(item.createdAt).toLocaleDateString(undefined, {
                day: 'numeric', month: 'short', year: 'numeric',
              });
              return (
                <View
                  key={item.id || idx}
                  style={[styles.histRow, idx < referredUsersList.length - 1 && styles.histRowBorder]}
                >
                  <View style={styles.histAvatar}>
                    <Text style={styles.histAvatarLetter}>
                      {(item.name || item.email || '?').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.histMeta}>
                    <View style={styles.histNameRow}>
                      <Text style={styles.histName} numberOfLines={1}>{item.name || 'RichyReach User'}</Text>
                      {isPending && (
                        <View style={styles.pendingBadge}>
                          <Text style={styles.pendingText}>Pending</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.histDate}>{date} · {item.role}</Text>
                  </View>
                  <View style={styles.histRewards}>
                    <Text style={[styles.histPts, isPending && styles.dimText]}>
                      +{isPending ? '10,000' : item.pointsRewarded?.toLocaleString()} pts
                    </Text>
                    <Text style={[styles.histRupees, isPending && styles.dimText]}>
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
  root: { flex: 1, backgroundColor: '#F7F4F1' },
  center: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, fontFamily: FontFamily.sansMedium, color: Colors.rose, fontSize: 14 },

  // Header
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#F7F4F1',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(63,3,11,0.05)',
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(63,3,11,0.05)' },
  headerTitle: { fontFamily: FontFamily.sans, fontSize: 16, fontWeight: '700', color: Colors.oxblood },
  shareHeaderBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(63,3,11,0.05)' },

  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 },

  // Hero
  heroCard: {
    borderRadius: 28,
    padding: 24,
    overflow: 'hidden',
    ...Shadow.card,
  },
  heroRingDecor: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 40,
    borderColor: 'rgba(255,255,255,0.03)',
    right: -80,
    top: -80,
  },
  heroInner: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroLeft: { flex: 1.2, paddingRight: 8 },
  heroEyebrow: { fontSize: 9, fontFamily: FontFamily.sans, color: 'rgba(232,216,204,0.5)', letterSpacing: 1.5, fontWeight: '700', marginBottom: 4 },
  heroPoints: { fontFamily: FontFamily.sans, fontSize: 52, fontWeight: '900', color: Colors.gold, lineHeight: 56 },
  heroPointsLabel: { fontFamily: FontFamily.sansMedium, fontSize: 11, color: 'rgba(232,216,204,0.6)', marginBottom: 18 },

  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 6,
  },
  codeLabel: { fontFamily: FontFamily.sans, fontSize: 8, color: 'rgba(232,216,204,0.4)', fontWeight: '700', letterSpacing: 1 },
  codeValue: { fontFamily: FontFamily.sans, fontSize: 13, fontWeight: '800', color: '#fff', flex: 1 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 },
  copyBtnText: { fontFamily: FontFamily.sansMedium, fontSize: 10, fontWeight: '700', color: Colors.cream },

  heroRight: { alignItems: 'flex-end', gap: 12 },
  heroImage: { width: 120, height: 120 },
  heroShareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, paddingVertical: 7, paddingHorizontal: 12 },
  heroShareText: { fontFamily: FontFamily.sans, fontSize: 11, fontWeight: '700', color: Colors.cream },
  heroFooter: { fontFamily: FontFamily.sansMedium, fontSize: 10, color: 'rgba(232,216,204,0.4)', marginTop: 16, textAlign: 'center' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadow.card,
  },
  statCell: { flex: 1, alignItems: 'center', gap: 4 },
  statIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(63,3,11,0.05)', alignItems: 'center', justifyContent: 'center' },
  statVal: { fontFamily: FontFamily.sans, fontSize: 15, fontWeight: '800', color: Colors.oxblood },
  statLbl: { fontFamily: FontFamily.sansMedium, fontSize: 10, color: 'rgba(63,3,11,0.45)' },
  statDiv: { width: 1, height: 36, backgroundColor: 'rgba(63,3,11,0.07)' },

  // Reward banner
  rewardBanner: {
    flexDirection: 'row',
    marginTop: 14,
    backgroundColor: Colors.oxblood,
    borderRadius: 20,
    overflow: 'hidden',
    ...Shadow.card,
  },
  rewardSide: { flex: 1, alignItems: 'center', paddingVertical: 18, gap: 2 },
  rewardBadge: { fontFamily: FontFamily.sans, fontSize: 8, color: 'rgba(232,216,204,0.5)', letterSpacing: 1.2, fontWeight: '700' },
  rewardAmount: { fontFamily: FontFamily.sans, fontSize: 28, fontWeight: '900', color: Colors.gold },
  rewardSub: { fontFamily: FontFamily.sansMedium, fontSize: 10.5, color: 'rgba(232,216,204,0.55)' },
  rewardDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  rewardDivText: { fontFamily: FontFamily.sans, fontSize: 22, fontWeight: '900', color: 'rgba(255,255,255,0.25)' },

  // Section label
  sectionLabel: {
    fontFamily: FontFamily.sans,
    fontWeight: '700',
    fontSize: 11,
    color: Colors.rose,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 22,
    marginBottom: 10,
    marginLeft: 2,
  },

  // Steps
  stepsCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, ...Shadow.card },
  stepRow: { flexDirection: 'row', gap: 12, minHeight: 76 },
  stepLeft: { alignItems: 'center', width: 28 },
  stepNumBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.oxblood, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontFamily: FontFamily.sans, fontSize: 12, fontWeight: '800', color: '#fff' },
  stepDash: { flex: 1, width: 1, backgroundColor: 'rgba(63,3,11,0.1)', marginVertical: 4 },
  stepRight: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingBottom: 16 },
  stepIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(63,3,11,0.05)', alignItems: 'center', justifyContent: 'center' },
  stepText: { flex: 1 },
  stepTitle: { fontFamily: FontFamily.sans, fontSize: 14, fontWeight: '700', color: Colors.ink, marginTop: 10 },
  stepDesc: { fontFamily: FontFamily.sansMedium, fontSize: 12, color: 'rgba(63,3,11,0.5)', lineHeight: 18, marginTop: 4 },

  // Convert
  convertGrid: { flexDirection: 'row', gap: 10 },
  convertCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.06)',
    minHeight: 110,
    justifyContent: 'center',
    gap: 2,
    ...Shadow.card,
  },
  convertCardHL: { backgroundColor: Colors.oxblood, borderColor: Colors.oxblood },
  convertCardDim: { opacity: 0.45 },
  convertHL: { position: 'absolute', top: 0, right: 0, backgroundColor: Colors.gold, borderBottomLeftRadius: 10, borderTopRightRadius: 17, paddingHorizontal: 8, paddingVertical: 3 },
  convertHLText: { fontFamily: FontFamily.sans, fontSize: 7, fontWeight: '800', color: '#1a0204', letterSpacing: 0.5 },
  convertPts: { fontFamily: FontFamily.sans, fontSize: 13, fontWeight: '800', color: Colors.oxblood },
  convertPtsHL: { color: 'rgba(232,216,204,0.7)' },
  convertArrow: { fontFamily: FontFamily.sans, fontSize: 16, color: Colors.roseDeep },
  convertArrowHL: { color: 'rgba(232,216,204,0.5)' },
  convertRupees: { fontFamily: FontFamily.sans, fontSize: 22, fontWeight: '900', color: Colors.oxblood },
  convertRupeesHL: { color: Colors.gold },
  convertLbl: { fontFamily: FontFamily.sansMedium, fontSize: 10, color: 'rgba(63,3,11,0.4)' },
  convertLblHL: { color: 'rgba(232,216,204,0.45)' },

  // Empty
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
    ...Shadow.card,
  },
  emptyTitle: { fontFamily: FontFamily.sans, fontSize: 16, fontWeight: '700', color: Colors.ink, marginTop: 8 },
  emptyDesc: { fontFamily: FontFamily.sansMedium, fontSize: 13, color: 'rgba(63,3,11,0.45)', textAlign: 'center', lineHeight: 20 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.oxblood, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 22, marginTop: 8 },
  emptyBtnText: { fontFamily: FontFamily.sans, fontSize: 13, fontWeight: '700', color: '#fff' },

  // History
  historyCard: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', ...Shadow.card },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  histRowBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.06)' },
  histAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(63,3,11,0.06)', alignItems: 'center', justifyContent: 'center' },
  histAvatarLetter: { fontFamily: FontFamily.sans, fontSize: 16, fontWeight: '800', color: Colors.oxblood },
  histMeta: { flex: 1 },
  histNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  histName: { fontFamily: FontFamily.sans, fontSize: 14, fontWeight: '700', color: Colors.ink },
  histDate: { fontFamily: FontFamily.sansMedium, fontSize: 11, color: 'rgba(63,3,11,0.4)', marginTop: 2 },
  histRewards: { alignItems: 'flex-end', gap: 2 },
  histPts: { fontFamily: FontFamily.sans, fontSize: 12, fontWeight: '700', color: Colors.roseDeep },
  histRupees: { fontFamily: FontFamily.sans, fontSize: 11, fontWeight: '700', color: '#2a7a5a' },
  pendingBadge: { backgroundColor: '#fff3cd', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  pendingText: { fontFamily: FontFamily.sans, fontSize: 8, fontWeight: '700', color: '#856404', textTransform: 'uppercase' },
  dimText: { color: 'rgba(63,3,11,0.3)' },
});
