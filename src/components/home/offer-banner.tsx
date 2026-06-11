import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Shadow } from '@/constants/brand';

function ShineHighlight({ duration = 1800 }: { duration?: number }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      animatedValue.setValue(0);
      Animated.sequence([
        Animated.delay(1200), // delay between sweeps
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => startAnimation());
    };
    startAnimation();
  }, [animatedValue, duration]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 150],
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          transform: [{ translateX }, { skewX: '-25deg' }],
        },
      ]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={[
          'transparent',
          'rgba(243, 201, 105, 0.0)',
          'rgba(243, 201, 105, 0.45)',
          'rgba(255, 255, 255, 0.75)',
          'rgba(243, 201, 105, 0.45)',
          'rgba(243, 201, 105, 0.0)',
          'transparent'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

export function OfferBanner() {
  const [timeLeft, setTimeLeft] = useState(2 * 3600 + 14 * 60 + 33);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const mm = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  const seg = (v: string) => (
    <View style={offer.seg}>
      <Text style={offer.segText}>{v}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#2a0207', '#110103']}
      style={offer.wrap}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={offer.row1}>
        <View style={offer.badge}>
          <Icon name="sparkle" size={12} color={Colors.gold} />
          <Text style={offer.badgeText}>Pro</Text>
          <ShineHighlight duration={1600} />
        </View>
        <View style={offer.titleWrap}>
          <Text style={offer.title}>
            Unlock <Text style={{ fontStyle: 'italic', color: Colors.gold }}>Premium</Text> features
          </Text>
        </View>
        <TouchableOpacity style={offer.ctaBtn} activeOpacity={0.85}>
          <Text style={offer.ctaText}>₹199</Text>
          <Icon name="arrow" size={14} color="#3f030b" />
          <ShineHighlight duration={1800} />
        </TouchableOpacity>
      </View>
      <View style={offer.row2}>
        <Text style={offer.strikePrice}>₹499</Text>
        <Text style={offer.save}>Save 60%</Text>
        {['Priority', 'Verified badge', '0% fee'].map((p) => (
          <View key={p} style={offer.perkWrap}>
            <Icon name="check" size={12} color={Colors.gold} />
            <Text style={offer.perkText}>{p}</Text>
          </View>
        ))}
        <View style={offer.timer}>
          <Icon name="clock" size={14} color={Colors.gold} />
          <View style={{ width: 2 }} />
          {seg(hh)}
          <Text style={offer.colon}>:</Text>
          {seg(mm)}
          <Text style={offer.colon}>:</Text>
          {seg(ss)}
        </View>
      </View>
    </LinearGradient>
  );
}

const offer = StyleSheet.create({
  wrap: {
    borderRadius: 24,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(243, 201, 105, 0.4)',
    ...Shadow.button,
    shadowColor: Colors.gold,
  },
  row1: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(243, 201, 105, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(243, 201, 105, 0.3)',
    overflow: 'hidden',
    position: 'relative',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  titleWrap: { flex: 1 },
  title: {
    fontFamily: FontFamily.serif,
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 22,
  },
  ctaBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    ...Shadow.card,
    shadowColor: Colors.gold,
    overflow: 'hidden',
    position: 'relative',
  },
  ctaText: { fontFamily: FontFamily.sans, fontWeight: '800', fontSize: 14, color: '#3f030b' },
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  strikePrice: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    textDecorationLine: 'line-through',
    fontWeight: '700',
  },
  save: {
    fontSize: 12,
    color: Colors.gold,
    fontWeight: '800',
    backgroundColor: 'rgba(243, 201, 105, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  perkWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  perkText: { fontSize: 11.5, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 4,
    borderRadius: 10,
  },
  seg: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  segText: { fontFamily: FontFamily.serif, fontSize: 16, fontWeight: '700', color: Colors.gold },
  colon: { color: 'rgba(255,255,255,0.4)', fontWeight: '700', fontSize: 12 },
});
