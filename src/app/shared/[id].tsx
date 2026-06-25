import { GradientView } from '@/components/ui/gradient-view';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { SectionHead } from '@/components/ui/section-head';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Skeleton } from '@/components/ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, Share01Icon, BadgeCheckIcon, Clock01Icon, InstagramIcon, Camera01Icon, UserGroupIcon, Calendar01Icon, CheckIcon } from '@hugeicons/core-free-icons';
import { Icon } from '@/components/ui/icon';

function PublicDetailSkeleton() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <View style={{ height: 260, backgroundColor: 'rgba(63,3,11,0.06)' }} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Skeleton width="60%" height={24} />
        <Skeleton width="40%" height={16} />
        <Skeleton width="100%" height={100} />
        <Skeleton width="80%" height={40} />
        <Skeleton width="100%" height={120} />
      </ScrollView>
    </View>
  );
}

export default function PublicCampaignDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isLoggedIn = !!useAuthStore((s) => s.session);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  const heroScale = useRef(new Animated.Value(1.15)).current;

  useEffect(() => {
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

  const { data: campaign, isLoading } = useQuery<any>({
    queryKey: ['campaign-public', id],
    queryFn: () => api.campaigns.getPublic(id!),
    enabled: !!id,
  });

  const cm = React.useMemo(() => {
    if (!campaign) return null;
    const numCreators = campaign.numCreators || 1;
    const costPerCreator = campaign.costPerCreator || (typeof campaign.budget === 'number' ? (campaign.budget / 100) / Math.max(1, numCreators) : 10000);
    
    let brief = {};
    if (campaign.briefDetails) {
      try {
        brief = typeof campaign.briefDetails === 'string' ? JSON.parse(campaign.briefDetails) : campaign.briefDetails;
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
    } else {
      if (campaign.reelCount > 0) deliverables.push(`${campaign.reelCount}x Reel(s)`);
      if (campaign.storyCount > 0) deliverables.push(`${campaign.storyCount}x Story(ies)`);
      if (deliverables.length === 0) deliverables.push('1x Reel(s)');
    }

    const type = campaign.campaignType || (campaign.reelCount > 0 && campaign.storyCount > 0 ? 'Reel & Story' : campaign.storyCount > 0 ? 'Story' : 'Reel');

    return {
      id: campaign.id,
      brandId: campaign.brandId || campaign.brandProfileId,
      brand: campaign.brandName || 'Richy Brand',
      brandLogo: campaign.brandLogo || null,
      cat: campaign.category || 'General',
      verified: campaign.verified ?? false,
      title: campaign.title,
      budget: typeof campaign.budget === 'number' ? `₹${(campaign.budget / 100).toLocaleString()}` : '₹10,000',
      budgetNum: typeof campaign.budget === 'number' ? campaign.budget : 10000,
      deadline: campaign.applicationDeadline ? `Apply by ${new Date(campaign.applicationDeadline).toLocaleDateString()}` : 'Limited time left',
      applicants: campaign.applicants || 0,
      tone: campaign.category === 'Beauty' ? 'rose' : 'ox',
      about: campaign.description || '',
      deliverables,
      platform: 'Instagram',
      type,
      followers: campaign.creatorSize || '10k+',
      imageUrl: campaign.imageUrl || null,
      numCreators,
      costPerCreator,
      category: campaign.category || null,
      objective: campaign.objective || null,
      gender: campaign.gender || null,
      targetLanguage: campaign.targetLanguage || null,
      mustMention: campaign.mustMention || null,
      hashtags: campaign.hashtags || null,
      brandTone: campaign.brandTone || null,
      prodName: campaign.prodName || null,
      prodValue: campaign.prodValue || 0,
      prodDescription: campaign.prodDescription || null,
      prodSku: campaign.prodSku || null,
      prodUrl: campaign.prodUrl || null,
      prodShipping: campaign.prodShipping || null,
      paymentType: campaign.paymentType || 'Paid',
    };
  }, [campaign]);

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

  const handleAction = () => {
    if (isLoggedIn) {
      router.push(`/collab/${id}`);
    } else {
      router.push('/(auth)');
    }
  };

  if (isLoading || !cm) {
    return <PublicDetailSkeleton />;
  }

  const toneColor = cm.tone === 'rose' ? Colors.roseDeep : Colors.oxblood;

  const facts = [
    { icon: InstagramIcon, label: 'Platform', value: cm.platform },
    { icon: Camera01Icon, label: 'Deliverables', value: cm.type },
    { icon: UserGroupIcon, label: 'Min. audience', value: cm.followers },
    { icon: Calendar01Icon, label: 'Timeline', value: cm.deadline },
  ];

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <View style={styles.heroWrap}>
          <Animated.View style={{ transform: [{ scale: heroScale }], width: '100%', height: '100%' }}>
            {cm.imageUrl ? (
              <Image source={{ uri: cm.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <PlaceholderImage tone={cm.tone === 'rose' ? 'rose' : 'ox'} height={300} borderRadius={0} />
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
            <TouchableOpacity onPress={handleShareCampaign} style={styles.navBtn} activeOpacity={0.8}>
              <HugeiconsIcon icon={Share01Icon} size={19} color={Colors.oxblood} strokeWidth={2} />
            </TouchableOpacity>
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
              {cm.verified && <HugeiconsIcon icon={BadgeCheckIcon} size={14} color="#fff" strokeWidth={2} />}
            </View>
            <Text style={styles.campaignTitle}>{cm.title}</Text>
          </View>
        </View>

        {/* Content body */}
        <Animated.View style={[styles.body, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
          {/* Budget Info Strip */}
          <GradientView variant={cm.tone === 'rose' ? 'rose' : 'oxblood'} style={styles.budgetStrip}>
            <View>
              <Text style={styles.budgetLabel}>Rewards Budget</Text>
              <Text style={styles.budgetAmount}>
                {cm.paymentType === 'barter' ? 'Product Barter' : cm.budget}
              </Text>
              {cm.paymentType !== 'barter' && (
                <Text style={styles.budgetPerSpotLabel}>
                  ₹{(cm.costPerCreator || 0).toLocaleString('en-IN')} per spot · {cm.numCreators} open position(s)
                </Text>
              )}
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <View style={styles.deadlineRow}>
                <HugeiconsIcon icon={Clock01Icon} size={13} color={Colors.cream} strokeWidth={2.5} />
                <Text style={styles.deadlineText}>{cm.applicants} applied</Text>
              </View>
            </View>
          </GradientView>

          {/* Quick facts list */}
          <View style={styles.factsWrap}>
            {facts.map((f, i) => (
              <View key={i} style={styles.factCard}>
                <HugeiconsIcon icon={f.icon} size={20} color={toneColor} strokeWidth={2} />
                <Text style={styles.factValue}>{f.value}</Text>
                <Text style={styles.factLabel}>{f.label}</Text>
              </View>
            ))}
          </View>

          {/* Campaign About section */}
          <View style={{ marginTop: 24 }}>
            <SectionHead title="About the campaign" action={null} />
            <Text style={styles.aboutText}>{cm.about}</Text>
          </View>

          {/* Specifications cards grid */}
          <View style={{ marginTop: 24 }}>
            <SectionHead title="Campaign guidelines & rules" action={null} />
            <View style={styles.detailGridContainer}>
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
          </View>

          {/* Barter Product Details */}
          {cm.paymentType !== 'Paid' && cm.prodName && (
            <View style={{ marginTop: 24 }}>
              <SectionHead title="Product specifications" action={null} />
              <View style={styles.barterCard}>
                <Text style={styles.barterHeading}>Barter Product details</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsRowLabel}>Product name:</Text>
                  <Text style={styles.detailsRowValue}>{cm.prodName}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsRowLabel}>Estimated Retail value:</Text>
                  <Text style={styles.detailsRowValuePrice}>₹{(cm.prodValue || 0).toLocaleString()}</Text>
                </View>
                {cm.prodSku && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsRowLabel}>Product SKU:</Text>
                    <Text style={styles.detailsRowValue}>{cm.prodSku}</Text>
                  </View>
                )}
                {cm.prodShipping && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsRowLabel}>Shipping instructions:</Text>
                    <Text style={styles.detailsRowValue}>{cm.prodShipping}</Text>
                  </View>
                )}
                {cm.prodDescription && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={[styles.detailsRowLabel, { marginBottom: 4 }]}>Product details:</Text>
                    <Text style={styles.barterProductDesc}>{cm.prodDescription}</Text>
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
        </Animated.View>
      </ScrollView>

      {/* Sticky Bottom Apply Bar */}
      <LinearGradient
        colors={['rgba(244,236,228,0)', 'rgba(244,236,228,0.95)']}
        style={[styles.applyBar, { paddingBottom: insets.bottom + 14 }]}
      >
        <TouchableOpacity
          onPress={handleAction}
          activeOpacity={0.85}
          style={styles.applyBtn}
        >
          <Text style={styles.applyBtnText}>
            {isLoggedIn ? 'Apply now' : 'Join RichyReach & Apply'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
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
  campaignTitle: { fontFamily: FontFamily.sansMedium, fontSize: 24, fontWeight: '600', color: Colors.cream, lineHeight: 28 },

  body: { paddingHorizontal: 18, paddingTop: 20 },

  budgetStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 18, padding: 16 },
  budgetLabel: { fontSize: 11.5, color: Colors.roseSoft, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  budgetAmount: { fontFamily: FontFamily.sansMedium, fontSize: 28, fontWeight: '700', color: Colors.cream, marginTop: 3 },
  budgetPerSpotLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    fontWeight: '400',
    color: Colors.roseSoft,
    marginTop: 2,
  },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  deadlineText: { fontSize: 12, color: Colors.cream, fontWeight: '600' },

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

  detailGridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  detailGridItem: { flex: 1, minWidth: '45%', flexDirection: 'row', gap: 10, padding: 12, backgroundColor: '#fff', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(63,3,11,0.04)', ...Shadow.card },
  detailItemTextContainer: { flex: 1 },
  detailLabel: { fontSize: 10, color: 'rgba(63,3,11,0.4)', fontWeight: '700', textTransform: 'uppercase' },
  detailValue: { fontSize: 13.5, color: Colors.ink, fontFamily: FontFamily.sansMedium, marginTop: 2, textTransform: 'capitalize' },

  requirementBanner: { marginTop: 14, borderWidth: 1, borderColor: 'rgba(63,3,11,0.07)', backgroundColor: 'rgba(63,3,11,0.01)', borderRadius: 16, padding: 14 },
  requirementBannerHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  requirementBannerTitle: { fontFamily: FontFamily.sansMedium, fontSize: 11, color: Colors.roseDeep, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  requirementBannerText: { fontSize: 13.5, color: Colors.ink, lineHeight: 18 },

  barterCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 0.5, borderColor: 'rgba(63,3,11,0.04)', ...Shadow.card },
  barterHeading: { fontFamily: FontFamily.sansMedium, fontSize: 14, fontWeight: '800', textTransform: 'uppercase', color: Colors.oxblood, marginBottom: 12, letterSpacing: 0.5 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.05)' },
  detailsRowLabel: { fontSize: 13, color: 'rgba(63,3,11,0.45)', fontWeight: '600' },
  detailsRowValue: { fontSize: 13, color: Colors.ink, fontFamily: FontFamily.sansMedium },
  detailsRowValuePrice: { fontSize: 13.5, color: Colors.roseDeep, fontFamily: FontFamily.sansMedium, fontWeight: '700' },
  barterProductDesc: { fontSize: 13.5, color: 'rgba(42,2,7,0.7)', lineHeight: 19 },
  barterLinkBtn: { marginTop: 16, backgroundColor: 'rgba(63,3,11,0.02)', borderWidth: 1, borderColor: 'rgba(63,3,11,0.06)', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  barterLinkBtnText: { fontFamily: FontFamily.sansMedium, fontWeight: '700', fontSize: 13, color: Colors.oxblood },

  deliverablesList: { backgroundColor: '#fff', borderRadius: 18, paddingVertical: 6, paddingHorizontal: 4, ...Shadow.card, borderWidth: 0.5, borderColor: 'rgba(63,3,11,0.04)' },
  deliverableRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
  deliverableBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.07)' },
  checkCircle: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  deliverableText: { fontFamily: FontFamily.sansMedium, fontSize: 14, color: Colors.ink },

  applyBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 14, flexDirection: 'row', gap: 12, alignItems: 'center' },
  applyBtn: { flex: 1, height: 52, borderRadius: 16, backgroundColor: Colors.oxblood, alignItems: 'center', justifyContent: 'center', ...Shadow.button },
  applyBtnText: { fontFamily: FontFamily.sans, fontWeight: '800', fontSize: 16, color: Colors.cream },
});
