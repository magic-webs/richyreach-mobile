import { Colors } from '@/constants/brand';
import React, { useRef } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import ReanimatedCarousel from 'react-native-reanimated-carousel';

const { width: SCREEN_W } = Dimensions.get('window');

interface CarouselProps {
  slides: React.ReactNode[];
  height?: number;
  dotColor?: string;
  autoInterval?: number;
}

function AnimatedDot({
  index,
  progress,
  dotColor,
  total,
}: {
  index: number;
  progress: any;
  dotColor: string;
  total: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    let value = progress.value;

    // Normalize progress value to [0, total)
    let normalizedValue = value % total;
    if (normalizedValue < 0) {
      normalizedValue += total;
    }

    let diff = Math.abs(normalizedValue - index);
    if (total > 1) {
      diff = Math.min(
        diff,
        Math.abs(normalizedValue - (index + total)),
        Math.abs(normalizedValue - (index - total))
      );
    }

    const width = interpolate(
      diff,
      [0, 1],
      [34, 6],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      diff,
      [0, 1],
      [1, 0.4],
      Extrapolation.CLAMP
    );

    const backgroundColor = interpolateColor(
      diff,
      [0, 1],
      [dotColor, 'rgba(63,3,11,0.35)']
    );

    return {
      width,
      opacity,
      backgroundColor,
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        animatedStyle,
      ]}
    />
  );
}

export function Carousel({
  slides,
  height = 200,
  dotColor = Colors.oxblood,
  autoInterval = 4200,
}: CarouselProps) {
  const carouselRef = useRef<any>(null);
  const progress = useSharedValue<number>(0);
  const slideWidth = SCREEN_W - 36;

  const onPressPagination = (index: number) => {
    carouselRef.current?.scrollTo({
      index,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.wrapper, { height }]}>
        <ReanimatedCarousel
          ref={carouselRef}
          loop
          width={slideWidth}
          height={height}
          autoPlay={true}
          autoPlayInterval={autoInterval}
          scrollAnimationDuration={700}
          data={slides}
          onProgressChange={(_, absoluteProgress) => {
            progress.value = absoluteProgress;
          }}
          renderItem={({ item }) => (
            <View style={{ width: slideWidth, height, paddingHorizontal: 4 }}>{item}</View>
          )}
        />
      </View>

      {slides.length > 1 && (
        <View style={styles.dots}>
          {slides.map((_, k) => (
            <TouchableOpacity
              key={k}
              activeOpacity={0.8}
              onPress={() => onPressPagination(k)}
            >
              <AnimatedDot
                index={k}
                progress={progress}
                dotColor={dotColor}
                total={slides.length}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  wrapper: {
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    zIndex: 3,
  },
  dot: {
    height: 6,
    borderRadius: 99,
  },
});
