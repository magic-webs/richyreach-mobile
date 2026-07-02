import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';

const COIN_PACKAGES = [
  { coins: 2000, rupees: 20, label: 'Starter', tag: null },
  { coins: 10000, rupees: 100, label: 'Basic', tag: null },
  { coins: 50000, rupees: 500, label: 'Pro', tag: 'Popular' },
  { coins: 100000, rupees: 1000, label: 'Elite', tag: null },
  { coins: 500000, rupees: 5000, label: 'Premium', tag: 'Best Value' },
];

const TX_TYPE_ICONS: Record<string, string> = {
  arena_entry: '🎮',
  arena_reward: '🏆',
  arena_refund: '↩️',
  arena_budget: '💼',
  coin_purchase: '🛒',
  coin_withdrawal: '💸',
  review_reward: '⭐',
  referral: '🤝',
  deposit: '💰',
  brand_campaign_refund: '↩️',
};

function TransactionRow({ tx }: { tx: any }) {
  const icon = TX_TYPE_ICONS[tx.transactionType] || (tx.type === 'credit' ? '💰' : '💸');
  const isCredit = tx.type === 'credit';

  return (
    <View style={styles.txRow}>
      <View style={styles.txIcon}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txDesc} numberOfLines={1}>{tx.description || tx.transactionType}</Text>
        <Text style={styles.txDate}>
          {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>
      </View>
      <View style={styles.txAmountCol}>
        <Text style={[styles.txAmount, { color: isCredit ? Colors.green : Colors.rose }]}>
          {isCredit ? '+' : '-'}{tx.amount.toLocaleString()} 🪙
        </Text>
        <Text style={styles.txRupee}>
          ₹{(tx.amount / 100).toLocaleString('en-IN')}
        </Text>
      </View>
    </View>
  );
}

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const showModal = useUIStore((s) => s.showModal);
  const queryClient = useQueryClient();
  const [withdrawCoins, setWithdrawCoins] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<typeof COIN_PACKAGES[0] | null>(null);

  const { data: walletData, isLoading, refetch } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: () => api.wallet.balance(),
  });

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: typeof COIN_PACKAGES[0]) => {
      const order = await api.wallet.createOrder(pkg.coins);

      // Mock verification for dev (order_mock_ prefix)
      if (order.id?.startsWith('order_mock_')) {
        return api.wallet.verifyPayment({
          razorpay_order_id: order.id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_sig',
          coins: pkg.coins,
        });
      }

      // In production: open Razorpay checkout here
      showModal({ title: 'Payment Required', message: 'Razorpay checkout integration needed for production.' });
      throw new Error('Razorpay not integrated');
    },
    onSuccess: (data, pkg) => {
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      showModal({
        title: '🎉 Coins Added!',
        message: `${pkg.coins.toLocaleString()} coins (₹${pkg.rupees}) successfully added to your wallet.`,
      });
      setSelectedPackage(null);
    },
    onError: (err: any) => {
      if (!err.message.includes('Razorpay not integrated')) {
        showModal({ title: 'Purchase Failed', message: err.message });
      }
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: () => api.wallet.withdraw(parseInt(withdrawCoins) || 0),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      showModal({
        title: '✅ Withdrawal Requested',
        message: data.message || 'Your withdrawal will be processed within 3-5 business days.',
      });
      setWithdrawCoins('');
      setShowWithdraw(false);
    },
    onError: (err: any) => showModal({ title: 'Withdrawal Failed', message: err.message }),
  });

  const coinBalance = walletData?.coinBalance ?? 0;
  const rupeeValue = walletData?.rupeeValue ?? 0;
  const transactions = walletData?.transactions ?? [];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.rose} />
        }
      >
        {/* Balance Card */}
        <LinearGradient
          colors={['#3f030b', '#5a1018', '#2a0207']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>RICHYREACH COINS</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.coinEmoji}>🪙</Text>
            <Text style={styles.balanceValue}>{coinBalance.toLocaleString()}</Text>
          </View>
          <Text style={styles.rupeeEquiv}>= ₹{rupeeValue.toLocaleString('en-IN')}</Text>
          <Text style={styles.rateNote}>1 Rupee = 100 Coins</Text>

          {/* Action Buttons */}
          <View style={styles.balanceActions}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={() => setShowWithdraw(!showWithdraw)}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnPrimaryText}>💸 Withdraw</Text>
            </TouchableOpacity>
            <View style={styles.coinInfoPill}>
              <Text style={styles.coinInfoText}>2,000 🪙 = ₹20</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Withdraw Panel */}
        {showWithdraw && (
          <View style={styles.withdrawPanel}>
            <Text style={styles.withdrawTitle}>Withdraw Coins</Text>
            <Text style={styles.withdrawSub}>Minimum 10,000 coins (₹100). Processed in 3-5 days.</Text>
            <View style={styles.withdrawRow}>
              <TextInput
                style={styles.withdrawInput}
                placeholder="Enter coins to withdraw"
                placeholderTextColor="rgba(63,3,11,0.4)"
                keyboardType="numeric"
                value={withdrawCoins}
                onChangeText={setWithdrawCoins}
              />
              <TouchableOpacity
                style={styles.withdrawBtn}
                onPress={() => withdrawMutation.mutate()}
                activeOpacity={0.85}
                disabled={withdrawMutation.isPending}
              >
                <Text style={styles.withdrawBtnText}>
                  {withdrawMutation.isPending ? 'Processing...' : 'Withdraw'}
                </Text>
              </TouchableOpacity>
            </View>
            {withdrawCoins && parseInt(withdrawCoins) > 0 && (
              <Text style={styles.withdrawCalc}>
                = ₹{(parseInt(withdrawCoins) / 100).toLocaleString('en-IN')}
              </Text>
            )}
          </View>
        )}

        {/* Buy Coins */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛒 Buy Coins</Text>
          <View style={styles.packagesGrid}>
            {COIN_PACKAGES.map((pkg) => (
              <TouchableOpacity
                key={pkg.coins}
                style={[styles.packageCard, selectedPackage?.coins === pkg.coins && styles.packageCardSelected]}
                onPress={() => {
                  setSelectedPackage(pkg);
                  purchaseMutation.mutate(pkg);
                }}
                activeOpacity={0.85}
                disabled={purchaseMutation.isPending}
              >
                {pkg.tag && (
                  <View style={styles.packageTag}>
                    <Text style={styles.packageTagText}>{pkg.tag}</Text>
                  </View>
                )}
                <Text style={styles.packageCoins}>{pkg.coins.toLocaleString()}</Text>
                <Text style={styles.packageCoinLabel}>🪙 Coins</Text>
                <Text style={styles.packageRupee}>₹{pkg.rupees}</Text>
                <Text style={styles.packageLabel}>{pkg.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Transaction History</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyTx}>
              <Text style={styles.emptyTxText}>No transactions yet</Text>
            </View>
          ) : (
            <View style={styles.txList}>
              {transactions.map((tx: any) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  balanceCard: {
    margin: 18,
    borderRadius: 24,
    padding: 24,
    gap: 4,
  },
  balanceLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 10,
    color: 'rgba(232,216,204,0.6)',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  coinEmoji: { fontSize: 36 },
  balanceValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 44,
    fontWeight: '800',
    color: '#fff',
  },
  rupeeEquiv: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    color: 'rgba(232,216,204,0.8)',
    marginTop: 4,
  },
  rateNote: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(232,216,204,0.4)',
    marginTop: 2,
    marginBottom: 16,
  },
  balanceActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionBtnPrimary: {
    backgroundColor: 'rgba(232,216,204,0.15)',
    borderRadius: Radius.full,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(232,216,204,0.25)',
  },
  actionBtnPrimaryText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.cream,
  },
  coinInfoPill: {
    backgroundColor: 'rgba(243,201,105,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  coinInfoText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.gold,
    fontWeight: '700',
  },
  withdrawPanel: {
    marginHorizontal: 18,
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    marginBottom: 4,
    ...Shadow.card,
  },
  withdrawTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  withdrawSub: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.5)',
    lineHeight: 18,
  },
  withdrawRow: { flexDirection: 'row', gap: 10 },
  withdrawInput: {
    flex: 1,
    backgroundColor: Colors.creamLite,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    color: Colors.ink,
  },
  withdrawBtn: {
    backgroundColor: Colors.oxblood,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  withdrawCalc: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.green,
    fontWeight: '700',
  },
  section: { paddingHorizontal: 18, marginBottom: 24 },
  sectionTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.oxblood,
    marginBottom: 14,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  packageCard: {
    width: '46.5%',
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(63,3,11,0.08)',
    gap: 4,
    ...Shadow.card,
    position: 'relative',
    overflow: 'hidden',
  },
  packageCardSelected: {
    borderColor: Colors.oxblood,
    backgroundColor: 'rgba(63,3,11,0.03)',
  },
  packageTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.rose,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  packageTagText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 8,
    color: '#fff',
    fontWeight: '700',
  },
  packageCoins: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.oxblood,
    marginTop: 8,
  },
  packageCoinLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(63,3,11,0.45)',
  },
  packageRupee: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.rose,
    marginTop: 4,
  },
  packageLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(63,3,11,0.4)',
  },
  txList: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.07)',
    ...Shadow.card,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.07)',
    gap: 12,
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.creamLite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: { flex: 1 },
  txDesc: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    color: Colors.ink,
    fontWeight: '600',
  },
  txDate: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(63,3,11,0.4)',
    marginTop: 2,
  },
  txAmountCol: { alignItems: 'flex-end' },
  txAmount: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '800',
  },
  txRupee: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(63,3,11,0.4)',
    marginTop: 1,
  },
  emptyTx: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.07)',
  },
  emptyTxText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 14,
    color: 'rgba(63,3,11,0.35)',
  },
});
