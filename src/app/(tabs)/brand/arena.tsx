import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { useUIStore } from '@/store/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BrandArenaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showModal = useUIStore((s) => s.showModal);

  const [contests, setContests] = useState([
    { id: '1', title: '#SummerGlow', prize: '₹10,00,000', entries: 1842, daysLeft: 6, submissionsPending: 12, tone: 'rose' as const },
    { id: '2', title: '#HeritageStory', prize: '₹3,60,000', entries: 420, daysLeft: 14, submissionsPending: 4, tone: 'ox' as const },
  ]);

  const handleLaunchContest = () => {
    showModal({
      title: 'New Contest',
      message: 'Create Contest wizard is opening. Fill in the prize pool, terms, and hashtags to proceed. Contests are subject to review by the RichyReach safety board.',
    });
  };

  const handleReviewSubmissions = (contestTitle: string) => {
    showModal({
      title: 'Submissions',
      message: `Opening review dashboard for contest ${contestTitle}. You can rank entries and approve payouts here.`,
    });
  };

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

        <TouchableOpacity style={styles.launchBtn} activeOpacity={0.8} onPress={handleLaunchContest}>
          <Icon name="plus" size={14} color={Colors.oxblood} />
          <Text style={styles.launchBtnText}>Launch</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        style={styles.body}
      >
        {/* Quick Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Prize Budget</Text>
            <Text style={styles.statValue}>₹13.6L</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Entries</Text>
            <Text style={styles.statValue}>2,262</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Contests</Text>
            <Text style={styles.statValue}>2</Text>
          </View>
        </View>

        {/* Active Contests List */}
        <Text style={styles.sectionTitle}>Your Contests</Text>

        <View style={styles.contestList}>
          {contests.map((c) => (
            <View key={c.id} style={styles.contestCard}>
              <View style={styles.contestCardHeader}>
                <PlaceholderImage tone={c.tone} height={50} width={50} borderRadius={12} />
                <View style={styles.contestMeta}>
                  <Text style={styles.contestTitleText}>{c.title}</Text>
                  <Text style={styles.contestSubtext}>
                    {c.daysLeft} days left · {c.entries} submissions
                  </Text>
                </View>
                <View style={styles.prizePill}>
                  <Text style={styles.prizePillText}>{c.prize}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.contestCardFooter}>
                <View style={styles.pendingIndicator}>
                  <View style={styles.dot} />
                  <Text style={styles.pendingText}>
                    {c.submissionsPending} entries need review
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.reviewBtn}
                  activeOpacity={0.8}
                  onPress={() => handleReviewSubmissions(c.title)}
                >
                  <Text style={styles.reviewBtnText}>Manage</Text>
                  <Icon name="arrow" size={13} color={Colors.cream} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Top Performers Section */}
        <Text style={styles.sectionTitle}>Top Candidates in Contests</Text>

        <View style={styles.rankingList}>
          {[
            { rank: 1, name: 'Muskan', handle: '@muskan.creates', score: '9.4/10', tone: 'rose' as const },
            { rank: 2, name: 'Kai Rao', handle: '@kai.shoots', score: '9.1/10', tone: 'ox' as const },
            { rank: 3, name: 'Léa Fontaine', handle: '@lea.fr', score: '8.8/10', tone: 'rose' as const }
          ].map((u) => (
            <View key={u.rank} style={styles.rankRow}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankBadgeText}>#{u.rank}</Text>
              </View>
              <PlaceholderImage tone={u.tone} height={34} width={34} borderRadius={17} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.candidateName}>{u.name}</Text>
                <Text style={styles.candidateHandle}>{u.handle}</Text>
              </View>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreBadgeText}>{u.score}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
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
    backgroundColor: 'rgba(180, 106, 116, 0.25)',
  },
  glow2: {
    position: 'absolute',
    bottom: 100,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(141, 71, 80, 0.2)',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
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
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
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
    fontSize: 10,
    color: 'rgba(232, 216, 204, 0.5)',
  },
  statValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    color: Colors.cream,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    color: Colors.cream,
    fontWeight: '700',
    marginBottom: 14,
    marginTop: 8,
  },
  contestList: {
    gap: 14,
    marginBottom: 24,
  },
  contestCard: {
    backgroundColor: 'rgba(232, 216, 204, 0.07)',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(232, 216, 204, 0.15)',
  },
  contestCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contestMeta: {
    flex: 1,
  },
  contestTitleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    color: Colors.cream,
    fontWeight: '700',
  },
  contestSubtext: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(232, 216, 204, 0.5)',
    marginTop: 2,
  },
  prizePill: {
    backgroundColor: Colors.roseDeep,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  prizePillText: {
    fontFamily: FontFamily.sans,
    fontSize: 10.5,
    color: Colors.cream,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(232, 216, 204, 0.15)',
    marginVertical: 12,
  },
  contestCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gold,
  },
  pendingText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.gold,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.oxblood2,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(232, 216, 204, 0.15)',
  },
  reviewBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.cream,
  },
  rankingList: {
    backgroundColor: 'rgba(232, 216, 204, 0.07)',
    borderRadius: Radius.lg,
    padding: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(232, 216, 204, 0.15)',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(232, 216, 204, 0.08)',
  },
  rankBadge: {
    width: 30,
    alignItems: 'center',
  },
  rankBadgeText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: 'rgba(232, 216, 204, 0.5)',
  },
  candidateName: {
    fontFamily: FontFamily.sans,
    fontSize: 13.5,
    color: Colors.cream,
  },
  candidateHandle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: 'rgba(232, 216, 204, 0.5)',
  },
  scoreBadge: {
    backgroundColor: 'rgba(243, 201, 105, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  scoreBadgeText: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.gold,
    fontWeight: '700',
  },
});
