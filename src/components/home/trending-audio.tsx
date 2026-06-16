import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily } from '@/constants/brand';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';

interface TrendingAudioProps {
  musics: any[];
}

export function TrendingAudio({ musics }: TrendingAudioProps) {
  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <LinearGradient
          colors={['#e1306c', '#c13584', '#405de6']}
          style={styles.sectionIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="music" size={16} color="#fff" />
        </LinearGradient>
        <Text style={styles.sectionTitle}>Trending audio</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 13, paddingRight: 18 }}
      >
        {musics.map((m, k) => (
          <TouchableOpacity
            key={k}
            style={styles.musicCard}
            onPress={() => {
              if (m.instagramAudioUrl) {
                Linking.openURL(m.instagramAudioUrl).catch((err) =>
                  console.warn('Failed to open audio link:', err)
                );
              }
            }}
          >
            <View style={styles.musicThumb}>
              {m.imageUrl ? (
                <Image
                  source={{ uri: m.imageUrl }}
                  style={{ height: 132, width: 132, borderRadius: 18 }}
                  contentFit="cover"
                />
              ) : (
                <PlaceholderImage tone={m.tone} height={132} width={132} borderRadius={18} />
              )}
              <View style={styles.musicOverlay} />
              <View style={styles.musicRank}>
                <Text style={styles.musicRankText}>#{k + 1}</Text>
              </View>
              <View style={styles.musicPlayBtn}>
                <Icon name="play" size={14} color={Colors.oxblood} />
              </View>
            </View>
            <Text style={styles.musicTitle} numberOfLines={1}>
              {m.title}
            </Text>
            <Text style={styles.musicArtist} numberOfLines={1}>
              {m.artist}
            </Text>
            <View style={styles.musicReels}>
              <Icon name="reel" size={12} color={Colors.rose} />
              <Text style={styles.musicReelsText}>{m.reels} reels</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 30 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontFamily: FontFamily.sansMedium, fontSize: 20, fontWeight: '700', color: Colors.ink, flex: 1 },
  seeAll: { fontSize: 13, color: Colors.rose, fontWeight: '700' },
  musicCard: { width: 132 },
  musicThumb: { position: 'relative' },
  musicOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    backgroundColor: 'rgba(42,2,7,0.35)',
  },
  musicRank: {
    position: 'absolute',
    top: 9,
    left: 9,
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: 'rgba(42,2,7,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicRankText: { fontSize: 11, fontWeight: '800', color: Colors.cream },
  musicPlayBtn: {
    position: 'absolute',
    bottom: 9,
    right: 9,
    width: 30,
    height: 30,
    borderRadius: 99,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicTitle: { fontWeight: '700', fontSize: 13, color: Colors.ink, marginTop: 8 },
  musicArtist: { fontSize: 11.5, color: 'rgba(63,3,11,0.5)', marginTop: 1 },
  musicReels: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  musicReelsText: { fontSize: 11, fontWeight: '700', color: Colors.rose },
});
