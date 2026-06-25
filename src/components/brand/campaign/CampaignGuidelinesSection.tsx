import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  cta: string;
  brandTone: string;
  hashtags?: string;
  mustMention?: string;
  audioUrl?: string;
  referenceLinks?: string;
  playerPlaying: boolean;
  playerCurrentTime: number;
  playerDuration: number;
  onPlayPause: () => void;
  formatDuration: (s: number) => string;
}

export function CampaignGuidelinesSection({
  cta,
  brandTone,
  hashtags,
  mustMention,
  audioUrl,
  referenceLinks,
  playerPlaying,
  playerCurrentTime,
  playerDuration,
  onPlayPause,
  formatDuration,
}: Props) {
  return (
    <>
      {/* Guidelines & Tone */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeading}>Guidelines & Tone</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.detailsRowLabel}>Call To Action:</Text>
          <Text style={styles.detailsRowValue}>{cta}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detailsRowLabel}>Brand Tone / Mood:</Text>
          <Text style={styles.detailsRowValue}>{brandTone}</Text>
        </View>
        {hashtags ? (
          <View style={{ marginTop: 4 }}>
            <Text style={styles.blockLabel}>Hashtags Required:</Text>
            <Text style={styles.blockValue}>{hashtags}</Text>
          </View>
        ) : null}
        {mustMention ? (
          <View style={{ marginTop: 4 }}>
            <Text style={styles.blockLabel}>Must Mention Keywords:</Text>
            <Text style={styles.blockValue}>{mustMention}</Text>
          </View>
        ) : null}

        {/* Voice Note Audio Player */}
        {audioUrl ? (
          <View style={styles.audioPlayerCard}>
            <TouchableOpacity style={styles.playBtnSmall} onPress={onPlayPause} activeOpacity={0.8}>
              <Icon name={playerPlaying ? 'pause' : 'play'} size={16} color={Colors.oxblood} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.audioLabel}>
                {playerPlaying
                  ? `Playing: ${formatDuration(playerCurrentTime)} / ${formatDuration(playerDuration)}`
                  : `Listen to Voice Instructions (${formatDuration(playerDuration)})`}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Reference Links */}
      {referenceLinks ? (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Reference Links</Text>
          {referenceLinks.split(',').map((link, idx) => {
            const cleanLink = link.trim();
            if (!cleanLink) return null;
            return (
              <TouchableOpacity
                key={idx}
                style={styles.linkItemRow}
                onPress={() => Linking.openURL(cleanLink)}
              >
                <Icon name="link" size={14} color={Colors.roseDeep} />
                <Text style={styles.linkItemText} numberOfLines={1}>
                  {cleanLink}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
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
  blockLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.roseDeep,
    marginBottom: 2,
  },
  blockValue: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(42, 2, 7, 0.75)',
    lineHeight: 18,
  },
  audioPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(63,3,11,0.03)',
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
  },
  playBtnSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  audioLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.oxblood,
  },
  linkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  linkItemText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.roseDeep,
    flex: 1,
  },
});
