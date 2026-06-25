import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  GiftIcon,
  ListViewIcon,
} from '@hugeicons/core-free-icons';

function CoinInput({ label, control, name, description, locked }: {
  label: string;
  control: any;
  name: string;
  description?: string;
  locked?: boolean;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {locked && (
          <View style={styles.lockedBadge}>
            <Text style={styles.lockedText}>Fixed</Text>
          </View>
        )}
      </View>
      {description && <Text style={styles.fieldDesc}>{description}</Text>}
      <Controller
        control={control}
        name={name}
        rules={{ required: 'Required', min: { value: 1, message: 'Must be greater than 0' } }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <View style={[styles.coinInputRow, locked && styles.coinInputRowLocked]}>
              <Text style={styles.coinSymbol}>🪙</Text>
              <TextInput
                style={styles.coinInput}
                value={String(value ?? '')}
                onChangeText={(v) => onChange(parseInt(v.replace(/[^0-9]/g, '')) || 0)}
                keyboardType="numeric"
                editable={!locked}
                placeholderTextColor="rgba(63,3,11,0.35)"
              />
              <Text style={styles.rupeeEquiv}>
                = ₹{((parseInt(String(value)) || 0) / 100).toLocaleString('en-IN')}
              </Text>
            </View>
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />
    </View>
  );
}

export function ArenaStepBudget() {
  const { control, watch } = useFormContext();
  const arenaType = watch('arenaType');
  const totalBudget = watch('totalBudgetCoins') || 0;
  const maxP = watch('maxParticipants') || 1;
  const entryFee = watch('entryFeeCoins') || 2000;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Budget & Coins</Text>
      <Text style={styles.subheading}>
        Set the total prize pool. Coins are deducted from your wallet immediately.
      </Text>

      {/* Total Budget */}
      <CoinInput
        label="Total Budget (Prize Pool)"
        control={control}
        name="totalBudgetCoins"
        description="Total coins allocated as prize money for winners."
      />

      {/* Entry Fee — free for Google Review, locked at 2000 for Reel Reach */}
      {arenaType === 'google_review' ? (
        <View style={styles.field}>
          <Text style={styles.label}>Entry Fee per Influencer</Text>
          <Text style={styles.fieldDesc}>Google Review arenas have no entry fee — influencers join for free.</Text>
          <View style={[styles.coinInputRow, styles.coinInputRowLocked]}>
            <HugeiconsIcon icon={GiftIcon} size={22} color="rgba(63,3,11,0.4)" strokeWidth={2} />
            <Text style={[styles.coinInput, { color: 'rgba(63,3,11,0.4)', fontSize: 16 }]}>Free · 0 coins</Text>
          </View>
        </View>
      ) : (
        <CoinInput
          label="Entry Fee per Influencer"
          control={control}
          name="entryFeeCoins"
          description="Fixed at 2,000 coins (₹20) per participant. Collected automatically on join."
          locked
        />
      )}

      {arenaType === 'google_review' && (
        <CoinInput
          label="Reward per Verified Review"
          control={control}
          name="rewardPerReview"
          description="Coins credited per successfully verified Google review."
        />
      )}

      {arenaType === 'google_review' && (
        <View style={styles.reviewNoteBox}>
          <View style={styles.reviewNoteTitleRow}>
            <HugeiconsIcon icon={ListViewIcon} size={14} color={Colors.green} strokeWidth={2} />
            <Text style={styles.reviewNoteTitle}>Google Review Payout Model</Text>
          </View>
          <Text style={styles.reviewNoteText}>
            Each influencer who submits a verified Google review receives{' '}
            <Text style={{ fontWeight: '800' }}>
              {(watch('rewardPerReview') || 2500).toLocaleString()} coins
            </Text>
            {' '}(₹{((watch('rewardPerReview') || 2500) / 100).toLocaleString('en-IN')}).
          </Text>
          <Text style={styles.reviewNoteText}>
            Rewards are paid from your funded budget. Budget must cover all potential rewards.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  heading: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  subheading: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13.5,
    color: 'rgba(63,3,11,0.55)',
    lineHeight: 20,
    marginTop: -8,
  },
  field: { gap: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  lockedBadge: {
    backgroundColor: 'rgba(63,3,11,0.08)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  lockedText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  fieldDesc: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
    color: 'rgba(63,3,11,0.45)',
    lineHeight: 17,
  },
  coinInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(63,3,11,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    ...Shadow.card,
  },
  coinInputRowLocked: {
    backgroundColor: 'rgba(63,3,11,0.03)',
    borderStyle: 'dashed',
  },
  coinSymbol: { fontSize: 20 },
  coinInput: {
    flex: 1,
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  rupeeEquiv: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: 'rgba(63,3,11,0.5)',
  },
  errorText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: Colors.rose,
  },
  previewCard: {
    borderRadius: Radius.lg,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
  },
  previewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  previewTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewRowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(63,3,11,0.08)',
    paddingTop: 10,
    marginTop: 4,
  },
  previewLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  previewLabelTxt: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.6)',
  },
  previewValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  reviewNoteBox: {
    backgroundColor: 'rgba(42,122,90,0.08)',
    borderRadius: Radius.md,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(42,122,90,0.25)',
  },
  reviewNoteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  reviewNoteTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.green,
  },
  reviewNoteText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(42,122,90,0.8)',
    lineHeight: 18,
  },
});
