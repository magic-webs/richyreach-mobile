import { Colors, FontFamily } from '@/constants/brand';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Dimensions, Platform, Text, View } from 'react-native';
import Animated, { Keyframe } from 'react-native-reanimated';

const screenWidth = Dimensions.get('window').width;
const width = Platform.OS === 'web' ? Math.min(screenWidth, 450) : screenWidth;

// Solid entry transitions that animate movement/scale without opacity fade
const slideDownSolid = new Keyframe({
  0: { transform: [{ translateY: -20 }] },
  100: { transform: [{ translateY: 0 }] },
}).duration(500);

const slideUpSolid = new Keyframe({
  0: { transform: [{ translateY: 20 }] },
  100: { transform: [{ translateY: 0 }] },
}).duration(500);

const zoomInSolid = new Keyframe({
  0: { transform: [{ scale: 0.3 }] },
  100: { transform: [{ scale: 1 }] },
}).duration(600);

const scaleInSolid = new Keyframe({
  0: { transform: [{ scale: 0.8 }] },
  100: { transform: [{ scale: 1 }] },
}).duration(600);

// Responsive diagram sizing
const DIAGRAM_SIZE = width * 0.78;
const CENTER = DIAGRAM_SIZE / 2;
const RADIUS = DIAGRAM_SIZE * 0.35;
const NODE_SIZE = 60;
const NODE_CONTAINER_WIDTH = 100;

export function SlideGrow({ active }: { active: boolean }) {
  if (!active) {
    return <View style={{ width, flex: 1, backgroundColor: '#f4ece4' }} />;
  }

  return (
    <View style={{ width, flex: 1, backgroundColor: '#f4ece4', paddingHorizontal: 28, paddingTop: 20 }}>
      {/*  Header*/}
      <Animated.View entering={active ? slideDownSolid.delay(80) : undefined}>
        <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 36, color: Colors.oxblood, lineHeight: 42, marginBottom: 8 }}>
          Let's grow{'\n'}together
        </Text>
        <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 13, color: Colors.rose, lineHeight: 18, marginBottom: 16 }}>
          One platform. Endless opportunities.{'\n'}Brands & Influencers, let's create something amazing!
        </Text>
      </Animated.View>

      {/* ── Central Circle Diagram ────────────────────────── */}
      <View style={{ width: DIAGRAM_SIZE, height: DIAGRAM_SIZE, alignSelf: 'center', marginVertical: 10, position: 'relative' }}>

        {/* Double Outer Circular Lines for Technical Detail */}
        <Animated.View
          entering={active ? scaleInSolid.delay(150) : undefined}
          style={{
            position: 'absolute',
            left: CENTER - RADIUS,
            top: CENTER - RADIUS,
            width: RADIUS * 2,
            height: RADIUS * 2,
            borderRadius: RADIUS,
            borderWidth: 1.5,
            borderColor: 'rgba(180, 106, 116, 0.12)',
            zIndex: 1,
          }}
        />
        <Animated.View
          entering={active ? scaleInSolid.delay(200) : undefined}
          style={{
            position: 'absolute',
            left: CENTER - (RADIUS * 1.9) / 2,
            top: CENTER - (RADIUS * 1.9) / 2,
            width: RADIUS * 1.9,
            height: RADIUS * 1.9,
            borderRadius: (RADIUS * 1.9) / 2,
            borderWidth: 0.75,
            borderColor: 'rgba(180, 106, 116, 0.06)',
            zIndex: 1,
          }}
        />

        {/* Soft Radial Glow / Shaded circle behind Wax Seal */}
        <Animated.View
          entering={active ? scaleInSolid.delay(250) : undefined}
          style={{
            position: 'absolute',
            left: CENTER - (RADIUS * 1.45) / 2,
            top: CENTER - (RADIUS * 1.45) / 2,
            width: RADIUS * 1.45,
            height: RADIUS * 1.45,
            borderRadius: (RADIUS * 1.45) / 2,
            backgroundColor: 'rgba(180, 106, 116, 0.04)',
            borderWidth: 1,
            borderColor: 'rgba(180, 106, 116, 0.08)',
            zIndex: 2,
          }}
        />

        {/* Center: Wax Seal Logo */}
        <Animated.View
          entering={active ? zoomInSolid.delay(300) : undefined}
          style={{
            position: 'absolute',
            left: CENTER - (DIAGRAM_SIZE * 0.42) / 2,
            top: CENTER - (DIAGRAM_SIZE * 0.42) / 2,
            width: DIAGRAM_SIZE * 0.42,
            height: DIAGRAM_SIZE * 0.42,
            zIndex: 3
          }}
        >
          <Image
            source={require('@/assets/images/richyreach-logo.png')}
            style={[styles.phoneSeal, { transform: [{ rotate: '15deg' }] }]}
            contentFit="contain"
          />
        </Animated.View>

        {/* Node: Connect (Top) */}
        <Animated.View
          entering={active ? slideDownSolid.delay(400) : undefined}
          style={{
            position: 'absolute',
            left: CENTER - NODE_CONTAINER_WIDTH / 2,
            top: CENTER - RADIUS - NODE_SIZE / 2,
            width: NODE_CONTAINER_WIDTH,
            alignItems: 'center',
            zIndex: 4,
          }}
        >
          <View
            style={{
              width: NODE_SIZE,
              height: NODE_SIZE,
              borderRadius: NODE_SIZE / 2,
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: Colors.oxblood,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
              borderWidth: 1,
              borderColor: 'rgba(180, 106, 116, 0.12)',
            }}
          >
            <Feather name="users" size={22} color={Colors.oxblood} />
          </View>
          <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 11, color: Colors.oxblood, marginTop: 6, textAlign: 'center' }}>
            Connect
          </Text>
        </Animated.View>

        {/* Node: Grow (Right) */}
        <Animated.View
          entering={active ? slideUpSolid.delay(500) : undefined}
          style={{
            position: 'absolute',
            left: CENTER + RADIUS - NODE_CONTAINER_WIDTH / 2,
            top: CENTER - NODE_SIZE / 2,
            width: NODE_CONTAINER_WIDTH,
            alignItems: 'center',
            zIndex: 4,
          }}
        >
          <View
            style={{
              width: NODE_SIZE,
              height: NODE_SIZE,
              borderRadius: NODE_SIZE / 2,
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: Colors.oxblood,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
              borderWidth: 1,
              borderColor: 'rgba(180, 106, 116, 0.12)',
            }}
          >
            <Feather name="bar-chart-2" size={22} color={Colors.oxblood} />
          </View>
          <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 11, color: Colors.oxblood, marginTop: 6, textAlign: 'center' }}>
            Grow
          </Text>
        </Animated.View>

        {/* Node: Earn (Bottom) */}
        <Animated.View
          entering={active ? slideUpSolid.delay(600) : undefined}
          style={{
            position: 'absolute',
            left: CENTER - NODE_CONTAINER_WIDTH / 2,
            top: CENTER + RADIUS - NODE_SIZE / 2,
            width: NODE_CONTAINER_WIDTH,
            alignItems: 'center',
            zIndex: 4,
          }}
        >
          <View
            style={{
              width: NODE_SIZE,
              height: NODE_SIZE,
              borderRadius: NODE_SIZE / 2,
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: Colors.oxblood,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
              borderWidth: 1,
              borderColor: 'rgba(180, 106, 116, 0.12)',
            }}
          >
            <MaterialIcons name="account-balance-wallet" size={22} color={Colors.oxblood} />
          </View>
          <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 11, color: Colors.oxblood, marginTop: 6, textAlign: 'center' }}>
            Earn
          </Text>
        </Animated.View>

        {/* Node: Collaborate (Left) */}
        <Animated.View
          entering={active ? slideDownSolid.delay(700) : undefined}
          style={{
            position: 'absolute',
            left: CENTER - RADIUS - NODE_CONTAINER_WIDTH / 2,
            top: CENTER - NODE_SIZE / 2,
            width: NODE_CONTAINER_WIDTH,
            alignItems: 'center',
            zIndex: 4,
          }}
        >
          <View
            style={{
              width: NODE_SIZE,
              height: NODE_SIZE,
              borderRadius: NODE_SIZE / 2,
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: Colors.oxblood,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
              borderWidth: 1,
              borderColor: 'rgba(180, 106, 116, 0.12)',
            }}
          >
            <Feather name="zap" size={22} color={Colors.oxblood} />
          </View>
          <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 11, color: Colors.oxblood, marginTop: 6, textAlign: 'center' }}>
            Collaborate
          </Text>
        </Animated.View>
      </View>

      {/* ── Bottom Reward Card ────────────────────────────── */}
      <Animated.View
        entering={active ? slideUpSolid.delay(800) : undefined}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(180, 106, 116, 0.07)',
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 14,
          marginTop: 15,
          borderWidth: 1,
          borderColor: 'rgba(180, 106, 116, 0.05)',
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(180, 106, 116, 0.12)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Feather name="gift" size={20} color={Colors.oxblood} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FontFamily.sans, fontSize: 12, color: Colors.oxblood, marginBottom: 2 }}>
            Exciting rewards await!
          </Text>
          <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 11, color: Colors.rose, lineHeight: 15 }}>
            Complete your profile and unlock exclusive opportunities.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
