import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, FontFamily } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';

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
  } | null;
}

const CATEGORIES = ['Fashion', 'Tech', 'Beauty', 'Lifestyle', 'Food', 'Other'];

export function CreateBrandProfileSheet({ isOpen, onClose, onSuccess, initialData }: CreateBrandProfileSheetProps) {
  const showModal = useUIStore((s) => s.showModal);
  const session = useAuthStore((s) => s.session);
  const saveProfile = useProfilesStore((s) => s.saveProfile);
  const setActiveProfileId = useProfilesStore((s) => s.setActiveProfileId);
  
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState('');
  const [category, setCategory] = useState('Fashion');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCompanyName(initialData?.companyName ?? '');
      setWebsite(initialData?.website ?? '');
      setLogo(initialData?.logo ?? '');
      setCategory(initialData?.category ?? 'Fashion');
      setDescription(initialData?.description ?? '');
      setSubmitting(false);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      showModal({
        title: 'Validation Error',
        message: 'Please enter your company name.',
      });
      return;
    }

    if (!website.trim()) {
      showModal({
        title: 'Validation Error',
        message: 'Please enter your company website.',
      });
      return;
    }

    // Basic website URL validation
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlRegex.test(website.trim())) {
      showModal({
        title: 'Validation Error',
        message: 'Please enter a valid website URL (e.g., https://example.com).',
      });
      return;
    }

    // Ensure URL has protocol
    let formattedWebsite = website.trim();
    if (!/^https?:\/\//i.test(formattedWebsite)) {
      formattedWebsite = `https://${formattedWebsite}`;
    }

    setSubmitting(true);
    try {
      const payload = {
        companyName: companyName.trim(),
        website: formattedWebsite,
        logo: logo.trim() || null,
        category,
        description: description.trim() || null,
      };

      const res = await api.brands.updateProfile(payload);

      // Save brand profile locally
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
    } finally {
      setSubmitting(false);
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
          <TextInput
            style={styles.formInput}
            placeholder="e.g. Brand Inc."
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={companyName}
            onChangeText={setCompanyName}
            editable={!submitting}
          />
        </View>

        {/* WEBSITE */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Website URL *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. https://brand.com"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={website}
            onChangeText={setWebsite}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
          />
        </View>

        {/* CATEGORY */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Category *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                  activeOpacity={0.8}
                  onPress={() => setCategory(cat)}
                  disabled={submitting}
                >
                  <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* LOGO URL */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Logo Image URL (Optional)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. https://brand.com/logo.png"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={logo}
            onChangeText={setLogo}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
          />
        </View>

        {/* DESCRIPTION / BIO */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Description / Bio (Optional)</Text>
          <TextInput
            style={[styles.formInput, styles.multilineInput]}
            placeholder="Tell creators about your brand and products..."
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
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
            <Text style={styles.submitBtnText}>
              {initialData ? 'Save Changes ✨' : 'Create Profile ✨'}
            </Text>
          )}
        </TouchableOpacity>
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
});
