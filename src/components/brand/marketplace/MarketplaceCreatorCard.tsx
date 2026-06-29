import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Image } from 'expo-image';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface Creator {
  id: string;
  name: string;
  handle: string;
  followers: string;
  engagement: string;
  collabs: number;
  rating: string;
  rate: string;
  niche: string[];
  tone: 'rose' | 'ox';
}

interface MarketplaceCreatorCardProps {
  creator: Creator;
  isBookmarked: boolean;
  onToggleBookmark: (id: string, name: string) => void;
  onInvite: (creator: Creator) => void;
}

export function MarketplaceCreatorCard({ creator, isBookmarked, onToggleBookmark, onInvite }: MarketplaceCreatorCardProps) {
  return (
    <View style={styles.creatorCard}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: (creator as any).avatar || 'https://pub-c7a89526fe7541b0a1d6bc2d831710d2.r2.dev/plaform-images/avatar.png' }}
          style={{ width: 44, height: 44, borderRadius: 22 }}
          contentFit="cover"
        />
        <View style={styles.cardInfo}>
          <Text style={styles.creatorName}>{creator.name}</Text>
          <Text style={styles.creatorHandle}>{creator.handle}</Text>
        </View>
        <View style={styles.rateInfo}>
          <Text style={styles.rateVal}>{creator.rate}</Text>
          <Text style={styles.rateLabel}>per post</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <Text style={styles.statValue}>{creator.followers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={[styles.statValue, { color: Colors.green }]}>{creator.engagement}</Text>
          <Text style={styles.statLabel}>Engagement</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statValue}>{creator.collabs}</Text>
          <Text style={styles.statLabel}>Collabs</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statValue}>{creator.rating}★</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Tags and Actions */}
      <View style={styles.cardFooter}>
        <View style={styles.tagsContainer}>
          {creator.niche.map((tag) => (
            <View key={tag} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.bookmarkBtn, isBookmarked && styles.bookmarkedActive]}
            activeOpacity={0.8}
            onPress={() => onToggleBookmark(creator.id, creator.name)}
          >
            <Icon
              name="bookmark"
              size={16}
              color={isBookmarked ? Colors.cream : Colors.oxblood}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.inviteBtn}
            activeOpacity={0.85}
            onPress={() => onInvite(creator)}
          >
            <Text style={styles.inviteBtnText}>Invite {'->'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export function MarketplaceSkeletonCard() {
  return (
    <View style={styles.creatorCard}>
      <View style={styles.cardHeader}>
        <Skeleton variant="circle" width={44} height={44} />
        <View style={[styles.cardInfo, { marginLeft: 12 }]}>
          <Skeleton variant="text" width={100} />
          <Skeleton variant="text" width={70} style={{ marginTop: 4 }} />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Skeleton variant="text" width={60} height={16} />
          <Skeleton variant="text" width={40} style={{ marginTop: 4 }} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCell}><Skeleton variant="text" width={40} /><Skeleton variant="text" width={50} style={{ marginTop: 4 }} /></View>
        <View style={styles.statCell}><Skeleton variant="text" width={40} /><Skeleton variant="text" width={50} style={{ marginTop: 4 }} /></View>
        <View style={styles.statCell}><Skeleton variant="text" width={30} /><Skeleton variant="text" width={50} style={{ marginTop: 4 }} /></View>
        <View style={styles.statCell}><Skeleton variant="text" width={30} /><Skeleton variant="text" width={50} style={{ marginTop: 4 }} /></View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.tagsContainer}>
          <Skeleton variant="rect" width={60} height={24} borderRadius={4} />
          <Skeleton variant="rect" width={50} height={24} borderRadius={4} />
        </View>
        <View style={styles.actionsContainer}>
          <Skeleton variant="rect" width={36} height={36} borderRadius={10} />
          <Skeleton variant="rect" width={80} height={36} borderRadius={18} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  creatorCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardInfo: {
    flex: 1,
  },
  creatorName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  creatorHandle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: 'rgba(63, 3, 11, 0.45)',
    marginTop: 1,
  },
  rateInfo: {
    alignItems: 'flex-end',
  },
  rateVal: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  rateLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9.5,
    color: 'rgba(63, 3, 11, 0.45)',
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderRadius: Radius.md,
    paddingVertical: 10,
    marginTop: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14.5,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9.5,
    color: 'rgba(63, 3, 11, 0.45)',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  tagPill: {
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: Colors.oxblood,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  bookmarkBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(63, 3, 11, 0.14)',
  },
  bookmarkedActive: {
    backgroundColor: Colors.roseDeep,
    borderColor: Colors.roseDeep,
  },
  inviteBtn: {
    backgroundColor: Colors.oxblood,
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.cream,
  },
});
