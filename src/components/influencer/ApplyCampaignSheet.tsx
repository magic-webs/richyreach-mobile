import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, FontFamily } from '@/constants/brand';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useUIStore } from '@/store/ui';

interface ApplyCampaignSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proposal: string, bidAmount: number) => void;
  submitting: boolean;
  campaignTitle: string;
  suggestedBudget: number; // in cents/paise
}

export function ApplyCampaignSheet({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  campaignTitle,
  suggestedBudget,
}: ApplyCampaignSheetProps) {
  const showModal = useUIStore((s) => s.showModal);
  const [proposal, setProposal] = useState('');
  const [bidPrice, setBidPrice] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProposal('Excited to collaborate on this campaign! I can deliver high-quality content that matches your brand tone.');
      setBidPrice(String(Math.floor(suggestedBudget / 100)));
    }
  }, [isOpen, suggestedBudget]);

  const handleSubmit = () => {
    if (!bidPrice.trim() || isNaN(Number(bidPrice.trim())) || Number(bidPrice.trim()) <= 0) {
      showModal({
        title: 'Validation Error',
        message: 'Please enter a valid positive bid price.',
      });
      return;
    }

    if (proposal.trim().length < 10) {
      showModal({
        title: 'Validation Error',
        message: 'Your proposal must be at least 10 characters long.',
      });
      return;
    }

    onSubmit(proposal.trim(), Number(bidPrice.trim()));
  };

  if (!isOpen) return null;

  return (
    <BottomSheet
      visible={isOpen}
      title="Apply to Campaign"
      icon="checkmark-circle"
      onClose={onClose}
      snapPoints={['65%', '90%']}
      hideHeaderBorder
    >
      <ScrollView contentContainerStyle={{ gap: 18, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.campaignInfo}>
          <Text style={styles.campaignLabel}>CAMPAIGN</Text>
          <Text style={styles.campaignTitle}>{campaignTitle}</Text>
          <Text style={styles.campaignBudget}>Suggested: ₹{(suggestedBudget / 100).toLocaleString()}</Text>
        </View>

        {/* BID PRICE */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Your Bid Price (₹) *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. 5000"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={bidPrice}
            onChangeText={setBidPrice}
            keyboardType="numeric"
            editable={!submitting}
          />
          <Text style={styles.helperText}>Enter the amount you would like to charge for the deliverables.</Text>
        </View>

        {/* PROPOSAL / PITCH */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Collaboration Proposal *</Text>
          <TextInput
            style={[styles.formInput, styles.textArea]}
            multiline
            numberOfLines={4}
            placeholder="Introduce yourself and describe why you'd be a great fit..."
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={proposal}
            onChangeText={setProposal}
            editable={!submitting}
          />
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Application ✨</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  campaignInfo: {
    backgroundColor: 'rgba(63,3,11,0.03)',
    borderRadius: 16,
    padding: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.05)',
  },
  campaignLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    color: Colors.rose,
    letterSpacing: 0.8,
  },
  campaignTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },
  campaignBudget: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: 'rgba(63,3,11,0.6)',
    marginTop: 2,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 10.5,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  formInput: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    fontSize: 14,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 10,
    color: 'rgba(63,3,11,0.45)',
    fontFamily: FontFamily.sansMedium,
    lineHeight: 14,
  },
  submitBtn: {
    backgroundColor: Colors.oxblood,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(63,3,11,0.5)',
  },
  submitBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    color: '#ffffff',
  },
});
