import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useProfilesStore } from '@/store/profiles';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BrandAnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeProfileId = useProfilesStore((s) => s.activeProfileId);

  // Fetch brand dashboard from backend via TanStack Query
  const { data: brandDashboardData, isLoading: loadingDashboard } = useQuery<any>({
    queryKey: ['brandDashboard', activeProfileId],
    queryFn: () => api.brands.dashboard(activeProfileId).catch(() => null),
    enabled: !!activeProfileId,
  });
  const brandDashboard = brandDashboardData as any;

  // Fetch campaigns list from backend
  const { data: campaignsListData, isLoading: loadingCampaigns } = useQuery<any>({
    queryKey: ['brandCampaigns', activeProfileId],
    queryFn: () => api.campaigns.list().catch(() => []),
    enabled: !!activeProfileId,
  });
  const campaignsList = (campaignsListData ?? []) as any[];

  const isLoading = loadingDashboard || loadingCampaigns;

  // Format Reach
  const formatReach = (reach: number) => {
    if (reach >= 1000000) return `${(reach / 1000000).toFixed(1)}M`;
    if (reach >= 1000) return `${(reach / 1000).toFixed(0)}k`;
    return String(reach);
  };

  // Stats computation
  const totalSpend = brandDashboard?.totalSpend ? brandDashboard.totalSpend / 100 : 0;
  const totalReach = brandDashboard?.totalReach || 0;
  const activeCampaigns = brandDashboard?.activeCampaigns || 0;
  const totalApplicants = brandDashboard?.influencerStats?.totalApplicants || 0;
  const totalInvitesSent = brandDashboard?.influencerStats?.totalInvitesSent || 0;

  // Calculate campaign budget metrics for the chart
  const maxBudget = campaignsList.length > 0
    ? Math.max(...campaignsList.map((c: any) => c.budget || 0))
    : 1;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <Icon name="chevron" size={18} color={Colors.ink} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <Skeleton width="95%" height={100} style={{ marginBottom: 16 }} />
          <Skeleton width="95%" height={240} style={{ marginBottom: 16 }} />
          <Skeleton width="95%" height={160} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Grid */}
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Total Spend</Text>
              <Text style={styles.cardValue}>₹{totalSpend.toLocaleString()}</Text>
              <Text style={styles.cardSub}>Paid to creators</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Est. Audience Reach</Text>
              <Text style={styles.cardValue}>{formatReach(totalReach)}</Text>
              <Text style={styles.cardSub}>Across campaigns</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Campaign Status</Text>
              <Text style={styles.cardValue}>{activeCampaigns} Active</Text>
              <Text style={styles.cardSub}>{campaignsList.length} total campaigns</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Creator Response</Text>
              <Text style={styles.cardValue}>{totalApplicants}</Text>
              <Text style={styles.cardSub}>{totalInvitesSent} invitations sent</Text>
            </View>
          </View>

          {/* Campaign Recruitment Funnel */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Campaign Recruitment Funnel</Text>
            <View style={styles.funnelContainer}>
              <View style={styles.funnelStatRow}>
                <View>
                  <Text style={styles.funnelLabel}>Applications Received</Text>
                  <Text style={styles.funnelValue}>{totalApplicants}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.funnelLabel}>Conversion Rate</Text>
                  <Text style={styles.funnelValue}>
                    {totalInvitesSent > 0
                      ? `${Math.round((totalApplicants / totalInvitesSent) * 100)}%`
                      : '100%'}
                  </Text>
                </View>
              </View>
              <View style={styles.funnelBarTrack}>
                <View
                  style={[
                    styles.funnelBarFill,
                    {
                      width: totalInvitesSent > 0
                        ? `${Math.min(100, Math.round((totalApplicants / totalInvitesSent) * 100))}%`
                        : '100%'
                    }
                  ]}
                />
              </View>
              <Text style={styles.funnelSubText}>
                Based on {totalApplicants} creator applications from {totalInvitesSent} active invitations.
              </Text>
            </View>
          </View>

          {/* Budget Breakdown Chart */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Campaign Budgets Breakdown</Text>
            {campaignsList.length > 0 ? (
              <View style={{ gap: 14, marginTop: 10 }}>
                {campaignsList.map((c: any) => {
                  const budgetInRupees = (c.budget || 0) / 100;
                  const ratio = Math.max(0.05, (c.budget || 0) / maxBudget);
                  return (
                    <View key={c.id} style={styles.chartRow}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={styles.chartCampaignName} numberOfLines={1}>{c.title || 'Campaign'}</Text>
                        <View style={styles.chartBarTrack}>
                          <GradientView
                            variant="oxblood"
                            style={StyleSheet.flatten([styles.chartBarFill, { width: `${ratio * 100}%` }]) as ViewStyle}
                          />
                        </View>
                      </View>
                      <Text style={styles.chartCampaignValue}>₹{budgetInRupees.toLocaleString()}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptyText}>Create your first campaign to generate insights.</Text>
            )}
          </View>

          {/* Expected Reach Column Chart */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Expected Audience Reach by Campaign</Text>
            {campaignsList.length > 0 ? (
              <View style={styles.vChartContainer}>
                <View style={styles.vChartBarsRow}>
                  {campaignsList.map((c: any) => {
                    const budgetVal = c.budget || 0;
                    const reach = c.expectedReach || (budgetVal ? Math.round(budgetVal / 100 * 2.5) : 50000);
                    const maxReach = Math.max(...campaignsList.map((cam: any) => cam.expectedReach || (cam.budget ? Math.round(cam.budget / 100 * 2.5) : 50000)), 1);
                    const ratio = Math.max(0.1, reach / maxReach);

                    return (
                      <View key={c.id} style={styles.vChartCol}>
                        <View style={styles.vChartBarContainer}>
                          <Text style={styles.vChartBarVal}>{formatReach(reach)}</Text>
                          <View style={[styles.vChartBar, { height: `${ratio * 100}%` }]}>
                            <GradientView variant="oxblood" style={StyleSheet.flatten([StyleSheet.absoluteFill]) as ViewStyle} />
                          </View>
                        </View>
                        <Text style={styles.vChartLabel} numberOfLines={1}>
                          {(c.title || 'Campaign').substring(0, 6)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>No data available for reach chart.</Text>
            )}
          </View>

          {/* Detailed Performance List */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Individual Campaign Performance</Text>
            {campaignsList.length > 0 ? (
              <View style={{ gap: 12, marginTop: 10 }}>
                {campaignsList.map((c: any) => {
                  const statusColor = c.status === 'active' ? '#2a7a5a' : c.status === 'completed' ? '#7f7f7f' : '#c9961a';
                  return (
                    <View key={c.id} style={styles.campaignListCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.campaignTitle}>{c.title || 'Campaign'}</Text>
                        <Text style={styles.campaignMeta}>
                          {(c.campaignType || '').toUpperCase()} · {c.category || 'General'}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {(c.status || '').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptyText}>No campaign data available.</Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fcfaf7' },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#fcfaf7',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.06)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.07)',
    ...Shadow.card,
  },
  headerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    color: Colors.ink,
    fontWeight: '700',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.03)',
    ...Shadow.card,
    flexGrow: 1,
  },
  cardLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: 'rgba(63,3,11,0.5)',
    fontWeight: '600',
  },
  cardValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.ink,
    marginTop: 6,
  },
  cardSub: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10,
    color: 'rgba(63,3,11,0.4)',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.03)',
    ...Shadow.card,
  },
  sectionTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 10,
  },
  emptyText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(63,3,11,0.4)',
    textAlign: 'center',
    marginVertical: 20,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartCampaignName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.ink,
    marginBottom: 4,
    fontWeight: '600',
  },
  chartBarTrack: {
    height: 6,
    backgroundColor: 'rgba(63,3,11,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  chartCampaignValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  campaignListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.06)',
  },
  campaignTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.ink,
  },
  campaignMeta: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(63,3,11,0.45)',
    marginTop: 2,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9.5,
    fontWeight: '700',
  },
  vChartContainer: {
    marginTop: 12,
    height: 130,
    justifyContent: 'flex-end',
  },
  vChartBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 100,
  },
  vChartCol: {
    alignItems: 'center',
    flex: 1,
  },
  vChartBarContainer: {
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  vChartBarVal: {
    fontSize: 8.5,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '700',
    color: Colors.oxblood,
    marginBottom: 4,
  },
  vChartBar: {
    width: 18,
    borderRadius: 4,
    overflow: 'hidden',
  },
  vChartLabel: {
    fontSize: 9.5,
    fontFamily: FontFamily.sansRegular,
    color: 'rgba(63,3,11,0.5)',
    marginTop: 8,
    fontWeight: '600',
  },
  funnelContainer: {
    paddingVertical: 4,
  },
  funnelStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  funnelLabel: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: 'rgba(63,3,11,0.5)',
    fontWeight: '600',
  },
  funnelValue: {
    fontSize: 16,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '700',
    color: Colors.ink,
    marginTop: 2,
  },
  funnelBarTrack: {
    height: 8,
    backgroundColor: 'rgba(63,3,11,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  funnelBarFill: {
    height: '100%',
    backgroundColor: '#2a7a5a',
    borderRadius: 4,
  },
  funnelSubText: {
    fontSize: 10.5,
    fontFamily: FontFamily.sansRegular,
    color: 'rgba(63,3,11,0.4)',
    lineHeight: 14,
  },
});
