import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Pattern, Rect } from 'react-native-svg';

type SheetType = 'billing' | 'team' | 'security' | 'notifications' | 'support' | 'menu' | null;
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

  const months = [
    { label: 'Jan', value: 12, isSpecial: false },
    { label: 'Feb', value: 12, isSpecial: false },
    { label: 'Mar', value: 12, isSpecial: false },
    { label: 'Apr', value: 12, isSpecial: false },
    { label: 'May', value: 12, isSpecial: true },
    { label: 'Jun', value: 12, isSpecial: false },
  ];

  const campaignsData = [
    { id: '1', title: 'Summer Glow Serum', subtitle: '8 creators · ₹4.8L', status: 'Active' as const },
    { id: '2', title: 'Heritage Chronograph', subtitle: '3 creators · ₹3.6L', status: 'Active' as const },
    { id: '3', title: 'Glass-Skin Routine', subtitle: '12 invited · ₹3.4L', status: 'In review' as const },
    { id: '4', title: 'AW Collection', subtitle: '6 creators · ₹8.4L', status: 'Closed' as const },
  ];

  const creatorsData = [
    { id: '1', name: 'Aanya Verma', handle: '@aanya', followers: '240k followers', tag: 'High Reach' },
    { id: '2', name: 'Kabir Mehta', handle: '@kabirm', followers: '95k followers', tag: 'Top ROI' },
    { id: '3', name: 'Rohan Malhotra', handle: '@rohanm', followers: '180k followers', tag: 'Active' },
    { id: '4', name: 'Sanya Sen', handle: '@sanyasen', followers: '310k followers', tag: 'Engaged' },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          activeOpacity={0.8}
          onPress={() => setSheet('menu')}
        >
          <View style={styles.headerLogoSquircle}>
            <Stripes id="header-logo" stripeColor="rgba(180, 106, 116, 0.25)" backgroundColor={Colors.oxbloodDeep} />
          </View>
          <Text style={styles.headerTitle}>Magic Webs</Text>
          <Icon name="chevDown" size={16} color={Colors.ink} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.themeToggleBtn}
          activeOpacity={0.8}
          onPress={() => showModal({ title: 'Theme Toggle', message: 'Theme preference toggle is handled by global settings.' })}
        >
          <Icon name="sun" size={16} color={Colors.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        {/* Cover with Stripes */}
        <View style={styles.coverContainer}>
          <Stripes id="cover-stripes" stripeColor="rgba(63,3,11,0.05)" backgroundColor="rgba(180, 106, 116, 0.12)" />
          {/* Floating spark stars */}
          <View style={styles.sparklesContainer}>
            <Icon name="sparkle" size={12} color="rgba(63,3,11,0.12)" />
            <Icon name="sparkle" size={14} color="rgba(63,3,11,0.16)" />
            <Icon name="sparkle" size={18} color="rgba(63,3,11,0.2)" />
            <Icon name="sparkle" size={14} color="rgba(63,3,11,0.16)" />
          </View>
        </View>

        {/* Squircle Avatar Overlapping Cover */}
        <View style={styles.avatarShadowWrap}>
          <View style={styles.avatarContainer}>
            <Stripes id="avatar-stripes" stripeColor="rgba(180, 106, 116, 0.2)" backgroundColor={Colors.oxbloodDeep} />
          </View>
        </View>

        <View style={styles.body}>
          {/* Brand details and Switch to Creator view */}
          <View style={styles.brandTitleRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.brandName}>Magic Webs</Text>
                <Icon name="verified" size={18} color={Colors.rose} />
              </View>
              <Text style={styles.brandHandle}>Tech & Digital · Brand account</Text>
            </View>
            <TouchableOpacity
              onPress={handleCreatorViewSwitch}
              style={styles.creatorViewBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.creatorViewText}>← Creator view</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.bio}>
            Premium digital studio. We tell stories through creators who carry the aesthetic.
          </Text>

          {/* Stats Grid */}
          <View style={styles.statsCard}>
            <View style={styles.statCol}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Campaigns</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statValue}>84</Text>
              <Text style={styles.statLabel}>Creators</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statValue}>₹48L</Text>
              <Text style={styles.statLabel}>Total spend</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statValue}>4.2x</Text>
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
              <Text style={styles.sectionHeading}>Monthly spend (₹L)</Text>

              {/* Spend Chart */}
              <View style={styles.chartCard}>
                <View style={styles.chartRow}>
                  {months.map((m, idx) => (
                    <View key={idx} style={styles.chartCol}>
                      <View style={styles.chartBarContainer}>
                        <View style={[
                          styles.chartBar,
                          { backgroundColor: m.isSpecial ? '#d8a7ad' : '#3f030b' }
                        ]} />
                      </View>
                      <Text style={styles.chartLabel}>{m.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <Text style={styles.sectionHeading}>Campaign performance</Text>
              <CampaignRow
                id="perf-preview"
                title="Summer Glow Serum"
                subtitle="8 creators · ₹4.8L"
                status="Active"
              />
            </View>
          )}

          {activeTab === 'Campaigns' && (
            <View style={styles.tabContent}>
              {campaignsData.map((c) => (
                <CampaignRow
                  key={c.id}
                  id={c.id}
                  title={c.title}
                  subtitle={c.subtitle}
                  status={c.status}
                />
              ))}
            </View>
          )}

          {activeTab === 'Creators' && (
            <View style={styles.tabContent}>
              {creatorsData.map((cr) => (
                <CreatorRow
                  key={cr.id}
                  id={cr.id}
                  name={cr.name}
                  handle={cr.handle}
                  followers={cr.followers}
                  tag={cr.tag}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      {/* Settings Options Bottom Sheet (Triggered by dropdown) */}
      {sheet === 'menu' && (
        <BottomSheet visible={true} title="Brand settings" icon="settings" onClose={() => setSheet(null)}>
          <View style={{ gap: 4 }}>
            {[
              { icon: 'wallet', label: 'Invoices & billing', value: '₹11.8L', key: 'billing' },
              { icon: 'users', label: 'Team management', value: '3 members', key: 'team' },
              { icon: 'bell', label: 'Notifications', value: '', key: 'notifications' },
              { icon: 'lock', label: 'Privacy & security', value: '', key: 'security' },
              { icon: 'settings', label: 'Help & support', value: '', key: 'support' },
            ].map((item, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSheet(item.key as SheetType)}
                activeOpacity={0.8}
                style={styles.menuItemRow}
              >
                <View style={styles.menuItemLeft}>
                  <Icon name={item.icon} size={16} color={Colors.oxblood} />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {item.value ? <Text style={styles.menuItemValue}>{item.value}</Text> : null}
                  <Icon name="chevron" size={14} color="rgba(63,3,11,0.3)" />
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={async () => {
                setSheet(null);
                await logout();
                router.replace('/(auth)');
              }}
              style={styles.menuLogoutBtn}
              activeOpacity={0.8}
            >
              <Icon name="logout" size={16} color="#FF3B30" />
              <Text style={styles.menuLogoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      )}

      {/* Individual settings bottom sheets */}
      {sheet === 'billing' && (
        <BottomSheet visible={true} title="Invoices & billing" icon="wallet" onClose={() => setSheet('menu')}>
          <View style={{ gap: 14 }}>
            <View style={styles.sheetInfoCard}>
              <Text style={styles.sheetInfoTitle}>Billing Overview</Text>
              <Text style={styles.sheetInfoText}>All invoices are generated monthly. Available credits: ₹45,000.</Text>
            </View>
            <View style={styles.invoiceItem}>
              <View>
                <Text style={styles.invoiceTitle}>Invoice #INV-2026-003</Text>
                <Text style={styles.invoiceDate}>June 2026</Text>
              </View>
              <Text style={styles.invoiceAmount}>₹4,80,000</Text>
            </View>
            <View style={styles.invoiceItem}>
              <View>
                <Text style={styles.invoiceTitle}>Invoice #INV-2026-002</Text>
                <Text style={styles.invoiceDate}>May 2026</Text>
              </View>
              <Text style={styles.invoiceAmount}>₹3,60,000</Text>
            </View>
          </View>
        </BottomSheet>
      )}

      {sheet === 'team' && (
        <BottomSheet visible={true} title="Team management" icon="users" onClose={() => setSheet('menu')}>
          <View style={{ gap: 12 }}>
            <View style={styles.memberRow}>
              <View style={styles.memberAvatar}>
                <Text style={{ fontWeight: '700', color: Colors.oxblood }}>AS</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>Abhijit Sen</Text>
                <Text style={styles.memberRole}>Owner · abhijit@magicwebs.com</Text>
              </View>
            </View>
            <View style={styles.memberRow}>
              <View style={styles.memberAvatar}>
                <Text style={{ fontWeight: '700', color: Colors.oxblood }}>NK</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>Nikita Kapoor</Text>
                <Text style={styles.memberRole}>Campaign Manager · nikita@magicwebs.com</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.addMemberBtn} activeOpacity={0.8} onPress={() => showModal({ title: 'Invite Member', message: 'Invite team member dialog...' })}>
              <Text style={styles.addMemberText}>+ Invite Team Member</Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      )}

      {sheet === 'notifications' && (
        <BottomSheet visible={true} title="Notifications" icon="bell" onClose={() => setSheet('menu')}>
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
        <BottomSheet visible={true} title="Privacy & security" icon="lock" onClose={() => setSheet('menu')}>
          <Text style={{ color: Colors.ink, fontSize: 14 }}>Security, password management, and MFA configurations are accessible from the web portal dashboard.</Text>
        </BottomSheet>
      )}

      {sheet === 'support' && (
        <BottomSheet visible={true} title="Help & support" icon="settings" onClose={() => setSheet('menu')}>
          <Text style={{ color: Colors.ink, fontSize: 14, lineHeight: 20 }}>
            For help with your Brand Account, invoice inquiries, or resolving disputes with creators, please contact our brand assistance hotline at brandsupport@richyreach.com.
          </Text>
        </BottomSheet>
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
    fontFamily: FontFamily.serif,
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
    fontFamily: FontFamily.serif,
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
    fontFamily: FontFamily.serif,
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
    fontFamily: FontFamily.serif,
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
    fontFamily: FontFamily.serif
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
  invoiceAmount: { fontFamily: FontFamily.serif, fontSize: 15, fontWeight: '700', color: Colors.oxblood },

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
});
