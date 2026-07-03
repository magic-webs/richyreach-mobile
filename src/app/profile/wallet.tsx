import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, FontFamily } from '@/constants/brand';
import { WalletContent } from '@/components/influencer/profile/WalletContent';
import { WithdrawSheet } from '@/components/wallet/WithdrawSheet';
import { BuyCoinsSheet } from '@/components/wallet/BuyCoinsSheet';

import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';

export default function ProfileWalletScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [buyCoinsOpen, setBuyCoinsOpen] = useState(false);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={28} color={Colors.oxblood} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
      >
        <WalletContent
          onOpenWithdraw={() => setWithdrawOpen(true)}
          onOpenBuyCoins={() => setBuyCoinsOpen(true)}
        />
      </ScrollView>

      {/* Drawers */}
      {withdrawOpen && (
        <WithdrawSheet
          visible={withdrawOpen}
          onClose={() => setWithdrawOpen(false)}
        />
      )}

      {buyCoinsOpen && (
        <BuyCoinsSheet
          visible={buyCoinsOpen}
          onClose={() => setBuyCoinsOpen(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(63, 3, 11, 0.04)',
    backgroundColor: Colors.creamLite,
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  placeholder: {
    width: 36,
  },
});
