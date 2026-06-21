import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Image } from 'expo-image';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { useAuthStore } from '@/store/auth';
import { useShortlistStore, ShortlistedService } from '@/store/shortlist';
import { useUIStore } from '@/store/ui';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReelVideoPlayer } from '@/components/brand/marketplace/ReelVideoPlayer';
import { InviteCreatorSheet } from '@/components/brand/marketplace/InviteCreatorSheet';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '@/lib/api';

export default function ShortlistScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showModal = useUIStore((s) => s.showModal);
  
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;
  
  const shortlistedServices = useShortlistStore((s) => s.shortlistedServices);
  const loadShortlist = useShortlistStore((s) => s.loadShortlist);
  const removeShortlist = useShortlistStore((s) => s.removeShortlist);
  const clearShortlist = useShortlistStore((s) => s.clearShortlist);

  // Video playback and Invite state
  const [playingServiceId, setPlayingServiceId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  // Load shortlist & campaigns on mount
  useEffect(() => {
    if (userId) {
      loadShortlist(userId);
      api.campaigns.list()
        .then((data: any) => {
          setCampaigns(data.filter((c: any) => c.status === 'active'));
        })
        .catch((err) => console.error("Failed to load campaigns", err));
    }
  }, [userId]);

  // Hide tab bar and floating chat when viewing shortlist
  useEffect(() => {
    const setTabBarVisible = useUIStore.getState().setTabBarVisible;
    const setFloatingChatVisible = useUIStore.getState().setFloatingChatVisible;
    setTabBarVisible(false);
    setFloatingChatVisible(false);
    
    return () => {
      setTabBarVisible(true);
      setFloatingChatVisible(true);
    };
  }, []);

  const handleRemove = async (serviceId: string, name: string) => {
    if (!userId) return;
    await removeShortlist(userId, serviceId);
    showModal({
      title: 'Removed from Shortlist',
      message: `"${name}" has been removed from your shortlist.`,
    });
  };

  const handleClearAll = async () => {
    if (!userId) return;
    showModal({
      title: 'Clear Shortlist',
      message: 'Are you sure you want to clear your entire shortlist?',
      actions: [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearShortlist(userId);
          },
        },
      ],
    });
  };

  const handleOpenInvite = (service: ShortlistedService) => {
    setSelectedCreator(service.creator);
    setSelectedService(service);
    setInviteOpen(true);
  };

  const handleSendInvite = async (campaignId: string, campaignTitle: string) => {
    if (!selectedCreator?.id) return;
    setInviteOpen(false);

    try {
      const room = await api.chat.createRoom(selectedCreator.id, campaignId);
      await api.chat.send(
        room.id,
        `I'd love to invite you to collaborate on our campaign "${campaignTitle}".`,
        campaignId
      );

      showModal({
        title: 'Invite Sent',
        message: `Successfully invited ${selectedCreator?.name} to collaborate on the "${campaignTitle}" campaign!`,
        actions: [
          {
            text: 'OK',
            style: 'default',
          },
          {
            text: 'Go to Chat',
            style: 'default',
            onPress: () => {
              router.push({
                pathname: '/brand/chat/[id]' as any,
                params: {
                  id: room.id,
                  name: selectedCreator.name,
                  avatar: selectedCreator.avatar || "",
                }
              });
            }
          }
        ]
      });
    } catch (err: any) {
      console.error("Failed to send invite", err);
      showModal({
        title: 'Invite Failed',
        message: err.message || 'Failed to send campaign invitation. Please try again.',
      });
    }
  };

  const handleMessageCreator = async () => {
    setInviteOpen(false);
    if (selectedCreator?.id) {
      try {
        const room = await api.chat.createRoom(selectedCreator.id);
        router.push({
          pathname: '/brand/chat/[id]' as any,
          params: {
            id: room.id,
            name: selectedCreator.name,
            avatar: selectedCreator.avatar || "",
          }
        });
      } catch (err) {
        console.error("Failed to start conversation with creator", err);
      }
    }
  };

  const renderServiceCard = ({ item }: { item: ShortlistedService }) => {
    // Generate thumbnail from video if needed
    let coverImage = item.thumbnailUrl;
    if (!coverImage && item.videoUrl) {
      if (item.videoUrl.includes('cloudinary.com')) {
        const baseUrl = item.videoUrl.split('?')[0];
        const extIdx = baseUrl.lastIndexOf('.');
        if (extIdx !== -1) {
          const ext = baseUrl.substring(extIdx).toLowerCase();
          if (['.mp4', '.mov', '.avi', '.mkv', '.webm', '.3gp'].includes(ext)) {
            coverImage = baseUrl.substring(0, extIdx) + '.jpg';
          }
        }
      } else {
        coverImage = item.videoUrl;
      }
    }
    const hasVideo = !!item.videoUrl;

    return (
      <View style={styles.card}>
        {/* Media Thumbnail / Video Player */}
        {(coverImage || hasVideo) && (
          <View style={styles.cardMediaContainer}>
            {playingServiceId === item.id && item.videoUrl ? (
              <View style={styles.cardVideoWrapper}>
                <ReelVideoPlayer
                  videoUrl={item.videoUrl}
                  isPlaying={true}
                  height={200}
                />
                <TouchableOpacity
                  style={styles.closeVideoBtn}
                  activeOpacity={0.8}
                  onPress={() => setPlayingServiceId(null)}
                >
                  <Icon name="x" size={14} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  if (hasVideo) {
                    setPlayingServiceId(item.id);
                  }
                }}
                style={styles.cardThumbnailWrapper}
              >
                {coverImage ? (
                  <Image source={{ uri: coverImage }} style={styles.cardThumbnail} contentFit="cover" />
                ) : (
                  <PlaceholderImage tone={item.creator?.tone} height={200} borderRadius={0} />
                )}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.5)']}
                  style={styles.cardThumbnailOverlay}
                />
                {hasVideo && (
                  <View style={styles.cardPlayBtnWrapper}>
                    <Icon name="play" size={24} color={Colors.white} />
                  </View>
                )}
                <View style={styles.sampleBadge}>
                  <Text style={styles.sampleBadgeText}>PREVIEW WORK</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Content Section */}
        <View style={styles.cardBody}>
          {/* Creator Profile Row */}
          <TouchableOpacity
            style={styles.creatorRow}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/brand/marketplace/creator/[id]', params: { id: item.creator.id } })}
          >
            {item.creator?.avatar ? (
              <Image source={{ uri: item.creator.avatar }} style={styles.creatorAvatar} contentFit="cover" />
            ) : (
              <PlaceholderImage tone={item.creator?.tone} height={36} width={36} borderRadius={18} />
            )}
            <View style={styles.creatorMeta}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.creatorName}>{item.creator?.name}</Text>
                <Icon name="verified" size={12} color={Colors.rose} />
              </View>
              <Text style={styles.creatorHandle}>{item.creator?.handle}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{item.creator?.rating} ★</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Service Information */}
          <Text style={styles.serviceTitle}>{item.name}</Text>
          {item.description && (
            <Text style={styles.serviceDesc} numberOfLines={3}>
              {item.description}
            </Text>
          )}

          {/* Metrics & Badges */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Followers</Text>
              <Text style={styles.metricValue}>{item.creator?.followers || 'N/A'}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Engagement</Text>
              <Text style={styles.metricValue}>{item.creator?.engagement || 'N/A'}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Price</Text>
              <Text style={styles.metricPrice}>₹{item.price.toLocaleString()}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.removeBtn}
              activeOpacity={0.8}
              onPress={() => handleRemove(item.id, item.name)}
            >
              <Icon name="bookmark" size={14} color={Colors.roseDeep} />
              <Text style={styles.removeBtnText}>Remove</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.inviteBtn}
              activeOpacity={0.8}
              onPress={() => handleOpenInvite(item)}
            >
              <Text style={styles.inviteBtnText}>Invite to Campaign</Text>
              <Icon name="arrow" size={12} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBackBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Icon name="back" size={22} color={Colors.oxblood} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Shortlist</Text>
        {shortlistedServices.length > 0 ? (
          <TouchableOpacity style={styles.clearAllBtn} onPress={handleClearAll} activeOpacity={0.8}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Main Content */}
      {shortlistedServices.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Icon name="bookmark" size={48} color="rgba(63, 3, 11, 0.15)" />
          </View>
          <Text style={styles.emptyTitle}>Your Shortlist is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Explore the marketplace, discover top creators, and save services here to easily invite them to your campaigns.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            activeOpacity={0.8}
            onPress={() => router.replace('/brand/marketplace')}
          >
            <Text style={styles.exploreBtnText}>Go to Marketplace</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={shortlistedServices}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceCard}
          contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Campaign Invite Sheet */}
      <InviteCreatorSheet
        isOpen={inviteOpen}
        onClose={() => {
          setInviteOpen(false);
          setSelectedService(null);
        }}
        creator={selectedCreator}
        onMessageFirst={handleMessageCreator}
        onSendInvite={handleSendInvite}
        selectedService={selectedService}
        campaigns={campaigns}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.08)',
  },
  navBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  navTitle: {
    fontFamily: FontFamily.serif,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  clearAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
  },
  clearAllText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.roseDeep,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
    gap: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.08)',
    ...Shadow.card,
  },
  cardMediaContainer: {
    height: 200,
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
  },
  cardVideoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  closeVideoBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  cardThumbnailWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  cardThumbnail: {
    width: '100%',
    height: '100%',
  },
  cardThumbnailOverlay: {
    ...StyleSheet.absoluteFill,
  },
  cardPlayBtnWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -22 }, { translateY: -22 }],
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  sampleBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  sampleBadgeText: {
    fontSize: 9,
    fontFamily: FontFamily.sans,
    color: Colors.white,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.cream,
  },
  creatorMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  creatorName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
  },
  creatorHandle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: Colors.rose,
    marginTop: 1,
  },
  ratingBadge: {
    backgroundColor: 'rgba(243, 201, 105, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
  },
  ratingText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.ink,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(63, 3, 11, 0.08)',
  },
  serviceTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
  },
  serviceDesc: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(63, 3, 11, 0.65)',
    lineHeight: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(63, 3, 11, 0.03)',
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metricItem: {
    gap: 2,
  },
  metricLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10,
    color: 'rgba(63, 3, 11, 0.45)',
    fontWeight: '600',
  },
  metricValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.ink,
    fontWeight: '700',
  },
  metricPrice: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.green,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(180, 106, 116, 0.3)',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.roseDeep,
    fontWeight: '700',
  },
  inviteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.oxblood,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    justifyContent: 'center',
    ...Shadow.button,
  },
  inviteBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.cream,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(63, 3, 11, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.08)',
  },
  emptyTitle: {
    fontFamily: FontFamily.serif,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.oxblood,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 14,
    color: 'rgba(63, 3, 11, 0.55)',
    textAlign: 'center',
    lineHeight: 20,
  },
  exploreBtn: {
    backgroundColor: Colors.oxblood,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Radius.full,
    marginTop: 8,
    ...Shadow.button,
  },
  exploreBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Colors.cream,
    fontWeight: '700',
  },
});
