import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface HomeHeaderProps {
  isBrand: boolean;
  userName: string;
  onRoleChange: (role: 'creator' | 'brand') => void;
  onSearchPress: () => void;
  onProfileSwitchPress?: () => void;
  activeProfileAvatar?: string | null;
  activeProfileHandle?: string | null;
  onNotificationPress?: () => void;
  hasUnread?: boolean;
}

export function HomeHeader({
  isBrand,
  userName,
  onRoleChange,
  onSearchPress,
  onProfileSwitchPress,
  activeProfileAvatar,
  activeProfileHandle,
  onNotificationPress,
  hasUnread = false,
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
          <View style={styles.textContainer}>
            <Text style={styles.greetSub}>
              {activeProfileHandle ? `@${activeProfileHandle}` : userName}
            </Text>
            <View style={styles.switchRow}>
              <Text style={styles.greetTitle}>
                {isBrand ? 'Brand Account' : 'Creator Account'}
              </Text>
              {onProfileSwitchPress && <Icon name="chevDown" size={13} color={Colors.oxblood} />}
            </View>
          </View>
        </TouchableOpacity>

        {/* Notification Bell Button */}
        <TouchableOpacity
          onPress={onNotificationPress}
          disabled={!onNotificationPress}
          activeOpacity={0.85}
          style={styles.notificationTrigger}
        >
          <Svg
            viewBox="0 0 24 24"
            width={21}
            height={21}
            color={Colors.oxblood}
            fill="none"
            stroke={Colors.oxblood}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M15.5 18C15.5 19.933 13.933 21.5 12 21.5C10.067 21.5 8.5 19.933 8.5 18" />
            <Path d="M19.2311 18H4.76887C3.79195 18 3 17.208 3 16.2311C3 15.762 3.18636 15.3121 3.51809 14.9803L4.12132 14.3771C4.68393 13.8145 5 13.0514 5 12.2558V9.5C5 5.63401 8.13401 2.5 12 2.5C15.866 2.5 19 5.634 19 9.5V12.2558C19 13.0514 19.3161 13.8145 19.8787 14.3771L20.4819 14.9803C20.8136 15.3121 21 15.762 21 16.2311C21 17.208 20.208 18 19.2311 18Z" />
          </Svg>
          {hasUnread && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
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
  notificationTrigger: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(63,3,11,0.06)',
    position: 'relative',
    ...Shadow.card,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
    borderWidth: 1.2,
    borderColor: '#fff',
  },
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
