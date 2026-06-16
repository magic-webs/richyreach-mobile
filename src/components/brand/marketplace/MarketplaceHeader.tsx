import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { useUIStore } from '@/store/ui';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MarketplaceHeaderProps {
  activeBrandLogo?: string | null;
  activeBrandName?: string | null;
  onProfileSwitchPress?: () => void;
  selectedCount?: number;
  onSelectedPress?: () => void;
}

export function MarketplaceHeader({
  activeBrandLogo,
  activeBrandName,
  onProfileSwitchPress,
  selectedCount = 0,
  onSelectedPress,
}: MarketplaceHeaderProps) {
  const showModal = useUIStore((s) => s.showModal);

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onProfileSwitchPress}
        disabled={!onProfileSwitchPress}
        activeOpacity={0.8}
        style={styles.headerLeft}
      >
        <View style={styles.headerIcon}>
          {activeBrandLogo ? (
            <Image source={{ uri: activeBrandLogo }} style={styles.logoImage} contentFit="cover" />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {activeBrandName ? activeBrandName.charAt(0).toUpperCase() : 'B'}
              </Text>
            </View>
          )}
        </View>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={styles.headerSubtitle}>CREATOR DISCOVERY</Text>
            {onProfileSwitchPress && <Icon name="chevDown" size={10} color={Colors.roseDeep} />}
          </View>
          <Text style={styles.headerTitle}>{activeBrandName || 'Find creators'}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.inviteListBtn}
        activeOpacity={0.8}
        onPress={onSelectedPress || (() => showModal({ title: 'Shortlist', message: `You have ${selectedCount} items shortlisted.` }))}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Icon name="bookmark" size={13} color={Colors.cream} />
          <Text style={styles.inviteListText}>Shortlist ({selectedCount})</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.07)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.oxbloodDeep,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.oxbloodDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    color: Colors.cream,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontFamily: FontFamily.sans,
    fontSize: 9.5,
    color: Colors.roseDeep,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    color: Colors.oxblood,
    fontWeight: '700',
    marginTop: -2,
  },
  inviteListBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.oxblood,
  },
  inviteListText: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.cream,
  },
});
