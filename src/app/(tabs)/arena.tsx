import { Carousel } from '@/components/ui/carousel';
import { Chip } from '@/components/ui/chip';
import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { contests, leaderboard, winners } from '@/data/mock';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATS = ['All', 'Reels', 'Photo', 'Challenge', 'UGC'];
const MEDAL_COLORS = ['#f3c969', '#d8d8d8', '#cd8d63'];

export default function ArenaScreen() {
  const insets = useSafeAreaInsets();
  const [cat, setCat] = useState('All');

  const heroSlides = contests.slice(0, 3).map((ct, k) => (
    <View key={k} style={arena.slide}>
      <PlaceholderImage tone={ct.tone} height={210} borderRadius={24} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <LinearGradient colors={['rgba(42,2,7,0.25)', 'rgba(42,2,7,0.92)']} style={arena.slideOverlay} />
      <View style={arena.slideLive}>
        <View style={arena.liveDot} />
        <Text style={arena.liveText}>LIVE NOW</Text>
      </View>
      <View style={arena.slideCountdown}>
        <Icon name="clock" size={12} color={Colors.roseSoft} />
        <Text style={arena.countdownText}>{ct.daysLeft}d left</Text>
      </View>
      <View style={arena.slideBody}>
        <Text style={arena.slideTitle}>{ct.title}</Text>
        <View style={arena.slideFooter}>
          <View>
            <Text style={arena.prizeLabel}>Prize pool</Text>
            <Text style={arena.prizeAmount}>{ct.prize}</Text>
          </View>
          <TouchableOpacity style={arena.enterBtn} activeOpacity={0.85}>
            <Text style={arena.enterBtnText}>Enter</Text>
            <Icon name="bolt" size={15} color={Colors.oxblood} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ));

  const standing = [
    { icon: 'medal', label: 'Your rank', value: '#3', gradient: true },
    { icon: 'ticket', label: 'Entries', value: '12', gradient: false },
    { icon: 'wallet', label: 'Winnings', value: '₹1.2L', gradient: false },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Ambient glows */}
      <View style={styles.glow1} pointerEvents="none" />
      <View style={styles.glow2} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <GradientView variant="rose" style={styles.headerIcon}>
            <Icon name="trophy" size={20} color={Colors.cream} />
          </GradientView>
          <View>
            <Text style={styles.headerTitle}>The Arena</Text>
            <Text style={styles.headerSub}>Compete · win · rank up</Text>
          </View>
        </View>
        <View style={styles.rankPill}>
          <Icon name="medal" size={15} color={Colors.roseSoft} />
          <Text style={styles.rankText}>#3</Text>
          <Icon name="trending" size={13} color="#5fd39b" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: 130 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero carousel */}
        <Carousel slides={heroSlides} height={210} dotColor={Colors.cream} />

        {/* Your standing */}
        <View style={styles.standingRow}>
          {standing.map((s, k) => (
            s.gradient ? (
              <GradientView key={k} variant="rose" style={styles.standingCard}>
                <Icon name={s.icon} size={17} color="#fff" />
                <Text style={[styles.standingValue, { color: '#fff' }]}>{s.value}</Text>
                <Text style={[styles.standingLabel, { color: 'rgba(255,255,255,0.8)' }]}>{s.label}</Text>
              </GradientView>
            ) : (
              <View key={k} style={styles.standingCardGlass}>
                <Icon name={s.icon} size={17} color={Colors.roseSoft} />
                <Text style={styles.standingValue}>{s.value}</Text>
                <Text style={styles.standingLabel}>{s.label}</Text>
              </View>
            )
          ))}
        </View>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
          {CATS.map((c) => <Chip key={c} dark active={cat === c} onPress={() => setCat(c)}>{c}</Chip>)}
        </ScrollView>

        {/* Leaderboard */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="chart" size={19} color={Colors.roseSoft} />
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            <Text style={styles.weekLabel}>This week</Text>
          </View>
          <View style={styles.leaderboardCard}>
            {leaderboard.map((p, k) => (
              <View key={k} style={[styles.leaderRow, p.me && styles.leaderRowMe, k < leaderboard.length - 1 && styles.leaderBorder]}>
                <View style={styles.leaderRank}>
                  {p.rank <= 3 ? (
                    <View style={[styles.medalBadge, { backgroundColor: MEDAL_COLORS[p.rank - 1] }]}>
                      <Text style={styles.medalText}>{p.rank}</Text>
                    </View>
                  ) : (
                    <Text style={styles.rankNum}>{p.rank}</Text>
                  )}
                </View>
                <PlaceholderImage tone={p.tone} height={38} width={38} borderRadius={99} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.leaderNameRow}>
                    <Text style={styles.leaderName} numberOfLines={1}>{p.name}</Text>
                    {p.verified && <Icon name="verified" size={13} color={Colors.roseSoft} />}
                    {p.me && <View style={styles.youTag}><Text style={styles.youTagText}>YOU</Text></View>}
                  </View>
                  <Text style={styles.leaderHandle}>{p.handle}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.leaderPts}>{p.pts.toLocaleString()}</Text>
                  <View style={styles.leaderTrend}>
                    <Icon name="trending" size={11} color={p.up ? '#5fd39b' : 'rgba(232,216,204,0.4)'} />
                    <Text style={[styles.leaderTrendText, { color: p.up ? '#5fd39b' : 'rgba(232,216,204,0.4)' }]}>pts</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Live contests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live contests</Text>
            <View style={styles.livePill}>
              <View style={styles.liveDotRed} />
              <Text style={styles.liveCount}>{contests.length} open</Text>
            </View>
          </View>
          <View style={{ gap: 14 }}>
            {contests.map((ct) => (
              <View key={ct.id} style={styles.contestCard}>
                <View style={styles.contestHeader}>
                  <View style={styles.contestThumb}>
                    <PlaceholderImage tone={ct.tone} height={64} width={64} borderRadius={14} />
                    <View style={styles.contestThumbOverlay}>
                      <Icon name="trophy" size={22} color={Colors.cream} />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.contestTitle} numberOfLines={1}>{ct.title}</Text>
                      <Text style={styles.contestDays}>{ct.daysLeft}d left</Text>
                    </View>
                    <Text style={styles.contestBrand}>by {ct.brand} · {ct.entries.toLocaleString()} entries</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 9 }}>
                      <Text style={styles.contestPrize}>{ct.prize}</Text>
                      <Text style={styles.contestPrizeLabel}>prize pool</Text>
                    </View>
                  </View>
                </View>
                <View style={{ marginTop: 12 }}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${ct.progress * 100}%` as any }]} />
                  </View>
                  <View style={styles.contestFooter}>
                    <Text style={styles.progressLabel}>{Math.round(ct.progress * 100)}% of slots filled</Text>
                    <TouchableOpacity style={styles.enterSmall} activeOpacity={0.85}>
                      <Text style={styles.enterSmallText}>Enter</Text>
                      <Icon name="arrow" size={13} color={Colors.oxblood} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Hall of fame */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="crown" size={19} color="#f3c969" />
            <Text style={styles.sectionTitle}>Hall of fame</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 13 }}>
            {winners.map((w, k) => (
              <View key={k} style={styles.winnerCard}>
                <View style={styles.winnerAvatar}>
                  <PlaceholderImage tone={w.tone as any} height={44} width={44} borderRadius={99} />
                </View>
                <Text style={styles.winnerName}>{w.name}</Text>
                <Text style={styles.winnerContest}>won {w.contest}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 9 }}>
                  <Icon name="trophy" size={14} color="#f3c969" />
                  <Text style={styles.winnerPrize}>{w.prize}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const arena = StyleSheet.create({
  slide: { flex: 1, borderRadius: 24, overflow: 'hidden', position: 'relative', justifyContent: 'flex-end' },
  slideOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  slideLive: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(42,2,7,0.5)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: '#ff6b6b' },
  liveText: { fontSize: 10.5, fontWeight: '800', color: Colors.cream },
  slideCountdown: { position: 'absolute', top: 14, right: 14, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(42,2,7,0.5)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  countdownText: { fontSize: 11, fontWeight: '700', color: Colors.cream },
  slideBody: { position: 'absolute', left: 20, right: 20, bottom: 42 },
  slideTitle: { fontFamily: FontFamily.serif, fontSize: 30, fontWeight: '700', color: Colors.cream },
  slideFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  prizeLabel: { fontSize: 11.5, color: Colors.roseSoft, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  prizeAmount: { fontFamily: FontFamily.serif, fontSize: 22, fontWeight: '700', color: Colors.cream },
  enterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.cream, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  enterBtnText: { fontSize: 13.5, fontWeight: '800', color: Colors.oxblood },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.oxbloodDeep },
  glow1: { position: 'absolute', top: 30, right: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(180,106,116,0.4)' },
  glow2: { position: 'absolute', top: 320, left: -90, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(141,71,80,0.35)' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 12, backgroundColor: 'rgba(42,2,7,0.6)', borderBottomWidth: 0.5, borderBottomColor: 'rgba(232,216,204,0.1)', zIndex: 5 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', ...Shadow.button, shadowColor: Colors.roseDeep },
  headerTitle: { fontFamily: FontFamily.serif, fontSize: 22, fontWeight: '700', color: Colors.cream },
  headerSub: { fontSize: 11, color: 'rgba(232,216,204,0.55)', fontWeight: '600', marginTop: 2 },
  rankPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(232,216,204,0.07)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 0.5, borderColor: 'rgba(232,216,204,0.14)' },
  rankText: { fontFamily: FontFamily.serif, fontSize: 14, fontWeight: '700', color: Colors.cream },

  body: { padding: 16, gap: 0 },

  standingRow: { flexDirection: 'row', gap: 11, marginTop: 18 },
  standingCard: { flex: 1, borderRadius: 18, padding: 12, alignItems: 'flex-start', gap: 2 },
  standingCardGlass: { flex: 1, borderRadius: 18, padding: 12, backgroundColor: 'rgba(232,216,204,0.07)', borderWidth: 0.5, borderColor: 'rgba(232,216,204,0.14)' },
  standingValue: { fontFamily: FontFamily.serif, fontSize: 20, fontWeight: '700', color: Colors.cream, marginTop: 8 },
  standingLabel: { fontSize: 11, color: 'rgba(232,216,204,0.55)', fontWeight: '600' },

  catScroll: { marginTop: 20, marginHorizontal: -18 },
  catContent: { paddingHorizontal: 18, gap: 8 },

  section: { marginTop: 26 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontFamily: FontFamily.serif, fontSize: 20, fontWeight: '600', color: Colors.cream, flex: 1 },
  weekLabel: { fontSize: 12.5, color: Colors.roseSoft, fontWeight: '700' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,107,107,0.14)', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 3 },
  liveDotRed: { width: 6, height: 6, borderRadius: 99, backgroundColor: '#ff6b6b' },
  liveCount: { fontSize: 11, fontWeight: '700', color: '#ff8f8f' },

  leaderboardCard: { backgroundColor: 'rgba(232,216,204,0.07)', borderRadius: 20, padding: 6, borderWidth: 0.5, borderColor: 'rgba(232,216,204,0.14)' },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 11, borderRadius: 14, marginBottom: 2 },
  leaderRowMe: { backgroundColor: 'rgba(180,106,116,0.18)', borderWidth: 0.5, borderColor: 'rgba(180,106,116,0.45)' },
  leaderBorder: {},
  leaderRank: { width: 26, alignItems: 'center' },
  medalBadge: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  medalText: { fontSize: 12, fontWeight: '800', color: Colors.oxbloodDeep },
  rankNum: { fontFamily: FontFamily.serif, fontSize: 15, fontWeight: '700', color: 'rgba(232,216,204,0.5)' },
  leaderNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leaderName: { fontWeight: '700', fontSize: 14, color: Colors.cream },
  leaderHandle: { fontSize: 11.5, color: 'rgba(232,216,204,0.5)' },
  youTag: { backgroundColor: Colors.roseSoft, borderRadius: 99, paddingHorizontal: 6, paddingVertical: 1 },
  youTagText: { fontSize: 9.5, fontWeight: '800', color: Colors.oxblood },
  leaderPts: { fontFamily: FontFamily.serif, fontSize: 15, fontWeight: '700', color: Colors.cream },
  leaderTrend: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  leaderTrendText: { fontSize: 10.5, fontWeight: '700' },

  contestCard: { backgroundColor: 'rgba(232,216,204,0.07)', borderRadius: 20, padding: 14, borderWidth: 0.5, borderColor: 'rgba(232,216,204,0.14)' },
  contestHeader: { flexDirection: 'row', gap: 14 },
  contestThumb: { position: 'relative', flexShrink: 0 },
  contestThumbOverlay: { position: 'absolute', inset: 0, borderRadius: 14, backgroundColor: 'rgba(42,2,7,0.25)', alignItems: 'center', justifyContent: 'center' },
  contestTitle: { fontFamily: FontFamily.serif, fontSize: 18, fontWeight: '700', color: Colors.cream, flex: 1 },
  contestDays: { fontSize: 11, color: Colors.roseSoft, fontWeight: '700' },
  contestBrand: { fontSize: 12, color: 'rgba(232,216,204,0.6)', marginTop: 2 },
  contestPrize: { fontFamily: FontFamily.serif, fontSize: 16, fontWeight: '700', color: Colors.roseSoft },
  contestPrizeLabel: { fontSize: 11, color: 'rgba(232,216,204,0.45)', fontWeight: '600' },
  progressBar: { height: 6, borderRadius: 99, backgroundColor: 'rgba(232,216,204,0.12)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.rose, borderRadius: 99 },
  contestFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  progressLabel: { fontSize: 10.5, color: 'rgba(232,216,204,0.5)' },
  enterSmall: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.cream, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  enterSmallText: { fontSize: 12.5, fontWeight: '800', color: Colors.oxblood },

  winnerCard: { width: 150, backgroundColor: 'rgba(232,216,204,0.07)', borderRadius: 18, padding: 14, borderWidth: 0.5, borderColor: 'rgba(232,216,204,0.14)' },
  winnerAvatar: { width: 48, height: 48, borderRadius: 24, padding: 2, backgroundColor: 'rgba(243,201,105,0.3)', marginBottom: 10 },
  winnerName: { fontWeight: '700', fontSize: 14, color: Colors.cream },
  winnerContest: { fontSize: 11.5, color: 'rgba(232,216,204,0.55)', marginTop: 1 },
  winnerPrize: { fontFamily: FontFamily.serif, fontSize: 15, fontWeight: '700', color: '#f3c969' },
});
