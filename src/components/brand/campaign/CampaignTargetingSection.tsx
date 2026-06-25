import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  minFollowers: string;
  creatorSize: string;
  targetGender: string;
  targetAgeRange: string;
  customAgeRange: string;
  targetLanguage: string;
  location: string;
}

export function CampaignTargetingSection({
  minFollowers,
  creatorSize,
  targetGender,
  targetAgeRange,
  customAgeRange,
  targetLanguage,
  location,
}: Props) {
  const followersNum = parseInt(minFollowers);
  const followersStr =
    followersNum >= 1000000
      ? `${(followersNum / 1000000).toFixed(1)}M+`
      : followersNum >= 1000
        ? `${(followersNum / 1000).toFixed(0)}k+`
        : `${minFollowers}+`;

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeading}>Creator Targeting Profile</Text>
      <Row label="Minimum Followers:" value={followersStr} />
      <Row label="Creator Size Class:" value={creatorSize} />
      <Row label="Target Gender:" value={targetGender} capitalize />
      <Row
        label="Target Age Range:"
        value={targetAgeRange === 'Custom' ? customAgeRange : targetAgeRange}
      />
      <Row label="Target Language:" value={targetLanguage} />
      <Row label="Geographic Location:" value={location} />
    </View>
  );
}

function Row({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <View style={styles.detailsRow}>
      <Text style={styles.detailsRowLabel}>{label}</Text>
      <Text style={[styles.detailsRowValue, capitalize && { textTransform: 'capitalize' }]}>
        {value}
      </Text>
    </View>
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
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  detailsRowLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(63, 3, 11, 0.55)',
  },
  detailsRowValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.ink,
  },
});
