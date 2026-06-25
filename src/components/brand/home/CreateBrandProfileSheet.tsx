import { BottomSheet } from '@/components/ui/bottom-sheet';
import { TactileButton } from '@/components/ui/tactile-button';
import { Colors, FontFamily } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, TextInput, TextInputProps } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

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

const CATEGORIES = ['Fashion', 'Tech', 'Beauty', 'Lifestyle', 'Food', 'Other'];

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

export function CreateBrandProfileSheet({ isOpen, onClose, onSuccess, initialData }: CreateBrandProfileSheetProps) {
  const showModal = useUIStore((s) => s.showModal);
  const session = useAuthStore((s) => s.session);
  const saveProfile = useProfilesStore((s) => s.saveProfile);
  const setActiveProfileId = useProfilesStore((s) => s.setActiveProfileId);

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
    }
  }, [isOpen, initialData]);

  const onSubmit = async (data: BrandProfileFormValues) => {
    let formattedWebsite = data.website.trim();
    if (!/^https?:\/\//i.test(formattedWebsite)) {
      formattedWebsite = `https://${formattedWebsite}`;
    }

    try {
      const payload = {
        companyName: data.companyName.trim(),
        website: formattedWebsite,
        logo: data.logo.trim() || null,
        category: data.category,
        description: data.description.trim() || null,
        instagramPage: data.instagramPage.trim().replace(/^@/, '') || null,
      };

      const res = await api.brands.updateProfile(payload);

      const userId = session?.user?.id;
      if (userId) {
        const profileId = (initialData as any)?.id || (res as any)?.id || 'bp_' + Math.random().toString(36).substr(2, 9);
        const profileObj = {
          id: profileId,
          companyName: payload.companyName,
          website: payload.website,
          logo: payload.logo,
          category: payload.category,
          description: payload.description,
        };
        await saveProfile(userId, profileObj);
        await setActiveProfileId(userId, profileId);
      }

      showModal({
        title: 'Profile Updated! ✨',
        message: initialData ? 'Your brand profile was successfully updated.' : 'Your brand profile was successfully created.',
      });

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

        {/* LOGO URL */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Logo Image URL (Optional)</Text>
          <Controller
            control={control}
            name="logo"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                style={styles.formInput}
                placeholder="e.g. https://brand.com/logo.png"
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
});
