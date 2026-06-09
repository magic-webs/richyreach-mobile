import { Colors, FontFamily } from '@/constants/brand';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, Text, View } from 'react-native';

// useNativeDriver crashes on web because RCTAnimation is not available
const native = Platform.OS !== 'web';

export function SplashLoader() {
  // Logo pulse + lift
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Wordmark fade + slide
  const wordmarkY = useRef(new Animated.Value(18)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;

  // Tagline fade
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  // Dot row
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  // Outer ring pulse
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Step 1: Logo appears
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        useNativeDriver: native,
        tension: 55,
        friction: 7,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 520,
        useNativeDriver: native,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(ringOpacity, {
        toValue: 0.35,
        duration: 700,
        delay: 200,
        useNativeDriver: native,
      }),
    ]).start();

    // Step 2: Wordmark slides up
    Animated.sequence([
      Animated.delay(350),
      Animated.parallel([
        Animated.timing(wordmarkOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: native,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(wordmarkY, {
          toValue: 0,
          duration: 420,
          useNativeDriver: native,
          easing: Easing.out(Easing.exp),
        }),
      ]),
    ]).start();

    // Step 3: Tagline
    Animated.sequence([
      Animated.delay(600),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 380,
        useNativeDriver: native,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();

    // Step 4: Pulsing ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, {
          toValue: 1.18,
          duration: 900,
          useNativeDriver: native,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(ringScale, {
          toValue: 1,
          duration: 900,
          useNativeDriver: native,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();

    // Step 5: Staggered loading dots
    const dotSequence = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.25, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );

    const d1 = dotSequence(dot1, 700);
    const d2 = dotSequence(dot2, 900);
    const d3 = dotSequence(dot3, 1100);
    d1.start();
    d2.start();
    d3.start();

    return () => {
      d1.stop();
      d2.stop();
      d3.stop();
    };
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.oxbloodDeep, Colors.oxblood, Colors.oxblood2]}
        style={StyleSheet.absoluteFill}
      />

      {/* Soft ambient radial glow */}
      <View style={styles.glow} />

      <View style={styles.center}>
        {/* Pulsing ring behind logo */}
        <Animated.View
          style={[
            styles.ring,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />

        {/* Logo */}
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('@/assets/images/richyreach-logo.png')}
            style={styles.logo}
          />
        </Animated.View>

        {/* Wordmark */}
        <Animated.View
          style={{
            opacity: wordmarkOpacity,
            transform: [{ translateY: wordmarkY }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.wordmark}>
            Richy <Text style={styles.wordmarkItalic}>Reach</Text>
          </Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Where creators get Rich · Brands get Reach
        </Animated.Text>
      </View>

      {/* Loading dots */}
      <View style={styles.dotsRow}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { opacity: dot, transform: [{ scale: dot }] }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(180,106,116,0.14)',
    alignSelf: 'center',
    top: '30%',
    marginTop: -160,
  },
  center: {
    alignItems: 'center',
    gap: 0,
  },
  ring: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: 'rgba(180,106,116,0.5)',
  },
  logoWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: Colors.rose,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    elevation: 18,
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  wordmark: {
    fontFamily: FontFamily.serif,
    fontSize: 38,
    fontWeight: '700',
    color: Colors.cream,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  wordmarkItalic: {
    fontStyle: 'italic',
    fontWeight: '500',
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(232,216,204,0.55)',
    fontFamily: FontFamily.sansMedium,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 72,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: Colors.roseSoft,
  },
});
