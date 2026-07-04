import LottieView from 'lottie-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Shadow } from '@/constants/brand';

interface ReviewsTabProps {
  infProfile: any;
}

export function ReviewsTab({ infProfile }: ReviewsTabProps) {
  if (!infProfile?.reviews || infProfile.reviews.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <LottieView
          source={require('@/assets/lottie-animation/empty-ghost.json')}
          autoPlay
          loop
          style={{ width: 140, height: 140, marginBottom: 8 }}
        />
        <Text style={styles.emptyStateText}>No reviews yet</Text>
        <Text style={styles.emptyStateSub}>
          When you complete collaborations with brands, their reviews and ratings will show up here.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12, marginTop: 14 }}>
      {infProfile.reviews.map(([brand, review, stars]: any, k: number) => (
        <View key={k} style={styles.reviewCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <PlaceholderImage tone="ox" height={36} width={36} borderRadius={99} />
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewBrand}>{brand}</Text>
              <View style={{ flexDirection: 'row', gap: 1 }}>
                {Array.from({ length: stars }).map((_, i) => (
                  <Icon key={i} name="star" size={12} color={Colors.rose} />
                ))}
              </View>
            </View>
          </View>
          <Text style={styles.reviewText}>{review}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  reviewCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, ...Shadow.card },
  reviewBrand: { fontWeight: '700', fontSize: 14, color: Colors.ink },
  reviewText: { fontSize: 13.5, lineHeight: 20, color: 'rgba(42,2,7,0.72)' },

  // Empty state styles
  emptyCard: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20, backgroundColor: '#fff', borderRadius: 20, marginTop: 14, ...Shadow.card, gap: 8 },
  emptyStateImage: { width: 140, height: 120, marginBottom: 8 },
  emptyStateText: { fontFamily: FontFamily.serif, fontSize: 16, fontWeight: '700', color: Colors.ink, textAlign: 'center' },
  emptyStateSub: { fontSize: 12.5, color: 'rgba(63,3,11,0.5)', textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },
});
