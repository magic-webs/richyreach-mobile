import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Shadow } from '@/constants/brand';

interface PortfolioTabProps {
  infProfile: any;
}

export function PortfolioTab({ infProfile }: PortfolioTabProps) {
  if (!infProfile?.portfolio || infProfile.portfolio.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Image
          source={require('@/assets/images/empty_portfolio.png')}
          style={styles.emptyStateImage}
          contentFit="contain"
        />
        <Text style={styles.emptyStateText}>No portfolio items yet</Text>
        <Text style={styles.emptyStateSub}>
          Add sample videos or links to showcase your previous campaign works.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.portfolioGrid}>
      {infProfile.portfolio.map((p: any, k: number) => (
        <View key={k} style={styles.portfolioItem}>
          {p.mediaUrl ? (
            <Image
              source={{ uri: p.mediaUrl }}
              style={{ width: '100%', height: 110, borderRadius: 12 }}
              contentFit="cover"
            />
          ) : (
            <PlaceholderImage tone={p.tone || 'ox'} height={110} borderRadius={12} />
          )}
          <View style={styles.portfolioOverlay} />
          <View style={styles.portfolioMeta}>
            <Icon name="play" size={11} color={Colors.cream} />
            <Text style={styles.portfolioViews}>{p.views || '0'}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  portfolioItem: { width: '31.5%', position: 'relative', borderRadius: 12, overflow: 'hidden' },
  portfolioOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(42,2,7,0.2)' },
  portfolioMeta: { position: 'absolute', bottom: 7, left: 7, flexDirection: 'row', alignItems: 'center', gap: 3 },
  portfolioViews: { fontSize: 10.5, fontWeight: '700', color: Colors.cream },

  // Empty state styles
  emptyCard: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20, backgroundColor: '#fff', borderRadius: 20, marginTop: 14, ...Shadow.card, gap: 8 },
  emptyStateImage: { width: 140, height: 120, marginBottom: 8 },
  emptyStateText: { fontFamily: FontFamily.serif, fontSize: 16, fontWeight: '700', color: Colors.ink, textAlign: 'center' },
  emptyStateSub: { fontSize: 12.5, color: 'rgba(63,3,11,0.5)', textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },
});
