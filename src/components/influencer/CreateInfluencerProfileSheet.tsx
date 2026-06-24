import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, FontFamily } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Platform } from 'react-native';
import { Image } from 'expo-image';

interface CreateInfluencerProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  initialData?: {
    id?: string;
    instagramHandle?: string;
    pricing?: number;
    niche?: string;
    skills?: string[];
    country?: string;
    avatar?: string | null;
    socialLinks?: {
      youtube?: string;
      tiktok?: string;
    };
  } | null;
}

const NICHES = ['Beauty', 'Fashion', 'Tech', 'Fitness', 'Luxury', 'Lifestyle', 'Travel', 'Other'];

export function CreateInfluencerProfileSheet({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CreateInfluencerProfileSheetProps) {
  const showModal = useUIStore((s) => s.showModal);
  const session = useAuthStore((s) => s.session);
  const saveInfluencerProfile = useProfilesStore((s) => s.saveInfluencerProfile);
  const setActiveInfluencerProfileId = useProfilesStore((s) => s.setActiveInfluencerProfileId);

  const [instagramHandle, setInstagramHandle] = useState('');
  const [pricing, setPricing] = useState('');
  const [niche, setNiche] = useState('Lifestyle');
  const [skills, setSkills] = useState('');
  const [country, setCountry] = useState('India');
  const [youtube, setYoutube] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<any>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setInstagramHandle(initialData?.instagramHandle ?? '');
        // Format pricing from cents to standard Rupees for user input
        setPricing(initialData?.pricing ? String(Math.floor(initialData.pricing / 100)) : '');
        setNiche(initialData?.niche ?? 'Lifestyle');
        setSkills(initialData?.skills ? initialData.skills.join(', ') : '');
        setCountry(initialData?.country ?? 'India');
        setYoutube(initialData?.socialLinks?.youtube ?? '');
        setTiktok(initialData?.socialLinks?.tiktok ?? '');
        setAvatar(initialData?.avatar ?? '');
        setAvatarFile(null);
        setSubmitting(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    if (!instagramHandle.trim()) {
      showModal({
        title: 'Validation Error',
        message: 'Please enter your Instagram handle.',
      });
      return;
    }

    // Strip '@' if user included it
    let cleanHandle = instagramHandle.trim();
    if (cleanHandle.startsWith('@')) {
      cleanHandle = cleanHandle.substring(1);
    }

    if (!cleanHandle) {
      showModal({
        title: 'Validation Error',
        message: 'Please enter a valid Instagram handle.',
      });
      return;
    }

    if (!pricing.trim() || isNaN(Number(pricing.trim())) || Number(pricing.trim()) <= 0) {
      showModal({
        title: 'Validation Error',
        message: 'Please enter a valid positive price (minimum pricing per collaboration).',
      });
      return;
    }

    setSubmitting(true);
    try {
      const parsedPriceInCents = Math.round(Number(pricing.trim()) * 100);
      const skillsArray = skills.trim()
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      let payload: any;
      if (avatarFile) {
        payload = new FormData();
        payload.append('instagramHandle', cleanHandle);
        payload.append('pricing', String(parsedPriceInCents));
        payload.append('niche', niche);
        payload.append('skills', JSON.stringify(skillsArray));
        payload.append('country', country.trim() || 'India');
        payload.append('avatar', avatarFile);
        payload.append('socialLinks', JSON.stringify({
          youtube: youtube.trim() || undefined,
          tiktok: tiktok.trim() || undefined,
        }));
        if (initialData?.id) {
          payload.append('id', initialData.id);
        }
      } else {
        payload = {
          instagramHandle: cleanHandle,
          pricing: parsedPriceInCents,
          niche,
          skills: skillsArray,
          country: country.trim() || 'India',
          avatar: avatar.trim() || undefined,
          socialLinks: {
            youtube: youtube.trim() || undefined,
            tiktok: tiktok.trim() || undefined,
          },
        };
        if (initialData?.id) {
          payload.id = initialData.id;
        }
      }

      const res = await api.influencers.updateProfile(payload);

      // Save influencer profile locally in store
      const userId = session?.user?.id;
      if (userId) {
        const profileId = initialData?.id || (res as any)?.id || 'ip_' + Math.random().toString(36).substr(2, 9);
        const profileObj = {
          id: profileId,
          instagramHandle: cleanHandle,
          niche,
          pricing: parsedPriceInCents,
          followers: (res as any)?.followers ?? (initialData as any)?.followers ?? 0,
          level: (res as any)?.level ?? (initialData as any)?.level ?? 'micro',
          avatar: (res as any)?.avatar ?? (avatar.trim() || (initialData as any)?.avatar || null),
          bio: (res as any)?.bio ?? (initialData as any)?.bio ?? null,
          verified: (res as any)?.verified ?? (initialData as any)?.verified ?? false,
        };
        await saveInfluencerProfile(userId, profileObj);
        await setActiveInfluencerProfileId(userId, profileId);
      }

      showModal({
        title: 'Profile Saved! ✨',
        message: initialData ? 'Your creator profile was successfully updated.' : 'Your creator profile was successfully created.',
      });

      onSuccess(res);
      onClose();
    } catch (err: any) {
      console.error('Failed to save creator profile:', err);
      showModal({
        title: 'Operation Failed',
        message: err?.message || 'Failed to save creator profile. Please check your network connection and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const triggerAvatarPicker = () => {
    if (Platform.OS === 'web') {
      avatarInputRef.current?.click();
    } else {
      setAvatarFile({ name: 'mock_avatar.jpg', size: 1.2 * 1024 * 1024, type: 'image/jpeg' });
      setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300');
      showModal({
        title: 'Avatar Selected 📸',
        message: 'Preselected a premium avatar image for native simulation.',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <BottomSheet
      visible={isOpen}
      title={initialData ? 'Edit creator profile' : 'Setup creator profile'}
      icon="user"
      onClose={onClose}
      snapPoints={['85%']}
      hideHeaderBorder
    >
      {Platform.OS === 'web' && (
        <input
          type="file"
          accept="image/*"
          ref={avatarInputRef}
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setAvatarFile(file);
              setAvatar(URL.createObjectURL(file));
            }
          }}
        />
      )}

      <ScrollView contentContainerStyle={{ gap: 18, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* INSTAGRAM HANDLE */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Instagram Handle *</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputPrefix}>@</Text>
            <TextInput
              style={[styles.formInput, { flex: 1, borderLeftWidth: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
              placeholder="username"
              placeholderTextColor="rgba(63,3,11,0.35)"
              value={instagramHandle}
              onChangeText={setInstagramHandle}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!submitting}
            />
          </View>
        </View>

        {/* PROFILE AVATAR */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Profile Avatar</Text>
          <View style={styles.avatarPickerContainer}>
            <View style={styles.avatarPreviewWrap}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarPreview} contentFit="cover" />
              ) : (
                <View style={[styles.avatarPreview, styles.avatarPreviewFallback]}>
                  <Text style={styles.avatarPreviewText}>
                    {instagramHandle ? instagramHandle.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={styles.avatarUploadBtn}
                  onPress={triggerAvatarPicker}
                  activeOpacity={0.8}
                  disabled={submitting}
                >
                  <Text style={styles.avatarUploadBtnText}>Upload Photo</Text>
                </TouchableOpacity>
                {(avatar || avatarFile) ? (
                  <TouchableOpacity
                    style={styles.avatarClearBtn}
                    onPress={() => {
                      setAvatar('');
                      setAvatarFile(null);
                    }}
                    activeOpacity={0.8}
                    disabled={submitting}
                  >
                    <Text style={styles.avatarClearBtnText}>Reset</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <Text style={styles.helperText}>
                {avatarFile ? `Selected: ${avatarFile.name}` : 'Upload a custom photo or leave empty for a default adventurer avatar.'}
              </Text>
            </View>
          </View>
        </View>

        {/* PRICING */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Base Collaboration Pricing (₹) *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. 15000"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={pricing}
            onChangeText={setPricing}
            keyboardType="numeric"
            editable={!submitting}
          />
        </View>

        {/* NICHE CATEGORY */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Content Niche *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {NICHES.map((nch) => {
              const active = niche === nch;
              return (
                <TouchableOpacity
                  key={nch}
                  style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                  activeOpacity={0.8}
                  onPress={() => setNiche(nch)}
                  disabled={submitting}
                >
                  <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{nch}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* SKILLS */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Skills / Specialties (Optional)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. Videography, Storytelling, Editing (comma separated)"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={skills}
            onChangeText={setSkills}
            editable={!submitting}
          />
        </View>

        {/* COUNTRY */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Country (Optional)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. India"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={country}
            onChangeText={setCountry}
            editable={!submitting}
          />
        </View>

        {/* OTHER SOCIAL LINKS */}
        <Text style={styles.sectionTitle}>Other Channels</Text>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>YouTube Channel URL (Optional)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. https://youtube.com/@channel"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={youtube}
            onChangeText={setYoutube}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
          />
        </View>
        {/* ACTION BUTTON */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>{initialData ? 'Save Changes ✨' : 'Create Profile ✨'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 10.5,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    overflow: 'hidden',
  },
  inputPrefix: {
    paddingLeft: 16,
    paddingRight: 4,
    fontSize: 14,
    fontFamily: FontFamily.sansMedium,
    color: 'rgba(63,3,11,0.45)',
  },
  formInput: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    fontSize: 14,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
  },
  categoryRow: {
    gap: 8,
    paddingVertical: 2,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: Colors.oxblood,
  },
  toggleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.oxblood,
  },
  toggleTextActive: {
    fontFamily: FontFamily.sans,
    color: '#ffffff',
  },
  sectionTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
    marginTop: 8,
    marginBottom: -4,
  },
  submitBtn: {
    backgroundColor: Colors.oxblood,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(63,3,11,0.5)',
  },
  submitBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    color: '#ffffff',
  },
  avatarPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.06)',
  },
  avatarPreviewWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.cream,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPreview: {
    width: '100%',
    height: '100%',
  },
  avatarPreviewFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cream,
  },
  avatarPreviewText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  helperText: {
    fontSize: 10,
    color: 'rgba(63,3,11,0.45)',
    fontFamily: FontFamily.sansMedium,
    lineHeight: 14,
  },
  avatarUploadBtn: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarUploadBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: '#ffffff',
  },
  avatarClearBtn: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.2)',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarClearBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.oxblood,
  },
});
