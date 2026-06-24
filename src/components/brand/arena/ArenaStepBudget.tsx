import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { LinearGradient } from 'expo-linear-gradient';

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

  const winnerPool = Math.floor(totalBudget * 0.5);
  const participantPool = totalBudget - winnerPool;
  const perParticipant = maxP > 1 ? Math.floor(participantPool / (maxP - 1)) : 0;
  const totalEntryRevenue = entryFee * maxP;

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

      {/* Entry Fee — always locked at 2000 */}
      <CoinInput
        label="Entry Fee per Influencer"
        control={control}
        name="entryFeeCoins"
        description="Fixed at 2,000 coins (₹20) per participant. Collected automatically on join."
        locked
      />

      {arenaType === 'google_review' && (
        <CoinInput
          label="Reward per Verified Review"
          control={control}
          name="rewardPerReview"
          description="Coins credited per successfully verified Google review."
        />
      )}

      {/* Distribution Preview */}
      {arenaType !== 'google_review' && totalBudget > 0 && (
        <LinearGradient
          colors={['rgba(63,3,11,0.06)', 'rgba(63,3,11,0.02)']}
          style={styles.previewCard}
        >
          <Text style={styles.previewTitle}>🏆 Reward Distribution Preview</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>🥇 Winner Prize (50%)</Text>
            <Text style={styles.previewValue}>
              {winnerPool.toLocaleString()} 🪙 = ₹{(winnerPool / 100).toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>👥 Participant Pool (50%)</Text>
            <Text style={styles.previewValue}>
              {participantPool.toLocaleString()} 🪙 = ₹{(participantPool / 100).toLocaleString('en-IN')}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: 'rgba(63,3,11,0.4)', marginTop: -4, marginBottom: 4 }}>
            * Distributed proportionally to all other participants based on their post/reel reach.
          </Text>
          <View style={[styles.previewRow, styles.previewRowBorder]}>
            <Text style={styles.previewLabel}>💰 Total Entry Revenue</Text>
            <Text style={[styles.previewValue, { color: Colors.green }]}>
              +{totalEntryRevenue.toLocaleString()} 🪙
            </Text>
          </View>
        </LinearGradient>
      )}

      {arenaType === 'google_review' && (
        <View style={styles.reviewNoteBox}>
          <Text style={styles.reviewNoteTitle}>📋 Google Review Payout Model</Text>
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
  previewTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.oxblood,
    marginBottom: 4,
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
  previewLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.6)',
    flex: 1,
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
  reviewNoteTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.green,
    marginBottom: 2,
  },
  reviewNoteText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(42,122,90,0.8)',
    lineHeight: 18,
  },
});
