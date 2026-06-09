import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { useUIStore } from '@/store/ui';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function PendingReviewsSection() {
  const showModal = useUIStore((s) => s.showModal);

  // Mock State for Review Submissions
  const [reviews, setReviews] = useState([
    { id: '1', name: 'Muskan', campaign: 'Summer Glow Serum', type: 'Reel', length: '28s', tone: 'ox' as const },
    { id: '2', name: 'Kai Rao', campaign: 'Heritage Chronograph', type: 'Post', length: 'carousel', tone: 'rose' as const },
    { id: '3', name: 'Léa Fontaine', campaign: 'Summer Glow Serum', type: 'Story', length: '3 frames', tone: 'ox' as const }
  ]);

  const handleAcceptReview = (name: string, id: string) => {
    showModal({
      title: 'Approve Deliverable',
      message: `Are you sure you want to approve the submission from ${name}? This will release the payout.`,
      actions: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Pay',
          onPress: () => {
            setReviews((prev) => prev.filter((r) => r.id !== id));
            showModal({
              title: 'Success',
              message: `Successfully approved and processed payment for ${name}!`,
            });
          }
        }
      ]
    });
  };

  const handleDeclineReview = (name: string, id: string) => {
    showModal({
      title: 'Request Revision',
      message: `Are you sure you want to decline this submission from ${name}? You can ask them to revise it.`,
      actions: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Revision',
          style: 'destructive',
          onPress: () => {
            setReviews((prev) => prev.filter((r) => r.id !== id));
            showModal({
              title: 'Declined',
              message: `Notified ${name} to request revisions.`,
            });
          }
        }
      ]
    });
  };

  if (reviews.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pending review</Text>
        <View style={styles.badgeCount}>
          <Text style={styles.badgeCountText}>{reviews.length}</Text>
        </View>
      </View>

      <View style={styles.reviewList}>
        {reviews.map((rev) => (
          <View key={rev.id} style={styles.reviewCard}>
            <PlaceholderImage tone={rev.tone} height={40} width={40} borderRadius={10} />
            <View style={styles.reviewContent}>
              <Text style={styles.reviewName}>{rev.name}</Text>
              <Text style={styles.reviewInfo} numberOfLines={1}>
                {rev.campaign} · {rev.type} · {rev.length}
              </Text>
            </View>
            <View style={styles.reviewActions}>
              <TouchableOpacity
                style={[styles.reviewActionBtn, styles.acceptBtn]}
                activeOpacity={0.8}
                onPress={() => handleAcceptReview(rev.name, rev.id)}
              >
                <Icon name="check" size={16} color={Colors.green} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reviewActionBtn, styles.declineBtn]}
                activeOpacity={0.8}
                onPress={() => handleDeclineReview(rev.name, rev.id)}
              >
                <Icon name="x" size={16} color={Colors.rose} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  badgeCount: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.roseDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  badgeCountText: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.white,
    fontWeight: '800',
  },
  reviewList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  reviewContent: {
    flex: 1,
  },
  reviewName: {
    fontFamily: FontFamily.sans,
    fontSize: 14.5,
    color: Colors.oxblood,
  },
  reviewInfo: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.5)',
    marginTop: 2,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  acceptBtn: {
    backgroundColor: 'rgba(42, 122, 90, 0.05)',
    borderColor: 'rgba(42, 122, 90, 0.2)',
  },
  declineBtn: {
    backgroundColor: 'rgba(180, 106, 116, 0.05)',
    borderColor: 'rgba(180, 106, 116, 0.2)',
  },
});
