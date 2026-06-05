import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Colors, Gradients } from '@/constants/brand';

interface GradientViewProps {
  variant?: 'rose' | 'oxblood' | 'roseLight';
  colors?: readonly [string, string, ...string[]];
  angle?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function GradientView({ variant = 'rose', colors, angle = 135, style, children }: GradientViewProps) {
  const gradColors = colors ?? (
    variant === 'oxblood' ? [Colors.oxblood2, Colors.oxblood, Colors.oxbloodDeep] :
    variant === 'roseLight' ? [Colors.roseSoft, Colors.rose] :
    [Gradients.rose[0], Gradients.rose[1], Gradients.rose[2]]
  ) as readonly [string, string, ...string[]];

  const rad = (angle * Math.PI) / 180;
  const x1 = 0.5 - 0.5 * Math.cos(rad);
  const y1 = 0.5 - 0.5 * Math.sin(rad);
  const x2 = 0.5 + 0.5 * Math.cos(rad);
  const y2 = 0.5 + 0.5 * Math.sin(rad);

  return (
    <LinearGradient
      colors={gradColors}
      start={{ x: x1, y: y1 }}
      end={{ x: x2, y: y2 }}
      style={[styles.base, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
