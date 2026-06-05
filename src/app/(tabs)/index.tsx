import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, Gradients, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import * as mock from '@/data/mock';
import { useAuthStore } from '@/store/auth';
import { Carousel } from '@/components/ui/carousel';
import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { RoleToggle } from '@/components/ui/role-toggle';
import { SectionHead } from '@/components/ui/section-head';

const { width: W } = Dimensions.get('window');

function OfferBanner() {
  const [timeLeft, setTimeLeft] = useState(2 * 3600 + 14 * 60 + 33);
  useEffect(() => {
    const id = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const mm = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const seg = (v: string) => (
    <View style={offer.seg}><Text style={offer.segText}>{v}</Text></View>
  );
  return (
    <LinearGradient colors={[Colors.oxblood2, Colors.oxblood, Colors.oxbloodDeep]} style={offer.wrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={offer.row1}>
        <View style={offer.badge}>
          <Icon name="sparkle" size={11} color={Colors.oxblood} />
          <Text style={offer.badgeText}>Launch</Text>
        </View>
        <View style={offer.titleWrap}>
          <Text style={offer.title}>Go <Text style={{ fontStyle: 'italic', color: Colors.roseSoft }}>Premium</Text> · unlock more reach</Text>
        </View>
        <TouchableOpacity style={offer.ctaBtn} activeOpacity={0.85}>
          <Text style={offer.ctaText}>₹199</Text>
          <Icon name="arrow" size={14} color={Colors.oxblood} />
        </TouchableOpacity>
      </View>
      <View style={offer.row2}>
        <Text style={offer.strikePrice}>₹499</Text>
        <Text style={offer.save}>Save 60%</Text>
        {['Priority', 'Verified badge', '0% fee'].map((p) => (
          <View key={p} style={offer.perkWrap}>
            <Icon name="check" size={11} color={Colors.roseSoft} />
            <Text style={offer.perkText}>{p}</Text>
          </View>
        ))}
        <View style={offer.timer}>
          <Icon name="clock" size={13} color={Colors.roseSoft} />
          {seg(hh)}<Text style={offer.colon}>:</Text>{seg(mm)}<Text style={offer.colon}>:</Text>{seg(ss)}
        </View>
      </View>
    </LinearGradient>
  );
}

const offer = StyleSheet.create({
  wrap: { borderRadius: 22, padding: 16, overflow: 'hidden', ...Shadow.button, shadowColor: Colors.oxblood },
  row1: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.roseSoft, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99 },
  badgeText: { fontSize: 10, fontWeight: '800', color: Colors.oxblood, textTransform: 'uppercase', letterSpacing: 1 },
  titleWrap: { flex: 1 },
  title: { fontFamily: FontFamily.serif, fontSize: 15, fontWeight: '700', color: Colors.cream, lineHeight: 20 },
  ctaBtn: { backgroundColor: Colors.cream, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 0 },
  ctaText: { fontFamily: FontFamily.sans, fontWeight: '800', fontSize: 13, color: Colors.oxblood },
  row2: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  strikePrice: { fontSize: 12, color: 'rgba(232,216,204,0.5)', textDecorationLine: 'line-through', fontWeight: '700' },
  save: { fontSize: 11.5, color: Colors.roseSoft, fontWeight: '700' },
  perkWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  perkText: { fontSize: 11, color: 'rgba(232,216,204,0.8)', fontWeight: '600' },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  seg: { backgroundColor: 'rgba(232,216,204,0.14)', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3, minWidth: 30, alignItems: 'center' },
  segText: { fontFamily: FontFamily.serif, fontSize: 16, fontWeight: '700', color: Colors.cream },
  colon: { color: Colors.roseSoft, fontWeight: '700', fontSize: 12 },
});

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const role = useAuthStore((s) => s.role);
  const setRole = useAuthStore((s) => s.setRole);
  const isBrand = role === 'brand';

  const [campaignList, setCampaignList] = useState<any[]>(mock.campaigns);

  useEffect(() => {
    let active = true;
    const fetchCampaigns = async () => {
      try {
        let res: any[] = [];
        if (role === 'brand') {
          res = await api.campaigns.list() as any[];
        } else {
          res = await api.influencers.marketplace() as any[];
        }
        if (active && res && res.length > 0) {
          const mapped = res.map((c: any) => ({
            id: c.id,
            brand: c.brandName || c.brand?.companyName || "Richy Brand",
            cat: c.campaignType || c.category || "General",
            verified: c.verified || c.brand?.verified || false,
            title: c.title,
            budget: typeof c.budget === 'number' ? `₹${(c.budget / 100).toLocaleString()}` : (c.budget || '₹10,000'),
            deadline: c.deadline || '5 days left',
            applicants: c.applicants || 0,
            tone: c.tone || (c.campaignType === 'Beauty' ? 'rose' : 'ox'),
            about: c.description || c.about,
            deliverables: c.requirements ? c.requirements.split('\n') : ['1 Reel'],
          }));
          setCampaignList(mapped);
        }
      } catch (err) {
        console.error("Failed to load campaigns on HomeScreen:", err);
      }
    };
    fetchCampaigns();
    return () => { active = false; };
  }, [role]);

  const heroSlides = [
    <LinearGradient key="a" colors={[Gradients.rose[0], Gradients.rose[1]]} style={hero.slide} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={hero.top}>
        <Text style={hero.eyebrow}>This week</Text>
        <Text style={hero.heading}>Earn up to <Text style={{ fontStyle: 'italic' }}>₹2.5L</Text> this month</Text>
      </View>
      <View style={hero.bottom}>
        <View style={hero.startBtn}><Text style={hero.startBtnText}>Start applying</Text></View>
        <View style={hero.badge}><Icon name="dollar-sign" size={14} color="#fff" /><Text style={hero.badgeText}>312 open</Text></View>
      </View>
    </LinearGradient>,
    <LinearGradient key="b" colors={[Colors.oxblood2, Colors.oxblood, Colors.oxbloodDeep]} style={hero.slide} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={[hero.eyebrow, { color: Colors.roseSoft }]}>Live challenge</Text>
        <Text style={[hero.heading, { color: Colors.cream }]}>#SummerGlow brand contest</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/arena')} style={hero.arenaBtn} activeOpacity={0.8}>
          <Text style={hero.arenaBtnText}>₹10L prize pool</Text>
          <Icon name="arrow" size={13} color={Colors.roseSoft} />
        </TouchableOpacity>
      </View>
      <Icon name="flame" size={60} color={Colors.roseSoft} />
    </LinearGradient>,
    <LinearGradient key="c" colors={['#8d4750', '#5a1018']} style={hero.slide} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <Text style={[hero.eyebrow, { color: Colors.roseSoft }]}>Creator growth</Text>
      <Text style={[hero.heading, { color: Colors.cream, marginTop: 'auto' }]}>Grow your <Text style={{ fontStyle: 'italic' }}>reach</Text>, your way</Text>
    </LinearGradient>,
  ];

  const cats = [['flame', 'Trending'], ['camera', 'Beauty'], ['briefcase', 'Tech'], ['heart', 'Fashion'], ['bolt', 'Fitness'], ['music', 'Music']];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Sticky header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.greetRow}>
            <View style={styles.sealSmall}><Text style={styles.sealSmallText}>RR</Text></View>
            <View>
              <Text style={styles.greetSub}>{isBrand ? 'Welcome, Magic Webs' : 'Hi, Muskan 👋'}</Text>
              <Text style={styles.greetTitle}>{isBrand ? "Let's find creators" : "Let's get you paid"}</Text>
            </View>
          </View>
          <RoleToggle role={isBrand ? 'brand' : 'creator'} onChange={(r) => setRole(r === 'creator' ? 'influencer' : 'brand')} />
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/marketplace')} activeOpacity={0.8} style={styles.searchBar}>
          <Icon name="search" size={18} color={Colors.rose} />
          <Text style={styles.searchPlaceholder}>{isBrand ? 'Search creators, niches…' : 'Search brands, campaigns…'}</Text>
          <View style={styles.filterBtn}><Icon name="filter" size={16} color={Colors.cream} /></View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: 130 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero carousel */}
        <Carousel slides={heroSlides} height={154} dotColor={Colors.cream} />

        {/* Category pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
          {cats.map(([ic, lb], k) => (
            <TouchableOpacity key={k} onPress={() => router.push('/(tabs)/marketplace')} activeOpacity={0.8} style={styles.catItem}>
              <View style={[styles.catIcon, k === 0 && styles.catIconActive]}>
                <Icon name={ic} size={23} color={k === 0 ? '#fff' : Colors.oxblood} />
              </View>
              <Text style={styles.catLabel}>{lb}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Subscription offer */}
        <View style={styles.section}>
          <OfferBanner />
        </View>

        {/* Live campaigns */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <GradientView variant="rose" style={styles.sectionIcon}>
              <Icon name="briefcase" size={16} color="#fff" />
            </GradientView>
            <Text style={styles.sectionTitle}>Live campaigns</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/marketplace')} activeOpacity={0.7}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.campaignGrid}>
            {campaignList.slice(0, 4).map((cm) => (
              <TouchableOpacity
                key={cm.id}
                onPress={() => router.push({ pathname: '/collab/[id]', params: { id: cm.id } })}
                activeOpacity={0.85}
                style={styles.campaignCard}
              >
                <View style={styles.campaignThumb}>
                  <PlaceholderImage tone={cm.tone} height={92} borderRadius={0} />
                  <View style={styles.campaignApplied}><Text style={styles.campaignAppliedText}>{cm.applicants} applied</Text></View>
                  {cm.verified && <View style={styles.verifiedBadge}><Icon name="verified" size={14} color={Colors.cream} /></View>}
                </View>
                <View style={styles.campaignInfo}>
                  <Text style={styles.campaignBrand} numberOfLines={1}>{cm.brand}</Text>
                  <View style={styles.campaignFooter}>
                    <Text style={styles.campaignBudget}>{cm.budget}</Text>
                    <GradientView variant="rose" style={styles.campaignArrow}>
                      <Icon name="arrow" size={14} color="#fff" />
                    </GradientView>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Happening now */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <GradientView variant="oxblood" style={styles.sectionIcon}>
              <Icon name="bolt" size={16} color={Colors.cream} />
            </GradientView>
            <Text style={styles.sectionTitle}>Happening now</Text>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <View style={styles.activityCard}>
            {mock.activity.map((a, k) => (
              <View key={k} style={[styles.activityRow, k < mock.activity.length - 1 && styles.activityBorder]}>
                <View style={styles.activityAvatarWrap}>
                  <PlaceholderImage tone={a.tone} height={40} width={40} borderRadius={99} />
                  <GradientView variant="rose" style={styles.activityIconBadge}>
                    <Icon name={a.icon} size={11} color="#fff" />
                  </GradientView>
                </View>
                <Text style={styles.activityText} numberOfLines={2}>
                  <Text style={styles.activityWho}>{a.who}</Text>
                  {a.verified && ' ✓ '}
                  <Text style={styles.activityAct}> {a.act} </Text>
                  {a.detail}
                </Text>
                <Text style={styles.activityTime}>{a.time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Trending audio */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <LinearGradient colors={['#e1306c', '#c13584', '#405de6']} style={styles.sectionIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Icon name="music" size={16} color="#fff" />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Trending audio</Text>
            <TouchableOpacity activeOpacity={0.7}><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 13, paddingRight: 18 }}>
            {mock.musics.map((m, k) => (
              <View key={k} style={styles.musicCard}>
                <View style={styles.musicThumb}>
                  <PlaceholderImage tone={m.tone} height={132} width={132} borderRadius={18} />
                  <View style={styles.musicOverlay} />
                  <View style={styles.musicRank}><Text style={styles.musicRankText}>#{k + 1}</Text></View>
                  <View style={styles.musicPlayBtn}><Icon name="play" size={14} color={Colors.oxblood} /></View>
                </View>
                <Text style={styles.musicTitle} numberOfLines={1}>{m.title}</Text>
                <Text style={styles.musicArtist} numberOfLines={1}>{m.artist}</Text>
                <View style={styles.musicReels}>
                  <Icon name="reel" size={12} color={Colors.rose} />
                  <Text style={styles.musicReelsText}>{m.reels} reels</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Tagline footer */}
        <LinearGradient colors={[Colors.oxblood2, Colors.oxblood, Colors.oxbloodDeep]} style={styles.taglineCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.taglineSeal}><Text style={styles.taglineSealText}>RR</Text></View>
          <Text style={styles.tagline}>
            Where creators get{'\n'}
            <Text style={[styles.taglineHighlight, { fontStyle: 'italic' }]}>Rich</Text>
            <Text style={{ opacity: 0.3 }}> · </Text>
            Brands get{'\n'}
            <Text style={[styles.taglineHighlight, { fontStyle: 'italic' }]}>Reach</Text>
          </Text>
          <View style={styles.taglineDivider} />
          <Text style={styles.taglineEst}>Richy Reach · est. 2026</Text>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const hero = StyleSheet.create({
  slide: { flex: 1, padding: 22, flexDirection: 'row', alignItems: 'center', borderRadius: 24 },
  top: { gap: 8 },
  eyebrow: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1.5, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase' },
  heading: { fontFamily: FontFamily.serif, fontSize: 26, fontWeight: '700', color: '#fff', lineHeight: 30 },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 'auto' as any },
  startBtn: { backgroundColor: Colors.oxblood, borderRadius: 999, paddingHorizontal: 17, paddingVertical: 10 },
  startBtnText: { color: Colors.cream, fontSize: 13, fontWeight: '700' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(63,3,11,0.06)', borderRadius: 999, paddingHorizontal: 13, paddingVertical: 6 },
  badgeText: { fontFamily: FontFamily.serif, fontWeight: '700', fontSize: 14, color: Colors.oxblood },
  arenaBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(180,106,116,0.18)', borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7, marginTop: 9, alignSelf: 'flex-start' },
  arenaBtnText: { fontSize: 12.5, color: Colors.roseSoft, fontWeight: '700' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  header: {
    backgroundColor: 'rgba(244,236,228,0.9)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.07)',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  greetRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  sealSmall: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.rose, alignItems: 'center', justifyContent: 'center' },
  sealSmallText: { fontFamily: FontFamily.serif, fontSize: 16, fontWeight: '700', color: Colors.cream },
  greetSub: { fontSize: 11.5, color: Colors.rose, fontWeight: '700' },
  greetTitle: { fontFamily: FontFamily.serif, fontSize: 18, fontWeight: '700', color: Colors.ink },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, ...Shadow.card },
  searchPlaceholder: { flex: 1, fontSize: 14, color: 'rgba(63,3,11,0.4)' },
  filterBtn: { width: 30, height: 30, borderRadius: 9, backgroundColor: Colors.oxblood, alignItems: 'center', justifyContent: 'center' },

  body: { padding: 18 },
  section: { marginTop: 22 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontFamily: FontFamily.serif, fontSize: 20, fontWeight: '700', color: Colors.ink, flex: 1 },
  seeAll: { fontSize: 13, color: Colors.rose, fontWeight: '700' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(180,106,116,0.12)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99 },
  liveDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: Colors.rose },
  liveText: { fontSize: 11, fontWeight: '700', color: Colors.rose },

  catScroll: { marginTop: 18, marginHorizontal: -18 },
  catContent: { paddingHorizontal: 18, gap: 9 },
  catItem: { alignItems: 'center', gap: 6 },
  catIcon: { width: 56, height: 56, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...Shadow.card },
  catIconActive: { ...Shadow.button, shadowColor: Colors.roseDeep, backgroundColor: Colors.rose },
  catLabel: { fontSize: 11, fontWeight: '700', color: Colors.ink },

  campaignGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  campaignCard: { width: (W - 36 - 14) / 2, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', ...Shadow.card },
  campaignThumb: { position: 'relative' },
  campaignApplied: { position: 'absolute', top: 7, right: 7, backgroundColor: 'rgba(42,2,7,0.62)', borderRadius: 99, paddingHorizontal: 7, paddingVertical: 3 },
  campaignAppliedText: { color: Colors.cream, fontSize: 10, fontWeight: '700' },
  verifiedBadge: { position: 'absolute', bottom: 7, left: 7, width: 20, height: 20, borderRadius: 99, backgroundColor: Colors.oxblood, alignItems: 'center', justifyContent: 'center' },
  campaignInfo: { padding: 10 },
  campaignBrand: { fontWeight: '700', fontSize: 13.5, color: Colors.ink },
  campaignFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  campaignBudget: { fontFamily: FontFamily.serif, fontSize: 16, fontWeight: '700', color: Colors.oxblood },
  campaignArrow: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  activityCard: { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 4, ...Shadow.card },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 11 },
  activityBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.07)' },
  activityAvatarWrap: { position: 'relative', flexShrink: 0 },
  activityIconBadge: { position: 'absolute', bottom: -2, right: -2, width: 19, height: 19, borderRadius: 99, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  activityText: { flex: 1, fontSize: 13, color: Colors.ink, lineHeight: 18 },
  activityWho: { fontWeight: '700' },
  activityAct: { color: 'rgba(63,3,11,0.58)' },
  activityTime: { fontSize: 11, color: Colors.rose, fontWeight: '600', flexShrink: 0 },

  musicCard: { width: 132 },
  musicThumb: { position: 'relative' },
  musicOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 18, backgroundColor: 'rgba(42,2,7,0.35)' },
  musicRank: { position: 'absolute', top: 9, left: 9, width: 22, height: 22, borderRadius: 7, backgroundColor: 'rgba(42,2,7,0.55)', alignItems: 'center', justifyContent: 'center' },
  musicRankText: { fontSize: 11, fontWeight: '800', color: Colors.cream },
  musicPlayBtn: { position: 'absolute', bottom: 9, right: 9, width: 30, height: 30, borderRadius: 99, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center' },
  musicTitle: { fontWeight: '700', fontSize: 13, color: Colors.ink, marginTop: 8 },
  musicArtist: { fontSize: 11.5, color: 'rgba(63,3,11,0.5)', marginTop: 1 },
  musicReels: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  musicReelsText: { fontSize: 11, fontWeight: '700', color: Colors.rose },

  taglineCard: { borderRadius: 26, padding: 34, alignItems: 'center', marginTop: 30, overflow: 'hidden' },
  taglineSeal: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(232,216,204,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  taglineSealText: { fontFamily: FontFamily.serif, fontSize: 20, fontWeight: '700', color: Colors.cream },
  tagline: { fontFamily: FontFamily.serif, fontSize: 30, lineHeight: 38, color: Colors.cream, fontWeight: '500', textAlign: 'center' },
  taglineHighlight: { fontWeight: '700', color: Colors.roseSoft },
  taglineDivider: { width: 38, height: 2, backgroundColor: 'rgba(232,216,204,0.25)', marginTop: 18, marginBottom: 12 },
  taglineEst: { fontSize: 10.5, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(232,216,204,0.45)', fontWeight: '700' },
});
