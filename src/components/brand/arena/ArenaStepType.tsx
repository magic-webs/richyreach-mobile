import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { StarIcon, FlashIcon, BadgeCheckIcon } from '@hugeicons/core-free-icons';

const ARENA_TYPES = [
  {
    id: 'reel_reach',
    label: 'Reel Reach Arena',
    subtitle: 'Influencers post reels. Highest reach wins the prize pool.',
    icon: StarIcon,
    gradient: ['#b46a74', '#3f030b'] as [string, string],
    tag: 'Most Popular',
  },
  {
    id: 'google_review',
    label: 'Google Review Arena',
    subtitle: 'Influencers leave verified Google reviews. Earn ₹250 per approved review.',
    icon: BadgeCheckIcon,
    gradient: ['#2a7a5a', '#1a4a38'] as [string, string],
    tag: 'Fixed Reward',
  },
] as const;

export function ArenaStepType() {
  const { control, watch } = useFormContext();
  const selected = watch('arenaType');

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Choose Arena Type</Text>
      <Text style={styles.subheading}>
        Select the competition format. This cannot be changed after creation.
      </Text>

      <Controller
        control={control}
        name="arenaType"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.optionList}>
            {ARENA_TYPES.map((type) => {
              const isSelected = value === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  activeOpacity={0.85}
                  onPress={() => onChange(type.id)}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                >
                  {/* Selection ring */}
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>

                  {/* Icon */}
                  <View style={[styles.iconBox, { backgroundColor: isSelected ? Colors.oxblood : Colors.creamDk }]}>
                    <HugeiconsIcon
                      icon={type.icon}
                      size={20}
                      color={isSelected ? Colors.cream : Colors.oxblood}
                      strokeWidth={2}
                    />
                  </View>

                  {/* Text */}
                  <View style={styles.optionText}>
                    <View style={styles.optionTitleRow}>
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                        {type.label}
                      </Text>
                      {type.tag && (
                        <View style={[styles.tag, isSelected && styles.tagSelected]}>
                          <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                            {type.tag}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.optionSubtitle}>{type.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />

      {/* Coin economy note */}
      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>💰 Coin Economy</Text>
        <Text style={styles.noteText}>1 Rupee = 100 Coins  ·  Entry Fee: 2,000 Coins (₹20)</Text>
        <Text style={styles.noteText}>Google Review Reward: 25,000 Coins (₹250) per verified review</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  heading: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  subheading: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13.5,
    color: 'rgba(63,3,11,0.55)',
    lineHeight: 20,
  },
  optionList: { gap: 12 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(63,3,11,0.08)',
    ...Shadow.card,
  },
  optionCardSelected: {
    borderColor: Colors.oxblood,
    backgroundColor: 'rgba(63,3,11,0.03)',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(63,3,11,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: Colors.oxblood,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.oxblood,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { flex: 1, gap: 4 },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },
  optionLabelSelected: {
    color: Colors.oxblood,
  },
  optionSubtitle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.5)',
    lineHeight: 18,
  },
  tag: {
    backgroundColor: 'rgba(63,3,11,0.07)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagSelected: {
    backgroundColor: Colors.rose,
  },
  tagText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  tagTextSelected: {
    color: '#fff',
  },
  noteBox: {
    backgroundColor: 'rgba(243,201,105,0.12)',
    borderRadius: Radius.md,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(243,201,105,0.4)',
  },
  noteTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.oxblood,
    marginBottom: 2,
  },
  noteText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
    color: 'rgba(63,3,11,0.65)',
    lineHeight: 18,
  },
});
