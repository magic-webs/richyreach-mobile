import { Carousel } from '@/components/ui/carousel';
import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Gradients } from '@/constants/brand';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeroCarouselProps {
  onArenaPress: () => void;
  onStartPress: () => void;
}

export function HeroCarousel({ onArenaPress, onStartPress }: HeroCarouselProps) {
  const slides = [
    <LinearGradient
      key="a"
      colors={[Gradients.rose[0], Gradients.rose[1]]}
      style={hero.slide}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={{ flex: 1, flexDirection: 'column', marginRight: 4 }}>
        <View style={hero.top}>
          <Text style={hero.eyebrow}>This week</Text>
          <Text style={hero.heading}>
            Earn up to <Text style={{ fontStyle: 'italic' }}>₹2.5L</Text> this month
          </Text>
        </View>
        <View style={hero.bottom}>
          <TouchableOpacity onPress={onStartPress} style={hero.startBtn} activeOpacity={0.85}>
            <Text style={hero.startBtnText}>Start applying</Text>
          </TouchableOpacity>
          <View style={hero.badge}>
            <Icon name="dollar-sign" size={14} color="#fff" />
            <Text style={hero.badgeText}>312 open</Text>
          </View>
        </View>
      </View>
    </LinearGradient>,
    <LinearGradient
      key="b"
      colors={[Colors.oxblood2, Colors.oxblood, Colors.oxbloodDeep]}
      style={hero.slide}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={[hero.eyebrow, { color: Colors.roseSoft }]}>Live challenge</Text>
        <Text style={[hero.heading, { color: Colors.cream }]}>#SummerGlow brand contest</Text>
        <TouchableOpacity
          onPress={onArenaPress}
          style={hero.arenaBtn}
          activeOpacity={0.8}
        >
          <Text style={hero.arenaBtnText}>₹10L prize pool</Text>
          <Icon name="arrow" size={13} color={Colors.roseSoft} />
        </TouchableOpacity>
      </View>
      <Icon name="flame" size={60} color={Colors.roseSoft} />
    </LinearGradient>,
    <LinearGradient
      key="c"
      colors={['#8d4750', '#5a1018']}
      style={hero.slide}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <Text style={[hero.eyebrow, { color: Colors.roseSoft }]}>Creator growth</Text>
        <Text style={[hero.heading, { color: Colors.cream, marginTop: 'auto' }]}>
          Grow your <Text style={{ fontStyle: 'italic' }}>reach</Text>, your way
        </Text>
      </View>
    </LinearGradient>,
  ];

  return (
    <View style={styles.container}>
      <Carousel slides={slides} height={154} dotColor={Colors.cream} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
});

const hero = StyleSheet.create({
  slide: { flex: 1, padding: 22, flexDirection: 'row', alignItems: 'center', borderRadius: 24 },
  top: { gap: 8 },
  eyebrow: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
  },
  heading: { fontFamily: FontFamily.serif, fontSize: 26, fontWeight: '700', color: '#fff', lineHeight: 30 },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 'auto' as any },
  startBtn: { backgroundColor: Colors.oxblood, borderRadius: 999, paddingHorizontal: 17, paddingVertical: 10 },
  startBtnText: { color: Colors.cream, fontSize: 13, fontWeight: '700' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(63,3,11,0.06)',
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 6,
  },
  badgeText: { fontFamily: FontFamily.serif, fontWeight: '700', fontSize: 14, color: Colors.oxblood },
  arenaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(180,106,116,0.18)',
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginTop: 9,
    alignSelf: 'flex-start',
  },
  arenaBtnText: { fontSize: 12.5, color: Colors.roseSoft, fontWeight: '700' },
});
