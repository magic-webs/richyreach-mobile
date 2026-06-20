import { Colors, Shadow } from '@/constants/brand';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GradientView } from './ui/gradient-view';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Chatting01FreeIcons } from '@hugeicons/core-free-icons';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function FloatingChatButton() {
  const router = useRouter();
  const pathname = usePathname();

  const { data: rooms } = useQuery({
    queryKey: ['chatRooms'],
    queryFn: () => api.chat.rooms().catch(() => []),
    refetchInterval: 30000, // refresh every 30s
  });

  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-6, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // infinite repeats
      true // reverse animation direction
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const count = rooms?.length ?? 0;

  // Hide on marketplace pages for both brand and influencer
  if (pathname.includes('marketplace')) return null;

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <TouchableOpacity
        onPress={() => router.push('/chat')}
        activeOpacity={0.85}
      >
        <GradientView variant="rose" style={styles.btn}>
          <HugeiconsIcon
            icon={Chatting01FreeIcons}
            size={25} color="#fff"
            strokeWidth={2}
          />
        </GradientView>
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 18,
    bottom: 100,
    zIndex: 25,
  },
  btn: {
    width: 56,
    height: 56,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.button,
    shadowColor: Colors.roseDeep,
    shadowOpacity: 0.75,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 99,
    backgroundColor: Colors.oxblood,
    borderWidth: 2,
    borderColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.cream,
    fontSize: 11,
    fontWeight: '800',
  },
});
