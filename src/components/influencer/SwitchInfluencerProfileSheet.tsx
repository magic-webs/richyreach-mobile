import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily } from '@/constants/brand';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore, type InfluencerProfile } from '@/store/profiles';
import { useUIStore } from '@/store/ui';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SwitchInfluencerProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchSuccess: () => void;
  onAddNewProfile: () => void;
}

export function SwitchInfluencerProfileSheet({
  isOpen,
  onClose,
  onSwitchSuccess,
  onAddNewProfile,
}: SwitchInfluencerProfileSheetProps) {
  const session = useAuthStore((s) => s.session);
  const showModal = useUIStore((s) => s.showModal);
  const { influencerProfiles, activeInfluencerProfileId, setActiveInfluencerProfileId } = useProfilesStore();

  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const handleSwitch = async (profile: InfluencerProfile) => {
    if (!session?.user?.id) return;
    if (profile.id === activeInfluencerProfileId) {
      onClose();
      return;
    }

    setSwitchingId(profile.id);
    try {
      await setActiveInfluencerProfileId(session.user.id, profile.id);

      showModal({
        title: 'Profile Switched! 🔄',
        message: `Switched to @${profile.instagramHandle}.`,
      });

      onSwitchSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to switch influencer profile:', err);
      showModal({
        title: 'Switch Failed',
        message: err?.message || 'Failed to switch profile. Please try again.',
      });
    } finally {
      setSwitchingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <BottomSheet
      visible={isOpen}
      title="Switch creator profile"
      icon="users"
      onClose={onClose}
      snapPoints={['60%']}
      hideHeaderBorder
    >
      <View style={{ gap: 14 }}>
        <Text style={styles.sheetSubtitle}>
          Select which creator account to make active for applying to campaigns.
        </Text>

        <View style={styles.profileList}>
          {influencerProfiles.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="users" size={32} color="rgba(63,3,11,0.2)" />
              <Text style={styles.emptyText}>No creator profiles yet</Text>
              <Text style={styles.emptySubText}>Create your first creator profile to get started.</Text>
            </View>
          ) : (
            influencerProfiles.map((p) => {
              const isActive = p.id === activeInfluencerProfileId;
              const isSwitching = switchingId === p.id;
              const letter = (p.instagramHandle || '?').charAt(0).toUpperCase();

              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.profileItem, isActive && styles.profileItemActive]}
                  activeOpacity={0.8}
                  onPress={() => handleSwitch(p)}
                  disabled={switchingId !== null}
                >
                  {/* Avatar */}
                  <View style={styles.avatarWrap}>
                    {p.avatar ? (
                      <Image source={{ uri: p.avatar }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarText}>{letter}</Text>
                      </View>
                    )}
                  </View>

                  {/* Details */}
                  <View style={styles.profileDetails}>
                    <Text style={styles.handleName} numberOfLines={1}>
                      @{p.instagramHandle}
                    </Text>
                    <Text style={styles.nicheText} numberOfLines={1}>
                      {p.niche} · {p.followers ? `${(p.followers / 1000).toFixed(0)}k followers` : 'New profile'} · {p.level}
                    </Text>
                  </View>

                  {/* Selection indicator */}
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
            })
          )}
        </View>

        {/* Add new profile button */}
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.85}
          onPress={() => {
            onClose();
            setTimeout(() => {
              onAddNewProfile();
            }, 300);
          }}
          disabled={switchingId !== null}
        >
          <Icon name="plus" size={16} color={Colors.oxblood} />
          <Text style={styles.addBtnText}>Add creator profile</Text>
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
    borderRadius: 22,
    backgroundColor: 'rgba(180,106,116,0.15)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.oxbloodDeep,
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
  handleName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  nicheText: {
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(63,3,11,0.4)',
  },
  emptySubText: {
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.35)',
    textAlign: 'center',
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
