import React, { useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import ReanimatedCarousel from 'react-native-reanimated-carousel';
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
  const slideWidth = SCREEN_W - 36;

  return (
    <View style={[styles.wrapper, { height }]}>
      <ReanimatedCarousel
        loop
        width={slideWidth}
        height={height}
        autoPlay={true}
        autoPlayInterval={autoInterval}
        scrollAnimationDuration={700}
        data={slides}
        onSnapToItem={setIndex}
        renderItem={({ item }) => (
          <View style={{ width: slideWidth, height }}>{item}</View>
        )}
      />

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
    borderRadius: 24,
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
