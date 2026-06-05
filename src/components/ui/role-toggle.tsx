import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontFamily } from '@/constants/brand';

interface RoleToggleProps {
  role: 'creator' | 'brand';
  dark?: boolean;
  onChange: (role: 'creator' | 'brand') => void;
}

const opts: ['creator' | 'brand', string][] = [['creator', 'Creator'], ['brand', 'Brand']];

export function RoleToggle({ role, dark = false, onChange }: RoleToggleProps) {
  return (
    <View style={[styles.container, dark ? styles.containerDark : styles.containerLight]}>
      {opts.map(([v, label]) => {
        const on = role === v;
        return (
          <TouchableOpacity
            key={v}
            onPress={() => onChange(v)}
            activeOpacity={0.8}
            style={[styles.btn, on && (dark ? styles.activeDark : styles.activeLight)]}
          >
            <Text style={[
              styles.text,
              { color: on ? (dark ? Colors.oxblood : Colors.cream) : (dark ? 'rgba(232,216,204,0.6)' : 'rgba(63,3,11,0.5)') },
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 999,
  },
  containerLight: {
    backgroundColor: 'rgba(63,3,11,0.07)',
  },
  containerDark: {
    backgroundColor: 'rgba(232,216,204,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.16)',
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 999,
  },
  activeDark: { backgroundColor: Colors.cream },
  activeLight: { backgroundColor: Colors.oxblood },
  text: {
    fontFamily: FontFamily.sans,
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
