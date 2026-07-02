import { Colors, FontFamily } from '@/constants/brand';
import { api } from '@/lib/api';
import { useCampaignWizardStore } from '@/store/campaignWizard';
import { useProfilesStore } from '@/store/profiles';
import { useUIStore } from '@/store/ui';
import React, { useEffect, useRef, useState } from 'react';
import LottieView from 'lottie-react-native';
import {
  ActivityIndicator,
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
import { FormProvider, useForm } from 'react-hook-form';
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
  campaign?: any;
}

export function CreateCampaignSheet({ isOpen, onClose, onSuccess, campaign }: CreateCampaignSheetProps) {
  "use no memo";
  const insets = useSafeAreaInsets();
  const showModal = useUIStore((s) => s.showModal);
  const scrollViewRef = useRef<ScrollView>(null);
  const { brandProfiles, activeBrandProfileId } = useProfilesStore();

  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const {
    createStep,
    resetStore,
    updateField,
  } = useCampaignWizardStore();

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      campName: '',
      brandName: '',
      selectedBrandProfileId: '',
      campObjective: 'Brand Awareness',
      campDescription: '',
      campLocationType: 'Pan India',
      campLocationValue: '',
      campNiche: 'Fashion',
      campPriority: 'Normal',
      reelCount: 0,
      storyCount: 0,
      paymentType: 'Paid',
      costPerCreator: '5000',
      campaignBudget: '5000',
      numCreators: '5',
      prodName: '',
      prodValue: '',
      prodDescription: '',
      prodSku: '',
      prodUrl: '',
      prodShipping: '',
      creatorSize: 'Any',
      targetGender: 'Any',
      targetAgeRange: 'Any',
      customAgeRange: '',
      targetLanguage: 'English',
      mustMention: '',
      hashtags: '#RichyReach',
      brandTone: 'Fun',
      campaignBannerUri: null,
      referenceLinks: '',
      startDate: '2026-07-01',
      endDate: '2026-07-30',
      applicationDeadline: '2026-06-25',
    }
  });

  useEffect(() => {
    if (isOpen) {
      resetStore();

      const activeProfile = brandProfiles.find((p) => p.id === activeBrandProfileId) || brandProfiles[0];

      let briefDetails: any = {};
      if (campaign && campaign.briefDetails) {
        try {
          briefDetails = typeof campaign.briefDetails === 'string' ? JSON.parse(campaign.briefDetails) : campaign.briefDetails;
        } catch (e) {
          console.error('Failed to parse briefDetails:', e);
        }
      }

      if (briefDetails?.mediaUploads?.audioInstructionUrl) {
        useCampaignWizardStore.getState().updateField('audioInstructionUri', briefDetails.mediaUploads.audioInstructionUrl);
      }

      const standardAges = ['Any', '13-17', '18-24', '25-34', '35-44', '45+'];
      const rawAge = briefDetails?.ageRange || 'Any';
      const ageRangeVal = standardAges.includes(rawAge) ? rawAge : 'Custom';
      const customAgeRangeVal = ageRangeVal === 'Custom' ? rawAge : '';

      const objectiveMap: Record<string, string> = {
        brand_awareness: 'Brand Awareness',
        lead_generation: 'Lead Generation',
        sales_conversion: 'Sales Conversion',
        product_launch: 'Product Launch'
      };

      methods.reset({
        campName: campaign?.title || '',
        brandName: briefDetails?.brandName || activeProfile?.companyName || '',
        selectedBrandProfileId: campaign?.brandProfileId || activeProfile?.id || '',
        campObjective: objectiveMap[briefDetails?.objective] || 'Brand Awareness',
        campDescription: campaign?.description || '',
        campLocationType: briefDetails?.targetLocationType || 'Pan India',
        campLocationValue: briefDetails?.targetLocationValue || '',
        campNiche: campaign?.category || 'Fashion',
        campPriority: briefDetails?.priority ? (briefDetails.priority.charAt(0).toUpperCase() + briefDetails.priority.slice(1)) : 'Normal',
        reelCount: briefDetails?.reelCount || 0,
        storyCount: briefDetails?.storyCount || 0,
        paymentType: briefDetails?.paymentType ? (briefDetails.paymentType.charAt(0).toUpperCase() + briefDetails.paymentType.slice(1)) : 'Paid',
        costPerCreator: briefDetails?.costPerCreator ? String(briefDetails.costPerCreator) : '5000',
        campaignBudget: campaign?.budget ? String(campaign.budget / 100) : '5000',
        numCreators: briefDetails?.numCreators ? String(briefDetails.numCreators) : '5',
        prodName: briefDetails?.productInfo?.name || '',
        prodValue: briefDetails?.productInfo?.value ? String(briefDetails.productInfo.value) : '',
        prodDescription: briefDetails?.productInfo?.description || '',
        prodSku: briefDetails?.productInfo?.sku || '',
        prodUrl: briefDetails?.productInfo?.url || '',
        prodShipping: briefDetails?.productInfo?.shippingDetails || '',
        creatorSize: briefDetails?.creatorSize || 'Any',
        targetGender: briefDetails?.gender ? (briefDetails.gender.charAt(0).toUpperCase() + briefDetails.gender.slice(1)) : 'Any',
        targetAgeRange: ageRangeVal,
        customAgeRange: customAgeRangeVal,
        targetLanguage: briefDetails?.languages?.[0] || 'Hinglish',
        mustMention: briefDetails?.guidelines?.mustMention?.join(', ') || '',
        hashtags: briefDetails?.guidelines?.hashtags?.join(', ') || '#RichyReach',
        brandTone: briefDetails?.guidelines?.brandTone || 'Fun',
        campaignBannerUri: briefDetails?.mediaUploads?.bannerUrl || null,
        referenceLinks: briefDetails?.mediaUploads?.referenceLinks?.[0] || '',
        startDate: briefDetails?.timeline?.startDate || '2026-07-01',
        endDate: briefDetails?.timeline?.endDate || '2026-07-30',
        applicationDeadline: briefDetails?.timeline?.applicationDeadline || '2026-06-25',
      });
    }
  }, [isOpen, resetStore, brandProfiles, activeBrandProfileId, methods, campaign]);

  // Scroll to top when step changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [createStep]);

  // Helper function to upload files to R2 bucket
  const uploadFileToR2 = async (uri: string, prefix: string, selectedBrandProfileId: string) => {
    const formData = new FormData();

    // Resolve extension safely to avoid using full URLs/blobs as file extensions
    let extension = prefix === 'audio' ? 'm4a' : 'jpg';
    const cleanUri = uri.split('?')[0].split('#')[0];
    const lastSegment = cleanUri.split('/').pop() || '';
    const dotParts = lastSegment.split('.');
    if (dotParts.length > 1) {
      const possibleExt = dotParts.pop()?.toLowerCase();
      if (possibleExt && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'm4a', 'mp3', 'wav', 'webm'].includes(possibleExt)) {
        extension = possibleExt;
      }
    }

    const filename = `${prefix}.${extension}`;

    if (Platform.OS === 'web' || uri.startsWith('blob:') || uri.startsWith('data:')) {
      // Web/Browser flow: fetch the blob and append it
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('file', blob, filename);
    } else {
      // Native App flow (iOS/Android): append React Native File object
      let formattedUri = uri;
      if (!formattedUri.startsWith('file://') && !formattedUri.startsWith('content://')) {
        formattedUri = `file://${formattedUri}`;
      }
      formData.append('file', {
        uri: formattedUri,
        name: filename,
        type: prefix === 'audio' ? `audio/${extension}` : `image/${extension}`,
      } as any);
    }

    const uploadRes = await api.media.upload(formData, selectedBrandProfileId);
    return uploadRes.url;
  };

  const handleClose = async (showSuccess = false) => {
    const data = methods.getValues();
    if (data.campName && data.campName.trim().length >= 2) {
      const parsedBudget = parseInt(data.campaignBudget) || 0;
      const parsedCreators = parseInt(data.numCreators) || 1;

      try {
        setIsLaunching(true);

        let audioUrl = null;
        const audioUri = useCampaignWizardStore.getState().audioInstructionUri;
        if (audioUri && !audioUri.startsWith('http')) {
          try {
            audioUrl = await uploadFileToR2(audioUri, 'audio', data.selectedBrandProfileId);
          } catch (e) {
            console.error('Audio upload failed for draft:', e);
          }
        } else if (audioUri) {
          audioUrl = audioUri;
        }

        let bannerUrl = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1080&auto=format&fit=crop';
        const bannerUri = data.campaignBannerUri as string | null;
        if (bannerUri && !bannerUri.startsWith('http')) {
          try {
            bannerUrl = await uploadFileToR2(bannerUri, 'banner', data.selectedBrandProfileId);
          } catch (bannerErr) {
            console.error('Failed to upload campaign banner for draft:', bannerErr);
          }
        } else if (bannerUri) {
          bannerUrl = bannerUri;
        }

        const briefDetailsObj = {
          brandName: data.brandName,
          objective: data.campObjective ? data.campObjective.toLowerCase().replace(/[\/\s]+/g, '_') : 'brand_awareness',
          priority: data.campPriority ? data.campPriority.toLowerCase() : 'normal',
          location: data.campLocationValue || data.campLocationType,
          gender: data.targetGender ? data.targetGender.toLowerCase() : 'any',
          ageRange: data.targetAgeRange === 'Custom' ? data.customAgeRange : data.targetAgeRange,
          creatorSize: data.creatorSize,
          paymentType: data.paymentType ? data.paymentType.toLowerCase() : 'paid',
          minFollowers: 1000,
          tags: data.campNiche ? [data.campNiche.toLowerCase()] : [],
          targetLocationType: data.campLocationType,
          targetLocationValue: data.campLocationValue,
          minEngagementRate: 0,
          languages: [data.targetLanguage],
          platforms: ['instagram'],
          deliverables: [],
          costPerCreator: data.paymentType === 'Barter' ? 0 : Math.floor(Math.floor(parsedBudget * 0.9) / parsedCreators),
          numCreators: data.paymentType === 'Barter' ? 0 : parsedCreators,
          productInfo:
            data.paymentType !== 'Paid'
              ? {
                name: data.prodName,
                value: parseInt(data.prodValue) || 0,
                description: data.prodDescription,
                sku: data.prodSku,
                url: data.prodUrl,
                shippingDetails: data.prodShipping,
              }
              : null,
          guidelines: {
            mustMention: data.mustMention ? data.mustMention.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            cta: 'Visit Website',
            hashtags: data.hashtags ? data.hashtags.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            brandKeywords: [],
            brandTone: data.brandTone,
          },
          timeline: {
            startDate: data.startDate,
            endDate: data.endDate,
            applicationDeadline: data.applicationDeadline,
          },
          mediaUploads: {
            bannerUrl,
            brandLogoUrl: '',
            sampleCreativeUrls: [],
            referenceLinks: data.referenceLinks ? [data.referenceLinks] : [],
            audioInstructionUrl: audioUrl,
          },
        };

        const finalPayload = {
          title: data.campName,
          description: data.campDescription || `Campaign draft for ${data.campName}.`,
          budget: data.paymentType === 'Barter' ? 0 : parsedBudget * 100, // cents
          campaignType: 'instagram',
          targetAudience: 'all, any, any',
          requirements: `1. Deliverables: General Deliverables`,
          expectedReach: 250000,
          allowFraction: false,
          isArena: false,
          category: data.campNiche,
          briefDetails: JSON.stringify(briefDetailsObj),
          status: 'draft',
        };

        if (campaign?.id) {
          await api.campaigns.update(campaign.id, finalPayload);
        } else {
          await api.campaigns.create(finalPayload, data.selectedBrandProfileId);
        }
        setIsLaunching(false);
        if (showSuccess) {
          setShowSuccessAnimation(true);
          return;
        }
        onSuccess();
        onClose();
      } catch (err: any) {
        console.error('Failed to auto-save campaign draft:', err);
        setIsLaunching(false);
        showModal({
          title: 'Draft Save Failed',
          message: err.message || 'An error occurred while saving your campaign as a draft.',
        });
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleLaunchCampaign = async (data: any) => {
    await handleClose(true);
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
      onRequestClose={() => handleClose(false)}
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
            <TouchableOpacity style={styles.closeBtn} onPress={() => handleClose(false)} activeOpacity={0.7}>
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
                  <TouchableOpacity
                    onPress={() => updateField('createStep', step)}
                    activeOpacity={0.7}
                    style={[styles.stepDot, active && styles.stepDotActive, completed && styles.stepDotCompleted]}
                  >
                    {completed ? (
                      <HugeiconsIcon icon={CheckIcon} size={10} color="#ffffff" strokeWidth={2.5} />
                    ) : (
                      <Text style={[styles.stepDotText, active && styles.stepDotTextActive]}>{step}</Text>
                    )}
                  </TouchableOpacity>
                  {step < 5 && (
                    <View style={[styles.stepLine, completed && styles.stepLineCompleted]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          <Text style={styles.stepTitle}>{stepTitles[createStep - 1]}</Text>

          {/* Scrollable step content */}
          <FormProvider {...methods}>
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
              {createStep === 5 && <StepMediaReview onPublish={methods.handleSubmit(handleLaunchCampaign)} />}
            </ScrollView>
          </FormProvider>
        </View>
      </KeyboardAvoidingView>

      {isLaunching && (
        <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
          <ActivityIndicator size="large" color={Colors.oxblood} />
          <Text style={styles.loadingText}>Saving Your Campaign...</Text>
          <Text style={styles.loadingSubtext}>Uploading media & saving draft...</Text>
        </View>
      )}

      {showSuccessAnimation && (
        <View style={[StyleSheet.absoluteFill, styles.successOverlay]}>
          <LottieView
            source={require('@/assets/lottie-animation/success.json')}
            autoPlay
            loop={false}
            style={styles.lottie}
            speed={0.7}
            onAnimationFinish={() => {
              setTimeout(() => {
                setShowSuccessAnimation(false);
                onClose();
                onSuccess();
              }, 800);
            }}
          />
          <Text style={styles.successText}>Campaign Draft Saved!</Text>
        </View>
      )}
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
  successOverlay: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  loadingOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  loadingText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.oxblood,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: 'rgba(63,3,11,0.6)',
    marginTop: 6,
    textAlign: 'center',
  },
  lottie: {
    width: 250,
    height: 250,
  },
  successText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.oxblood,
    marginTop: 20,
    textAlign: 'center',
  },
});
