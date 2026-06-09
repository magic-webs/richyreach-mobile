import { SlideBrands } from '@/components/onboarding/SlideBrands';
import { SlideGrow } from '@/components/onboarding/SlideGrow';
import { SlideInfluencers } from '@/components/onboarding/SlideInfluencers';
import { SlideWelcome } from '@/components/onboarding/SlideWelcome';
import { Colors, FontFamily, Radius } from '@/constants/brand';
import { useAuthStore } from '@/store/auth';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Slide meta

const SLIDES = [
  { id: 'welcome' },
  { id: 'influencers' },
  { id: 'brands' },
  { id: 'grow' },
];

// Animated dot

function AnimatedDot({ active }: { active: boolean }) {
  const dotWidth = useSharedValue(active ? 24 : 8);

  React.useEffect(() => {
    dotWidth.value = withTiming(active ? 24 : 8, { duration: 300 });
  }, [active]);

  const style = useAnimatedStyle(() => ({
    width: dotWidth.value,
    height: 8,
    borderRadius: 4,
    backgroundColor: active ? Colors.oxblood : Colors.roseSoft,
  }));

  return <Animated.View style={style} />;
}

// Dots row

function DotsRow({ current, total }: { current: number; total: number }) {
  return (
    <View className="flex-row items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <AnimatedDot key={i} active={i === current} />
      ))}
    </View>
  );
}

// Main screen

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

  const skip = async () => {
    await setOnboardingSeen(true);
    router.replace('/(auth)');
  };

  const renderSlide = ({ item, index }: { item: { id: string }; index: number }) => {
    const active = index === currentIndex;
    switch (index) {
      case 0: return <SlideWelcome active={active} />;
      case 1: return <SlideInfluencers active={active} />;
      case 2: return <SlideBrands active={active} />;
      case 3: return <SlideGrow active={active} />;
      default: return null;
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;
  const isFirst = currentIndex === 0;

  return (
    <View className="flex-1 bg-[#f4ece4]">
      <StatusBar barStyle="dark-content" backgroundColor="#f4ece4" />

      {/*Skip button*/}
      {!isLast && (
        <TouchableOpacity
          onPress={skip}
          activeOpacity={0.7}
          className="absolute right-6 z-50 px-3 py-1.5 rounded-full"
          style={{
            top: insets.top + 10,
            backgroundColor: Colors.oxblood + '12',
          }}
        >
          <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 13, color: Colors.oxblood }}>
            Skip
          </Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      {Platform.OS === 'web' ? (
        <View style={{ flex: 1, marginTop: 32, width: '100%', maxWidth: 450, alignSelf: 'center' }}>
          {renderSlide({ item: SLIDES[currentIndex], index: currentIndex })}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          contentContainerStyle={{ marginTop: 32 }}
        />
      )}

      {/*Bottom bar ─*/}
      <View
        className="px-7 bg-[#f4ece4]"
        style={{ paddingBottom: insets.bottom + 20, paddingTop: 16 }}
      >
        {/* Dots */}
        <View className="items-center mb-5">
          <DotsRow current={currentIndex} total={SLIDES.length} />
        </View>

        {/* CTA button */}
        <TouchableOpacity
          onPress={goNext}
          activeOpacity={0.87}
          style={{
            shadowColor: Colors.oxblood,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 8,
            borderRadius: Radius.xl,
          }}
        >
          <LinearGradient
            colors={[Colors.oxblood, Colors.oxbloodDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingVertical: 17,
              borderRadius: Radius.xl,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Text style={{ fontFamily: FontFamily.sans, fontSize: 16, color: Colors.cream, letterSpacing: 0.3 }}>
              {isLast ? 'Start Exploring' : 'Next'}
            </Text>
            {isLast
              ? <Ionicons name="rocket-outline" size={24} color={Colors.cream} />
              : <Feather name="arrow-right" size={24} color={Colors.cream} />
            }
          </LinearGradient>
        </TouchableOpacity>

        {/* Already have account - first & last screens */}
        {(isFirst || isLast) && (
          <TouchableOpacity
            onPress={skip}
            className="items-center mt-4"
            activeOpacity={0.7}
          >
            <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 13, color: Colors.rose }}>
              Already have an account?{' '}
              <Text style={{ fontFamily: FontFamily.sans, color: Colors.oxblood, fontWeight: '600' }}>Log in</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
