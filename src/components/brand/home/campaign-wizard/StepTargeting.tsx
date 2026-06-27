import { Colors, FontFamily } from '@/constants/brand';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';

import { TactileButton } from '@/components/ui/tactile-button';
import { useCampaignWizardStore } from '@/store/campaignWizard';

export function StepTargeting() {
  "use no memo";
  const { updateField } = useCampaignWizardStore();
  const { control, watch, setValue, trigger, formState: { errors } } = useFormContext();

  const targetGender = watch('targetGender');
  const targetAgeRange = watch('targetAgeRange');
  const creatorSize = watch('creatorSize');
  const targetLanguage = watch('targetLanguage');

  const handleNext = async () => {
    const fieldsToValidate = [];
    if (targetAgeRange === 'Custom') {
      fieldsToValidate.push('customAgeRange');
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      updateField('createStep', 4);
    }
  };

  const handleBack = () => {
    updateField('createStep', 2);
  };

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Creator Size Preference</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
          {(['Any', 'Nano (1K-10K)', 'Micro (10K-100K)', 'Mid-tier (100K-500K)', 'Macro (500K-1M)', 'Mega (1M+)'] as const).map((size) => {
            const active = creatorSize === size;
            return (
              <TouchableOpacity
                key={size}
                style={[styles.gridBtn, active && styles.gridBtnActive]}
                onPress={() => setValue('creatorSize', size)}
                activeOpacity={0.8}
              >
                <Text style={[styles.gridBtnText, active && styles.gridBtnTextActive]}>{size}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Creator Gender Preference</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
          {(['Male', 'Female', 'Any'] as const).map((gender) => {
            const active = targetGender === gender;
            return (
              <TouchableOpacity
                key={gender}
                style={[styles.toggleBtn, active && styles.toggleBtnActive, { minWidth: 90, marginHorizontal: 4 }]}
                onPress={() => setValue('targetGender', gender)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{gender}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Creator Age Range</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
          {(['18-24', '25-34', '35-44', 'Custom'] as const).map((age) => {
            const active = targetAgeRange === age;
            return (
              <TouchableOpacity
                key={age}
                style={[styles.toggleBtn, active && styles.toggleBtnActive, { minWidth: 90, marginHorizontal: 4 }]}
                onPress={() => setValue('targetAgeRange', age)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{age}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {targetAgeRange === 'Custom' && (
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Custom Age Range *</Text>
          <Controller
            control={control}
            name="customAgeRange"
            rules={{ required: 'Custom age range is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.formInput, errors.customAgeRange && styles.formInputError]}
                placeholder="e.g. 18–45"
                placeholderTextColor="rgba(63,3,11,0.35)"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.customAgeRange && <Text style={styles.errorText}>{errors.customAgeRange.message as string}</Text>}
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Language Preferred</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
          {(['Hinglish', 'English', 'Hindi', 'Marathi', 'Bengali', 'Tamil', 'Telugu', 'Any'] as const).map((lang) => {
            const active = targetLanguage === lang;
            return (
              <TouchableOpacity
                key={lang}
                style={[styles.gridBtn, active && styles.gridBtnActive]}
                onPress={() => setValue('targetLanguage', lang)}
                activeOpacity={0.8}
              >
                <Text style={[styles.gridBtnText, active && styles.gridBtnTextActive]}>{lang}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.bottomRow}>
        <TactileButton
          text="Back"
          onPress={handleBack}
          icon="arrowLeft"
          iconPosition="left"
          variant="secondary"
        />
        <TactileButton
          onPress={handleNext}
          text="Next"
          icon="arrow"
          iconPosition="right"
          variant="primary"
        />
      </View>
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
    marginTop: 4,
    marginBottom: 4,
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
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  sectionCard: {
    backgroundColor: 'rgba(63,3,11,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.05)',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  sectionHeader: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.oxblood,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.08)',
    paddingBottom: 4,
  },
  bottomRow: {
    justifyContent: 'space-between',
    width: "auto",
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  backBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.creamDk,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  backBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: Colors.oxblood,
  },
  launchBtn: {
    flex: 2,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  launchBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: '#ffffff',
  },
  horizontalScrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
});
