import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import ReanimatedCarousel from 'react-native-reanimated-carousel';
import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Shadow } from '@/constants/brand';

const { width: W } = Dimensions.get('window');

interface HappeningNowProps {
  activity: any[];
}

export function HappeningNow({ activity }: HappeningNowProps) {
  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <GradientView variant="oxblood" style={styles.sectionIcon}>
          <Icon name="bolt" size={16} color={Colors.cream} />
        </GradientView>
        <Text style={styles.sectionTitle}>Happening now</Text>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Activity Card */}
      <View style={[styles.activityCard, { height: 76, overflow: 'hidden' }]}>
        <ReanimatedCarousel
          loop
          vertical
          width={W - 44}
          height={64}
          autoPlay={true}
          autoPlayInterval={3000}
          scrollAnimationDuration={800}
          data={activity}
          renderItem={({ item: a }) => (
            <View style={[styles.activityRow, { borderBottomWidth: 0, paddingVertical: 11 }]}>
              <View style={styles.activityAvatarWrap}>
                <PlaceholderImage tone={a.tone} height={42} width={42} borderRadius={99} />
                <GradientView variant="rose" style={styles.activityIconBadge}>
                  <Icon name={a.icon} size={11} color="#fff" />
                </GradientView>
              </View>
              <Text style={styles.activityText} numberOfLines={2}>
                <Text style={styles.activityWho}>{a.who}</Text>
                {a.verified && ' ✓ '}
                <Text style={styles.activityAct}> {a.act} </Text>
                {a.detail}
              </Text>
              <Text style={styles.activityTime}>{a.time}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 22 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontFamily: FontFamily.serif, fontSize: 20, fontWeight: '700', color: Colors.ink, flex: 1 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(180,106,116,0.12)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99 },
  liveDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: Colors.rose },
  liveText: { fontSize: 11, fontWeight: '700', color: Colors.rose },
  activityCard: { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 4, ...Shadow.card },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 11 },
  activityAvatarWrap: { position: 'relative', flexShrink: 0 },
  activityIconBadge: { position: 'absolute', bottom: -2, right: -2, width: 19, height: 19, borderRadius: 99, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  activityText: { flex: 1, fontSize: 13, color: Colors.ink, lineHeight: 18 },
  activityWho: { fontWeight: '700' },
  activityAct: { color: 'rgba(63,3,11,0.58)' },
  activityTime: { fontSize: 11, color: Colors.rose, fontWeight: '600', flexShrink: 0 },
});
