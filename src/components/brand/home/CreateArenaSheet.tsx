import React, { useEffect, useRef, useState } from 'react';
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
import { FormProvider, useForm } from 'react-hook-form';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Cancel01Icon, CheckIcon, CrownIcon } from '@hugeicons/core-free-icons';

import { Colors, FontFamily } from '@/constants/brand';
import { api } from '@/lib/api';
import { useProfilesStore } from '@/store/profiles';
import { useUIStore } from '@/store/ui';

import { ArenaStepType } from '../arena/ArenaStepType';
import { ArenaStepBasics } from '../arena/ArenaStepBasics';
import { ArenaStepGoogleReview } from '../arena/ArenaStepGoogleReview';
import { ArenaStepReview } from '../arena/ArenaStepReview';
import { TactileButton } from '@/components/ui/tactile-button';

interface CreateArenaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TOTAL_STEPS = 4;

const REEL_DEFAULTS = {
  reviewGuidelines:
    'Create an authentic Instagram Reel showcasing our brand. Invite @richyreach_official and our brand\'s Instagram as collaborators. Include our brand hashtag in the caption. Minimum 30 seconds. Reel must be public.',
  verificationRules:
    'Collaboration reel link must be submitted. Both @richyreach_official and brand Instagram must appear as collaborators. Brand hashtag must be in the caption. Reel must be public.',
};

const GOOGLE_DEFAULTS = {
  reviewGuidelines:
    'Visit our business and leave an honest 5 star Google Review. Mention the service quality, ambience, and staff experience. Review must be posted from your real Google account.',
  verificationRules:
    'Review must be posted on a real Google account. Minimum 50 words. Google review link must be submitted. Review must remain public and verifiable.',
};

const stepTitles = [
  'Step 1: Arena Type',
  'Step 2: Basic Details',
  'Step 3: Guidelines',
  'Step 4: Review & Launch',
];

export function CreateArenaSheet({ isOpen, onClose, onSuccess }: CreateArenaSheetProps) {
  'use no memo';

  const insets = useSafeAreaInsets();
  const showModal = useUIStore((s) => s.showModal);
  const { activeBrandProfileId, brandProfiles } = useProfilesStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get today + 30 days as default dates
  const today = new Date();
  const future = new Date(today);
  future.setDate(future.getDate() + 30);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      arenaType: 'google_review',
      title: '',
      description: '',
      category: 'General',
      maxParticipants: 100,
      startDate: fmt(today),
      endDate: fmt(future),
      totalBudgetCoins: 500000,
      entryFeeCoins: 0,
      rewardPerReview: 2500,
      businessName: '',
      googleMapsLink: '',
      reviewGuidelines: GOOGLE_DEFAULTS.reviewGuidelines,
      verificationRules: GOOGLE_DEFAULTS.verificationRules,
      bannerUrl: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      methods.reset({
        arenaType: 'google_review',
        title: '',
        description: '',
        category: 'General',
        maxParticipants: 100,
        startDate: fmt(today),
        endDate: fmt(future),
        totalBudgetCoins: 500000,
        entryFeeCoins: 0,
        rewardPerReview: 2500,
        businessName: '',
        googleMapsLink: '',
        reviewGuidelines: GOOGLE_DEFAULTS.reviewGuidelines,
        verificationRules: GOOGLE_DEFAULTS.verificationRules,
        bannerUrl: '',
      });
    }
  }, [isOpen]);

  // When arena type changes, update entry fee and pre-fill type-appropriate defaults
  // When arena type or maxParticipants changes, update entry fee, default budget, guidelines, etc.
  useEffect(() => {
    const sub = methods.watch((value, { name }) => {
      if (name === 'arenaType' || name === 'maxParticipants') {
        const type = value.arenaType;
        const maxP = value.maxParticipants || 100;
        if (type === 'google_review') {
          methods.setValue('entryFeeCoins', 0, { shouldDirty: false });
          methods.setValue('rewardPerReview', 2500, { shouldDirty: false });
          methods.setValue('totalBudgetCoins', maxP * 5000, { shouldDirty: false });
        }
      }
      if (name === 'arenaType') {
        const type = value.arenaType;
        const defaults = type === 'google_review' ? GOOGLE_DEFAULTS : REEL_DEFAULTS;
        methods.setValue('reviewGuidelines', defaults.reviewGuidelines, { shouldDirty: false });
        methods.setValue('verificationRules', defaults.verificationRules, { shouldDirty: false });
      }
    });
    return () => sub.unsubscribe();
  }, [methods]);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentStep]);

  const STEP_FIELDS: Record<number, string[]> = {
    1: ['arenaType'],
    2: ['title', 'description', 'startDate', 'endDate', 'bannerUrl'],
    3: [],
  };

  const nextStep = async () => {
    let fields: string[] = STEP_FIELDS[currentStep] || [];
    if (currentStep === 3) {
      const type = methods.getValues('arenaType');
      fields = type === 'google_review'
        ? ['businessName', 'googleMapsLink', 'reviewGuidelines', 'verificationRules']
        : ['reviewGuidelines', 'verificationRules'];
    }
    const isValid = await methods.trigger(fields as any);
    if (!isValid) return;
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => (s + 1) as any);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as any);
    }
  };

  const handleStepClick = async (step: number) => {
    if (step === currentStep) return;
    if (step < currentStep) {
      setCurrentStep(step as any);
    } else {
      // Validate intermediate steps before jumping forward
      let valid = true;
      for (let s = currentStep; s < step; s++) {
        let fields: string[] = STEP_FIELDS[s] || [];
        if (s === 3) {
          const type = methods.getValues('arenaType');
          fields = type === 'google_review'
            ? ['businessName', 'googleMapsLink', 'reviewGuidelines', 'verificationRules']
            : ['reviewGuidelines', 'verificationRules'];
        }
        const isStepValid = await methods.trigger(fields as any);
        if (!isStepValid) {
          valid = false;
          setCurrentStep(s as any);
          break;
        }
      }
      if (valid) {
        setCurrentStep(step as any);
      }
    }
  };

  const handleLaunch = async (data: any) => {
    const activeProfile = brandProfiles.find((p) => p.id === activeBrandProfileId) || brandProfiles[0];
    if (!activeProfile) {
      showModal({ title: 'Error', message: 'No brand profile found. Please create one first.' });
      return;
    }

    setIsSubmitting(true);
    try {
      onClose();
      showModal({ title: 'Launching Arena...', message: 'Creating your arena and funding the prize pool...' });

      // Helper function to upload files to R2 bucket
      const uploadFileToR2 = async (uri: string, prefix: string) => {
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
          return uri;
        }
        const formData = new FormData();

        let extension = 'jpg';
        const cleanUri = uri.split('?')[0].split('#')[0];
        const lastSegment = cleanUri.split('/').pop() || '';
        const dotParts = lastSegment.split('.');
        if (dotParts.length > 1) {
          const possibleExt = dotParts.pop()?.toLowerCase();
          if (possibleExt && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(possibleExt)) {
            extension = possibleExt;
          }
        }

        const filename = `${prefix}.${extension}`;

        if (Platform.OS === 'web' || uri.startsWith('blob:') || uri.startsWith('data:')) {
          const response = await fetch(uri);
          const blob = await response.blob();
          formData.append('file', blob, filename);
        } else {
          let formattedUri = uri;
          if (!formattedUri.startsWith('file://') && !formattedUri.startsWith('content://')) {
            formattedUri = `file://${formattedUri}`;
          }
          formData.append('file', {
            uri: formattedUri,
            name: filename,
            type: `image/${extension}`,
          } as any);
        }

        const uploadRes = await api.media.upload(formData, activeProfile.id);
        return uploadRes.url;
      };

      let finalBannerUrl = '';
      if (data.bannerUrl) {
        try {
          finalBannerUrl = await uploadFileToR2(data.bannerUrl, 'arena_banner');
        } catch (bannerErr) {
          console.error('Failed to upload arena banner:', bannerErr);
        }
      }

      const payload = {
        title: data.title,
        description: data.description,
        arenaType: data.arenaType,
        entryFeeCoins: data.entryFeeCoins,
        totalBudgetCoins: data.totalBudgetCoins,
        rewardPerReview: data.rewardPerReview,
        maxParticipants: data.maxParticipants,
        startDate: data.startDate,
        endDate: data.endDate,
        reviewGuidelines: data.reviewGuidelines || null,
        verificationRules: data.verificationRules || null,
        businessName: data.businessName || null,
        googleMapsLink: data.googleMapsLink || null,
        category: data.category,
        bannerUrl: finalBannerUrl || null,
      };

      await api.arena.create(payload, activeProfile.id);

      showModal({
        title: '🏟️ Arena Launched!',
        message: `"${data.title}" is now live. ${data.totalBudgetCoins.toLocaleString()} coins deducted from your wallet.`,
      });

      onSuccess();
    } catch (err: any) {
      showModal({
        title: 'Arena Creation Failed',
        message: err.message || 'An error occurred. Please check your coin balance and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = currentStep === TOTAL_STEPS;
  const isFirstStep = currentStep === 1;

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
                <HugeiconsIcon icon={CrownIcon} size={18} color="#fff" strokeWidth={2} />
              </View>
              <Text style={styles.headerTitle}>Create Arena</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <HugeiconsIcon icon={Cancel01Icon} size={18} color={Colors.oxblood} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Step Indicator */}
          <View style={styles.indicatorContainer}>
            {([1, 2, 3, 4] as const).map((step) => {
              const active = currentStep === step;
              const completed = currentStep > step;
              return (
                <React.Fragment key={step}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleStepClick(step)}
                    style={[styles.stepDot, active && styles.stepDotActive, completed && styles.stepDotCompleted]}
                  >
                    {completed ? (
                      <HugeiconsIcon icon={CheckIcon} size={10} color="#fff" strokeWidth={2.5} />
                    ) : (
                      <Text style={[styles.stepDotText, active && styles.stepDotTextActive]}>{step}</Text>
                    )}
                  </TouchableOpacity>
                  {step < 4 && (
                    <View style={[styles.stepLine, completed && styles.stepLineCompleted]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          <Text style={styles.stepTitle}>{stepTitles[currentStep - 1]}</Text>

          {/* Scrollable Step Content */}
          <FormProvider {...methods}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.flex}
              contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {currentStep === 1 && <ArenaStepType />}
              {currentStep === 2 && <ArenaStepBasics />}
              {currentStep === 3 && <ArenaStepGoogleReview />}
              {currentStep === 4 && (
                <ArenaStepReview
                  onPublish={methods.handleSubmit(handleLaunch)}
                  isLoading={isSubmitting}
                />
              )}

              {/* Navigation Buttons (hidden on last step — handled by ArenaStepReview) */}
              {!isLastStep && (
                <View style={styles.navRow}>
                  {!isFirstStep && (
                    <TactileButton
                      onPress={prevStep}
                      text="Back"
                      variant="secondary"
                      icon="arrowLeft"
                      iconPosition="left"
                    />
                  )}
                  <TactileButton
                    onPress={nextStep}
                    text={currentStep === TOTAL_STEPS - 1 ? 'Review' : 'Continue'}
                    variant="primary"
                    icon="arrow"
                    iconPosition="right"
                    fullWidth
                    style={{ flex: 1 }}
                  />
                </View>
              )}

              {/* Back button on last step */}
              {isLastStep && (
                <TactileButton
                  onPress={prevStep}
                  text="Edit Details"
                  variant="secondary"
                  icon="arrowLeft"
                  iconPosition="left"
                  style={{ marginTop: 12, alignSelf: 'center' }}
                />
              )}
            </ScrollView>
          </FormProvider>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.oxblood,
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
    backgroundColor: '#fff',
  },
  stepDotActive: { borderColor: Colors.oxblood, backgroundColor: Colors.creamLite },
  stepDotCompleted: { borderColor: Colors.green, backgroundColor: Colors.green },
  stepDotText: { fontFamily: FontFamily.sans, fontSize: 10, color: 'rgba(63,3,11,0.4)' },
  stepDotTextActive: { color: Colors.oxblood, fontWeight: '700' },
  stepLine: { height: 2, flex: 1, maxWidth: 40, backgroundColor: 'rgba(63,3,11,0.1)' },
  stepLineCompleted: { backgroundColor: Colors.green },
  stepTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    color: Colors.oxblood,
    marginBottom: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 0,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(63,3,11,0.15)',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  nextBtn: {
    flex: 1,
    backgroundColor: Colors.oxblood,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
