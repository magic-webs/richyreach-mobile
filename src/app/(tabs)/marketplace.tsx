import LottieView from 'lottie-react-native';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import React, { useEffect, useState, useRef } from 'react';
import { Animated, FlatList, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';

import { SwitchInfluencerProfileSheet } from '@/components/influencer/SwitchInfluencerProfileSheet';
import { SwitchBrandProfileSheet } from '@/components/brand/home/SwitchBrandProfileSheet';
import { CreateBrandProfileSheet } from '@/components/brand/home/CreateBrandProfileSheet';
import { CreateInfluencerProfileSheet } from '@/components/influencer/CreateInfluencerProfileSheet';
import { PromoBannerCarousel } from '@/components/home/PromoBannerCarousel';
import { TactileButton } from '@/components/ui/tactile-button';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowRightIcon, Bookmark02FreeIcons, ChatIcon, HeartIcon, InstagramIcon, Message02FreeIcons, Navigation03FreeIcons, SendToBackIcon } from '@hugeicons/core-free-icons';

const SORTS = ['Top match', 'Highest pay', 'Ending soon', 'New'];

function StripeOverlay() {
  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', opacity: 0.08 }]}>
      {[...Array(16)].map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: 14,
            height: 400,
            backgroundColor: '#fff',
            transform: [{ rotate: '45deg' }],
            left: i * 32 - 100,
            top: -100,
          }}
        />
      ))}
    </View>
  );
}

function StripedBanner({ tone, budget, costPerCreator, numCreators, imageUrl }: { tone: 'rose' | 'ox' | 'cream'; budget: string; costPerCreator?: number; numCreators?: number; imageUrl?: string | null }) {
  const gradientColors = tone === 'rose'
    ? ['#b46a74', '#8d4750'] as [string, string]
    : tone === 'ox'
      ? ['#5a1018', '#3f030b'] as [string, string]
      : ['#dcc7b8', '#b46a74'] as [string, string];

  return (
    <View style={styles.bannerContainer}>
      {imageUrl ? (
        <>
          <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={['rgba(42, 2, 7, 0.35)', 'transparent']}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </>
      ) : (
        <>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <StripeOverlay />
        </>
      )}

      {/* Bottom badges */}
      <View style={styles.bannerBadges}>
        <View style={styles.payBadge}>
          <Text style={styles.payAmount}>
            {numCreators && numCreators > 1 && costPerCreator
              ? `₹${costPerCreator.toLocaleString('en-IN')}`
              : budget}
          </Text>
          <Text style={styles.payLabel}>
            {numCreators && numCreators > 1 ? 'PER SPOT' : 'PAID'}
          </Text>
        </View>
      </View>
    </View>
  );
}

function CampaignCard({ cm, onPress }: { cm: any; onPress: () => void }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleShare = async () => {
    const pay = cm.numCreators > 1 && cm.costPerCreator
      ? `\u20b9${cm.costPerCreator.toLocaleString('en-IN')} per spot`
      : cm.budget;
    const shareUrl = `https://app.richyreach.com/shared/${cm.id}`;
    try {
      await Share.share({
        title: cm.title,
        message: `\ud83c\udfaf *${cm.title}*\n\n\ud83c\udfe2 Brand: ${cm.brand}\n\ud83d\udcb0 Pay: ${pay}\n\u23f0 Deadline: ${cm.deadline}\n\n\ud83d\udd17 View & apply here:\n${shareUrl}\n\n_Powered by RichyReach_`,
        url: shareUrl,   // iOS picks this up as a separate URL (opens in browser)
      });
    } catch (_) {}
  };

  // Dynamic hashtags based on category & reach
  const hashtags = React.useMemo(() => {
    const defaultTags = ['#PaidCollab'];
    if (cm.cat === 'Beauty') return ['#Beauty', '#PaidCollab', '#20kreach'];
    if (cm.cat === 'Luxury') return ['#Luxury', '#Chronograph', '#80kreach'];
    if (cm.cat === 'Fitness') return ['#Fitness', '#MorningMovement', '#15kreach'];
    if (cm.cat === 'Tech') return ['#Tech', '#Unboxing', '#50kreach'];
    if (cm.cat === 'Fashion') return ['#Fashion', '#AWCollection', '#60kreach'];
    return [`#${cm.cat}`, ...defaultTags];
  }, [cm.cat]);

  return (
    <View style={styles.newCard}>
      {/* Header */}
      <View style={styles.newCardHeader}>
        <View style={styles.newCardHeaderLeft}>
          <View style={[styles.brandAvatar, { backgroundColor: cm.tone === 'rose' ? Colors.roseSoft : Colors.oxblood2, overflow: 'hidden' }]}>
            {cm.brandLogo ? (
              <Image source={{ uri: cm.brandLogo }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <Text style={styles.brandAvatarText}>{cm.brand.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={styles.newBrandName}>{cm.brand}</Text>
              {cm.verified && <Icon name="verified" size={14} color={Colors.rose} />}
              {cm.id === 'lumiere' && (
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>FEATURED</Text>
                </View>
              )}
            </View>
            <Text style={styles.newCardMeta}>
              {cm.cat} · {cm.deadline}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <Icon name="more" size={20} color="rgba(63,3,11,0.5)" />
        </TouchableOpacity>
      </View>

      {/* Banner & Title */}
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <StripedBanner
          tone={cm.tone}
          budget={cm.budget}
          costPerCreator={cm.costPerCreator}
          numCreators={cm.numCreators}
          imageUrl={cm.imageUrl}
        />
        <Text style={styles.cardCampaignTitle}>{cm.title}</Text>
      </TouchableOpacity>

      {/* Action Icons */}
      <View style={styles.actionIconRow}>
        <View style={styles.leftIcons}>
          <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.iconBtn}>
            <HugeiconsIcon
              icon={HeartIcon}
              size={22}
              strokeWidth={2}
              color={liked ? '#e74c3c' : Colors.oxblood}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onPress}>
            <HugeiconsIcon
              icon={Message02FreeIcons}
              size={22}
              strokeWidth={2}
              color={Colors.oxblood}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <HugeiconsIcon
              icon={Navigation03FreeIcons}
              size={22}
              strokeWidth={2}
              color={Colors.oxblood}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setBookmarked(!bookmarked)} style={styles.iconBtn}>
          <HugeiconsIcon
            icon={Bookmark02FreeIcons}
            size={22}
            strokeWidth={2}
            color={bookmarked ? Colors.rose : Colors.oxblood}
          />
        </TouchableOpacity>
      </View>

      {/* Application Count & Description */}
      <View style={styles.cardDetails}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.appliedCount}>{cm.applicants} creators applied</Text>
          {cm.numCreators > 1 && (
            <Text style={styles.totalBudgetCardText}>
              Total: <Text style={{ fontWeight: '700' }}>{cm.budget}</Text> ({cm.numCreators} spots)
            </Text>
          )}
        </View>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {cm.about}
        </Text>
        <View style={styles.hashtagRow}>
          {hashtags.map((tag) => (
            <Text key={tag} style={styles.hashtagText}>
              {tag}
            </Text>
          ))}
        </View>
      </View>

      {/* Footer CTA Buttons */}
      <View style={styles.newCardFooter}>
        <TactileButton
          onPress={onPress}
          text={
            cm.numCreators > 1
              ? `Apply Now · ₹${cm.costPerCreator.toLocaleString('en-IN')}`
              : `Apply Now · ${cm.budget}`
          }
          variant="primary"
          style={{ flex: 1 }}
          fullWidth
        />
        <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.arrowCtaBtn}>
          <HugeiconsIcon
            icon={ArrowRightIcon}
            size={18}
            color={Colors.oxblood}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CampaignSkeletonCard() {
  return (
    <View style={styles.newCard}>
      <View style={styles.newCardHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={{ gap: 4, marginLeft: 8 }}>
          <Skeleton width={100} height={14} borderRadius={4} />
          <Skeleton width={60} height={10} borderRadius={4} />
        </View>
      </View>
      <Skeleton width="100%" height={190} borderRadius={18} style={{ marginVertical: 12 }} />
      <View style={{ gap: 8 }}>
        <Skeleton width={120} height={14} borderRadius={4} />
        <Skeleton width="90%" height={12} borderRadius={4} />
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
  const cat = 'All';
  const [sortBy, setSortBy] = useState('Top match');

  const [headerHeight, setHeaderHeight] = useState(160);
  const lastOffsetY = useRef(0);
  const isHeaderVisible = useRef(true);
  const headerTranslateY = useRef(new Animated.Value(0)).current;

  const handleScroll = (event: any) => {
    const currentOffsetY = event.nativeEvent.contentOffset.y;
    if (currentOffsetY < 0) return;

    const diff = currentOffsetY - lastOffsetY.current;

    if (currentOffsetY <= 50) {
      if (!isHeaderVisible.current) {
        isHeaderVisible.current = true;
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    } else if (diff > 15 && isHeaderVisible.current) {
      isHeaderVisible.current = false;
      Animated.timing(headerTranslateY, {
        toValue: -headerHeight,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (diff < -15 && !isHeaderVisible.current) {
      isHeaderVisible.current = true;
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    lastOffsetY.current = currentOffsetY;
  };

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

  // Load profiles on mount/refresh
  useEffect(() => {
    if (session?.user?.id) {
      if (role === 'brand') {
        loadBrandProfiles(session.user.id).catch(() => { });
      } else {
        loadInfluencerProfiles(session.user.id).catch(() => { });
      }
    }
  }, [session?.user?.id, role, activeBrandProfileId, activeInfluencerProfileId, loadBrandProfiles, loadInfluencerProfiles]);

  const { data: rawCampaignListData, isLoading: loading } = useQuery<any>({
    queryKey: ['campaignsMarketplace', role, role === 'brand' ? activeBrandProfileId : activeInfluencerProfileId],
    queryFn: () => {
      if ((role as string) === 'brand' && activeBrandProfileId) {
        return api.campaigns.list().catch(() => []);
      } else {
        return api.influencers.marketplace().catch(() => []);
      }
    },
  });

  const campaignList = React.useMemo(() => {
    const list = (rawCampaignListData ?? []) as any[];
    if (list.length === 0) {
      return [];
    }
    return list.map((c: any) => {
      const numCreators = c.numCreators || 1;
      const costPerCreator = c.costPerCreator || (typeof c.budget === 'number' ? (c.budget / 100) / Math.max(1, numCreators) : 10000);
      return {
        id: c.id,
        brand: c.brandName || c.brand?.companyName || "Richy Brand",
        cat: c.campaignType || c.category || "General",
        verified: c.verified || c.brand?.verified || false,
        title: c.title,
        budget: typeof c.budget === 'number' ? `₹${(c.budget / 100).toLocaleString()}` : (c.budget || '₹10,000'),
        budgetNum: typeof c.budget === 'number' ? c.budget : (parseInt(c.budget?.replace(/[^\d]/g, '')) || 10000),
        deadline: c.deadline || '5 days left',
        applicants: c.applicants || 0,
        tone: c.tone || (c.campaignType === 'Beauty' ? 'rose' : 'ox'),
        about: c.description || c.about,
        deliverables: c.requirements ? (typeof c.requirements === 'string' ? c.requirements.split('\n') : c.requirements) : ['1 Reel'],
        imageUrl: c.imageUrl || null,
        brandLogo: c.brandLogo || c.brand?.logo || null,
        numCreators,
        costPerCreator,
      };
    });
  }, [rawCampaignListData]);

  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering by category and search query
  const filteredList = React.useMemo(() => {
    return campaignList.filter((c: any) => {
      const matchesCategory = cat === 'All' || c.cat === cat;
      const matchesSearch = !searchQuery ||
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.about?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [campaignList, cat, searchQuery]);

  // Sorting
  const sortedList = React.useMemo(() => {
    let result = [...filteredList];
    if (sortBy === 'Highest pay') {
      result.sort((a, b) => b.budgetNum - a.budgetNum);
    } else if (sortBy === 'Ending soon') {
      const getDays = (str: string) => parseInt(str) || 99;
      result.sort((a, b) => getDays(a.deadline) - getDays(b.deadline));
    } else if (sortBy === 'New') {
      result.reverse();
    }
    return result;
  }, [filteredList, sortBy]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Animated.View
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        style={[
          styles.header,
          {
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <View style={styles.headerTop}>
          <Text style={[{ fontFamily: FontFamily.sansMedium, fontSize: 24, color: Colors.oxblood }]}>Marketplace</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Icon name="search" size={18} color="rgba(63,3,11,0.45)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search campaigns, brands..."
            placeholderTextColor="rgba(63,3,11,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <Icon name="x" size={16} color="rgba(63,3,11,0.45)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort/Filter Pills Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
          {SORTS.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSortBy(s)}
              activeOpacity={0.8}
              style={[styles.sortPillBtn, sortBy === s && styles.sortPillBtnActive]}
            >
              <Text style={[styles.sortPillText, sortBy === s && styles.sortPillTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <FlatList
        data={loading ? [] : sortedList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View>
            {/* Spacer equal to header height so list items start below the header */}
            <View style={{ height: headerHeight }} />

            {/* List Header content / Loading content */}
            <View style={{ paddingHorizontal: 18, paddingTop: 10 }}>
              {loading ? (
                <View>
                  <View style={styles.listHeader}>
                    <Skeleton width={80} height={16} borderRadius={4} />
                  </View>
                  <View style={{ gap: 16 }}>
                    <CampaignSkeletonCard />
                    <CampaignSkeletonCard />
                  </View>
                </View>
              ) : (
                <View style={{ marginBottom: 12 }}>
                  <PromoBannerCarousel position="marketplace_top" />
                  <Text style={styles.openGigsText}>{sortedList.length} open gigs</Text>
                </View>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={{ paddingHorizontal: 18 }}>
              <View style={styles.emptyCard}>
                <LottieView
                  source={require('@/assets/lottie-animation/empty-ghost.json')}
                  autoPlay
                  loop
                  style={{ width: 140, height: 140, marginBottom: 8 }}
                />
                <Text style={styles.emptyStateText}>No campaigns found</Text>
                <Text style={styles.emptyStateSub}>
                  There are currently no active campaigns in the marketplace. Check back later or adjust your category.
                </Text>
              </View>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 18 }}>
            <CampaignCard
              cm={item}
              onPress={() => router.push({ pathname: '/collab/[id]', params: { id: item.id } })}
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />

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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(244,236,228,0.92)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.07)',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 12,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileSwitchTrigger: { flex: 1, marginRight: 12 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  greetSub: { fontSize: 13, color: Colors.rose, fontWeight: '700', fontFamily: FontFamily.sansMedium },
  greetTitle: { fontFamily: FontFamily.serif, fontSize: 32, fontWeight: '700', color: Colors.ink },
  headerRightButtons: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  circleHeaderBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.04)',
  },
  catScroll: { gap: 8 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', ...Shadow.card, borderWidth: 1, borderColor: 'rgba(63,3,11,0.04)' },
  catBtnActive: { backgroundColor: Colors.oxblood, ...Shadow.button, shadowColor: Colors.oxblood, shadowOpacity: 0.25 },
  catBtnText: { fontFamily: FontFamily.sans, fontSize: 13, fontWeight: '700', color: Colors.oxblood },
  catBtnTextActive: { color: Colors.cream },

  sortScroll: { gap: 8, marginTop: 2 },
  sortPillBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: '#fcfcfc', borderWidth: 1, borderColor: 'rgba(63,3,11,0.08)' },
  sortPillBtnActive: { backgroundColor: Colors.oxblood, borderColor: Colors.oxblood },
  sortPillText: { fontFamily: FontFamily.sansMedium, fontSize: 12, fontWeight: '700', color: 'rgba(63,3,11,0.6)' },
  sortPillTextActive: { color: Colors.cream },

  list: { padding: 18, paddingTop: 10 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  openGigsText: { fontSize: 14, color: 'rgba(63,3,11,0.5)', fontWeight: '600', fontFamily: FontFamily.sansMedium, marginTop: 12 },

  // Premium Cards Styles
  newCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 16,
    ...Shadow.card,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.04)',
  },
  newCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  newCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: FontFamily.sans,
  },
  newBrandName: {
    fontFamily: FontFamily.sans,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.ink,
  },
  featuredBadge: {
    backgroundColor: '#e67e22',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
    fontFamily: FontFamily.sans,
  },
  newCardMeta: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63,3,11,0.45)',
    marginTop: 2,
  },
  moreBtn: {
    padding: 4,
  },

  // Banner Container
  bannerContainer: {
    height: 190,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 12,
    marginBottom: 0,
  },
  cardCampaignTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
    marginTop: 12,
    marginBottom: 2,
    lineHeight: 24,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    marginTop: 6,
    marginBottom: 4,
    ...Shadow.card,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Colors.ink,
    marginLeft: 8,
    paddingVertical: 8,
  },
  bannerBadges: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(42,2,7,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  platformText: {
    color: '#fff',
    fontSize: 11.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansMedium,
  },
  payBadge: {
    backgroundColor: 'rgba(42,2,7,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: 'center',
  },
  payAmount: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    fontFamily: FontFamily.sans,
  },
  payLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 0.5,
  },

  // Action Icons
  actionIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  leftIcons: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  iconBtn: {
    padding: 4,
  },

  // Details
  cardDetails: {
    marginTop: 8,
    gap: 5,
  },
  appliedCount: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  totalBudgetCardText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
    color: 'rgba(63,3,11,0.5)',
  },
  cardDesc: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(63,3,11,0.65)',
  },
  hashtagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  hashtagText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.rose,
  },

  // Footer CTA buttons
  newCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  applyCtaBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.oxbloodDeep,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.button,
    shadowColor: Colors.oxblood,
    shadowOpacity: 0.15,
  },
  applyCtaText: {
    color: Colors.cream,
    fontFamily: FontFamily.sans,
    fontSize: 14.5,
    fontWeight: '800',
  },
  arrowCtaBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },

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
