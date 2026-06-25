import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
  bannerUrl?: string;
  title: string;
  brandName: string;
  onPickImage: () => void;
  onChangeTitle: (v: string) => void;
  onChangeBrandName: (v: string) => void;
}

export function EditMediaCard({
  bannerUrl,
  title,
  brandName,
  onPickImage,
  onChangeTitle,
  onChangeBrandName,
}: Props) {
  return (
    <View style={styles.formSectionCard}>
      <Text style={styles.formSectionHeader}>Campaign Media & Name</Text>

      <TouchableOpacity style={styles.editBannerContainer} onPress={onPickImage} activeOpacity={0.9}>
        {bannerUrl ? (
          <Image source={{ uri: bannerUrl }} style={styles.editBannerImage} />
        ) : (
          <View style={styles.editBannerPlaceholder}>
            <Icon name="link" size={24} color={Colors.roseDeep} />
            <Text style={styles.editBannerPlaceholderText}>Tap to upload new banner</Text>
          </View>
        )}
        <View style={styles.editBannerOverlay}>
          <Text style={styles.editBannerOverlayText}>Change Image 📸</Text>
        </View>
      </TouchableOpacity>

      <View style={[styles.formGroup, { marginTop: 12 }]}>
        <Text style={styles.formLabel}>Campaign Name *</Text>
        <TextInput
          style={styles.formInput}
          placeholder="e.g. Summer Glow Launch"
          placeholderTextColor="rgba(63,3,11,0.35)"
          value={title}
          onChangeText={onChangeTitle}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Brand Profile Name *</Text>
        <TextInput
          style={styles.formInput}
          placeholder="e.g. L'Oreal Paris"
          placeholderTextColor="rgba(63,3,11,0.35)"
          value={brandName}
          onChangeText={onChangeBrandName}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formSectionCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.05)',
    ...Shadow.card,
    gap: 12,
  },
  formSectionHeader: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.oxblood,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.08)',
    paddingBottom: 4,
    marginBottom: 4,
  },
  editBannerContainer: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.08)',
  },
  editBannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editBannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: 'rgba(63, 3, 11, 0.15)',
    borderRadius: 16,
  },
  editBannerPlaceholderText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.roseDeep,
  },
  editBannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  editBannerOverlayText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.white,
    fontWeight: '700',
  },
  formGroup: {
    gap: 6,
    marginBottom: 4,
  },
  formLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 10.5,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  formInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    fontSize: 14,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
  },
});
