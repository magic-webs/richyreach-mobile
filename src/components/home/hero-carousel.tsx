import { Carousel } from '@/components/ui/carousel';
import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Gradients } from '@/constants/brand';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';


interface HeroCarouselProps {
  onArenaPress: () => void;
  onStartPress: () => void;
}

export function HeroCarousel({ onArenaPress, onStartPress }: HeroCarouselProps) {
  const router = useRouter();

  const { data: banners = [] } = useQuery<any[]>({
    queryKey: ['heroBanners'],
    queryFn: () => api.banners.list('home_top').catch(() => []),
  });

  const handlePress = (banner: any) => {
    if (!banner.link) return;

    if (banner.link === '/(tabs)/marketplace') {
      onStartPress();
      return;
    }
    if (banner.link === '/(tabs)/arena') {
      onArenaPress();
      return;
    }

    try {
      if (banner.link.startsWith('/')) {
        router.push(banner.link as any);
      } else {
        const { Linking } = require('react-native');
        Linking.openURL(banner.link);
      }
    } catch (err) {
      console.warn('Failed to navigate to banner link:', banner.link, err);
    }
  };

  const renderTitle = (title: string) => {
    if (!title) return null;
    if (title.includes('₹2.5L')) {
      const parts = title.split('₹2.5L');
      return (
        <Text style={hero.heading}>
          {parts[0]}
          <Text style={{ fontStyle: 'italic' }}>₹2.5L</Text>
          {parts[1]}
        </Text>
      );
    }
    if (title.includes('reach')) {
      const parts = title.split('reach');
      return (
        <Text style={hero.heading}>
          {parts[0]}
          <Text style={{ fontStyle: 'italic' }}>reach</Text>
          {parts[1]}
        </Text>
      );
    }
    return <Text style={hero.heading}>{title}</Text>;
  };

  const renderBannerSlide = (banner: any) => {
    const isImage = banner.bannerType === 'image';
    const isColor = banner.bannerType === 'color';

    const slideContent = () => {
      if (banner.id === 'hero_earn') {
        return (
          <View style={{ flex: 1, flexDirection: 'column', marginRight: 4 }}>
            <View style={hero.top}>
              <Text style={hero.eyebrow}>{banner.subtitle || "This week"}</Text>
              {renderTitle(banner.title || "Earn up to ₹2.5L this month")}
            </View>
            <View style={hero.bottom}>
              <TouchableOpacity onPress={() => handlePress(banner)} style={hero.startBtn} activeOpacity={0.85}>
                <Text style={hero.startBtnText}>Start applying</Text>
              </TouchableOpacity>
              <View style={hero.badge}>
                <Icon name="dollar-sign" size={14} color="#fff" />
                <Text style={hero.badgeText}>312 open</Text>
              </View>
            </View>
          </View>
        );
      }

      if (banner.id === 'hero_challenge') {
        return (
          <>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={[hero.eyebrow, { color: Colors.roseSoft }]}>{banner.subtitle || "Live challenge"}</Text>
              <Text style={[hero.heading, { color: Colors.cream }]}>{banner.title || "#SummerGlow brand contest"}</Text>
              <TouchableOpacity
                onPress={() => handlePress(banner)}
                style={hero.arenaBtn}
                activeOpacity={0.8}
              >
                <Text style={hero.arenaBtnText}>₹10L prize pool</Text>
                <Icon name="arrow" size={13} color={Colors.roseSoft} />
              </TouchableOpacity>
            </View>
            <Icon name="flame" size={74} color={Colors.roseSoft} />
          </>
        );
      }

      if (banner.id === 'hero_growth') {
        return (
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <Text style={[hero.eyebrow, { color: Colors.roseSoft }]}>{banner.subtitle || "Creator growth"}</Text>
            {renderTitle(banner.title || "Grow your reach, your way")}
          </View>
        );
      }

      return (
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
          {banner.subtitle && (
            <Text style={[hero.eyebrow, { color: banner.textColor || 'rgba(255,255,255,0.9)' }]}>
              {banner.subtitle}
            </Text>
          )}
          {banner.title && (
            <Text style={[hero.heading, { color: banner.textColor || '#ffffff', marginTop: 4 }]}>
              {banner.title}
            </Text>
          )}
        </View>
      );
    };

    if (isImage && banner.imageUrl) {
      return (
        <TouchableOpacity
          key={banner.id}
          activeOpacity={0.9}
          onPress={() => handlePress(banner)}
          style={{ width: '100%', height: '100%' }}
        >
          <View style={[hero.slide, { width: '100%', height: '100%' }]}>
            <Image source={{ uri: banner.imageUrl }} style={[StyleSheet.absoluteFill, { borderRadius: 24 }]} contentFit="cover" />
            {slideContent()}
          </View>
        </TouchableOpacity>
      );
    }

    if (isColor && banner.bgColor) {
      return (
        <TouchableOpacity
          key={banner.id}
          activeOpacity={0.9}
          onPress={() => handlePress(banner)}
          style={{ width: '100%', height: '100%' }}
        >
          <View style={[hero.slide, { backgroundColor: banner.bgColor, width: '100%', height: '100%' }]}>
            {slideContent()}
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <LinearGradient
        key={banner.id}
        colors={banner.gradientColors || [Gradients.rose[0], Gradients.rose[1]]}
        style={hero.slide}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {slideContent()}
      </LinearGradient>
    );
  };

  const slides = banners.map(renderBannerSlide);

  return (
    <View style={styles.container}>
      <Carousel slides={slides} height={210} dotColor={Colors.oxblood} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 2,
  },
});

const hero = StyleSheet.create({
  slide: {
    flex: 1,
    padding: 26,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24
  },
  top: { gap: 10 },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
  },
  heading: { fontFamily: FontFamily.serif, fontSize: 30, fontWeight: '700', color: '#fff', lineHeight: 35 },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 'auto' as any },
  startBtn: { backgroundColor: Colors.oxblood, borderRadius: 999, paddingHorizontal: 19, paddingVertical: 12 },
  startBtnText: { color: Colors.cream, fontSize: 14, fontWeight: '700' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(63,3,11,0.06)',
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  badgeText: { fontFamily: FontFamily.serif, fontWeight: '700', fontSize: 15, color: Colors.oxblood },
  arenaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(180,106,116,0.18)',
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 9,
    marginTop: 11,
    alignSelf: 'flex-start',
  },
  arenaBtnText: { fontSize: 13.5, color: Colors.roseSoft, fontWeight: '700' },
});
