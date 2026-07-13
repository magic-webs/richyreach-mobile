import { Colors, FontFamily } from '@/constants/brand';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
  StyleSheet,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TactileButton } from '@/components/ui/tactile-button';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft } from '@hugeicons/core-free-icons';

import { SlideOne } from '@/components/onboarding/SlideOne';
import { SlideTwo } from '@/components/onboarding/SlideTwo';
import { SlideThree } from '@/components/onboarding/SlideThree';

const { width } = Dimensions.get('window');

// Slide IDs (Ordered as Welcome first, then Earn, then Get Paid)
const SLIDES = [
  { id: 'slide2' }, // Built for Creators / Welcome
  { id: 'slide1' }, // Earn with Every Post
  { id: 'slide3' }, // Get Paid Faster
];

// Animated dot for page indicator
function AnimatedDot({ active }: { active: boolean }) {
  const dotWidth = useSharedValue(active ? 24 : 8);

  useEffect(() => {
    dotWidth.value = withTiming(active ? 24 : 8, { duration: 300 });
  }, [active]);

  const style = useAnimatedStyle(() => ({
    width: dotWidth.value,
    height: 8,
    borderRadius: 4,
    backgroundColor: active ? '#5a1018' : '#e0dbd5',
  }));

  return <Animated.View style={style} />;
}

// Page Indicator dots row
function DotsRow({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 20 }}>
      {Array.from({ length: total }).map((_, i) => (
        <AnimatedDot key={i} active={i === current} />
      ))}
    </View>
  );
}

// Main screen controller
export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const setOnboardingSeen = useAuthStore((s) => s.setOnboardingSeen);

  const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const goNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      if (Platform.OS === 'web') {
        setCurrentIndex(currentIndex + 1);
      } else {
        flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      }
    } else {
      await setOnboardingSeen(true);
      router.replace('/(auth)');
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      if (Platform.OS === 'web') {
        setCurrentIndex(currentIndex - 1);
      } else {
        flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
      }
    }
  };

  const skip = async () => {
    await setOnboardingSeen(true);
    router.replace('/(auth)');
  };

  const renderSlide = ({ index }: { index: number }) => {
    const active = index === currentIndex;
    switch (index) {
      case 0:
        return <SlideTwo active={active} />;
      case 1:
        return <SlideOne active={active} />;
      case 2:
        return <SlideThree active={active} />;
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Back Button */}
      {currentIndex > 0 && (
        <TouchableOpacity
          onPress={goBack}
          activeOpacity={0.7}
          style={{
            position: 'absolute',
            left: 20,
            zIndex: 50,
            padding: 10,
            borderRadius: 999,
            top: insets.top + 10,
            backgroundColor: 'rgba(63, 3, 11, 0.05)',
          }}
        >
          <HugeiconsIcon icon={ArrowLeft} size={24} color="#3f030b" />
        </TouchableOpacity>
      )}

      <View style={styles.mainWrapper}>
        {/* Scrollable Content (Slides) */}
        <View style={{ flex: 1, width: '100%' }}>
          {Platform.OS === 'web' ? (
            renderSlide({ index: currentIndex })
          ) : (
            <FlatList
              ref={flatListRef}
              data={SLIDES}
              renderItem={({ index }) => renderSlide({ index })}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewRef.current}
              viewabilityConfig={viewConfigRef.current}
              scrollEventThrottle={16}
              style={{ flex: 1 }}
            />
          )}
        </View>

        {/* Fixed Footer Bottom Section */}
        <View style={[styles.fixedBottomSection, { paddingBottom: insets.bottom + 20 }]}>
          <DotsRow current={currentIndex} total={3} />

          <TactileButton
            text={
              currentIndex === 0
                ? "Let's Begin"
                : currentIndex === 1
                  ? "Get Started"
                  : "Let's Begin"
            }
            onPress={goNext}
            variant="primary"
            size="lg"
            fullWidth
            icon="arrow"
            iconPosition="right"
            borderRadius={20}
          />

          {currentIndex === 0 ? (
            <TouchableOpacity onPress={skip} style={styles.footerLinkContainer} activeOpacity={0.7}>
              <Text style={styles.footerLinkText}>
                Already have an account? <Text style={{ fontWeight: '700', color: Colors.oxblood }}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          ) : currentIndex === 1 ? (
            <TouchableOpacity onPress={skip} style={styles.footerLinkContainer} activeOpacity={0.7}>
              <Text style={styles.footerLinkText}>Sign In</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={skip} style={styles.footerLinkContainer} activeOpacity={0.7}>
              <Text style={styles.footerLinkText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerLinkContainer: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLinkText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: '#8d4750', // Colors.roseDeep
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: '#ffffff',
    ...(Platform.OS === 'web'
      ? {
        maxWidth: 450,
        alignSelf: 'center',
      }
      : {}),
  },
  fixedBottomSection: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#ffffff',
  },
});
