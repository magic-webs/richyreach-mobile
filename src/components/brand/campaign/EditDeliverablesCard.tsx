import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
  reelCount: string;
  storyCount: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  onChangeReelCount: (v: string) => void;
  onChangeStoryCount: (v: string) => void;
  onChangeStartDate: (v: string) => void;
  onChangeEndDate: (v: string) => void;
  onChangeApplicationDeadline: (v: string) => void;
}

export function EditDeliverablesCard({
  reelCount,
  storyCount,
  startDate,
  endDate,
  applicationDeadline,
  onChangeReelCount,
  onChangeStoryCount,
  onChangeStartDate,
  onChangeEndDate,
  onChangeApplicationDeadline,
}: Props) {
  return (
    <View style={styles.formSectionCard}>
      <Text style={styles.formSectionHeader}>Deliverables & Dates</Text>

      {/* Deliverable Count */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Deliverables Count</Text>
        <View style={styles.deliverablesEditRow}>
          <View style={styles.delivEditCell}>
            <Text style={styles.delivEditLabel}>Reels</Text>
            <TextInput
              style={styles.delivEditInput}
              keyboardType="numeric"
              value={reelCount}
              onChangeText={onChangeReelCount}
            />
          </View>
          <View style={styles.delivEditCell}>
            <Text style={styles.delivEditLabel}>Stories</Text>
            <TextInput
              style={styles.delivEditInput}
              keyboardType="numeric"
              value={storyCount}
              onChangeText={onChangeStoryCount}
            />
          </View>
        </View>
      </View>

      {/* Date Range */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Campaign Duration Dates</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.inputSubLabel}>Start Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.formInput}
              value={startDate}
              onChangeText={onChangeStartDate}
              placeholder="2026-07-01"
            />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.inputSubLabel}>End Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.formInput}
              value={endDate}
              onChangeText={onChangeEndDate}
              placeholder="2026-07-30"
            />
          </View>
        </View>
      </View>

      {/* Application Deadline */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Application Deadline (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.formInput}
          value={applicationDeadline}
          onChangeText={onChangeApplicationDeadline}
          placeholder="2026-06-25"
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
  deliverablesEditRow: {
    flexDirection: 'row',
    gap: 8,
  },
  delivEditCell: {
    flex: 1,
    gap: 4,
  },
  delivEditLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9.5,
    color: 'rgba(63, 3, 11, 0.5)',
    textAlign: 'center',
  },
  delivEditInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    fontSize: 13,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
    textAlign: 'center',
  },
});
