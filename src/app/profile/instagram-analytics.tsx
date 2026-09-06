import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Colors, FontFamily, Radius, Shadow, Gradients } from '@/constants/brand';
import { api } from '@/lib/api';
import { Icon } from '@/components/ui/icon';
import { Instagram as InstagramGlyph } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Image } from 'expo-image';
import { useUIStore } from '@/store/ui';

const { width } = Dimensions.get('window');
const GRID_SIZE = (width - 48) / 3;

interface PostDetail {
  id: string;
  mediaUrl: string;
  mediaType: string;
  caption: string;
  likeCount: number;
  commentCount: number;
  permalink: string;
  timestamp: string;
}

export default function InstagramAnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const showModal = useUIStore((s) => s.showModal);
  
  const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);

  // 1. Query real-time analytics & posts from backend
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['instagramAnalytics'],
    queryFn: () => api.social.instagram.getAnalytics(),
    retry: false,
  });

  // 2. Refresh stats mutation
  const refreshMutation = useMutation({
    mutationFn: () => api.social.instagram.refresh(),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['instagramProfile'] });
      queryClient.invalidateQueries({ queryKey: ['influencerProfile'] });
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

  // 3. Reconnect if token expires
  const [isReconnecting, setIsReconnecting] = useState(false);
  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      const { url } = await api.social.instagram.getLoginUrl();
      const result = await WebBrowser.openAuthSessionAsync(url, 'richyreachmobile://');
      if (result.type === 'success') {
        refetch();
        queryClient.invalidateQueries({ queryKey: ['instagramProfile'] });
        queryClient.invalidateQueries({ queryKey: ['influencerProfile'] });
      }
    } catch (err: any) {
      showModal({
        title: 'Connection Failed',
        message: err.message || 'Failed to start login session.',
      });
    } finally {
      setIsReconnecting(false);
    }
  };

  const handleOpenPermalink = async (url: string) => {
    if (!url) return;
    await WebBrowser.openBrowserAsync(url);
  };

  // Safe formatting helpers
  const formatNumber = (num?: number) => {
    if (num === undefined) return '0';
    return num.toLocaleString('en-IN');
  };

  const formatRelativeTime = (timeString?: string) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.loadingRoot, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrowLeft" size={20} color={Colors.oxblood} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Instagram Insights</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={Colors.oxblood} />
          <Text style={styles.loadingText}>Fetching real-time metrics...</Text>
        </View>
      </View>
    );
  }

  // Error/Disconnected fallback
  if (isError || !data) {
    const errorMsg = (error as any)?.message || 'Connect your Instagram account to view detailed insights.';
    const isTokenError = errorMsg.toLowerCase().includes('token') || errorMsg.toLowerCase().includes('graph api') || errorMsg.toLowerCase().includes('unauthorized');

    return (
      <View style={[styles.loadingRoot, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrowLeft" size={20} color={Colors.oxblood} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Instagram Insights</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Analytics Unavailable</Text>
          <Text style={styles.errorSub}>{errorMsg}</Text>
          <TouchableOpacity
            style={styles.reconnectBtn}
            onPress={handleReconnect}
            disabled={isReconnecting}
          >
            {isReconnecting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.reconnectBtnText}>
                {isTokenError ? 'Reconnect Instagram' : 'Go to Profile Connect'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { profile, analytics, posts } = data;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Icon name="arrowLeft" size={20} color={Colors.oxblood} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Instagram Insights</Text>
        <TouchableOpacity
          onPress={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          style={styles.headerRefreshBtn}
          activeOpacity={0.8}
        >
          {refreshMutation.isPending ? (
            <ActivityIndicator size="small" color={Colors.oxblood} />
          ) : (
            <Icon name="clock" size={20} color={Colors.oxblood} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: profile.profilePicture }}
            style={styles.avatar}
            contentFit="cover"
          />
          <Text style={styles.username}>@{profile.username}</Text>
          {profile.biography ? (
            <Text style={styles.bioText}>{profile.biography}</Text>
          ) : null}

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{formatNumber(profile.followers)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={[styles.statBox, styles.statBorder]}>
              <Text style={styles.statVal}>{formatNumber(profile.following)}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{formatNumber(profile.mediaCount)}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
          </View>
        </View>

        {/* Analytics Grid Section */}
        <Text style={styles.sectionTitle}>Performance Analytics</Text>
        <View style={styles.analyticsGrid}>
          {/* Card 1: Engagement Rate */}
          <View style={styles.analyticsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>Engagement Rate</Text>
              <Icon name="star" size={16} color={Colors.rose} />
            </View>
            <Text style={styles.cardVal}>{analytics.engagementRate}%</Text>
            <Text style={styles.cardDesc}>Based on recent posts activity</Text>
          </View>

          {/* Card 2: Average Likes */}
          <View style={styles.analyticsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>Avg. Post Likes</Text>
              <Icon name="heart" size={16} color={Colors.rose} />
            </View>
            <Text style={styles.cardVal}>{formatNumber(analytics.avgLikes)}</Text>
            <Text style={styles.cardDesc}>Likes per post average</Text>
          </View>

          {/* Card 3: Weekly Reach */}
          <View style={styles.analyticsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>Weekly Reach</Text>
              <Icon name="users" size={16} color={Colors.rose} />
            </View>
            <Text style={styles.cardVal}>{formatNumber(analytics.reach)}</Text>
            <Text style={styles.cardDesc}>Unique accounts reached</Text>
          </View>

          {/* Card 4: Impressions */}
          <View style={styles.analyticsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>Weekly Impressions</Text>
              <Icon name="eye" size={16} color={Colors.rose} />
            </View>
            <Text style={styles.cardVal}>{formatNumber(analytics.impressions)}</Text>
            <Text style={styles.cardDesc}>Total views on content</Text>
          </View>

          {/* Card 5: Creator Niche */}
          <View style={styles.analyticsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>Audience Niche</Text>
              <Icon name="briefcase" size={16} color={Colors.rose} />
            </View>
            <Text style={[styles.cardVal, { fontSize: 18, marginTop: 12 }]}>{analytics.niche}</Text>
            <Text style={styles.cardDesc}>Derived from bio interests</Text>
          </View>

          {/* Card 6: Tier Level */}
          <View style={styles.analyticsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>Account Level</Text>
              <Icon name="verified" size={16} color={Colors.rose} />
            </View>
            <Text style={[styles.cardVal, { textTransform: 'capitalize' }]}>{analytics.level}</Text>
            <Text style={styles.cardDesc}>Influencer tier bracket</Text>
          </View>
        </View>

        {/* Posts Grid Section */}
        <Text style={styles.sectionTitle}>Recent Content</Text>
        {posts.length === 0 ? (
          <View style={styles.noPostsCard}>
            <Text style={styles.noPostsText}>No recent posts found on Instagram.</Text>
          </View>
        ) : (
          <View style={styles.postsGrid}>
            {posts.map((post: PostDetail) => (
              <TouchableOpacity
                key={post.id}
                style={styles.gridCell}
                activeOpacity={0.9}
                onPress={() => setSelectedPost(post)}
              >
                <Image
                  source={{ uri: post.mediaUrl }}
                  style={styles.gridImage}
                  contentFit="cover"
                />
                {post.mediaType === 'video' ? (
                  <View style={styles.cellBadge}>
                    <Icon name="play" size={12} color={Colors.white} />
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Post Details Modal */}
      <Modal
        visible={!!selectedPost}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalDismissTrigger}
            activeOpacity={1}
            onPress={() => setSelectedPost(null)}
          />
          <View style={styles.modalContent}>
            {selectedPost ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Post Details</Text>
                  <TouchableOpacity onPress={() => setSelectedPost(null)}>
                    <Icon name="x" size={20} color={Colors.ink} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Image
                    source={{ uri: selectedPost.mediaUrl }}
                    style={styles.modalImage}
                    contentFit="cover"
                  />

                  {/* Post Engagement Stats */}
                  <View style={styles.modalStatsRow}>
                    <View style={styles.modalStatItem}>
                      <Icon name="heart" size={18} color="#FF3B30" />
                      <Text style={styles.modalStatVal}>{formatNumber(selectedPost.likeCount)}</Text>
                      <Text style={styles.modalStatLabel}>Likes</Text>
                    </View>
                    <View style={styles.modalStatItem}>
                      <Icon name="chat" size={18} color={Colors.oxblood} />
                      <Text style={styles.modalStatVal}>{formatNumber(selectedPost.commentCount)}</Text>
                      <Text style={styles.modalStatLabel}>Comments</Text>
                    </View>
                    <View style={styles.modalStatItem}>
                      <Icon name="clock" size={18} color="rgba(63,3,11,0.5)" />
                      <Text style={styles.modalStatVal}>
                        {formatRelativeTime(selectedPost.timestamp)}
                      </Text>
                      <Text style={styles.modalStatLabel}>Published</Text>
                    </View>
                  </View>

                  {/* Caption */}
                  {selectedPost.caption ? (
                    <View style={styles.captionBox}>
                      <Text style={styles.captionText}>{selectedPost.caption}</Text>
                    </View>
                  ) : null}

                  {/* Permalink button */}
                  <TouchableOpacity
                    style={styles.modalLinkBtn}
                    onPress={() => handleOpenPermalink(selectedPost.permalink)}
                    activeOpacity={0.85}
                  >
                    <HugeiconsIcon icon={InstagramGlyph} size={16} strokeWidth={2} color={Colors.white} />
                    <Text style={styles.modalLinkText}>View Natively on Instagram</Text>
                  </TouchableOpacity>
                </ScrollView>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  loadingRoot: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.07)',
    backgroundColor: 'rgba(244,236,228,0.9)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    ...Shadow.card,
  },
  headerTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
  },
  headerRefreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    ...Shadow.card,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(63,3,11,0.6)',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 20,
    alignItems: 'center',
    ...Shadow.card,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.cream,
  },
  username: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.oxblood,
    marginTop: 12,
  },
  bioText: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(42,2,7,0.6)',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  statsBar: {
    flexDirection: 'row',
    marginTop: 20,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(63,3,11,0.1)',
    paddingTop: 16,
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 0.5,
    borderLeftColor: 'rgba(63,3,11,0.1)',
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(63,3,11,0.1)',
  },
  statVal: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
  },
  statLabel: {
    fontSize: 10.5,
    color: 'rgba(63,3,11,0.5)',
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 12,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analyticsCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    padding: 14,
    width: (width - 44) / 2,
    height: 104,
    justifyContent: 'space-between',
    ...Shadow.card,
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
    fontSize: 20,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  cardDesc: {
    fontSize: 9.5,
    color: 'rgba(63,3,11,0.4)',
    fontWeight: '500',
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridCell: {
    width: GRID_SIZE,
    height: GRID_SIZE,
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
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20,
    height: 20,
    borderRadius: 10,
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
  errorContainer: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  errorTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  errorSub: {
    fontSize: 13.5,
    lineHeight: 20,
    color: 'rgba(63,3,11,0.6)',
    textAlign: 'center',
    marginBottom: 8,
  },
  reconnectBtn: {
    backgroundColor: Colors.oxblood,
    paddingHorizontal: 20,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reconnectBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
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
    maxHeight: '85%',
    padding: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
  },
  modalImage: {
    width: '100%',
    height: width - 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.creamLite,
  },
  modalStatsRow: {
    flexDirection: 'row',
    marginVertical: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.08)',
    paddingBottom: 14,
  },
  modalStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  modalStatVal: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.ink,
    marginTop: 4,
  },
  modalStatLabel: {
    fontSize: 10.5,
    color: 'rgba(63,3,11,0.4)',
    fontWeight: '600',
  },
  captionBox: {
    backgroundColor: 'rgba(63,3,11,0.03)',
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 20,
  },
  captionText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: Colors.ink,
  },
  modalLinkBtn: {
    backgroundColor: Colors.oxblood,
    height: 44,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalLinkText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13.5,
  },
});
