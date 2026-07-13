import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { FontFamily } from '@/constants/brand';

export function LogoHeader() {
  return (
    <View style={styles.logoContainer}>
      <Image
        source={require('@/assets/images/richyreach-logo.png')}
        style={styles.logoImage}
        contentFit="contain"
      />
      <View style={styles.logoTextRow}>
        <Text style={styles.logoText}>Richy</Text>
        <Text style={[styles.logoText, { color: '#8d4750' }]}>Reach</Text>
        <Text style={styles.logoStar}>✦</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  logoImage: {
    width: 54,
    height: 54,
  },
  logoTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  logoText: {
    fontFamily: FontFamily.serif,
    fontSize: 26,
    fontWeight: '700',
    color: '#3f030b', // Colors.oxblood
  },
  logoStar: {
    fontFamily: FontFamily.serif,
    fontSize: 18,
    color: '#8d4750',
    marginLeft: 2,
    alignSelf: 'flex-start',
  },
});
