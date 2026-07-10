import { ReelVideoPlayer } from '@/components/brand/marketplace/ReelVideoPlayer';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, BadgeCheckIcon } from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Public, no-auth viewer for a service reel shared via deep link
 * (https://app.richyreach.com/shared/service/[id]). Only the service id is in the
 * link; the reel is fetched from the public backend endpoint
 * (GET /influencers/services/public/:id) so the data is always fresh.
 */
export default function SharedServiceVideo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isLoggedIn = !!useAuthStore((s) => s.session);

  const [stageHeight, setStageHeight] = useState(0);

  const { data: service, isLoading, isError } = useQuery<any>({
    queryKey: ['public-service', id],
    queryFn: () => api.influencers.services.getPublic(id!),
    enabled: !!id,
  });

  const videoUrl = service?.videoUrl || service?.exampleUrl || '';
  const title = service?.name || 'Service reel';
  const handle = service?.influencer?.instagramHandle ? `@${service.influencer.instagramHandle}` : '';
  const creatorName = service?.influencer?.user?.name || 'Creator';
  const price = typeof service?.price === 'number' ? service.price / 100 : null;

  const handleOpenApp = () => {
    if (isLoggedIn) {
      router.replace('/(tabs)/brand/marketplace');
    } else {
      router.replace('/(auth)');
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      handleOpenApp();
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View
        style={styles.stage}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 0) setStageHeight(h);
        }}
      >
        {isLoading ? (
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            <ActivityIndicator color={Colors.white} />
          </View>
        ) : isError || !service || !videoUrl ? (
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            <Text style={styles.errText}>This reel is no longer available.</Text>
          </View>
        ) : (
          stageHeight > 0 && (
            <ReelVideoPlayer videoUrl={videoUrl} isPlaying height={stageHeight} />
          )
        )}
      </View>

      {/* Top gradient + back */}
      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'transparent']}
        style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) + 8 }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity onPress={handleBack} style={styles.iconBtn} activeOpacity={0.8}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color={Colors.white} strokeWidth={2} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Bottom details + CTA */}
      {!!service && !!videoUrl && (
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}
          pointerEvents="box-none"
        >
          <View style={styles.creatorRow}>
            {!!handle && <Text style={styles.handle}>{handle}</Text>}
            {!!handle && <HugeiconsIcon icon={BadgeCheckIcon} size={14} color={Colors.rose} strokeWidth={2} />}
          </View>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          {price !== null && (
            <Text style={styles.price}>₹{price.toLocaleString()} · by {creatorName}</Text>
          )}

          <TouchableOpacity onPress={handleOpenApp} style={styles.cta} activeOpacity={0.85}>
            <Text style={styles.ctaText}>{isLoggedIn ? 'Explore on RichyReach' : 'Join RichyReach to collaborate'}</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  stage: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  errText: { color: 'rgba(255,255,255,0.7)', fontFamily: FontFamily.sansMedium, fontSize: 15 },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 40,
    gap: 6,
  },
  creatorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  handle: {
    color: Colors.white,
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  title: {
    color: Colors.white,
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  price: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
  },
  cta: {
    marginTop: 12,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.button,
  },
  ctaText: { fontFamily: FontFamily.sans, fontWeight: '800', fontSize: 15, color: Colors.cream },
});
