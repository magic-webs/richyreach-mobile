import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { playSound } from '@/lib/sound';

const COIN_PACKAGES = [
  { coins: 2000, rupees: 20, label: 'Starter', tag: null },
  { coins: 10000, rupees: 100, label: 'Basic', tag: null },
  { coins: 50000, rupees: 500, label: 'Pro', tag: 'Popular' },
  { coins: 100000, rupees: 1000, label: 'Elite', tag: null },
  { coins: 500000, rupees: 5000, label: 'Premium', tag: 'Best Value' },
];

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

function buildRazorpayCheckoutUrl(order: any): string {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://backend-api.richyreach.com/api';
  const params = new URLSearchParams({
    key_id: order.key_id ?? '',
    order_id: order.id ?? '',
    amount: String(order.amount ?? ''),
    currency: 'INR',
    name: 'RichyReach',
    description: 'Wallet Top-up',
    theme_color: '#3f030b',
    scheme: 'richyreachmobile',
    redirect_path: 'wallet',
  });
  return `${apiBaseUrl}/payments/razorpay-checkout?${params.toString()}`;
}

interface BuyCoinsSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function BuyCoinsSheet({ visible, onClose }: BuyCoinsSheetProps) {
  const showModal = useUIStore((s) => s.showModal);
  const queryClient = useQueryClient();
  const [selectedPackage, setSelectedPackage] = useState<typeof COIN_PACKAGES[0] | null>(null);

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: typeof COIN_PACKAGES[0]) => {
      setSelectedPackage(pkg);
      const order = await api.wallet.createOrder(pkg.coins);

      if (order.id?.startsWith('order_mock_')) {
        return api.wallet.verifyPayment({
          razorpay_order_id: order.id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_sig',
          coins: pkg.coins,
        });
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
            description: 'Wallet Top-up',
            order_id: order.id ?? '',
            handler: async (response: any) => {
              try {
                const res = await api.wallet.verifyPayment({
                  razorpay_order_id: order.id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  coins: pkg.coins,
                });
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
              color: '#3f030b',
            },
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        });
      } else {
        const checkoutUrl = buildRazorpayCheckoutUrl(order);
        const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, 'richyreachmobile://wallet');

        if (result.type !== 'success' || !result.url) {
          throw new Error('Payment cancelled or failed');
        }

        const params = new URLSearchParams(result.url.split('?')[1] ?? '');
        const razorpay_payment_id = params.get('razorpay_payment_id') ?? '';
        const razorpay_signature = params.get('razorpay_signature') ?? '';

        return api.wallet.verifyPayment({
          razorpay_order_id: order.id,
          razorpay_payment_id,
          razorpay_signature,
          coins: pkg.coins,
        });
      }
    },
    onSuccess: (data, pkg) => {
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      playSound('coinCredit');
      showModal({
        title: '🎉 Coins Added!',
        message: `${pkg.coins.toLocaleString()} coins (₹${pkg.rupees}) successfully added to your wallet.`,
      });
      setSelectedPackage(null);
      onClose();
    },
    onError: (err: any) => {
      setSelectedPackage(null);
      if (!err.message.includes('Razorpay not integrated')) {
        showModal({ title: 'Purchase Failed', message: err.message });
      }
    },
  });

  return (
    <BottomSheet
      visible={visible}
      title="Add Coins"
      icon="wallet"
      onClose={onClose}
      snapPoints={['55%', '85%']}
    >
      <View style={styles.container}>
        <Text style={styles.subtitle}>Select a package to top up your wallet balance instantly.</Text>
        <View style={styles.packagesGrid}>
          {COIN_PACKAGES.map((pkg) => {
            const isSelected = selectedPackage?.coins === pkg.coins;
            const isPending = purchaseMutation.isPending && isSelected;
            return (
              <TouchableOpacity
                key={pkg.coins}
                style={[styles.packageCard, isSelected && styles.packageCardSelected]}
                onPress={() => purchaseMutation.mutate(pkg)}
                activeOpacity={0.85}
                disabled={purchaseMutation.isPending}
              >
                {pkg.tag && (
                  <View style={styles.packageTag}>
                    <Text style={styles.packageTagText}>{pkg.tag.toUpperCase()}</Text>
                  </View>
                )}
                {isPending ? (
                  <View style={styles.loadingPkg}>
                    <ActivityIndicator size="small" color={Colors.oxblood} />
                  </View>
                ) : (
                  <>
                    <Text style={styles.packageCoins}>{pkg.coins.toLocaleString()}</Text>
                    <Text style={styles.packageCoinLabel}>🪙 COINS</Text>
                    <View style={styles.pkgPriceBadge}>
                      <Text style={styles.packageRupee}>₹{pkg.rupees}</Text>
                    </View>
                    <Text style={styles.packageLabel}>{pkg.label}</Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  subtitle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(63,3,11,0.5)',
    marginBottom: 20,
    lineHeight: 18,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  packageCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.06)',
    gap: 4,
    ...Shadow.card,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 110,
    justifyContent: 'center',
    marginBottom: 8,
  },
  packageCardSelected: {
    borderColor: Colors.oxblood,
    backgroundColor: 'rgba(63,3,11,0.02)',
  },
  loadingPkg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.rose,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  packageTagText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 8,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  packageCoins: {
    fontFamily: FontFamily.sans,
    fontSize: 24,
    fontWeight: '900',
    color: Colors.oxblood,
  },
  packageCoinLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9,
    color: 'rgba(63,3,11,0.4)',
    letterSpacing: 0.5,
  },
  pkgPriceBadge: {
    backgroundColor: 'rgba(180, 106, 116, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  packageRupee: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.roseDeep,
  },
  packageLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10.5,
    color: 'rgba(63,3,11,0.35)',
    marginTop: 2,
  },
});
