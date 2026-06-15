import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { SwitchInfluencerProfileSheet } from '@/components/influencer/SwitchInfluencerProfileSheet';
import { SwitchBrandProfileSheet } from '@/components/brand/home/SwitchBrandProfileSheet';
import { CreateBrandProfileSheet } from '@/components/brand/home/CreateBrandProfileSheet';
import { CreateInfluencerProfileSheet } from '@/components/influencer/CreateInfluencerProfileSheet';
import { PromoBannerCarousel } from '@/components/home/PromoBannerCarousel';

const CATS = ['All', 'Beauty', 'Fashion', 'Tech', 'Fitness', 'Luxury'];

function CampaignSkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardThumb}>
        <Skeleton width={96} height={104} borderRadius={14} />
      </View>
      <View style={[styles.cardBody, { justifyContent: 'space-between' }]}>
        <Skeleton width={100} height={16} borderRadius={4} />
        <Skeleton width="90%" height={16} borderRadius={4} style={{ marginTop: 4 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <View style={{ gap: 4 }}>
            <Skeleton width={60} height={18} borderRadius={4} />
            <Skeleton width={40} height={12} borderRadius={4} />
          </View>
          <Skeleton width={60} height={14} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

export default function MarketplaceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const session = useAuthStore((s) => s.session);

  const queryClient = useQueryClient();
  const [cat, setCat] = useState('All');

  // Switcher and creation sheets state
  const [isInfluencerSwitcherOpen, setIsInfluencerSwitcherOpen] = useState(false);
  const [isBrandSwitcherOpen, setIsBrandSwitcherOpen] = useState(false);
  const [isCreateBrandOpen, setIsCreateBrandOpen] = useState(false);
  const [isCreateInfluencerOpen, setIsCreateInfluencerOpen] = useState(false);

  const {
    influencerProfiles,
    activeInfluencerProfileId,
    brandProfiles,
    activeBrandProfileId,
    loadBrandProfiles,
    loadInfluencerProfiles,
  } = useProfilesStore();

  const activeInfluencer = influencerProfiles.find((p) => p.id === activeInfluencerProfileId);
  const activeBrand = brandProfiles.find((p) => p.id === activeBrandProfileId);

  const activeAvatar = role === 'brand' ? activeBrand?.logo : activeInfluencer?.avatar;
  const activeHandle = role === 'brand' ? activeBrand?.companyName : activeInfluencer?.instagramHandle;

  // Load profiles on mount/refresh
  useEffect(() => {
    if (session?.user?.id) {
      if (role === 'brand') {
        loadBrandProfiles(session.user.id).catch(() => {});
      } else {
        loadInfluencerProfiles(session.user.id).catch(() => {});
      }
    }
  }, [session?.user?.id, role, activeBrandProfileId, activeInfluencerProfileId]);

  const { data: rawCampaignListData, isLoading: loading } = useQuery<any>({
    queryKey: ['campaignsMarketplace', role, role === 'brand' ? activeBrandProfileId : activeInfluencerProfileId],
    queryFn: () => {
      if ((role as string) === 'brand') {
        return api.campaigns.list().catch(() => []);
      } else {
        return api.influencers.marketplace().catch(() => []);
      }
    },
  });

  const rawCampaignList = (rawCampaignListData ?? []) as any[];

  const campaignList = React.useMemo(() => {
    if (!rawCampaignList || rawCampaignList.length === 0) {
      return [];
    }
    return rawCampaignList.map((c: any) => ({
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
  }, [rawCampaignList]);

  const list = campaignList.filter((c: any) => cat === 'All' || c.cat === cat);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => {
              if (role === 'brand') {
                setIsBrandSwitcherOpen(true);
              } else {
                setIsInfluencerSwitcherOpen(true);
              }
            }}
            activeOpacity={0.8}
            style={styles.profileSwitchTrigger}
          >
            <View style={styles.avatarContainer}>
              {activeAvatar ? (
                <Image source={{ uri: activeAvatar }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>
                    {activeHandle ? activeHandle.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.greetSub}>
                {activeHandle ? `@${activeHandle}` : 'Marketplace'}
              </Text>
              <View style={styles.switchRow}>
                <Text style={styles.greetTitle}>Marketplace</Text>
                <Icon name="chevDown" size={13} color={Colors.oxblood} />
              </View>
            </View>
          </TouchableOpacity>
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
      {loading ? (
        <View style={styles.list}>
          <View style={styles.listHeader}>
            <Skeleton width={80} height={16} borderRadius={4} />
          </View>
          <View style={{ gap: 14 }}>
            <CampaignSkeletonCard />
            <CampaignSkeletonCard />
            <CampaignSkeletonCard />
          </View>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: 130 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={{ marginBottom: 14 }}>
              <PromoBannerCarousel position="marketplace_top" />
              {list.length > 0 && (
                <View style={[styles.listHeader, { marginTop: 14, marginBottom: 0 }]}>
                  <Text style={styles.listCount}>{list.length} campaigns</Text>
                  <TouchableOpacity style={styles.sortBtn} activeOpacity={0.8}>
                    <Text style={styles.sortText}>Top match</Text>
                    <Icon name="chevDown" size={15} color={Colors.oxblood} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Image
                source={require('@/assets/images/empty_campaign.png')}
                style={styles.emptyStateImage}
                contentFit="contain"
              />
              <Text style={styles.emptyStateText}>No campaigns found</Text>
              <Text style={styles.emptyStateSub}>
                There are currently no active campaigns in the marketplace. Check back later or adjust your category.
              </Text>
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
                  <View style={{ flex: 1 }}>
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
      )}

      <SwitchInfluencerProfileSheet
        isOpen={isInfluencerSwitcherOpen}
        onClose={() => setIsInfluencerSwitcherOpen(false)}
        onSwitchSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['campaignsMarketplace'] });
        }}
        onAddNewProfile={() => {
          setIsInfluencerSwitcherOpen(false);
          setIsCreateInfluencerOpen(true);
        }}
      />

      <SwitchBrandProfileSheet
        isOpen={isBrandSwitcherOpen}
        onClose={() => setIsBrandSwitcherOpen(false)}
        onSwitchSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['campaignsMarketplace'] });
        }}
        onAddNewProfile={() => {
          setIsBrandSwitcherOpen(false);
          setIsCreateBrandOpen(true);
        }}
      />

      <CreateBrandProfileSheet
        isOpen={isCreateBrandOpen}
        onClose={() => setIsCreateBrandOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['brandProfile'] });
          queryClient.invalidateQueries({ queryKey: ['campaignsMarketplace'] });
        }}
        initialData={activeBrand ? {
          companyName: activeBrand.companyName,
          website: activeBrand.website,
          logo: activeBrand.logo || undefined,
          category: activeBrand.category,
          description: activeBrand.description || undefined,
        } : null}
      />

      <CreateInfluencerProfileSheet
        isOpen={isCreateInfluencerOpen}
        onClose={() => setIsCreateInfluencerOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['influencerProfile'] });
          queryClient.invalidateQueries({ queryKey: ['campaignsMarketplace'] });
        }}
        initialData={activeInfluencer}
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
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  profileSwitchTrigger: { flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1, marginRight: 12 },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(180,106,116,0.15)',
    borderWidth: 1.5,
    borderColor: Colors.oxblood,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.oxbloodDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    color: Colors.cream,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greetSub: { fontSize: 11, color: Colors.rose, fontWeight: '700' },
  greetTitle: { fontFamily: FontFamily.sansMedium, fontSize: 14.5, fontWeight: '700', color: Colors.ink },
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

  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 10,
    ...Shadow.card,
    gap: 8,
  },
  emptyStateImage: {
    width: 150,
    height: 130,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: FontFamily.serif,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
  },
  emptyStateSub: {
    fontSize: 12.5,
    color: 'rgba(63, 3, 11, 0.5)',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
});
