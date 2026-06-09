import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { useUIStore } from '@/store/ui';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function MarketplaceBanner() {
  const showModal = useUIStore((s) => s.showModal);

  return (
    <TouchableOpacity
      style={styles.banner}
      activeOpacity={0.9}
      onPress={() => showModal({ title: 'Swipe & Discover', message: 'Reels-style swipe matching is currently being loaded. Tap "Invite" in the search list to start collaborating immediately!' })}
    >
      <View style={styles.bannerIcon}>
        <Icon name="play" size={18} color={Colors.oxblood} />
      </View>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerSub}>NEW · REELS-STYLE</Text>
        <Text style={styles.bannerTitle}>Swipe & Discover</Text>
        <Text style={styles.bannerDesc}>Find your perfect creator match</Text>
      </View>
      <View style={styles.bannerArrow}>
        <Icon name="arrow" size={18} color={Colors.cream} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 86,
    borderRadius: Radius.xl,
    backgroundColor: Colors.oxbloodDeep,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 20,
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  bannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContent: {
    flex: 1,
    marginLeft: 14,
  },
  bannerSub: {
    fontFamily: FontFamily.sans,
    fontSize: 8,
    color: Colors.roseSoft,
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    color: Colors.cream,
    fontWeight: '700',
    marginTop: -2,
  },
  bannerDesc: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: 'rgba(232, 216, 204, 0.6)',
    marginTop: 2,
  },
  bannerArrow: {
    marginLeft: 10,
  },
});
