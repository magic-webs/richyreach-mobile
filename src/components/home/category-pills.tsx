import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Colors, Shadow } from '@/constants/brand';

interface CategoryPillsProps {
  onCatPress: () => void;
}

const CATS = [
  ['flame', 'Trending'],
  ['camera', 'Beauty'],
  ['briefcase', 'Tech'],
  ['heart', 'Fashion'],
  ['bolt', 'Fitness'],
  ['music', 'Music'],
] as const;

export function CategoryPills({ onCatPress }: CategoryPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.catScroll}
      contentContainerStyle={styles.catContent}
    >
      {CATS.map(([ic, lb], k) => {
        const isActive = k === 0;
        return (
          <TouchableOpacity
            key={k}
            onPress={onCatPress}
            activeOpacity={0.8}
            style={styles.catItem}
          >
            <View
              style={[
                styles.catIcon,
                isActive && styles.catIconActive,
              ]}
            >
              <Icon name={ic} size={23} color={isActive ? '#fff' : Colors.oxblood} />
            </View>
            <Text style={styles.catLabel}>{lb}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  catScroll: { marginTop: 18, marginHorizontal: -18, marginBottom: 24 },
  catContent: { paddingHorizontal: 18, gap: 9 },
  catItem: { alignItems: 'center', gap: 6 },
  catIcon: {
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  catIconActive: { ...Shadow.button, shadowColor: Colors.roseDeep, backgroundColor: Colors.rose },
  catLabel: { fontSize: 11, fontWeight: '700', color: Colors.ink },
});
