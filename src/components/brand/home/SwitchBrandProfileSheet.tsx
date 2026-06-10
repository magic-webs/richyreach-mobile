import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily } from '@/constants/brand';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore, type BrandProfile } from '@/store/profiles';
import { useUIStore } from '@/store/ui';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Line, Pattern, Rect } from 'react-native-svg';

interface SwitchBrandProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchSuccess: () => void;
  onAddNewProfile: () => void;
}

function ProfileStripes({ id = 'profile-stripes' }: { id?: string }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Pattern
          id={id}
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <Rect width="12" height="12" fill="transparent" />
          <Line x1="0" y1="0" x2="0" y2="12" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
        </Pattern>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

export function SwitchBrandProfileSheet({
  isOpen,
  onClose,
  onSwitchSuccess,
  onAddNewProfile,
}: SwitchBrandProfileSheetProps) {
  const session = useAuthStore((s) => s.session);
  const showModal = useUIStore((s) => s.showModal);
  const { profiles, activeProfileId, setActiveProfileId } = useProfilesStore();

  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const handleSwitch = async (profile: BrandProfile) => {
    if (!session?.user?.id) return;
    if (profile.id === activeProfileId) {
      onClose();
      return;
    }

    setSwitchingId(profile.id);
    try {
      // Save as active local profile ID
      await setActiveProfileId(session.user.id, profile.id);

      showModal({
        title: 'Profile Switched! 🔄',
        message: `Switched active brand profile to "${profile.companyName}".`,
      });

      onSwitchSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to switch profile:", err);
      showModal({
        title: 'Switch Failed',
        message: err?.message || 'Failed to switch brand profile. Please try again.',
      });
    } finally {
      setSwitchingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <BottomSheet
      visible={isOpen}
      title="Switch brand profile"
      icon="users"
      onClose={onClose}
      snapPoints={['60%']}
      hideHeaderBorder
    >
      <View style={{ gap: 14 }}>
        <Text style={styles.sheetSubtitle}>
          Select which brand account to make active and use for launching campaigns.
        </Text>

        <View style={styles.profileList}>
          {profiles.map((p) => {
            const isActive = p.id === activeProfileId;
            const isSwitching = switchingId === p.id;
            const letter = p.companyName.charAt(0).toUpperCase();

            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.profileItem, isActive && styles.profileItemActive]}
                activeOpacity={0.8}
                onPress={() => handleSwitch(p)}
                disabled={switchingId !== null}
              >
                {/* Logo / Avatar */}
                <View style={styles.avatarWrap}>
                  {p.logo ? (
                    <Image source={{ uri: p.logo }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  ) : (
                    <View style={styles.stripesAvatar}>
                      <ProfileStripes id={`item-${p.id}`} />
                      <Text style={styles.avatarText}>{letter}</Text>
                    </View>
                  )}
                </View>

                {/* Details */}
                <View style={styles.profileDetails}>
                  <Text style={styles.companyName} numberOfLines={1}>
                    {p.companyName}
                  </Text>
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {p.category} · {p.website.replace(/^https?:\/\/(www\.)?/i, '')}
                  </Text>
                </View>

                {/* Selection Indicator */}
                <View style={styles.indicatorWrap}>
                  {isSwitching ? (
                    <ActivityIndicator size="small" color={Colors.oxblood} />
                  ) : isActive ? (
                    <View style={styles.checkmarkWrap}>
                      <Icon name="check" size={12} color="#ffffff" />
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ADD NEW BUTTON */}
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.85}
          onPress={() => {
            onClose();
            // Wait slightly for modal transition
            setTimeout(() => {
              onAddNewProfile();
            }, 300);
          }}
          disabled={switchingId !== null}
        >
          <Icon name="plus" size={16} color={Colors.oxblood} />
          <Text style={styles.addBtnText}>Add brand profile</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetSubtitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: 'rgba(63,3,11,0.5)',
    lineHeight: 18,
    marginBottom: 8,
  },
  profileList: {
    gap: 10,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(63,3,11,0.06)',
  },
  profileItemActive: {
    borderColor: Colors.oxblood,
    backgroundColor: 'rgba(63,3,11,0.02)',
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.oxbloodDeep,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
  },
  stripesAvatar: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.sans,
    fontSize: 18,
    color: Colors.cream,
  },
  profileDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  companyName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  categoryName: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
    color: 'rgba(63,3,11,0.5)',
    marginTop: 2,
  },
  indicatorWrap: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(63,3,11,0.25)',
    gap: 8,
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  addBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 13.5,
    color: Colors.oxblood,
  },
});
