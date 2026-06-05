import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import Animated, { FadeIn, FadeOut, FadeInRight, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { FloatingChatButton } from '@/components/floating-chat-button';
import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';

const TABS = [
  { key: 'index', icon: 'home', label: 'Home' },
  { key: 'marketplace', icon: 'grid', label: 'Market' },
  { key: 'arena', icon: 'arena', label: 'Arena' },
  { key: 'profile', icon: 'user', label: 'Profile' },
] as const;

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const activeIdx = state.index;

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.tabBar}>
        <GlassView style={StyleSheet.absoluteFill} glassEffectStyle="regular" pointerEvents="none" />
        <View style={styles.glassShine} pointerEvents="none" />
        {TABS.map((tab, i) => {
          const on = i === activeIdx;
          return (
            <Animated.View
              key={tab.key}
              layout={LinearTransition.springify().mass(0.8).damping(16).stiffness(150)}
              style={[styles.tabItem, on && styles.tabItemActive]}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate(tab.key)}
                activeOpacity={0.8}
                style={StyleSheet.absoluteFill}
              />
              {on ? (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(150)}
                  pointerEvents="none"
                  style={styles.activeContainer}
                >
                  <GradientView variant="oxblood" style={styles.tabGradient}>
                    <Icon name={tab.icon} size={22} color={Colors.cream} />
                    <Animated.Text
                      entering={FadeInRight.delay(60).duration(200)}
                      exiting={FadeOutLeft.duration(120)}
                      style={styles.tabLabelActive}
                    >
                      {tab.label}
                    </Animated.Text>
                  </GradientView>
                </Animated.View>
              ) : (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(150)}
                  pointerEvents="none"
                >
                  <Icon name={tab.icon} size={22} color="rgba(63,3,11,0.5)" />
                </Animated.View>
              )}
            </Animated.View>
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
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 7,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.35)',
    ...Shadow.tab,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.65)',
    overflow: 'hidden',
  },
  glassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  tabItem: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  tabItemActive: {
    flex: 1,
    borderRadius: 22,
  },
  activeContainer: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  tabGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 18,
    height: 48,
    borderRadius: 22,
    ...Shadow.button,
    shadowColor: Colors.oxblood,
    shadowOpacity: 0.55,
  },
  tabLabelActive: {
    fontFamily: FontFamily.sans,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.cream,
    letterSpacing: 0.2,
  },
});
