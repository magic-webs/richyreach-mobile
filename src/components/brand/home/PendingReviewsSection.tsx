import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { useUIStore } from '@/store/ui';
import { useProfilesStore } from '@/store/profiles';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';

export function PendingReviewsSection() {
  const router = useRouter();
  const showModal = useUIStore((s) => s.showModal);
  const activeProfileId = useProfilesStore((s) => s.activeProfileId);
  const queryClient = useQueryClient();

  // Query actual campaign applications with status = 'pending'
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['brandPendingApplications', activeProfileId],
    queryFn: () => api.brands.applications('pending').catch(() => []),
    enabled: !!activeProfileId,
  });

  const handleAcceptReview = (name: string, id: string, influencerId: string, campaignId: string, avatar?: string) => {
    showModal({
      title: 'Accept Application',
      message: `Are you sure you want to accept the application from ${name}? This will open a chat room.`,
      actions: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept & Chat',
          onPress: async () => {
            try {
              const room = await api.chat.createRoom(influencerId, campaignId);
              // Invalidate query
              queryClient.invalidateQueries({ queryKey: ['brandPendingApplications', activeProfileId] });
              // Navigate to brand chat room
              router.push({
                pathname: '/brand/chat/[id]' as any,
                params: { id: room.id, name, avatar: avatar || '' }
              });
            } catch (err: any) {
              console.error("Failed to accept application", err);
              showModal({
                title: 'Error',
                message: err.message || 'Failed to accept application',
              });
            }
          }
        }
      ]
    });
  };

  const handleDeclineReview = (name: string, id: string) => {
    showModal({
      title: 'Decline Application',
      message: `Are you sure you want to decline the application from ${name}?`,
      actions: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.brands.rejectApplication(id);
              queryClient.invalidateQueries({ queryKey: ['brandPendingApplications', activeProfileId] });
              showModal({
                title: 'Declined',
                message: `Successfully declined ${name}'s application.`,
              });
            } catch (err: any) {
              console.error("Failed to decline application", err);
              showModal({
                title: 'Error',
                message: err.message || 'Failed to decline application',
              });
            }
          }
        }
      ]
    });
  };

  if (isLoading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending review</Text>
        <ActivityIndicator style={{ marginTop: 12 }} size="small" color={Colors.rose} />
      </View>
    );
  }

  if (applications.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pending review</Text>
        <View style={styles.badgeCount}>
          <Text style={styles.badgeCountText}>{applications.length}</Text>
        </View>
      </View>

      <View style={styles.reviewList}>
        {applications.map((rev) => (
          <View key={rev.id} style={styles.reviewCard}>
            {rev.avatar ? (
              <Image source={{ uri: rev.avatar }} style={styles.reviewAvatar} />
            ) : (
              <PlaceholderImage tone="rose" height={40} width={40} borderRadius={10} />
            )}
            <View style={styles.reviewContent}>
              <Text style={styles.reviewName}>{rev.name || `@${rev.instagramHandle}`}</Text>
              <Text style={styles.reviewInfo} numberOfLines={1}>
                {rev.campaignTitle} · {rev.campaignType} · "{rev.proposal}"
              </Text>
            </View>
            <View style={styles.reviewActions}>
              <TouchableOpacity
                style={[styles.reviewActionBtn, styles.acceptBtn]}
                activeOpacity={0.8}
                onPress={() => handleAcceptReview(rev.name || `@${rev.instagramHandle}`, rev.id, rev.influencerId, rev.campaignId, rev.avatar)}
              >
                <Icon name="check" size={16} color={Colors.green} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reviewActionBtn, styles.declineBtn]}
                activeOpacity={0.8}
                onPress={() => handleDeclineReview(rev.name || `@${rev.instagramHandle}`, rev.id)}
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
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
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
