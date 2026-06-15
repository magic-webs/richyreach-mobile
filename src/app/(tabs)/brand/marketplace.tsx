import { ReelVideoPlayer } from '@/components/brand/marketplace/ReelVideoPlayer';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import { useUIStore } from '@/store/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CreateBrandProfileSheet } from '@/components/brand/home/CreateBrandProfileSheet';
import { SwitchBrandProfileSheet } from '@/components/brand/home/SwitchBrandProfileSheet';
import { InviteCreatorSheet } from '@/components/brand/marketplace/InviteCreatorSheet';
import { MarketplaceBanner } from '@/components/brand/marketplace/MarketplaceBanner';
import { Creator } from '@/components/brand/marketplace/MarketplaceCreatorCard';
import { MarketplaceCreatorList } from '@/components/brand/marketplace/MarketplaceCreatorList';
import { MarketplaceFilters } from '@/components/brand/marketplace/MarketplaceFilters';
import { MarketplaceHeader } from '@/components/brand/marketplace/MarketplaceHeader';
import { MarketplaceSearch } from '@/components/brand/marketplace/MarketplaceSearch';

const FALLBACK_THUMBNAILS = [
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600',
  'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600',
];

interface SwipeableServiceCardProps {
  item: any;
  index: number;
  containerHeight: number;
  activeVideoIndex: number;
  mode: 'creators' | 'services';
  handleSelect: (item: any) => void;
  handleReject: (index: number) => void;
  actionFeedback: { index: number | null; type: 'select' | 'reject' | null };
}

function SwipeableServiceCard({
  item,
  index,
  containerHeight,
  activeVideoIndex,
  mode,
  handleSelect,
  handleReject,
  actionFeedback,
}: SwipeableServiceCardProps) {
  const translateX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX > 120) {
        translateX.value = withTiming(500, { duration: 250 }, () => {
          runOnJS(handleSelect)(item);
          translateX.value = 0;
        });
      } else if (event.translationX < -120) {
        translateX.value = withTiming(-500, { duration: 250 }, () => {
          runOnJS(handleReject)(index);
          translateX.value = 0;
        });
      } else {
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-200, 200], [-8, 8]);
    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate}deg` }
      ],
    };
  });

  const stampSelectStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, 80], [0, 1]);
    return { opacity };
  });

  const stampRejectStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [-80, 0], [1, 0]);
    return { opacity };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.cardItem, animatedStyle, { height: containerHeight }]}>
        {/* Media Cover (using ReelVideoPlayer) */}
        <View style={styles.mediaContainer}>
          <ReelVideoPlayer
            videoUrl={item.videoUrl || item.exampleUrl || 'https://res.cloudinary.com/demo/video/upload/dog.mp4'}
            isPlaying={index === activeVideoIndex && mode === 'services'}
            height={containerHeight}
          />
          <LinearGradient
            colors={['transparent', 'rgba(42, 2, 7, 0.4)', 'rgba(42, 2, 7, 0.92)']}
            style={styles.gradientOverlay}
            pointerEvents="none"
          />

          {/* Category tag */}
          <View style={styles.feedCategoryBadge}>
            <Text style={styles.feedCategoryText}>{item.category}</Text>
          </View>
        </View>

        {/* Details overlay */}
        <View style={styles.cardDetails}>
          {/* Creator attribution */}
          <View style={styles.creatorRow}>
            <PlaceholderImage tone={item.creator.tone} height={40} width={40} borderRadius={20} />
            <View style={styles.creatorMeta}>
              <Text style={styles.creatorNameText}>{item.creator.name}</Text>
              <Text style={styles.creatorHandleText}>{item.creator.handle}</Text>
            </View>
            <View style={styles.creatorStats}>
              <Text style={styles.creatorFollowersVal}>{item.creator.followers}</Text>
              <Text style={styles.creatorFollowersLabel}>Followers</Text>
            </View>
          </View>

          {/* Service texts */}
          <View style={styles.serviceMeta}>
            <Text numberOfLines={1} style={styles.serviceTitleFeed}>{item.name}</Text>
            <Text numberOfLines={3} style={styles.serviceDescFeed}>{item.description}</Text>
          </View>

          {/* Stats row */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCol}>
              <Text style={styles.metricVal}>₹{item.price.toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Price</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={styles.metricVal}>{item.deliveryTime}</Text>
              <Text style={styles.metricLabel}>Delivery</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={styles.metricVal}>{item.creator.rating} ★</Text>
              <Text style={styles.metricLabel}>Rating</Text>
            </View>
          </View>

          {/* Floating actions */}
          {/* <View style={styles.feedActions}>
            <TouchableOpacity
              style={[styles.feedActionBtn, styles.rejectBtn]}
              activeOpacity={0.8}
              onPress={() => handleReject(index)}
            >
              <Icon name="x" size={20} color={Colors.white} />
              <Text style={styles.feedActionBtnText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.feedActionBtn, styles.selectBtn]}
              activeOpacity={0.8}
              onPress={() => handleSelect(item)}
            >
              <Icon name="check" size={20} color={Colors.white} />
              <Text style={styles.feedActionBtnText}>Select</Text>
            </TouchableOpacity>
          </View> */}
        </View>

        {/* Swipe Stamp indicators overlay */}
        <Animated.View style={[styles.stampIndicator, styles.stampSelect, stampSelectStyle]}>
          <Text style={styles.stampText}>SELECT</Text>
        </Animated.View>

        <Animated.View style={[styles.stampIndicator, styles.stampReject, stampRejectStyle]}>
          <Text style={styles.stampText}>SKIP</Text>
        </Animated.View>

        {/* Feedback Badges */}
        {actionFeedback.index === index && actionFeedback.type && (
          <View style={[
            styles.feedbackOverlay,
            actionFeedback.type === 'select' ? styles.feedbackSelect : styles.feedbackReject
          ]}>
            <Text style={styles.feedbackText}>
              {actionFeedback.type === 'select' ? 'SELECTED' : 'SKIPPED'}
            </Text>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

export default function BrandMarketplaceScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ inviteCreator?: string; followers?: string; eng?: string; tone?: string }>();
  const showModal = useUIStore((s) => s.showModal);

  const [mode, setMode] = useState<'creators' | 'services'>('creators');
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');

  const queryClient = useQueryClient();

  // Invite sheet state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Partial<Creator> | null>(null);
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  // Switcher and creation sheets state
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);

  const session = useAuthStore((s) => s.session);
  const {
    brandProfiles,
    activeBrandProfileId,
    loadBrandProfiles,
  } = useProfilesStore();

  const activeBrand = brandProfiles.find((p) => p.id === activeBrandProfileId);

  // Load profiles on mount/refresh
  useEffect(() => {
    if (session?.user?.id) {
      loadBrandProfiles(session.user.id).catch(() => { });
    }
  }, [session?.user?.id, activeBrandProfileId]);

  const { data: rawCreatorsData, isLoading: loading } = useQuery<any>({
    queryKey: ['influencersList'],
    queryFn: () => api.influencers.list().catch(() => []),
  });

  const { data: rawServicesData } = useQuery<any>({
    queryKey: ['influencersServicesList'],
    queryFn: () => api.influencers.services.list().catch(() => []),
  });

  const rawCreators = (rawCreatorsData ?? []) as any[];

  const creators = React.useMemo(() => {
    if (!Array.isArray(rawCreators) || rawCreators.length === 0) {
      return [];
    }
    return rawCreators
      .map((c: any) => {
        if (!c || typeof c !== 'object') return null;

        let fCount = c.followers ? Number(c.followers) : 0;
        let fStr = `${fCount}`;
        if (fCount >= 1000000) fStr = `${(fCount / 1000000).toFixed(1)}M`;
        else if (fCount >= 1000) fStr = `${(fCount / 1000).toFixed(0)}k`;

        return {
          id: c.id || c._id || Math.random().toString(),
          name: c.name || c.instagramHandle || 'Creator',
          handle: `@${c.instagramHandle || 'creator'}`,
          followers: fStr,
          engagement: c.engagementRate ? `${Number(c.engagementRate).toFixed(1)}%` : '5.0%',
          collabs: c.collabs || Math.floor(Math.random() * 20) + 1,
          rating: c.rating ? Number(c.rating).toFixed(1) : '4.8',
          rate: c.pricing ? `₹${(c.pricing / 100).toLocaleString()}` : '₹15,000',
          niche: Array.isArray(c.niche) ? c.niche : c.niche ? [c.niche] : ['Lifestyle'],
          tone: (c.niche === 'Beauty' ? 'rose' : 'ox') as 'rose' | 'ox',
        };
      })
      .filter((item): item is NonNullable<typeof item> => !!item);
  }, [rawCreators]);

  const services = React.useMemo(() => {
    const apiServices = Array.isArray(rawServicesData) ? rawServicesData : [];
    const generatedServices: any[] = [];

    // Process API services if any
    apiServices.forEach((s: any) => {
      let creator = null;
      if (s.influencer) {
        let fCount = s.influencer.followers ? Number(s.influencer.followers) : 0;
        let fStr = `${fCount}`;
        if (fCount >= 1000000) fStr = `${(fCount / 1000000).toFixed(1)}M`;
        else if (fCount >= 1000) fStr = `${(fCount / 1000).toFixed(0)}k`;

        creator = {
          id: s.influencer.id || s.influencerProfileId,
          name: s.influencer.name || s.influencer.instagramHandle || 'Creator',
          handle: `@${s.influencer.instagramHandle || 'creator'}`,
          followers: fStr,
          engagement: s.influencer.engagementRate ? `${Number(s.influencer.engagementRate).toFixed(1)}%` : '5.0%',
          collabs: s.influencer.collabs || Math.floor(Math.random() * 20) + 1,
          rating: s.influencer.rating ? Number(s.influencer.rating).toFixed(1) : '4.8',
          rate: s.influencer.pricing ? `₹${(s.influencer.pricing / 100).toLocaleString()}` : '₹15,000',
          niche: Array.isArray(s.influencer.niche) ? s.influencer.niche : s.influencer.niche ? [s.influencer.niche] : ['Lifestyle'],
          tone: (s.influencer.niche === 'Beauty' ? 'rose' : 'ox') as 'rose' | 'ox',
        };
      } else {
        creator = creators.find((c: any) => c.id === s.influencerProfileId) ||
          creators[Math.floor(Math.random() * creators.length)] || {
          id: 'fallback-creator',
          name: 'Aisha Sharma',
          handle: '@aisha.creates',
          followers: '142k',
          engagement: '4.8%',
          collabs: 18,
          rating: '4.9',
          rate: '₹12,000',
          niche: ['Beauty'],
          tone: 'rose',
        };
      }

      generatedServices.push({
        id: s.id || Math.random().toString(),
        name: s.name || 'Premium Reel Promotion',
        price: typeof s.price === 'number' ? s.price / 100 : 12000,
        deliveryTime: s.deliveryTime || '5 days',
        exampleUrl: s.exampleUrl || s.videoUrl || 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
        videoUrl: s.videoUrl || s.exampleUrl || 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
        thumbnailUrl: s.thumbnailUrl || null,
        category: s.category || creator.niche?.[0] || 'Lifestyle',
        subCategory: s.subCategory || 'Reel Review',
        description: s.description || `Get a dedicated, high-converting shoutout on my Instagram. Includes product integration, tagging, and link in bio.`,
        creator
      });
    });

    return generatedServices;
  }, [rawServicesData, creators]);

  const [containerHeight, setContainerHeight] = useState(0);
  const flatListRef = React.useRef<any>(null);
  const lastOffsetY = React.useRef(0);
  const [actionFeedback, setActionFeedback] = useState<{ index: number | null; type: 'select' | 'reject' | null }>({
    index: null,
    type: null
  });

  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveVideoIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 85,
  }).current;

  // Show/Hide Tab Bar triggers using directional scroll
  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (currentOffset <= 5) {
      useUIStore.getState().setTabBarVisible(true);
    } else if (Math.abs(currentOffset - lastOffsetY.current) > 10) {
      const isScrollingUp = currentOffset < lastOffsetY.current;
      useUIStore.getState().setTabBarVisible(isScrollingUp);
    }
    lastOffsetY.current = currentOffset;
  };

  // Reset tab bar visible state on mount/unmount and mode change
  useEffect(() => {
    const setTabBarVisible = useUIStore.getState().setTabBarVisible;
    if (mode === 'creators') {
      setTabBarVisible(true);
    }
  }, [mode]);

  useEffect(() => {
    return () => {
      useUIStore.getState().setTabBarVisible(true);
    };
  }, []);

  const handleReject = (index: number) => {
    setActionFeedback({ index, type: 'reject' });
    setTimeout(() => {
      setActionFeedback({ index: null, type: null });
      if (flatListRef.current && index < services.length - 1) {
        flatListRef.current.scrollToIndex({
          index: index + 1,
          animated: true,
        });
      }
    }, 350);
  };

  const handleSelect = (service: any) => {
    const index = services.findIndex((s) => s.id === service.id);
    setActionFeedback({ index, type: 'select' });
    setTimeout(() => {
      setActionFeedback({ index: null, type: null });
      handleOpenInvite(service.creator);
    }, 350);
  };

  useEffect(() => {
    if (params.inviteCreator) {
      setSelectedCreator({
        name: params.inviteCreator,
        followers: params.followers || '38k',
        engagement: params.eng || '11.2%',
        tone: (params.tone as 'rose' | 'ox') || 'rose',
        rate: params.inviteCreator === 'Muskan' ? '₹45,000' : '₹12,000'
      });
      setInviteOpen(true);
    }
  }, [params]);

  const handleOpenInvite = (creator: Creator) => {
    setSelectedCreator(creator);
    setInviteOpen(true);
  };

  const handleSendInvite = (campaign: string) => {
    setInviteOpen(false);
    showModal({
      title: 'Invite Sent',
      message: `Successfully invited ${selectedCreator?.name} to collaborate on the "${campaign}" campaign!`,
    });
  };

  const handleMessageCreator = () => {
    setInviteOpen(false);
    showModal({
      title: 'Message Center',
      message: `Opening direct messaging channel with ${selectedCreator?.name}. You can discuss campaign briefs and pricing details here.`,
    });
  };

  const toggleBookmark = (id: string, name: string) => {
    setBookmarked((prev) => {
      const state = !prev[id];
      if (state) {
        showModal({
          title: 'Added to List',
          message: `Saved ${name} to your shortlist.`,
        });
      }
      return { ...prev, [id]: state };
    });
  };

  const filteredCreators = creators.filter((creator: any) => {
    const matchesSearch = creator.name.toLowerCase().includes(search.toLowerCase()) ||
      creator.handle.toLowerCase().includes(search.toLowerCase()) ||
      creator.niche.some((n: string) => n.toLowerCase().includes(search.toLowerCase()));

    if (selectedTier === 'All') return matchesSearch;

    const followersNum = parseFloat(creator.followers.replace('k', '').replace('M', '000'));
    if (selectedTier === 'Mega' && followersNum >= 100) return matchesSearch;
    if (selectedTier === 'Macro' && followersNum >= 50 && followersNum < 100) return matchesSearch;
    if (selectedTier === 'Micro' && followersNum >= 20 && followersNum < 50) return matchesSearch;
    if (selectedTier === 'Nano' && followersNum < 20) return matchesSearch;

    return matchesSearch;
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <MarketplaceHeader
        activeBrandLogo={activeBrand?.logo}
        activeBrandName={activeBrand?.companyName}
        onProfileSwitchPress={() => setIsSwitcherOpen(true)}
      />

      {/* Sleek Mode Switcher */}
      <View style={styles.switcherContainer}>
        <TouchableOpacity
          style={[styles.switcherTab, mode === 'creators' && styles.switcherTabActive]}
          onPress={() => setMode('creators')}
          activeOpacity={0.8}
        >
          <Icon name="users" size={16} color={mode === 'creators' ? Colors.white : Colors.oxblood} />
          <Text style={[styles.switcherText, mode === 'creators' && styles.switcherTextActive]}>Creators</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switcherTab, mode === 'services' && styles.switcherTabActive]}
          onPress={() => setMode('services')}
          activeOpacity={0.8}
        >
          <Icon name="bolt" size={16} color={mode === 'services' ? Colors.white : Colors.oxblood} />
          <Text style={[styles.switcherText, mode === 'services' && styles.switcherTextActive]}>Services Feed</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
          </View>
        </TouchableOpacity>
      </View>

      {mode === 'creators' ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 130 }}
          style={styles.body}
        >
          <MarketplaceSearch search={search} setSearch={setSearch} />

          <MarketplaceFilters selectedTier={selectedTier} setSelectedTier={setSelectedTier} />

          <MarketplaceBanner />

          <MarketplaceCreatorList
            loading={loading}
            creators={filteredCreators}
            bookmarked={bookmarked}
            onToggleBookmark={toggleBookmark}
            onInvite={handleOpenInvite}
          />
        </ScrollView>
      ) : (
        <View
          style={styles.feedWrapper}
          onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
        >
          {containerHeight > 0 && (
            <FlatList
              ref={flatListRef}
              data={services}
              keyExtractor={(item) => item.id}
              pagingEnabled
              showsVerticalScrollIndicator={false}
              snapToInterval={containerHeight}
              snapToAlignment="start"
              decelerationRate="fast"
              removeClippedSubviews={true}
              initialNumToRender={2}
              maxToRenderPerBatch={3}
              windowSize={5}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              renderItem={({ item, index }) => (
                <SwipeableServiceCard
                  item={item}
                  index={index}
                  containerHeight={containerHeight}
                  activeVideoIndex={activeVideoIndex}
                  mode={mode}
                  handleSelect={handleSelect}
                  handleReject={handleReject}
                  actionFeedback={actionFeedback}
                />
              )}
            />
          )}
        </View>
      )}

      <InviteCreatorSheet
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        creator={selectedCreator}
        onMessageFirst={handleMessageCreator}
        onSendInvite={handleSendInvite}
      />

      <CreateBrandProfileSheet
        isOpen={isProfileSheetOpen}
        onClose={() => setIsProfileSheetOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['brandProfile'] });
        }}
        initialData={activeBrand ? {
          companyName: activeBrand.companyName,
          website: activeBrand.website,
          logo: activeBrand.logo || undefined,
          category: activeBrand.category,
          description: activeBrand.description || undefined,
        } : null}
      />

      <SwitchBrandProfileSheet
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        onSwitchSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['brandProfile'] });
          queryClient.invalidateQueries({ queryKey: ['brandDashboard', activeBrandProfileId] });
          queryClient.invalidateQueries({ queryKey: ['brandCampaigns', activeBrandProfileId] });
        }}
        onAddNewProfile={() => {
          setIsSwitcherOpen(false);
          setIsProfileSheetOpen(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    borderRadius: Radius.full,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  switcherTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.full,
    gap: 6,
    position: 'relative',
  },
  switcherTabActive: {
    backgroundColor: Colors.oxblood,
    ...Shadow.card,
  },
  switcherText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: 'rgba(63, 3, 11, 0.65)',
    fontWeight: '600',
  },
  switcherTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  liveIndicator: {
    position: 'absolute',
    top: 6,
    right: 12,
    backgroundColor: Colors.green,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.white,
  },
  feedWrapper: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    ...Shadow.card,
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.05)',
  },
  cardItem: {
    width: '100%',
    position: 'relative',
    backgroundColor: Colors.oxbloodDeep,
  },
  mediaContainer: {
    flex: 1,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
  },
  playOverlay: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  feedCategoryBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(180, 106, 116, 0.95)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  feedCategoryText: {
    fontSize: 10.5,
    fontFamily: FontFamily.sans,
    color: Colors.white,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  creatorMeta: {
    flex: 1,
  },
  creatorNameText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  creatorHandleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 1,
  },
  creatorStats: {
    alignItems: 'flex-end',
  },
  creatorFollowersVal: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: Colors.gold,
    fontWeight: '800',
  },
  creatorFollowersLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 1,
  },
  serviceMeta: {
    gap: 6,
  },
  serviceTitleFeed: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 19,
    fontWeight: '800',
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  serviceDescFeed: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontFamily: FontFamily.sans,
    fontSize: 14.5,
    color: Colors.white,
    fontWeight: '800',
  },
  metricLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9.5,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  feedActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  feedActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadow.button,
  },
  rejectBtn: {
    backgroundColor: 'rgba(180, 106, 116, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectBtn: {
    backgroundColor: Colors.oxblood,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  feedActionBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 13.5,
    color: Colors.white,
    fontWeight: '700',
  },
  feedbackOverlay: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 3,
    transform: [{ rotate: '-12deg' }],
    zIndex: 99,
  },
  feedbackSelect: {
    borderColor: Colors.green,
    backgroundColor: 'rgba(42, 122, 90, 0.9)',
  },
  feedbackReject: {
    borderColor: Colors.rose,
    backgroundColor: 'rgba(180, 106, 116, 0.9)',
  },
  feedbackText: {
    fontFamily: FontFamily.sans,
    fontSize: 22,
    color: Colors.white,
    fontWeight: '900',
    letterSpacing: 2,
  },
  stampIndicator: {
    position: 'absolute',
    top: 60,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
    zIndex: 99,
  },
  stampSelect: {
    left: 32,
    borderColor: Colors.green,
    backgroundColor: 'rgba(42, 122, 90, 0.9)',
    transform: [{ rotate: '-12deg' }],
  },
  stampReject: {
    right: 32,
    borderColor: Colors.rose,
    backgroundColor: 'rgba(180, 106, 116, 0.9)',
    transform: [{ rotate: '12deg' }],
  },
  stampText: {
    fontFamily: FontFamily.sans,
    fontSize: 20,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

