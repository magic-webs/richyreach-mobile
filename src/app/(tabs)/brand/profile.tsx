import { CreateBrandProfileSheet } from '@/components/brand/home/CreateBrandProfileSheet';
import { SwitchBrandProfileSheet } from '@/components/brand/home/SwitchBrandProfileSheet';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Edit, Gift, Wallet, Users, Bell, Lock, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import { useUIStore } from '@/store/ui';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Svg, { Line, Pattern, Rect } from 'react-native-svg';

type SheetType = 'billing' | 'team' | 'security' | 'notifications' | 'support' | 'menu' | 'edit_profile' | 'referral' | null;
type TabType = 'Overview' | 'Campaigns' | 'Creators';

// Stripes Background Pattern
function Stripes({
  id = 'stripes',
  stripeColor = 'rgba(63,3,11,0.06)',
  backgroundColor = 'transparent'
}: {
  id?: string;
  stripeColor?: string;
  backgroundColor?: string;
}) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Pattern
          id={id}
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <Rect width="24" height="24" fill={backgroundColor} />
          <Line x1="0" y1="0" x2="0" y2="24" stroke={stripeColor} strokeWidth="6" />
        </Pattern>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

// Brand Profile Skeleton
function ProfileSkeleton() {
  return (
    <View style={{ flex: 1 }}>
      {/* Cover skeleton */}
      <Skeleton width="100%" height={120} borderRadius={0} />

      {/* Avatar skeleton */}
      <View style={skeletonStyles.avatarWrap}>
        <Skeleton width={86} height={86} borderRadius={22} />
      </View>

      <View style={{ paddingTop: 52, paddingHorizontal: 20 }}>
        {/* Name row */}
        <View style={skeletonStyles.nameRow}>
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width={180} height={24} borderRadius={8} />
            <Skeleton width={120} height={13} borderRadius={6} />
          </View>
          <View style={{ gap: 8 }}>
            <Skeleton width={90} height={32} borderRadius={12} />
            <Skeleton width={90} height={32} borderRadius={12} />
          </View>
        </View>

        {/* Bio */}
        <View style={{ gap: 6, marginTop: 14 }}>
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="85%" />
          <Skeleton variant="text" width="60%" />
        </View>

        {/* Stats card */}
        <View style={[skeletonStyles.statsCard]}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
              <Skeleton width={40} height={22} borderRadius={6} />
              <Skeleton width={52} height={10} borderRadius={4} />
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={skeletonStyles.tabsRow}>
          {[80, 90, 70].map((w, i) => (
            <Skeleton key={i} width={w} height={14} borderRadius={6} />
          ))}
        </View>

        {/* Content rows */}
        <View style={{ gap: 12, marginTop: 16 }}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={skeletonStyles.rowCard}>
              <Skeleton width={44} height={44} borderRadius={12} />
              <View style={{ flex: 1, gap: 6 }}>
                <Skeleton width="70%" height={14} borderRadius={6} />
                <Skeleton width="50%" height={11} borderRadius={4} />
              </View>
              <Skeleton width={60} height={26} borderRadius={10} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  avatarWrap: {
    position: 'absolute',
    left: 20,
    top: 75,
    width: 86,
    height: 86,
    zIndex: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 16,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.03)',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 26,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(63,3,11,0.06)',
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
  },
});

// Campaign Row Component
function CampaignRow({
  title,
  subtitle,
  status,
  id
}: {
  title: string;
  subtitle: string;
  status: 'Active' | 'In review' | 'Closed';
  id: string;
}) {
  const badgeColors = {
    'Active': { bg: '#eaf6f0', text: '#2a7a5a' },
    'In review': { bg: '#fef8e7', text: '#c9961a' },
    'Closed': { bg: '#f2f2f2', text: '#7f7f7f' },
  };
  const colors = badgeColors[status] || badgeColors['Closed'];

  return (
    <View style={styles.campaignCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <View style={styles.campaignIconWrap}>
          <Stripes id={`stripe-camp-${id}`} stripeColor="rgba(63,3,11,0.15)" backgroundColor="rgba(180,106,116,0.25)" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.campaignTitle}>{title}</Text>
          <Text style={styles.campaignSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
        <Text style={[styles.statusText, { color: colors.text }]}>{status}</Text>
      </View>
    </View>
  );
}

// Creator Row Component
function CreatorRow({
  name,
  handle,
  followers,
  tag,
  id
}: {
  name: string;
  handle: string;
  followers: string;
  tag: string;
  id: string;
}) {
  return (
    <View style={styles.campaignCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <View style={styles.creatorAvatarWrap}>
          <Text style={styles.creatorAvatarLetter}>{name.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.campaignTitle}>{name}</Text>
          <Text style={styles.campaignSubtitle}>{handle} · {followers}</Text>
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: 'rgba(180,106,116,0.1)' }]}>
        <Text style={[styles.statusText, { color: Colors.oxblood }]}>{tag}</Text>
      </View>
    </View>
  );
}

export default function BrandProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setRole = useAuthStore((s) => s.setRole);
  const logout = useAuthStore((s) => s.logout);
  const showModal = useUIStore((s) => s.showModal);
  const session = useAuthStore((s) => s.session);
  const loadProfiles = useProfilesStore((s) => s.loadProfiles);
  const activeProfileId = useProfilesStore((s) => s.activeProfileId);
  const queryClient = useQueryClient();

  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Fetch brand profile from backend via TanStack Query
  const { data: profileData, isLoading: loadingProfile } = useQuery<any>({
    queryKey: ['brandProfile', activeProfileId],
    queryFn: () => api.brands.profile(activeProfileId).catch(() => null),
  });
  const profile = profileData as any;

  // Synchronize brand profile to Zustand store
  useEffect(() => {
    if (profile && session?.user?.id) {
      loadProfiles(session.user.id, profile);
    }
  }, [profile, session?.user?.id, loadProfiles]);

  // Fetch brand dashboard from backend via TanStack Query
  const { data: brandDashboardData } = useQuery<any>({
    queryKey: ['brandDashboard', activeProfileId],
    queryFn: () => api.brands.dashboard(activeProfileId).catch(() => null),
    enabled: !!activeProfileId,
  });
  const brandDashboard = brandDashboardData as any;

  // Fetch campaigns from backend via TanStack Query
  const { data: campaignsListData } = useQuery<any>({
    queryKey: ['brandCampaigns', activeProfileId],
    queryFn: () => api.campaigns.list().catch(() => []),
    enabled: !!activeProfileId,
  });
  const campaignsList = (campaignsListData ?? []) as any[];

  // Fetch real applications to list real creators
  const { data: applicationsData = [] } = useQuery<any[]>({
    queryKey: ['brandApplications', activeProfileId],
    queryFn: () => api.brands.applications(undefined, activeProfileId).catch(() => []),
    enabled: !!activeProfileId,
  });

  // Fetch brand wallet balance for billing section
  const { data: walletData } = useQuery<any>({
    queryKey: ['brandWallet', activeProfileId],
    queryFn: () => api.brands.wallet.balance(activeProfileId).catch(() => null),
    enabled: !!activeProfileId,
  });

  const stats = React.useMemo(() => {
    const dash = brandDashboard;
    if (!dash) {
      return {
        campaigns: 0,
        creators: 0,
        spend: '₹0',
        roi: '4.2x'
      };
    }
    const spendRupees = typeof dash.totalSpend === 'number' ? dash.totalSpend / 100 : 0;
    let spendStr = '₹0';
    if (spendRupees >= 100000) spendStr = `₹${(spendRupees / 100000).toFixed(1)}L`;
    else if (spendRupees >= 1000) spendStr = `₹${(spendRupees / 1000).toFixed(0)}k`;
    else spendStr = `₹${spendRupees}`;

    return {
      campaigns: dash.activeCampaigns ?? 0,
      creators: dash.influencerStats?.totalApplicants ?? 0,
      spend: spendStr,
      roi: '4.2x'
    };
  }, [brandDashboard]);

  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [sheet, setSheet] = useState<SheetType>(null);
  const [notifyPrefs, setNotifyPrefs] = useState({
    newApplication: true,
    chatMessages: true,
    budgetSpent: true,
    weeklyDigest: false
  });

  const handleSaveNotify = () => {
    setSheet(null);
    showModal({
      title: 'Preferences Saved',
      message: 'Your notification preferences have been successfully updated.',
    });
  };

  const handleCreatorViewSwitch = () => {
    setRole('influencer');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          activeOpacity={0.8}
          onPress={() => setIsSwitcherOpen(true)}
        >
          <View style={styles.headerLogoSquircle}>
            {profile?.logo ? (
              <Image source={{ uri: profile.logo }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <Stripes id="header-logo" stripeColor="rgba(180, 106, 116, 0.25)" backgroundColor={Colors.oxbloodDeep} />
            )}
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>{profile?.companyName || 'Brand Settings'}</Text>
          <Icon name="chevDown" size={16} color={Colors.ink} />
        </TouchableOpacity>


      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        {loadingProfile ? (
          <View style={{ position: 'relative' }}>
            <ProfileSkeleton />
          </View>
        ) : null}
        {/* Cover with Image */}
        <View style={[styles.coverContainer, loadingProfile && { opacity: 0 }]}>
          <Image
            source={{ uri: 'https://pub-c7a89526fe7541b0a1d6bc2d831710d2.r2.dev/plaform-images/cover-image.png' }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        </View>

        {/* Squircle Avatar Overlapping Cover */}
        <View style={[styles.avatarShadowWrap, loadingProfile && { opacity: 0 }]}>
          <View style={styles.avatarContainer}>
            {profile?.logo ? (
              <Image source={{ uri: profile.logo }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <Stripes id="avatar-stripes" stripeColor="rgba(180, 106, 116, 0.2)" backgroundColor={Colors.oxbloodDeep} />
            )}
          </View>
        </View>

        <View style={[styles.body, loadingProfile && { opacity: 0 }]}>
          {/* Brand details and Switch to Creator view */}
          <View style={styles.brandTitleRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.brandName}>{profile?.companyName || 'Setup Brand Profile'}</Text>
                {profile?.verified && <Icon name="verified" size={18} color={Colors.rose} />}
              </View>
              <Text style={styles.brandHandle}>
                {profile?.category ? `${profile.category} · Brand account` : 'Brand account'}
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={() => setIsEditSheetOpen(true)}
                style={[styles.creatorViewBtn, { borderColor: Colors.rose }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.creatorViewText, { color: Colors.roseDeep }]}>
                  {profile ? 'Edit profile' : 'Setup profile'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.bio}>
            {profile?.description || 'No profile description set up. Setup your profile details to connect with creators.'}
          </Text>

          {/* Wallet Card */}
          <TouchableOpacity
            style={styles.walletCard}
            onPress={() => router.push('/brand/wallet' as any)}
            activeOpacity={0.85}
          >
            <View style={styles.walletLeft}>
              <View style={styles.walletIconBox}>
                <Icon name="wallet" size={18} color={Colors.cream} />
              </View>
              <View>
                <Text style={styles.walletLabel}>Wallet Balance</Text>
                <Text style={styles.walletValue}>
                  ₹{walletData?.balance?.rupees?.toLocaleString('en-IN') ?? '0'}
                </Text>
              </View>
            </View>
            <View style={styles.walletAddBtn}>
              <Text style={styles.walletAddText}>+ Add Money</Text>
            </View>
          </TouchableOpacity>

          {/* Stats Grid */}
          <View style={styles.statsCard}>
            <View style={styles.statCol}>
              <Text style={styles.statValue}>{stats.campaigns}</Text>
              <Text style={styles.statLabel}>Campaigns</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statValue}>{stats.creators}</Text>
              <Text style={styles.statLabel}>Creators</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statValue}>{stats.spend}</Text>
              <Text style={styles.statLabel}>Total spend</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statValue}>{stats.roi}</Text>
              <Text style={styles.statLabel}>Avg. ROI</Text>
            </View>
          </View>

          {/* Tabs header */}
          <View style={styles.tabsRow}>
            {(['Overview', 'Campaigns', 'Creators'] as TabType[]).map((tab) => {
              const active = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={styles.tabBtn}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
                  {active && <View style={styles.tabUnderline} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tabs Content */}
          {activeTab === 'Overview' && (
            <View style={styles.tabContent}>
              <View style={styles.analyticsSummaryCard}>
                <Text style={styles.analyticsSummaryTitle}>Detailed Performance & Spend Analytics</Text>
                <Text style={styles.analyticsSummaryText}>
                  Analyze your total budget spent, expected audience reach, individual campaign metrics, and creator response rate.
                </Text>
                <TouchableOpacity
                  style={styles.viewAnalyticsBtn}
                  onPress={() => router.push('/brand/analytics')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.viewAnalyticsBtnText}>Open Analytics Dashboard</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'Campaigns' && (
            <View style={styles.tabContent}>
              {campaignsList.length > 0 ? (
                campaignsList.map((c: any) => {
                  const budgetVal = typeof c.budget === 'number' ? c.budget / 100 : 0;
                  let budgetStr = '';
                  if (budgetVal >= 100000) budgetStr = `${(budgetVal / 100000).toFixed(1)}L`;
                  else if (budgetVal >= 1000) budgetStr = `${(budgetVal / 1000).toFixed(0)}k`;
                  else budgetStr = String(budgetVal);

                  const crs = (c.creatorsCount ?? c.applicants) || 0;
                  const statusLabel = c.status === 'active' ? 'Active' : c.status === 'completed' ? 'Closed' : 'In review';
                  return (
                    <CampaignRow
                      key={c.id}
                      id={c.id}
                      title={c.title}
                      subtitle={`${crs} creators · ₹${budgetStr}`}
                      status={statusLabel}
                    />
                  );
                })
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No campaigns created yet.</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'Creators' && (
            <View style={styles.tabContent}>
              {applicationsData.length > 0 ? (
                applicationsData.map((app: any) => {
                  const followersCount = app.followers || 'N/A';
                  return (
                    <CreatorRow
                      key={app.id}
                      id={app.id}
                      name={app.name || app.instagramHandle || 'Creator'}
                      handle={`@${app.instagramHandle || 'creator'}`}
                      followers={followersCount}
                      tag={app.status.toUpperCase()}
                    />
                  );
                })
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No creators found.</Text>
                </View>
              )}
            </View>
          )}

          {/* Settings Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>Brand Settings</Text>
            <View style={{ gap: 4 }}>
              {[
                { icon: Edit, label: 'Edit brand profile', value: '', key: 'edit_profile' },
                { icon: Gift, label: 'Refer & earn', value: '₹100 + Points', key: 'referral' },
                { icon: Wallet, label: 'Invoices & billing', value: walletData?.balance?.rupees != null ? `₹${walletData.balance.rupees.toLocaleString('en-IN')}` : '', key: 'billing' },
                { icon: Users, label: 'Team management', value: '3 members', key: 'team' },
                { icon: Bell, label: 'Notifications', value: '', key: 'notifications' },
                { icon: Lock, label: 'Privacy & security', value: '', key: 'security' },
                { icon: HelpCircle, label: 'Help & support', value: '', key: 'support' },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      if (item.key === 'edit_profile') {
                        setIsEditSheetOpen(true);
                      } else if (item.key === 'referral') {
                        router.push('/brand/referral');
                      } else {
                        setSheet(item.key as SheetType);
                      }
                    }}
                    activeOpacity={0.8}
                    style={styles.menuItemRow}
                  >
                    <View style={styles.menuItemLeft}>
                      <IconComponent size={16} color={Colors.oxblood} strokeWidth={2} />
                      <Text style={styles.menuItemText}>{item.label}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {item.value ? <Text style={styles.menuItemValue}>{item.value}</Text> : null}
                      <ChevronRight size={14} color="rgba(63,3,11,0.3)" strokeWidth={2} />
                    </View>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                onPress={async () => {
                  await logout();
                  router.replace('/(auth)');
                }}
                style={styles.menuLogoutBtn}
                activeOpacity={0.8}
              >
                <LogOut size={16} color="#FF3B30" strokeWidth={2} />
                <Text style={styles.menuLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>


      {/* Individual settings bottom sheets */}
      {sheet === 'billing' && (
        <BottomSheet visible={true} title="Invoices & billing" icon="wallet" onClose={() => setSheet(null)}>
          <View style={{ gap: 14 }}>
            <View style={styles.sheetInfoCard}>
              <Text style={styles.sheetInfoTitle}>Brand Wallet</Text>
              <Text style={styles.sheetInfoText}>
                Balance: {walletData ? `₹${walletData.balance?.rupees?.toLocaleString('en-IN') ?? '0'}` : '₹0'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.sheetInfoCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
              onPress={() => { setSheet(null); router.push('/brand/wallet' as any); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.sheetInfoTitle, { marginBottom: 0 }]}>Open Wallet</Text>
              <Text style={{ fontSize: 16, color: Colors.oxblood }}>→</Text>
            </TouchableOpacity>
            <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
              {walletData?.transactions && walletData.transactions.length > 0 ? (
                walletData.transactions.slice(0, 5).map((tx: any) => (
                  <View key={tx.id} style={styles.invoiceItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.invoiceTitle}>{tx.description || tx.transactionType}</Text>
                      <Text style={styles.invoiceDate}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <Text style={[styles.invoiceAmount, { color: tx.type === 'credit' ? '#2a7a5a' : Colors.oxblood }]}>
                      {tx.type === 'credit' ? '+' : '-'}₹{(tx.amount / 100).toLocaleString('en-IN')}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{ textAlign: 'center', color: 'rgba(63,3,11,0.45)', marginVertical: 24, fontSize: 13.5 }}>
                  No transactions yet. Add money to get started.
                </Text>
              )}
            </ScrollView>
          </View>
        </BottomSheet>
      )}

      {sheet === 'team' && (
        <BottomSheet visible={true} title="Team management" icon="users" onClose={() => setSheet(null)}>
          <View style={{ gap: 14 }}>
            <View style={styles.sheetInfoCard}>
              <Text style={styles.sheetInfoTitle}>Portal Authentication Required</Text>
              <Text style={styles.sheetInfoText}>
                Multi-user organization access and role delegation are managed through the web portal interface dashboard.
              </Text>
            </View>
            <View style={styles.memberRow}>
              <View style={styles.memberAvatar}>
                <Text style={{ fontWeight: '700', color: Colors.oxblood }}>{session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : 'B'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{session?.user?.name || 'Owner'}</Text>
                <Text style={styles.memberRole}>Primary Owner · Active Account</Text>
              </View>
            </View>
          </View>
        </BottomSheet>
      )}

      {sheet === 'notifications' && (
        <BottomSheet visible={true} title="Notifications" icon="bell" onClose={() => setSheet(null)}>
          <View style={{ gap: 14 }}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>New applications</Text>
                <Text style={styles.toggleSub}>When a creator applies to your campaign</Text>
              </View>
              <Switch
                value={notifyPrefs.newApplication}
                onValueChange={(v) => setNotifyPrefs(p => ({ ...p, newApplication: v }))}
                trackColor={{ false: 'rgba(63,3,11,0.18)', true: Colors.oxblood }}
              />
            </View>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Direct messages</Text>
                <Text style={styles.toggleSub}>Real-time chats from creators</Text>
              </View>
              <Switch
                value={notifyPrefs.chatMessages}
                onValueChange={(v) => setNotifyPrefs(p => ({ ...p, chatMessages: v }))}
                trackColor={{ false: 'rgba(63,3,11,0.18)', true: Colors.oxblood }}
              />
            </View>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Budget alerts</Text>
                <Text style={styles.toggleSub}>Notify when campaign budgets exceed 80%</Text>
              </View>
              <Switch
                value={notifyPrefs.budgetSpent}
                onValueChange={(v) => setNotifyPrefs(p => ({ ...p, budgetSpent: v }))}
                trackColor={{ false: 'rgba(63,3,11,0.18)', true: Colors.oxblood }}
              />
            </View>
            <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleSaveNotify}>
              <Text style={styles.saveBtnText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      )}

      {sheet === 'security' && (
        <BottomSheet visible={true} title="Privacy & security" icon="lock" onClose={() => setSheet(null)}>
          <Text style={{ color: Colors.ink, fontSize: 14 }}>Security, password management, and MFA configurations are accessible from the web portal dashboard.</Text>
        </BottomSheet>
      )}

      {sheet === 'support' && (
        <BottomSheet visible={true} title="Help & support" icon="settings" onClose={() => setSheet(null)}>
          <Text style={{ color: Colors.ink, fontSize: 14, lineHeight: 20 }}>
            For help with your Brand Account, invoice inquiries, or resolving disputes with creators, please contact our brand assistance hotline at brandsupport@richyreach.com.
          </Text>
        </BottomSheet>
      )}

      <CreateBrandProfileSheet
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['brandProfile'] });
        }}
        initialData={profile}
      />

      <SwitchBrandProfileSheet
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        onSwitchSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['brandProfile'] });
          queryClient.invalidateQueries({ queryKey: ['brandDashboard', activeProfileId] });
          queryClient.invalidateQueries({ queryKey: ['brandCampaigns', activeProfileId] });
        }}
        onAddNewProfile={() => setIsEditSheetOpen(true)}
      />
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
    borderBottomColor: 'rgba(63,3,11,0.06)'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerLogoSquircle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.oxbloodDeep,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)'
  },
  headerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    color: Colors.ink,
    fontWeight: '700'
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.07)',
    ...Shadow.card
  },

  coverContainer: {
    height: 120,
    backgroundColor: 'rgba(180, 106, 116, 0.12)',
    position: 'relative',
    overflow: 'hidden'
  },
  sparklesContainer: {
    position: 'absolute',
    right: 20,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  avatarShadowWrap: {
    position: 'absolute',
    left: 20,
    top: 75,
    width: 86,
    height: 86,
    shadowColor: Colors.oxblood,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 10
  },
  avatarContainer: {
    width: 86,
    height: 86,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: Colors.oxbloodDeep,
    overflow: 'hidden',
  },

  body: { paddingTop: 52, paddingHorizontal: 20 },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  brandName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.ink
  },
  brandHandle: {
    fontSize: 12,
    color: Colors.rose,
    fontWeight: '600',
    marginTop: 4
  },
  creatorViewBtn: {
    borderWidth: 1.2,
    borderColor: Colors.oxblood,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start'
  },
  creatorViewText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.oxblood
  },
  bio: {
    marginTop: 12,
    fontSize: 13.5,
    lineHeight: 20,
    color: 'rgba(42,2,7,0.6)',
    fontFamily: FontFamily.sansRegular
  },

  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.oxblood,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginTop: 20,
    ...Shadow.card,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(232,216,204,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(232,216,204,0.6)',
    fontWeight: '600',
    marginBottom: 2,
  },
  walletValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  walletAddBtn: {
    backgroundColor: 'rgba(232,216,204,0.18)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(232,216,204,0.28)',
  },
  walletAddText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.cream,
  },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 16,
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.03)',
    ...Shadow.card
  },
  statCol: {
    flex: 1,
    alignItems: 'center'
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(63,3,11,0.06)'
  },
  statValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 19,
    fontWeight: '700',
    color: Colors.ink
  },
  statLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10,
    color: 'rgba(63,3,11,0.45)',
    fontWeight: '600',
    marginTop: 4
  },

  tabsRow: {
    flexDirection: 'row',
    marginTop: 26,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(63,3,11,0.06)'
  },
  tabBtn: {
    paddingVertical: 12,
    marginRight: 24,
    position: 'relative'
  },
  tabText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: 'rgba(63,3,11,0.45)',
    fontWeight: '600'
  },
  tabTextActive: {
    color: Colors.oxblood,
    fontWeight: '700'
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.oxblood,
    borderRadius: 1.5
  },

  tabContent: {
    marginTop: 10
  },
  sectionHeading: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    color: Colors.ink,
    marginTop: 20,
    marginBottom: 12,
    fontWeight: '700'
  },

  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.03)',
    ...Shadow.card
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 64
  },
  chartCol: {
    alignItems: 'center',
    flex: 1
  },
  chartBarContainer: {
    height: 36,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  chartBar: {
    width: 32,
    height: 8,
    borderRadius: 4
  },
  chartLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10,
    color: 'rgba(63,3,11,0.45)',
    marginTop: 8,
    fontWeight: '500'
  },

  campaignCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.03)',
    ...Shadow.card
  },
  campaignIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.oxbloodDeep,
    overflow: 'hidden',
    position: 'relative'
  },
  creatorAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(180,106,116,0.15)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  creatorAvatarLetter: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.oxblood,
    fontFamily: FontFamily.sansMedium
  },
  campaignTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Colors.ink,
    fontWeight: '700'
  },
  campaignSubtitle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: 'rgba(63,3,11,0.45)',
    marginTop: 3,
    fontWeight: '500'
  },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  statusText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10.5,
    fontWeight: '700'
  },

  floatingChatBtn: {
    position: 'absolute',
    right: 18,
    bottom: 96,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.roseDeep,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    ...Shadow.button
  },
  chatBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.oxbloodDeep,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff'
  },
  chatBadgeText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800'
  },

  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.06)'
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  menuItemText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Colors.ink,
    fontWeight: '600'
  },
  menuItemValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.rose,
    fontWeight: '700'
  },
  menuLogoutBtn: {
    marginTop: 12,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,59,48,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  menuLogoutText: {
    fontFamily: FontFamily.sansMedium,
    fontWeight: '700',
    fontSize: 13.5,
    color: '#FF3B30'
  },

  sheetInfoCard: { backgroundColor: 'rgba(63,3,11,0.04)', padding: 12, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: Colors.oxblood },
  sheetInfoTitle: { fontFamily: FontFamily.sans, fontSize: 13, color: Colors.oxblood },
  sheetInfoText: { fontSize: 12.5, color: 'rgba(63,3,11,0.6)', marginTop: 4 },
  invoiceItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.07)' },
  invoiceTitle: { fontWeight: '600', fontSize: 14, color: Colors.ink },
  invoiceDate: { fontSize: 12, color: 'rgba(63,3,11,0.45)' },
  invoiceAmount: { fontFamily: FontFamily.sansMedium, fontSize: 15, fontWeight: '700', color: Colors.oxblood },

  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(180,106,116,0.15)', alignItems: 'center', justifyContent: 'center' },
  memberName: { fontWeight: '600', fontSize: 14.5, color: Colors.ink },
  memberRole: { fontSize: 11.5, color: 'rgba(63,3,11,0.5)', marginTop: 1 },
  addMemberBtn: { marginTop: 12, height: 44, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(63,3,11,0.25)', alignItems: 'center', justifyContent: 'center' },
  addMemberText: { fontWeight: '700', fontSize: 13, color: Colors.oxblood },

  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.07)' },
  toggleLabel: { fontSize: 14.5, fontWeight: '600', color: Colors.ink },
  toggleSub: { fontSize: 12, color: 'rgba(63,3,11,0.5)', marginTop: 2 },
  saveBtn: { marginTop: 16, height: 48, borderRadius: 12, backgroundColor: Colors.oxblood, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontFamily: FontFamily.sans, fontWeight: '800', fontSize: 14, color: Colors.cream },

  emptyCard: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13.5,
    color: 'rgba(63,3,11,0.4)',
    textAlign: 'center',
  },
  analyticsSummaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.03)',
    ...Shadow.card,
    alignItems: 'center',
  },
  analyticsSummaryTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  analyticsSummaryText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(63,3,11,0.55)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  viewAnalyticsBtn: {
    backgroundColor: Colors.oxblood,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 20,
    ...Shadow.button,
  },
  viewAnalyticsBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.cream,
  },
  settingsSection: {
    marginTop: 28,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.03)',
    ...Shadow.card,
  },
  settingsSectionTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 10,
  },
});
