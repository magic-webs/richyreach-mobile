import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { SectionHead } from '@/components/ui/section-head';
import { Skeleton } from '@/components/ui/skeleton';
import { Image } from 'expo-image';
import { Colors, FontFamily, Shadow, Radius } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, Share01Icon, ChatIcon, UserGroupIcon, FlashIcon, StarIcon, Dollar01Icon, Clock01Icon, PlayIcon, Cancel01Icon, BadgeCheckIcon, CheckIcon, Camera01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { InviteCreatorSheet } from '@/components/brand/marketplace/InviteCreatorSheet';
import { ReelVideoPlayer } from '@/components/brand/marketplace/ReelVideoPlayer';

export default function CreatorProfileDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showModal = useUIStore((s) => s.showModal);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [playingServiceId, setPlayingServiceId] = useState<string | null>(null);

  // Fetch influencer profile detail directly from backend API
  const { data: creatorDetail, isLoading: loadingCreator } = useQuery<any>({
    queryKey: ['influencerDetail', id],
    queryFn: () => api.influencers.get(id),
    enabled: !!id,
  });

  console.log('creatorDetail', JSON.stringify(creatorDetail, null, 2))

  // Parse creator profile
  const creator = React.useMemo(() => {
    if (!creatorDetail) {
      return {
        id: id || 'creator-1',
        name: 'Loading...',
        handle: '@loading',
        followers: '0',
        engagement: '0%',
        collabs: 0,
        rating: '0.0',
        rate: '₹0',
        niche: ['General'],
        tone: 'rose' as const,
        bio: 'Retrieving details...',
        avatar: null,
      };
    }

    const c = creatorDetail;
    let fCount = c.followers ? Number(c.followers) : 0;
    let fStr = `${fCount}`;
    if (fCount >= 1000000) fStr = `${(fCount / 1000000).toFixed(1)}M`;
    else if (fCount >= 1000) fStr = `${(fCount / 1000).toFixed(0)}k`;

    return {
      id: c.id,
      name: c.name || c.instagramHandle || 'Creator',
      handle: `@${c.instagramHandle || 'creator'}`,
      followers: fStr,
      engagement: c.engagementRate ? `${Number(c.engagementRate).toFixed(1)}%` : '5.0%',
      collabs: c.collabs || Math.floor(Math.random() * 20) + 1,
      rating: c.rating ? Number(c.rating).toFixed(1) : '4.8',
      rate: c.pricing ? `₹${(c.pricing / 100).toLocaleString()}` : '₹15,000',
      niche: Array.isArray(c.niche) ? c.niche : c.niche ? [c.niche] : ['Lifestyle'],
      tone: (c.niche === 'Beauty' ? 'rose' : 'ox') as 'rose' | 'ox',
      bio: c.bio || `Passionate content creator specializing in ${c.niche || 'Lifestyle'}. Building authentic connections with brands and audiences through creative and engaging storytelling.`,
      avatar: c.avatar || null,
    };
  }, [creatorDetail, id]);

  // Parse services from backend creator detail response
  const creatorServices = React.useMemo(() => {
    if (!creatorDetail || !Array.isArray(creatorDetail.services)) {
      return [];
    }
    return creatorDetail.services.map((s: any) => {
      // Parse tags
      let parsedTags: string[] = [];
      if (s.tags) {
        try {
          parsedTags = typeof s.tags === 'string' ? JSON.parse(s.tags) : s.tags;
        } catch (e) {
          parsedTags = [s.tags];
        }
      }

      // Parse deliverables
      let parsedDeliverables: string[] = [];
      if (s.deliverables) {
        try {
          parsedDeliverables = typeof s.deliverables === 'string' ? JSON.parse(s.deliverables) : s.deliverables;
        } catch (e) {
          parsedDeliverables = [s.deliverables];
        }
      }

      return {
        id: s.id,
        name: s.name || 'Premium Promotion',
        price: typeof s.price === 'number' ? s.price / 100 : 12000,
        deliveryTime: s.deliveryTime || '5 days',
        description: s.description || 'Custom shoutout or promotion post.',
        videoUrl: s.videoUrl || null,
        exampleUrl: s.exampleUrl || null,
        category: s.category || null,
        subCategory: s.subCategory || null,
        tags: parsedTags,
        deliverables: parsedDeliverables,
        thumbnailUrl: s.thumbnailUrl || null,
      };
    });
  }, [creatorDetail]);

  const stats = [
    { label: 'Followers', value: creator.followers, icon: UserGroupIcon },
    { label: 'Engagement', value: creator.engagement, icon: FlashIcon },
    { label: 'Rating', value: `${creator.rating} ★`, icon: StarIcon },
    { label: 'Pricing', value: creator.rate, icon: Dollar01Icon },
  ];

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  useEffect(() => {
    if (userId) {
      api.campaigns.list()
        .then((data: any) => {
          setCampaigns(data.filter((c: any) => c.status === 'active'));
        })
        .catch((err) => console.error("Failed to load campaigns in creator detail page", err));
    }
  }, [userId]);

  const handleOpenInvite = () => {
    setInviteOpen(true);
  };

  const handleSendInvite = async (campaignId: string, campaignTitle: string) => {
    if (!creator?.id) return;
    setInviteOpen(false);

    try {
      const room = await api.chat.createRoom(creator.id, campaignId);
      await api.chat.send(
        room.id,
        `I'd love to invite you to collaborate on our campaign "${campaignTitle}".`,
        campaignId
      );

      showModal({
        title: 'Invite Sent',
        message: `Successfully invited ${creator.name} to collaborate on the "${campaignTitle}" campaign!`,
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
                  name: creator.name || '',
                  avatar: creator.avatar || '',
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
    if (creator?.id) {
      try {
        const room = await api.chat.createRoom(creator.id);
        router.push({
          pathname: '/brand/chat/[id]' as any,
          params: {
            id: room.id,
            name: creator.name || '',
            avatar: creator.avatar || '',
          }
        });
      } catch (err) {
        console.error("Failed to start conversation with creator", err);
      }
    }
  };

  return (
    <View style={styles.root}>
      {/* Fixed Top nav (Outside ScrollView to prevent scrolling away & receive touches reliably) */}
      <View style={[styles.navHeaderFixed, { top: Math.max(insets.top, 16) }]}>
        <TouchableOpacity onPress={() => router.back()}
          style={styles.navBtn} activeOpacity={0.8}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color={Colors.oxblood} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} activeOpacity={0.8}>
          <HugeiconsIcon icon={Share01Icon} size={19} color={Colors.oxblood} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Cover Image & Header */}
        <View style={styles.coverWrap}>
          {loadingCreator ? (
            <Skeleton width="100%" height={200} borderRadius={0} />
          ) : (
            <PlaceholderImage tone={creator.tone} height={200} borderRadius={0} />
          )}
          <LinearGradient
            colors={['rgba(42,2,7,0.45)', 'transparent', 'rgba(42,2,7,0.75)']}
            style={styles.coverOverlay}
          />

          {/* Profile Avatar overlay */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              {loadingCreator ? (
                <Skeleton width={80} height={80} borderRadius={40} />
              ) : creator.avatar ? (
                <Image source={{ uri: creator.avatar }} style={{ width: 80, height: 80, borderRadius: 40 }} contentFit="cover" />
              ) : (
                <PlaceholderImage tone={creator.tone} height={80} width={80} borderRadius={40} />
              )}
            </View>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.infoSection}>
          {loadingCreator ? (
            <View style={{ gap: 8 }}>
              <Skeleton width={180} height={26} borderRadius={6} />
              <Skeleton width={100} height={14} borderRadius={4} />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <Skeleton width={60} height={20} borderRadius={8} />
                <Skeleton width={70} height={20} borderRadius={8} />
              </View>
              <Skeleton width="100%" height={16} borderRadius={4} style={{ marginTop: 8 }} />
              <Skeleton width="85%" height={16} borderRadius={4} />

              {/* Stats Grid Skeleton */}
              <View style={[styles.statsGrid, { marginTop: 20 }]}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.statCard}>
                    <Skeleton width={30} height={16} borderRadius={4} />
                    <Skeleton width={60} height={12} borderRadius={4} style={{ marginTop: 6 }} />
                  </View>
                ))}
              </View>

              {/* Services Skeleton */}
              <View style={styles.sectionContainer}>
                <Skeleton width={150} height={20} borderRadius={4} />
                <View style={[styles.servicesContainer, { gap: 12, padding: 16, marginTop: 10 }]}>
                  <Skeleton width="100%" height={50} borderRadius={8} />
                  <Skeleton width="100%" height={50} borderRadius={8} />
                </View>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.nameRow}>
                <Text style={styles.nameText}>{creator.name}</Text>
                <HugeiconsIcon icon={BadgeCheckIcon} size={18} color={Colors.rose} strokeWidth={2} />
              </View>
              <Text style={styles.handleText}>{creator.handle}</Text>

              {/* Niche badges */}
              <View style={styles.nicheContainer}>
                {creator.niche.map((n: string) => (
                  <View key={n} style={styles.nicheBadge}>
                    <Text style={styles.nicheText}>{n}</Text>
                  </View>
                ))}
              </View>

              {/* Bio */}
              <Text style={styles.bioText}>{creator.bio}</Text>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                {stats.map((s) => (
                  <View key={s.label} style={styles.statCard}>
                    <HugeiconsIcon icon={s.icon as any} size={16} color={Colors.rose} />
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* Services list */}
              <View style={styles.sectionContainer}>
                <SectionHead title="Offered Services" action={null} />
                {creatorServices.length === 0 ? (
                  <View style={styles.emptyServices}>
                    <Text style={styles.emptyServicesText}>No services listed directly. Reach out for custom collaborations!</Text>
                  </View>
                ) : (
                  <View style={styles.servicesContainer}>
                    {creatorServices.map((service: any) => {
                      // Determine cover image / thumbnail
                      let coverImage = service.thumbnailUrl;
                      if (!coverImage && service.videoUrl) {
                        if (service.videoUrl.includes('cloudinary.com')) {
                          const baseUrl = service.videoUrl.split('?')[0];
                          const extIdx = baseUrl.lastIndexOf('.');
                          if (extIdx !== -1) {
                            const ext = baseUrl.substring(extIdx).toLowerCase();
                            if (['.mp4', '.mov', '.avi', '.mkv', '.webm', '.3gp'].includes(ext)) {
                              coverImage = baseUrl.substring(0, extIdx) + '.jpg';
                            }
                          }
                        } else {
                          coverImage = service.videoUrl;
                        }
                      }
                      const hasVideo = !!service.videoUrl;

                      return (
                        <View key={service.id} style={styles.serviceCard}>
                          {/* Media Header (Thumbnail / Video Player) */}
                          {(coverImage || hasVideo) && (
                            <View style={styles.cardMediaContainer}>
                              {playingServiceId === service.id && service.videoUrl ? (
                                <View style={styles.cardVideoWrapper}>
                                  <ReelVideoPlayer
                                    videoUrl={service.videoUrl}
                                    isPlaying={true}
                                    height={180}
                                  />
                                  <TouchableOpacity
                                    style={styles.closeVideoBtn}
                                    activeOpacity={0.8}
                                    onPress={() => setPlayingServiceId(null)}
                                  >
                                    <HugeiconsIcon icon={Cancel01Icon} size={14} color={Colors.white} />
                                  </TouchableOpacity>
                                </View>
                              ) : (
                                <TouchableOpacity
                                  activeOpacity={0.9}
                                  onPress={() => {
                                    if (hasVideo) {
                                      setPlayingServiceId(service.id);
                                    }
                                  }}
                                  style={styles.cardThumbnailWrapper}
                                >
                                  {coverImage ? (
                                    <Image
                                      source={{ uri: coverImage }}
                                      style={styles.cardThumbnail}
                                      contentFit="cover"
                                    />
                                  ) : (
                                    <PlaceholderImage
                                      tone={creator.tone}
                                      height={180}
                                      borderRadius={0}
                                    />
                                  )}
                                  <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.45)']}
                                    style={styles.cardThumbnailOverlay}
                                  />
                                  {hasVideo && (
                                    <View style={styles.cardPlayBtnWrapper}>
                                      <HugeiconsIcon icon={PlayIcon} size={24} color={Colors.white} />
                                    </View>
                                  )}
                                  {hasVideo && (
                                    <View style={styles.sampleBadge}>
                                      <Text style={styles.sampleBadgeText}>WATCH SAMPLE</Text>
                                    </View>
                                  )}
                                </TouchableOpacity>
                              )}
                            </View>
                          )}

                          {/* Card Content */}
                          <View style={styles.cardContent}>
                            {/* Platform & Category Tags */}
                            {(service.category || service.subCategory) && (
                              <View style={styles.cardTagsRow}>
                                {service.category && (
                                  <View style={styles.platformBadge}>
                                    <HugeiconsIcon
                                      icon={service.category.toLowerCase() === 'youtube' ? PlayIcon : Camera01Icon}
                                      size={10}
                                      color={Colors.roseDeep}
                                    />
                                    <Text style={styles.platformText}>{service.category}</Text>
                                  </View>
                                )}
                                {service.subCategory && (
                                  <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryText}>{service.subCategory}</Text>
                                  </View>
                                )}
                              </View>
                            )}

                            {/* Service Title */}
                            <Text style={styles.cardTitle}>{service.name}</Text>

                            {/* Service Description */}
                            {service.description && (
                              <Text style={styles.cardDesc}>{service.description}</Text>
                            )}

                            {/* Deliverables (if any) */}
                            {service.deliverables && service.deliverables.length > 0 && (
                              <View style={styles.deliverablesContainer}>
                                <Text style={styles.deliverablesTitle}>What's Included:</Text>
                                {service.deliverables.map((item: string, idx: number) => (
                                  <View key={idx} style={styles.deliverableRow}>
                                    <HugeiconsIcon icon={CheckIcon} size={11} color={Colors.green} />
                                    <Text style={styles.deliverableText}>{item}</Text>
                                  </View>
                                ))}
                              </View>
                            )}

                            {/* Tags (if any) */}
                            {service.tags && service.tags.length > 0 && (
                              <View style={styles.tagsContainer}>
                                {service.tags.map((tag: string) => (
                                  <Text key={tag} style={styles.tagPill}>
                                    #{tag}
                                  </Text>
                                ))}
                              </View>
                            )}

                            {/* Divider */}
                            <View style={styles.cardDivider} />

                            {/* Pricing, Delivery & Call to Action */}
                            <View style={styles.cardFooter}>
                              <View style={styles.footerInfo}>
                                <Text style={styles.footerPrice}>
                                  ₹{service.price.toLocaleString()}
                                </Text>
                                <Text style={styles.footerDelivery}>
                                  <HugeiconsIcon icon={Clock01Icon} size={10} color="rgba(63,3,11,0.45)" />{' '}
                                  {service.deliveryTime}
                                </Text>
                              </View>

                              <TouchableOpacity
                                style={styles.cardActionBtn}
                                activeOpacity={0.8}
                                onPress={() => {
                                  setSelectedService(service);
                                  setInviteOpen(true);
                                }}
                              >
                                <Text style={styles.cardActionBtnText}>Order Service</Text>
                                <HugeiconsIcon icon={ArrowRight01Icon} size={12} color={Colors.white} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <LinearGradient
        colors={['rgba(244,236,228,0)', 'rgba(244,236,228,0.95)']}
        style={[styles.applyBar, { paddingBottom: insets.bottom + 14 }]}
      >
        <TouchableOpacity
          onPress={handleMessageCreator}
          style={styles.chatBtn}
          activeOpacity={0.8}
          disabled={loadingCreator}
        >
          <HugeiconsIcon icon={ChatIcon} size={22} color={Colors.oxblood} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleOpenInvite}
          activeOpacity={0.85}
          style={[styles.inviteActionBtn, loadingCreator && { opacity: 0.5 }]}
          disabled={loadingCreator}
        >
          <Text style={styles.inviteActionText}>Invite to Campaign</Text>
        </TouchableOpacity>
      </LinearGradient>

      <InviteCreatorSheet
        isOpen={inviteOpen}
        onClose={() => {
          setInviteOpen(false);
          setSelectedService(null);
        }}
        creator={creator}
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
  coverWrap: {
    position: 'relative',
    height: 200,
    backgroundColor: Colors.oxbloodDeep,
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  navHeaderFixed: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(244,236,228,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  avatarContainer: {
    position: 'absolute',
    left: 20,
    bottom: -32,
    zIndex: 5,
  },
  avatarRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    padding: 3,
    backgroundColor: Colors.creamLite,
    ...Shadow.card,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 44,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameText: {
    fontFamily: FontFamily.serif,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.ink,
  },
  handleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.rose,
    fontWeight: '600',
    marginTop: 2,
  },
  nicheContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  nicheBadge: {
    backgroundColor: 'rgba(180, 106, 116, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
  },
  nicheText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Colors.roseDeep,
    fontWeight: '700',
  },
  bioText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 14.5,
    lineHeight: 22,
    color: 'rgba(42,2,7,0.7)',
    marginTop: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  statValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(63,3,11,0.5)',
    fontWeight: '600',
    marginTop: 1,
  },
  sectionContainer: {
    marginTop: 28,
  },
  servicesContainer: {
    gap: 16,
    marginTop: 12,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.08)',
    ...Shadow.card,
  },
  cardMediaContainer: {
    height: 180,
    backgroundColor: 'rgba(63, 3, 11, 0.1)',
    position: 'relative',
  },
  cardVideoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  closeVideoBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
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
  cardContent: {
    padding: 16,
    gap: 10,
  },
  cardTagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(180, 106, 116, 0.1)',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    gap: 4,
  },
  platformText: {
    fontSize: 10,
    color: Colors.roseDeep,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  categoryText: {
    fontSize: 10,
    color: 'rgba(63, 3, 11, 0.6)',
    fontFamily: FontFamily.sansMedium,
    fontWeight: '700',
  },
  cardTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
  },
  cardDesc: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(63, 3, 11, 0.6)',
    lineHeight: 18,
  },
  deliverablesContainer: {
    backgroundColor: 'rgba(42, 122, 90, 0.03)',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(42, 122, 90, 0.08)',
    gap: 6,
    marginTop: 2,
  },
  deliverablesTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Colors.green,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  deliverableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deliverableText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.7)',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  tagPill: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10.5,
    color: Colors.roseDeep,
    backgroundColor: 'rgba(180, 106, 116, 0.08)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  cardDivider: {
    height: 0.5,
    backgroundColor: 'rgba(63, 3, 11, 0.08)',
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerInfo: {
    gap: 2,
  },
  footerPrice: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16.5,
    fontWeight: '700',
    color: Colors.green,
  },
  footerDelivery: {
    fontSize: 10.5,
    color: 'rgba(63, 3, 11, 0.45)',
    fontWeight: '700',
  },
  cardActionBtn: {
    backgroundColor: Colors.oxblood,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...Shadow.button,
  },
  cardActionBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.cream,
    fontWeight: '700',
  },
  emptyServices: {
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyServicesText: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: 'rgba(63, 3, 11, 0.5)',
    textAlign: 'center',
  },
  applyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  chatBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63,3,11,0.04)',
  },
  inviteActionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.button,
  },
  inviteActionText: {
    fontFamily: FontFamily.sans,
    fontWeight: '800',
    fontSize: 15,
    color: Colors.cream,
  },
});
