import { BottomSheet } from '@/components/ui/bottom-sheet';
import { TactileButton } from '@/components/ui/tactile-button';
import { Colors, FontFamily } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
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

type InfluencerProfileFormValues = {
  instagramHandle: string;
  pricing: string;
  niche: string;
  skills: string;
  country: string;
  youtube: string;
};

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

  // Avatar stays as plain state — it's a file picker, not a form field
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<any>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InfluencerProfileFormValues>({
    defaultValues: {
      instagramHandle: '',
      pricing: '',
      niche: 'Lifestyle',
      skills: '',
      country: 'India',
      youtube: '',
    },
  });

  const instagramHandleValue = watch('instagramHandle');

  useEffect(() => {
    if (isOpen) {
      reset({
        instagramHandle: initialData?.instagramHandle ?? '',
        pricing: initialData?.pricing ? String(Math.floor(initialData.pricing / 100)) : '',
        niche: initialData?.niche ?? 'Lifestyle',
        skills: initialData?.skills ? initialData.skills.join(', ') : '',
        country: initialData?.country ?? 'India',
        youtube: initialData?.socialLinks?.youtube ?? '',
      });
      setAvatar(initialData?.avatar ?? '');
      setAvatarFile(null);
    }
  }, [isOpen, initialData]);

  const onSubmit = async (data: InfluencerProfileFormValues) => {
    const cleanHandle = data.instagramHandle.trim().replace(/^@/, '');
    const parsedPriceInCents = Math.round(Number(data.pricing.trim()) * 100);
    const skillsArray = data.skills.trim()
      ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    try {
      let payload: any;
      if (avatarFile) {
        payload = new FormData();
        payload.append('instagramHandle', cleanHandle);
        payload.append('pricing', String(parsedPriceInCents));
        payload.append('niche', data.niche);
        payload.append('skills', JSON.stringify(skillsArray));
        payload.append('country', data.country.trim() || 'India');
        payload.append('avatar', avatarFile);
        payload.append('socialLinks', JSON.stringify({ youtube: data.youtube.trim() || undefined }));
        if (initialData?.id) payload.append('id', initialData.id);
      } else {
        payload = {
          instagramHandle: cleanHandle,
          pricing: parsedPriceInCents,
          niche: data.niche,
          skills: skillsArray,
          country: data.country.trim() || 'India',
          avatar: avatar.trim() || undefined,
          socialLinks: { youtube: data.youtube.trim() || undefined },
        };
        if (initialData?.id) payload.id = initialData.id;
      }

      const res = await api.influencers.updateProfile(payload);

      const userId = session?.user?.id;
      if (userId) {
        const profileId = initialData?.id || (res as any)?.id || 'ip_' + Math.random().toString(36).substr(2, 9);
        const profileObj = {
          id: profileId,
          instagramHandle: cleanHandle,
          niche: data.niche,
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
          <Controller
            control={control}
            name="instagramHandle"
            rules={{ required: 'Instagram handle is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={[styles.inputContainer, errors.instagramHandle && styles.inputContainerError]}>
                <Text style={styles.inputPrefix}>@</Text>
                <TextInput
                  style={[styles.formInput, { flex: 1, borderWidth: 0, borderRadius: 0 }]}
                  placeholder="username"
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                />
              </View>
            )}
          />
          {errors.instagramHandle && <Text style={styles.errorText}>{errors.instagramHandle.message}</Text>}
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
                    {instagramHandleValue ? instagramHandleValue.charAt(0).toUpperCase() : '?'}
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
                  disabled={isSubmitting}
                >
                  <Text style={styles.avatarUploadBtnText}>Upload Photo</Text>
                </TouchableOpacity>
                {(avatar || avatarFile) ? (
                  <TouchableOpacity
                    style={styles.avatarClearBtn}
                    onPress={() => { setAvatar(''); setAvatarFile(null); }}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
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
          <Controller
            control={control}
            name="pricing"
            rules={{
              required: 'Pricing is required',
              validate: (v) => (Number(v) > 0) || 'Enter a valid positive price',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.formInput, errors.pricing && styles.inputError]}
                placeholder="e.g. 15000"
                placeholderTextColor="rgba(63,3,11,0.35)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
                editable={!isSubmitting}
              />
            )}
          />
          {errors.pricing && <Text style={styles.errorText}>{errors.pricing.message}</Text>}
        </View>

        {/* NICHE CATEGORY */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Content Niche *</Text>
          <Controller
            control={control}
            name="niche"
            render={({ field: { onChange, value } }) => (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                {NICHES.map((nch) => {
                  const active = value === nch;
                  return (
                    <TouchableOpacity
                      key={nch}
                      style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                      activeOpacity={0.8}
                      onPress={() => onChange(nch)}
                      disabled={isSubmitting}
                    >
                      <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{nch}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          />
        </View>

        {/* SKILLS */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Skills / Specialties (Optional)</Text>
          <Controller
            control={control}
            name="skills"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Videography, Storytelling, Editing (comma separated)"
                placeholderTextColor="rgba(63,3,11,0.35)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isSubmitting}
              />
            )}
          />
        </View>

        {/* COUNTRY */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Country (Optional)</Text>
          <Controller
            control={control}
            name="country"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.formInput}
                placeholder="e.g. India"
                placeholderTextColor="rgba(63,3,11,0.35)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isSubmitting}
              />
            )}
          />
        </View>

        {/* OTHER SOCIAL LINKS */}
        <Text style={styles.sectionTitle}>Other Channels</Text>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>YouTube Channel URL (Optional)</Text>
          <Controller
            control={control}
            name="youtube"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.formInput}
                placeholder="e.g. https://youtube.com/@channel"
                placeholderTextColor="rgba(63,3,11,0.35)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
              />
            )}
          />
        </View>

        {/* ACTION BUTTON */}
        <TactileButton
          text={initialData ? 'Save Changes' : 'Create Profile'}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          fullWidth
          size="lg"
          variant="primary"
          style={{ marginTop: 10 }}
        />
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
  inputContainerError: {
    borderColor: Colors.rose,
    borderWidth: 1.5,
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
  inputError: {
    borderColor: Colors.rose,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 11,
    color: Colors.rose,
    fontFamily: FontFamily.sans,
    marginTop: -4,
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
