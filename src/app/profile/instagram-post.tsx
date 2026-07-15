import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Pressable,
  AppState,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { Image } from 'expo-image';
import { useIsFocused } from 'expo-router';
import { useProfilesStore } from '@/store/profiles';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as WebBrowser from 'expo-web-browser';
import {
  ChevronLeft,
  VolumeX,
  Volume2,
  Play,
  Heart,
  MessageCircle,
  AlignLeft,
  BarChart3,
  Users,
  Eye,
  Bookmark,
} from 'lucide-react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { InstagramIcon } from '@hugeicons/core-free-icons';
import { BottomSheet } from '@/components/ui/bottom-sheet';

const { width } = Dimensions.get('window');

// ─── REEL / VIDEO PLAYER SUB-COMPONENT ─────────────────────────────────
function PostVideoPlayer({ videoUrl }: { videoUrl: string }) {
  const [muted, setMuted] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
    });
    return () => subscription.remove();
  }, []);

  const player = useVideoPlayer(videoUrl, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.muted = muted;
  });

  const shouldPlay = isFocused && appState === 'active' && !userPaused;

  useEffect(() => {
    if (shouldPlay) {
      try {
        player.play();
      } catch (e) {
        // Safe catch
      }
    } else {
      try {
        player.pause();
      } catch (e) {
        // Safe catch
      }
    }
  }, [shouldPlay, player]);

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  return (
    <Pressable
      onPress={() => setUserPaused(!userPaused)}
      style={styles.mediaContainer}
    >
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
      <Pressable
        onPress={() => setMuted(!muted)}
        style={styles.muteButton}
      >
        {muted ? (
          <VolumeX size={16} color="#ffffff" />
        ) : (
          <Volume2 size={16} color="#ffffff" />
        )}
      </Pressable>
      {userPaused && (
        <View style={styles.playOverlay}>
          <Play size={24} color="#ffffff" fill="#ffffff" />
        </View>
      )}
    </Pressable>
  );
}

// ─── CAROUSEL SLIDER SUB-COMPONENT ─────────────────────────────────────
function CarouselSlider({ urls }: { urls: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const onScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(idx);
  };

  return (
    <View style={styles.mediaContainer}>
      <FlatList
        ref={flatRef}
        data={urls}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={{ width, height: '100%' }}>
            <Image
              source={{ uri: item }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          </View>
        )}
      />
      {/* Dot Indicator */}
      {urls.length > 1 && (
        <View style={styles.dotsRow}>
          {urls.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
      {/* Counter badge */}
      {urls.length > 1 && (
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>{activeIndex + 1} / {urls.length}</Text>
        </View>
      )}
    </View>
  );
}

// ─── MAIN POST DETAIL SCREEN ───────────────────────────────────────────
export default function InstagramPostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const activeInfluencerProfileId = useProfilesStore((s) => s.activeInfluencerProfileId);

  const [activeSheet, setActiveSheet] = useState<'insights' | 'caption' | 'comments' | null>(null);

  // Fetch the cached/fresh analytics query to extract the specific post details
  const { data, isLoading } = useQuery({
    queryKey: ['instagramAnalytics', activeInfluencerProfileId],
    queryFn: () => api.social.instagram.getAnalytics(),
    enabled: !!activeInfluencerProfileId,
  });

  // Fetch comments using react-query
  const { data: comments, isLoading: isCommentsLoading } = useQuery({
    queryKey: ['postComments', postId],
    queryFn: () => api.social.instagram.getPostComments(postId!),
    enabled: activeSheet === 'comments' && !!postId,
  });

  const post = data?.posts?.find((p: any) => p.id === postId);
  console.log("post", JSON.stringify(post, null, 2));
  console.log("comments", JSON.stringify(comments, null, 2));

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.oxblood} />
        <Text style={styles.loadingText}>Loading post data...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Post not found.</Text>
        <TouchableOpacity style={styles.backButtonText} onPress={() => router.back()}>
          <Text style={{ color: Colors.oxblood, fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatNumber = (num?: number) => {
    if (num === undefined) return '0';
    return num.toLocaleString('en-IN');
  };

  const handleOpenPermalink = async () => {
    if (!post.permalink) return;
    await WebBrowser.openBrowserAsync(post.permalink);
  };

  const isVideo = post.mediaType === 'video';
  const isCarousel = post.mediaType === 'carousel_album';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <ChevronLeft size={20} color={Colors.oxblood} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Instagram Post</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={handleOpenPermalink}>
          <HugeiconsIcon icon={InstagramIcon} size={18} color={Colors.oxblood} />
        </TouchableOpacity>
      </View>

      {/* Middle: Post media display */}
      <View style={styles.middleContainer}>
        {isVideo ? (
          <PostVideoPlayer videoUrl={post.mediaUrl} />
        ) : isCarousel && post.carouselUrls && post.carouselUrls.length > 0 ? (
          <CarouselSlider urls={post.carouselUrls} />
        ) : (
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: post.mediaUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          </View>
        )}
      </View>

      {/* Footer Area */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {/* Short stats row */}
        <View style={styles.shortStatsRow}>
          <View style={styles.shortStatItem}>
            <Heart size={16} color="#FF3B30" fill="#FF3B30" />
            <Text style={styles.shortStatVal}>{formatNumber(post.likeCount)}</Text>
          </View>
          <TouchableOpacity
            style={styles.shortStatItem}
            activeOpacity={0.7}
            onPress={() => setActiveSheet('comments')}
          >
            <MessageCircle size={16} color={Colors.oxblood} fill={Colors.oxblood} />
            <Text style={styles.shortStatVal}>{formatNumber(post.commentCount)}</Text>
          </TouchableOpacity>
        </View>

        {/* Buttons to view caption or insights */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setActiveSheet('caption')}
            activeOpacity={0.85}
          >
            <AlignLeft size={16} color={Colors.white} />
            <Text style={styles.actionBtnText}>Read Caption</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.white, borderWidth: 1, borderColor: 'rgba(63,3,11,0.15)' }]}
            onPress={() => setActiveSheet('insights')}
            activeOpacity={0.85}
          >
            <BarChart3 size={16} color={Colors.oxblood} />
            <Text style={[styles.actionBtnText, { color: Colors.oxblood }]}>View Insights</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet Component */}
      {activeSheet !== null && (
        <BottomSheet
          visible={activeSheet !== null}
          title={
            activeSheet === 'caption'
              ? 'Post Caption'
              : activeSheet === 'insights'
              ? 'Engagement Insights'
              : 'Post Comments'
          }
          icon={
            activeSheet === 'caption'
              ? 'list'
              : activeSheet === 'insights'
              ? 'chart'
              : 'chat'
          }
          onClose={() => setActiveSheet(null)}
          snapPoints={activeSheet === 'comments' ? ['65%', '90%'] : ['55%', '90%']}
        >
          {activeSheet === 'caption' ? (
            <View style={styles.captionBox}>
              <Text style={styles.captionText}>
                {post.caption || 'No caption available for this post.'}
              </Text>
            </View>
          ) : activeSheet === 'insights' ? (
            <View style={styles.insightsList}>
              {/* Metric 1: Reach */}
              <View style={styles.insightItem}>
                <View style={styles.insightLeft}>
                  <Users size={18} color={Colors.oxblood} />
                  <Text style={styles.insightLabel}>Total Account Reach</Text>
                </View>
                <Text style={styles.insightValue}>{formatNumber(post.reach || 0)}</Text>
              </View>

              {/* Metric 2: Impressions / Views */}
              <View style={styles.insightItem}>
                <View style={styles.insightLeft}>
                  <Eye size={18} color={Colors.oxblood} />
                  <Text style={styles.insightLabel}>
                    {isVideo ? 'Total Video Plays' : 'Post Impressions'}
                  </Text>
                </View>
                <Text style={styles.insightValue}>
                  {formatNumber(post.impressions || post.plays || 0)}
                </Text>
              </View>

              {/* Metric 3: Saved */}
              <View style={styles.insightItem}>
                <View style={styles.insightLeft}>
                  <Bookmark size={18} color={Colors.oxblood} />
                  <Text style={styles.insightLabel}>Post Saves</Text>
                </View>
                <Text style={styles.insightValue}>{formatNumber(post.saved || 0)}</Text>
              </View>

              {/* Metric 4: Likes */}
              <View style={styles.insightItem}>
                <View style={styles.insightLeft}>
                  <Heart size={18} color={Colors.oxblood} />
                  <Text style={styles.insightLabel}>Likes</Text>
                </View>
                <Text style={styles.insightValue}>{formatNumber(post.likeCount)}</Text>
              </View>

              {/* Metric 5: Comments */}
              <View style={styles.insightItem}>
                <View style={styles.insightLeft}>
                  <MessageCircle size={18} color={Colors.oxblood} />
                  <Text style={styles.insightLabel}>Comments</Text>
                </View>
                <Text style={styles.insightValue}>{formatNumber(post.commentCount)}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.commentsWrap}>
              {isCommentsLoading ? (
                <View style={styles.commentsLoader}>
                  <ActivityIndicator size="small" color={Colors.oxblood} />
                </View>
              ) : !comments || comments.length === 0 ? (
                <View style={styles.emptyComments}>
                  <MessageCircle size={32} color="rgba(63,3,11,0.2)" />
                  <Text style={styles.emptyCommentsText}>No comments on this post yet</Text>
                </View>
              ) : (
                <View style={{ gap: 14 }}>
                  {comments.map((comment: any) => (
                    <View key={comment.id} style={styles.commentItem}>
                      <View style={styles.commentAvatar}>
                        <Image
                          source={{ uri: 'https://pub-c7a89526fe7541b0a1d6bc2d831710d2.r2.dev/plaform-images/avatar.png' }}
                          style={styles.commentAvatarImg}
                          contentFit="cover"
                        />
                      </View>
                      <View style={styles.commentRight}>
                        <View style={styles.commentMeta}>
                          <Text style={styles.commentUser}>
                            {comment.username || 'instagram_user'}
                          </Text>
                          <Text style={styles.commentDate}>
                            {new Date(comment.timestamp).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </Text>
                        </View>
                        <Text style={styles.commentText}>{comment.text}</Text>
                        {comment.likeCount > 0 && (
                          <View style={styles.commentLikes}>
                            <Heart size={10} color="rgba(63,3,11,0.4)" fill="rgba(63,3,11,0.4)" />
                            <Text style={styles.commentLikesText}>{comment.likeCount} likes</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </BottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF7F8',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF7F8',
  },
  loadingText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: 'rgba(63,3,11,0.5)',
    marginTop: 10,
  },
  errorText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Colors.ink,
    marginBottom: 10,
  },
  backButtonText: {
    padding: 10,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.06)',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  middleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  mediaContainer: {
    width: width - 32,
    height: width - 32,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    ...Shadow.card,
  },
  muteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  playOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -24,
    marginLeft: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9,
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(63,3,11,0.06)',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  shortStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  shortStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shortStatVal: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.oxblood,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadow.card,
  },
  actionBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },


  captionBox: {
    paddingVertical: 4,
  },
  captionText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
  },
  insightsList: {
    gap: 14,
  },
  insightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.04)',
  },
  insightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: 'rgba(63,3,11,0.6)',
    fontWeight: '600',
  },
  insightValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  // Carousel
  dotsRow: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  dot: {
    borderRadius: 4,
    height: 6,
  },
  dotActive: {
    width: 18,
    backgroundColor: '#fff',
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  counterBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    zIndex: 10,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansMedium,
  },
  // Comments styles
  commentsWrap: {
    paddingVertical: 4,
  },
  commentsLoader: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyComments: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyCommentsText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    color: 'rgba(63,3,11,0.4)',
    fontWeight: '600',
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.03)',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3ECEF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.05)',
    overflow: 'hidden',
  },
  commentAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  commentAvatarText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  commentRight: {
    flex: 1,
    gap: 4,
  },
  commentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentUser: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  commentDate: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10.5,
    color: 'rgba(63,3,11,0.4)',
    fontWeight: '500',
  },
  commentText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.8)',
    lineHeight: 18,
  },
  commentLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  commentLikesText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10.5,
    color: 'rgba(63,3,11,0.4)',
    fontWeight: '600',
  },
});
