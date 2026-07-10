import { GradientView } from '@/components/ui/gradient-view';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { SectionHead } from '@/components/ui/section-head';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { CreateInfluencerProfileSheet } from '@/components/influencer/CreateInfluencerProfileSheet';
import { ApplyCampaignSheet } from '@/components/influencer/ApplyCampaignSheet';
import { CounterOfferSheet } from '@/components/brand/CounterOfferSheet';
import { useProfilesStore } from '@/store/profiles';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import LottieView from 'lottie-react-native';
import { Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator, Linking, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Skeleton } from '@/components/ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, Share01Icon, Bookmark02Icon, BadgeCheckIcon, Clock01Icon, InstagramIcon, Camera01Icon, UserGroupIcon, Calendar01Icon, CheckIcon, ChatIcon } from '@hugeicons/core-free-icons';
import { Icon } from '@/components/ui/icon';
import { SavedBookmarkIcon, UnsavedBookmarkIcon } from '@/components/ui/bookmark-icons';
import { useSavedCampaignsStore } from '@/store/savedCampaigns';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

function CollabDetailSkeleton() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.root}>
      {/* Hero skeleton */}
      <View style={[styles.heroWrap, { backgroundColor: Colors.creamLite }]}>
        {/* Top nav */}
        <View style={[styles.heroNav, { top: Math.max(insets.top, 16) + 12 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navBtn} activeOpacity={0.8}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color={Colors.oxblood} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View style={StyleSheet.absoluteFill}>
          <Skeleton width="100%" height={300} borderRadius={0} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Body skeleton */}
        <View style={styles.body}>
          {/* Budget strip */}
          <Skeleton width="100%" height={80} borderRadius={18} />

          {/* Facts grid */}
          <View style={[styles.factsWrap, { marginTop: 24 }]}>
            {[...Array(4)].map((_, i) => (
              <View key={i} style={[styles.factCard, { borderWidth: 0 }]}>
                <Skeleton width={30} height={30} borderRadius={15} />
                <Skeleton width={80} height={16} borderRadius={4} style={{ marginTop: 10 }} />
                <Skeleton width={60} height={10} borderRadius={4} style={{ marginTop: 6 }} />
              </View>
            ))}
          </View>

          {/* The Brief section */}
          <View style={{ marginTop: 28 }}>
            <Skeleton width={100} height={20} borderRadius={4} style={{ marginBottom: 12 }} />
            <Skeleton width="100%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
            <Skeleton width="95%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
            <Skeleton width="70%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
          </View>

          {/* Deliverables section */}
          <View style={{ marginTop: 28 }}>
            <Skeleton width={140} height={20} borderRadius={4} style={{ marginBottom: 12 }} />
            <Skeleton width="100%" height={60} borderRadius={18} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default function CollabDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const role = useAuthStore((s) => s.role);
  const session = useAuthStore((s) => s.session);
  const [applied, setApplied] = useState(false);
  const [createProfileOpen, setCreateProfileOpen] = useState(false);
  const [applySheetOpen, setApplySheetOpen] = useState(false);
  const [counterSheetOpen, setCounterSheetOpen] = useState(false);
  const queryClient = useQueryClient();

  const activeInfluencerProfileId = useProfilesStore((s) => s.activeInfluencerProfileId);

  const { savedCampaignIds, loadSavedCampaigns, toggleSaveCampaign } = useSavedCampaignsStore();

  useEffect(() => {
    if (session?.user?.id) {
      loadSavedCampaigns(session.user.id);
    }
  }, [session?.user?.id]);

  // Entrance animations state
  const fadeAnim = React.useMemo(() => new Animated.Value(0), []);
  const translateYAnim = React.useMemo(() => new Animated.Value(30), []);
  const heroScale = React.useMemo(() => new Animated.Value(1.12), []);

  // Apply button bounce scale state
  const applyScale = React.useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    // Run entrance stagger animations on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, heroScale, translateYAnim]);

  const { data: collabData, isLoading } = useQuery<any>({
    queryKey: ['collab', id],
    queryFn: () => api.campaigns.get(id),
    enabled: !!id,
  });

  const cm = React.useMemo(() => {
    const c = collabData?.campaign;
    if (!c) {
      return null;
    }
    const numCreators = c.numCreators || 1;
    const costPerCreator = c.costPerCreator || (typeof c.budget === 'number' ? (c.budget / 100) / Math.max(1, numCreators) : 10000);

    let brief = {};
    if (c.briefDetails) {
      try {
        brief = typeof c.briefDetails === 'string' ? JSON.parse(c.briefDetails) : c.briefDetails;
      } catch (err) {
        brief = {};
      }
    }

    let deliverables: string[] = [];
    // @ts-ignore
    if (brief.deliverables && Array.isArray(brief.deliverables)) {
      // @ts-ignore
      brief.deliverables.forEach((d: any) => {
        deliverables.push(`${d.quantity}x ${d.type.charAt(0).toUpperCase() + d.type.slice(1)}(s)`);
      });
    } else if (c.requirements) {
      deliverables = typeof c.requirements === 'string' ? c.requirements.split('\n') : c.requirements;
    } else {
      if (c.reelCount > 0) deliverables.push(`${c.reelCount}x Reel(s)`);
      if (c.storyCount > 0) deliverables.push(`${c.storyCount}x Story(ies)`);
      if (deliverables.length === 0) deliverables.push('1x Reel(s)');
    }

    const type = c.campaignType || (c.reelCount > 0 && c.storyCount > 0 ? 'Reel & Story' : c.storyCount > 0 ? 'Story' : 'Reel');

    return {
      id: c.id,
      brandId: c.brandId || c.brandProfileId,
      brand: c.brandName || c.brand?.companyName || 'Richy Brand',
      brandLogo: c.brandLogo || c.brand?.logo || null,
      cat: c.campaignType || c.category || 'General',
      verified: c.verified ?? c.brand?.verified ?? false,
      title: c.title,
      budget: typeof c.budget === 'number' ? `₹${(c.budget / 100).toLocaleString()}` : (c.budget || '₹10,000'),
      budgetNum: typeof c.budget === 'number' ? c.budget : 10000,
      deadline: c.deadline || '5 days left',
      applicants: c.applicants || 0,
      tone: c.tone || (c.campaignType === 'Beauty' ? 'rose' : 'ox'),
      about: c.description || c.about,
      deliverables,
      platform: c.platform || 'Instagram',
      type,
      followers: c.followers || '10k+',
      imageUrl: c.imageUrl || null,
      numCreators,
      costPerCreator,
      category: c.category || null,
      objective: c.objective || null,
      gender: c.gender || null,
      targetLanguage: c.targetLanguage || null,
      mustMention: c.mustMention || null,
      hashtags: c.hashtags || null,
      brandTone: c.brandTone || null,
      audioInstructionUrl: c.audioInstructionUrl || c.audioUrl || null,
      prodName: c.prodName || null,
      prodValue: c.prodValue || 0,
      prodDescription: c.prodDescription || null,
      prodSku: c.prodSku || null,
      prodUrl: c.prodUrl || null,
      prodShipping: c.prodShipping || null,
    };
  }, [collabData]);

  const myApplication = React.useMemo(() => {
    if (!collabData?.applications || !activeInfluencerProfileId) return null;
    return collabData.applications.find((app: any) => app.influencerId === activeInfluencerProfileId);
  }, [collabData?.applications, activeInfluencerProfileId]);

  // Audio Player hook for voice note instructions
  const player = useAudioPlayer(cm?.audioInstructionUrl || undefined);
  const playerStatus = useAudioPlayerStatus(player);

  const handlePlayPause = () => {
    if (playerStatus.playing) {
      player.pause();
    } else {
      player.seekTo(0);
      player.play();
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const triggerApplyAnimation = () => {
    Animated.sequence([
      Animated.timing(applyScale, {
        toValue: 0.94,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(applyScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const applyMutation = useMutation({
    mutationFn: ({ proposal, bidAmount, reelCount, storyCount }: { proposal: string; bidAmount: number; reelCount: number; storyCount: number }) =>
      api.influencers.apply(id, proposal, bidAmount, reelCount, storyCount),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['collab', id] });
      const previousCollab = queryClient.getQueryData<any>(['collab', id]);

      if (previousCollab) {
        queryClient.setQueryData(['collab', id], {
          ...previousCollab,
          campaign: {
            ...previousCollab.campaign,
            applicants: (previousCollab.campaign.applicants ?? 0) + 1,
          }
        });
      }
      setApplied(true);
      return { previousCollab };
    },
    onError: (err: any, _, context) => {
      if (context?.previousCollab) {
        queryClient.setQueryData(['collab', id], context.previousCollab);
      }
      setApplied(false);
      useUIStore.getState().showModal({ title: 'Error', message: err.message || 'Failed to submit application' });
    },
    onSuccess: () => {
      triggerApplyAnimation();
      useUIStore.getState().showModal({ title: 'Success', message: 'Application submitted successfully!' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['collab', id] });
      queryClient.invalidateQueries({ queryKey: ['campaignsMarketplace'] });
    }
  });

  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<LottieView>(null);

  const acceptCounterMutation = useMutation({
    mutationFn: () => api.influencers.acceptCounterOffer(myApplication!.id),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['collab', id] });
      // Show confetti celebration
      setShowConfetti(true);
      useUIStore.getState().showModal({
        title: 'Offer Accepted! 🎉',
        message: 'You have accepted the brand\'s counter-offer. Navigating to your chat room...',
        actions: [
          {
            text: 'Go to Chat',
            onPress: () => {
              router.push({
                pathname: '/chat/[id]' as any,
                params: {
                  id: res.roomId,
                }
              });
            }
          }
        ]
      });
    },
    onError: (err: any) => {
      useUIStore.getState().showModal({ title: 'Error', message: err.message || 'Failed to accept counter-offer' });
    }
  });

  const counterMutation = useMutation({
    mutationFn: (amount: number) => api.influencers.counterOffer(myApplication!.id, amount),
    onSuccess: () => {
      setCounterSheetOpen(false);
      queryClient.invalidateQueries({ queryKey: ['collab', id] });
      useUIStore.getState().showModal({ title: 'Counter Offer Sent', message: 'Your counter-offer has been sent to the brand.' });
    },
    onError: (err: any) => {
      useUIStore.getState().showModal({ title: 'Error', message: err.message || 'Failed to send counter-offer' });
    }
  });

  // Collaboration steps states & mutations
  const [scriptInput, setScriptInput] = useState('');
  const [postLinkInput, setPostLinkInput] = useState('');

  useEffect(() => {
    if (myApplication) {
      setScriptInput(myApplication.scriptUrl || '');
      setPostLinkInput(myApplication.postLink || '');
    }
  }, [myApplication?.scriptUrl, myApplication?.postLink]);

  const submitScriptMutation = useMutation({
    mutationFn: (scriptUrl: string) => api.influencers.submitScript(myApplication!.id, scriptUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collab', id] });
      useUIStore.getState().showModal({ title: 'Success', message: 'Script draft submitted successfully!' });
    },
    onError: (err: any) => {
      useUIStore.getState().showModal({ title: 'Error', message: err.message || 'Failed to submit script draft' });
    }
  });

  const submitPostLinkMutation = useMutation({
    mutationFn: (postLink: string) => api.influencers.submitPostLink(myApplication!.id, postLink),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collab', id] });
      useUIStore.getState().showModal({ title: 'Success', message: 'Live post link shared successfully!' });
    },
    onError: (err: any) => {
      useUIStore.getState().showModal({ title: 'Error', message: err.message || 'Failed to submit post link' });
    }
  });

  const loading = applyMutation.isPending;

  const handleShareCampaign = async () => {
    try {
      const shareUrl = `https://app.richyreach.com/shared/${id}`;
      await Share.share({
        message: `Check out this collaboration campaign "${cm?.title}" by ${cm?.brand} on RichyReach! View details and apply here: ${shareUrl}`,
      });
    } catch (err) {
      console.error('Failed to share campaign:', err);
    }
  };

  const handleApply = async () => {
    if (role !== 'influencer') {
      useUIStore.getState().showModal({ title: 'Info', message: 'Only influencers can apply to campaigns' });
      return;
    }
    if (applied || !!myApplication) return;

    let profiles = useProfilesStore.getState().influencerProfiles;
    if (profiles.length === 0) {
      try {
        const fetched = await api.influencers.profiles();
        if (fetched && fetched.length > 0) {
          const userId = useAuthStore.getState().session?.user?.id;
          if (userId) {
            await useProfilesStore.getState().loadInfluencerProfiles(userId, fetched[0]);
          }
          profiles = fetched;
        }
      } catch {
        // Suppress errors
      }
    }

    if (profiles.length === 0) {
      setCreateProfileOpen(true);
      return;
    }

    setApplySheetOpen(true);
  };

  const handleApplySubmit = (proposal: string, bidAmount: number, reelCount: number, storyCount: number) => {
    setApplySheetOpen(false);
    applyMutation.mutate({ proposal, bidAmount, reelCount, storyCount });
  };

  if (isLoading || !cm) {
    return <CollabDetailSkeleton />;
  }

  const facts = [
    { icon: UserGroupIcon, label: 'Min. audience', value: cm.followers },
    { icon: Calendar01Icon, label: 'Timeline', value: cm.deadline },
  ];

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero with zoomed container */}
        <View style={styles.heroWrap}>
          <Animated.View style={{ transform: [{ scale: heroScale }], width: '100%', height: '100%' }}>
            {cm.imageUrl ? (
              <Image source={{ uri: cm.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <PlaceholderImage tone={cm.tone} height={300} borderRadius={0} />
            )}
          </Animated.View>
          <LinearGradient
            colors={['rgba(42,2,7,0.45)', 'transparent', 'rgba(42,2,7,0.85)']}
            style={styles.heroOverlay}
          />
          {/* Top nav */}
          <View style={[styles.heroNav, { top: Math.max(insets.top, 16) + 12 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.navBtn} activeOpacity={0.8}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color={Colors.oxblood} strokeWidth={2} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={handleShareCampaign} style={styles.navBtn} activeOpacity={0.8}>
                <HugeiconsIcon icon={Share01Icon} size={19} color={Colors.oxblood} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (session?.user?.id && cm?.id) {
                    toggleSaveCampaign(session.user.id, cm.id);
                  }
                }}
                style={styles.navBtn}
                activeOpacity={0.8}
              >
                {cm && savedCampaignIds.includes(cm.id) ? (
                  <SavedBookmarkIcon size={20} color={Colors.rose} />
                ) : (
                  <UnsavedBookmarkIcon size={20} color={Colors.oxblood} strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          {/* Title overlay */}
          <View style={styles.heroTitle}>
            <View style={styles.brandRow}>
              {cm.brandLogo ? (
                <Image source={{ uri: cm.brandLogo }} style={{ height: 30, width: 30, borderRadius: 15 }} contentFit="cover" />
              ) : (
                <PlaceholderImage tone="cream" height={30} width={30} borderRadius={99} />
              )}
              <Text style={styles.brandName}>{cm.brand}</Text>
              {cm.verified && <HugeiconsIcon icon={BadgeCheckIcon} size={15} color={Colors.roseSoft} strokeWidth={2} />}
              <Text style={styles.reachText}>· {cm.followers} reach</Text>
            </View>
            <Text style={styles.campaignTitle}>{cm.title}</Text>
          </View>
        </View>

        {/* Animated Body Content */}
        <Animated.View style={[styles.body, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
          {/* Budget strip (Thematic background matched dynamically) */}
          <View style={[styles.budgetStrip, { backgroundColor: cm.tone === 'rose' ? Colors.roseDeep : Colors.oxblood }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.budgetLabel}>
                {cm.numCreators > 1 ? `Paid Collaboration · ${cm.numCreators} spots` : 'Paid collaboration'}
              </Text>
              <Text style={styles.budgetAmount}>
                {cm.numCreators > 1 ? `₹${cm.costPerCreator.toLocaleString('en-IN')}` : cm.budget}
                {cm.numCreators > 1 && <Text style={styles.budgetPerSpotLabel}> / spot</Text>}
              </Text>
              {cm.numCreators > 1 && (
                <Text style={styles.budgetTotalSubText}>Total Budget: {cm.budget}</Text>
              )}
            </View>
            <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
              <View style={styles.deadlineRow}>
                <HugeiconsIcon icon={Clock01Icon} size={14} color={Colors.roseSoft} strokeWidth={2} />
                <Text style={styles.deadlineText}>{cm.deadline}</Text>
              </View>
              <Text style={styles.applicantsText}>{cm.applicants} creators applied</Text>
            </View>
          </View>

          {/* Collaboration Workspace — tap to open dedicated workspace page */}
          {myApplication && myApplication.status === 'accepted' && (
            <TouchableOpacity
              style={styles.collabWorkspaceCard}
              activeOpacity={0.85}
              onPress={() =>
                router.push({ pathname: '/collab/workspace/[id]' as any, params: { id } })
              }
            >
              <View style={styles.collabWorkspaceHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.collabWorkspaceTitle}>Collaboration Workspace</Text>
                  <Icon name="chevron" size={16} color={Colors.roseDeep} />
                </View>
                <Text style={styles.collabWorkspaceSubtitle}>Tap to open your workspace and complete deliverables</Text>
              </View>

              {/* Quick step summary — tap card to open full workspace */}
              {[
                {
                  label: 'Script Draft',
                  status: myApplication.scriptStatus === 'approved'
                    ? 'approved'
                    : myApplication.scriptStatus === 'pending'
                      ? 'pending'
                      : 'action_needed',
                  text: myApplication.scriptStatus === 'approved'
                    ? 'Approved ✓'
                    : myApplication.scriptStatus === 'pending'
                      ? 'Under Review…'
                      : 'Not submitted',
                },
                {
                  label: 'Video Draft Review',
                  status: myApplication.videoStatus === 'approved'
                    ? 'approved'
                    : myApplication.videoStatus === 'pending'
                      ? 'pending'
                      : 'action_needed',
                  text: myApplication.videoStatus === 'approved'
                    ? 'Approved ✓'
                    : myApplication.videoStatus === 'pending'
                      ? 'Under Review…'
                      : 'Not submitted',
                },
                {
                  label: 'Live Post Link',
                  status: myApplication.postLink ? 'approved' : 'action_needed',
                  text: myApplication.postLink ? 'Submitted ✓' : 'Not submitted',
                },
              ].map((step) => (
                <View key={step.label} style={styles.collabStepRow}>
                  <View style={[
                    styles.collabStepDot,
                    step.status === 'approved' && styles.collabStepDotDone,
                    step.status === 'pending' && styles.collabStepDotPending,
                  ]}>
                    {step.status === 'approved'
                      ? <Icon name="check" size={9} color="#fff" />
                      : <Icon name="clock" size={9} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.collabStepLabel}>{step.label}</Text>
                    <Text style={[
                      styles.collabStepVal,
                      step.status === 'approved' && { color: Colors.green },
                      step.status === 'pending' && { color: '#e67e22' },
                    ]}>{step.text}</Text>
                  </View>
                </View>
              ))}
            </TouchableOpacity>
          )}

          {/* Facts Grid */}
          <View style={styles.factsWrap}>
            {facts.map((f) => (
              <View key={f.label} style={styles.factCard}>
                <HugeiconsIcon icon={f.icon} size={16} color={Colors.rose} strokeWidth={2} />
                <Text style={styles.factValue}>{f.value}</Text>
                <Text style={styles.factLabel}>{f.label}</Text>
              </View>
            ))}
          </View>

          {/* About Brief */}
          <View style={{ marginTop: 24 }}>
            <SectionHead title="The brief" action={null} />
            <Text style={styles.aboutText}>{cm.about}</Text>
          </View>

          {/* Campaign Details Section */}
          <View style={styles.detailsSectionContainer}>
            <SectionHead title="Campaign Details" action={null} />
            <View style={styles.detailsGrid}>
              {cm.category && (
                <View style={styles.detailGridItem}>
                  <Icon name="briefcase" size={16} color={Colors.roseDeep} />
                  <View style={styles.detailItemTextContainer}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <Text style={styles.detailValue}>{cm.category}</Text>
                  </View>
                </View>
              )}
              {cm.objective && (
                <View style={styles.detailGridItem}>
                  <Icon name="star" size={16} color={Colors.roseDeep} />
                  <View style={styles.detailItemTextContainer}>
                    <Text style={styles.detailLabel}>Objective</Text>
                    <Text style={styles.detailValue}>{cm.objective.replace(/_/g, ' ')}</Text>
                  </View>
                </View>
              )}
              {cm.gender && (
                <View style={styles.detailGridItem}>
                  <Icon name="users" size={16} color={Colors.roseDeep} />
                  <View style={styles.detailItemTextContainer}>
                    <Text style={styles.detailLabel}>Target Gender</Text>
                    <Text style={styles.detailValue}>{cm.gender}</Text>
                  </View>
                </View>
              )}
              {cm.targetLanguage && (
                <View style={styles.detailGridItem}>
                  <Icon name="globe" size={16} color={Colors.roseDeep} />
                  <View style={styles.detailItemTextContainer}>
                    <Text style={styles.detailLabel}>Language</Text>
                    <Text style={styles.detailValue}>{cm.targetLanguage}</Text>
                  </View>
                </View>
              )}
              {cm.brandTone && (
                <View style={styles.detailGridItem}>
                  <Icon name="sun" size={16} color={Colors.roseDeep} />
                  <View style={styles.detailItemTextContainer}>
                    <Text style={styles.detailLabel}>Brand Tone</Text>
                    <Text style={styles.detailValue}>{cm.brandTone}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Must Mention Banner */}
            {cm.mustMention && (
              <View style={styles.requirementBanner}>
                <View style={styles.requirementBannerHeader}>
                  <Icon name="mic" size={15} color={Colors.oxblood} />
                  <Text style={styles.requirementBannerTitle}>Must Mention Keywords</Text>
                </View>
                <Text style={styles.requirementBannerText}>{cm.mustMention}</Text>
              </View>
            )}

            {/* Hashtags Banner */}
            {cm.hashtags && (
              <View style={[styles.requirementBanner, { backgroundColor: 'rgba(63,3,11,0.02)', borderColor: 'rgba(63,3,11,0.05)' }]}>
                <View style={styles.requirementBannerHeader}>
                  <Icon name="bookmark" size={15} color={Colors.oxblood} />
                  <Text style={styles.requirementBannerTitle}>Required Hashtags</Text>
                </View>
                <Text style={[styles.requirementBannerText, { color: Colors.roseDeep, fontWeight: '700' }]}>{cm.hashtags}</Text>
              </View>
            )}

            {/* Audio Instructions Player */}
            {cm.audioInstructionUrl && (
              <View style={styles.audioInstructionsCard}>
                <Text style={styles.audioSectionHeading}>Audio Instructions</Text>
                <View style={styles.audioPlayerControlsRow}>
                  <TouchableOpacity style={styles.audioPlayBtn} onPress={handlePlayPause} activeOpacity={0.8}>
                    <Icon name={playerStatus.playing ? 'pause' : 'play'} size={18} color="#fff" />
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.audioInstructionsText}>
                      {playerStatus.playing
                        ? `Playing instructions...`
                        : `Listen to voice instructions`}
                    </Text>
                    <Text style={styles.audioDurationText}>
                      {formatDuration(playerStatus.currentTime)} / {formatDuration(playerStatus.duration ?? 0)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Barter Product Details */}
          {cm.prodName && (
            <View style={styles.barterDetailsCard}>
              <View style={styles.barterHeader}>
                <Icon name="gift" size={18} color={Colors.roseDeep} />
                <Text style={styles.barterCardTitle}>Barter Product Details</Text>
              </View>

              <View style={styles.barterDetailsGrid}>
                <View style={styles.barterDetailRow}>
                  <Text style={styles.barterLabel}>Product Name</Text>
                  <Text style={styles.barterValue}>{cm.prodName}</Text>
                </View>

                {cm.prodValue > 0 && (
                  <View style={styles.barterDetailRow}>
                    <Text style={styles.barterLabel}>Product Value</Text>
                    <Text style={styles.barterValuePrice}>₹{cm.prodValue.toLocaleString()}</Text>
                  </View>
                )}

                {cm.prodSku && (
                  <View style={styles.barterDetailRow}>
                    <Text style={styles.barterLabel}>SKU / Code</Text>
                    <Text style={styles.barterValue}>{cm.prodSku}</Text>
                  </View>
                )}

                {cm.prodShipping && (
                  <View style={styles.barterDetailRowCol}>
                    <Text style={styles.barterLabel}>Shipping Details</Text>
                    <Text style={styles.barterValueDesc}>{cm.prodShipping}</Text>
                  </View>
                )}

                {cm.prodDescription && (
                  <View style={styles.barterDetailRowCol}>
                    <Text style={styles.barterLabel}>Product Description</Text>
                    <Text style={styles.barterValueDesc}>{cm.prodDescription}</Text>
                  </View>
                )}

                {cm.prodUrl && (
                  <TouchableOpacity
                    style={styles.barterLinkBtn}
                    onPress={() => Linking.openURL(cm.prodUrl)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.barterLinkBtnText}>View Product Page ↗</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Deliverables */}
          {cm.deliverables.length > 0 && <View style={{ marginTop: 24 }}>
            <SectionHead title="What you'll deliver" action={null} />
            <View style={styles.deliverablesList}>
              {cm.deliverables.map((d: string, k: number) => (
                <View key={k} style={[styles.deliverableRow, k < cm.deliverables.length - 1 && styles.deliverableBorder]}>
                  <GradientView variant="rose" style={styles.checkCircle}>
                    <HugeiconsIcon icon={CheckIcon} size={14} color="#fff" strokeWidth={2} />
                  </GradientView>
                  <Text style={styles.deliverableText}>{d}</Text>
                </View>
              ))}
            </View>
          </View>}

          {/* Brand Card Info */}
          <View style={{ marginTop: 24 }}>
            <SectionHead title="About the brand" action={null} />
            <View style={styles.brandCard}>
              {cm.brandLogo ? (
                <Image source={{ uri: cm.brandLogo }} style={{ height: 52, width: 52, borderRadius: 14 }} contentFit="cover" />
              ) : (
                <PlaceholderImage tone={cm.tone} height={52} width={52} borderRadius={14} />
              )}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Text style={styles.brandCardName}>{cm.brand}</Text>
                  {cm.verified && <HugeiconsIcon icon={BadgeCheckIcon} size={14} color={Colors.rose} strokeWidth={2} />}
                </View>
                <Text style={styles.brandCardMeta}>{cm.cat} · 12 active campaigns · 4.9 ★</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (cm?.brandId) {
                    router.push({
                      pathname: '/chat/[id]' as any,
                      params: {
                        id: cm.brandId,
                      }
                    });
                  }
                }}
                style={styles.messageBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.messageBtnText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Sticky Bottom Apply Bar */}
      <LinearGradient
        colors={['rgba(244,236,228,0)', 'rgba(244,236,228,0.95)']}
        style={[styles.applyBar, { paddingBottom: insets.bottom + 14 }]}
      >
        <TouchableOpacity
          onPress={() => {
            // Find or create chat room for this campaign
            if (cm?.brandId) {
              router.push({
                pathname: '/chat/[id]' as any,
                params: {
                  id: cm.brandId,
                }
              });
            }
          }}
          style={styles.chatBtn}
          activeOpacity={0.8}
        >
          <HugeiconsIcon icon={ChatIcon} size={22} color={Colors.oxblood} strokeWidth={2} />
        </TouchableOpacity>

        {myApplication && myApplication.status === 'negotiating' && myApplication.lastActionBy === 'brand' ? (
          <View style={{ flex: 1, flexDirection: 'row', gap: 10, height: 52 }}>
            <TouchableOpacity
              onPress={() => setCounterSheetOpen(true)}
              style={[styles.applyBtn, { flex: 1, backgroundColor: Colors.oxblood }]}
              activeOpacity={0.8}
            >
              <Text style={styles.applyBtnText}>Counter Bid</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => acceptCounterMutation.mutate()}
              style={[styles.applyBtn, { flex: 1.4, backgroundColor: Colors.green }]}
              activeOpacity={0.8}
              disabled={acceptCounterMutation.isPending}
            >
              {acceptCounterMutation.isPending ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.applyBtnText}>Accepting...</Text>
                </View>
              ) : (
                <Text style={styles.applyBtnText}>
                  Accept: ₹{(myApplication.counterAmount / 100).toLocaleString()}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View style={{ flex: 1, height: 52, transform: [{ scale: applyScale }] }}>
            <TouchableOpacity
              onPress={handleApply}
              activeOpacity={0.85}
              disabled={loading || !!myApplication}
              style={[
                styles.applyBtn,
                myApplication && myApplication.status === 'accepted' && { backgroundColor: Colors.green },
                myApplication && myApplication.status === 'rejected' && { backgroundColor: 'rgba(63,3,11,0.4)' },
                myApplication && myApplication.status === 'pending' && styles.applyBtnDone,
                myApplication && myApplication.status === 'negotiating' && { backgroundColor: Colors.roseDeep },
                loading && { opacity: 0.6 }
              ]}
            >
              <Text style={styles.applyBtnText}>
                {loading ? 'Submitting…' : (
                  myApplication ? (
                    myApplication.status === 'accepted' ? `✓ Accepted · ₹${(myApplication.bidAmount / 100).toLocaleString()}` : (
                      myApplication.status === 'rejected' ? '✕ Application Declined' : (
                        myApplication.status === 'negotiating' ? `Awaiting Brand · ₹${(myApplication.bidAmount / 100).toLocaleString()}` : `Applied · ₹${(myApplication.bidAmount / 100).toLocaleString()}`
                      )
                    )
                  ) : (
                    cm.numCreators > 1
                      ? `Apply now · ₹${cm.costPerCreator.toLocaleString('en-IN')} / spot`
                      : `Apply now · ${cm.budget}`
                  )
                )}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </LinearGradient>

      <CreateInfluencerProfileSheet
        isOpen={createProfileOpen}
        onClose={() => setCreateProfileOpen(false)}
        onSuccess={() => {
          // Trigger apply on successful profile creation
          handleApply();
        }}
        initialData={null}
      />

      <ApplyCampaignSheet
        isOpen={applySheetOpen}
        onClose={() => setApplySheetOpen(false)}
        onSubmit={handleApplySubmit}
        submitting={loading}
        campaignTitle={cm.title}
        campaignCategory={cm.category}
        suggestedBudget={Math.round(cm.costPerCreator * 100)}
        totalBudget={cm.budgetNum}
      />

      {myApplication && (
        <CounterOfferSheet
          isOpen={counterSheetOpen}
          onClose={() => setCounterSheetOpen(false)}
          onSubmit={(amount) => counterMutation.mutate(amount)}
          submitting={counterMutation.isPending}
          originalBidAmount={myApplication.counterAmount || myApplication.bidAmount}
          campaignTitle={cm.title}
          influencerName="Propose Counter Bid"
        />
      )}

      {/* Confetti overlay — shown when counter-offer is accepted */}
      {showConfetti && (
        <View style={styles.confettiOverlay} pointerEvents="none">
          <LottieView
            ref={confettiRef}
            source={require('@/assets/lottie-animation/coffeti.json')}
            autoPlay
            loop={false}
            style={styles.confettiAnim}
            onAnimationFinish={() => {
              setTimeout(() => setShowConfetti(false), 400);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  heroWrap: { position: 'relative', height: 300, overflow: 'hidden' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroNav: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 2 },
  navBtn: { width: 40, height: 40, borderRadius: 99, backgroundColor: 'rgba(244,236,228,0.92)', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { position: 'absolute', left: 20, right: 20, bottom: 22 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  brandName: { fontWeight: '700', fontSize: 14, color: Colors.cream },
  reachText: { fontSize: 12, color: 'rgba(232,216,204,0.7)' },
  campaignTitle: { fontFamily: FontFamily.sansMedium, fontSize: 24, fontWeight: '600', color: Colors.cream, lineHeight: 28 },

  body: { paddingHorizontal: 18, paddingTop: 20 },

  budgetStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 18, padding: 16 },
  budgetLabel: { fontSize: 11.5, color: Colors.roseSoft, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  budgetAmount: { fontFamily: FontFamily.sansMedium, fontSize: 28, fontWeight: '700', color: Colors.cream, marginTop: 3 },
  budgetPerSpotLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 14,
    fontWeight: '400',
    color: Colors.roseSoft,
  },
  budgetTotalSubText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.roseSoft,
    marginTop: 2,
    opacity: 0.9,
  },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  deadlineText: { fontSize: 12, color: Colors.cream, fontWeight: '600' },
  applicantsText: { fontSize: 11.5, color: 'rgba(232,216,204,0.6)', marginTop: 3 },

  factsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  factCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)'
  },
  factValue: { fontFamily: FontFamily.sansMedium, fontSize: 15, fontWeight: '700', color: Colors.ink, marginTop: 6 },
  factLabel: { fontSize: 11, color: 'rgba(63,3,11,0.5)', fontWeight: '600', marginTop: 1 },

  aboutText: { fontFamily: FontFamily.sansRegular, fontSize: 14.5, lineHeight: 24, color: 'rgba(42,2,7,0.78)' },

  deliverablesList: { backgroundColor: '#fff', borderRadius: 18, paddingVertical: 6, paddingHorizontal: 4, ...Shadow.card, borderWidth: 0.5, borderColor: 'rgba(63,3,11,0.04)' },
  deliverableRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
  deliverableBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.07)' },
  checkCircle: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  deliverableText: { fontFamily: FontFamily.sansMedium, fontSize: 14, color: Colors.ink },

  brandCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 18, padding: 16, ...Shadow.card, borderWidth: 0.5, borderColor: 'rgba(63,3,11,0.04)' },
  brandCardName: { fontFamily: FontFamily.sansMedium, fontWeight: '700', fontSize: 15, color: Colors.ink },
  brandCardMeta: { fontSize: 12.5, color: 'rgba(63,3,11,0.55)', marginTop: 2 },
  messageBtn: { borderWidth: 1.5, borderColor: Colors.oxblood, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 8 },
  messageBtnText: { fontFamily: FontFamily.sansMedium, fontWeight: '700', fontSize: 12.5, color: Colors.oxblood },

  applyBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 14, flexDirection: 'row', gap: 12, alignItems: 'center' },
  chatBtn: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...Shadow.card, borderWidth: 0.5, borderColor: 'rgba(63,3,11,0.04)' },
  applyBtn: { width: '100%', height: '100%', borderRadius: 16, backgroundColor: Colors.oxblood, alignItems: 'center', justifyContent: 'center', ...Shadow.button },
  applyBtnDone: { backgroundColor: Colors.roseDeep },
  applyBtnText: { fontFamily: FontFamily.sans, fontWeight: '800', fontSize: 16, color: Colors.cream },

  // Collaboration steps workspace styles
  collabWorkspaceCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  collabWorkspaceHeader: {
    marginBottom: 20,
  },
  collabWorkspaceTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  collabWorkspaceSubtitle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.5)',
    marginTop: 4,
  },
  stepContainer: {
    flexDirection: 'row',
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.06)',
    marginBottom: 20,
  },
  stepContainerLocked: {
    opacity: 0.5,
  },
  stepLeft: {
    alignItems: 'center',
    marginRight: 14,
  },
  stepIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicatorActive: {
    backgroundColor: Colors.roseDeep,
  },
  stepIndicatorDone: {
    backgroundColor: Colors.green,
  },
  stepIndicatorPending: {
    backgroundColor: '#e67e22',
  },
  stepIndicatorLocked: {
    backgroundColor: '#eee',
  },
  stepIndicatorText: {
    fontFamily: FontFamily.sansMedium,
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  stepConnectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(63,3,11,0.06)',
    marginTop: 6,
    marginBottom: -16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },
  stepTitleLocked: {
    color: 'rgba(63,3,11,0.4)',
  },
  stepDescription: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.6)',
    marginTop: 4,
    lineHeight: 18,
  },
  stepDescriptionLocked: {
    color: 'rgba(63,3,11,0.3)',
  },
  stepStatusTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  stepStatusValText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '600',
  },
  stepForm: {
    marginTop: 12,
  },
  rejectedBanner: {
    backgroundColor: 'rgba(235, 87, 87, 0.08)',
    borderColor: 'rgba(235, 87, 87, 0.16)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  rejectedBannerText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: '#eb5757',
  },
  pendingBanner: {
    backgroundColor: 'rgba(230, 126, 34, 0.08)',
    borderColor: 'rgba(230, 126, 34, 0.16)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  pendingBannerText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: '#e67e22',
  },
  celebrationCard: {
    backgroundColor: 'rgba(46, 204, 113, 0.08)',
    borderColor: 'rgba(46, 204, 113, 0.16)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  celebrationCardText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: '#27ae60',
    lineHeight: 18,
  },
  pendingCompletionCard: {
    backgroundColor: 'rgba(241, 196, 15, 0.08)',
    borderColor: 'rgba(241, 196, 15, 0.16)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  pendingCompletionCardText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: '#d4ac0d',
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13.5,
    fontFamily: FontFamily.sansRegular,
    color: Colors.ink,
    marginBottom: 8,
  },
  submitBtn: {
    backgroundColor: Colors.oxblood,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontFamily: FontFamily.sansMedium,
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  lockedHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  lockedHintText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
    color: 'rgba(63,3,11,0.4)',
  },

  // Campaign details and barter styles
  detailsSectionContainer: {
    marginTop: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  detailGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: '45%',
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(63,3,11,0.06)',
    gap: 10,
    ...Shadow.card,
  },
  detailItemTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10.5,
    color: 'rgba(63,3,11,0.5)',
    fontWeight: '600',
  },
  detailValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.ink,
    marginTop: 1,
    textTransform: 'capitalize',
  },
  requirementBanner: {
    backgroundColor: 'rgba(63,3,11,0.01)',
    borderWidth: 0.5,
    borderColor: 'rgba(63,3,11,0.06)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  requirementBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  requirementBannerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  requirementBannerText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.7)',
    lineHeight: 18,
  },
  audioInstructionsCard: {
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: 'rgba(63,3,11,0.06)',
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    ...Shadow.card,
  },
  audioSectionHeading: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.oxblood,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  audioPlayerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  audioPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioInstructionsText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.ink,
  },
  audioDurationText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(63,3,11,0.45)',
    marginTop: 2,
  },
  barterDetailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginTop: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(63,3,11,0.06)',
    ...Shadow.card,
  },
  barterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.06)',
    paddingBottom: 8,
  },
  barterCardTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  barterDetailsGrid: {
    gap: 12,
  },
  barterDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.04)',
    paddingBottom: 8,
  },
  barterDetailRowCol: {
    flexDirection: 'column',
    gap: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.04)',
    paddingBottom: 8,
  },
  barterLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
    color: 'rgba(63,3,11,0.5)',
  },
  barterValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  barterValuePrice: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.roseDeep,
  },
  barterValueDesc: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.7)',
    lineHeight: 18,
  },
  barterLinkBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  barterLinkBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.roseDeep,
    textDecorationLine: 'underline',
  },

  // Workspace summary card step rows
  collabStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.05)',
  },
  collabStepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(63,3,11,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  collabStepDotDone: {
    backgroundColor: Colors.green,
  },
  collabStepDotPending: {
    backgroundColor: '#e67e22',
  },
  collabStepLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(63,3,11,0.45)',
  },
  collabStepVal: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.ink,
    fontWeight: '600',
  },

  // Confetti overlay
  confettiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: 'none',
  },
  confettiAnim: {
    width: '100%',
    height: '100%',
  },
});
