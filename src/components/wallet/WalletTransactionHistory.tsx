import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';

// Lucide icons
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Gamepad2,
  Trophy,
  Undo2,
  Briefcase,
  CreditCard,
  Send,
  Star,
  Users,
  Download,
} from 'lucide-react-native';

const TX_TYPE_DETAILS: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  arena_entry: { label: 'Arena Entry', icon: <Gamepad2 size={15} color="#eb5e55" />, bg: 'rgba(235, 94, 85, 0.08)', color: '#eb5e55' },
  arena_reward: { label: 'Arena Reward', icon: <Trophy size={15} color="#2ecc71" />, bg: 'rgba(46, 204, 113, 0.08)', color: '#2ecc71' },
  arena_refund: { label: 'Arena Refund', icon: <Undo2 size={15} color="#3498db" />, bg: 'rgba(52, 152, 219, 0.08)', color: '#3498db' },
  arena_budget: { label: 'Arena Funding', icon: <Briefcase size={15} color="#9b59b6" />, bg: 'rgba(155, 89, 182, 0.08)', color: '#9b59b6' },
  coin_purchase: { label: 'Bought Coins', icon: <CreditCard size={15} color="#f1c40f" />, bg: 'rgba(241, 196, 15, 0.08)', color: '#f1c40f' },
  coin_withdrawal: { label: 'Withdrawal', icon: <Send size={15} color="#7f8c8d" />, bg: 'rgba(127, 140, 141, 0.08)', color: '#7f8c8d' },
  review_reward: { label: 'Review Reward', icon: <Star size={15} color="#f1c40f" />, bg: 'rgba(241, 196, 15, 0.08)', color: '#f1c40f' },
  referral: { label: 'Referral Bonus', icon: <Users size={15} color="#2ecc71" />, bg: 'rgba(46, 204, 113, 0.08)', color: '#2ecc71' },
  deposit: { label: 'Refund/Deposit', icon: <Download size={15} color="#2ecc71" />, bg: 'rgba(46, 204, 113, 0.08)', color: '#2ecc71' },
  brand_campaign_refund: { label: 'Campaign Refund', icon: <Undo2 size={15} color="#3498db" />, bg: 'rgba(52, 152, 219, 0.08)', color: '#3498db' },
  brand_campaign_spend: { label: 'Campaign Spend', icon: <Briefcase size={15} color="#eb5e55" />, bg: 'rgba(235, 94, 85, 0.08)', color: '#eb5e55' },
};

function TransactionRow({ tx }: { tx: any }) {
  const isCredit = tx.type === 'credit';
  const details = TX_TYPE_DETAILS[tx.transactionType] || {
    label: tx.description || tx.transactionType,
    icon: isCredit ? <ArrowDownRight size={15} color="#2ecc71" /> : <ArrowUpRight size={15} color="#eb5e55" />,
    bg: isCredit ? 'rgba(46, 204, 113, 0.08)' : 'rgba(235, 94, 85, 0.08)',
    color: isCredit ? '#2ecc71' : '#eb5e55',
  };

  return (
    <View style={styles.txRow}>
      <View style={[styles.txIconContainer, { backgroundColor: details.bg }]}>
        {details.icon}
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txDesc} numberOfLines={1}>
          {tx.description || details.label}
        </Text>
        <Text style={styles.txDate}>
          {new Date(tx.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </View>
      <View style={styles.txAmountCol}>
        <Text style={[styles.txAmount, { color: isCredit ? Colors.green : Colors.roseDeep }]}>
          {isCredit ? '+' : '-'}{tx.amount.toLocaleString()} 🪙
        </Text>
        <Text style={styles.txRupee}>
          ₹{(tx.amount / 100).toLocaleString('en-IN')}
        </Text>
      </View>
    </View>
  );
}

interface WalletTransactionHistoryProps {
  transactions: any[];
}

export function WalletTransactionHistory({ transactions }: WalletTransactionHistoryProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Activity size={18} color={Colors.oxblood} />
        <Text style={styles.sectionTitle}>Transaction Activity</Text>
      </View>
      {transactions.length === 0 ? (
        <View style={styles.emptyTx}>
          <Activity size={24} color="rgba(63,3,11,0.15)" style={{ marginBottom: 6 }} />
          <Text style={styles.emptyTxText}>No transactions logged yet.</Text>
        </View>
      ) : (
        <View style={styles.txList}>
          {transactions.map((tx: any) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  txList: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.05)',
    ...Shadow.card,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.05)',
    gap: 12,
  },
  txIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
  },
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
    marginTop: 1,
  },
  txAmountCol: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '800',
  },
  txRupee: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10.5,
    color: 'rgba(63,3,11,0.4)',
  },
  emptyTx: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.05)',
  },
  emptyTxText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13.5,
    color: 'rgba(63,3,11,0.35)',
  },
});
