import { FontFamily } from '@/constants/brand';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
});
