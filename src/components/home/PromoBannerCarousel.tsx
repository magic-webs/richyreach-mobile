import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

  // Calculate width dynamically depending on layout (18px padding on each side)
  const bannerWidth = SCREEN_WIDTH - 36;

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
          const isImage = banner.bannerType === 'image';
          const isColor = banner.bannerType === 'color';
          const isGradient = banner.bannerType === 'gradient';

          const renderContent = () => {
            const isDarkBackground = isGradient || banner.bannerType === 'mixed' || (isColor && banner.bgColor !== '#ffffff');
            const textColor = banner.textColor || '#ffffff';
            const subtitleColor = isDarkBackground ? 'rgba(255,255,255,0.8)' : Colors.rose;

            return (
              <View style={styles.contentRow}>
                <View style={styles.contentWrap}>
                  {banner.subtitle && (
                    <Text style={[styles.subtitle, { color: subtitleColor }]}>
                      {banner.subtitle}
                    </Text>
                  )}
                  {banner.title && (
                    <Text style={[styles.title, { color: textColor }]}>
                      {banner.title}
                    </Text>
                  )}
                </View>
                {banner.link && (
                  <View style={[styles.arrowIcon, { borderColor: textColor }]}>
                    <Icon name="arrow" size={11} color={textColor} />
                  </View>
                )}
              </View>
            );
          };

          const cardWidth = bannerWidth - 12;
          const cardStyle = [styles.bannerCard, { width: cardWidth }];

          if (isColor && banner.bgColor) {
            return (
              <View style={{ width: bannerWidth, paddingHorizontal: 4 }} key={banner.id}>
                <TouchableOpacity
                  style={[cardStyle, { backgroundColor: banner.bgColor }]}
                  activeOpacity={0.9}
                  onPress={() => handlePress(banner)}
                >
                  {renderContent()}
                </TouchableOpacity>
              </View>
            );
          }

          if (isGradient && banner.gradientColors && banner.gradientColors.length > 0) {
            return (
              <View style={{ width: bannerWidth, paddingHorizontal: 6 }} key={banner.id}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={{ width: cardWidth }}
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
              </View>
            );
          }

          if (isImage && banner.imageUrl) {
            return (
              <View style={{ width: bannerWidth, paddingHorizontal: 6 }} key={banner.id}>
                <TouchableOpacity
                  style={cardStyle}
                  activeOpacity={0.9}
                  onPress={() => handlePress(banner)}
                >
                  <Image source={{ uri: banner.imageUrl }} style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]} contentFit="cover" />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.65)', 'rgba(0,0,0,0.2)']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                  />
                  {renderContent()}
                </TouchableOpacity>
              </View>
            );
          }

          // Mixed or Fallback
          return (
            <View style={{ width: bannerWidth, paddingHorizontal: 6 }} key={banner.id}>
              <TouchableOpacity
                style={cardStyle}
                activeOpacity={0.95}
                onPress={() => handlePress(banner)}
              >
                {banner.imageUrl ? (
                  <Image source={{ uri: banner.imageUrl }} style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]} contentFit="cover" />
                ) : (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.oxbloodDeep }]} />
                )}
                <LinearGradient
                  colors={['rgba(0,0,0,0.65)', 'rgba(0,0,0,0.2)']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                />
                {renderContent()}
              </TouchableOpacity>
            </View>
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
    height: 110,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    padding: 18,
    justifyContent: 'center',
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  contentWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: FontFamily.serif,
    fontSize: 18.5,
    fontWeight: '700',
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  arrowIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
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
    backgroundColor: 'rgba(63,3,11,0.35)',
  },
  indicatorActive: {
    width: 34,
    backgroundColor: Colors.oxblood,
  },
});
