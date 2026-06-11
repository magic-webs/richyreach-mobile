import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';

const { width: W } = Dimensions.get('window');

interface HappeningNowProps {
  activity: any[];
}

export function HappeningNow({ activity }: HappeningNowProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [rotateAnim]);

  useEffect(() => {
    if (activity.length === 0) return;
    const scrollHeight = 64 * activity.length;
    scrollAnim.setValue(0);
    const animation = Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: -scrollHeight,
        duration: activity.length * 3500, // 3.5 seconds per item scroll duration
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [scrollAnim, activity.length]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const doubledActivity = [...activity, ...activity];

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

      {/* Activity Card with Animated Gradient Border */}
      <View style={styles.shadowContainer}>
        <View style={styles.borderContainer}>
          <Animated.View style={[styles.gradientWrapper, { transform: [{ rotate: spin }] }]}>
            <LinearGradient
              colors={[Colors.rose, Colors.oxblood, Colors.roseSoft, Colors.oxblood, Colors.rose]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            />
          </Animated.View>

          <View style={styles.activityCard}>
            <Animated.View style={{ transform: [{ translateY: scrollAnim }] }}>
              {doubledActivity.map((a, index) => (
                <View key={index} style={styles.activityRow}>
                  <View style={styles.activityAvatarWrap}>
                    <PlaceholderImage tone={a.tone} height={40} width={40} borderRadius={99} />
                    <GradientView variant="rose" style={styles.activityIconBadge}>
                      <Icon name={a.icon} size={10} color="#fff" />
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
              ))}
            </Animated.View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 22 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontFamily: FontFamily.sansMedium, fontSize: 20, fontWeight: '700', color: Colors.ink, flex: 1 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(180,106,116,0.12)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99 },
  liveDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: Colors.rose },
  liveText: { fontSize: 11, fontWeight: '700', color: Colors.rose },
  shadowContainer: {
    ...Shadow.card,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  borderContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 1.5,
    position: 'relative',
    backgroundColor: Colors.white,
  },
  gradientWrapper: {
    position: 'absolute',
    width: '200%',
    height: '400%',
    top: '-150%',
    left: '-50%',
  },
  gradient: {
    flex: 1,
  },
  activityCard: { backgroundColor: '#fff', borderRadius: 18.5, overflow: 'hidden', height: 64 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, height: 64 },
  activityAvatarWrap: { position: 'relative', flexShrink: 0 },
  activityIconBadge: { position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 99, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff' },
  activityText: { flex: 1, fontSize: 13, color: Colors.ink, lineHeight: 18 },
  activityWho: { fontWeight: '700' },
  activityAct: { color: 'rgba(63,3,11,0.58)' },
  activityTime: { fontSize: 11, color: Colors.rose, fontWeight: '600', flexShrink: 0 },
});
