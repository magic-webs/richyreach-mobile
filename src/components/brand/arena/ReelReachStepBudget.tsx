import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
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

export function ReelReachStepBudget() {
  const { control } = useFormContext();
  const { activeBrandProfileId } = useProfilesStore();

  const { data: walletData } = useQuery({
    queryKey: ['walletBalance', activeBrandProfileId],
    queryFn: () => api.brands.wallet.balance(activeBrandProfileId),
    enabled: !!activeBrandProfileId,
  });

  const availableCoins = (walletData as any)?.balance?.coins || 0;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Budget & Coins</Text>
      <Text style={styles.subheading}>
        Set the total prize pool. Coins are deducted from your wallet immediately.
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
});
