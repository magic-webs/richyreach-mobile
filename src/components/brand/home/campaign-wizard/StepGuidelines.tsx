import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily } from '@/constants/brand';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { VoiceNoteRecorder } from './VoiceNoteRecorder';
import { TactileButton } from '@/components/ui/tactile-button';
import { useCampaignWizardStore } from '@/store/campaignWizard';

export function StepGuidelines() {
  const {
    mustMention,
    cta,
    hashtags,
    brandKeywords,
    brandTone,
    dos,
    donts,
    addDo,
    removeDo,
    addDont,
    removeDont,
    updateField,
  } = useCampaignWizardStore();

  const [newDo, setNewDo] = useState('');
  const [newDont, setNewDont] = useState('');

  const handleAddDo = () => {
    if (newDo.trim()) {
      addDo(newDo.trim());
      setNewDo('');
    }
  };

  const handleAddDont = () => {
    if (newDont.trim()) {
      addDont(newDont.trim());
      setNewDont('');
    }
  };

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
        <Text style={styles.formLabel}>Brand Keywords</Text>
        <TextInput
          style={styles.formInput}
          placeholder="e.g. organic, vegan (comma separated)"
          placeholderTextColor="rgba(63,3,11,0.35)"
          value={brandKeywords}
          onChangeText={(v) => updateField('brandKeywords', v)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Call To Action (CTA)</Text>
        <View style={styles.gridRow}>
          {(['Download App', 'Visit Website', 'Buy Now', 'Use Coupon'] as const).map((ctaOption) => {
            const active = cta === ctaOption;
            return (
              <TouchableOpacity
                key={ctaOption}
                style={[styles.gridBtn, active && styles.gridBtnActive]}
                onPress={() => updateField('cta', ctaOption)}
                activeOpacity={0.8}
              >
                <Text style={[styles.gridBtnText, active && styles.gridBtnTextActive]}>{ctaOption}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Brand Tone</Text>
        <View style={styles.toggleRow}>
          {(['Professional', 'Fun', 'Luxury', 'Casual'] as const).map((tone) => {
            const active = brandTone === tone;
            return (
              <TouchableOpacity
                key={tone}
                style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                onPress={() => updateField('brandTone', tone)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{tone}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <VoiceNoteRecorder />
      </View>

      {/* DO's Lists */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Do's (What to include)</Text>
        {dos.map((item, idx) => (
          <View key={idx} style={styles.listItem}>
            <View style={styles.listTextContainer}>
              <Icon name="check" size={14} color={Colors.green} />
              <Text style={styles.listText}>{item}</Text>
            </View>
            <TouchableOpacity onPress={() => removeDo(idx)} activeOpacity={0.7}>
              <Icon name="trash" size={14} color={Colors.roseDeep} />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addInputRow}>
          <TextInput
            style={[styles.formInput, { flex: 1, height: 38 }]}
            placeholder="Add new requirement..."
            placeholderTextColor="rgba(63,3,11,0.3)"
            value={newDo}
            onChangeText={setNewDo}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddDo} activeOpacity={0.8}>
            <Icon name="plus" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* DONT's Lists */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Don'ts (What to avoid)</Text>
        {donts.map((item, idx) => (
          <View key={idx} style={styles.listItem}>
            <View style={styles.listTextContainer}>
              <Icon name="x" size={14} color={Colors.roseDeep} />
              <Text style={styles.listText}>{item}</Text>
            </View>
            <TouchableOpacity onPress={() => removeDont(idx)} activeOpacity={0.7}>
              <Icon name="trash" size={14} color={Colors.roseDeep} />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addInputRow}>
          <TextInput
            style={[styles.formInput, { flex: 1, height: 38 }]}
            placeholder="Add new restriction..."
            placeholderTextColor="rgba(63,3,11,0.3)"
            value={newDont}
            onChangeText={setNewDont}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddDont} activeOpacity={0.8}>
            <Icon name="plus" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.05)',
  },
  listTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  listText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.ink,
    flex: 1,
    marginRight: 12,
  },
  addInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  addButton: {
    width: 40,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
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
});
