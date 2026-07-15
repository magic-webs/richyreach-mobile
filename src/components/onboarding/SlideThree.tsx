import React, { useEffect } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { FontFamily } from '@/constants/brand';
import { LogoHeader } from './LogoHeader';
import { CurvyUnderline } from './CurvyUnderline';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 750;
const artworkHeight = isSmallDevice ? 180 : height * 0.45;

interface SlideThreeProps {
  active: boolean;
}

export function SlideThree({ active }: SlideThreeProps) {
  const insets = useSafeAreaInsets();

  const imageScale = useSharedValue(0.9);
  const imageOpacity = useSharedValue(0);
  const bottomOpacity = useSharedValue(0);
  const bottomTranslateY = useSharedValue(15);

  useEffect(() => {
    if (active) {
      imageScale.value = withTiming(1, { duration: 600 });
      imageOpacity.value = withTiming(1, { duration: 600 });
      bottomOpacity.value = withTiming(1, { duration: 600 });
      bottomTranslateY.value = withTiming(0, { duration: 600 });
    } else {
      imageScale.value = 0.9;
      imageOpacity.value = 0;
      bottomOpacity.value = 0;
      bottomTranslateY.value = 15;
    }
  }, [active]);

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

        <Animated.View style={[styles.imageContainer, imageAnimStyle]}>
          <Image
            source={require('@/assets/images/onboarding_slide_3.png')}
            style={[styles.artworkImage, { height: artworkHeight }]}
            contentFit="contain"
          />
        </Animated.View>
      </View>

      <View style={{ alignItems: 'center', width: '100%' }}>
        <Animated.View style={[{ alignItems: 'center', width: '100%' }, bottomAnimStyle]}>
          {/* Title */}
          <Text style={styles.titleText}>
            Get Paid{'\n'}
            <Text style={styles.highlightText}>Faster</Text>
          </Text>

          {/* Underline */}
          <CurvyUnderline width={110} color="#8d4750" />

          {/* Subtitle */}
          <Text style={styles.subtitleText}>Complete. Submit. Earn.</Text>
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
  titleText: {
    fontFamily: FontFamily.sans,
    fontSize: 32,
    fontWeight: '700',
    color: '#1a0104',
    textAlign: 'center',
    lineHeight: 38,
  },
  highlightText: {
    color: '#5a1018',
  },
  subtitleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: '#707070',
    textAlign: 'center',
    marginTop: 2,
  },
});
