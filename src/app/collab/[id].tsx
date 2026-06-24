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
import React, { useEffect, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Skeleton } from '@/components/ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, Share01Icon, Bookmark02Icon, BadgeCheckIcon, Clock01Icon, InstagramIcon, Camera01Icon, UserGroupIcon, Calendar01Icon, CheckIcon, ChatIcon } from '@hugeicons/core-free-icons';

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
  const [applied, setApplied] = useState(false);
  const [createProfileOpen, setCreateProfileOpen] = useState(false);
  const [applySheetOpen, setApplySheetOpen] = useState(false);
  const [counterSheetOpen, setCounterSheetOpen] = useState(false);
  const queryClient = useQueryClient();

  const activeInfluencerProfileId = useProfilesStore((s) => s.activeInfluencerProfileId);

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

  const myApplication = React.useMemo(() => {
    if (!collabData?.applications || !activeInfluencerProfileId) return null;
    return collabData.applications.find((app: any) => app.influencerId === activeInfluencerProfileId);
  }, [collabData?.applications, activeInfluencerProfileId]);

  const cm = React.useMemo(() => {
    const c = collabData?.campaign;
    if (!c) {
      return null;
    }
    const numCreators = c.numCreators || 1;
    const costPerCreator = c.costPerCreator || (typeof c.budget === 'number' ? (c.budget / 100) / Math.max(1, numCreators) : 10000);
    return {
      id: c.id,
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
      deliverables: c.requirements ? (typeof c.requirements === 'string' ? c.requirements.split('\n') : c.requirements) : ['1 Reel'],
      platform: c.platform || 'Instagram',
      type: c.campaignType || 'Reel',
      followers: c.followers || '10k+',
      imageUrl: c.imageUrl || null,
      numCreators,
      costPerCreator,
    };
  }, [collabData]);

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
    mutationFn: ({ proposal, bidAmount }: { proposal: string; bidAmount: number }) =>
      api.influencers.apply(id, proposal, bidAmount),
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

  const acceptCounterMutation = useMutation({
    mutationFn: () => api.influencers.acceptCounterOffer(myApplication!.id),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['collab', id] });
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
                  name: cm?.brand || 'Brand',
                  avatar: cm?.brandLogo || '',
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

  const loading = applyMutation.isPending;

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

  const handleApplySubmit = (proposal: string, bidAmount: number) => {
    setApplySheetOpen(false);
    applyMutation.mutate({ proposal, bidAmount });
  };

  if (isLoading || !cm) {
    return <CollabDetailSkeleton />;
  }

  const facts = [
    { icon: InstagramIcon, label: 'Platform', value: cm.platform },
    { icon: Camera01Icon, label: 'Deliverables', value: cm.type },
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
              <TouchableOpacity style={styles.navBtn} activeOpacity={0.8}>
                <HugeiconsIcon icon={Share01Icon} size={19} color={Colors.oxblood} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} activeOpacity={0.8}>
                <HugeiconsIcon icon={Bookmark02Icon} size={19} color={Colors.oxblood} strokeWidth={2} />
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

          {/* Deliverables */}
          <View style={{ marginTop: 24 }}>
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
          </View>

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
                onPress={() => router.push({ pathname: '/chat/[id]', params: { id: cm.id } })}
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
            router.push({ pathname: '/chat/[id]', params: { id: cm.id } });
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
              <Text style={styles.applyBtnText}>
                {acceptCounterMutation.isPending ? 'Accepting...' : `Accept: ₹${(myApplication.counterAmount / 100).toLocaleString()}`}
              </Text>
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
        suggestedBudget={cm.budgetNum}
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
});
