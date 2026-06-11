import { Colors, FontFamily, Shadow } from '@/constants/brand';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Creator, MarketplaceCreatorCard, MarketplaceSkeletonCard } from './MarketplaceCreatorCard';

interface MarketplaceCreatorListProps {
  loading: boolean;
  creators: Creator[];
  bookmarked: Record<string, boolean>;
  onToggleBookmark: (id: string, name: string) => void;
  onInvite: (creator: Creator) => void;
}

export function MarketplaceCreatorList({ loading, creators, bookmarked, onToggleBookmark, onInvite }: MarketplaceCreatorListProps) {
  return (
    <>
      <Text style={styles.resultsText}>
        {loading ? 'Searching creators...' : `${creators.length} creators found`}
      </Text>

      <View style={styles.creatorList}>
        {loading ? (
          <>
            <MarketplaceSkeletonCard />
            <MarketplaceSkeletonCard />
            <MarketplaceSkeletonCard />
          </>
        ) : creators.length === 0 ? (
          <View style={styles.emptyCard}>
            <Image
              source={require('@/assets/images/empty_creators.png')}
              style={styles.emptyStateImage}
              contentFit="contain"
            />
            <Text style={styles.emptyStateText}>No creators found</Text>
            <Text style={styles.emptyStateSub}>
              We couldn't find any creators matching your search or filters. Try adjusting them.
            </Text>
          </View>
        ) : (
          creators.map((creator) => (
            <MarketplaceCreatorCard
              key={creator.id}
              creator={creator}
              isBookmarked={!!bookmarked[creator.id]}
              onToggleBookmark={onToggleBookmark}
              onInvite={onInvite}
            />
          ))
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  resultsText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.5)',
    marginBottom: 12,
  },
  creatorList: {
    gap: 14,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 4,
    ...Shadow.card,
    gap: 8,
  },
  emptyStateImage: {
    width: 140,
    height: 120,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: FontFamily.serif,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
  },
  emptyStateSub: {
    fontSize: 12.5,
    color: 'rgba(63, 3, 11, 0.5)',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
});
