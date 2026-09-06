import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '@/constants/brand';
import { api } from '@/lib/api';

// Components
import { WalletBalanceCard } from '@/components/wallet/WalletBalanceCard';
import { WalletConvertPoints } from '@/components/wallet/WalletConvertPoints';
import { WalletTransactionHistory } from '@/components/wallet/WalletTransactionHistory';
import { PayoutMethodsCard } from '@/components/wallet/PayoutMethodsCard';

interface WalletContentProps {
  onOpenWithdraw: () => void;
  onOpenBuyCoins: () => void;
}

export function WalletContent({ onOpenWithdraw, onOpenBuyCoins }: WalletContentProps) {
  const { data: walletData, isLoading } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: () => api.wallet.balance(),
  });

  const coinBalance = walletData?.coinBalance ?? 0;
  const rupeeValue = walletData?.rupeeValue ?? 0;
  const transactions = walletData?.transactions ?? [];

  if (isLoading && !walletData) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.oxblood} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WalletBalanceCard
        coinBalance={coinBalance}
        rupeeValue={rupeeValue}
        onOpenWithdraw={onOpenWithdraw}
        onOpenBuyCoins={onOpenBuyCoins}
      />

      {/* <WalletConvertPoints /> */}

      <PayoutMethodsCard />

      <WalletTransactionHistory transactions={transactions} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 40,
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
