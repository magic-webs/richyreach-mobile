import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { TactileButton } from '@/components/ui/tactile-button';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  AlertCircleIcon,
  Coins01Icon,
  Film01Icon,
  ListViewIcon,
  Location01Icon,
  StarIcon,
} from '@hugeicons/core-free-icons';

const ARENA_TYPE_LABELS: Record<string, string> = {
  reel_reach: 'Reel Reach Arena',
  google_review: 'Google Review Arena',
};

const ARENA_TYPE_ICONS: Record<string, any> = {
  reel_reach: Film01Icon,
  google_review: StarIcon,
};

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function SectionCard({ icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionCardTitleRow}>
        <HugeiconsIcon icon={icon} size={14} color={Colors.oxblood} strokeWidth={2} />
        <Text style={styles.sectionCardTitleText}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

interface ArenaStepReviewProps {
  onPublish: () => void;
  isLoading?: boolean;
}

export function ArenaStepReview({ onPublish, isLoading }: ArenaStepReviewProps) {
  const { watch } = useFormContext();

  const arenaType = watch('arenaType') as string;
  const title = watch('title');
  const description = watch('description');
  const category = watch('category');
  const maxParticipants = watch('maxParticipants');
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const totalBudgetCoins = watch('totalBudgetCoins') || 0;
  const entryFeeCoins = watch('entryFeeCoins') || 2000;
  const businessName = watch('businessName');
  const googleMapsLink = watch('googleMapsLink');

  const arenaIcon = ARENA_TYPE_ICONS[arenaType] || Film01Icon;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Review & Launch</Text>
      <Text style={styles.subheading}>
        Review your arena configuration before launching. Budget coins will be deducted from your wallet.
      </Text>

      {/* Arena Type Badge */}
      <View style={styles.typeBadge}>
        <HugeiconsIcon icon={arenaIcon} size={14} color={Colors.cream} strokeWidth={2} />
        <Text style={styles.typeBadgeText}>{ARENA_TYPE_LABELS[arenaType] || arenaType}</Text>
      </View>

      {/* Basic Info */}
      <SectionCard icon={ListViewIcon} title="Arena Details">
        <ReviewRow label="Title" value={title || '—'} />
        <ReviewRow label="Description" value={description ? (description.length > 80 ? description.substring(0, 80) + '…' : description) : '—'} />
        <ReviewRow label="Category" value={category || '—'} />
        <ReviewRow label="Max Participants" value={String(maxParticipants)} />
        <ReviewRow label="Duration" value={startDate && endDate ? `${startDate} → ${endDate}` : '—'} />
      </SectionCard>

      {/* Coin Economy */}
      <SectionCard icon={Coins01Icon} title="Coin Economy">
        <ReviewRow label="Prize Pool" value={`${totalBudgetCoins.toLocaleString()} 🪙 = ₹${(totalBudgetCoins / 100).toLocaleString('en-IN')}`} />
        <ReviewRow label="Entry Fee" value={`${entryFeeCoins.toLocaleString()} 🪙 = ₹${(entryFeeCoins / 100).toLocaleString('en-IN')} per influencer`} />
      </SectionCard>

      {/* Google Review Info */}
      {arenaType === 'google_review' && (
        <SectionCard icon={Location01Icon} title="Business Info">
          <ReviewRow label="Business" value={businessName || '—'} />
          <ReviewRow label="Maps Link" value={googleMapsLink ? '✅ Set' : '❌ Missing'} />
        </SectionCard>
      )}

      {/* Wallet Deduction Warning */}
      <View style={styles.warningBox}>
        <View style={styles.warningTitleRow}>
          <HugeiconsIcon icon={AlertCircleIcon} size={14} color="#7a5a00" strokeWidth={2} />
          <Text style={styles.warningTitle}>Wallet Deduction</Text>
        </View>
        <Text style={styles.warningText}>
          Launching this arena will immediately deduct{' '}
          <Text style={{ fontWeight: '800' }}>{totalBudgetCoins.toLocaleString()} coins (₹{(totalBudgetCoins / 100).toLocaleString('en-IN')})</Text>
          {' '}from your RichyReach coin wallet as the prize pool.
        </Text>
      </View>

      {/* Launch CTA */}
      <TactileButton
        onPress={onPublish}
        text={isLoading ? 'Launching Arena...' : `Launch Arena · ${totalBudgetCoins.toLocaleString()} 🪙`}
        variant="primary"
        fullWidth
        style={{ marginTop: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  heading: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  subheading: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13.5,
    color: 'rgba(63,3,11,0.55)',
    lineHeight: 20,
    marginTop: -4,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.oxblood,
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.cream,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.07)',
    ...Shadow.card,
  },
  sectionCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(63,3,11,0.07)',
    paddingBottom: 8,
  },
  sectionCardTitleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  reviewLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.5)',
    width: 110,
    flexShrink: 0,
  },
  reviewValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.ink,
    flex: 1,
    textAlign: 'right',
  },
  warningBox: {
    backgroundColor: 'rgba(243,201,105,0.15)',
    borderRadius: Radius.md,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(243,201,105,0.5)',
  },
  warningTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  warningTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: '#7a5a00',
  },
  warningText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(100,75,0,0.85)',
    lineHeight: 18,
  },
});
