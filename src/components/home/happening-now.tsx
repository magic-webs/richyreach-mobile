import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { Image } from 'expo-image';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

interface HappeningNowProps {
  activity: any[];
  campaigns?: any[];
}

function generateMockIndianData(campaigns?: any[]) {
  const maleNames = [
    'Aarav', 'Kabir', 'Vihaan', 'Arjun', 'Sai', 'Aditya', 'Krishna', 'Aryan', 'Shaurya', 'Rohit',
    'Rahul', 'Amit', 'Karan', 'Yash', 'Raj', 'Vivek', 'Varun', 'Siddharth', 'Kunal', 'Dev',
    'Ishaan', 'Neil', 'Riaan', 'Reyansh', 'Atharva', 'Vivaan', 'Dhruv', 'Parth', 'Hrithik', 'Abhishek'
  ];
  const femaleNames = [
    'Aanya', 'Diya', 'Priya', 'Pooja', 'Sneha', 'Deepika', 'Kiara', 'Ananya', 'Myra', 'Ira',
    'Riya', 'Neha', 'Tanvi', 'Avani', 'Isha', 'Meera', 'Shruti', 'Riddhi', 'Siddhi', 'Kavya',
    'Aditi', 'Anjali', 'Simran', 'Muskan', 'Kritika', 'Alisha', 'Ritu', 'Payal', 'Sonam', 'Preeti'
  ];
  const lastNames = [
    'Sharma', 'Verma', 'Mehta', 'Patel', 'Joshi', 'Reddy', 'Rao', 'Nair', 'Iyer', 'Gupta',
    'Kapoor', 'Khan', 'Singh', 'Roy', 'Das', 'Banerjee', 'Mukherjee', 'Sen', 'Bhat', 'Kulkarni',
    'Deshmukh', 'Malhotra', 'Singhal', 'Goel', 'Bansal', 'Agarwal', 'Mishra', 'Trivedi', 'Shah', 'Saxena'
  ];

  // Extract unique brands from live campaigns, fallback to standard mock brands
  const liveBrands = campaigns && campaigns.length > 0
    ? Array.from(new Set(
        campaigns.map((c) => {
          if (typeof c === 'string') return c;
          return c.brand || c.brandName || (c.brand && typeof c.brand === 'object' ? c.brand.companyName : null);
        }).filter(Boolean)
      ))
    : ['Lumière Beauty', 'Atlas Watches', 'Verre Skincare', 'Élan Active', 'Aurora Tech', 'Maison Noir'];

  const fallbackBrands = liveBrands.length > 0 ? liveBrands : ['Lumière Beauty', 'Atlas Watches', 'Verre Skincare', 'Élan Active', 'Aurora Tech', 'Maison Noir'];

  const list = [];
  for (let i = 0; i < 200; i++) {
    const isMale = i % 2 === 0;
    const firstName = isMale 
      ? maleNames[i % maleNames.length] 
      : femaleNames[i % femaleNames.length];
    const lastName = lastNames[(i * 3) % lastNames.length];
    const who = `${firstName} ${lastName}`;
    
    // Pick brand deterministically from our liveBrands list
    const brand = fallbackBrands[i % fallbackBrands.length];

    const actions = [
      { act: 'applied to', detail: `${brand} campaign`, icon: 'zap', tone: 'rose' },
      { act: 'signed collab with', detail: brand, icon: 'briefcase', tone: 'ox' },
      { act: 'received payout of AMOUNT from', detail: brand, icon: 'wallet', tone: 'rose' },
      { act: 'completed campaign for', detail: brand, icon: 'check', tone: 'ox' },
      { act: 'joined as a', detail: 'verified Richy Creator', icon: 'verified', tone: 'rose' },
      { act: 'uploaded draft for', detail: `${brand}'s campaign`, icon: 'camera', tone: 'cream' },
      { act: 'got invited to', detail: `${brand} launch event`, icon: 'bell', tone: 'ox' },
      { act: 'submitted analytics to', detail: `${brand} campaign`, icon: 'chart', tone: 'cream' },
      { act: 'received bonus of AMOUNT from', detail: brand, icon: 'gift', tone: 'ox' },
      { act: 'unlocked VIP badge in', detail: 'Richy Creator Arena', icon: 'crown', tone: 'rose' },
      { act: 'reached 50k views on Reel for', detail: brand, icon: 'flame', tone: 'ox' },
      { act: 'got featured on homepage by', detail: 'RichyReach Team', icon: 'star', tone: 'rose' },
      { act: 'collaborated with', detail: `${brand} on a new campaign`, icon: 'users', tone: 'cream' },
      { act: 'scheduled live session with', detail: brand, icon: 'calendar', tone: 'ox' },
      { act: 'shared campaign review of', detail: brand, icon: 'share', tone: 'rose' }
    ];

    const actionObj = actions[(i * 7) % actions.length];
    
    let act = actionObj.act;
    let detail = actionObj.detail;
    let icon = actionObj.icon;
    let tone = actionObj.tone as 'rose' | 'ox' | 'cream';
    
    if (act.includes('AMOUNT')) {
      const amounts = ['₹8,000', '₹15,000', '₹22,000', '₹35,000', '₹18,500', '₹10,000'];
      const amt = amounts[i % amounts.length];
      act = act.replace('AMOUNT', amt);
    }

    let time = 'now';
    if (i > 0) {
      if (i < 10) {
        time = `${i * 4}s ago`;
      } else if (i < 60) {
        time = `${Math.floor(i / 2.5)}m ago`;
      } else {
        time = `${Math.floor(i / 15)}h ago`;
      }
    }

    list.push({
      who,
      verified: i % 5 === 0,
      act,
      detail,
      time,
      tone,
      icon,
    });
  }
  return list;
}

export function HappeningNow({ activity, campaigns }: HappeningNowProps) {
  const rotateAnim = React.useMemo(() => new Animated.Value(0), []);
  const opacityAnim = React.useMemo(() => new Animated.Value(1), []);
  const translateYAnim = React.useMemo(() => new Animated.Value(0), []);

  const [currentIndex, setCurrentIndex] = React.useState(0);

  const mockData = React.useMemo(() => generateMockIndianData(campaigns), [campaigns]);
  
  const combinedActivity = React.useMemo(() => {
    const list = !activity || activity.length === 0 ? mockData : [...activity, ...mockData];
    return list.filter((item) => item.icon !== 'chat');
  }, [activity, mockData]);

  // Spin animation for the rotating border
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [rotateAnim]);

  // One-by-one slide-and-fade transition
  useEffect(() => {
    if (combinedActivity.length === 0) return;

    const interval = setInterval(() => {
      // Exit: Slide up and fade out
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -15,
          duration: 350,
          useNativeDriver: true,
        })
      ]).start(() => {
        // State update and positioning reset
        setCurrentIndex((prev) => (prev + 1) % combinedActivity.length);
        translateYAnim.setValue(15);

        // Entry: Slide up and fade in
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          })
        ]).start();
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [combinedActivity.length, opacityAnim, translateYAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const currentItem = combinedActivity[currentIndex];

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <GradientView variant="oxblood" style={styles.sectionIcon}>
          <Icon name="bolt" size={16} color={Colors.cream} />
        </GradientView>
        <Text style={styles.sectionTitle}>Happening now</Text>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Activity Card with Animated Gradient Border */}
      <View style={styles.shadowContainer}>
        <View style={styles.borderContainer}>
          <Animated.View style={[styles.gradientWrapper, { transform: [{ rotate: spin }] }]}>
            <LinearGradient
              colors={[Colors.rose, Colors.oxblood, Colors.roseSoft, Colors.oxblood, Colors.rose]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            />
          </Animated.View>

          <View style={styles.activityCard}>
            {currentItem && (
              <Animated.View style={[styles.activityRow, { opacity: opacityAnim, transform: [{ translateY: translateYAnim }] }]}>
                <View style={styles.activityAvatarWrap}>
                  <Image
                    source={{ uri: currentItem.avatar || 'https://pub-c7a89526fe7541b0a1d6bc2d831710d2.r2.dev/plaform-images/avatar.png' }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                  <GradientView variant="rose" style={styles.activityIconBadge}>
                    <Icon name={currentItem.icon} size={10} color="#fff" />
                  </GradientView>
                </View>
                <Text style={styles.activityText} numberOfLines={2}>
                  <Text style={styles.activityWho}>{currentItem.who}</Text>
                  {currentItem.verified && ' ✓ '}
                  <Text style={styles.activityAct}> {currentItem.act} </Text>
                  {currentItem.detail}
                </Text>
                <Text style={styles.activityTime}>{currentItem.time}</Text>
              </Animated.View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 30 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontFamily: FontFamily.sansMedium, fontSize: 20, fontWeight: '700', color: Colors.ink, flex: 1 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(180,106,116,0.12)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99 },
  liveDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: Colors.rose },
  liveText: { fontSize: 11, fontWeight: '700', color: Colors.rose },
  shadowContainer: {
    ...Shadow.card,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  borderContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 1.5,
    position: 'relative',
    backgroundColor: Colors.white,
  },
  gradientWrapper: {
    position: 'absolute',
    width: '200%',
    height: '400%',
    top: '-150%',
    left: '-50%',
  },
  gradient: {
    flex: 1,
  },
  activityCard: { backgroundColor: '#fff', borderRadius: 18.5, overflow: 'hidden', height: 64 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, height: 64 },
  activityAvatarWrap: { position: 'relative', flexShrink: 0 },
  avatarImage: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(63,3,11,0.05)' },
  activityIconBadge: { position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 99, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff' },
  activityText: { flex: 1, fontSize: 13, color: Colors.ink, lineHeight: 18 },
  activityWho: { fontWeight: '700' },
  activityAct: { color: 'rgba(63,3,11,0.58)' },
  activityTime: { fontSize: 11, color: Colors.rose, fontWeight: '600', flexShrink: 0 },
});
