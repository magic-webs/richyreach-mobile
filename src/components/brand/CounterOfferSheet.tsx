import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, FontFamily } from '@/constants/brand';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useUIStore } from '@/store/ui';

interface CounterOfferSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (counterAmount: number) => void;
  submitting: boolean;
  originalBidAmount: number; // in cents/paise
  campaignTitle: string;
  influencerName: string;
}

export function CounterOfferSheet({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  originalBidAmount,
  campaignTitle,
  influencerName,
}: CounterOfferSheetProps) {
  const showModal = useUIStore((s) => s.showModal);
  const [counterPrice, setCounterPrice] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Suggest slightly lower or standard counter-offer based on original bid
      setCounterPrice(String(Math.floor(originalBidAmount / 100)));
    }
  }, [isOpen, originalBidAmount]);

  const handleSubmit = () => {
    if (!counterPrice.trim() || isNaN(Number(counterPrice.trim())) || Number(counterPrice.trim()) <= 0) {
      showModal({
        title: 'Validation Error',
        message: 'Please enter a valid positive counter offer price.',
      });
      return;
    }

    onSubmit(Number(counterPrice.trim()));
  };

  if (!isOpen) return null;

  return (
    <BottomSheet
      visible={isOpen}
      title="Propose Counter Offer"
      icon="message"
      onClose={onClose}
      snapPoints={['55%', '85%']}
      hideHeaderBorder
    >
      <ScrollView contentContainerStyle={{ gap: 18, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.negotiationInfo}>
          <Text style={styles.campaignLabel}>INFLUENCER</Text>
          <Text style={styles.influencerName}>{influencerName}</Text>
          <Text style={styles.campaignTitle}>{campaignTitle}</Text>
          <View style={styles.bidsRow}>
            <Text style={styles.originalBid}>Original Bid: ₹{(originalBidAmount / 100).toLocaleString()}</Text>
          </View>
        </View>

        {/* COUNTER PRICE */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Counter Offer Price (₹) *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. 4500"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={counterPrice}
            onChangeText={setCounterPrice}
            keyboardType="numeric"
            editable={!submitting}
          />
          <Text style={styles.helperText}>Enter the new counter-offer amount you want to propose to the creator.</Text>
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
            <Text style={styles.submitBtnText}>Send Counter Offer ✉️</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  negotiationInfo: {
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
  influencerName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
  },
  campaignTitle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(63,3,11,0.7)',
  },
  bidsRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalBid: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.oxblood,
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
