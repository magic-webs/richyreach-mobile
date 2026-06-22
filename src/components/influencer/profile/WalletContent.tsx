import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GradientView } from '@/components/ui/gradient-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, FontFamily, Shadow } from '@/constants/brand';

interface WalletContentProps {
  dashboard: any;
  earnings: any[];
  loadingDashboard: boolean;
  loadingEarnings: boolean;
}

export function WalletContent({ dashboard, earnings, loadingDashboard, loadingEarnings }: WalletContentProps) {
  const pendingEarnings = earnings
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const clearedEarnings = earnings
    .filter((t) => t.status === 'cleared')
    .reduce((sum, t) => sum + t.amount, 0);

  const displayPending = `₹${(pendingEarnings / 100).toLocaleString()}`;
  const displayAvailable = `₹${(clearedEarnings / 100).toLocaleString()}`;
  const displayTotal = `₹${((pendingEarnings + clearedEarnings) / 100).toLocaleString()}`;

  if (loadingDashboard || loadingEarnings) {
    return (
      <View style={{ gap: 14 }}>
        <Skeleton width="100%" height={160} borderRadius={22} />
        <Skeleton width="40%" height={18} borderRadius={4} style={{ marginTop: 8 }} />
        <Skeleton width="100%" height={60} borderRadius={16} />
        <Skeleton width="100%" height={60} borderRadius={16} />
      </View>
    );
  }

  return (
    <View style={{ gap: 14 }}>
      <GradientView variant="oxblood" style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total earned</Text>
        <Text style={styles.balanceAmount}>{displayTotal}</Text>
        <View style={styles.balanceRow}>
          <View style={styles.miniCard}>
            <Text style={styles.miniLabel}>Pending</Text>
            <Text style={styles.miniValue}>{displayPending}</Text>
          </View>
          <View style={styles.miniCard}>
            <Text style={styles.miniLabel}>Available</Text>
            <Text style={[styles.miniValue, { color: '#5fd39b' }]}>{displayAvailable}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.withdrawBtn, clearedEarnings <= 0 && { opacity: 0.5 }]}
          activeOpacity={0.85}
          disabled={clearedEarnings <= 0}
        >
          <Text style={styles.withdrawText}>
            {clearedEarnings > 0 ? `Withdraw ${displayAvailable}` : 'No funds available'}
          </Text>
        </TouchableOpacity>
      </GradientView>
      <View>
        <Text style={styles.txnTitle}>Recent transactions</Text>
        {earnings.length === 0 ? (
          <View style={{ paddingVertical: 24, alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, ...Shadow.card }}>
            <Text style={{ fontSize: 13, color: 'rgba(63,3,11,0.4)', fontFamily: FontFamily.sansMedium }}>No transactions yet</Text>
          </View>
        ) : (
          <View style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', ...Shadow.card }}>
            {earnings.map((t, k) => {
              const rupeeAmount = t.amount / 100;
              const formattedAmt = `${t.status === 'cleared' ? '+' : ''}₹${rupeeAmount.toLocaleString()}`;
              return (
                <View key={t.id || k} style={[styles.txnRow, k < earnings.length - 1 && styles.txnBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txnBrand}>{t.source || 'Collaboration Payout'}</Text>
                    <Text style={styles.txnDate}>
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'} · {t.status}
                    </Text>
                  </View>
                  <Text style={[styles.txnAmount, { color: t.status === 'cleared' ? '#2a7a5a' : Colors.rose }]}>
                    {formattedAmt}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    borderRadius: 22,
    padding: 20
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.roseSoft,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  balanceAmount: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 38,
    fontWeight: '700',
    color: Colors.cream,
    marginTop: 6
  },
  balanceRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14
  },
  miniCard: {
    flex: 1,
    backgroundColor: 'rgba(232,216,204,0.1)',
    borderRadius: 12,
    padding: 10
  },
  miniLabel: {
    fontSize: 10.5,
    color: 'rgba(232,216,204,0.6)',
    fontWeight: '600'
  },
  miniValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.cream, marginTop: 3
  },
  withdrawBtn: {
    marginTop: 14,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center'
  },
  withdrawText: {
    fontFamily: FontFamily.sans,
    fontWeight: '800',
    fontSize: 14,
    color: Colors.oxblood
  },
  txnTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.ink, marginBottom: 12
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  txnBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.07)'
  },
  txnBrand: {
    fontWeight: '600',
    fontSize: 14,
    color: Colors.ink
  },
  txnDate: {
    fontSize: 11.5,
    color: 'rgba(63,3,11,0.45)',
    marginTop: 1
  },
  txnAmount: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700'
  },
});
