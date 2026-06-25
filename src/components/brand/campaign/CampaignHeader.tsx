import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  bannerUrl?: string;
  priority?: string;
  category: string;
  title: string;
  brandName?: string;
}

export function CampaignHeader({ bannerUrl, priority, category, title, brandName }: Props) {
  const toneColor = priority === 'urgent' ? 'ox' : 'rose';
  const isUrgent = priority === 'urgent';

  return (
    <View style={styles.card}>
      {!bannerUrl ? (
        <PlaceholderImage tone={toneColor as any} height={150} borderRadius={16} />
      ) : (
        <Image source={{ uri: bannerUrl }} style={styles.bannerImage} />
      )}
      <View style={styles.headerMetaRow}>
        <View style={styles.badgeRow}>
          <View style={styles.activeBadge}>
            <Text style={styles.activeText}>ACTIVE</Text>
          </View>
          <View style={[styles.priorityBadge, isUrgent && styles.priorityBadgeUrgent]}>
            <Text style={[styles.priorityText, isUrgent && styles.priorityTextUrgent]}>
              {priority ? priority.toUpperCase() : 'NORMAL'}
            </Text>
          </View>
        </View>
        <Text style={styles.nicheLabel}>{category.toUpperCase()}</Text>
      </View>
      <Text style={styles.campaignTitleText}>{title}</Text>
      <Text style={styles.brandSubtitleText}>by {brandName || 'My Brand'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    ...Shadow.card,
  },
  bannerImage: {
    width: '100%',
    height: 150,
    borderRadius: 16,
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeBadge: {
    backgroundColor: 'rgba(42, 122, 90, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeText: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    color: Colors.green,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  priorityBadge: {
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  priorityBadgeUrgent: {
    backgroundColor: 'rgba(180, 106, 116, 0.12)',
  },
  priorityText: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    color: 'rgba(63, 3, 11, 0.6)',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  priorityTextUrgent: {
    color: Colors.roseDeep,
  },
  nicheLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 9.5,
    color: Colors.roseDeep,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  campaignTitleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.oxblood,
    marginTop: 4,
  },
  brandSubtitleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.rose,
    marginTop: 2,
  },
});
