import { Colors, FontFamily } from '@/constants/brand';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

// ─── Constants ────────────────────────────────────────────────────────────────
const THUMB_SIZE = 24;
const PIN_WIDTH = 76;
const ACTIVE_COLOR = '#8bc34a';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Clamp v between lo and hi */
function clamp(v: number, lo: number, hi: number) {
  'worklet';
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Format a rupee amount compactly for ruler/tick labels.
 */
function fmtLabel(amount: number): string {
  if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(1).replace(/\.0$/, '')}L`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return `₹${amount}`;
}

/**
 * Choose a dynamic step size depending on the range.
 */
function calculateStep(range: number): number {
  if (range <= 10) return 1;
  if (range <= 100) return 5;
  if (range <= 500) return 10;
  if (range <= 2000) return 50;
  if (range <= 10000) return 100;
  if (range <= 50000) return 250;
  return 500;
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface BidSliderProps {
  value: number;
  minValue: number;
  maxValue: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function BidSlider({ value, minValue, maxValue, onChange, disabled }: BidSliderProps) {
  const [sliderWidth, setSliderWidth] = useState(300);
  const CONTAINER_PADDING = 20;
  const trackAreaWidth = Math.max(0, sliderWidth - 2 * CONTAINER_PADDING);
  const maxTranslate = Math.max(0, trackAreaWidth - THUMB_SIZE);
  const range = maxValue - minValue;
  const step = calculateStep(range);

  // Math conversions
  const getOffset = (v: number) => {
    'worklet';
    if (range === 0) return 0;
    return ((v - minValue) / range) * maxTranslate;
  };

  const getValue = (offset: number) => {
    'worklet';
    if (maxTranslate === 0) return minValue;
    const pct = clamp(offset / maxTranslate, 0, 1);
    return minValue + pct * range;
  };

  // Shared Values
  const translateX = useSharedValue(getOffset(value));
  const startX = useSharedValue(0);
  const isDragging = useSharedValue(0); // 0 = idle, 1 = dragging

  const prevValue = useRef(value);

  // Sync translation when value changes externally (e.g., bump buttons)
  useEffect(() => {
    prevValue.current = value;
    translateX.value = withSpring(getOffset(value), { damping: 20, stiffness: 200 });
  }, [value, minValue, maxValue, sliderWidth]);

  const fireChange = useCallback(
    (newVal: number) => {
      if (newVal !== prevValue.current) {
        prevValue.current = newVal;
        onChange(newVal);
      }
    },
    [onChange],
  );

  // Gesture definition: touches/drags anywhere on track
  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onBegin((e) => {
      isDragging.value = withSpring(1);
      const touchX = e.x - THUMB_SIZE / 2;
      const targetOffset = clamp(touchX, 0, maxTranslate);

      const rawVal = getValue(targetOffset);
      const steppedVal = Math.round(rawVal / step) * step;
      const finalVal = clamp(steppedVal, minValue, maxValue);

      translateX.value = getOffset(finalVal);
      startX.value = translateX.value;
      scheduleOnRN(fireChange, finalVal);
    })
    .onUpdate((e) => {
      const targetOffset = clamp(startX.value + e.translationX, 0, maxTranslate);
      const rawVal = getValue(targetOffset);
      const steppedVal = Math.round(rawVal / step) * step;
      const finalVal = clamp(steppedVal, minValue, maxValue);

      translateX.value = getOffset(finalVal);
      scheduleOnRN(fireChange, finalVal);
    })
    .onFinalize(() => {
      isDragging.value = withSpring(0);
      translateX.value = withSpring(getOffset(value), { damping: 20, stiffness: 200 });
    });

  // Animated Styles
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const activeTrackStyle = useAnimatedStyle(() => ({
    width: translateX.value,
  }));

  const pinStyle = useAnimatedStyle(() => {
    const scale = 1 + isDragging.value * 0.12;
    const translateY = -isDragging.value * 5;
    return {
      transform: [
        { translateX: CONTAINER_PADDING + translateX.value + THUMB_SIZE / 2 - PIN_WIDTH / 2 },
        { translateY },
        { scale },
      ],
    };
  });

  // Calculate ticks to render
  const ticks = [];
  const totalSteps = Math.floor(range / step);
  let renderInterval = 1;
  if (totalSteps > 15) {
    renderInterval = Math.ceil(totalSteps / 10);
  }
  for (let i = 0; i <= totalSteps; i += renderInterval) {
    ticks.push(minValue + i * step);
  }
  if (ticks[ticks.length - 1] !== maxValue) {
    ticks.push(maxValue);
  }

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        setSliderWidth(e.nativeEvent.layout.width);
      }}
    >
      {/* Floating Tooltip Pin */}
      <Animated.View style={[styles.pinContainer, pinStyle]} pointerEvents="none">
        <View style={styles.pinBubble}>
          <Text style={styles.pinText} numberOfLines={1}>
            ₹{value.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.pinCaret} />
      </Animated.View>

      {/* Slider Track and Thumb */}
      <GestureDetector gesture={pan}>
        <View style={[styles.gestureArea, { width: trackAreaWidth, marginLeft: CONTAINER_PADDING }]}>
          {/* Background Track */}
          <View style={styles.trackBackground} />

          {/* Active Fill Track */}
          <Animated.View style={[styles.activeTrack, activeTrackStyle]} />

          {/* Tick Marks (Steps) */}
          {ticks.map((tickVal) => {
            const isPassed = tickVal <= value;
            const leftPos = getOffset(tickVal) + THUMB_SIZE / 2 - 2;
            return (
              <View
                key={tickVal}
                style={[
                  styles.tickDot,
                  { left: leftPos },
                  isPassed ? styles.tickDotActive : styles.tickDotInactive,
                ]}
              />
            );
          })}

          {/* Thumb */}
          <Animated.View style={[styles.thumb, thumbStyle]} pointerEvents="none" />
        </View>
      </GestureDetector>

      {/* Bottom Labels */}
      <View style={[styles.labelsRow, { left: CONTAINER_PADDING + THUMB_SIZE / 2, right: CONTAINER_PADDING + THUMB_SIZE / 2 }]}>
        <Text style={styles.labelLimit}>₹{minValue.toLocaleString()}</Text>
        <Text style={styles.labelLimit}>Max ₹{maxValue.toLocaleString()}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 108,
    position: 'relative',
    marginTop: 8,
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    paddingVertical: 12,
  },
  gestureArea: {
    height: 44,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    top: 10,
  },
  trackBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(139, 195, 74, 0.15)',
    marginHorizontal: THUMB_SIZE / 2,
  },
  activeTrack: {
    position: 'absolute',
    height: 6,
    borderRadius: 3,
    backgroundColor: ACTIVE_COLOR,
    left: THUMB_SIZE / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#ffffff',
    borderWidth: 4,
    borderColor: ACTIVE_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    top: 10, // Centers thumb vertically relative to 44px gestureArea: (44 - 24) / 2 = 10
  },
  tickDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    top: 20, // Center dot vertically: (44 - 4) / 2 = 20
  },
  tickDotActive: {
    backgroundColor: ACTIVE_COLOR,
  },
  tickDotInactive: {
    backgroundColor: 'rgba(139, 195, 74, 0.35)',
  },
  // Pin Bubble
  pinContainer: {
    position: 'absolute',
    top: 8,
    width: PIN_WIDTH,
    alignItems: 'center',
    zIndex: 10,
  },
  pinBubble: {
    backgroundColor: ACTIVE_COLOR,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACTIVE_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 4,
    width: '100%',
  },
  pinText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    fontWeight: '800',
    color: '#2a0207',
    textAlign: 'center',
  },
  pinCaret: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: ACTIVE_COLOR,
    marginTop: -1,
  },
  // Labels Row
  labelsRow: {
    position: 'absolute',
    bottom: 6,
    left: THUMB_SIZE / 2,
    right: THUMB_SIZE / 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelLimit: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: 'rgba(63,3,11,0.5)',
  },
});
