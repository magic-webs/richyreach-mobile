import { Colors, FontFamily } from '@/constants/brand';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';

import { VoiceNoteRecorder } from './VoiceNoteRecorder';
import { TactileButton } from '@/components/ui/tactile-button';
import { useCampaignWizardStore } from '@/store/campaignWizard';

export function StepGuidelines() {
  const {
    mustMention,
    hashtags,
    brandTone,
    updateField,
  } = useCampaignWizardStore();

  const handleNext = () => {
    updateField('createStep', 5);
  };

  const handleBack = () => {
    updateField('createStep', 3);
  };

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Must Mention Keywords</Text>
        <TextInput
          style={styles.formInput}
          placeholder="e.g. hydration, oil-free, derm-tested (comma separated)"
          placeholderTextColor="rgba(63,3,11,0.35)"
          value={mustMention}
          onChangeText={(v) => updateField('mustMention', v)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Hashtags</Text>
        <TextInput
          style={styles.formInput}
          placeholder="e.g. #RichyReach, #SummerGlow"
          placeholderTextColor="rgba(63,3,11,0.35)"
          value={hashtags}
          onChangeText={(v) => updateField('hashtags', v)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Brand Tone</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
          {(['Professional', 'Fun', 'Luxury', 'Casual'] as const).map((tone) => {
            const active = brandTone === tone;
            return (
              <TouchableOpacity
                key={tone}
                style={[styles.toggleBtn, active && styles.toggleBtnActive, { minWidth: 90, marginHorizontal: 4 }]}
                onPress={() => updateField('brandTone', tone)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{tone}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.sectionCard}>
        <VoiceNoteRecorder />
      </View>

      <View style={styles.bottomRow}>
        <TactileButton
          text="Back"
          onPress={handleBack}
          icon="arrowLeft"
          iconPosition="left"
        />
        <TactileButton
          onPress={handleNext}
          text="Next"
          icon="arrow"
          iconPosition="right"
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
  sectionCard: {
    backgroundColor: 'rgba(63,3,11,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.05)',
    borderRadius: 14,
    padding: 12,
    gap: 12,
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
