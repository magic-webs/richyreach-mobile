import { CreateInfluencerProfileSheet } from '@/components/influencer/CreateInfluencerProfileSheet';
import { CreateServiceSheet } from '@/components/influencer/CreateServiceSheet';
import { SwitchInfluencerProfileSheet } from '@/components/influencer/SwitchInfluencerProfileSheet';
import { PromoBannerCarousel } from '@/components/home/PromoBannerCarousel';
import { AboutTab } from '@/components/influencer/profile/AboutTab';
import { NotificationsContent } from '@/components/influencer/profile/NotificationsContent';
import { PortfolioTab } from '@/components/influencer/profile/PortfolioTab';
import { ReviewsTab } from '@/components/influencer/profile/ReviewsTab';
import { ServicesTab } from '@/components/influencer/profile/ServicesTab';
import { WalletContent } from '@/components/influencer/profile/WalletContent';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { RoleToggle } from '@/components/ui/role-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import { useUIStore } from '@/store/ui';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ProfileTab = 'Portfolio' | 'Services' | 'Reviews' | 'About';
type SheetType = 'wallet' | 'verification' | 'notifications' | 'privacy' | 'language' | 'help' | null;

const SETTINGS: [string, string, string, SheetType][] = [
  ['wallet', 'Wallet & payouts', '', 'wallet'],
  ['verified', 'Verification', 'Verified', 'verification'],
  ['bell', 'Notifications', '', 'notifications'],
  ['lock', 'Privacy & security', '', 'privacy'],
  ['globe', 'Language', 'EN', 'language'],
  ['settings', 'Help & support', '', 'help'],
];

export default function ProfileScreen() {
  const role = useAuthStore((s) => s.role);
  const router = useRouter();
  const queryClient = useQueryClient();

  const insets = useSafeAreaInsets();
  const setRole = useAuthStore((s) => s.setRole);
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const loadInfluencerProfiles = useProfilesStore((s) => s.loadInfluencerProfiles);
  const activeInfluencerProfileId = useProfilesStore((s) => s.activeInfluencerProfileId);

  const [activeTab, setActiveTab] = useState<ProfileTab>('Services');
  const [sheet, setSheet] = useState<SheetType>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  // Sheets and services state
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);

  const showModal = useUIStore((s) => s.showModal);

  // Fetch influencer profile from backend via TanStack Query
  const { data: infProfileData, isLoading: loadingProfile } = useQuery<any>({
    queryKey: ['influencerProfile', activeInfluencerProfileId],
    queryFn: async () => {
      const res = await api.influencers.profile().catch(() => null);
      return res;
    },
  });
  const infProfile = infProfileData as any;

  // Synchronize influencer profile to Zustand store
  useEffect(() => {
    if (infProfile && session?.user?.id) {
      loadInfluencerProfiles(session.user.id, infProfile);
    }
  }, [infProfile, session?.user?.id, loadInfluencerProfiles]);

  // Fetch dashboard from backend via TanStack Query
  const { data: dashboardDataData, isLoading: loadingDashboard } = useQuery<any>({
    queryKey: ['influencerDashboard', activeInfluencerProfileId],
    queryFn: () => api.influencers.dashboard().catch(() => null),
    enabled: !!activeInfluencerProfileId,
  });
  const dashboardData = dashboardDataData as any;

  // Fetch earnings from backend via TanStack Query
  const { data: earningsData = [], isLoading: loadingEarnings } = useQuery<any[]>({
    queryKey: ['influencerEarnings', activeInfluencerProfileId],
    queryFn: () => api.influencers.earnings().catch(() => []),
    enabled: !!activeInfluencerProfileId,
  });
  const earnings = earningsData as any[];

  // Fetch creator services from backend via TanStack Query
  const { data: servicesData = [], isLoading: loadingServices } = useQuery<any[]>({
    queryKey: ['influencerServices', activeInfluencerProfileId],
    queryFn: () => api.influencers.services.list().catch(() => []),
    enabled: !!activeInfluencerProfileId,
  });
  const services = servicesData as any[];

  const stats = [
    ['Followers', infProfile?.followers ? `${(infProfile.followers / 1000).toFixed(0)}k` : '0'],
    ['Campaigns', dashboardData?.activeCampaigns ? String(dashboardData.activeCampaigns) : '0'],
    ['Earned', dashboardData?.totalEarnings ? `₹${(dashboardData.totalEarnings / 100).toLocaleString()}` : '₹0'],
    ['Rating', '4.8'],
  ];

  // Delete Service mutation with Optimistic Update
  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: string) => api.influencers.services.delete(serviceId),
    onMutate: async (serviceId) => {
      await queryClient.cancelQueries({ queryKey: ['influencerServices', activeInfluencerProfileId] });
      const previousServices = queryClient.getQueryData<any[]>(['influencerServices', activeInfluencerProfileId]);

      if (previousServices) {
        queryClient.setQueryData(
          ['influencerServices', activeInfluencerProfileId],
          previousServices.filter((s) => s.id !== serviceId)
        );
      }
      return { previousServices };
    },
    onError: (err, serviceId, context) => {
      if (context?.previousServices) {
        queryClient.setQueryData(
          ['influencerServices', activeInfluencerProfileId],
          context.previousServices
        );
      }
      showModal({
        title: 'Operation Failed',
        message: (err as any)?.message || 'Failed to delete service. Please try again.',
      });
    },
    onSuccess: () => {
      showModal({
        title: 'Service Deleted 🗑️',
        message: 'The service was successfully removed.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['influencerServices', activeInfluencerProfileId] });
      queryClient.invalidateQueries({ queryKey: ['influencerDashboard', activeInfluencerProfileId] });
    },
  });

  const handleDeleteService = (serviceId: string) => {
    deleteServiceMutation.mutate(serviceId);
  };

  const displayName = infProfile?.name || session?.user?.name || 'Creator';
  const displayHandle = infProfile?.instagramHandle ? `@${infProfile.instagramHandle}` : 'No Handle';
  const displayVerified = infProfile?.verified ?? false;
  const displayBio = infProfile?.bio || '';
  const displayNiches = infProfile?.niche ? [infProfile.niche] : [];

  const clearedEarnings = earnings
    .filter((t) => t.status === 'cleared')
    .reduce((sum, t) => sum + t.amount, 0);

  const displayAvailable = `₹${(clearedEarnings / 100).toLocaleString()}`;

  const sheetContent: Record<NonNullable<SheetType>, { title: string; icon: string; content: React.ReactNode }> = {
    wallet: {
      title: 'Wallet & payouts',
      icon: 'wallet',
      content: (
        <WalletContent
          dashboard={dashboardData}
          earnings={earnings}
          loadingDashboard={loadingDashboard}
          loadingEarnings={loadingEarnings}
        />
      )
    },
    verification: { title: 'Verification', icon: 'verified', content: <Text style={{ color: Colors.ink, fontSize: 14 }}>Verification status: {displayVerified ? 'Verified ✓' : 'Pending'}</Text> },
    notifications: { title: 'Notifications', icon: 'bell', content: <NotificationsContent /> },
    privacy: { title: 'Privacy & security', icon: 'lock', content: <Text style={{ color: Colors.ink, fontSize: 14 }}>Privacy settings coming soon.</Text> },
    language: { title: 'Language', icon: 'globe', content: <Text style={{ color: Colors.ink, fontSize: 14 }}>Language: English</Text> },
    help: { title: 'Help & support', icon: 'settings', content: <Text style={{ color: Colors.ink, fontSize: 14 }}>For support, contact support@richyreach.com</Text> },
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSwitcherOpen(true)} style={styles.handleBtn} activeOpacity={0.8}>
          <View style={{ position: 'relative' }}>
            {infProfile?.avatar ? (
              <Image source={{ uri: infProfile.avatar }} style={{ width: 38, height: 38, borderRadius: 19 }} contentFit="cover" />
            ) : (
              <PlaceholderImage tone="ox" height={38} width={38} borderRadius={99} />
            )}
            {displayVerified && <View style={[styles.verifiedDot, { backgroundColor: Colors.gold }]}><Icon name="verified" size={11} color={Colors.oxblood} /></View>}
          </View>
          <Text style={styles.handleText}>{displayHandle}</Text>
          <View style={styles.chevronWrap}><Icon name="chevDown" size={15} color={Colors.oxblood} /></View>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
            <Icon name="share" size={18} color={Colors.oxblood} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSheet('help')} style={styles.iconBtn} activeOpacity={0.8}>
            <Icon name="settings" size={18} color={Colors.oxblood} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Cover + avatar */}
        <View style={{ position: 'relative' }}>
          <PlaceholderImage tone="ox" height={120} borderRadius={0} />
          <View style={styles.coverGradient} />
          <View style={styles.avatarWrap}>
            <View style={styles.avatarRing}>
              {infProfile?.avatar ? (
                <Image source={{ uri: infProfile.avatar }} style={{ width: 80, height: 80, borderRadius: 40 }} contentFit="cover" />
              ) : (
                <PlaceholderImage tone="rose" height={80} width={80} borderRadius={99} />
              )}
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {loadingProfile ? (
                  <Skeleton width={140} height={22} borderRadius={8} />
                ) : (
                  <Text style={styles.name}>{displayName}</Text>
                )}
                {!loadingProfile && displayVerified && <Icon name="verified" size={18} color={Colors.gold} />}
              </View>
              {loadingProfile ? (
                <Skeleton width={100} height={12} borderRadius={6} style={{ marginTop: 4 }} />
              ) : (
                <Text style={styles.handle}>{displayHandle} · {infProfile?.niche || 'Creator'}</Text>
              )}
            </View>
            <RoleToggle role={role === 'influencer' ? 'creator' : 'brand'} onChange={(r) => setRole(r === 'creator' ? 'influencer' : 'brand')} />
          </View>

          {loadingProfile ? (
            <View style={{ gap: 6, marginTop: 12 }}>
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="75%" />
            </View>
          ) : (
            <Text style={styles.bio}>{displayBio}</Text>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            {stats.map((s, k) => (
              <View key={k} style={[styles.statItem, k < stats.length - 1 && styles.statBorder]}>
                {loadingProfile || loadingDashboard ? (
                  <Skeleton width={50} height={18} borderRadius={4} />
                ) : (
                  <Text style={styles.statValue}>{s[1]}</Text>
                )}
                <Text style={styles.statLabel}>{s[0]}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={() => setIsCreateProfileOpen(true)} style={styles.editBtn} activeOpacity={0.85}>
              <Icon name="edit" size={16} color={Colors.cream} />
              <Text style={styles.editBtnText}>Edit profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/insights')} style={styles.insightsBtn} activeOpacity={0.85}>
              <Icon name="chart" size={16} color={Colors.oxblood} />
              <Text style={styles.insightsBtnText}>Insights</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Banner */}
          <View style={{ marginTop: 20 }}>
            <PromoBannerCarousel position="profile_top" />
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {(['Services', 'Portfolio', 'Reviews', 'About'] as ProfileTab[]).map((t) => (
              <TouchableOpacity key={t} onPress={() => setActiveTab(t)} activeOpacity={0.8} style={styles.tabBtn}>
                <Text style={[styles.tabBtnText, activeTab === t && styles.tabBtnTextActive]}>{t}</Text>
                {activeTab === t && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'Portfolio' && (
            <PortfolioTab infProfile={infProfile} />
          )}

          {activeTab === 'Services' && (
            <ServicesTab
              services={services}
              loadingServices={loadingServices}
              onAddServicePress={() => {
                setEditingService(null);
                setIsCreateServiceOpen(true);
              }}
              onEditService={(srv) => {
                setEditingService(srv);
                setIsCreateServiceOpen(true);
              }}
              onDeleteService={handleDeleteService}
            />
          )}

          {activeTab === 'Reviews' && (
            <ReviewsTab infProfile={infProfile} />
          )}

          {activeTab === 'About' && (
            <AboutTab
              infProfile={infProfile}
              loadingProfile={loadingProfile}
              displayNiches={displayNiches}
            />
          )}

          {/* Settings */}
          <View style={{ marginTop: 24 }}>
            <Text style={styles.settingsLabel}>Settings</Text>
            <View style={styles.settingsList}>
              {SETTINGS.map(([icon, label, value, key], k) => {
                const displayVal = key === 'wallet' ? (loadingEarnings ? '...' : displayAvailable) : value;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setSheet(key)}
                    activeOpacity={0.8}
                    style={[styles.settingRow, k < SETTINGS.length - 1 && styles.settingBorder]}
                  >
                    <View style={styles.settingIcon}><Icon name={icon} size={17} color={Colors.oxblood} /></View>
                    <Text style={styles.settingLabel}>{label}</Text>
                    {displayVal ? <Text style={styles.settingValue}>{displayVal}</Text> : null}
                    <Icon name="chevron" size={16} color="rgba(63,3,11,0.3)" />
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity onPress={() => setSwitcherOpen(true)} style={styles.switchAccountBtn} activeOpacity={0.8}>
              <Icon name="swap" size={18} color={Colors.oxblood} />
              <Text style={styles.switchAccountText}>Switch or add creator profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                await logout();
                router.replace('/(auth)');
              }}
              style={[styles.switchAccountBtn, { borderColor: 'rgba(255,59,48,0.3)', marginTop: 8 }]}
              activeOpacity={0.8}
            >
              <Icon name="logout" size={18} color="#FF3B30" />
              <Text style={[styles.switchAccountText, { color: '#FF3B30' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom sheets */}
      {sheet && sheetContent[sheet] && (
        <BottomSheet
          visible={!!sheet}
          title={sheetContent[sheet].title}
          icon={sheetContent[sheet].icon}
          onClose={() => setSheet(null)}
        >
          {sheetContent[sheet].content}
        </BottomSheet>
      )}

      <SwitchInfluencerProfileSheet
        isOpen={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        onSwitchSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['influencerProfile'] });
          queryClient.invalidateQueries({ queryKey: ['influencerDashboard', activeInfluencerProfileId] });
          queryClient.invalidateQueries({ queryKey: ['influencerEarnings', activeInfluencerProfileId] });
          queryClient.invalidateQueries({ queryKey: ['influencerServices', activeInfluencerProfileId] });
        }}
        onAddNewProfile={() => {
          setSwitcherOpen(false);
          setIsCreateProfileOpen(true);
        }}
      />

      <CreateInfluencerProfileSheet
        isOpen={isCreateProfileOpen}
        onClose={() => setIsCreateProfileOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['influencerProfile'] });
        }}
        initialData={infProfile}
      />

      <CreateServiceSheet
        isOpen={isCreateServiceOpen}
        onClose={() => {
          setIsCreateServiceOpen(false);
          setEditingService(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['influencerServices', activeInfluencerProfileId] });
          queryClient.invalidateQueries({ queryKey: ['influencerDashboard', activeInfluencerProfileId] });
        }}
        service={editingService}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(244,236,228,0.9)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.07)'
  },
  handleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 99,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.creamLite
  },
  handleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.ink
  },
  chevronWrap: {
    width: 22,
    height: 22,
    borderRadius: 99,
    backgroundColor: 'rgba(63,3,11,0.07)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card
  },

  coverGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(244,236,228,0.3)' },
  avatarWrap: { position: 'absolute', left: 20, bottom: -38 },
  avatarRing: { width: 86, height: 86, borderRadius: 43, padding: 3, backgroundColor: Colors.creamLite },

  body: { paddingTop: 46, paddingHorizontal: 20 },
  name: { fontFamily: FontFamily.serif, fontSize: 23, fontWeight: '700', color: Colors.ink },
  handle: { fontSize: 13, color: Colors.rose, fontWeight: '600', marginTop: 1 },
  bio: { marginTop: 12, fontSize: 14, lineHeight: 22, color: 'rgba(42,2,7,0.7)' },

  statsRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, paddingVertical: 14, paddingHorizontal: 6, marginTop: 16, ...Shadow.card },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderRightWidth: 0.5, borderRightColor: 'rgba(63,3,11,0.1)' },
  statValue: { fontFamily: FontFamily.serif, fontSize: 18, fontWeight: '700', color: Colors.oxblood },
  statLabel: { fontSize: 10.5, color: 'rgba(63,3,11,0.5)', fontWeight: '600', marginTop: 2 },

  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  editBtn: { flex: 1, height: 44, borderRadius: 13, backgroundColor: Colors.oxblood, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  editBtnText: { fontWeight: '700', fontSize: 14, color: Colors.cream },
  insightsBtn: { flex: 1, height: 44, borderRadius: 13, borderWidth: 1.5, borderColor: Colors.oxblood, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  insightsBtnText: { fontWeight: '700', fontSize: 14, color: Colors.oxblood },

  tabsRow: { flexDirection: 'row', gap: 24, marginTop: 22, borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.1)' },
  tabBtn: { paddingBottom: 10, position: 'relative' },
  tabBtnText: { fontFamily: FontFamily.sans, fontSize: 14.5, fontWeight: '700', color: 'rgba(63,3,11,0.4)' },
  tabBtnTextActive: { color: Colors.oxblood },
  tabIndicator: { position: 'absolute', bottom: -0.5, left: 0, right: 0, height: 2.5, backgroundColor: Colors.oxblood, borderRadius: 99 },

  settingsLabel: { fontSize: 12, fontWeight: '700', color: Colors.rose, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  settingsList: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', ...Shadow.card },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 16, paddingVertical: 13 },
  settingBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.07)' },
  settingIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(180,106,116,0.12)', alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontSize: 14.5, color: Colors.ink, fontWeight: '600' },
  settingValue: { fontSize: 13, color: Colors.rose, fontWeight: '700' },
  switchAccountBtn: { marginTop: 12, height: 48, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(63,3,11,0.25)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  switchAccountText: { fontWeight: '700', fontSize: 14, color: Colors.oxblood },
});
