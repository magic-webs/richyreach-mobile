import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  GiftIcon,
  ListViewIcon,
  Coins01Icon,
  CheckIcon,
  Cancel01Icon
} from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useProfilesStore } from '@/store/profiles';

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
  const { control, watch, setValue } = useFormContext();
  const arenaType = watch('arenaType');
  const maxP = watch('maxParticipants') || 1;

  const { activeBrandProfileId } = useProfilesStore();

  const { data: walletData } = useQuery({
    queryKey: ['walletBalance', activeBrandProfileId],
    queryFn: () => api.brands.wallet.balance(activeBrandProfileId),
    enabled: !!activeBrandProfileId,
  });

  const availableCoins = (walletData as any)?.balance?.coins || 0;
  const calculatedBudget = maxP * 5000;

  // Reactively sync budget fields for both arena types
  React.useEffect(() => {
    if (arenaType === 'google_review') {
      setValue('totalBudgetCoins', calculatedBudget, { shouldValidate: true, shouldDirty: true });
      setValue('rewardPerReview', 2500, { shouldValidate: true, shouldDirty: true });
      setValue('entryFeeCoins', 0, { shouldValidate: true, shouldDirty: true });
    } else if (arenaType === 'reel_reach') {
      setValue('entryFeeCoins', 2000, { shouldValidate: true, shouldDirty: true });
      setValue('rewardPerReview', 0, { shouldValidate: true, shouldDirty: true });
      const currentBudget = watch('totalBudgetCoins');
      if (!currentBudget || currentBudget === calculatedBudget) {
        setValue('totalBudgetCoins', 200000, { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [arenaType, maxP, calculatedBudget]);

  const isInsufficient = availableCoins < calculatedBudget;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Budget & Coins</Text>
      <Text style={styles.subheading}>
        {arenaType === 'google_review'
          ? 'Review the auto-calculated budget. Coins are deducted from your wallet immediately.'
          : 'Set the total prize pool. Coins are deducted from your wallet immediately.'}
      </Text>

      {/* Wallet Balance Display */}
      <View style={styles.walletDisplayCard}>
        <View style={styles.walletHeader}>
          <Text style={styles.walletTitle}>Your Wallet Balance</Text>
        </View>
        <Text style={styles.walletBalanceText}>
          🪙 {availableCoins.toLocaleString()} <Text style={styles.walletRupeeText}>(= ₹{(availableCoins / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })})</Text>
        </Text>
      </View>

      {arenaType === 'google_review' ? (
        // Auto-calculated budget layout for Google Review
        <View style={styles.calcContainer}>
          <Controller
            control={control}
            name="totalBudgetCoins"
            rules={{
              validate: () => {
                if (isInsufficient) {
                  return `Insufficient coins. Required: ${calculatedBudget.toLocaleString()}, Available: ${availableCoins.toLocaleString()}`;
                }
                return true;
              }
            }}
            render={({ fieldState: { error } }) => (
              <View style={styles.calcCard}>
                <View style={styles.calcHeader}>
                  <Text style={styles.calcTitle}>Google Review Arena Cost Breakdown</Text>
                </View>

                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>Maximum Participants</Text>
                  <Text style={styles.calcValue}>{maxP} creators</Text>
                </View>
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>Cost per Participant (₹50)</Text>
                  <Text style={styles.calcValue}>5,000 coins</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.calcRowTotal}>
                  <Text style={styles.calcLabelTotal}>Total Coins Required</Text>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.calcValueTotal}>🪙 {calculatedBudget.toLocaleString()}</Text>
                    <Text style={styles.calcValueRupeeTotal}>= ₹{(calculatedBudget / 100).toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                {error && (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{error.message}</Text>
                  </View>
                )}
              </View>
            )}
          />

          <View style={styles.reviewNoteBox}>
            <View style={styles.reviewNoteTitleRow}>
              <HugeiconsIcon icon={ListViewIcon} size={14} color={Colors.green} strokeWidth={2} />
              <Text style={styles.reviewNoteTitle}>Google Review Payout Model</Text>
            </View>
            <Text style={styles.reviewNoteText}>
              • Influencers join for free (0 coins entry fee).
            </Text>
            <Text style={styles.reviewNoteText}>
              • Each influencer who submits a successfully verified Google review receives <Text style={{ fontWeight: '800' }}>2,500 coins</Text> (₹25).
            </Text>
            <Text style={styles.reviewNoteText}>
              • The total budget covers maximum participant rewards and platform fees.
            </Text>
          </View>
        </View>
      ) : (
        // Original inputs for Reel Reach (for schema completeness)
        <>
          <CoinInput
            label="Total Budget (Prize Pool)"
            control={control}
            name="totalBudgetCoins"
            description="Total coins allocated as prize money for winners."
          />

          <CoinInput
            label="Entry Fee per Influencer"
            control={control}
            name="entryFeeCoins"
            description="Fixed at 2,000 coins (₹20) per participant. Collected automatically on join."
            locked
          />
        </>
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
    shadowOpacity: 0,
    elevation: 0,
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
    marginTop: 4,
  },
  reviewNoteBox: {
    backgroundColor: 'rgba(42,122,90,0.08)',
    borderRadius: Radius.md,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(42,122,90,0.25)',
    marginTop: 12,
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
  walletDisplayCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    gap: 8,
    ...Shadow.card,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(63,3,11,0.5)',
    textTransform: 'uppercase',
  },
  walletBalanceText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  walletRupeeText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 14,
    color: 'rgba(63,3,11,0.5)',
    fontWeight: 'normal',
  },
  calcContainer: {
    gap: 12,
  },
  calcCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(63,3,11,0.1)',
    gap: 12,
    ...Shadow.card,
  },
  calcHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(63,3,11,0.05)',
    paddingBottom: 8,
  },
  calcTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(63,3,11,0.6)',
  },
  calcValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(63,3,11,0.08)',
    marginVertical: 4,
  },
  calcRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLabelTotal: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
  },
  calcValueTotal: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  calcValueRupeeTotal: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: 'rgba(63,3,11,0.5)',
  },
  errorBanner: {
    backgroundColor: 'rgba(219,68,85,0.08)',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(219,68,85,0.25)',
    marginTop: 6,
  },
  errorBannerText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.rose,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
});
