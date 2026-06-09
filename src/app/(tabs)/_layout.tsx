import { FloatingChatButton } from '@/components/floating-chat-button';
import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '@/store/auth';

const CREATOR_TABS = [
  { key: 'index', icon: 'home', label: 'Home' },
  { key: 'marketplace', icon: 'grid', label: 'Market' },
  { key: 'arena', icon: 'arena', label: 'Arena' },
  { key: 'profile', icon: 'user', label: 'Profile' },
] as const;

const BRAND_TABS = [
  { key: 'brand/index', icon: 'home', label: 'Home' },
  { key: 'brand/marketplace', icon: 'grid', label: 'Market' },
  { key: 'brand/arena', icon: 'arena', label: 'Arena' },
  { key: 'brand/profile', icon: 'user', label: 'Profile' },
] as const;

interface TabBarItemProps {
  tab: { readonly key: string; readonly icon: string; readonly label: string; };
  on: boolean;
  navigation: any;
}

function TabBarItem({ tab, on, navigation }: TabBarItemProps) {
  const progress = useSharedValue(on ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(on ? 1 : 0, {
      duration: 250,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
  }, [on, progress]);

  const animatedItemStyle = useAnimatedStyle(() => {
    return {
      flex: 1 + progress.value * 1.2,
    };
  });

  const animatedBgStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [
        { scale: 0.95 + 0.05 * progress.value },
      ],
    };
  });

  const animatedIconActiveStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [{ scale: 0.5 + 0.5 * progress.value }],
    };
  });

  const animatedIconInactiveStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - progress.value,
      transform: [{ scale: 1 - 0.2 * progress.value }],
    };
  });

  const animatedLabelStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      maxWidth: progress.value * 90,
      marginLeft: progress.value * 8,
      transform: [
        { translateX: (1 - progress.value) * -10 }
      ]
    };
  });

  return (
    <Animated.View style={[styles.tabItem, animatedItemStyle]}>
      {/* Background Pill */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedBgStyle]} pointerEvents="none">
        <GradientView variant="oxblood" style={styles.tabGradientAbsolute} />
      </Animated.View>

      {/* Button for touch interaction */}
      <TouchableOpacity
        onPress={() => navigation.navigate(tab.key)}
        activeOpacity={0.7}
        style={StyleSheet.absoluteFill}
      />

      {/* Content */}
      <View style={styles.contentContainer} pointerEvents="none">
        <View style={styles.iconWrapper}>
          <Animated.View style={[styles.absoluteIcon, animatedIconActiveStyle]}>
            <Icon name={tab.icon} size={22} color={Colors.cream} />
          </Animated.View>
          <Animated.View style={[styles.absoluteIcon, animatedIconInactiveStyle]}>
            <Icon name={tab.icon} size={22} color="rgba(63, 3, 11, 0.69)" />
          </Animated.View>
        </View>

        <Animated.View style={[styles.labelWrapper, animatedLabelStyle]}>
          <Animated.Text numberOfLines={1} style={styles.tabLabelActive}>
            {tab.label}
          </Animated.Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const role = useAuthStore((s) => s.role);
  const activeTabs = role === 'brand' ? BRAND_TABS : CREATOR_TABS;
  
  const activeRouteName = state.routes[state.index].name;
  const activeIdx = activeTabs.findIndex((tab) => tab.key === activeRouteName);

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.tabBar}>
        {activeTabs.map((tab, i) => {
          const on = i === activeIdx;
          return (
            <TabBarItem
              key={tab.key}
              tab={tab}
              on={on}
              navigation={navigation}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="marketplace" />
        <Tabs.Screen name="arena" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="brand/index" />
        <Tabs.Screen name="brand/marketplace" />
        <Tabs.Screen name="brand/arena" />
        <Tabs.Screen name="brand/profile" />
      </Tabs>
      <FloatingChatButton />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingTop: 8,
    backgroundColor: 'transparent'
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 7,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    ...Shadow.tab,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.65)',
    overflow: 'hidden',
  },
  tabItem: {
    height: 48,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabGradientAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 22,
    ...Shadow.button,
    shadowColor: Colors.oxblood,
    shadowOpacity: 0.55,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,
  },
  iconWrapper: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  absoluteIcon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrapper: {
    overflow: 'hidden',
    justifyContent: 'center',
  },
  tabLabelActive: {
    fontFamily: FontFamily.sans,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.cream,
    letterSpacing: 0.2,
  },
});
