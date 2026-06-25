import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const OBJECTIVES = [
  'Brand Awareness',
  'Product Launch',
  'App Installs',
  'Website Traffic',
  'Sales/Conversions',
  'Lead Generation',
];
const PRIORITIES = ['normal', 'high', 'urgent'] as const;
const NICHES = [
  'Fashion',
  'Real Estate',
  'Beauty',
  'Food',
  'Tech',
  'Finance',
  'Education',
  'Gaming',
  'Travel',
  'Fitness',
];

interface Props {
  category: string;
  objective: string;
  description: string;
  priority: string;
  onChangeCategory: (v: string) => void;
  onChangeObjective: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangePriority: (v: string) => void;
}

export function EditBasicsCard({
  category,
  objective,
  description,
  priority,
  onChangeCategory,
  onChangeObjective,
  onChangeDescription,
  onChangePriority,
}: Props) {
  return (
    <View style={styles.formSectionCard}>
      <Text style={styles.formSectionHeader}>Basic Details</Text>

      {/* Category */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Campaign Category / Niche *</Text>
        <View style={styles.gridRow}>
          {NICHES.map((n) => {
            const active = category.toLowerCase() === n.toLowerCase();
            return (
              <TouchableOpacity
                key={n}
                style={[styles.gridBtn, active && styles.gridBtnActive]}
                onPress={() => onChangeCategory(n)}
                activeOpacity={0.8}
              >
                <Text style={[styles.gridBtnText, active && styles.gridBtnTextActive]}>{n}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Objective */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Campaign Objective *</Text>
        <View style={styles.gridRow}>
          {OBJECTIVES.map((o) => {
            const active = objective.toLowerCase() === o.toLowerCase().replace(/[/\s]+/g, '_');
            return (
              <TouchableOpacity
                key={o}
                style={[styles.gridBtn, active && styles.gridBtnActive]}
                onPress={() => onChangeObjective(o.toLowerCase().replace(/[/\s]+/g, '_'))}
                activeOpacity={0.8}
              >
                <Text style={[styles.gridBtnText, active && styles.gridBtnTextActive]}>{o}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Description */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Campaign Description *</Text>
        <TextInput
          style={[styles.formInput, styles.textArea]}
          multiline
          numberOfLines={4}
          placeholder="Provide details about the campaign..."
          placeholderTextColor="rgba(63,3,11,0.35)"
          value={description}
          onChangeText={onChangeDescription}
        />
      </View>

      {/* Priority */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Priority *</Text>
        <View style={styles.toggleRow}>
          {PRIORITIES.map((pri) => {
            const active = priority === pri;
            return (
              <TouchableOpacity
                key={pri}
                style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                onPress={() => onChangePriority(pri)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
                  {pri.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
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
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBtnActive: {
    backgroundColor: Colors.oxblood,
    borderColor: Colors.oxblood,
  },
  gridBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.oxblood,
  },
  gridBtnTextActive: {
    fontFamily: FontFamily.sans,
    color: Colors.white,
    fontWeight: '700',
  },
});
