import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PromoBannerCarouselProps {
  position: string;
  fallback?: React.ReactNode;
}

export function PromoBannerCarousel({ position, fallback = null }: PromoBannerCarouselProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: banners = [], isLoading } = useQuery<any[]>({
    queryKey: ['promoBanners', position],
    queryFn: () => api.banners.list(position).catch(() => []),
  });

  const handlePress = (banner: any) => {
    if (!banner.link) return;
    
    try {
      if (banner.link.startsWith('/')) {
        // Internal navigation
        router.push(banner.link as any);
      } else {
        // External link
        Linking.openURL(banner.link);
      }
    } catch (err) {
      console.warn('Failed to navigate to banner link:', banner.link, err);
    }
  };

  if (isLoading || banners.length === 0) {
    return <>{fallback}</>;
  }

  // Calculate width dynamically depending on layout
  const bannerWidth = SCREEN_WIDTH - 40; // 20px padding on each side

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const contentOffset = e.nativeEvent.contentOffset.x;
          const index = Math.round(contentOffset / bannerWidth);
          if (index !== activeIndex && index >= 0 && index < banners.length) {
            setActiveIndex(index);
          }
        }}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {banners.map((banner) => {
          // Render based on banner type
          const isImage = banner.bannerType === 'image';
          const isMixed = banner.bannerType === 'mixed';
          const isColor = banner.bannerType === 'color';
          const isGradient = banner.bannerType === 'gradient';

          // Determine card rendering wrapper
          const renderContent = () => {
            return (
              <View style={styles.contentWrap}>
                {banner.title && (
                  <Text style={[styles.title, { color: banner.textColor || '#ffffff' }]}>
                    {banner.title}
                  </Text>
                )}
                {banner.subtitle && (
                  <Text style={[styles.subtitle, { color: banner.textColor || 'rgba(255,255,255,0.8)' }]}>
                    {banner.subtitle}
                  </Text>
                )}
              </View>
            );
          };

          const cardStyle = [styles.bannerCard, { width: bannerWidth }];

          if (isColor && banner.bgColor) {
            return (
              <TouchableOpacity
                key={banner.id}
                style={[cardStyle, { backgroundColor: banner.bgColor }]}
                activeOpacity={0.9}
                onPress={() => handlePress(banner)}
              >
                {renderContent()}
              </TouchableOpacity>
            );
          }

          if (isGradient && banner.gradientColors && banner.gradientColors.length > 0) {
            return (
              <TouchableOpacity
                key={banner.id}
                activeOpacity={0.9}
                onPress={() => handlePress(banner)}
              >
                <LinearGradient
                  colors={banner.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={cardStyle}
                >
                  {renderContent()}
                </LinearGradient>
              </TouchableOpacity>
            );
          }

          if (isImage && banner.imageUrl) {
            return (
              <TouchableOpacity
                key={banner.id}
                style={cardStyle}
                activeOpacity={0.9}
                onPress={() => handlePress(banner)}
              >
                <Image source={{ uri: banner.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
              </TouchableOpacity>
            );
          }

          // Mixed or Fallback
          return (
            <TouchableOpacity
              key={banner.id}
              style={cardStyle}
              activeOpacity={0.95}
              onPress={() => handlePress(banner)}
            >
              {banner.imageUrl ? (
                <Image source={{ uri: banner.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#2a0207' }]} />
              )}
              <LinearGradient
                colors={['rgba(0,0,0,0.65)', 'rgba(0,0,0,0.2)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
              />
              {renderContent()}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Indicator dots if more than one banner */}
      {banners.length > 1 && (
        <View style={styles.indicatorContainer}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                activeIndex === index ? styles.indicatorActive : null,
              ]}
            />
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
  scrollContent: {
    alignItems: 'center',
  },
  bannerCard: {
    height: 100,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    padding: 16,
    justifyContent: 'center',
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  contentWrap: {
    gap: 4,
  },
  title: {
    fontFamily: FontFamily.serif,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(63,3,11,0.15)',
  },
  indicatorActive: {
    width: 14,
    backgroundColor: Colors.oxblood,
  },
});
