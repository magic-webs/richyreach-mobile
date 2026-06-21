import { Colors, FontFamily } from '@/constants/brand';
import { api } from '@/lib/api';
import { useCampaignWizardStore } from '@/store/campaignWizard';
import { useProfilesStore } from '@/store/profiles';
import { useUIStore } from '@/store/ui';
import React, { useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Briefcase01Icon, Cancel01Icon, CheckIcon } from '@hugeicons/core-free-icons';

// Step Subcomponents
import { StepBasics } from './campaign-wizard/StepBasics';
import { StepDeliverables } from './campaign-wizard/StepDeliverables';
import { StepGuidelines } from './campaign-wizard/StepGuidelines';
import { StepMediaReview } from './campaign-wizard/StepMediaReview';
import { StepTargeting } from './campaign-wizard/StepTargeting';

interface CreateCampaignSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCampaignSheet({ isOpen, onClose, onSuccess }: CreateCampaignSheetProps) {
  const insets = useSafeAreaInsets();
  const showModal = useUIStore((s) => s.showModal);
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    createStep,
    campName,
    brandName,
    selectedBrandProfileId,
    campObjective,
    campDescription,
    campLocationType,
    campLocationValue,
    campNiche,
    campPriority,
    reelCount,
    storyCount,
    postCount,
    carouselCount,
    ytShortCount,
    ytVideoCount,
    liveCount,
    paymentType,
    costPerCreator,
    numCreators,
    paymentMethod,
    paymentTimeline,
    prodName,
    prodValue,
    prodDescription,
    prodSku,
    prodUrl,
    prodShipping,
    selectedPlatforms,
    minFollowers,
    minEngagementRate,
    targetGender,
    targetAgeRange,
    creatorSize,
    targetLanguage,
    audienceGenderPct,
    audienceAgePct,
    mustMention,
    cta,
    hashtags,
    brandKeywords,
    brandTone,
    dos,
    donts,
    campaignBanner, // legacy URL
    brandLogo, // legacy URL
    sampleCreative, // legacy URL
    audioInstructionUri,
    campaignBannerUri,
    brandLogoUri,
    sampleCreativeUri,
    referenceLinks,
    startDate,
    endDate,
    applicationDeadline,
    contentUsageRights,
    whitelistingPermission,
    paidAdsPermission,
    exclusivityMonths,
    ndaRequired,
    contractRequired,
    autoApprove,
    revisionCount,
    couponCode,
    trackingLink,
    affiliateCommType,
    affiliateCommValue,
    appQuestions,
    resetStore,
  } = useCampaignWizardStore();

  // ==========================================
  // Calculations
  // ==========================================
  const cost = parseInt(costPerCreator) || 0;
  const creators = parseInt(numCreators) || 0;
  const totalBudget = cost * creators;

  const { brandProfiles, activeBrandProfileId } = useProfilesStore();

  useEffect(() => {
    if (isOpen) {
      resetStore();
      
      // Select the active brand profile by default when opening the wizard
      const { brandProfiles, activeBrandProfileId } = useProfilesStore.getState();
      const activeProfile = brandProfiles.find((p) => p.id === activeBrandProfileId) || brandProfiles[0];
      if (activeProfile) {
        useCampaignWizardStore.getState().updateState({
          brandName: activeProfile.companyName,
          selectedBrandProfileId: activeProfile.id,
        });
      }
    }
  }, [isOpen, resetStore]);

  // Scroll to top when step changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [createStep]);

  const handleLaunchCampaign = async () => {
    if (!campName.trim() || !brandName.trim() || !campDescription.trim()) {
      showModal({ title: 'Validation Error', message: 'Name, Brand, and Description are required.' });
      return;
    }
    if (paymentType !== 'Barter' && totalBudget <= 0) {
      showModal({ title: 'Validation Error', message: 'Total budget must be greater than 0.' });
      return;
    }

    try {
      onClose();
      showModal({
        title: 'Launching Campaign...',
        message: 'Submitting campaign parameters to backend API...',
      });

      // Format deliverables description
      const selectedDeliverables: string[] = [];
      if (reelCount > 0) selectedDeliverables.push(`${reelCount} Reel(s)`);
      if (storyCount > 0) selectedDeliverables.push(`${storyCount} Story(ies)`);
      if (postCount > 0) selectedDeliverables.push(`${postCount} Post(s)`);
      if (carouselCount > 0) selectedDeliverables.push(`${carouselCount} Carousel(s)`);
      if (ytShortCount > 0) selectedDeliverables.push(`${ytShortCount} YouTube Short(s)`);
      if (ytVideoCount > 0) selectedDeliverables.push(`${ytVideoCount} YouTube Video(s)`);
      if (liveCount > 0) selectedDeliverables.push(`${liveCount} Live Session(s)`);

      const deliverablesDesc = selectedDeliverables.join(', ') || 'General Deliverables';

      // Fix: check K/M suffix BEFORE stripping non-numeric chars
      const followerStr = minFollowers.trim();
      const followerMultiplier = followerStr.toUpperCase().includes('M')
        ? 1_000_000
        : followerStr.toUpperCase().includes('K')
          ? 1_000
          : 1;
      const followerNumber =
        (parseInt(followerStr.replace(/[^0-9]/g, ''), 10) || 1) * followerMultiplier;

      // Fix: use global regex so ALL spaces/slashes are replaced, not just the first
      const objectiveSlug = campObjective
        .toLowerCase()
        .replace(/[\/\s]+/g, '_');

      const briefDetailsObj = {
        brandName,
        objective: objectiveSlug,
        priority: campPriority.toLowerCase(),
        location: campLocationValue || campLocationType,
        gender: targetGender.toLowerCase(),
        ageRange: targetAgeRange,
        creatorSize,
        paymentType: paymentType.toLowerCase(),
        minFollowers: followerNumber,
        tags: [campNiche.toLowerCase()],
        targetLocationType: campLocationType,
        targetLocationValue: campLocationValue,
        minEngagementRate: parseFloat(minEngagementRate) || 0,
        languages: [targetLanguage],
        targetAudienceGenderPct: audienceGenderPct,
        targetAudienceAgePct: audienceAgePct,
        platforms: selectedPlatforms.map((p) => ({
          name: p.toLowerCase(),
          minFollowers: followerNumber,
          minEngagement: parseFloat(minEngagementRate) || 0,
        })),
        deliverables: [
          { type: 'reel', quantity: reelCount },
          { type: 'story', quantity: storyCount },
          { type: 'post', quantity: postCount },
          { type: 'carousel', quantity: carouselCount },
          { type: 'youtube_short', quantity: ytShortCount },
          { type: 'youtube_video', quantity: ytVideoCount },
          { type: 'live', quantity: liveCount },
        ].filter((d) => d.quantity > 0),
        paymentMethod,
        paymentTimeline,
        costPerCreator: parseInt(costPerCreator) || 0,
        numCreators: parseInt(numCreators) || 0,
        productInfo:
          paymentType !== 'Paid'
            ? {
              name: prodName,
              value: parseInt(prodValue) || 0,
              description: prodDescription,
              sku: prodSku,
              url: prodUrl,
              shippingDetails: prodShipping,
            }
            : null,
        guidelines: {
          mustMention: mustMention
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          cta,
          hashtags: hashtags
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          brandKeywords: brandKeywords
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          brandTone,
        },
        dos,
        donts,
        timeline: {
          startDate,
          endDate,
          applicationDeadline,
        },
        mediaUploads: {
          bannerUrl: campaignBannerUri || campaignBanner,
          brandLogoUrl: brandLogoUri || brandLogo,
          sampleCreativeUrls: (sampleCreativeUri || sampleCreative) ? [sampleCreativeUri || sampleCreative] : [],
          referenceLinks: referenceLinks ? [referenceLinks] : [],
          audioInstructionUrl: audioInstructionUri || null,
        },
        legalRights: {
          contentUsageRights,
          whitelistingPermission,
          paidAdsPermission,
          exclusivityDurationMonths: parseInt(exclusivityMonths) || 0,
          ndaRequired,
          contractRequired,
        },
        approvalWorkflow: {
          autoApprove,
          manualReview: !autoApprove,
          revisionCount: parseInt(revisionCount) || 2,
          finalApprovalRequired: true,
        },
        advancedFeatures: {
          couponCode,
          trackingLink,
          affiliateCommissionType: affiliateCommType.toLowerCase(),
          affiliateCommissionValue: parseFloat(affiliateCommValue) || 0,
          creatorApplicationQuestions: appQuestions,
        },
      };

      // Determine if we need to send FormData (if there are local files)
      const hasFiles = audioInstructionUri || campaignBannerUri || brandLogoUri || sampleCreativeUri;
      
      let finalPayload: any;

      if (hasFiles) {
        const formData = new FormData();
        formData.append('title', campName);
        formData.append('description', campDescription || `Campaign for ${campName} requesting deliverables: ${deliverablesDesc}.`);
        formData.append('budget', paymentType === 'Barter' ? '0' : (totalBudget * 100).toString());
        formData.append('campaignType', selectedPlatforms.length > 0 ? selectedPlatforms[0].toLowerCase() : 'post');
        formData.append('targetAudience', `${targetGender}, ${targetAgeRange}, ${creatorSize}`);
        formData.append('requirements', `1. Content format: ${deliverablesDesc}\n2. Social platforms: ${selectedPlatforms.join(', ')}\n3. Timeline: ${startDate} to ${endDate}`);
        formData.append('expectedReach', '250000');
        formData.append('allowFraction', 'false');
        formData.append('isArena', 'false');
        formData.append('category', campNiche);
        formData.append('briefDetails', JSON.stringify(briefDetailsObj));

        const appendFile = (key: string, uri: string | null, defaultType: string) => {
          if (!uri) return;
          if (uri.startsWith('http')) return; // skip already uploaded URLs
          const filename = uri.split('/').pop() || 'file';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `${defaultType.split('/')[0]}/${match[1]}` : defaultType;
          
          formData.append(key, {
            uri,
            name: filename,
            type,
          } as any);
        };

        appendFile('audioInstruction', audioInstructionUri, 'audio/m4a');
        appendFile('campaignBanner', campaignBannerUri, 'image/jpeg');
        appendFile('brandLogo', brandLogoUri, 'image/jpeg');
        appendFile('sampleCreative', sampleCreativeUri, 'image/jpeg');
        
        finalPayload = formData;
      } else {
        finalPayload = {
          title: campName,
          description: campDescription || `Campaign for ${campName} requesting deliverables: ${deliverablesDesc}.`,
          budget: paymentType === 'Barter' ? 0 : totalBudget * 100, // API expects cents
          campaignType: selectedPlatforms.length > 0 ? selectedPlatforms[0].toLowerCase() : 'post',
          targetAudience: `${targetGender}, ${targetAgeRange}, ${creatorSize}`,
          requirements: `1. Content format: ${deliverablesDesc}\n2. Social platforms: ${selectedPlatforms.join(', ')}\n3. Timeline: ${startDate} to ${endDate}`,
          expectedReach: 250000,
          allowFraction: false,
          isArena: false,
          category: campNiche,
          briefDetails: JSON.stringify(briefDetailsObj),
        };
      }

      await api.campaigns.create(finalPayload, selectedBrandProfileId);

      showModal({
        title: 'Campaign Launched! 🚀',
        message: `Your campaign "${campName}" is now active on RichyReach.`,
      });

      onSuccess();
    } catch (err: any) {
      console.error('Failed to launch campaign:', err);
      showModal({
        title: 'Campaign Creation Failed',
        message: err.message || 'An error occurred while launching your campaign.',
      });
    }
  };

  const stepTitles = [
    'Step 1: Campaign Basics',
    'Step 2: Deliverables & Budget',
    'Step 3: Creator Targeting',
    "Step 4: Guidelines & Tone",
    'Step 5: Media & Timeline Review',
  ];

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.root, { paddingTop: insets.top || 16 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrap}>
                <HugeiconsIcon icon={Briefcase01Icon} size={18} color="#fff" strokeWidth={2} />
              </View>
              <Text style={styles.headerTitle}>Create Campaign Brief</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <HugeiconsIcon icon={Cancel01Icon} size={18} color={Colors.oxblood} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Step indicator */}
          <View style={styles.indicatorContainer}>
            {([1, 2, 3, 4, 5] as const).map((step) => {
              const active = createStep === step;
              const completed = createStep > step;
              return (
                <React.Fragment key={step}>
                  <View style={[styles.stepDot, active && styles.stepDotActive, completed && styles.stepDotCompleted]}>
                    {completed ? (
                      <HugeiconsIcon icon={CheckIcon} size={10} color="#ffffff" strokeWidth={2.5} />
                    ) : (
                      <Text style={[styles.stepDotText, active && styles.stepDotTextActive]}>{step}</Text>
                    )}
                  </View>
                  {step < 5 && (
                    <View style={[styles.stepLine, completed && styles.stepLineCompleted]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          <Text style={styles.stepTitle}>{stepTitles[createStep - 1]}</Text>

          {/* Scrollable step content */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.flex}
            contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 32 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {createStep === 1 && <StepBasics />}
            {createStep === 2 && <StepDeliverables />}
            {createStep === 3 && <StepTargeting />}
            {createStep === 4 && <StepGuidelines />}
            {createStep === 5 && <StepMediaReview onPublish={handleLaunchCampaign} />}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.08)',
    backgroundColor: Colors.creamLite,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 99,
    backgroundColor: 'rgba(63,3,11,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 4,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(63,3,11,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  stepDotActive: {
    borderColor: Colors.oxblood,
    backgroundColor: Colors.creamLite,
  },
  stepDotCompleted: {
    borderColor: Colors.green,
    backgroundColor: Colors.green,
  },
  stepDotText: {
    fontFamily: FontFamily.sans,
    fontSize: 10,
    color: 'rgba(63,3,11,0.4)',
  },
  stepDotTextActive: {
    color: Colors.oxblood,
    fontWeight: '700',
  },
  stepLine: {
    height: 2,
    flex: 1,
    maxWidth: 40,
    backgroundColor: 'rgba(63,3,11,0.1)',
  },
  stepLineCompleted: {
    backgroundColor: Colors.green,
  },
  stepTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 19,
    color: Colors.oxblood,
    marginBottom: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
