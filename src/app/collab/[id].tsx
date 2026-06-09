import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, Gradients, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { campaigns } from '@/data/mock';
import { useAuthStore } from '@/store/auth';
import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { SectionHead } from '@/components/ui/section-head';
import { useUIStore } from '@/store/ui';

export default function CollabDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const role = useAuthStore((s) => s.role);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cm, setCm] = useState<any>(campaigns.find((c) => c.id === id) ?? campaigns[0]);

  React.useEffect(() => {
    let active = true;
    const loadDetail = async () => {
      if (!id) return;
      try {
        const c = await api.campaigns.get(id) as any;
        if (active && c && !Array.isArray(c)) {
          setCm((prev: any) => ({
            ...prev,
            id: c.id ?? prev.id,
            brand: c.brandName || c.brand?.companyName || prev.brand,
            cat: c.campaignType || c.category || prev.cat,
            verified: c.verified ?? c.brand?.verified ?? prev.verified,
            title: c.title || prev.title,
            budget: typeof c.budget === 'number' ? `₹${(c.budget / 100).toLocaleString()}` : (c.budget || prev.budget),
            deadline: c.deadline || prev.deadline,
            applicants: c.applicants || prev.applicants,
            tone: c.tone || prev.tone,
            about: c.description || c.about || prev.about,
            deliverables: c.requirements ? (typeof c.requirements === 'string' ? c.requirements.split('\n') : c.requirements) : prev.deliverables,
            platform: c.platform || prev.platform,
            type: c.campaignType || prev.type,
            followers: c.followers || prev.followers,
          }));
        }
      } catch (err: any) {
        const msg: string = err?.message ?? '';
        if (!msg.includes('Forbidden') && !msg.includes('401') && !msg.includes('403')) {
          console.error("Failed to load campaign detail from backend:", err);
        }
        // campaign already seeded from mock via router params — no action needed
      }
    };
    loadDetail();
    return () => { active = false; };
  }, [id]);

  const handleApply = async () => {
    if (role !== 'influencer') {
      useUIStore.getState().showModal({ title: 'Info', message: 'Only influencers can apply to campaigns' });
      return;
    }
    if (applied) return;
    setLoading(true);
    try {
      await api.influencers.apply(id);
      setApplied(true);
      useUIStore.getState().showModal({ title: 'Success', message: 'Application submitted successfully!' });
    } catch (err: any) {
      useUIStore.getState().showModal({ title: 'Error', message: err.message || 'Failed to submit application' });
    } finally {
      setLoading(false);
    }
  };

  const facts = [
    { icon: 'reel', label: 'Platform', value: cm.platform },
    { icon: 'camera', label: 'Deliverables', value: cm.type },
    { icon: 'users', label: 'Min. audience', value: cm.followers },
    { icon: 'calendar', label: 'Timeline', value: cm.deadline },
  ];

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <View style={styles.heroWrap}>
          <PlaceholderImage tone={cm.tone} height={300} borderRadius={0} />
          <LinearGradient
            colors={['rgba(42,2,7,0.45)', 'transparent', 'rgba(42,2,7,0.85)']}
            style={styles.heroOverlay}
          />
          {/* Top nav */}
          <View style={[styles.heroNav, { top: Math.max(insets.top, 16) + 12 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.navBtn} activeOpacity={0.8}>
              <Icon name="back" size={22} color={Colors.oxblood} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['share', 'bookmark'].map((ic) => (
                <TouchableOpacity key={ic} style={styles.navBtn} activeOpacity={0.8}>
                  <Icon name={ic} size={19} color={Colors.oxblood} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* Title overlay */}
          <View style={styles.heroTitle}>
            <View style={styles.brandRow}>
              <PlaceholderImage tone="cream" height={30} width={30} borderRadius={99} />
              <Text style={styles.brandName}>{cm.brand}</Text>
              {cm.verified && <Icon name="verified" size={15} color={Colors.roseSoft} />}
              <Text style={styles.reachText}>· {cm.followers} reach</Text>
            </View>
            <Text style={styles.campaignTitle}>{cm.title}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Budget strip */}
          <View style={styles.budgetStrip}>
            <View>
              <Text style={styles.budgetLabel}>Paid collaboration</Text>
              <Text style={styles.budgetAmount}>{cm.budget}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={styles.deadlineRow}>
                <Icon name="clock" size={14} color={Colors.roseSoft} />
                <Text style={styles.deadlineText}>{cm.deadline}</Text>
              </View>
              <Text style={styles.applicantsText}>{cm.applicants} creators applied</Text>
            </View>
          </View>

          {/* Facts */}
          <View style={styles.factsWrap}>
            {facts.map((f) => (
              <View key={f.label} style={styles.factCard}>
                <Icon name={f.icon} size={16} color={Colors.rose} />
                <Text style={styles.factValue}>{f.value}</Text>
                <Text style={styles.factLabel}>{f.label}</Text>
              </View>
            ))}
          </View>

          {/* About */}
          <View style={{ marginTop: 24 }}>
            <SectionHead title="The brief" action={null} />
            <Text style={styles.aboutText}>{cm.about}</Text>
          </View>

          {/* Deliverables */}
          <View style={{ marginTop: 24 }}>
            <SectionHead title="What you'll deliver" action={null} />
            <View style={styles.deliverablesList}>
              {cm.deliverables.map((d: string, k: number) => (
                <View key={k} style={[styles.deliverableRow, k < cm.deliverables.length - 1 && styles.deliverableBorder]}>
                  <GradientView variant="rose" style={styles.checkCircle}>
                    <Icon name="check" size={14} color="#fff" />
                  </GradientView>
                  <Text style={styles.deliverableText}>{d}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Brand card */}
          <View style={{ marginTop: 24 }}>
            <SectionHead title="About the brand" action={null} />
            <View style={styles.brandCard}>
              <PlaceholderImage tone={cm.tone} height={52} width={52} borderRadius={14} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Text style={styles.brandCardName}>{cm.brand}</Text>
                  {cm.verified && <Icon name="verified" size={14} color={Colors.rose} />}
                </View>
                <Text style={styles.brandCardMeta}>{cm.cat} · 12 active campaigns · 4.9 ★</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/chat/[id]', params: { id: cm.id } })}
                style={styles.messageBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.messageBtnText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky apply bar */}
      <LinearGradient
        colors={['rgba(244,236,228,0)', 'rgba(244,236,228,0.95)']}
        style={[styles.applyBar, { paddingBottom: insets.bottom + 14 }]}
      >
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/chat/[id]', params: { id: cm.id } })}
          style={styles.chatBtn}
          activeOpacity={0.8}
        >
          <Icon name="chat" size={22} color={Colors.oxblood} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleApply}
          activeOpacity={0.85}
          disabled={loading || applied}
          style={[styles.applyBtn, applied && styles.applyBtnDone, loading && { opacity: 0.6 }]}
        >
          <Text style={styles.applyBtnText}>
            {loading ? 'Submitting…' : (applied ? '✓ Application sent' : `Apply now · ${cm.budget}`)}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  heroWrap: { position: 'relative', height: 300 },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroNav: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 2 },
  navBtn: { width: 40, height: 40, borderRadius: 99, backgroundColor: 'rgba(244,236,228,0.92)', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { position: 'absolute', left: 20, right: 20, bottom: 22 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  brandName: { fontWeight: '700', fontSize: 14, color: Colors.cream },
  reachText: { fontSize: 12, color: 'rgba(232,216,204,0.7)' },
  campaignTitle: { fontFamily: FontFamily.serif, fontSize: 24, fontWeight: '600', color: Colors.cream, lineHeight: 28 },

  body: { paddingHorizontal: 18, paddingTop: 20 },

  budgetStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.oxblood, borderRadius: 18, padding: 16 },
  budgetLabel: { fontSize: 11.5, color: Colors.roseSoft, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  budgetAmount: { fontFamily: FontFamily.serif, fontSize: 28, fontWeight: '700', color: Colors.cream, marginTop: 3 },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  deadlineText: { fontSize: 12, color: Colors.cream, fontWeight: '600' },
  applicantsText: { fontSize: 11.5, color: 'rgba(232,216,204,0.6)', marginTop: 3 },

  factsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  factCard: { flex: 1, minWidth: '40%', backgroundColor: '#fff', borderRadius: 14, padding: 12, ...Shadow.card },
  factValue: { fontFamily: FontFamily.serif, fontSize: 15, fontWeight: '700', color: Colors.ink, marginTop: 6 },
  factLabel: { fontSize: 11, color: 'rgba(63,3,11,0.5)', fontWeight: '600', marginTop: 1 },

  aboutText: { fontSize: 14.5, lineHeight: 24, color: 'rgba(42,2,7,0.78)' },

  deliverablesList: { backgroundColor: '#fff', borderRadius: 18, paddingVertical: 6, paddingHorizontal: 4, ...Shadow.card },
  deliverableRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
  deliverableBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.07)' },
  checkCircle: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  deliverableText: { fontSize: 14, color: Colors.ink, fontWeight: '500' },

  brandCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 18, padding: 16, ...Shadow.card },
  brandCardName: { fontWeight: '700', fontSize: 15, color: Colors.ink },
  brandCardMeta: { fontSize: 12.5, color: 'rgba(63,3,11,0.55)', marginTop: 2 },
  messageBtn: { borderWidth: 1.5, borderColor: Colors.oxblood, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 8 },
  messageBtnText: { fontWeight: '700', fontSize: 12.5, color: Colors.oxblood },

  applyBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 14, flexDirection: 'row', gap: 12, alignItems: 'center' },
  chatBtn: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...Shadow.card },
  applyBtn: { flex: 1, height: 52, borderRadius: 16, backgroundColor: Colors.oxblood, alignItems: 'center', justifyContent: 'center', ...Shadow.button },
  applyBtnDone: { backgroundColor: Colors.roseDeep },
  applyBtnText: { fontFamily: FontFamily.sans, fontWeight: '800', fontSize: 16, color: Colors.cream },
});
