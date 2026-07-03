import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';

const CONVERT_PACKAGES = [
  { pts: 10000, rupees: 100, label: 'Starter' },
  { pts: 50000, rupees: 500, label: 'Pro', highlight: true },
  { pts: 100000, rupees: 1000, label: 'Elite' },
];

export function WalletConvertPoints() {
  const showModal = useUIStore((s) => s.showModal);
  const queryClient = useQueryClient();
  const [convertingPkg, setConvertingPkg] = useState<number | null>(null);

  const { data: statsData } = useQuery<any>({
    queryKey: ['referralStats'],
    queryFn: () => api.referrals.getStats(),
  });

  const reachPoints: number = statsData?.reachPoints ?? 0;

  const convertMutation = useMutation({
    mutationFn: (points: number) => api.referrals.convertPoints(points),
    onSuccess: (data: any) => {
      showModal({
        title: 'Points Converted! 🎉',
        message: data.message || 'Successfully converted points to wallet balance.',
      });
      queryClient.invalidateQueries({ queryKey: ['referralStats'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
    },
    onError: (error: any) => {
      showModal({
        title: 'Conversion Failed',
        message: error.message || 'Failed to convert points. Please try again.',
      });
    },
    onSettled: () => setConvertingPkg(null),
  });

  const handleConvert = (pts: number) => {
    if (reachPoints < pts) {
      showModal({
        title: 'Insufficient Points',
        message: `You need at least ${pts.toLocaleString()} reach points to convert.`,
      });
      return;
    }
    setConvertingPkg(pts);
    convertMutation.mutate(pts);
  };

  if (reachPoints === 0 && !statsData) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Reach Points → Cash</Text>
        <View style={styles.pointsPill}>
          <Text style={styles.pointsPillText}>{reachPoints.toLocaleString()} pts</Text>
        </View>
      </View>
      <Text style={styles.sectionDesc}>
        Convert your referral points directly into wallet balance.
      </Text>
      <View style={styles.grid}>
        {CONVERT_PACKAGES.map((pkg) => {
          const isLoadingPkg = convertingPkg === pkg.pts;
          const canAfford = reachPoints >= pkg.pts;
          return (
            <TouchableOpacity
              key={pkg.pts}
              style={[
                styles.card,
                pkg.highlight && styles.cardHL,
                !canAfford && styles.cardDim,
              ]}
              onPress={() => handleConvert(pkg.pts)}
              activeOpacity={0.8}
              disabled={convertingPkg !== null}
            >
              {pkg.highlight && (
                <View style={styles.hlBadge}>
                  <Text style={styles.hlBadgeText}>POPULAR</Text>
                </View>
              )}
              {isLoadingPkg ? (
                <ActivityIndicator size="small" color={pkg.highlight ? '#fff' : Colors.oxblood} />
              ) : (
                <>
                  <Text style={[styles.cardPts, pkg.highlight && styles.cardPtsHL]}>
                    {(pkg.pts / 1000).toFixed(0)}k pts
                  </Text>
                  <Text style={[styles.cardArrow, pkg.highlight && styles.cardArrowHL]}>→</Text>
                  <Text style={[styles.cardRupees, pkg.highlight && styles.cardRupeesHL]}>
                    ₹{pkg.rupees}
                  </Text>
                  <Text style={[styles.cardLabel, pkg.highlight && styles.cardLabelHL]}>
                    {pkg.label}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  pointsPill: {
    backgroundColor: 'rgba(63,3,11,0.06)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pointsPillText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.roseDeep,
  },
  sectionDesc: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.45)',
    marginBottom: 12,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.06)',
    minHeight: 108,
    justifyContent: 'center',
    gap: 3,
    ...Shadow.card,
    overflow: 'hidden',
    position: 'relative',
  },
  cardHL: {
    backgroundColor: Colors.oxblood,
    borderColor: Colors.oxblood,
  },
  cardDim: { opacity: 0.45 },
  hlBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.gold,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: Radius.lg - 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  hlBadgeText: {
    fontFamily: FontFamily.sans,
    fontSize: 7,
    fontWeight: '800',
    color: '#1a0204',
    letterSpacing: 0.5,
  },
  cardPts: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(63,3,11,0.5)',
  },
  cardPtsHL: { color: 'rgba(232,216,204,0.6)' },
  cardArrow: {
    fontFamily: FontFamily.sans,
    fontSize: 16,
    color: Colors.roseDeep,
  },
  cardArrowHL: { color: 'rgba(232,216,204,0.4)' },
  cardRupees: {
    fontFamily: FontFamily.sans,
    fontSize: 22,
    fontWeight: '900',
    color: Colors.oxblood,
  },
  cardRupeesHL: { color: Colors.gold },
  cardLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 9.5,
    color: 'rgba(63,3,11,0.35)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardLabelHL: { color: 'rgba(232,216,204,0.4)' },
});
