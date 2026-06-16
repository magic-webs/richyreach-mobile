import { Icon } from '@/components/ui/icon';
import { RoleToggle } from '@/components/ui/role-toggle';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HomeHeaderProps {
  isBrand: boolean;
  userName: string;
  onRoleChange: (role: 'creator' | 'brand') => void;
  onSearchPress: () => void;
  onProfileSwitchPress?: () => void;
  activeProfileAvatar?: string | null;
  activeProfileHandle?: string | null;
}

export function HomeHeader({
  isBrand,
  userName,
  onRoleChange,
  onSearchPress,
  onProfileSwitchPress,
  activeProfileAvatar,
  activeProfileHandle,
}: HomeHeaderProps) {
  return (
    <View style={styles.header}>
      {/* Header Top */}
      <View style={styles.headerTop}>
        <TouchableOpacity
          onPress={onProfileSwitchPress}
          disabled={!onProfileSwitchPress}
          activeOpacity={0.8}
          style={styles.profileSwitchTrigger}
        >
          <View style={styles.avatarContainer}>
            {activeProfileAvatar ? (
              <Image source={{ uri: activeProfileAvatar }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {activeProfileHandle ? activeProfileHandle.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

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
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  profileSwitchTrigger: { flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1, marginRight: 12 },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(180,106,116,0.15)',
    borderWidth: 1.5,
    borderColor: Colors.oxblood,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.oxbloodDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    color: Colors.cream,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greetSub: { fontSize: 11, color: Colors.rose, fontWeight: '700' },
  greetTitle: { fontFamily: FontFamily.sansMedium, fontSize: 14.5, fontWeight: '700', color: Colors.ink },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, ...Shadow.card },
  searchPlaceholder: { flex: 1, fontSize: 14, color: 'rgba(63,3,11,0.4)' },
  filterBtn: { width: 30, height: 30, borderRadius: 9, backgroundColor: Colors.oxblood, alignItems: 'center', justifyContent: 'center' },
});
