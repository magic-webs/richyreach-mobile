import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/brand';

interface PlaceholderImageProps {
  tone?: 'rose' | 'ox' | 'cream';
  height?: number;
  width?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

const TONE_COLORS = {
  rose: [Colors.rose, Colors.roseDeep],
  ox: [Colors.oxblood2, Colors.oxblood],
  cream: [Colors.cream, Colors.creamDk],
};

export function PlaceholderImage({ tone = 'rose', height = 120, width, borderRadius = 18, style }: PlaceholderImageProps) {
  const [a, b] = TONE_COLORS[tone];
  return (
    <View
      style={[
        styles.base,
        { height, borderRadius, backgroundColor: a, width: width as number },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
