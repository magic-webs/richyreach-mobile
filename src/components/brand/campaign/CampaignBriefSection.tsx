import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  description: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  reelCount: string;
  storyCount: string;
  formatDate: (d?: string) => string;
}

export function CampaignBriefSection({
  description,
  startDate,
  endDate,
  applicationDeadline,
  reelCount,
  storyCount,
  formatDate,
}: Props) {
  const hasDeliverables = (parseInt(reelCount) || 0) > 0 || (parseInt(storyCount) || 0) > 0;

  return (
    <>
      {/* Campaign Brief & Timeline */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeading}>Campaign Brief & Timeline</Text>
        <Text style={styles.bodyDescription}>{description}</Text>

        <View style={styles.dividerLight} />

        <View style={styles.timelineGrid}>
          <View style={styles.timelineCell}>
            <Text style={styles.timelineCellLabel}>Start Date</Text>
            <Text style={styles.timelineCellValue}>{formatDate(startDate)}</Text>
          </View>
          <View style={styles.timelineCell}>
            <Text style={styles.timelineCellLabel}>End Date</Text>
            <Text style={styles.timelineCellValue}>{formatDate(endDate)}</Text>
          </View>
          <View style={styles.timelineCell}>
            <Text style={styles.timelineCellLabel}>Apply Deadline</Text>
            <Text style={styles.timelineCellValueUrgent}>{formatDate(applicationDeadline)}</Text>
          </View>
        </View>
      </View>

      {/* Deliverables Section */}
      {hasDeliverables && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Deliverables Required</Text>
          <View style={styles.deliverablesList}>
            {parseInt(reelCount) > 0 && (
              <View style={styles.deliverablePill}>
                <Icon name="check" size={12} color={Colors.green} />
                <Text style={styles.deliverableText}>{reelCount}x Reel(s)</Text>
              </View>
            )}
            {parseInt(storyCount) > 0 && (
              <View style={styles.deliverablePill}>
                <Icon name="check" size={12} color={Colors.green} />
                <Text style={styles.deliverableText}>{storyCount}x Story(ies)</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.05)',
    ...Shadow.card,
    gap: 12,
  },
  sectionHeading: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  bodyDescription: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(42, 2, 7, 0.75)',
  },
  dividerLight: {
    height: 0.5,
    backgroundColor: 'rgba(63, 3, 11, 0.08)',
    marginVertical: 4,
  },
  timelineGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  timelineCell: {
    flex: 1,
    backgroundColor: 'rgba(63, 3, 11, 0.015)',
    padding: 8,
    borderRadius: Radius.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.03)',
  },
  timelineCellLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9,
    color: 'rgba(63, 3, 11, 0.4)',
    textTransform: 'uppercase',
  },
  timelineCellValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  timelineCellValueUrgent: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.roseDeep,
    fontWeight: '800',
  },
  deliverablesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  deliverablePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(42, 122, 90, 0.04)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(42, 122, 90, 0.12)',
  },
  deliverableText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.green,
  },
});
