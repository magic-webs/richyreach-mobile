import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { RoleToggle } from '@/components/ui/role-toggle';
import { Colors, FontFamily, Shadow } from '@/constants/brand';

interface HomeHeaderProps {
  isBrand: boolean;
  userName: string;
  onRoleChange: (role: 'creator' | 'brand') => void;
  onSearchPress: () => void;
}

export function HomeHeader({ isBrand, userName, onRoleChange, onSearchPress }: HomeHeaderProps) {
  return (
    <View style={styles.header}>
      {/* Header Top */}
      <View style={styles.headerTop}>
        <View style={styles.greetRow}>
          <Image
            source={require('@/assets/images/richyreach-logo.png')}
            style={styles.sealSmallImage}
            resizeMode="cover"
          />
          <View>
            <Text style={styles.greetSub}>
              {isBrand ? 'Welcome, ' : 'Hi, '}
              {userName}
              {!isBrand && ' 👋'}
            </Text>
            <Text style={styles.greetTitle}>
              {isBrand ? "Let's find creators" : "Let's get you paid"}
            </Text>
          </View>
        </View>
        <RoleToggle
          role={isBrand ? 'brand' : 'creator'}
          onChange={onRoleChange}
        />
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        onPress={onSearchPress}
        style={styles.searchBar}
        activeOpacity={0.8}
      >
        <Icon name="search" size={18} color={Colors.rose} />
        <Text style={styles.searchPlaceholder}>
          {isBrand ? 'Search creators, niches…' : 'Search brands, campaigns…'}
        </Text>
        <View style={styles.filterBtn}>
          <Icon name="filter" size={16} color={Colors.cream} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgba(244,236,228,0.9)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.07)',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  greetRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  sealSmallImage: { width: 50, height: 50, borderRadius: 22 },
  greetSub: { fontSize: 11.5, color: Colors.rose, fontWeight: '700' },
  greetTitle: { fontFamily: FontFamily.serif, fontSize: 18, fontWeight: '700', color: Colors.ink },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, ...Shadow.card },
  searchPlaceholder: { flex: 1, fontSize: 14, color: 'rgba(63,3,11,0.4)' },
  filterBtn: { width: 30, height: 30, borderRadius: 9, backgroundColor: Colors.oxblood, alignItems: 'center', justifyContent: 'center' },
});
