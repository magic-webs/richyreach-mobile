import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, FontFamily } from '@/constants/brand';
import { useTrendingSongs } from '@/hooks/useTrendingSongs';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TrendingSongsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { songs, isLoading } = useTrendingSongs();

  const openAudio = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch((err) => console.warn('Failed to open audio link:', err));
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Icon name="back" size={22} color={Colors.oxblood} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerEye}>Reels audio</Text>
          <Text style={styles.headerTitle}>Trending audio</Text>
        </View>
        <LinearGradient
          colors={['#e1306c', '#c13584', '#405de6']}
          style={styles.headerIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="music" size={16} color="#fff" />
        </LinearGradient>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, k) => (
            <View key={k} style={styles.row}>
              <Skeleton width={22} height={14} borderRadius={4} />
              <Skeleton width={62} height={62} borderRadius={16} />
              <View style={{ flex: 1, gap: 7 }}>
                <Skeleton width={150} height={14} borderRadius={4} />
                <Skeleton width={100} height={11} borderRadius={4} />
              </View>
            </View>
          ))
        ) : songs.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="music" size={30} color={Colors.rose} />
            <Text style={styles.emptyTitle}>No trending audio yet</Text>
            <Text style={styles.emptyText}>Check back soon for this week&apos;s picks.</Text>
          </View>
        ) : (
          songs.map((m, k) => (
            <TouchableOpacity
              key={`${m.title}-${k}`}
              style={styles.row}
              activeOpacity={0.85}
              onPress={() => openAudio(m.instagramAudioUrl)}
            >
              <Text style={styles.rank}>#{k + 1}</Text>

              <View style={styles.thumbWrap}>
                {m.imageUrl ? (
                  <Image
                    source={{ uri: m.imageUrl }}
                    style={{ height: 62, width: 62, borderRadius: 16 }}
                    contentFit="cover"
                  />
                ) : (
                  <PlaceholderImage tone={m.tone} height={62} width={62} borderRadius={16} />
                )}
                <View style={styles.thumbOverlay} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>{m.title}</Text>
                <Text style={styles.artist} numberOfLines={1}>{m.artist}</Text>
                <View style={styles.metaRow}>
                  <Icon name="reel" size={12} color={Colors.rose} />
                  <Text style={styles.metaText}>{m.reels} reels</Text>
                  <View style={styles.metaDot} />
                  <Text style={styles.metaText}>{m.dur}</Text>
                </View>
              </View>

              <View style={styles.playBtn}>
                <Icon name="play" size={14} color={Colors.cream} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(63,3,11,0.06)', alignItems: 'center', justifyContent: 'center' },
  headerEye: { fontSize: 11, fontWeight: '700', color: Colors.rose, textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontFamily: FontFamily.sansMedium, fontSize: 20, fontWeight: '700', color: Colors.ink, marginTop: 1 },
  headerIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  body: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 130, gap: 14 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rank: { width: 26, fontSize: 12.5, fontWeight: '800', color: 'rgba(63,3,11,0.4)' },
  thumbWrap: { position: 'relative' },
  thumbOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16, backgroundColor: 'rgba(42,2,7,0.18)' },
  title: { fontWeight: '700', fontSize: 14, color: Colors.ink },
  artist: { fontSize: 12, color: 'rgba(63,3,11,0.5)', marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  metaText: { fontSize: 11, fontWeight: '700', color: Colors.rose },
  metaDot: { width: 3, height: 3, borderRadius: 99, backgroundColor: 'rgba(63,3,11,0.25)' },
  playBtn: { width: 34, height: 34, borderRadius: 99, backgroundColor: Colors.oxblood, alignItems: 'center', justifyContent: 'center' },

  empty: { alignItems: 'center', gap: 8, paddingVertical: 70 },
  emptyTitle: { fontFamily: FontFamily.sansMedium, fontSize: 16, fontWeight: '700', color: Colors.ink, marginTop: 4 },
  emptyText: { fontSize: 12.5, color: 'rgba(63,3,11,0.5)' },
});
