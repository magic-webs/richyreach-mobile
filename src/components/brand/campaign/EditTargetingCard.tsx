import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const GENDERS = ['All', 'Male', 'Female'];

interface Props {
  minFollowers: string;
  creatorSize: string;
  targetGender: string;
  targetAgeRange: string;
  customAgeRange: string;
  targetLanguage: string;
  location: string;
  onChangeMinFollowers: (v: string) => void;
  onChangeCreatorSize: (v: string) => void;
  onChangeTargetGender: (v: string) => void;
  onChangeTargetAgeRange: (v: string) => void;
  onChangeCustomAgeRange: (v: string) => void;
  onChangeTargetLanguage: (v: string) => void;
  onChangeLocation: (v: string) => void;
}

export function EditTargetingCard({
  minFollowers,
  creatorSize,
  targetGender,
  targetAgeRange,
  customAgeRange,
  targetLanguage,
  location,
  onChangeMinFollowers,
  onChangeCreatorSize,
  onChangeTargetGender,
  onChangeTargetAgeRange,
  onChangeCustomAgeRange,
  onChangeTargetLanguage,
  onChangeLocation,
}: Props) {
  return (
    <View style={styles.formSectionCard}>
      <Text style={styles.formSectionHeader}>Creator Targeting</Text>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Minimum Followers Required</Text>
        <TextInput
          style={styles.formInput}
          keyboardType="numeric"
          value={minFollowers}
          onChangeText={onChangeMinFollowers}
          placeholder="10000"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Creator Size Class</Text>
        <TextInput
          style={styles.formInput}
          value={creatorSize}
          onChangeText={onChangeCreatorSize}
          placeholder="Micro (10K-100K)"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Target Creator Gender</Text>
        <View style={styles.toggleRow}>
          {GENDERS.map((g) => {
            const active = targetGender.toLowerCase() === g.toLowerCase();
            return (
              <TouchableOpacity
                key={g}
                style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                onPress={() => onChangeTargetGender(g)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{g}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Target Creator Age Range</Text>
        <View style={styles.toggleRow}>
          {['18–24', '25–34', '35–44', 'Custom'].map((age) => {
            const active = targetAgeRange === age;
            return (
              <TouchableOpacity
                key={age}
                style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                onPress={() => onChangeTargetAgeRange(age)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{age}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {targetAgeRange === 'Custom' && (
        <View style={styles.formGroup}>
          <Text style={styles.inputSubLabel}>Custom Age Range Input</Text>
          <TextInput
            style={styles.formInput}
            value={customAgeRange}
            onChangeText={onChangeCustomAgeRange}
            placeholder="e.g. 16-22 years, or 45+"
          />
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Target Language</Text>
        <TextInput
          style={styles.formInput}
          value={targetLanguage}
          onChangeText={onChangeTargetLanguage}
          placeholder="English / Hindi / Hinglish"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Target Location</Text>
        <TextInput
          style={styles.formInput}
          value={location}
          onChangeText={onChangeLocation}
          placeholder="Pan India, or State/City name"
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
  inputSubLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.5)',
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
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  toggleBtn: {
    flex: 1,
    minWidth: '22%',
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: Colors.oxblood,
    borderColor: Colors.oxblood,
  },
  toggleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.oxblood,
  },
  toggleTextActive: {
    fontFamily: FontFamily.sans,
    color: Colors.white,
    fontWeight: '700',
  },
});
