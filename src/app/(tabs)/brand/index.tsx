import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { useUIStore } from '@/store/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CampaignCardProps {
  title: string;
  tone: 'rose' | 'ox';
  creators: number;
  reach: string;
  spent: number;
  total: number;
}

function CampaignCard({ title, tone, creators, reach, spent, total }: CampaignCardProps) {
  const percentage = Math.round((spent / total) * 100);
  return (
    <View style={styles.campaignCard}>
      <View style={styles.campaignHeader}>
        <PlaceholderImage tone={tone} height={48} width={48} borderRadius={12} />
        <View style={styles.campaignInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.campaignTitle}>{title}</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>
          <Text style={styles.campaignMeta}>
            <Text style={{ fontWeight: '700', color: Colors.oxblood }}>{creators}</Text> creators   Reach: <Text style={{ fontWeight: '700', color: Colors.oxblood }}>{reach}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.campaignProgress}>
        <View style={styles.progressTextRow}>
          <Text style={styles.progressBudget}>
            ₹{spent.toLocaleString()} of ₹{total.toLocaleString()}
          </Text>
          <Text style={styles.progressPercent}>{percentage}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
        </View>
      </View>
    </View>
  );
}

export default function BrandHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showModal = useUIStore((s) => s.showModal);

  // Mock State for Review Submissions
  const [reviews, setReviews] = useState([
    { id: '1', name: 'Muskan', campaign: 'Summer Glow Serum', type: 'Reel', length: '28s', tone: 'ox' as const },
    { id: '2', name: 'Kai Rao', campaign: 'Heritage Chronograph', type: 'Post', length: 'carousel', tone: 'rose' as const },
    { id: '3', name: 'Léa Fontaine', campaign: 'Summer Glow Serum', type: 'Story', length: '3 frames', tone: 'ox' as const }
  ]);

  const handleAcceptReview = (name: string, id: string) => {
    showModal({
      title: 'Approve Deliverable',
      message: `Are you sure you want to approve the submission from ${name}? This will release the payout.`,
      actions: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Pay',
          onPress: () => {
            setReviews((prev) => prev.filter((r) => r.id !== id));
            showModal({
              title: 'Success',
              message: `Successfully approved and processed payment for ${name}!`,
            });
          }
        }
      ]
    });
  };

  const handleDeclineReview = (name: string, id: string) => {
    showModal({
      title: 'Request Revision',
      message: `Are you sure you want to decline this submission from ${name}? You can ask them to revise it.`,
      actions: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Revision',
          style: 'destructive',
          onPress: () => {
            setReviews((prev) => prev.filter((r) => r.id !== id));
            showModal({
              title: 'Declined',
              message: `Notified ${name} to request revisions.`,
            });
          }
        }
      ]
    });
  };

  const handleNewCampaign = () => {
    showModal({
      title: 'New Campaign',
      message: 'Campaign creation flow is under construction. Please use our web manager dashboard to finalize brand settings.',
    });
  };

  return (
    <ScrollView
      style={styles.root}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 130 }}
      bounces={false}
    >
      {/* Top Banner (Dark Oxblood) */}
      <View style={[styles.topBanner, { paddingTop: insets.top + 10 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandProfile}>
            <View style={styles.brandAvatar}>
              <Text style={styles.avatarLetter}>R</Text>
            </View>
            <View style={styles.brandTitleWrap}>
              <Text style={styles.headerSubtitle}>BRAND DASHBOARD</Text>
              <Text style={styles.headerTitle}>Magic Webs</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionBtn} activeOpacity={0.8} onPress={() => router.push('/(tabs)/profile')}>
              <Icon name="chat" size={18} color={Colors.cream} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionBtn} activeOpacity={0.8} onPress={() => router.push('/(tabs)/profile')}>
              <Icon name="bell" size={18} color={Colors.cream} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reach Card */}
        <View style={styles.reachCard}>
          <Text style={styles.reachCardSub}>TOTAL REACH THIS MONTH</Text>
          <Text style={styles.reachCardValue}>48L+</Text>

          <View style={styles.reachStatsRow}>
            <View style={styles.reachStatItem}>
              <Icon name="briefcase" size={14} color={Colors.roseSoft} />
              <Text style={styles.reachStatText}>
                <Text style={{ fontWeight: '800', color: Colors.cream }}>3</Text> Active
              </Text>
            </View>
            <View style={styles.reachStatItem}>
              <Icon name="users" size={14} color={Colors.roseSoft} />
              <Text style={styles.reachStatText}>
                <Text style={{ fontWeight: '800', color: Colors.cream }}>23</Text> Creators
              </Text>
            </View>
            <View style={styles.reachStatItem}>
              <Icon name="clock" size={14} color={Colors.roseSoft} />
              <Text style={styles.reachStatText}>
                <Text style={{ fontWeight: '800', color: Colors.cream }}>3</Text> Pending
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Main Body (Cream Lite) */}
      <View style={styles.body}>
        {/* Actions Grid */}
        <View style={styles.actionGrid}>
          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[styles.gridBtn, { backgroundColor: Colors.oxbloodDeep }]}
              activeOpacity={0.9}
              onPress={handleNewCampaign}
            >
              <Icon name="plus" size={18} color={Colors.cream} />
              <Text style={[styles.gridBtnText, { color: Colors.cream }]}>New campaign</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gridBtn, { backgroundColor: Colors.roseDeep }]}
              activeOpacity={0.9}
              onPress={() => router.push('/(tabs)/marketplace')}
            >
              <Icon name="users" size={18} color={Colors.cream} />
              <Text style={[styles.gridBtnText, { color: Colors.cream }]}>Find creators</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[styles.gridBtn, styles.gridBtnLight]}
              activeOpacity={0.85}
              onPress={() => router.push('/insights')}
            >
              <Icon name="chart" size={18} color={Colors.oxblood} />
              <Text style={[styles.gridBtnText, { color: Colors.oxblood }]}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gridBtn, styles.gridBtnLight]}
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/arena')}
            >
              <Icon name="trophy" size={18} color={Colors.oxblood} />
              <Text style={[styles.gridBtnText, { color: Colors.oxblood }]}>My contests</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Campaigns Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Campaigns</Text>
            <TouchableOpacity onPress={handleNewCampaign} activeOpacity={0.8}>
              <Text style={styles.newCampaignText}>+ New</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.campaignList}>
            <CampaignCard
              title="Summer Glow Serum"
              tone="rose"
              creators={2}
              reach="2.4M"
              spent={360000}
              total={480000}
            />
            <CampaignCard
              title="Heritage Chronograph"
              tone="ox"
              creators={2}
              reach="1.1M"
              spent={240000}
              total={360000}
            />
            <CampaignCard
              title="Glass-Skin Routine"
              tone="rose"
              creators={0}
              reach="0"
              spent={0}
              total={336000}
            />
          </View>
        </View>

        {/* Pending Review Section */}
        {reviews.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending review</Text>
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{reviews.length}</Text>
              </View>
            </View>

            <View style={styles.reviewList}>
              {reviews.map((rev) => (
                <View key={rev.id} style={styles.reviewCard}>
                  <PlaceholderImage tone={rev.tone} height={40} width={40} borderRadius={10} />
                  <View style={styles.reviewContent}>
                    <Text style={styles.reviewName}>{rev.name}</Text>
                    <Text style={styles.reviewInfo} numberOfLines={1}>
                      {rev.campaign} · {rev.type} · {rev.length}
                    </Text>
                  </View>
                  <View style={styles.reviewActions}>
                    <TouchableOpacity
                      style={[styles.reviewActionBtn, styles.acceptBtn]}
                      activeOpacity={0.8}
                      onPress={() => handleAcceptReview(rev.name, rev.id)}
                    >
                      <Icon name="check" size={16} color={Colors.green} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reviewActionBtn, styles.declineBtn]}
                      activeOpacity={0.8}
                      onPress={() => handleDeclineReview(rev.name, rev.id)}
                    >
                      <Icon name="x" size={16} color={Colors.rose} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Suggested Creators Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suggested creators</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/marketplace')} activeOpacity={0.8}>
              <Text style={styles.browseAllText}>Browse all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedScrollContent}
          >
            {[
              { id: 'mira', name: 'Muskan', tone: 'rose' as const, followers: '184k', engagement: '6.2%', niche: 'Beauty' },
              { id: 'kai', name: 'Kai Rao', tone: 'ox' as const, followers: '96k', engagement: '7.8%', niche: 'Tech' },
              { id: 'lea', name: 'Léa Fontaine', tone: 'rose' as const, followers: '218k', engagement: '5.4%', niche: 'Fashion' }
            ].map((creator) => (
              <View key={creator.id} style={styles.creatorCard}>
                <View style={styles.creatorAvatarWrap}>
                  <PlaceholderImage tone={creator.tone} height={60} width={60} borderRadius={30} />
                </View>
                <Text style={styles.creatorName}>{creator.name}</Text>
                <Text style={styles.creatorStats}>
                  {creator.followers}  <Text style={styles.creatorEngText}>{creator.engagement}</Text>
                </Text>
                <View style={styles.nichePill}>
                  <Text style={styles.nichePillText}>{creator.niche}</Text>
                </View>
                <TouchableOpacity
                  style={styles.inviteBtn}
                  activeOpacity={0.85}
                  onPress={() => router.push({
                    pathname: '/(tabs)/marketplace',
                    params: { inviteCreator: creator.name, followers: creator.followers, eng: creator.engagement, tone: creator.tone }
                  })}
                >
                  <Text style={styles.inviteBtnText}>Invite</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  topBanner: {
    backgroundColor: Colors.oxbloodDeep,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  brandProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(232,216,204,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.cream,
  },
  avatarLetter: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    color: Colors.cream,
  },
  brandTitleWrap: {
    justifyContent: 'center',
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
    marginTop: -2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reachCard: {
    backgroundColor: 'rgba(232, 216, 204, 0.06)',
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(232, 216, 204, 0.12)',
  },
  reachCardSub: {
    fontFamily: FontFamily.sans,
    fontSize: 10.5,
    color: Colors.roseSoft,
    letterSpacing: 0.8,
  },
  reachCardValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 38,
    color: Colors.cream,
    marginVertical: 4,
  },
  reachStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
  },
  reachStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reachStatText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.roseSoft,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  actionGrid: {
    gap: 12,
    marginBottom: 28,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadow.card,
  },
  gridBtnLight: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.07)',
  },
  gridBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 13.5,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  newCampaignText: {
    fontFamily: FontFamily.sans,
    fontSize: 12.5,
    color: Colors.roseDeep,
  },
  browseAllText: {
    fontFamily: FontFamily.sans,
    fontSize: 12.5,
    color: Colors.roseDeep,
  },
  campaignList: {
    gap: 14,
  },
  campaignCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  campaignHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  campaignInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  campaignTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    color: Colors.oxblood,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  activeBadge: {
    backgroundColor: 'rgba(42, 122, 90, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeText: {
    fontFamily: FontFamily.sans,
    fontSize: 9.5,
    color: Colors.green,
    fontWeight: '800',
  },
  campaignMeta: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.5)',
    marginTop: 4,
  },
  campaignProgress: {
    marginTop: 14,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBudget: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.5)',
  },
  progressPercent: {
    fontFamily: FontFamily.sans,
    fontSize: 11.5,
    color: Colors.oxblood,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(63, 3, 11, 0.06)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.roseDeep,
    borderRadius: 3,
  },
  badgeCount: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.roseDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  badgeCountText: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.white,
    fontWeight: '800',
  },
  reviewList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  reviewContent: {
    flex: 1,
  },
  reviewName: {
    fontFamily: FontFamily.sans,
    fontSize: 14.5,
    color: Colors.oxblood,
  },
  reviewInfo: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.5)',
    marginTop: 2,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  acceptBtn: {
    backgroundColor: 'rgba(42, 122, 90, 0.05)',
    borderColor: 'rgba(42, 122, 90, 0.2)',
  },
  declineBtn: {
    backgroundColor: 'rgba(180, 106, 116, 0.05)',
    borderColor: 'rgba(180, 106, 116, 0.2)',
  },
  suggestedScrollContent: {
    gap: 14,
    paddingRight: 20,
  },
  creatorCard: {
    width: 130,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 14,
    alignItems: 'center',
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  creatorAvatarWrap: {
    marginBottom: 8,
  },
  creatorName: {
    fontFamily: FontFamily.sans,
    fontSize: 13.5,
    color: Colors.oxblood,
    textAlign: 'center',
  },
  creatorStats: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10.5,
    color: 'rgba(63, 3, 11, 0.45)',
    marginTop: 2,
    textAlign: 'center',
  },
  creatorEngText: {
    color: Colors.green,
    fontWeight: '700',
  },
  nichePill: {
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 8,
  },
  nichePillText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9.5,
    color: Colors.oxblood,
  },
  inviteBtn: {
    backgroundColor: Colors.oxbloodDeep,
    borderRadius: Radius.full,
    width: '100%',
    paddingVertical: 7,
    alignItems: 'center',
    marginTop: 12,
  },
  inviteBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.cream,
  },
});
