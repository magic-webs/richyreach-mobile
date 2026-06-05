import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontFamily } from '@/constants/brand';

interface SectionHeadProps {
  title: string;
  action?: string | null;
  onAction?: () => void;
  dark?: boolean;
}

export function SectionHead({ title, action = 'See all', onAction, dark = false }: SectionHeadProps) {
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: dark ? Colors.cream : Colors.ink }]}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.action}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  title: {
    fontFamily: FontFamily.serif,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  action: {
    fontSize: 13,
    color: Colors.rose,
    fontWeight: '700',
    marginLeft: 10,
  },
});
