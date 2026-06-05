import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/brand';

const { width: SCREEN_W } = Dimensions.get('window');

interface CarouselProps {
  slides: React.ReactNode[];
  height?: number;
  dotColor?: string;
  autoInterval?: number;
}

export function Carousel({ slides, height = 200, dotColor = Colors.cream, autoInterval = 4200 }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const n = slides.length;

  const goTo = useCallback((i: number) => {
    setIndex(i);
    scrollRef.current?.scrollTo({ x: i * SCREEN_W, animated: true });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((index + 1) % n);
    }, autoInterval);
    return () => clearInterval(timer);
  }, [index, n, goTo, autoInterval]);

  const onMomentumEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setIndex(newIndex);
  };

  return (
    <View style={[styles.wrapper, { height, borderRadius: 24 }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        style={styles.scroll}
      >
        {slides.map((slide, k) => (
          <View key={k} style={{ width: SCREEN_W - 36, height }}>
            {slide}
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {slides.map((_, k) => (
          <TouchableOpacity key={k} onPress={() => goTo(k)}>
            <View
              style={[
                styles.dot,
                {
                  width: k === index ? 22 : 6,
                  backgroundColor: k === index ? dotColor : 'rgba(232,216,204,0.4)',
                },
              ]}
            />
          </TouchableOpacity>
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
