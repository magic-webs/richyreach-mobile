import { BottomSheet } from '@/components/ui/bottom-sheet';
import { TactileButton } from '@/components/ui/tactile-button';
import { Colors, FontFamily, Radius } from '@/constants/brand';
import { api } from '@/lib/api';
import { playSound } from '@/lib/sound';
import {
  ACCOUNT_NUMBER_PATTERN,
  IFSC_PATTERN,
  UPI_PATTERN,
  type CreatePayoutMethodInput,
  type PayoutMethodType,
} from '@/types/payout';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, ShieldCheck, Smartphone } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AddPayoutMethodSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function AddPayoutMethodSheet({ visible, onClose }: AddPayoutMethodSheetProps) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<PayoutMethodType>('bank');

  const [holder, setHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reset = () => {
    setHolder('');
    setAccountNumber('');
    setConfirmAccount('');
    setIfsc('');
    setBankName('');
    setUpiId('');
    setErrorMsg(null);
  };

  const createMutation = useMutation({
    mutationFn: (body: CreatePayoutMethodInput) => api.wallet.payoutMethods.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payoutMethods'] });
      reset();
      onClose();
    },
    onError: (err: any) => {
      playSound('error');
      setErrorMsg(err?.message || 'Could not save this payout method.');
    },
  });

  // Mirrors the API validators, so an obvious mistake is caught before a round trip.
  const problems: string[] = [];
  if (type === 'bank') {
    if (holder.trim().length < 2) problems.push('Enter the account holder name');
    if (!ACCOUNT_NUMBER_PATTERN.test(accountNumber.trim()))
      problems.push('Account number must be 9 to 18 digits');
    else if (accountNumber.trim() !== confirmAccount.trim())
      problems.push('Account numbers do not match');
    if (!IFSC_PATTERN.test(ifsc.trim().toUpperCase())) problems.push('Enter a valid IFSC code');
  } else if (!UPI_PATTERN.test(upiId.trim())) {
    problems.push('Enter a valid UPI ID, like name@bank');
  }

  const onSubmit = () => {
    if (problems.length > 0) {
      playSound('error');
      setErrorMsg(problems[0]);
      return;
    }
    setErrorMsg(null);

    createMutation.mutate(
      type === 'bank'
        ? {
            type: 'bank',
            accountHolderName: holder.trim(),
            accountNumber: accountNumber.trim(),
            confirmAccountNumber: confirmAccount.trim(),
            ifsc: ifsc.trim().toUpperCase(),
            bankName: bankName.trim() || null,
          }
        : { type: 'upi', upiId: upiId.trim().toLowerCase() }
    );
  };

  return (
    <BottomSheet
      visible={visible}
      title="Add payout method"
      icon="wallet"
      onClose={onClose}
      footer={
        <TactileButton
          text={type === "bank" ? "Save bank account" : "Save UPI ID"}
          icon="check"
          variant={problems.length > 0 ? "disabled" : "primary"}
          disabled={problems.length > 0}
          loading={createMutation.isPending}
          fullWidth
          onPress={onSubmit}
        />
      }
    >
      <View style={styles.container}>
        {/* Type switch */}
        <View style={styles.typeRow}>
          {(['bank', 'upi'] as PayoutMethodType[]).map((t) => {
            const active = type === t;
            const Glyph = t === 'upi' ? Smartphone : Building2;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.typeCard, active && styles.typeCardActive]}
                activeOpacity={0.85}
                onPress={() => {
                  setType(t);
                  setErrorMsg(null);
                }}
              >
                <Glyph size={18} color={active ? Colors.cream : Colors.oxblood} />
                <Text style={[styles.typeLabel, active && { color: Colors.cream }]}>
                  {t === 'bank' ? 'Bank account' : 'UPI ID'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {type === 'bank' ? (
          <>
            <Field label="Account holder name">
              <BottomSheetTextInput
                style={styles.input}
                value={holder}
                onChangeText={setHolder}
                placeholder="As printed on your passbook"
                placeholderTextColor="rgba(63,3,11,0.3)"
                autoCapitalize="words"
                maxLength={80}
              />
            </Field>

            <Field label="Account number">
              <BottomSheetTextInput
                style={styles.input}
                value={accountNumber}
                onChangeText={(v: string) => setAccountNumber(v.replace(/\D/g, ''))}
                placeholder="9 to 18 digits"
                placeholderTextColor="rgba(63,3,11,0.3)"
                keyboardType="number-pad"
                maxLength={18}
                secureTextEntry
              />
            </Field>

            {/* Asked twice on purpose: a single wrong digit pays a stranger. */}
            <Field label="Confirm account number">
              <BottomSheetTextInput
                style={styles.input}
                value={confirmAccount}
                onChangeText={(v: string) => setConfirmAccount(v.replace(/\D/g, ''))}
                placeholder="Re-enter the account number"
                placeholderTextColor="rgba(63,3,11,0.3)"
                keyboardType="number-pad"
                maxLength={18}
              />
            </Field>

            <Field label="IFSC code">
              <BottomSheetTextInput
                style={styles.input}
                value={ifsc}
                onChangeText={(v: string) => setIfsc(v.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="HDFC0001234"
                placeholderTextColor="rgba(63,3,11,0.3)"
                autoCapitalize="characters"
                maxLength={11}
              />
            </Field>

            <Field label="Bank name (optional)">
              <BottomSheetTextInput
                style={styles.input}
                value={bankName}
                onChangeText={setBankName}
                placeholder="HDFC Bank"
                placeholderTextColor="rgba(63,3,11,0.3)"
                maxLength={80}
              />
            </Field>
          </>
        ) : (
          <Field label="UPI ID">
            <BottomSheetTextInput
              style={styles.input}
              value={upiId}
              onChangeText={setUpiId}
              placeholder="yourname@okicici"
              placeholderTextColor="rgba(63,3,11,0.3)"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              maxLength={120}
            />
          </Field>
        )}

        <View style={styles.assurance}>
          <ShieldCheck size={15} color={Colors.green} />
          <Text style={styles.assuranceText}>
            {type === 'bank'
              ? 'Your account number is encrypted. Only the last four digits are shown back to you.'
              : 'Used only to send your withdrawals.'}
          </Text>
        </View>
      </View>
    </BottomSheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 7 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, paddingBottom: 12 },

  typeRow: { flexDirection: 'row', gap: 10 },
  typeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: Radius.md,
    backgroundColor: Colors.creamLite,
    borderWidth: 1.5,
    borderColor: 'rgba(63,3,11,0.1)',
  },
  typeCardActive: { backgroundColor: Colors.oxblood, borderColor: Colors.oxblood },
  typeLabel: { fontSize: 13, fontWeight: '700', color: Colors.oxblood },

  label: { fontFamily: FontFamily.sansMedium, fontSize: 12.5, fontWeight: '700', color: Colors.oxblood },
  input: {
    backgroundColor: Colors.creamLite,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.1)',
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },

  errorBox: { backgroundColor: 'rgba(235,94,85,0.08)', borderRadius: Radius.md, padding: 11 },
  errorText: { fontFamily: FontFamily.sansMedium, fontSize: 12, color: Colors.roseDeep },

  assurance: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', marginTop: 2 },
  assuranceText: { flex: 1, fontSize: 11.5, color: 'rgba(63,3,11,0.5)', lineHeight: 16 },
});
