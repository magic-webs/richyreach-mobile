import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const TONES = ['Fun', 'Professional', 'Luxury', 'Casual'];

interface Props {
  cta: string;
  brandTone: string;
  hashtags: string;
  mustMention: string;
  referenceLinks: string;
  onChangeCta: (v: string) => void;
  onChangeBrandTone: (v: string) => void;
  onChangeHashtags: (v: string) => void;
  onChangeMustMention: (v: string) => void;
  onChangeReferenceLinks: (v: string) => void;
}

export function EditGuidelinesCard({
  cta,
  brandTone,
  hashtags,
  mustMention,
  referenceLinks,
  onChangeCta,
  onChangeBrandTone,
  onChangeHashtags,
  onChangeMustMention,
  onChangeReferenceLinks,
}: Props) {
  return (
    <View style={styles.formSectionCard}>
      <Text style={styles.formSectionHeader}>Guidelines & Tone</Text>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Call To Action *</Text>
        <TextInput
          style={styles.formInput}
          value={cta}
          onChangeText={onChangeCta}
          placeholder="Visit Website / Download App"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Brand Tone / Mood</Text>
        <View style={styles.gridRow}>
          {TONES.map((t) => {
            const active = brandTone.toLowerCase() === t.toLowerCase();
            return (
              <TouchableOpacity
                key={t}
                style={[styles.gridBtn, active && styles.gridBtnActive]}
                onPress={() => onChangeBrandTone(t)}
                activeOpacity={0.8}
              >
                <Text style={[styles.gridBtnText, active && styles.gridBtnTextActive]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Hashtags Required (comma separated)</Text>
        <TextInput
          style={styles.formInput}
          value={hashtags}
          onChangeText={onChangeHashtags}
          placeholder="#RichyReach, #collab"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Must Mention Keywords (comma separated)</Text>
        <TextInput
          style={styles.formInput}
          value={mustMention}
          onChangeText={onChangeMustMention}
          placeholder="Natural, Affordable, Long-lasting"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Reference Links (comma separated)</Text>
        <TextInput
          style={styles.formInput}
          value={referenceLinks}
          onChangeText={onChangeReferenceLinks}
          placeholder="https://instagram.com/p/..."
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
