import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, FontFamily, Radius } from '@/constants/brand';
import { api } from '@/lib/api';
import { playSound } from '@/lib/sound';

// Lucide icons
import { Info } from 'lucide-react-native';

interface WithdrawSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function WithdrawSheet({ visible, onClose }: WithdrawSheetProps) {
  const queryClient = useQueryClient();
  const [withdrawCoins, setWithdrawCoins] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const withdrawMutation = useMutation({
    mutationFn: () => api.wallet.withdraw(parseInt(withdrawCoins) || 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      setWithdrawCoins('');
      setErrorMsg(null);
      onClose();
    },
    onError: (err: any) => {
      playSound('error');
      setErrorMsg(err.message || 'Withdrawal failed. Please try again.');
    },
  });

  const handleConfirm = () => {
    const amount = parseInt(withdrawCoins);
    if (!amount || isNaN(amount)) {
      playSound('error');
      setErrorMsg('Please enter a valid coin amount.');
      return;
    }
    if (amount < 10000) {
      playSound('error');
      setErrorMsg('Minimum withdrawal is 10,000 coins.');
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
      snapPoints={['45%', '75%']}
    >
      <View style={styles.container}>
        <View style={styles.infoBox}>
          <Info size={16} color={Colors.oxblood} />
          <Text style={styles.infoText}>
            Minimum withdrawal: 10,000 coins (₹100). Settlements take 3-5 business days to process.
          </Text>
        </View>

        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Enter Coins to Withdraw</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10000"
              placeholderTextColor="rgba(63,3,11,0.3)"
              keyboardType="numeric"
              value={withdrawCoins}
              onChangeText={(val) => {
                setWithdrawCoins(val);
                if (errorMsg) setErrorMsg(null);
              }}
            />
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirm}
              activeOpacity={0.85}
              disabled={withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {withdrawCoins && parseInt(withdrawCoins) > 0 ? (
          <Text style={styles.calcText}>
            You will receive: <Text style={styles.boldText}>₹{(parseInt(withdrawCoins) / 100).toLocaleString('en-IN')}</Text>
          </Text>
        ) : null}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    gap: 16,
  },
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
  errorBox: {
    backgroundColor: 'rgba(235, 94, 85, 0.08)',
    borderRadius: Radius.md,
    padding: 10,
  },
  errorText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.roseDeep,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.creamLite,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  confirmBtn: {
    backgroundColor: Colors.oxblood,
    borderRadius: Radius.md,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
  },
  confirmBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  calcText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.green,
  },
  boldText: {
    fontWeight: '800',
  },
});
