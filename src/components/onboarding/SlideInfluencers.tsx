import { Colors, FontFamily } from '@/constants/brand';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
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

export function SlideInfluencers({ active }: { active: boolean }) {
  if (!active) {
    return <View style={{ width, flex: 1, backgroundColor: '#f4ece4' }} />;
  }

  // Bar chart stats
  const chartBars = [
    { label: 'Week 1', height: 28, active: false },
    { label: 'Week 2', height: 42, active: false },
    { label: 'Week 3', height: 68, active: true }, // Highlighted/Peak
    { label: 'Week 4', height: 80, active: false },
  ];

  return (
    <View style={{ width, flex: 1, backgroundColor: '#f4ece4', paddingHorizontal: 28, paddingTop: 20 }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <Animated.View entering={active ? slideDownSolid.delay(80) : undefined}>
        <Text style={{ fontFamily: FontFamily.sans, fontSize: 34, color: Colors.oxblood, lineHeight: 40, marginBottom: 6 }}>
          For <Text style={{ color: Colors.oxblood }}>Influencers</Text>
        </Text>
        <Text style={{ fontFamily: FontFamily.serif, fontSize: 22, color: Colors.rose, lineHeight: 28, marginBottom: 8 }}>
          Your <Text style={{ color: Colors.oxblood }}>influence</Text>. Your <Text style={{ color: Colors.oxblood }}>income</Text>.
        </Text>
        <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 13, color: Colors.rose, lineHeight: 18, marginBottom: 16 }}>
          Create content, build your personal brand and collaborate with top brands to earn what you deserve.
        </Text>
      </Animated.View>

      {/* ── Creator Profile & Growth Card ──────────────────── */}
      <Animated.View
        entering={active ? zoomInSolid.delay(200) : undefined}
        style={{
          backgroundColor: '#fff',
          borderRadius: 24,
          padding: 18,
          shadowColor: Colors.oxblood,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 5,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: 'rgba(180, 106, 116, 0.06)',
        }}
      >
        {/* Profile info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Image
            source={require('@/assets/images/ananya_profile.png')}
            style={{ width: 52, height: 52, borderRadius: 26, marginRight: 12 }}
            contentFit="cover"
          />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: FontFamily.sans, fontSize: 15, color: Colors.oxblood }}>
                Ananya Sharma
              </Text>
              <MaterialIcons name="verified" size={15} color={Colors.oxblood} />
            </View>
            <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 11, color: Colors.rose, marginTop: 1 }}>
              Lifestyle • Fashion • Beauty
            </Text>
            <View
              style={{
                backgroundColor: 'rgba(180, 106, 116, 0.08)',
                paddingHorizontal: 8,
                paddingVertical: 2.5,
                borderRadius: 99,
                alignSelf: 'flex-start',
                marginTop: 4,
              }}
            >
              <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 9, color: Colors.oxblood }}>
                Top Creator
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(180, 106, 116, 0.08)', paddingBottom: 12, marginBottom: 12 }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontFamily: FontFamily.sans, fontSize: 15, color: Colors.oxblood }}>120K</Text>
            <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 10, color: Colors.rose, marginTop: 1 }}>Followers</Text>
          </View>
          <View style={{ width: 1, backgroundColor: 'rgba(180, 106, 116, 0.08)' }} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontFamily: FontFamily.sans, fontSize: 15, color: Colors.oxblood }}>8.9%</Text>
            <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 10, color: Colors.rose, marginTop: 1 }}>Engagement</Text>
          </View>
          <View style={{ width: 1, backgroundColor: 'rgba(180, 106, 116, 0.08)' }} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontFamily: FontFamily.sans, fontSize: 15, color: Colors.oxblood }}>₹ 1.2L+</Text>
            <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 10, color: Colors.rose, marginTop: 1 }}>Earnings</Text>
          </View>
        </View>

        {/* Growth Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ fontFamily: FontFamily.sans, fontSize: 12, color: Colors.oxblood }}>Your Growth</Text>
          <View style={{ borderWidth: 1, borderColor: 'rgba(180, 106, 116, 0.15)', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2.5 }}>
            <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 9, color: Colors.rose }}>This Month  ▼</Text>
          </View>
        </View>

        {/* Native Bar Graph Growth Chart */}
        <View style={{ height: 100, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 12 }}>
          {chartBars.map((bar, index) => (
            <View key={index} style={{ alignItems: 'center', flex: 1 }}>
              {/* Peak indicator badge */}
              {bar.active && (
                <View
                  style={{
                    position: 'absolute',
                    top: -24,
                    backgroundColor: Colors.oxblood,
                    borderRadius: 6,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    zIndex: 10,
                  }}
                >
                  <Text style={{ fontFamily: FontFamily.sans, fontSize: 8, color: '#fff' }}>+32%</Text>
                </View>
              )}
              {/* Vertical Bar */}
              <View
                style={{
                  width: 24,
                  height: bar.height,
                  backgroundColor: bar.active ? Colors.oxblood : Colors.roseSoft,
                  borderRadius: 6,
                  shadowColor: Colors.oxblood,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: bar.active ? 0.2 : 0,
                  shadowRadius: 4,
                  elevation: bar.active ? 2 : 0,
                }}
              />
              {/* X-Axis Label */}
              <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 9, color: Colors.rose, marginTop: 6 }}>
                {bar.label}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* ── Feature list below ────────────────────────────── */}
      <Animated.View
        entering={active ? slideUpSolid.delay(350) : undefined}
        style={{ gap: 10 }}
      >
        {/* Item 1 */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(180, 106, 116, 0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <MaterialIcons name="favorite" size={20} color={Colors.oxblood} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 13, color: Colors.oxblood }}>Build Your Brand</Text>
            <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 11, color: Colors.rose, marginTop: 1 }}>Grow your audience and increase engagement.</Text>
          </View>
        </View>

        {/* Item 2 */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(180, 106, 116, 0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Feather name="shopping-bag" size={20} color={Colors.oxblood} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 13, color: Colors.oxblood }}>Collaborate with Brands</Text>
            <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 11, color: Colors.rose, marginTop: 1 }}>Get discovered by top brands and work on exciting campaigns.</Text>
          </View>
        </View>

        {/* Item 3 */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(180, 106, 116, 0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <MaterialIcons name="account-balance-wallet" size={20} color={Colors.oxblood} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 13, color: Colors.oxblood }}>Earn More</Text>
            <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 11, color: Colors.rose, marginTop: 1 }}>Get paid fairly and on-time for your amazing content.</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
