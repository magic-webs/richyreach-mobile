import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const REACH_DATA = [1.2, 2.4, 1.8, 3.6, 4.8, 3.9];
const EARN_DATA = [22, 45, 38, 60, 82, 64];

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeChart, setActiveChart] = useState<'reach' | 'earn'>('reach');

  const chartData = activeChart === 'reach' ? REACH_DATA : EARN_DATA;
  const chartMax = Math.max(...chartData);
  const fmt = (v: number) => activeChart === 'reach' ? `${v}M` : `₹${v}k`;

  const metrics = [
    { icon: 'eye', label: 'Total reach', value: '48.2L', sub: '↑ 24% vs last month', color: 'oxblood' as const },
    { icon: 'dollar-sign', label: 'Total earned', value: '₹6.4L', sub: '↑ 18% vs last month', color: 'rose' as const },
    { icon: 'heart', label: 'Avg. engagement', value: '6.2%', sub: '↑ 0.8% vs avg', color: 'rose' as const },
    { icon: 'star', label: 'Creator rating', value: '4.9★', sub: '28 campaign reviews', color: 'oxblood' as const },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Icon name="back" size={22} color={Colors.oxblood} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerEye}>Creator analytics</Text>
          <Text style={styles.headerTitle}>Insights</Text>
        </View>
        <View style={styles.trendPill}>
          <Icon name="trending" size={14} color="#2a7a5a" />
          <Text style={styles.trendText}>+24% this month</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 18, paddingBottom: 130 }}>
        {/* Key metrics */}
        <View style={styles.metricsGrid}>
          {metrics.map((m, k) => (
            <GradientView key={k} variant={m.color} style={styles.metricCard}>
              <View style={styles.metricIconWrap}>
                <Icon name={m.icon} size={17} color="#fff" />
              </View>
              <Text style={styles.metricValue}>{m.value}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text style={styles.metricSub}>{m.sub}</Text>
            </GradientView>
          ))}
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>{activeChart === 'reach' ? 'Monthly reach' : 'Monthly earnings'}</Text>
            <View style={styles.chartToggle}>
              {(['reach', 'earn'] as const).map((k) => (
                <TouchableOpacity key={k} onPress={() => setActiveChart(k)} style={[styles.chartToggleBtn, activeChart === k && styles.chartToggleBtnActive]}>
                  <Text style={[styles.chartToggleText, activeChart === k && styles.chartToggleTextActive]}>{k === 'reach' ? 'Reach' : 'Earned'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.bars}>
            {chartData.map((v, k) => (
              <View key={k} style={styles.barItem}>
                <Text style={[styles.barLabel, k === 4 && styles.barLabelActive]}>{fmt(v)}</Text>
                <View style={[styles.bar, { height: `${(v / chartMax) * 82}%` as any, backgroundColor: k === 4 ? Colors.rose : 'rgba(63,3,11,0.1)' }]} />
              </View>
            ))}
          </View>
          <View style={styles.barMonths}>
            {MONTHS.map((m, k) => <Text key={k} style={styles.monthLabel}>{m}</Text>)}
          </View>
        </View>

        {/* Platform breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform breakdown</Text>
          {[
            ['Instagram Reels', '2.4M', 78],
            ['Instagram Posts', '0.6M', 18],
            ['YouTube Shorts', '0.2M', 4],
          ].map(([platform, reach, pct], k) => (
            <View key={k} style={[styles.platformRow, k < 2 && { marginBottom: 14 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={styles.platformName}>{platform}</Text>
                <Text style={styles.platformReach}>{reach} · {pct}%</Text>
              </View>
              <View style={styles.platformBar}>
                <View style={[styles.platformFill, { width: `${pct}%` as any }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Audience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audience</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            {[['78%', 'Women'], ['22%', 'Men']].map(([pct, label], k) => (
              <View key={k} style={styles.genderCard}>
                <Text style={styles.genderPct}>{pct}</Text>
                <Text style={styles.genderLabel}>{label}</Text>
              </View>
            ))}
          </View>
          {[['18–24', 38], ['25–34', 42], ['35–44', 14], ['45+', 6]].map(([range, pct], k) => (
            <View key={k} style={[styles.ageRow, { marginBottom: 8 }]}>
              <Text style={styles.ageRange}>{range}</Text>
              <View style={styles.ageBar}>
                <View style={[styles.ageFill, { width: `${pct}%` as any, backgroundColor: k < 2 ? Colors.rose : 'rgba(63,3,11,0.25)' }]} />
              </View>
              <Text style={styles.agePct}>{pct}%</Text>
            </View>
          ))}
        </View>

        {/* Best time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Best time to post</Text>
          <View style={styles.heatGrid}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, k) => {
              const heat = [60, 75, 55, 80, 95, 100, 70][k];
              return (
                <View key={k} style={styles.heatItem}>
                  <View style={[styles.heatBox, { backgroundColor: heat > 85 ? Colors.rose : heat > 65 ? 'rgba(180,106,116,0.35)' : 'rgba(63,3,11,0.07)' }]}>
                    <Text style={[styles.heatText, { color: heat > 65 ? (heat > 85 ? '#fff' : Colors.oxblood) : 'rgba(63,3,11,0.4)' }]}>{heat}%</Text>
                  </View>
                  <Text style={styles.heatDay}>{day}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.peakRow}>
            <Icon name="clock" size={16} color={Colors.rose} />
            <Text style={styles.peakText}>Peak: <Text style={{ fontWeight: '700' }}>Friday 6–9 PM</Text> · Saturday 11 AM–1 PM</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#faf8f5' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 12, backgroundColor: 'rgba(250,248,245,0.94)', borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.08)' },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(63,3,11,0.07)', alignItems: 'center', justifyContent: 'center' },
  headerEye: { fontSize: 11, color: Colors.rose, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  headerTitle: { fontFamily: FontFamily.serif, fontSize: 22, fontWeight: '700', color: Colors.ink, lineHeight: 26 },
  trendPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(42,122,90,0.1)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  trendText: { fontSize: 12, fontWeight: '700', color: '#2a7a5a' },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 18 },
  metricCard: { width: '47%', borderRadius: 18, padding: 13 },
  metricIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  metricValue: { fontFamily: FontFamily.serif, fontSize: 22, fontWeight: '700', color: Colors.cream },
  metricLabel: { fontSize: 11, color: 'rgba(232,216,204,0.7)', fontWeight: '600', marginTop: 4 },
  metricSub: { fontSize: 11, color: '#5fd39b', fontWeight: '700', marginTop: 2 },

  chartCard: { backgroundColor: '#fff', borderRadius: 22, padding: 18, ...Shadow.card, marginBottom: 18 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  chartTitle: { fontFamily: FontFamily.serif, fontSize: 17, fontWeight: '700', color: Colors.ink },
  chartToggle: { flexDirection: 'row', padding: 3, borderRadius: 10, backgroundColor: 'rgba(63,3,11,0.06)' },
  chartToggleBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  chartToggleBtnActive: { backgroundColor: Colors.oxblood },
  chartToggleText: { fontSize: 11.5, fontWeight: '700', color: 'rgba(63,3,11,0.5)' },
  chartToggleTextActive: { color: Colors.cream },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: 110, marginBottom: 10 },
  barItem: { flex: 1, alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' },
  barLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(63,3,11,0.4)' },
  barLabelActive: { color: Colors.oxblood },
  bar: { width: '100%', borderRadius: 6, minHeight: 6 },
  barMonths: { flexDirection: 'row', gap: 10 },
  monthLabel: { flex: 1, textAlign: 'center', fontSize: 10.5, color: 'rgba(63,3,11,0.45)', fontWeight: '600' },

  section: { backgroundColor: '#fff', borderRadius: 22, padding: 16, ...Shadow.card, marginBottom: 18 },
  sectionTitle: { fontFamily: FontFamily.serif, fontSize: 17, fontWeight: '700', color: Colors.ink, marginBottom: 14 },
  platformRow: {},
  platformName: { fontSize: 13, fontWeight: '600', color: Colors.ink },
  platformReach: { fontSize: 13, fontWeight: '700', color: Colors.oxblood },
  platformBar: { height: 7, borderRadius: 99, backgroundColor: 'rgba(63,3,11,0.08)', overflow: 'hidden' },
  platformFill: { height: '100%', borderRadius: 99, backgroundColor: Colors.rose },

  genderCard: { flex: 1, backgroundColor: 'rgba(63,3,11,0.04)', borderRadius: 14, padding: 12, alignItems: 'center' },
  genderPct: { fontFamily: FontFamily.serif, fontSize: 26, fontWeight: '700', color: Colors.oxblood },
  genderLabel: { fontSize: 12, color: 'rgba(63,3,11,0.5)', fontWeight: '600', marginTop: 2 },
  ageRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ageRange: { width: 42, fontSize: 12.5, fontWeight: '600', color: 'rgba(63,3,11,0.6)' },
  ageBar: { flex: 1, height: 6, borderRadius: 99, backgroundColor: 'rgba(63,3,11,0.08)', overflow: 'hidden' },
  ageFill: { height: '100%', borderRadius: 99 },
  agePct: { width: 30, fontSize: 12.5, fontWeight: '700', color: Colors.oxblood, textAlign: 'right' },

  heatGrid: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  heatItem: { flex: 1, alignItems: 'center', gap: 4 },
  heatBox: { width: '100%', aspectRatio: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  heatText: { fontSize: 10, fontWeight: '800' },
  heatDay: { fontSize: 10, color: 'rgba(63,3,11,0.45)', fontWeight: '600' },
  peakRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(63,3,11,0.04)', borderRadius: 12, padding: 10, marginTop: 4 },
  peakText: { fontSize: 13, color: Colors.ink, flex: 1 },
});
