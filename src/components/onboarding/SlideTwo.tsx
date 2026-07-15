import React, { useEffect } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Colors, FontFamily } from '@/constants/brand';
import { LogoHeader } from './LogoHeader';
import { CurvyUnderline } from './CurvyUnderline';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 750;
const artworkHeight = isSmallDevice ? 150 : height * 0.35;

interface SlideTwoProps {
  active: boolean;
}

export function SlideTwo({ active }: SlideTwoProps) {
  const insets = useSafeAreaInsets();

  const topOpacity = useSharedValue(0);
  const topTranslateY = useSharedValue(-15);
  const imageScale = useSharedValue(0.9);
  const imageOpacity = useSharedValue(0);
  const bottomOpacity = useSharedValue(0);
  const bottomTranslateY = useSharedValue(15);

  useEffect(() => {
    if (active) {
      topOpacity.value = withTiming(1, { duration: 600 });
      topTranslateY.value = withTiming(0, { duration: 600 });
      imageScale.value = withTiming(1, { duration: 600 });
      imageOpacity.value = withTiming(1, { duration: 600 });
      bottomOpacity.value = withTiming(1, { duration: 600 });
      bottomTranslateY.value = withTiming(0, { duration: 600 });
    } else {
      topOpacity.value = 0;
      topTranslateY.value = -15;
      imageScale.value = 0.9;
      imageOpacity.value = 0;
      bottomOpacity.value = 0;
      bottomTranslateY.value = 15;
    }
  }, [active]);

  const topAnimStyle = useAnimatedStyle(() => ({
    opacity: topOpacity.value,
    transform: [{ translateY: topTranslateY.value }],
  }));

  const imageAnimStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
    transform: [{ scale: imageScale.value }],
  }));

  const bottomAnimStyle = useAnimatedStyle(() => ({
    opacity: bottomOpacity.value,
    transform: [{ translateY: bottomTranslateY.value }],
  }));

  return (
    <ScrollView
      style={{ width: Platform.OS === 'web' ? '100%' : width }}
      contentContainerStyle={[
        styles.slideContainer,
        { paddingTop: insets.top + 10, paddingBottom: 20 },
      ]}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={{ width: '100%' }}>
        {/* <LogoHeader /> */}

        {/* Header Text */}
        <Animated.View style={topAnimStyle}>
          <Text style={styles.slide2TopTitle}>
            Built for <Text style={styles.slide2Highlight}>Creators</Text>.{'\n'}
            Backed by <Text style={styles.slide2Highlight}>Brands</Text>.
          </Text>
        </Animated.View>

        {/* Artwork */}
        <Animated.View style={[styles.imageContainer, imageAnimStyle]}>
          <Image
            source={require('@/assets/images/onboarding_slide_2.png')}
            style={[styles.artworkImage, { height: artworkHeight }]}
            contentFit="contain"
          />
        </Animated.View>
      </View>

      <View style={{ alignItems: 'center', width: '100%', marginVertical: 16 }}>
        <Animated.View style={[{ alignItems: 'center', width: '100%' }, bottomAnimStyle]}>
          {/* Title */}
          <Text style={styles.slide2BottomTitle}>
            Welcome to{'\n'}
            <Text style={styles.serifHighlightText}>RichyReach</Text>
          </Text>

          {/* Underline */}
          <CurvyUnderline width={160} color="#8d4750" />

          {/* Subtitle */}
          <Text style={styles.subtitleText}>Let's grow together. ❤️</Text>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  slideContainer: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  artworkImage: {
    width: '100%',
  },
  serifHighlightText: {
    fontFamily: FontFamily.serif,
    color: '#3f030b', // Colors.oxblood
  },
  subtitleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: '#707070',
    textAlign: 'center',
    marginTop: 2,
  },
  slide2TopTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 22,
    fontWeight: '700',
    color: '#1a0104',
    textAlign: 'center',
    lineHeight: 28,
    marginTop: 10,
  },
  slide2Highlight: {
    color: '#8d4750',
  },
  slide2TopSubtitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: '#707070',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  slide2BottomTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 32,
    fontWeight: '700',
    color: '#1a0104',
    textAlign: 'center',
    lineHeight: 32,
  },
});
