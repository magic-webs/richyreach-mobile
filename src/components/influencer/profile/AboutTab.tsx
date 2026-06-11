import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Chip } from '@/components/ui/chip';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, FontFamily, Shadow } from '@/constants/brand';

interface AboutTabProps {
  infProfile: any;
  loadingProfile: boolean;
  displayNiches: string[];
}

export function AboutTab({ infProfile, loadingProfile, displayNiches }: AboutTabProps) {
  return (
    <View style={{ gap: 18, marginTop: 16 }}>
      <View>
        <Text style={styles.aboutLabel}>Niches</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {loadingProfile ? (
            <Skeleton width={80} height={26} borderRadius={12} />
          ) : displayNiches.length === 0 ? (
            <Text style={styles.noNichesText}>No niches listed</Text>
          ) : (
            displayNiches.map((n) => <Chip key={n}>{n}</Chip>)
          )}
        </View>
      </View>
      <View>
        <Text style={styles.aboutLabel}>Audience</Text>
        <View style={styles.audienceCard}>
          {loadingProfile ? (
            <View style={{ gap: 6 }}>
              <Skeleton width="100%" height={16} borderRadius={4} />
              <Skeleton width="60%" height={16} borderRadius={4} />
            </View>
          ) : (
            <Text style={styles.audienceText}>
              {infProfile?.audienceDemographics
                ? typeof infProfile.audienceDemographics === 'string'
                  ? infProfile.audienceDemographics
                  : JSON.stringify(infProfile.audienceDemographics)
                : infProfile?.followers
                ? `Avg. views: ${(infProfile.avgViews || 0).toLocaleString()} · Engagement: ${
                    infProfile.engagementRate || '5.0'
                  }% · Level: ${infProfile.level || 'Nano'}`
                : 'No audience statistics available yet.'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  aboutLabel: { fontSize: 12, fontWeight: '700', color: Colors.rose, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  noNichesText: { fontSize: 13, color: 'rgba(63,3,11,0.4)', fontFamily: FontFamily.sansMedium },
  audienceCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, ...Shadow.card },
  audienceText: { fontSize: 13.5, color: 'rgba(42,2,7,0.75)', lineHeight: 22 },
});
