import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { TactileButton } from '@/components/ui/tactile-button';

const ARENA_TYPE_LABELS: Record<string, string> = {
  reel_reach: '🎬 Reel Reach Arena',
  google_review: '⭐ Google Review Arena',
};

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionCardTitle}>{title}</Text>
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
  const rewardPerReview = watch('rewardPerReview') || 2500;
  const businessName = watch('businessName');
  const googleMapsLink = watch('googleMapsLink');
  const reviewGuidelines = watch('reviewGuidelines');

  const winnerPool = Math.floor(totalBudgetCoins * 0.5);
  const participantPool = totalBudgetCoins - winnerPool;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Review & Launch</Text>
      <Text style={styles.subheading}>
        Review your arena configuration before launching. Budget coins will be deducted from your wallet.
      </Text>

      {/* Arena Type Badge */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeBadgeText}>{ARENA_TYPE_LABELS[arenaType] || arenaType}</Text>
      </View>

      {/* Basic Info */}
      <SectionCard title="📋 Arena Details">
        <ReviewRow label="Title" value={title || '—'} />
        <ReviewRow label="Description" value={description ? (description.length > 80 ? description.substring(0, 80) + '…' : description) : '—'} />
        <ReviewRow label="Category" value={category || '—'} />
        <ReviewRow label="Max Participants" value={String(maxParticipants)} />
        <ReviewRow label="Duration" value={startDate && endDate ? `${startDate} → ${endDate}` : '—'} />
      </SectionCard>

      {/* Coin Economy */}
      <SectionCard title="💰 Coin Economy">
        <ReviewRow label="Prize Pool" value={`${totalBudgetCoins.toLocaleString()} 🪙 = ₹${(totalBudgetCoins / 100).toLocaleString('en-IN')}`} />
        <ReviewRow label="Entry Fee" value={`${entryFeeCoins.toLocaleString()} 🪙 = ₹${(entryFeeCoins / 100).toLocaleString('en-IN')} per influencer`} />
        {arenaType !== 'google_review' ? (
          <>
            <ReviewRow label="Winner Prize (50%)" value={`${winnerPool.toLocaleString()} 🪙 = ₹${(winnerPool / 100).toLocaleString('en-IN')}`} />
            <ReviewRow label="Participant Pool (50%)" value={`${participantPool.toLocaleString()} 🪙 split by reach`} />
          </>
        ) : (
          <ReviewRow label="Per Verified Review" value={`${rewardPerReview.toLocaleString()} 🪙 = ₹${(rewardPerReview / 100).toLocaleString('en-IN')}`} />
        )}
      </SectionCard>

      {/* Google Review Info */}
      {arenaType === 'google_review' && (
        <SectionCard title="📍 Business Info">
          <ReviewRow label="Business" value={businessName || '—'} />
          <ReviewRow label="Maps Link" value={googleMapsLink ? '✅ Set' : '❌ Missing'} />
          <ReviewRow label="Guidelines" value={reviewGuidelines ? '✅ Set' : '—'} />
        </SectionCard>
      )}

      {/* Wallet Deduction Warning */}
      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>⚠️ Wallet Deduction</Text>
        <Text style={styles.warningText}>
          Launching this arena will immediately deduct{' '}
          <Text style={{ fontWeight: '800' }}>{totalBudgetCoins.toLocaleString()} coins (₹{(totalBudgetCoins / 100).toLocaleString('en-IN')})</Text>
          {' '}from your RichyReach coin wallet as the prize pool.
        </Text>
      </View>

      {/* Launch CTA */}
      <TactileButton
        onPress={onPublish}
        text={isLoading ? 'Launching Arena...' : `🏟️ Launch Arena · ${totalBudgetCoins.toLocaleString()} 🪙`}
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
  sectionCardTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.oxblood,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(63,3,11,0.07)',
    paddingBottom: 8,
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
