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
import { ArenaStepBudget } from '../arena/ArenaStepBudget';
import { ArenaStepGoogleReview } from '../arena/ArenaStepGoogleReview';
import { ArenaStepReview } from '../arena/ArenaStepReview';
import { TactileButton } from '@/components/ui/tactile-button';

interface CreateArenaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TOTAL_STEPS = 5;

const stepTitles = [
  'Step 1: Arena Type',
  'Step 2: Basic Details',
  'Step 3: Budget & Coins',
  'Step 4: Guidelines',
  'Step 5: Review & Launch',
];

export function CreateArenaSheet({ isOpen, onClose, onSuccess }: CreateArenaSheetProps) {
  'use no memo';

  const insets = useSafeAreaInsets();
  const showModal = useUIStore((s) => s.showModal);
  const { activeBrandProfileId, brandProfiles } = useProfilesStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get today + 30 days as default dates
  const today = new Date();
  const future = new Date(today);
  future.setDate(future.getDate() + 30);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      arenaType: 'reel_reach',
      title: '',
      description: '',
      category: 'General',
      maxParticipants: 100,
      startDate: fmt(today),
      endDate: fmt(future),
      totalBudgetCoins: 200000,
      entryFeeCoins: 2000,
      rewardPerReview: 2500,
      businessName: '',
      googleMapsLink: '',
      reviewGuidelines: '',
      verificationRules: '',
      bannerUrl: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      methods.reset({
        arenaType: 'reel_reach',
        title: '',
        description: '',
        category: 'General',
        maxParticipants: 100,
        startDate: fmt(today),
        endDate: fmt(future),
        totalBudgetCoins: 200000,
        entryFeeCoins: 2000,
        rewardPerReview: 2500,
        businessName: '',
        googleMapsLink: '',
        reviewGuidelines: '',
        verificationRules: '',
        bannerUrl: '',
      });
    }
  }, [isOpen]);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => (s + 1) as any);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as any);
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
            {([1, 2, 3, 4, 5] as const).map((step) => {
              const active = currentStep === step;
              const completed = currentStep > step;
              return (
                <React.Fragment key={step}>
                  <View style={[styles.stepDot, active && styles.stepDotActive, completed && styles.stepDotCompleted]}>
                    {completed ? (
                      <HugeiconsIcon icon={CheckIcon} size={10} color="#fff" strokeWidth={2.5} />
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
              {currentStep === 3 && <ArenaStepBudget />}
              {currentStep === 4 && <ArenaStepGoogleReview />}
              {currentStep === 5 && (
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
