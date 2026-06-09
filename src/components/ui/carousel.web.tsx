// Web fallback — react-native-reanimated-carousel has a broken module on web.
// This uses react-native-reanimated's Animated.ScrollView instead.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { runOnJS, useAnimatedScrollHandler } from 'react-native-reanimated';
import { Colors } from '@/constants/brand';

const { width: SCREEN_W } = Dimensions.get('window');

interface CarouselProps {
  slides: React.ReactNode[];
  height?: number;
  dotColor?: string;
  autoInterval?: number;
}

export function Carousel({
  slides,
  height = 200,
  dotColor = Colors.cream,
  autoInterval = 4200,
}: CarouselProps) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const n = slides.length;
  const slideWidth = SCREEN_W - 36;

  const goTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(i, n - 1));
      setIndex(clamped);
      scrollRef.current?.scrollTo({ x: clamped * slideWidth, animated: true });
    },
    [n, slideWidth]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % n;
        scrollRef.current?.scrollTo({ x: next * slideWidth, animated: true });
        return next;
      });
    }, autoInterval);
    return () => clearInterval(timer);
  }, [n, autoInterval, slideWidth, goTo]);

  const scrollHandler = useAnimatedScrollHandler({
    onMomentumEnd: (e) => {
      const newIndex = Math.round(e.contentOffset.x / slideWidth);
      runOnJS(setIndex)(newIndex);
    },
  });

  return (
    <View style={[styles.wrapper, { height, borderRadius: 24 }]}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.scroll}
        decelerationRate="fast"
        snapToInterval={slideWidth}
        snapToAlignment="start"
      >
        {slides.map((slide, k) => (
          <View key={k} style={{ width: slideWidth, height }}>
            {slide}
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.dots} pointerEvents="none">
        {slides.map((_, k) => (
          <View
            key={k}
            style={[
              styles.dot,
              {
                width: k === index ? 22 : 6,
                backgroundColor:
                  k === index ? dotColor : 'rgba(232,216,204,0.4)',
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  dots: {
    position: 'absolute',
    bottom: 14,
    left: 20,
    flexDirection: 'row',
    gap: 6,
    zIndex: 3,
  },
  dot: {
    height: 6,
    borderRadius: 99,
  },
});
