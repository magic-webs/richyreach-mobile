import { BottomSheet } from '@/components/ui/bottom-sheet';
import { TactileButton } from '@/components/ui/tactile-button';
import { Colors, FontFamily } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { StyleSheet, Text, TouchableOpacity, View, Platform, TextInput, TextInputProps } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

// Safe wrapper for BottomSheetTextInput on Web
const FormInput = React.forwardRef<TextInput, TextInputProps>((props, ref) => {
  if (Platform.OS === 'web') {
    return <TextInput ref={ref} {...props} />;
  }
  return <BottomSheetTextInput ref={ref} {...(props as any)} />;
});

interface CreateBrandProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  initialData?: {
    companyName?: string;
    website?: string;
    logo?: string;
    category?: string;
    description?: string;
    instagramPage?: string;
  } | null;
}

type BrandProfileFormValues = {
  companyName: string;
  website: string;
  category: string;
  logo: string;
  description: string;
  instagramPage: string;
};

const CATEGORIES = [
  'Fashion',
  'Beauty',
  'Tech',
  'Food',
  'Travel',
  'Fitness',
  'Lifestyle',
  'Gaming',
  'Education',
  'Finance',
  'Entertainment',
  'Automobile',
  'Real Estate',
  'E-Commerce',
  'Other'
];

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

export function CreateBrandProfileSheet({ isOpen, onClose, onSuccess, initialData }: CreateBrandProfileSheetProps) {
  const showModal = useUIStore((s) => s.showModal);
  const session = useAuthStore((s) => s.session);
  const saveProfile = useProfilesStore((s) => s.saveProfile);
  const setActiveProfileId = useProfilesStore((s) => s.setActiveProfileId);

  const [logo, setLogo] = useState('');
  const [logoFile, setLogoFile] = useState<any>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BrandProfileFormValues>({
    defaultValues: {
      companyName: '',
      website: '',
      category: 'Fashion',
      logo: '',
      description: '',
      instagramPage: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        companyName: initialData?.companyName ?? '',
        website: initialData?.website ?? '',
        category: initialData?.category ?? 'Fashion',
        logo: initialData?.logo ?? '',
        description: initialData?.description ?? '',
        instagramPage: initialData?.instagramPage ?? '',
      });
      setLogo(initialData?.logo ?? '');
      setLogoFile(null);
    }
  }, [isOpen, initialData]);

  const triggerLogoPicker = async () => {
    if (Platform.OS === 'web') {
      logoInputRef.current?.click();
    } else {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setLogoFile({
            uri: asset.uri,
            name: asset.fileName || 'logo.jpg',
            type: asset.mimeType || 'image/jpeg',
            size: asset.fileSize || 0,
          });
          setLogo(asset.uri);
        }
      } catch (err: any) {
        console.error('Failed to pick logo:', err);
        showModal({
          title: 'Picker Failed',
          message: 'Could not access the library to select a photo.',
        });
      }
    }
  };

  const onSubmit = async (data: BrandProfileFormValues) => {
    let formattedWebsite = data.website.trim();
    if (formattedWebsite && !/^https?:\/\//i.test(formattedWebsite)) {
      formattedWebsite = `https://${formattedWebsite}`;
    }

    try {
      let payload: any;
      if (logoFile) {
        payload = new FormData();
        if ((initialData as any)?.id) {
          payload.append('id', (initialData as any).id);
        }
        payload.append('companyName', data.companyName.trim());
        payload.append('website', formattedWebsite);
        payload.append('category', data.category);
        payload.append('description', data.description.trim() || '');
        payload.append('instagramPage', data.instagramPage.trim().replace(/^@/, '') || '');
        
        if (Platform.OS === 'web') {
          payload.append('logo', logoFile);
        } else {
          payload.append('logo', {
            uri: logoFile.uri,
            name: logoFile.name || 'logo.jpg',
            type: logoFile.type || 'image/jpeg',
          } as any);
        }
      } else {
        payload = {
          id: (initialData as any)?.id || null,
          companyName: data.companyName.trim(),
          website: formattedWebsite,
          logo: logo.trim() || null,
          category: data.category,
          description: data.description.trim() || null,
          instagramPage: data.instagramPage.trim().replace(/^@/, '') || null,
        };
      }

      const res = await api.brands.updateProfile(payload);

      const userId = session?.user?.id;
      if (userId) {
        const profileId = (initialData as any)?.id || (res as any)?.id || 'bp_' + Math.random().toString(36).substr(2, 9);
        const profileObj = {
          id: profileId,
          companyName: data.companyName.trim(),
          website: formattedWebsite,
          logo: (res as any)?.logo ?? (logo.trim() || (initialData as any)?.logo || null),
          category: data.category,
          description: data.description.trim() || null,
        };
        await saveProfile(userId, profileObj);
        await setActiveProfileId(userId, profileId);
      }

      showModal({
        title: 'Profile Updated! ✨',
        message: initialData ? 'Your brand profile was successfully updated.' : 'Your brand profile was successfully created.',
      });

      if (!initialData) {
        useUIStore.getState().triggerConfetti();
      }

      onSuccess(res);
      onClose();
    } catch (err: any) {
      console.error('Failed to save brand profile:', err);
      showModal({
        title: 'Operation Failed',
        message: err?.message || 'Failed to save brand profile. Please check your network connection and try again.',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <BottomSheet
      visible={isOpen}
      title={initialData ? 'Edit brand profile' : 'Setup brand profile'}
      icon="user"
      onClose={onClose}
      snapPoints={['82%']}
      hideHeaderBorder
    >
      {Platform.OS === 'web' && (
        <input
          type="file"
          accept="image/*"
          ref={logoInputRef}
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setLogoFile(file);
              setLogo(URL.createObjectURL(file));
            }
          }}
        />
      )}
      <View style={{ gap: 18, paddingBottom: 20 }}>
        {/* COMPANY NAME */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Company Name *</Text>
          <Controller
            control={control}
            name="companyName"
            rules={{
              required: 'Company name is required',
              minLength: { value: 2, message: 'Must be at least 2 characters' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                style={[styles.formInput, errors.companyName && styles.inputError]}
                placeholder="e.g. Brand Inc."
                placeholderTextColor="rgba(63,3,11,0.35)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isSubmitting}
              />
            )}
          />
          {errors.companyName && <Text style={styles.errorText}>{errors.companyName.message}</Text>}
        </View>

        {/* WEBSITE */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Website URL *</Text>
          <Controller
            control={control}
            name="website"
            rules={{
              required: 'Website URL is required',
              validate: (v) => URL_REGEX.test(v.trim()) || 'Enter a valid URL (e.g. https://brand.com)',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                style={[styles.formInput, errors.website && styles.inputError]}
                placeholder="e.g. https://brand.com"
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
          {errors.website && <Text style={styles.errorText}>{errors.website.message}</Text>}
        </View>

        {/* CATEGORY */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Category *</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                {CATEGORIES.map((cat) => {
                  const active = value === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                      activeOpacity={0.8}
                      onPress={() => onChange(cat)}
                      disabled={isSubmitting}
                    >
                      <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          />
        </View>

        {/* COMPANY LOGO */}
        {initialData ? (
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Company Logo</Text>
            <View style={styles.logoPickerContainer}>
              <View style={styles.logoPreviewWrap}>
                {logo ? (
                  <Image source={{ uri: logo }} style={styles.logoPreview} contentFit="cover" />
                ) : (
                  <View style={[styles.logoPreview, styles.logoPreviewFallback]}>
                    <Text style={styles.logoPreviewText}>
                      {initialData?.companyName ? initialData.companyName.charAt(0).toUpperCase() : '?'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1, gap: 8 }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={styles.logoUploadBtn}
                    onPress={triggerLogoPicker}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.logoUploadBtnText}>Upload Photo</Text>
                  </TouchableOpacity>
                  {(logo || logoFile) ? (
                    <TouchableOpacity
                      style={styles.logoClearBtn}
                      onPress={() => { setLogo(''); setLogoFile(null); }}
                      activeOpacity={0.8}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.logoClearBtnText}>Reset</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <Text style={styles.helperText}>
                  {logoFile ? `Selected: ${logoFile.name}` : 'Upload a custom brand logo image.'}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* DESCRIPTION / BIO */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Description / Bio (Optional)</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                style={[styles.formInput, styles.multilineInput]}
                placeholder="Tell creators about your brand and products..."
                placeholderTextColor="rgba(63,3,11,0.35)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
            )}
          />
        </View>

        {/* INSTAGRAM HANDLE */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Instagram Handle *</Text>
          <Controller
            control={control}
            name="instagramPage"
            rules={{ required: 'Instagram handle is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                style={[styles.formInput, errors.instagramPage && styles.inputError]}
                placeholder="@yourbrand"
                placeholderTextColor="rgba(63,3,11,0.35)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
              />
            )}
          />
          {errors.instagramPage && <Text style={styles.errorText}>{errors.instagramPage.message}</Text>}
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
      </View>
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
  multilineInput: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
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
  logoPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.06)',
  },
  logoPreviewWrap: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: Colors.cream,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPreview: {
    width: '100%',
    height: '100%',
  },
  logoPreviewFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cream,
  },
  logoPreviewText: {
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
  logoUploadBtn: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoUploadBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: '#ffffff',
  },
  logoClearBtn: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.2)',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoClearBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.oxblood,
  },
});
