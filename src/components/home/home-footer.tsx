import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily } from '@/constants/brand';

export function HomeFooter() {
  return (
    <LinearGradient
      colors={[Colors.oxblood2, Colors.oxblood, Colors.oxbloodDeep]}
      style={styles.taglineCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Image
        source={require('@/assets/images/richyreach-logo.png')}
        style={styles.taglineSealImage}
        resizeMode="cover"
      />
      <Text style={styles.tagline}>
        Where creators get{'\n'}
        <Text style={[styles.taglineHighlight, { fontStyle: 'italic' }]}>Rich</Text>
        <Text style={{ opacity: 0.3 }}> · </Text>
        Brands get{'\n'}
        <Text style={[styles.taglineHighlight, { fontStyle: 'italic' }]}>Reach</Text>
      </Text>
      <View style={styles.taglineDivider} />
      <Text style={styles.taglineEst}>Richy Reach · est. 2026</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  taglineCard: { borderRadius: 26, padding: 34, alignItems: 'center', marginTop: 30, overflow: 'hidden' },
  taglineSealImage: { width: 56, height: 56, borderRadius: 28, marginBottom: 16 },
  tagline: { fontFamily: FontFamily.serif, fontSize: 30, lineHeight: 38, color: Colors.cream, fontWeight: '500', textAlign: 'center' },
  taglineHighlight: { fontWeight: '700', color: Colors.roseSoft },
  taglineDivider: { width: 38, height: 2, backgroundColor: 'rgba(232,216,204,0.25)', marginTop: 18, marginBottom: 12 },
  taglineEst: { fontSize: 10.5, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(232,216,204,0.45)', fontWeight: '700' },
});
