import { Colors } from '@/constants/brand';
import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleSheet, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  variant?: 'rect' | 'circle' | 'text';
  style?: ViewStyle;
  dark?: boolean;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 6,
  variant = 'rect',
  style,
  dark = false,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  const computedBorderRadius =
    variant === 'circle'
      ? typeof width === 'number'
        ? width / 2
        : 9999
      : variant === 'text'
      ? 4
      : borderRadius;

  const computedHeight = variant === 'text' ? 12 : height;

  const baseColor = dark ? 'rgba(232, 216, 204, 0.12)' : 'rgba(63, 3, 11, 0.08)';

  return (
    <Animated.View
      style={[
        {
          width,
          height: computedHeight,
          borderRadius: computedBorderRadius,
          opacity,
          backgroundColor: baseColor,
        },
        style,
      ]}
    />
  );
}
