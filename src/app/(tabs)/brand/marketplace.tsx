import { ReelVideoPlayer } from '@/components/brand/marketplace/ReelVideoPlayer';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Image } from 'expo-image';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import { useUIStore } from '@/store/ui';
import { useShortlistStore } from '@/store/shortlist';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SelectedServicesSheet } from '@/components/brand/marketplace/SelectedServicesSheet';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { CreateBrandProfileSheet } from '@/components/brand/home/CreateBrandProfileSheet';
import { SwitchBrandProfileSheet } from '@/components/brand/home/SwitchBrandProfileSheet';
import { InviteCreatorSheet } from '@/components/brand/marketplace/InviteCreatorSheet';
import { Creator } from '@/components/brand/marketplace/MarketplaceCreatorCard';
import { MarketplaceHeader } from '@/components/brand/marketplace/MarketplaceHeader';

interface SwipeableServiceCardProps {
  item: any;
  index: number;
  containerHeight: number;
  activeVideoIndex: number;
  mode: 'creators' | 'services';
  handleSelect: (item: any) => void;
  handleReject: (index: number) => void;
  actionFeedback: { index: number | null; type: 'select' | 'reject' | null };
  handleViewCreator: (id: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  isSelected: boolean;
  onInvite: () => void;
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
  handleViewCreator,
  isBookmarked,
  onToggleBookmark,
  isSelected,
  onInvite,
}: SwipeableServiceCardProps) {
  const translateX = useSharedValue(0);
  const [showDesc, setShowDesc] = useState(false);

  useEffect(() => {
    if (activeVideoIndex !== index) {
      setShowDesc(false);
    }
  }, [activeVideoIndex, index]);

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

  const cardRef = React.useRef<any>(null);

  // Web Touch Handlers:
  const touchStartX = React.useRef(0);
  const touchStartY = React.useRef(0);
  const isDraggingWeb = React.useRef(false);

  const handleTouchStart = (e: any) => {
    if (Platform.OS !== 'web') return;
    touchStartX.current = e.nativeEvent.touches[0].clientX;
    touchStartY.current = e.nativeEvent.touches[0].clientY;
    isDraggingWeb.current = true;
  };

  const handleTouchMove = (e: any) => {
    if (Platform.OS !== 'web' || !isDraggingWeb.current) return;
    const currentX = e.nativeEvent.touches[0].clientX;
    const currentY = e.nativeEvent.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // Drag only horizontally
    if (Math.abs(diffX) > Math.abs(diffY)) {
      translateX.value = diffX;
    }
  };

  const handleTouchEnd = (e: any) => {
    if (Platform.OS !== 'web' || !isDraggingWeb.current) return;
    isDraggingWeb.current = false;
    const finalX = translateX.value;

    if (finalX > 120) {
      translateX.value = withTiming(500, { duration: 250 }, () => {
        runOnJS(handleSelect)(item);
        translateX.value = 0;
      });
    } else if (finalX < -120) {
      translateX.value = withTiming(-500, { duration: 250 }, () => {
        runOnJS(handleReject)(index);
        translateX.value = 0;
      });
    } else {
      translateX.value = withTiming(0, { duration: 200 });
    }
  };

  React.useEffect(() => {
    if (Platform.OS !== 'web' || !cardRef.current) return;
    const element = cardRef.current;

    let startX = 0;
    let startY = 0;
    let isMouseDown = false;

    const onMouseDown = (e: MouseEvent) => {
      startX = e.clientX;
      startY = e.clientY;
      isMouseDown = true;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const diffX = e.clientX - startX;
      const diffY = e.clientY - startY;
      if (Math.abs(diffX) > Math.abs(diffY)) {
        translateX.value = diffX;
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isMouseDown) return;
      isMouseDown = false;
      const finalX = translateX.value;

      if (finalX > 120) {
        translateX.value = withTiming(500, { duration: 250 }, () => {
          runOnJS(handleSelect)(item);
          translateX.value = 0;
        });
      } else if (finalX < -120) {
        translateX.value = withTiming(-500, { duration: 250 }, () => {
          runOnJS(handleReject)(index);
          translateX.value = 0;
        });
      } else {
        translateX.value = withTiming(0, { duration: 200 });
      }
    };

    element.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      element.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [containerHeight, activeVideoIndex, item, index]);

  if (Platform.OS === 'web') {
    return (
      <Animated.View
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={[styles.cardItem, animatedStyle, { height: containerHeight }]}
      >
        {/* Media Cover (using ReelVideoPlayer) */}
        <View style={styles.mediaContainer}>
          <ReelVideoPlayer
            videoUrl={item.videoUrl || item.exampleUrl || 'https://res.cloudinary.com/demo/video/upload/dog.mp4'}
            isPlaying={index === activeVideoIndex && mode === 'services'}
            height={containerHeight}
          />
        </View>

        {/* Right Toolbar Overlay (Instagram Reels Style) */}
        <View style={styles.reelsRightBar}>
          {/* Select Star Button */}
          {/* <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSelect(item)}
            style={styles.reelsActionBtn}
          >
            <View style={[styles.reelsIconCircle, isSelected && styles.reelsIconCircleSelected]}>
              <Icon name="star" size={20} color={isSelected ? Colors.gold : Colors.white} />
            </View>
            <Text style={styles.reelsActionText}>{isSelected ? 'Selected' : 'Select'}</Text>
          </TouchableOpacity> */}

          {/* Bookmark Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onToggleBookmark}
            style={styles.reelsActionBtn}
          >
            <View style={[styles.reelsIconCircle, isBookmarked && styles.reelsIconCircleBookmarked]}>
              <Icon name="bookmark" size={20} color={isBookmarked ? Colors.gold : Colors.white} />
            </View>
            <Text style={styles.reelsActionText}>{isBookmarked ? 'Saved' : 'Save'}</Text>
          </TouchableOpacity>

          {/* Invite Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onInvite}
            style={styles.reelsActionBtn}
          >
            <View style={styles.reelsIconCircle}>
              <Icon name="send" size={18} color={Colors.white} />
            </View>
            <Text style={styles.reelsActionText}>Invite</Text>
          </TouchableOpacity>
        </View>

        {/* Details overlay (Bottom & Left aligned) */}
        <View style={styles.reelsDetailsOverlay}>
          {/* Creator Identity */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleViewCreator(item.creator?.id)}
            style={styles.reelsCreatorRow}
          >
            {item.creator?.avatar ? (
              <Image source={{ uri: item.creator.avatar }} style={styles.reelsCreatorMiniAvatar} contentFit="cover" />
            ) : (
              <PlaceholderImage tone={item.creator?.tone} height={28} width={28} borderRadius={14} />
            )}
            <Text style={styles.reelsCreatorHandle}>{item.creator?.handle}</Text>
            <Icon name="verified" size={14} color={Colors.rose} />
            {item.creator?.niche?.[0] && (
              <View style={styles.reelsNicheBadge}>
                <Text style={styles.reelsNicheText}>{item.creator.niche[0]}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Service Title */}
          <TouchableOpacity activeOpacity={0.85} onPress={() => setShowDesc(!showDesc)}>
            <Text style={styles.reelsServiceTitle} numberOfLines={1}>
              {item.name} {showDesc ? '▾' : '▸'}
            </Text>
          </TouchableOpacity>

          {/* Service Description */}
          {showDesc && item.description && (
            <Text style={styles.reelsServiceDesc}>
              {item.description}
            </Text>
          )}

          {/* Music ticker */}
          <View style={styles.reelsMusicRow}>
            <Icon name="music" size={12} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.reelsMusicText} numberOfLines={1}>
              Original Audio · {item.creator?.name || 'Creator'}
            </Text>
          </View>

          {/* Metrics Pill Grid */}
          <View style={styles.reelsMetricsRow}>
            <View style={styles.reelsMetricBadge}>
              <Text style={styles.reelsMetricLabel}>Price:</Text>
              <Text style={styles.reelsMetricValue}>₹{item.price.toLocaleString()}</Text>
            </View>
            <View style={styles.reelsMetricBadge}>
              <Text style={styles.reelsMetricLabel}>Deliv:</Text>
              <Text style={styles.reelsMetricValue}>{item.deliveryTime}</Text>
            </View>
            <View style={styles.reelsMetricBadge}>
              <Text style={styles.reelsMetricLabel}>Rating:</Text>
              <Text style={styles.reelsMetricValue}>{item.creator.rating} ★</Text>
            </View>
          </View>
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
    );
  }

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.cardItem, animatedStyle, { height: containerHeight }]}>
        {/* Media Cover (using ReelVideoPlayer) */}
        <View style={styles.mediaContainer}>
          {/* <StatusBar style='dark' /> */}
          <ReelVideoPlayer
            videoUrl={item.videoUrl || item.exampleUrl || 'https://res.cloudinary.com/demo/video/upload/dog.mp4'}
            isPlaying={index === activeVideoIndex && mode === 'services'}
            height={containerHeight}
          />
        </View>

        {/* Right Toolbar Overlay (Instagram Reels Style) */}
        <View style={styles.reelsRightBar}>
          {/* Bookmark Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onToggleBookmark}
            style={styles.reelsActionBtn}
          >
            <View style={[styles.reelsIconCircle, isBookmarked && styles.reelsIconCircleBookmarked]}>
              <Icon name="bookmark" size={20} color={isBookmarked ? Colors.gold : Colors.white} />
            </View>
            <Text style={styles.reelsActionText}>{isBookmarked ? 'Saved' : 'Save'}</Text>
          </TouchableOpacity>

          {/* Invite Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onInvite}
            style={styles.reelsActionBtn}
          >
            <View style={styles.reelsIconCircle}>
              <Icon name="send" size={18} color={Colors.white} />
            </View>
            <Text style={styles.reelsActionText}>Invite</Text>
          </TouchableOpacity>
        </View>

        {/* Details overlay (Bottom & Left aligned) */}
        <View style={styles.reelsDetailsOverlay}>
          {/* Creator Identity */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleViewCreator(item.creator?.id)}
            style={styles.reelsCreatorRow}
          >
            {item.creator?.avatar ? (
              <Image source={{ uri: item.creator.avatar }} style={styles.reelsCreatorMiniAvatar} contentFit="cover" />
            ) : (
              <PlaceholderImage tone={item.creator?.tone} height={28} width={28} borderRadius={14} />
            )}
            <Text style={styles.reelsCreatorHandle}>{item.creator?.handle}</Text>
            <Icon name="verified" size={14} color={Colors.rose} />
            {item.creator?.niche?.[0] && (
              <View style={styles.reelsNicheBadge}>
                <Text style={styles.reelsNicheText}>{item.creator.niche[0]}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Service Title */}
          <TouchableOpacity activeOpacity={0.85} onPress={() => setShowDesc(!showDesc)}>
            <Text style={styles.reelsServiceTitle} numberOfLines={1}>
              {item.name} {showDesc ? '▾' : '▸'}
            </Text>
          </TouchableOpacity>

          {/* Service Description */}
          {showDesc && item.description && (
            <Text style={styles.reelsServiceDesc}>
              {item.description}
            </Text>
          )}

          {/* Music ticker */}
          <View style={styles.reelsMusicRow}>
            <Icon name="music" size={12} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.reelsMusicText} numberOfLines={1}>
              Original Audio · {item.creator?.name || 'Creator'}
            </Text>
          </View>

          {/* Metrics Pill Grid */}
          <View style={styles.reelsMetricsRow}>
            <View style={styles.reelsMetricBadge}>
              <Text style={styles.reelsMetricLabel}>Price:</Text>
              <Text style={styles.reelsMetricValue}>₹{item.price.toLocaleString()}</Text>
            </View>
            <View style={styles.reelsMetricBadge}>
              <Text style={styles.reelsMetricLabel}>Deliv:</Text>
              <Text style={styles.reelsMetricValue}>{item.deliveryTime}</Text>
            </View>
            <View style={styles.reelsMetricBadge}>
              <Text style={styles.reelsMetricLabel}>Rating:</Text>
              <Text style={styles.reelsMetricValue}>{item.creator.rating} ★</Text>
            </View>
          </View>
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
  const router = useRouter();

  const mode = 'services';
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');

  const queryClient = useQueryClient();

  // Shortlist store state
  const shortlistedServices = useShortlistStore((s) => s.shortlistedServices);
  const loadShortlist = useShortlistStore((s) => s.loadShortlist);
  const toggleShortlist = useShortlistStore((s) => s.toggleShortlist);

  // Invite sheet state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Partial<Creator> | null>(null);

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

  // Load profiles and shortlist on mount/refresh
  useEffect(() => {
    if (session?.user?.id) {
      loadBrandProfiles(session.user.id).catch(() => { });
      loadShortlist(session.user.id).catch(() => { });
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
    const seen = new Set<string>();
    return rawCreators
      .map((c: any) => {
        if (!c || typeof c !== 'object') return null;

        const id = c.id || c._id || Math.random().toString();
        if (seen.has(id)) {
          return null;
        }
        seen.add(id);

        let fCount = c.followers ? Number(c.followers) : 0;
        let fStr = `${fCount}`;
        if (fCount >= 1000000) fStr = `${(fCount / 1000000).toFixed(1)}M`;
        else if (fCount >= 1000) fStr = `${(fCount / 1000).toFixed(0)}k`;

        return {
          id,
          name: c.name || c.instagramHandle || 'Creator',
          handle: `@${c.instagramHandle || 'creator'}`,
          followers: fStr,
          engagement: c.engagementRate ? `${Number(c.engagementRate).toFixed(1)}%` : '5.0%',
          collabs: c.collabs || Math.floor(Math.random() * 20) + 1,
          rating: c.rating ? Number(c.rating).toFixed(1) : '4.8',
          rate: c.pricing ? `₹${(c.pricing / 100).toLocaleString()}` : '₹15,000',
          niche: Array.isArray(c.niche) ? c.niche : c.niche ? [c.niche] : ['Lifestyle'],
          tone: (c.niche === 'Beauty' ? 'rose' : 'ox') as 'rose' | 'ox',
          avatar: c.avatar || null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => !!item);
  }, [rawCreators]);

  const services = React.useMemo(() => {
    const apiServices = Array.isArray(rawServicesData) ? rawServicesData : [];
    const generatedServices: any[] = [];
    const seen = new Set<string>();

    // Process API services if any
    apiServices.forEach((s: any) => {
      const id = s.id || Math.random().toString();
      if (seen.has(id)) {
        return;
      }
      seen.add(id);

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
          avatar: s.influencer.avatar || null,
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
        id,
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
    itemVisiblePercentThreshold: 50,
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

    if (Platform.OS === 'web' && containerHeight > 0) {
      const index = Math.round(currentOffset / containerHeight);
      if (index !== activeVideoIndex) {
        setActiveVideoIndex(index);
      }
    }
  };

  // Reset tab bar and floating chat visible state on mount/unmount
  useEffect(() => {
    const setTabBarVisible = useUIStore.getState().setTabBarVisible;
    const setFloatingChatVisible = useUIStore.getState().setFloatingChatVisible;
    setTabBarVisible(true);
    setFloatingChatVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      useUIStore.getState().setTabBarVisible(true);
      useUIStore.getState().setFloatingChatVisible(true);
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
      if (!session?.user?.id) return;
      const isAlreadyShortlisted = useShortlistStore.getState().isShortlisted(service.id);
      if (!isAlreadyShortlisted) {
        toggleShortlist(session.user.id, service);
      }
    }, 350);
  };

  const handleViewCreatorProfile = (creatorId: string) => {
    router.push({ pathname: '/brand/marketplace/creator/[id]', params: { id: creatorId } });
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

  const handleToggleBookmark = async (service: any) => {
    if (!session?.user?.id) return;
    await toggleShortlist(session.user.id, service);
    const isNowShortlisted = useShortlistStore.getState().isShortlisted(service.id);
    if (isNowShortlisted) {
      showModal({
        title: 'Added to Shortlist',
        message: `Saved "${service.name}" by ${service.creator?.name || 'Creator'} to your shortlist.`,
      });
    }
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
        selectedCount={shortlistedServices.length}
        onSelectedPress={() => router.push('/brand/shortlist')}
      />

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
                handleViewCreator={handleViewCreatorProfile}
                isBookmarked={shortlistedServices.some((s) => s.id === item.id)}
                onToggleBookmark={() => handleToggleBookmark(item)}
                isSelected={shortlistedServices.some((s) => s.id === item.id)}
                onInvite={() => handleOpenInvite(item.creator)}
              />
            )}
          />
        )}
      </View>

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
  reelsRightBar: {
    position: 'absolute',
    right: 12,
    bottom: 30,
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  reelsAvatarContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  reelsAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  reelsAvatarPlus: {
    position: 'absolute',
    bottom: -3,
    left: '50%',
    transform: [{ translateX: -8 }],
    backgroundColor: Colors.roseDeep,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.white,
  },
  reelsActionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  reelsIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  reelsIconCircleSelected: {
    backgroundColor: 'rgba(243, 201, 105, 0.25)',
    borderColor: Colors.gold,
  },
  reelsIconCircleBookmarked: {
    backgroundColor: 'rgba(243, 201, 105, 0.25)',
    borderColor: Colors.gold,
  },
  reelsActionText: {
    color: Colors.white,
    fontSize: 9.5,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  reelsDetailsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 70,
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
    zIndex: 5,
  },
  reelsCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reelsCreatorMiniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  reelsCreatorHandle: {
    color: Colors.white,
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  reelsNicheBadge: {
    backgroundColor: 'rgba(180, 106, 116, 0.4)',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  reelsNicheText: {
    color: Colors.white,
    fontSize: 9,
    fontFamily: FontFamily.sans,
    fontWeight: '800',
  },
  reelsServiceTitle: {
    color: Colors.white,
    fontFamily: FontFamily.sansMedium,
    fontSize: 16.5,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  reelsServiceDesc: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
    lineHeight: 17,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  reelsMusicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reelsMusicText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontFamily: FontFamily.sansMedium,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  reelsMetricsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  reelsMetricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    gap: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  reelsMetricLabel: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 10,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '600',
  },
  reelsMetricValue: {
    color: Colors.white,
    fontSize: 10.5,
    fontFamily: FontFamily.sansMedium,
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

