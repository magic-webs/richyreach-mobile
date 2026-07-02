import { Colors, FontFamily } from '@/constants/brand';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';
import { indianStates, indianCities } from '@/data/indianStates';

import { TactileButton } from '@/components/ui/tactile-button';
import { useCampaignWizardStore } from '@/store/campaignWizard';
import { useProfilesStore } from '@/store/profiles';

export function StepBasics() {
  "use no memo";
  const { profiles, activeBrandProfileId } = useProfilesStore();
  const { updateField } = useCampaignWizardStore();
  const { control, setValue, trigger, watch, formState: { errors } } = useFormContext();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const campObjective = watch('campObjective');
  const campNiche = watch('campNiche');
  const campLocationType = watch('campLocationType');
  const selectedBrandProfileId = watch('selectedBrandProfileId');
  const brandName = watch('brandName');

  useEffect(() => {
    if (profiles.length === 0) return;

    const resolvedId = selectedBrandProfileId || activeBrandProfileId || profiles[0]?.id;
    const activeProfile = profiles.find((p) => p.id === resolvedId) || profiles[0];

    if (activeProfile && (activeProfile.id !== selectedBrandProfileId || !brandName)) {
      setValue('brandName', activeProfile.companyName);
      setValue('selectedBrandProfileId', activeProfile.id);
    }
  }, [profiles, activeBrandProfileId, selectedBrandProfileId, brandName, setValue]);

  const handleNext = async () => {
    const fieldsToValidate = ['campName', 'campDescription'];
    if (campLocationType !== 'Pan India') {
      fieldsToValidate.push('campLocationValue');
    }
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      updateField('createStep', 2);
    }
  };

  return (
    <View style={{ gap: 16 }}>
      {/* Campaign Name */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Campaign Name *</Text>
        <Controller
          control={control}
          name="campName"
          rules={{
            required: 'Campaign name is required',
            minLength: { value: 5, message: 'Campaign name must be at least 5 characters' }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.formInput, errors.campName && styles.formInputError]}
              placeholder="e.g. Summer Glow Launch"
              placeholderTextColor="rgba(63,3,11,0.35)"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.campName && <Text style={styles.errorText}>{errors.campName.message as string}</Text>}
      </View>

      {/* Brand Profiles selection */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Brand Profile *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
          {profiles.map((p) => {
            const active = selectedBrandProfileId === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.gridBtn, active && styles.gridBtnActive]}
                onPress={() => {
                  setValue('brandName', p.companyName);
                  setValue('selectedBrandProfileId', p.id);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.gridBtnText, active && styles.gridBtnTextActive]}>{p.companyName}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Objectives */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Objective *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
          {(['Brand Awareness', 'Product Launch', 'App Installs', 'Website Traffic', 'Sales/Conversions', 'Lead Generation'] as const).map((obj) => {
            const active = campObjective === obj;
            return (
              <TouchableOpacity
                key={obj}
                style={[styles.gridBtn, active && styles.gridBtnActive]}
                onPress={() => setValue('campObjective', obj)}
                activeOpacity={0.8}
              >
                <Text style={[styles.gridBtnText, active && styles.gridBtnTextActive]}>{obj}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Niches */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Industry / Niche *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
          {(['Fashion', 'Real Estate', 'Beauty', 'Food', 'Tech', 'Finance', 'Education', 'Gaming', 'Travel', 'Fitness'] as const).map((niche) => {
            const active = campNiche === niche;
            return (
              <TouchableOpacity
                key={niche}
                style={[styles.gridBtn, active && styles.gridBtnActive]}
                onPress={() => setValue('campNiche', niche)}
                activeOpacity={0.8}
              >
                <Text style={[styles.gridBtnText, active && styles.gridBtnTextActive]}>{niche}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Campaign Description */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Campaign Description *</Text>
        <Controller
          control={control}
          name="campDescription"
          rules={{
            required: 'Campaign description is required',
            minLength: { value: 10, message: 'Campaign description must be at least 10 characters' }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.formInput, styles.textArea, errors.campDescription && styles.formInputError]}
              multiline
              numberOfLines={4}
              placeholder="Provide details about what creators should do..."
              placeholderTextColor="rgba(63,3,11,0.35)"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.campDescription && <Text style={styles.errorText}>{errors.campDescription.message as string}</Text>}
      </View>

      {/* Location Type */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Location Type *</Text>
        <View style={styles.toggleRow}>
          {(['Pan India', 'State', 'City'] as const).map((locType) => {
            const active = campLocationType === locType;
            return (
              <TouchableOpacity
                key={locType}
                style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                onPress={() => setValue('campLocationType', locType)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{locType}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Location Value */}
      {campLocationType !== 'Pan India' && (
        <View style={[styles.formGroup, { zIndex: 99 }]}>
          <Text style={styles.formLabel}>{campLocationType} Details *</Text>
          <Controller
            control={control}
            name="campLocationValue"
            rules={{ required: `${campLocationType} value is required` }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[styles.formInput, errors.campLocationValue && styles.formInputError]}
                  placeholder={campLocationType === 'State' ? 'Start typing state, e.g. Karnataka' : campLocationType === 'City' ? 'Start typing city, e.g. Bangalore' : 'e.g. 400001'}
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  onBlur={() => {
                    onBlur();
                    setTimeout(() => setSuggestions([]), 250);
                  }}
                  onChangeText={(text) => {
                    onChange(text);
                    if (text.trim().length > 0) {
                      if (campLocationType === 'State') {
                        const filtered = indianStates.filter(
                          (s) =>
                            s.toLowerCase().includes(text.toLowerCase()) &&
                            s.toLowerCase() !== text.toLowerCase()
                        );
                        setSuggestions(filtered.slice(0, 5));
                      } else if (campLocationType === 'City') {
                        const filtered = indianCities.filter(
                          (c) =>
                            c.toLowerCase().includes(text.toLowerCase()) &&
                            c.toLowerCase() !== text.toLowerCase()
                        );
                        setSuggestions(filtered.slice(0, 5));
                      } else {
                        setSuggestions([]);
                      }
                    } else {
                      setSuggestions([]);
                    }
                  }}
                  value={value}
                />
                {(campLocationType === 'State' || campLocationType === 'City') && suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {suggestions.map((name) => (
                      <TouchableOpacity
                        key={name}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setValue('campLocationValue', name);
                          setSuggestions([]);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.suggestionText}>{name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          />
          {errors.campLocationValue && <Text style={styles.errorText}>{errors.campLocationValue.message as string}</Text>}
        </View>
      )}

      <TactileButton
        onPress={handleNext}
        text="Next"
        fullWidth
        icon="arrow"
        iconPosition="right"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    gap: 6,
    marginBottom: 6,
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
  formInputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 11,
    fontFamily: FontFamily.sansMedium,
    marginTop: -4,
    marginBottom: 4,
  },
  textArea: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: 'rgba(63,3,11,0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: Colors.oxblood,
    borderWidth: 1.5,
  },
  toggleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.oxblood,
  },
  toggleTextActive: {
    fontFamily: FontFamily.sans,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  gridBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: 'rgba(63,3,11,0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: Colors.oxblood,
    borderWidth: 1.5,
  },
  gridBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.oxblood,
  },
  gridBtnTextActive: {
    fontFamily: FontFamily.sans,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  horizontalScrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.08)',
    marginTop: 4,
    maxHeight: 180,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.04)',
  },
  suggestionText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: Colors.ink,
  },
});
