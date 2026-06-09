import { BrandRow } from '@/components/onboarding/BrandRow';
import { Colors, FontFamily } from '@/constants/brand';
import { MaterialIcons } from '@expo/vector-icons';
import { Dimensions, Platform, Text, View } from 'react-native';
import Animated, { Keyframe } from 'react-native-reanimated';

const screenWidth = Dimensions.get('window').width;
const width = Platform.OS === 'web' ? Math.min(screenWidth, 450) : screenWidth;

const brands = [
  { iconName: 'spa' as const, iconColor: '#b46a74', name: 'Mamaearth', category: 'Beauty & Wellness', campaigns: '12 active' },
  { iconName: 'directions-run' as const, iconColor: '#3f030b', name: 'Campus Shoes', category: 'Fashion & Lifestyle', campaigns: '8 active' },
  { iconName: 'fastfood' as const, iconColor: '#e87c3e', name: 'Swiggy Instamart', category: 'Food & Grocery', campaigns: '5 active' },
];

const stats = [
  { iconName: 'show-chart' as const, iconColor: '#b46a74', value: '3x', label: 'Avg. ROI' },
  { iconName: 'bolt' as const, iconColor: '#e8b84b', value: '48h', label: 'Launch Time' },
  { iconName: 'verified' as const, iconColor: '#2a7a5a', value: '98%', label: 'Verified' },
];

const slideDownSolid = new Keyframe({
  0: { transform: [{ translateY: -20 }] },
  100: { transform: [{ translateY: 0 }] },
}).duration(500);

const slideUpSolid = new Keyframe({
  0: { transform: [{ translateY: 20 }] },
  100: { transform: [{ translateY: 0 }] },
}).duration(500);

export function SlideBrands({ active }: { active: boolean }) {
  if (!active) {
    return <View style={{ width, flex: 1, backgroundColor: '#f4ece4' }} />;
  }

  return (
    <View style={{ width, flex: 1, backgroundColor: '#f4ece4', paddingHorizontal: 28, paddingTop: 20 }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <Animated.View entering={active ? slideDownSolid.delay(80) : undefined}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View
            style={{
              width: 36, height: 36, borderRadius: 12,
              backgroundColor: Colors.oxblood + '14',
              alignItems: 'center', justifyContent: 'center', marginRight: 10,
            }}
          >
            <MaterialIcons name="business" size={18} color={Colors.oxblood} />
          </View>
          <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 12, color: Colors.rose }}>
            For Brands
          </Text>
        </View>

        <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 34, color: Colors.oxblood, lineHeight: 40, marginBottom: 6 }}>
          Find the right creators.{'\n'}Drive real impact.
        </Text>
        <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 15, color: Colors.rose, lineHeight: 20, marginBottom: 16 }}>
          Browse verified creators, launch campaigns fast, and track ROI in real-time.
        </Text>
      </Animated.View>

      {/* ── Brand list ──────────────────────────────────────── */}
      <Animated.View entering={active ? slideUpSolid.delay(200) : undefined}>
        {brands.map((b) => (
          <BrandRow key={b.name} {...b} />
        ))}
      </Animated.View>

      {/* ── Stat tiles (INLINE flex-row — NOT NativeWind) ────── */}
      <Animated.View
        entering={active ? slideUpSolid.delay(400) : undefined}
        style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}
      >
        {stats.map((s) => (
          <View
            key={s.label}
            style={{
              flex: 1,
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 14,
              alignItems: 'flex-start',
              shadowColor: Colors.oxblood,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 34, height: 34, borderRadius: 10,
                backgroundColor: s.iconColor + '18',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              <MaterialIcons name={s.iconName} size={18} color={s.iconColor} />
            </View>
            <Text style={{ fontFamily: FontFamily.sans, fontSize: 18, color: Colors.oxblood }}>
              {s.value}
            </Text>
            <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 10, color: Colors.rose, marginTop: 2 }}>
              {s.label}
            </Text>
          </View>
        ))}
      </Animated.View>

      {/* ── Campaign activity bar ─────────────────────────── */}
      <Animated.View
        entering={active ? slideUpSolid.delay(550) : undefined}
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 14,
          marginTop: 12,
          shadowColor: Colors.oxblood,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 12, color: Colors.ink }}>
            Active Campaigns by Category
          </Text>
        </View>
        {[
          { label: 'Beauty', pct: 0.78, color: Colors.rose },
          { label: 'Fashion', pct: 0.55, color: Colors.oxblood },
          { label: 'Food', pct: 0.36, color: '#e87c3e' },
        ].map((bar) => (
          <View key={bar.label} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 10, color: Colors.rose }}>{bar.label}</Text>
              <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 10, color: Colors.ink }}>{Math.round(bar.pct * 100)}%</Text>
            </View>
            <View style={{ height: 5, borderRadius: 3, backgroundColor: Colors.creamDk }}>
              <View style={{ height: 5, borderRadius: 3, width: `${bar.pct * 100}%`, backgroundColor: bar.color }} />
            </View>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
