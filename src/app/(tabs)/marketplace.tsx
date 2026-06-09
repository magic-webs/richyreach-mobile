import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { campaigns } from '@/data/mock';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATS = ['All', 'Beauty', 'Fashion', 'Tech', 'Fitness', 'Luxury'];

export default function MarketplaceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const [cat, setCat] = useState('All');
  const [campaignList, setCampaignList] = useState<any[]>(campaigns);

  React.useEffect(() => {
    let active = true;
    const fetchCampaigns = async () => {
      try {
        let res: any[] = [];
        if ((role as string) === 'brand') {
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
      } catch (err: any) {
        // Silently fall back to mock data for auth/role errors — no console noise
        const msg: string = err?.message ?? '';
        const isPermissionError = msg.includes('Forbidden') || msg.includes('401') || msg.includes('403');
        if (!isPermissionError) {
          console.warn("MarketplaceScreen: could not load live campaigns, showing mock data.", err);
        }
        // campaignList already initialized with mock campaigns — nothing to do
      }
    };
    fetchCampaigns();
    return () => { active = false; };
  }, [role]);

  const list = campaignList.filter((c) => cat === 'All' || c.cat === cat);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <GradientView variant="oxblood" style={styles.headerIcon}>
            <Icon name="briefcase" size={23} color={Colors.cream} />
          </GradientView>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerEye}>{(role as string) === 'brand' ? 'Find your creator' : 'Discover collabs'}</Text>
            <Text style={styles.headerTitle}>Marketplace</Text>
          </View>
          <TouchableOpacity style={styles.filterIconBtn} activeOpacity={0.8}>
            <Icon name="filter" size={20} color={Colors.oxblood} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Icon name="search" size={18} color={Colors.rose} />
          <Text style={styles.searchPlaceholder}>Search campaigns…</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setCat(c)}
              activeOpacity={0.8}
              style={[styles.catBtn, cat === c && styles.catBtnActive]}
            >
              <Text style={[styles.catBtnText, cat === c && styles.catBtnTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Campaign list */}
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: 130 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listCount}>{list.length} campaigns</Text>
            <TouchableOpacity style={styles.sortBtn} activeOpacity={0.8}>
              <Text style={styles.sortText}>Top match</Text>
              <Icon name="chevDown" size={15} color={Colors.oxblood} />
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: cm }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/collab/[id]', params: { id: cm.id } })}
            activeOpacity={0.85}
            style={styles.card}
          >
            <View style={styles.cardThumb}>
              <PlaceholderImage tone={cm.tone} height={104} width={96} borderRadius={14} />
              {cm.verified && (
                <View style={styles.verifiedBadge}>
                  <Icon name="verified" size={15} color={Colors.cream} />
                </View>
              )}
              <View style={styles.catPill}>
                <Text style={styles.catPillText}>{cm.cat}</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.brandName} numberOfLines={1}>{cm.brand}</Text>
              <Text style={styles.campaignTitle} numberOfLines={2}>{cm.title}</Text>
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.budget}>{cm.budget}</Text>
                  <View style={styles.deadlineRow}>
                    <Icon name="clock" size={12} color={Colors.rose} />
                    <Text style={styles.deadline}>{cm.deadline}</Text>
                  </View>
                </View>
                <Text style={styles.applied}>{cm.applicants} applied</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  header: {
    backgroundColor: 'rgba(244,236,228,0.9)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.07)',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', ...Shadow.button, shadowColor: Colors.oxblood, shadowOpacity: 0.3 },
  headerEye: { fontSize: 11, color: Colors.rose, fontWeight: '700' },
  headerTitle: { fontFamily: FontFamily.serif, fontSize: 24, fontWeight: '700', color: Colors.ink, lineHeight: 28 },
  filterIconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...Shadow.card },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, ...Shadow.card },
  searchPlaceholder: { fontSize: 14, color: 'rgba(63,3,11,0.4)', flex: 1 },
  catScroll: { gap: 8 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: '#fff', ...Shadow.card },
  catBtnActive: { backgroundColor: Colors.oxblood, ...Shadow.button, shadowColor: Colors.oxblood, shadowOpacity: 0.25 },
  catBtnText: { fontFamily: FontFamily.sans, fontSize: 12.5, fontWeight: '700', color: Colors.oxblood },
  catBtnTextActive: { color: Colors.cream },

  list: { padding: 18 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  listCount: { fontSize: 13, color: 'rgba(63,3,11,0.6)', fontWeight: '600' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sortText: { fontSize: 13, color: Colors.oxblood, fontWeight: '700' },

  card: { flexDirection: 'row', gap: 14, backgroundColor: '#fff', borderRadius: 20, padding: 12, ...Shadow.card },
  cardThumb: { position: 'relative', flexShrink: 0 },
  verifiedBadge: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 99, backgroundColor: Colors.oxblood, alignItems: 'center', justifyContent: 'center' },
  catPill: { position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(42,2,7,0.55)', borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
  catPillText: { color: Colors.cream, fontSize: 9.5, fontWeight: '700' },
  cardBody: { flex: 1, minWidth: 0, justifyContent: 'space-between' },
  brandName: { fontWeight: '700', fontSize: 14.5, color: Colors.ink },
  campaignTitle: { fontSize: 13, color: 'rgba(63,3,11,0.65)', marginTop: 3, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 8 },
  budget: { fontFamily: FontFamily.serif, fontSize: 18, fontWeight: '700', color: Colors.oxblood },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  deadline: { fontSize: 11, color: Colors.rose, fontWeight: '600' },
  applied: { fontSize: 11.5, color: 'rgba(63,3,11,0.5)', fontWeight: '600' },
});
