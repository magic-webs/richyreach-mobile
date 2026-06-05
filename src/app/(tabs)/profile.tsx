import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { accounts, portfolio } from '@/data/mock';
import { useAuthStore } from '@/store/auth';
import { AccountSheet } from '@/components/account-sheet';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Chip } from '@/components/ui/chip';
import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { RoleToggle } from '@/components/ui/role-toggle';
import { SectionHead } from '@/components/ui/section-head';

type ProfileTab = 'Portfolio' | 'Reviews' | 'About';
type SheetType = 'wallet' | 'verification' | 'notifications' | 'privacy' | 'language' | 'help' | null;

const REVIEWS = [
  ['Lumière Beauty', 'A dream to work with — delivered early and the reel overperformed.', 5],
  ['Aurora Tech', 'Professional, on-brief, great communication.', 5],
  ['Magic Webs', 'Editorial eye is unmatched. Booking again.', 5],
] as const;

const SETTINGS: [string, string, string, SheetType][] = [
  ['wallet', 'Wallet & payouts', '₹42,800', 'wallet'],
  ['verified', 'Verification', 'Verified', 'verification'],
  ['bell', 'Notifications', '', 'notifications'],
  ['lock', 'Privacy & security', '', 'privacy'],
  ['globe', 'Language', 'EN', 'language'],
  ['settings', 'Help & support', '', 'help'],
];

function WalletContent() {
  const txns = [
    { brand: 'Lumière Beauty', amount: '+₹45,000', date: 'Today', positive: true },
    { brand: 'Atlas Watches', amount: '+₹1,20,000', date: 'Jun 1', positive: true },
    { brand: 'Platform fee', amount: '-₹4,500', date: 'May 30', positive: false },
    { brand: 'Élan Active', amount: '+₹38,000', date: 'May 28', positive: true },
    { brand: 'Verre Skincare', amount: '+₹28,000', date: 'May 22', positive: true },
  ];
  return (
    <View style={{ gap: 14 }}>
      <GradientView variant="oxblood" style={wallet.balanceCard}>
        <Text style={wallet.balanceLabel}>Total earned</Text>
        <Text style={wallet.balanceAmount}>₹6,40,500</Text>
        <View style={wallet.balanceRow}>
          <View style={wallet.miniCard}>
            <Text style={wallet.miniLabel}>Pending</Text>
            <Text style={wallet.miniValue}>₹42,800</Text>
          </View>
          <View style={wallet.miniCard}>
            <Text style={wallet.miniLabel}>Available</Text>
            <Text style={[wallet.miniValue, { color: '#5fd39b' }]}>₹12,400</Text>
          </View>
        </View>
        <TouchableOpacity style={wallet.withdrawBtn} activeOpacity={0.85}>
          <Text style={wallet.withdrawText}>Withdraw ₹12,400</Text>
        </TouchableOpacity>
      </GradientView>
      <View>
        <Text style={wallet.txnTitle}>Recent transactions</Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', ...Shadow.card }}>
          {txns.map((t, k) => (
            <View key={k} style={[wallet.txnRow, k < txns.length - 1 && wallet.txnBorder]}>
              <View style={{ flex: 1 }}>
                <Text style={wallet.txnBrand}>{t.brand}</Text>
                <Text style={wallet.txnDate}>{t.date}</Text>
              </View>
              <Text style={[wallet.txnAmount, { color: t.positive ? '#2a7a5a' : Colors.rose }]}>{t.amount}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const wallet = StyleSheet.create({
  balanceCard: { borderRadius: 22, padding: 20 },
  balanceLabel: { fontSize: 11, fontWeight: '700', color: Colors.roseSoft, textTransform: 'uppercase', letterSpacing: 1 },
  balanceAmount: { fontFamily: FontFamily.serif, fontSize: 38, fontWeight: '700', color: Colors.cream, marginTop: 6 },
  balanceRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  miniCard: { flex: 1, backgroundColor: 'rgba(232,216,204,0.1)', borderRadius: 12, padding: 10 },
  miniLabel: { fontSize: 10.5, color: 'rgba(232,216,204,0.6)', fontWeight: '600' },
  miniValue: { fontFamily: FontFamily.serif, fontSize: 18, fontWeight: '700', color: Colors.cream, marginTop: 3 },
  withdrawBtn: { marginTop: 14, height: 44, borderRadius: 12, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center' },
  withdrawText: { fontFamily: FontFamily.sans, fontWeight: '800', fontSize: 14, color: Colors.oxblood },
  txnTitle: { fontFamily: FontFamily.serif, fontSize: 17, fontWeight: '700', color: Colors.ink, marginBottom: 12 },
  txnRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  txnBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.07)' },
  txnBrand: { fontWeight: '600', fontSize: 14, color: Colors.ink },
  txnDate: { fontSize: 11.5, color: 'rgba(63,3,11,0.45)', marginTop: 1 },
  txnAmount: { fontFamily: FontFamily.serif, fontSize: 15, fontWeight: '700' },
});

function ToggleRow({ label, sub, value, onChange, icon }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void; icon?: string }) {
  return (
    <View style={toggleStyles.row}>
      {icon && <View style={toggleStyles.iconWrap}><Icon name={icon} size={16} color={Colors.oxblood} /></View>}
      <View style={{ flex: 1 }}>
        <Text style={toggleStyles.label}>{label}</Text>
        {sub && <Text style={toggleStyles.sub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: 'rgba(63,3,11,0.18)', true: Colors.oxblood }}
        thumbColor="#fff"
      />
    </View>
  );
}

const toggleStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.07)' },
  iconWrap: { width: 32, height: 32, borderRadius: 9, backgroundColor: 'rgba(180,106,116,0.12)', alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14.5, fontWeight: '600', color: Colors.ink },
  sub: { fontSize: 12, color: 'rgba(63,3,11,0.5)', marginTop: 2 },
});

function NotificationsContent() {
  const [prefs, setPrefs] = useState({ newCollabs: true, payments: true, messages: true, arena: true, updates: false, marketing: false });
  const set = (k: keyof typeof prefs, v: boolean) => setPrefs((p) => ({ ...p, [k]: v }));
  return (
    <View>
      <View style={{ backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 16, ...Shadow.card }}>
        <ToggleRow label="New collab matches" sub="Brands that suit your profile" icon="briefcase" value={prefs.newCollabs} onChange={(v) => set('newCollabs', v)} />
        <ToggleRow label="Payments & payouts" sub="When money moves" icon="dollar-sign" value={prefs.payments} onChange={(v) => set('payments', v)} />
        <ToggleRow label="Messages" sub="New chat from brands" icon="chat" value={prefs.messages} onChange={(v) => set('messages', v)} />
        <ToggleRow label="Arena & contests" sub="New challenges, results" icon="trophy" value={prefs.arena} onChange={(v) => set('arena', v)} />
        <ToggleRow label="App updates" sub="New features & tips" icon="sparkle" value={prefs.updates} onChange={(v) => set('updates', v)} />
        <ToggleRow label="Marketing" sub="Offers, promotions" icon="gift" value={prefs.marketing} onChange={(v) => set('marketing', v)} />
      </View>
      <TouchableOpacity style={[saveBtn.btn, { marginTop: 16 }]} activeOpacity={0.85}>
        <Text style={saveBtn.text}>Save preferences</Text>
      </TouchableOpacity>
    </View>
  );
}

const saveBtn = StyleSheet.create({
  btn: { height: 50, borderRadius: 15, backgroundColor: Colors.oxblood, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: FontFamily.sans, fontWeight: '800', fontSize: 15, color: Colors.cream },
});

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const setRole = useAuthStore((s) => s.setRole);

  const [activeTab, setActiveTab] = useState<ProfileTab>('Portfolio');
  const [sheet, setSheet] = useState<SheetType>(null);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [currentAcctId, setCurrentAcctId] = useState('creates');

  const acct = accounts.find((a) => a.id === currentAcctId) ?? accounts[0];
  const stats = [['Followers', acct.followers], ['Campaigns', '28'], ['Earned', '₹6.4L'], ['Rating', '4.9']];

  const sheetContent: Record<NonNullable<SheetType>, { title: string; icon: string; content: React.ReactNode }> = {
    wallet: { title: 'Wallet & payouts', icon: 'wallet', content: <WalletContent /> },
    verification: { title: 'Verification', icon: 'verified', content: <Text style={{ color: Colors.ink, fontSize: 14 }}>Verification status: {acct.verified ? 'Verified ✓' : 'Pending'}</Text> },
    notifications: { title: 'Notifications', icon: 'bell', content: <NotificationsContent /> },
    privacy: { title: 'Privacy & security', icon: 'lock', content: <Text style={{ color: Colors.ink, fontSize: 14 }}>Privacy settings coming soon.</Text> },
    language: { title: 'Language', icon: 'globe', content: <Text style={{ color: Colors.ink, fontSize: 14 }}>Language: English</Text> },
    help: { title: 'Help & support', icon: 'settings', content: <Text style={{ color: Colors.ink, fontSize: 14 }}>For support, contact support@richyreach.com</Text> },
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setAccountSheetOpen(true)} style={styles.handleBtn} activeOpacity={0.8}>
          <View style={{ position: 'relative' }}>
            <PlaceholderImage tone={acct.tone} height={38} width={38} borderRadius={99} />
            {acct.verified && <View style={styles.verifiedDot}><Icon name="verified" size={11} color={Colors.cream} /></View>}
          </View>
          <Text style={styles.handleText}>{acct.handle}</Text>
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
          <PlaceholderImage tone={acct.tone} height={120} borderRadius={0} />
          <View style={styles.coverGradient} />
          <View style={styles.avatarWrap}>
            <View style={styles.avatarRing}>
              <PlaceholderImage tone={acct.tone === 'ox' ? 'rose' : 'ox'} height={80} width={80} borderRadius={99} />
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.name}>{acct.name}</Text>
                {acct.verified && <Icon name="verified" size={18} color={Colors.rose} />}
              </View>
              <Text style={styles.handle}>{acct.handle} · {acct.kind}</Text>
            </View>
            <RoleToggle role={role === 'influencer' ? 'creator' : 'brand'} onChange={(r) => setRole(r === 'creator' ? 'influencer' : 'brand')} />
          </View>

          <Text style={styles.bio}>Beauty &amp; lifestyle creator ✨ Telling brand stories that feel real. Mumbai → everywhere.</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            {stats.map((s, k) => (
              <View key={k} style={[styles.statItem, k < stats.length - 1 && styles.statBorder]}>
                <Text style={styles.statValue}>{s[1]}</Text>
                <Text style={styles.statLabel}>{s[0]}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.85}>
              <Icon name="edit" size={16} color={Colors.cream} />
              <Text style={styles.editBtnText}>Edit profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/insights')} style={styles.insightsBtn} activeOpacity={0.85}>
              <Icon name="chart" size={16} color={Colors.oxblood} />
              <Text style={styles.insightsBtnText}>Insights</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {(['Portfolio', 'Reviews', 'About'] as ProfileTab[]).map((t) => (
              <TouchableOpacity key={t} onPress={() => setActiveTab(t)} activeOpacity={0.8} style={styles.tabBtn}>
                <Text style={[styles.tabBtnText, activeTab === t && styles.tabBtnTextActive]}>{t}</Text>
                {activeTab === t && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'Portfolio' && (
            <View style={styles.portfolioGrid}>
              {portfolio.map((p, k) => (
                <View key={k} style={styles.portfolioItem}>
                  <PlaceholderImage tone={p.tone} height={110} borderRadius={12} />
                  <View style={styles.portfolioOverlay} />
                  <View style={styles.portfolioMeta}>
                    <Icon name="play" size={11} color={Colors.cream} />
                    <Text style={styles.portfolioViews}>{p.views}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'Reviews' && (
            <View style={{ gap: 12, marginTop: 14 }}>
              {REVIEWS.map(([brand, review, stars], k) => (
                <View key={k} style={styles.reviewCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <PlaceholderImage tone="ox" height={36} width={36} borderRadius={99} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewBrand}>{brand}</Text>
                      <View style={{ flexDirection: 'row', gap: 1 }}>
                        {Array.from({ length: stars }).map((_, i) => <Icon key={i} name="star" size={12} color={Colors.rose} />)}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{review}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'About' && (
            <View style={{ gap: 18, marginTop: 16 }}>
              <View>
                <Text style={styles.aboutLabel}>Niches</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['Beauty', 'Skincare', 'Lifestyle', 'Travel', 'Fashion'].map((n) => <Chip key={n}>{n}</Chip>)}
                </View>
              </View>
              <View>
                <Text style={styles.aboutLabel}>Audience</Text>
                <View style={styles.audienceCard}>
                  <Text style={styles.audienceText}>78% women · 18–34 · India, UAE, UK. Avg. reel views 480k, engagement 6.2%.</Text>
                </View>
              </View>
            </View>
          )}

          {/* Settings */}
          <View style={{ marginTop: 24 }}>
            <Text style={styles.settingsLabel}>Settings</Text>
            <View style={styles.settingsList}>
              {SETTINGS.map(([icon, label, value, key], k) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSheet(key)}
                  activeOpacity={0.8}
                  style={[styles.settingRow, k < SETTINGS.length - 1 && styles.settingBorder]}
                >
                  <View style={styles.settingIcon}><Icon name={icon} size={17} color={Colors.oxblood} /></View>
                  <Text style={styles.settingLabel}>{label}</Text>
                  {value ? <Text style={styles.settingValue}>{value}</Text> : null}
                  <Icon name="chevron" size={16} color="rgba(63,3,11,0.3)" />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setAccountSheetOpen(true)} style={styles.switchAccountBtn} activeOpacity={0.8}>
              <Icon name="swap" size={18} color={Colors.oxblood} />
              <Text style={styles.switchAccountText}>Switch or add account</Text>
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

      <AccountSheet
        visible={accountSheetOpen}
        accounts={accounts}
        currentId={currentAcctId}
        onSelect={(id) => { setCurrentAcctId(id); setAccountSheetOpen(false); }}
        onClose={() => setAccountSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(244,236,228,0.9)', borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.07)' },
  handleBtn: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  verifiedDot: { position: 'absolute', bottom: -1, right: -1, width: 14, height: 14, borderRadius: 99, backgroundColor: Colors.oxblood, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.creamLite },
  handleText: { fontFamily: FontFamily.serif, fontSize: 17, fontWeight: '700', color: Colors.ink },
  chevronWrap: { width: 22, height: 22, borderRadius: 99, backgroundColor: 'rgba(63,3,11,0.07)', alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...Shadow.card },

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

  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  portfolioItem: { width: '31.5%', position: 'relative', borderRadius: 12, overflow: 'hidden' },
  portfolioOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(42,2,7,0.2)' },
  portfolioMeta: { position: 'absolute', bottom: 7, left: 7, flexDirection: 'row', alignItems: 'center', gap: 3 },
  portfolioViews: { fontSize: 10.5, fontWeight: '700', color: Colors.cream },

  reviewCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, ...Shadow.card },
  reviewBrand: { fontWeight: '700', fontSize: 14, color: Colors.ink },
  reviewText: { fontSize: 13.5, lineHeight: 20, color: 'rgba(42,2,7,0.72)' },

  aboutLabel: { fontSize: 12, fontWeight: '700', color: Colors.rose, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  audienceCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, ...Shadow.card },
  audienceText: { fontSize: 13.5, color: 'rgba(42,2,7,0.75)', lineHeight: 22 },

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
