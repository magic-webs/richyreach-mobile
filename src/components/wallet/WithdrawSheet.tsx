import { BottomSheet } from '@/components/ui/bottom-sheet';
import { TactileButton } from '@/components/ui/tactile-button';
import { Colors, FontFamily, Radius } from '@/constants/brand';
import { api } from '@/lib/api';
import { playSound } from '@/lib/sound';
import type { PayoutMethod } from '@/types/payout';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Building2, Check, Info, Plus, Smartphone } from 'lucide-react-native';
import { AddPayoutMethodSheet } from './AddPayoutMethodSheet';

const MIN_COINS = 10000;
const COINS_PER_RUPEE = 100;
const QUICK_AMOUNTS = [10000, 25000, 50000];

interface WithdrawSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function WithdrawSheet({ visible, onClose }: WithdrawSheetProps) {
  const queryClient = useQueryClient();
  const [withdrawCoins, setWithdrawCoins] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const { data: walletData } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: () => api.wallet.balance(),
  });

  const { data: methods = [], isLoading: loadingMethods } = useQuery({
    queryKey: ['payoutMethods'],
    queryFn: () => api.wallet.payoutMethods.list(),
  });

  const available = walletData?.coinBalance ?? 0;
  // Falls back to the default so the common case needs no tap.
  const destination: PayoutMethod | undefined =
    methods.find((m) => m.id === selectedId) ?? methods.find((m) => m.isDefault) ?? methods[0];

  const withdrawMutation = useMutation({
    mutationFn: () => api.wallet.withdraw(parseInt(withdrawCoins, 10) || 0, destination!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      setWithdrawCoins('');
      setErrorMsg(null);
      onClose();
    },
    onError: (err: any) => {
      playSound('error');
      setErrorMsg(err?.message || 'Withdrawal failed. Please try again.');
    },
  });

  const amount = parseInt(withdrawCoins, 10);

  const handleConfirm = () => {
    if (!destination) {
      playSound('error');
      setErrorMsg('Add a bank account or UPI ID first.');
      return;
    }
    if (!amount || isNaN(amount)) {
      playSound('error');
      setErrorMsg('Please enter a valid coin amount.');
      return;
    }
    if (amount < MIN_COINS) {
      playSound('error');
      setErrorMsg(`Minimum withdrawal is ${MIN_COINS.toLocaleString('en-IN')} coins.`);
      return;
    }
    if (amount > available) {
      playSound('error');
      setErrorMsg(`You only have ${available.toLocaleString('en-IN')} coins.`);
      return;
    }
    setErrorMsg(null);
    withdrawMutation.mutate();
  };

  return (
    <BottomSheet
      visible={visible}
      title="Request Payout"
      icon="wallet"
      onClose={onClose}
      footer={
        <TactileButton
          text="Confirm withdrawal"
          icon="check"
          variant={destination ? "primary" : "disabled"}
          disabled={!destination}
          loading={withdrawMutation.isPending}
          fullWidth
          onPress={handleConfirm}
        />
      }
    >
      <View style={styles.container}>
        <View style={styles.infoBox}>
          <Info size={16} color={Colors.oxblood} />
          <Text style={styles.infoText}>
            Minimum withdrawal: {MIN_COINS.toLocaleString('en-IN')} coins (₹
            {MIN_COINS / COINS_PER_RUPEE}). Settlements take 3-5 business days to process.
          </Text>
        </View>

        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Destination */}
        <View style={{ gap: 9 }}>
          <Text style={styles.label}>Send to</Text>

          {loadingMethods ? (
            <Text style={styles.muted}>Loading your payout methods…</Text>
          ) : methods.length === 0 ? (
            <TouchableOpacity style={styles.addFirst} activeOpacity={0.85} onPress={() => setAddOpen(true)}>
              <Plus size={15} color={Colors.oxblood} />
              <Text style={styles.addFirstText}>Add a bank account or UPI ID</Text>
            </TouchableOpacity>
          ) : (
            <>
              {methods.map((m) => {
                const active = destination?.id === m.id;
                const Glyph = m.type === 'upi' ? Smartphone : Building2;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.destRow, active && styles.destRowActive]}
                    activeOpacity={0.85}
                    onPress={() => setSelectedId(m.id)}
                  >
                    <Glyph size={16} color={Colors.oxblood} />
                    <Text style={styles.destText} numberOfLines={1}>
                      {m.display}
                    </Text>
                    {active && <Check size={16} color={Colors.green} />}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity style={styles.addMore} activeOpacity={0.8} onPress={() => setAddOpen(true)}>
                <Plus size={13} color={Colors.rose} />
                <Text style={styles.addMoreText}>Add another</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Amount */}
        <View style={{ gap: 9 }}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Enter Coins to Withdraw</Text>
            <Text style={styles.muted}>{available.toLocaleString('en-IN')} available</Text>
          </View>

          <BottomSheetTextInput
            style={styles.input}
            placeholder="e.g. 10000"
            placeholderTextColor="rgba(63,3,11,0.3)"
            keyboardType="number-pad"
            value={withdrawCoins}
            onChangeText={(val: string) => {
              setWithdrawCoins(val.replace(/\D/g, ''));
              if (errorMsg) setErrorMsg(null);
            }}
          />

          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.filter((q) => q <= available).map((q) => (
              <TouchableOpacity
                key={q}
                style={styles.quickChip}
                activeOpacity={0.8}
                onPress={() => setWithdrawCoins(String(q))}
              >
                <Text style={styles.quickChipText}>{q.toLocaleString('en-IN')}</Text>
              </TouchableOpacity>
            ))}
            {available >= MIN_COINS && (
              <TouchableOpacity
                style={styles.quickChip}
                activeOpacity={0.8}
                onPress={() => setWithdrawCoins(String(available))}
              >
                <Text style={styles.quickChipText}>All</Text>
              </TouchableOpacity>
            )}
          </View>

          {amount > 0 ? (
            <Text style={styles.calcText}>
              You will receive:{' '}
              <Text style={styles.boldText}>
                ₹{(amount / COINS_PER_RUPEE).toLocaleString('en-IN')}
              </Text>
              {destination ? ` to ${destination.display}` : ''}
            </Text>
          ) : null}
        </View>
      </View>

      {addOpen && <AddPayoutMethodSheet visible={addOpen} onClose={() => setAddOpen(false)} />}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 12 },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(63, 3, 11, 0.04)',
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.65)',
    lineHeight: 18,
    flex: 1,
  },
  errorBox: { backgroundColor: 'rgba(235, 94, 85, 0.08)', borderRadius: Radius.md, padding: 10 },
  errorText: { fontFamily: FontFamily.sansMedium, fontSize: 12, color: Colors.roseDeep },

  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontFamily: FontFamily.sansMedium, fontSize: 13, color: Colors.oxblood, fontWeight: '700' },
  muted: { fontSize: 11.5, color: 'rgba(63,3,11,0.45)' },

  destRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.creamLite,
    borderRadius: Radius.md,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  destRowActive: { borderColor: Colors.oxblood },
  destText: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.ink },

  addFirst: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(63,3,11,0.2)',
  },
  addFirstText: { fontSize: 13, fontWeight: '700', color: Colors.oxblood },
  addMore: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  addMoreText: { fontSize: 12, fontWeight: '700', color: Colors.rose },

  input: {
    backgroundColor: Colors.creamLite,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.1)',
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    color: Colors.ink,
  },

  quickRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  quickChip: {
    backgroundColor: 'rgba(180,106,116,0.14)',
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickChipText: { fontSize: 11.5, fontWeight: '700', color: Colors.oxblood },

  calcText: { fontFamily: FontFamily.sansMedium, fontSize: 13, color: Colors.green },
  boldText: { fontWeight: '800' },
});
