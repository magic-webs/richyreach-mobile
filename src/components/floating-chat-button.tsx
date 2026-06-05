import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Shadow } from '@/constants/brand';
import { GradientView } from './ui/gradient-view';
import { Icon } from './ui/icon';

export function FloatingChatButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push('/chat')}
      activeOpacity={0.85}
      style={styles.wrapper}
    >
      <GradientView variant="rose" style={styles.btn}>
        <Icon name="chat" size={25} color="#fff" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>3</Text>
        </View>
      </GradientView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 18,
    bottom: 92,
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
