import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors, FontFamily } from '@/constants/brand';

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  dark?: boolean;
  onPress?: () => void;
}

export function Chip({ children, active = false, dark = false, onPress }: ChipProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[
      styles.base,
      active && (dark ? styles.activeDark : styles.activeLight),
      !active && (dark ? styles.inactiveDark : styles.inactiveLight),
    ]}>
      <Text style={[
        styles.text,
        { color: active ? (dark ? Colors.oxblood : Colors.cream) : (dark ? Colors.cream : Colors.oxblood) },
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDark: { backgroundColor: Colors.cream },
  activeLight: { backgroundColor: Colors.oxblood },
  inactiveDark: {
    backgroundColor: 'rgba(232,216,204,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.22)',
  },
  inactiveLight: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.16)',
  },
  text: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
