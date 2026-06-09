import { StatCard } from '@/components/onboarding/StatCard';
import { Colors, FontFamily } from '@/constants/brand';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Dimensions, Platform, Text, View } from 'react-native';
import Animated, { Keyframe } from 'react-native-reanimated';

const screenWidth = Dimensions.get('window').width;
const width = Platform.OS === 'web' ? Math.min(screenWidth, 450) : screenWidth;
const CIRCLE = width * 0.78;

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

export function SlideWelcome({ active }: { active: boolean }) {
  if (!active) {
    return <View style={{ width, flex: 1, backgroundColor: '#f4ece4' }} />;
  }

  return (
    <View style={{ width, flex: 1, backgroundColor: '#f4ece4' }}>
      <Animated.View
        entering={active ? slideDownSolid.delay(80) : undefined}
        style={{ paddingHorizontal: 28, paddingTop: 20 }}
      >
        {/* Badge */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.oxblood + '14',
            alignSelf: 'flex-start',
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginBottom: 12,
          }}
        >
          <MaterialIcons name="auto-awesome" size={12} color={Colors.oxblood} />
          <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 11, color: Colors.oxblood, marginLeft: 4 }}>
            #1 Influencer Platform
          </Text>
        </View>

        <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 13, color: Colors.rose, marginBottom: 2 }}>
          Welcome to
        </Text>
        <Text style={{ fontFamily: FontFamily.serif, fontSize: 40, color: Colors.oxblood, lineHeight: 44 }}>
          RichyReach 👋
        </Text>
        <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 13, color: Colors.rose, marginTop: 8, lineHeight: 20 }}>
          Where brands and influencers collaborate,{'\n'}create impact and grow together.
        </Text>
      </Animated.View>

      {/* ── Image + Floating stat cards ──────────────────────── */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: 8 }}>

        {/* Circular background (beige blob) */}
        <View
          style={{
            position: 'absolute',
            width: CIRCLE,
            height: CIRCLE,
            borderRadius: CIRCLE / 2,
            backgroundColor: Colors.creamDk,
            opacity: 0.6,
          }}
        />

        {/* Image clipped to a circle to remove pink bg corners */}
        <View
          style={{
            width: CIRCLE * 0.88,
            height: CIRCLE * 0.88,
            borderRadius: (CIRCLE * 0.88) / 2,
            overflow: 'hidden',
            zIndex: 2,
          }}
        >
          <Image
            source={require('@/assets/images/onboarding-actor.png')}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        </View>

        {/* Top-left: Influencers */}
        <Animated.View
          entering={active ? zoomInSolid.delay(300) : undefined}
          style={{ position: 'absolute', left: 14, top: '5%', zIndex: 10 }}
        >
          <StatCard iconName="group" iconColor={Colors.oxblood} value="2.5M+" label="Influencers" />
        </Animated.View>

        {/* Top-right: Paid Earnings */}
        <Animated.View
          entering={active ? zoomInSolid.delay(440) : undefined}
          style={{ position: 'absolute', right: 10, top: '18%', zIndex: 10 }}
        >
          <StatCard iconName="account-balance-wallet" iconColor={Colors.rose} value="₹2.4Cr+" label="Paid Earnings" />
        </Animated.View>

        {/* Bottom-left: Engagement */}
        <Animated.View
          entering={active ? zoomInSolid.delay(540) : undefined}
          style={{ position: 'absolute', left: 14, bottom: '10%', zIndex: 10 }}
        >
          <StatCard iconName="trending-up" iconColor={Colors.green} value="4.8x" label="Avg. Engagement" />
        </Animated.View>

        {/* Bottom-right: Likes */}
        <Animated.View
          entering={active ? zoomInSolid.delay(640) : undefined}
          style={{ position: 'absolute', right: 10, bottom: '20%', zIndex: 10 }}
        >
          <StatCard iconName="favorite" iconColor="#e05a6a" value="12.4K" label="Likes" />
        </Animated.View>
      </View>

      {/* ── Trust strip ──────────────────────────────────────── */}
      <Animated.View
        entering={active ? slideUpSolid.delay(700) : undefined}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderRadius: 20,
          marginHorizontal: 28,
          marginBottom: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          shadowColor: Colors.oxblood,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.07,
          shadowRadius: 14,
          elevation: 4,
        }}
      >
        <View
          style={{
            width: 40, height: 40, borderRadius: 14,
            backgroundColor: Colors.oxblood + '12',
            alignItems: 'center', justifyContent: 'center', marginRight: 12,
          }}
        >
          <MaterialIcons name="verified-user" size={20} color={Colors.oxblood} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FontFamily.sans, fontSize: 12, color: Colors.oxblood }}>
            Safe • Transparent • Rewarding
          </Text>
          <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 11, color: Colors.rose, marginTop: 2, lineHeight: 16 }}>
            Verified brands. Secure payments. Real opportunities.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
