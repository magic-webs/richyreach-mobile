import { FontFamily } from '@/constants/brand';
import React, { useCallback, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// ─── Constants ────────────────────────────────────────────────────────────────
const TICK_SPACING = 14;   // px between each ₹1 step
const SLIDER_HEIGHT = 90;
const NEEDLE_COLOR = '#8bc34a';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Clamp v between lo and hi */
function clamp(v: number, lo: number, hi: number) {
  'worklet';
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Format a rupee amount compactly for ruler labels.
 * e.g. 4250 → "₹4.3k", 500 → "₹500", 17000 → "₹17k"
 */
function fmtLabel(amount: number): string {
  if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(1).replace(/\.0$/, '')}L`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return `₹${amount}`;
}

/**
 * Format a rupee amount fully for the badge.
 * e.g. 4250 → "₹4,250"
 */
function fmtBadge(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Choose a major-tick interval that keeps labels readable.
 * Aims for ~8–12 visible labels across the visible width.
 */
function majorInterval(range: number, sliderWidth: number): number {
  const totalPixels = range * TICK_SPACING;
  const visibleUnits = sliderWidth / TICK_SPACING;
  // target ~10 labels across visible area
  const raw = Math.ceil(visibleUnits / 10);
  // snap to a "nice" number
  const nices = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
  return nices.find((n) => n >= raw) ?? nices[nices.length - 1];
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
  const sliderWidth = Dimensions.get('window').width - 48;
  const halfWidth = sliderWidth / 2;
  const range = maxValue - minValue;
  const interval = majorInterval(range, sliderWidth);

  const valueToOffset = (v: number) => -(v - minValue) * TICK_SPACING;
  const offsetToValue = (offset: number) =>
    clamp(Math.round(minValue - offset / TICK_SPACING), minValue, maxValue);

  const translateX = useSharedValue(valueToOffset(value));
  const startX = useSharedValue(0);
  const prevValue = useRef(value);

  // Sync when value changes externally (e.g. bump buttons)
  useEffect(() => {
    if (prevValue.current !== value) {
      prevValue.current = value;
      translateX.value = withSpring(valueToOffset(value), { damping: 20, stiffness: 200 });
    }
  }, [value]);

  const fireChange = useCallback(
    (offset: number) => {
      const newVal = offsetToValue(offset);
      if (newVal !== prevValue.current) {
        prevValue.current = newVal;
        onChange(newVal);
      }
    },
    [minValue, maxValue, onChange],
  );

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((e) => {
      const minOffset = valueToOffset(maxValue);
      const maxOffset = valueToOffset(minValue);
      translateX.value = clamp(startX.value + e.translationX, minOffset, maxOffset);
      runOnJS(fireChange)(translateX.value);
    })
    .onEnd(() => {
      const snapped = valueToOffset(offsetToValue(translateX.value));
      translateX.value = withSpring(snapped, { damping: 22, stiffness: 220 });
    });

  const rulerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const totalTicks = range + 1;

  return (
    <View style={styles.container}>
      {/* Ruler strip */}
      <View style={[styles.window, { width: sliderWidth }]} pointerEvents="box-none">
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.ruler,
              rulerStyle,
              { width: totalTicks * TICK_SPACING + sliderWidth, marginLeft: halfWidth },
            ]}
          >
            {Array.from({ length: totalTicks }, (_, i) => {
              const tickVal = minValue + i;
              const isMajor = tickVal % interval === 0;
              // mid tick: halfway between major intervals (if interval >= 10)
              const isMid = interval >= 10 && tickVal % (interval / 2) === 0 && !isMajor;

              return (
                <View
                  key={tickVal}
                  style={[
                    styles.tick,
                    { left: i * TICK_SPACING },
                    isMajor ? styles.majorTick : isMid ? styles.midTick : styles.minorTick,
                  ]}
                >
                  {isMajor && (
                    <Text style={styles.tickLabel}>{fmtLabel(tickVal)}</Text>
                  )}
                </View>
              );
            })}
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Fade overlays on left and right edges */}
      <View style={[styles.fadeEdge, styles.fadeLeft]} pointerEvents="none" />
      <View style={[styles.fadeEdge, styles.fadeRight]} pointerEvents="none" />

      {/* Fixed center needle */}
      <View style={styles.needleContainer} pointerEvents="none">
        <View style={styles.needleGlow} />
        <View style={styles.needle} />
      </View>

      {/* Value badge — always shows current value prominently */}
      <View style={styles.valueBadge} pointerEvents="none">
        <Text style={styles.valueCurrency}>₹</Text>
        <Text style={styles.valueAmount}>{value.toLocaleString('en-IN')}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 4,
  },
  window: {
    height: SLIDER_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#2a0207',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.30)',
  },
  ruler: {
    height: SLIDER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 24,
    position: 'relative',
  },
  tick: {
    position: 'absolute',
    bottom: 22,
    alignItems: 'center',
  },
  majorTick: {
    width: 2,
    height: 30,
    backgroundColor: 'rgba(232,216,204,0.60)',
  },
  midTick: {
    width: 1.5,
    height: 20,
    backgroundColor: 'rgba(232,216,204,0.38)',
  },
  minorTick: {
    width: 1,
    height: 13,
    backgroundColor: 'rgba(232,216,204,0.18)',
  },
  tickLabel: {
    position: 'absolute',
    bottom: -20,
    fontFamily: FontFamily.sansMedium,
    fontSize: 8,
    color: 'rgba(232,216,204,0.45)',
    width: 40,
    textAlign: 'center',
    marginLeft: -19,
  },
  // Fade overlays for left/right edges
  fadeEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 48,
    pointerEvents: 'none',
  },
  fadeLeft: {
    left: 0,
    borderRadius: 16,
    // simulate gradient fade (no LinearGradient dep needed for this)
    backgroundColor: 'transparent',
    // We handle the fade via the window's overflow:hidden + dark bg fading naturally
  },
  fadeRight: {
    right: 0,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  // Needle
  needleContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%' as any,
    width: 3,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -1.5 }],
  },
  needleGlow: {
    position: 'absolute',
    width: 10,
    height: SLIDER_HEIGHT - 20,
    backgroundColor: NEEDLE_COLOR,
    opacity: 0.12,
    borderRadius: 6,
  },
  needle: {
    width: 2.5,
    height: SLIDER_HEIGHT - 20,
    backgroundColor: NEEDLE_COLOR,
    borderRadius: 2,
    shadowColor: NEEDLE_COLOR,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  // Value badge
  valueBadge: {
    position: 'absolute',
    top: 9,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(139,195,74,0.18)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(139,195,74,0.40)',
    gap: 1,
  },
  valueCurrency: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: NEEDLE_COLOR,
    fontWeight: '700',
  },
  valueAmount: {
    fontFamily: FontFamily.sans,
    fontSize: 16,
    fontWeight: '800',
    color: NEEDLE_COLOR,
    letterSpacing: 0.3,
  },
});
