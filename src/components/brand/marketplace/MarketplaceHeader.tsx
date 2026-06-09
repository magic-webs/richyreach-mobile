import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { useUIStore } from '@/store/ui';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function MarketplaceHeader() {
  const showModal = useUIStore((s) => s.showModal);

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.headerIcon}>
          <Icon name="users" size={20} color={Colors.cream} />
        </View>
        <View>
          <Text style={styles.headerSubtitle}>CREATOR DISCOVERY</Text>
          <Text style={styles.headerTitle}>Find creators</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.inviteListBtn}
        activeOpacity={0.8}
        onPress={() => showModal({ title: 'Invite List', message: 'You have 0 creators currently in your review invite list.' })}
      >
        <Text style={styles.inviteListText}>+ Invite list</Text>
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
