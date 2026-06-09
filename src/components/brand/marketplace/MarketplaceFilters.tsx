import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius } from '@/constants/brand';
import { useUIStore } from '@/store/ui';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface MarketplaceFiltersProps {
  selectedTier: string;
  setSelectedTier: (tier: string) => void;
}

export function MarketplaceFilters({ selectedTier, setSelectedTier }: MarketplaceFiltersProps) {
  const showModal = useUIStore((s) => s.showModal);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterScroll}
      contentContainerStyle={styles.filterScrollContent}
    >
      {['All', 'Mega', 'Macro', 'Micro', 'Nano'].map((tier) => (
        <Chip
          key={tier}
          active={selectedTier === tier}
          onPress={() => setSelectedTier(tier)}
        >
          {tier}
        </Chip>
      ))}

      <TouchableOpacity
        style={styles.sortBtn}
        activeOpacity={0.8}
        onPress={() => showModal({ title: 'Sort Options', message: 'Currently sorting by highest Engagement rate.' })}
      >
        <Icon name="filter" size={13} color={Colors.oxblood} />
        <Text style={styles.sortBtnText}>Eng.</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filterScroll: {
    marginBottom: 18,
    marginHorizontal: -20,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.1)',
  },
  sortBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.oxblood,
  },
});
