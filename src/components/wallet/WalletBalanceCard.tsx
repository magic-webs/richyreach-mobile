import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';

// Lucide icons
import { Wallet, PlusCircle, Send } from 'lucide-react-native';

interface WalletBalanceCardProps {
  coinBalance: number;
  rupeeValue: number;
  onOpenWithdraw: () => void;
  onOpenBuyCoins: () => void;
}

export function WalletBalanceCard({ coinBalance, rupeeValue, onOpenWithdraw, onOpenBuyCoins }: WalletBalanceCardProps) {
  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={['#2c0408', '#4d0d16', '#140103']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceCard}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.balanceLabel}>RICHYREACH BALANCE</Text>
          <Wallet size={18} color="rgba(232,216,204,0.5)" />
        </View>

        <View style={styles.balanceRow}>
          <Text style={styles.balanceValue}>{coinBalance.toLocaleString()}</Text>
          <Text style={styles.coinBadge}>🪙 Coins</Text>
        </View>

        <View style={styles.conversionRow}>
          <Text style={styles.rupeeEquiv}>≈ ₹{rupeeValue.toLocaleString('en-IN')}</Text>
          <Text style={styles.rateNote}>100 Coins = ₹1</Text>
        </View>

        <View style={styles.divider} />

        {/* Quick Actions */}
        <View style={styles.balanceActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onOpenBuyCoins}
            activeOpacity={0.8}
          >
            <View style={styles.btnRow}>
              <PlusCircle size={15} color={Colors.cream} />
              <Text style={styles.actionBtnText}>Add Coins</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onOpenWithdraw}
            activeOpacity={0.8}
          >
            <View style={styles.btnRow}>
              <Send size={14} color={Colors.cream} />
              <Text style={styles.actionBtnText}>Withdraw</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    ...Shadow.card,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 10,
    color: 'rgba(232,216,204,0.5)',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  balanceValue: {
    fontFamily: FontFamily.sans,
    fontSize: 44,
    fontWeight: '900',
    color: '#fff',
  },
  coinBadge: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.gold,
    fontWeight: '700',
  },
  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rupeeEquiv: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    color: 'rgba(232,216,204,0.85)',
    fontWeight: '600',
  },
  rateNote: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(232,216,204,0.4)',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(232,216,204,0.15)',
    marginVertical: 12,
  },
  balanceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: Radius.full,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.cream,
  },
});
