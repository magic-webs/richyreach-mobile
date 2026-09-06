import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, Radius, Shadow, Gradients } from '@/constants/brand';
import { api } from '@/lib/api';
import { Icon } from '@/components/ui/icon';
import { Image } from 'expo-image';
import { useUIStore } from '@/store/ui';
import { useProfilesStore } from '@/store/profiles';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Instagram } from '@hugeicons/core-free-icons';
import LottieView from 'lottie-react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, RefreshCw, Trash2, Zap } from 'lucide-react-native';
import { TactileButton } from '@/components/ui/tactile-button';

// Tell WebBrowser to handle redirects
WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

interface PostDetail {
  id: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  mediaType: string;
  caption: string;
  likeCount: number;
  commentCount: number;
  permalink: string;
  timestamp: string;
  reach?: number;
  impressions?: number;
  saved?: number;
  plays?: number;
}

interface InstagramTabProps {
  profile: any;
}

// ─── SHINE BUTTON SUB-COMPONENT ───────────────────────────────────────
function ShineButton({ isConnecting, isTokenError }: { isConnecting: boolean; isTokenError: boolean }) {
  const shineAnim = useRef(new Animated.Value(-1)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Shine sweep loop
    const shineLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.delay(800),
      ])
    );
    shineLoop.start();

    // Arrow bounce loop: slide right 5px, pause, snap back
    const arrowLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(arrowAnim, {
          toValue: 6,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 4,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(900),
      ])
    );
    arrowLoop.start();

    return () => {
      shineLoop.stop();
      arrowLoop.stop();
    };
  }, [shineAnim, arrowAnim]);

  // Translate shine stripe from -100% to +100% of button width
  const btnWidth = 260;
  const translateX = shineAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-btnWidth, btnWidth],
  });

  return (
    <LinearGradient
      colors={Gradients.instagram as any}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.connectBtn, { overflow: 'hidden' }]}
    >
      {isConnecting ? (
        <ActivityIndicator size="small" color={Colors.white} />
      ) : (
        <>
          <HugeiconsIcon icon={Instagram} size={22} strokeWidth={2} color={Colors.white} />
          <Text style={styles.connectBtnText}>
            {isTokenError ? 'Reconnect Instagram' : 'Connect Instagram'}
          </Text>
          {/* Animated arrow */}
          <Animated.View style={{ transform: [{ translateX: arrowAnim }] }}>
            <ArrowRight size={16} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />
          </Animated.View>
        </>
      )}
      {/* Sweeping shine overlay */}
      {!isConnecting && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 60,
            transform: [{ translateX }],
            backgroundColor: 'rgba(255,255,255,0.28)',
            borderRadius: 2,
          }}
        />
      )}
    </LinearGradient>
  );
}

// ─── MAIN INSTAGRAM TAB COMPONENT ──────────────────────────────────────
export function InstagramTab({ profile }: InstagramTabProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showModal = useUIStore((s) => s.showModal);

  const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const activeInfluencerProfileId = useProfilesStore((s) => s.activeInfluencerProfileId);

  // 1. Query real-time analytics & posts from backend
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['instagramAnalytics', activeInfluencerProfileId],
    queryFn: () => api.social.instagram.getAnalytics(),
    retry: false,
    enabled: !!activeInfluencerProfileId,
  });

  // 2. Refresh/Sync stats mutation
  const refreshMutation = useMutation({
    mutationFn: () => api.social.instagram.refresh(),
    onSuccess: async () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['instagramProfile'] });
      queryClient.invalidateQueries({ queryKey: ['influencerProfile'] });

      // Auto-reload the profile in the state
      const freshProfile = await api.influencers.profile();
      const userId = useAuthStore.getState().session?.user?.id;
      if (freshProfile && userId) {
        await useProfilesStore.getState().loadInfluencerProfiles(userId, freshProfile);
      }

      showModal({
        title: 'Refreshed 🔄',
        message: 'Successfully updated Instagram metrics and recent media.',
      });
    },
    onError: (err: any) => {
      showModal({
        title: 'Refresh Failed',
        message: err.message || 'Could not synchronize stats.',
      });
    },
  });

  // 3. Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: () => api.social.instagram.disconnect(),
    onSuccess: async () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['instagramProfile'] });
      queryClient.invalidateQueries({ queryKey: ['influencerProfile'] });

      // Auto-reload the profile in the state
      const freshProfile = await api.influencers.profile();
      const userId = useAuthStore.getState().session?.user?.id;
      if (freshProfile && userId) {
        await useProfilesStore.getState().loadInfluencerProfiles(userId, freshProfile);
      }

      showModal({
        title: 'Disconnected ❌',
        message: 'Successfully disconnected your Instagram account.',
      });
    },
    onError: (err: any) => {
      showModal({
        title: 'Disconnect Failed',
        message: err.message || 'Could not disconnect Instagram account.',
      });
    },
  });

  // 4. Initiate Instagram OAuth connection flow
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { url } = await api.social.instagram.getLoginUrl();
      const result = await WebBrowser.openAuthSessionAsync(url, 'richyreachmobile://');

      if (result.type === 'success') {
        // Auto-fetch fresh profile details to reload followers and metrics instantly in the UI
        const freshProfile = await api.influencers.profile();
        const userId = useAuthStore.getState().session?.user?.id;
        if (freshProfile && userId) {
          await useProfilesStore.getState().loadInfluencerProfiles(userId, freshProfile);
        }

        refetch();
        queryClient.invalidateQueries({ queryKey: ['instagramProfile'] });
        queryClient.invalidateQueries({ queryKey: ['influencerProfile'] });
      }
    } catch (err: any) {
      console.error('[Instagram Connection Request Failed]', err);
      showModal({
        title: 'Connection Failed',
        message: err.message || 'Could not start Instagram connection flow.',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    showModal({
      title: 'Disconnect Instagram',
      message: 'Are you sure you want to disconnect your Instagram Business profile? This will reset your profile analytics and followers count.',
      actions: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => disconnectMutation.mutate(),
        },
      ],
    });
  };

  // Safe formatting helpers
  const formatNumber = (num?: number) => {
    if (num === undefined) return '0';
    return num.toLocaleString('en-IN');
  };

  // 1. Loading State — Skeleton layout
  if (isLoading) {
    const cellW = (width - 48 - 16) / 3;
    return (
      <View style={{ marginTop: 28, gap: 16 }}>
        {/* Section label */}
        <Skeleton width={100} height={24} borderRadius={6} />
        {/* Posts grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 2 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width={cellW} height={cellW} borderRadius={10} />
          ))}
        </View>
      </View>
    );
  }

  // 2. Disconnected or Error State
  const isConnected = data && data.profile?.username;
  if (isError || !isConnected) {
    const errorMsg = (error as any)?.message || 'Connect your Instagram account to view detailed insights and recent posts.';
    const isTokenError = errorMsg.toLowerCase().includes('token') || errorMsg.toLowerCase().includes('graph api') || errorMsg.toLowerCase().includes('unauthorized');

    return (
      <View style={styles.disconnectedContainer}>
        <LottieView
          source={require('@/assets/lottie-animation/empty-ghost.json')}
          autoPlay
          loop
          style={{ width: 140, height: 140, marginBottom: 8 }}
        />
        <Text style={styles.disconnectedTitle}>Connect Your Instagram</Text>
        <Text style={styles.disconnectedDesc}>
          {isTokenError ? 'Your Instagram token has expired or is invalid. Please reconnect to continue.' : errorMsg}
        </Text>
        <TouchableOpacity
          onPress={handleConnect}
          disabled={isConnecting}
          activeOpacity={0.85}
        >
          <ShineButton isConnecting={isConnecting} isTokenError={isTokenError} />
        </TouchableOpacity>
      </View>
    );
  }

  const { profile: igProfile, analytics, posts } = data;

  return (
    <View style={styles.root}>
      {/* Posts Grid */}
      <Text style={styles.sectionTitle}>Recent Posts</Text>
      {posts.length === 0 ? (
        <View style={styles.noPostsCard}>
          <Text style={styles.noPostsText}>No recent posts found on Instagram.</Text>
        </View>
      ) : (
        <View style={styles.postsGrid}>
          {posts.map((post: PostDetail, index: number) => (
            <TouchableOpacity
              key={post.id}
              style={styles.gridCell}
              activeOpacity={0.9}
              onPress={() => {
                router.push({
                  pathname: '/profile/instagram-post',
                  params: { postId: post.id }
                });
              }}
            >
              <Image
                source={{ uri: post.thumbnailUrl || post.mediaUrl }}
                style={styles.gridImage}
                contentFit="cover"
              />
              {post.mediaType === 'video' ? (
                <View style={styles.cellBadge}>
                  <Icon name="play" size={10} color={Colors.white} />
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Automation entry point */}
      <TouchableOpacity
        onPress={() => router.push('/instagram-automation')}
        activeOpacity={0.9}
        style={styles.automationCard}
      >
        <LinearGradient
          colors={['#5a1018', '#3f030b', '#2a0207']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.automationGradient}
        >
          <View style={styles.automationIcon}>
            <Zap size={19} color={Colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.automationTitle}>Automation</Text>
            <Text style={styles.automationSub}>
              Auto-reply to comments and DMs, and greet new people
            </Text>
          </View>
          <ArrowRight size={18} color={Colors.roseSoft} />
        </LinearGradient>
      </TouchableOpacity>

      {/* View Analytics Dashboard Button */}
      <TouchableOpacity
        onPress={() => setAnalyticsModalVisible(true)}
        style={styles.viewAnalyticsBtn}
        activeOpacity={0.85}
      >
        <Icon name="chart" size={16} color={Colors.oxblood} />
        <Text style={styles.viewAnalyticsBtnText}>View Performance Analytics</Text>
      </TouchableOpacity>
      {/* Sync Button Row */}
      <View style={styles.syncRow}>
        <View style={{ flexDirection: 'row', gap: 10, width: "100%" }}>
          <TactileButton
            onPress={handleDisconnect}
            loading={disconnectMutation.isPending}
            variant="rose"
            size="md"
            fullWidth
            style={{ flex: 1 }}
            contentStyle={{ height: 44, paddingHorizontal: 0 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <Trash2 size={15} color={Colors.white} />
              <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 13, fontWeight: '700', color: Colors.white }}>
                Disconnect
              </Text>
            </View>
          </TactileButton>
          <TactileButton
            onPress={() => refreshMutation.mutate()}
            loading={refreshMutation.isPending}
            variant="primary"
            size="md"
            fullWidth
            style={{ flex: 1 }}
            contentStyle={{ height: 44, paddingHorizontal: 0 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <RefreshCw size={14} color={Colors.white} />
              <Text style={styles.primarySyncBtnText}>Sync Profile</Text>
            </View>
          </TactileButton>
        </View>
      </View>
      {/* Analytics Modal */}
      <Modal
        visible={analyticsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAnalyticsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalDismissTrigger}
            activeOpacity={1}
            onPress={() => setAnalyticsModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Performance Insights</Text>
              <TouchableOpacity onPress={() => setAnalyticsModalVisible(false)}>
                <Icon name="x" size={20} color={Colors.ink} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              <View style={styles.analyticsGridModal}>
                {/* Card 1: Engagement Rate */}
                <View style={styles.analyticsCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardLabel}>Engagement</Text>
                    <Icon name="star" size={14} color={Colors.rose} />
                  </View>
                  <Text style={styles.cardVal}>{analytics.engagementRate}%</Text>
                  <Text style={styles.cardDesc}>Based on recent content</Text>
                </View>

                {/* Card 2: Avg Likes */}
                <View style={styles.analyticsCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardLabel}>Avg. Likes</Text>
                    <Icon name="heart" size={14} color={Colors.rose} />
                  </View>
                  <Text style={styles.cardVal}>{formatNumber(analytics.avgLikes)}</Text>
                  <Text style={styles.cardDesc}>Likes per post average</Text>
                </View>

                {/* Card 3: Reach */}
                <View style={styles.analyticsCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardLabel}>Weekly Reach</Text>
                    <Icon name="users" size={14} color={Colors.rose} />
                  </View>
                  <Text style={styles.cardVal}>{formatNumber(analytics.reach)}</Text>
                  <Text style={styles.cardDesc}>Unique accounts reached</Text>
                </View>

                {/* Card 4: Impressions */}
                <View style={styles.analyticsCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardLabel}>Impressions</Text>
                    <Icon name="eye" size={14} color={Colors.rose} />
                  </View>
                  <Text style={styles.cardVal}>{formatNumber(analytics.impressions)}</Text>
                  <Text style={styles.cardDesc}>Total views on content</Text>
                </View>

                {/* Card 5: Category Niche */}
                <View style={styles.analyticsCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardLabel}>Audience Niche</Text>
                    <Icon name="briefcase" size={14} color={Colors.rose} />
                  </View>
                  <Text style={[styles.cardVal, { fontSize: 16 }]}>{analytics.niche}</Text>
                  <Text style={styles.cardDesc}>Derived from bio topics</Text>
                </View>

                {/* Card 6: Account level */}
                <View style={styles.analyticsCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardLabel}>Tier Bracket</Text>
                    <Icon name="verified" size={14} color={Colors.rose} />
                  </View>
                  <Text style={[styles.cardVal, { textTransform: 'capitalize' }]}>{analytics.level}</Text>
                  <Text style={styles.cardDesc}>Creator tier bracket</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: 12,
  },
  centerWrap: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: 'rgba(63,3,11,0.5)',
    fontFamily: FontFamily.sansMedium,
  },
  disconnectedContainer: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 24,
    alignItems: 'center',
    ...Shadow.card,
    gap: 12,
    marginTop: 10,
  },
  iconCircleBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  disconnectedTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
  },
  disconnectedDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(42,2,7,0.6)',
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  connectBtn: {
    height: 42,
    paddingHorizontal: 20,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  connectBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13.5,
  },
  syncRow: {
    marginTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.06)',
  },
  syncBtn: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadow.card,
  },
  disconnectBtn: {
    backgroundColor: 'rgba(255, 59, 48, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.25)',
    // Remove card shadow so it doesn't leak through the transparent background
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 0,
  },
  disconnectBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: '#FF3B30',
  },
  primarySyncBtn: {
    backgroundColor: Colors.oxblood,
  },
  primarySyncBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  sectionTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 10,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  analyticsCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    padding: 12,
    width: (width - 50) / 2,
    height: 94,
    justifyContent: 'space-between',
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(63,3,11,0.4)',
  },
  cardVal: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  cardDesc: {
    fontSize: 9,
    color: 'rgba(63,3,11,0.4)',
    fontWeight: '500',
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 2,
  },
  gridCell: {
    width: (width - 48 - 16) / 3,
    height: (width - 48 - 16) / 3,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.creamDk,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  cellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPostsCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    padding: 24,
    alignItems: 'center',
    ...Shadow.card,
  },
  noPostsText: {
    fontSize: 13,
    color: 'rgba(63,3,11,0.5)',
    fontWeight: '600',
  },
  automationCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginTop: 18,
    ...Shadow.card,
  },
  automationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  automationIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(243,201,105,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  automationTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.cream,
  },
  automationSub: {
    fontSize: 11.5,
    color: 'rgba(232,216,204,0.62)',
    marginTop: 3,
    lineHeight: 16,
  },

  viewAnalyticsBtn: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    marginTop: 16,
    marginBottom: 20,
    ...Shadow.card,
  },
  viewAnalyticsBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  analyticsGridModal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    paddingVertical: 10,
  },

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismissTrigger: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '88%',
    padding: 20,
    paddingBottom: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },
});
