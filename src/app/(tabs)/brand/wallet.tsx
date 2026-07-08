import { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useProfilesStore } from '@/store/profiles';
import { useUIStore } from '@/store/ui';
import { playSound } from '@/lib/sound';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
const GST_RATE = 0.18;

const PRESETS = [
  { rupees: 500, label: '₹500' },
  { rupees: 1000, label: '₹1K' },
  { rupees: 2000, label: '₹2K' },
  { rupees: 5000, label: '₹5K' },
  { rupees: 10000, label: '₹10K' },
];

const TX_ICONS: Record<string, string> = {
  brand_topup: '💰',
  brand_campaign_spend: '💼',
  brand_campaign_refund: '↩️',
  arena_budget: '🏆',
};

type TxFilter = 'all' | 'credited' | 'debited';

function rupeeToCoins(rupees: number) {
  return Math.round(rupees * 100);
}

function coinsToRupees(coins: number) {
  return coins / 100;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (Platform.OS !== 'web') {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function fmtRupees(coins: number) {
  return coinsToRupees(coins).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function TransactionRow({ tx }: { tx: any }) {
  const icon = TX_ICONS[tx.transactionType] ?? (tx.type === 'credit' ? '💰' : '💸');
  const isCredit = tx.type === 'credit';
  const gstRupees = tx.gstAmount ? coinsToRupees(tx.gstAmount) : 0;

  return (
    <View style={styles.txRow}>
      <View style={styles.txIconBox}>
        <Text style={{ fontSize: 17 }}>{icon}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txDesc} numberOfLines={1}>{tx.description || tx.transactionType}</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {tx.gstAmount > 0 && (
            <Text style={styles.txGst}>GST ₹{gstRupees.toLocaleString('en-IN')}</Text>
          )}
          <Text style={styles.txDate}>
            {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </Text>
        </View>
      </View>
      <Text style={[styles.txAmount, { color: isCredit ? '#1a7a50' : Colors.rose }]}>
        {isCredit ? '+' : '-'}₹{fmtRupees(tx.amount)}
      </Text>
    </View>
  );
}

function SummaryCard({ label, coins, color }: { label: string; coins: number; color?: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={[styles.summaryValue, color ? { color } : {}]}>₹{fmtRupees(coins)}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

export default function BrandWalletScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showModal = useUIStore((s) => s.showModal);
  const queryClient = useQueryClient();
  const { activeProfileId } = useProfilesStore();

  const [filter, setFilter] = useState<TxFilter>('all');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [selectedRupees, setSelectedRupees] = useState<number | null>(null);
  const [customRupees, setCustomRupees] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['brandWallet', activeProfileId],
    queryFn: () => api.brands.wallet.balance(activeProfileId),
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['brandWalletTx', activeProfileId, filter],
    queryFn: () => api.brands.wallet.transactions(filter, 1, activeProfileId),
  });

  const effectiveRupees = selectedRupees ?? (customRupees ? parseFloat(customRupees) : 0);
  const baseCoins = rupeeToCoins(effectiveRupees);
  const gstCoins = Math.round(baseCoins * GST_RATE);
  const totalRupees = coinsToRupees(baseCoins + gstCoins);

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!baseCoins || baseCoins <= 0) throw new Error('Enter a valid amount');

      const order = await api.brands.wallet.createOrder(baseCoins, activeProfileId);

      if (order.id?.startsWith('order_mock_brand_')) {
        return api.brands.wallet.verifyPayment(
          {
            razorpay_order_id: order.id,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: 'mock_sig',
            baseCoins,
            gstCoins,
          },
          activeProfileId
        );
      }

      if (Platform.OS === 'web') {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error('Failed to load Razorpay SDK');
        }

        return new Promise((resolve, reject) => {
          const options = {
            key: order.key_id ?? '',
            amount: order.amount ?? 0,
            currency: 'INR',
            name: 'RichyReach',
            description: 'Brand Wallet Top-up',
            order_id: order.id ?? '',
            handler: async (response: any) => {
              try {
                const res = await api.brands.wallet.verifyPayment(
                  {
                    razorpay_order_id: order.id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    baseCoins,
                    gstCoins,
                  },
                  activeProfileId
                );
                resolve(res);
              } catch (err) {
                reject(err);
              }
            },
            modal: {
              ondismiss: () => {
                reject(new Error('Payment cancelled'));
              },
            },
            theme: {
              color: '#3498db',
            },
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        });
      } else {
        // Real Razorpay checkout via expo-web-browser
        const checkoutUrl = buildRazorpayCheckoutUrl(order);
        const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, 'richyreachmobile://wallet');

        if (result.type !== 'success' || !result.url) {
          throw new Error('Payment cancelled or failed');
        }

        const params = new URLSearchParams(result.url.split('?')[1] ?? '');
        const razorpay_payment_id = params.get('razorpay_payment_id') ?? '';
        const razorpay_signature = params.get('razorpay_signature') ?? '';

        return api.brands.wallet.verifyPayment(
          {
            razorpay_order_id: order.id,
            razorpay_payment_id,
            razorpay_signature,
            baseCoins,
            gstCoins,
          },
          activeProfileId
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brandWallet'] });
      queryClient.invalidateQueries({ queryKey: ['brandWalletTx'] });
      playSound('coinCredit');
      setShowAddSheet(false);
      setSelectedRupees(null);
      setCustomRupees('');
      showModal({ title: 'Money Added!', message: `₹${effectiveRupees.toLocaleString('en-IN')} added to your wallet.` });
    },
    onError: (err: any) => {
      if (!err.message?.includes('cancelled')) {
        showModal({ title: 'Payment Failed', message: err.message || 'Something went wrong.' });
      }
    },
  });

  const balance = data?.balance ?? { coins: 0, rupees: 0 };
  const summary = data?.summary ?? { totalAdded: 0, totalSpent: 0, campaignSpend: 0 };
  const transactions = txData?.transactions ?? data?.transactions ?? [];

  const openAddSheet = useCallback(() => {
    setShowAddSheet(true);
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.rose} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/brand/profile')} style={styles.backBtn} activeOpacity={0.7}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color={Colors.oxblood} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Brand Wallet</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={['#3f030b', '#6b1220', '#2a0207']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
          <Text style={styles.balanceValue}>₹{balance.rupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          <Text style={styles.balanceSub}>{balance.coins.toLocaleString()} coins</Text>

          <TouchableOpacity style={styles.addBtn} onPress={openAddSheet} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>+ Add Money</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Summary Row */}
        <View style={styles.summaryRow}>
          <SummaryCard label="Total Added" coins={summary.totalAdded} color="#1a7a50" />
          <SummaryCard label="Campaigns" coins={summary.campaignSpend} color={Colors.rose} />
          <SummaryCard label="Total Spent" coins={summary.totalSpent} />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {(['all', 'credited', 'debited'] as TxFilter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                {f === 'all' ? 'All' : f === 'credited' ? 'Added' : 'Spent'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction List */}
        <View style={styles.txSection}>
          {txLoading && isLoading ? (
            <ActivityIndicator color={Colors.oxblood} style={{ marginTop: 32 }} />
          ) : transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💳</Text>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySub}>Add money to start using your brand wallet</Text>
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

      {/* Add Money Bottom Sheet */}
      {showAddSheet && (
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={styles.sheetBackdrop} onPress={() => setShowAddSheet(false)} activeOpacity={1} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Add Money</Text>
            <Text style={styles.sheetSub}>Select amount or enter custom</Text>

            {/* Preset amounts */}
            <View style={styles.presetRow}>
              {PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.rupees}
                  style={[styles.presetBtn, selectedRupees === p.rupees && styles.presetBtnActive]}
                  onPress={() => { setSelectedRupees(p.rupees); setCustomRupees(''); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.presetBtnText, selectedRupees === p.rupees && styles.presetBtnTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom amount */}
            <View style={styles.customRow}>
              <Text style={styles.customPrefix}>₹</Text>
              <TextInput
                style={styles.customInput}
                placeholder="Custom amount"
                placeholderTextColor="rgba(63,3,11,0.35)"
                keyboardType="numeric"
                value={customRupees}
                onChangeText={(v) => { setCustomRupees(v); setSelectedRupees(null); }}
              />
            </View>

            {/* GST Breakdown */}
            {effectiveRupees > 0 && (
              <View style={styles.gstCard}>
                <View style={styles.gstRow}>
                  <Text style={styles.gstLabel}>Base amount</Text>
                  <Text style={styles.gstValue}>₹{effectiveRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </View>
                <View style={styles.gstRow}>
                  <Text style={styles.gstLabel}>GST (18%)</Text>
                  <Text style={styles.gstValue}>₹{coinsToRupees(gstCoins).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </View>
                <View style={[styles.gstRow, styles.gstTotalRow]}>
                  <Text style={styles.gstTotalLabel}>You pay</Text>
                  <Text style={styles.gstTotalValue}>₹{totalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.payBtn, (!effectiveRupees || effectiveRupees <= 0) && styles.payBtnDisabled]}
              onPress={() => purchaseMutation.mutate()}
              disabled={!effectiveRupees || effectiveRupees <= 0 || purchaseMutation.isPending}
              activeOpacity={0.85}
            >
              {purchaseMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.payBtnText}>
                  {effectiveRupees > 0
                    ? `Pay ₹${totalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    : 'Select amount'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function buildRazorpayCheckoutUrl(order: any): string {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://backend-api.richyreach.com/api';
  const params = new URLSearchParams({
    key_id: order.key_id ?? '',
    order_id: order.id ?? '',
    amount: String(order.amount ?? ''),
    currency: 'INR',
    name: 'RichyReach',
    description: 'Brand Wallet Top-up',
    theme_color: '#3498db',
    scheme: 'richyreachmobile',
    redirect_path: 'wallet',
  });
  return `${apiBaseUrl}/payments/razorpay-checkout?${params.toString()}`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: Colors.oxblood, fontFamily: FontFamily.sansMedium },
  headerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.oxblood,
  },

  balanceCard: {
    marginHorizontal: 18,
    borderRadius: 24,
    padding: 28,
    gap: 6,
    marginBottom: 16,
  },
  balanceLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 10,
    color: 'rgba(232,216,204,0.55)',
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  balanceValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  balanceSub: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
    color: 'rgba(232,216,204,0.45)',
    marginBottom: 20,
  },
  addBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(232,216,204,0.18)',
    borderRadius: Radius.full,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(232,216,204,0.3)',
  },
  addBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.cream,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.07)',
    ...Shadow.card,
  },
  summaryValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '800',
    color: Colors.oxblood,
  },
  summaryLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10,
    color: 'rgba(63,3,11,0.45)',
    marginTop: 3,
    textAlign: 'center',
  },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.1)',
  },
  filterTabActive: {
    backgroundColor: Colors.oxblood,
    borderColor: Colors.oxblood,
  },
  filterTabText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: 'rgba(63,3,11,0.55)',
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#fff',
  },

  txSection: { paddingHorizontal: 18 },
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
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.creamLite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: { flex: 1 },
  txDesc: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.ink,
    fontWeight: '600',
    marginBottom: 3,
  },
  txGst: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10.5,
    color: 'rgba(63,3,11,0.4)',
    backgroundColor: 'rgba(63,3,11,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  txDate: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10.5,
    color: 'rgba(63,3,11,0.35)',
  },
  txAmount: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '800',
  },

  emptyState: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.07)',
    gap: 8,
  },
  emptyEmoji: { fontSize: 36, marginBottom: 4 },
  emptyTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  emptySub: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(63,3,11,0.4)',
    textAlign: 'center',
  },

  // Add Money Sheet
  sheetOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 16,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(63,3,11,0.15)',
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.oxblood,
  },
  sheetSub: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(63,3,11,0.45)',
    marginTop: -10,
  },

  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: 'rgba(63,3,11,0.12)',
    backgroundColor: Colors.creamLite,
  },
  presetBtnActive: {
    borderColor: Colors.oxblood,
    backgroundColor: 'rgba(63,3,11,0.06)',
  },
  presetBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(63,3,11,0.55)',
  },
  presetBtnTextActive: {
    color: Colors.oxblood,
  },

  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(63,3,11,0.12)',
    borderRadius: Radius.md,
    backgroundColor: Colors.creamLite,
    paddingHorizontal: 14,
  },
  customPrefix: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    color: Colors.oxblood,
    marginRight: 6,
  },
  customInput: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    color: Colors.ink,
  },

  gstCard: {
    backgroundColor: 'rgba(63,3,11,0.04)',
    borderRadius: Radius.md,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
  },
  gstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gstTotalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(63,3,11,0.1)',
    paddingTop: 8,
    marginTop: 4,
  },
  gstLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(63,3,11,0.6)',
  },
  gstValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.ink,
    fontWeight: '600',
  },
  gstTotalLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  gstTotalValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.oxblood,
  },

  payBtn: {
    backgroundColor: Colors.oxblood,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnDisabled: {
    opacity: 0.45,
  },
  payBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
});
