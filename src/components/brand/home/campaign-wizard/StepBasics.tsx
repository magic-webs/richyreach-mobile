import { Colors, FontFamily } from '@/constants/brand';
import { useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { TactileButton } from '@/components/ui/tactile-button';
import { useCampaignWizardStore } from '@/store/campaignWizard';
import { useProfilesStore } from '@/store/profiles';
import { useUIStore } from '@/store/ui';

export function StepBasics() {
  const showModal = useUIStore((s) => s.showModal);
  const { profiles, activeBrandProfileId } = useProfilesStore();
  const {
    campName,
    brandName,
    selectedBrandProfileId,
    campObjective,
    campDescription,
    campLocationType,
    campLocationValue,
    campNiche,
    campPriority,
    updateField,
    updateState,
  } = useCampaignWizardStore();

  // Always sync the active brand profile into the wizard state when the wizard opens
  // or when the active profile changes (e.g. user switched profiles mid-session).
  useEffect(() => {
    if (profiles.length === 0) return;

    // Determine which profile should be active
    const resolvedId = selectedBrandProfileId || activeBrandProfileId || profiles[0]?.id;
    const activeProfile = profiles.find((p) => p.id === resolvedId) || profiles[0];

    if (activeProfile && (activeProfile.id !== selectedBrandProfileId || !brandName)) {
      updateState({
        brandName: activeProfile.companyName,
        selectedBrandProfileId: activeProfile.id,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles, activeBrandProfileId]);

  const handleNext = () => {
    if (!campName.trim() || !brandName.trim() || !campDescription.trim()) {
      showModal({ title: 'Information Required', message: 'Name, Brand, and Description are required.' });
      return;
    }
    updateField('createStep', 2);
  };

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Campaign Name *</Text>
        <TextInput
          style={styles.formInput}
          placeholder="e.g. Summer Glow Launch"
          placeholderTextColor="rgba(63,3,11,0.35)"
          value={campName}
          onChangeText={(v) => updateField('campName', v)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Brand Profile *</Text>
        <View style={styles.gridRow}>
          {profiles.map((p) => {
            const active = selectedBrandProfileId
              ? selectedBrandProfileId === p.id
              : activeBrandProfileId === p.id || brandName === p.companyName;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.gridBtn, active && styles.gridBtnActive]}
                onPress={() => updateState({ brandName: p.companyName, selectedBrandProfileId: p.id })}
                activeOpacity={0.8}
              >
                <Text style={[styles.gridBtnText, active && styles.gridBtnTextActive]}>{p.companyName}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Objective *</Text>
        <View style={styles.gridRow}>
          {(['Brand Awareness', 'Product Launch', 'App Installs', 'Website Traffic', 'Sales/Conversions', 'Lead Generation'] as const).map((obj) => {
            const active = campObjective === obj;
            return (
              <TouchableOpacity
                key={obj}
                style={[styles.gridBtn, active && styles.gridBtnActive]}
                onPress={() => updateField('campObjective', obj)}
                activeOpacity={0.8}
              >
                <Text style={[styles.gridBtnText, active && styles.gridBtnTextActive]}>{obj}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Industry / Niche *</Text>
        <View style={styles.gridRow}>
          {(['Fashion', 'Real Estate', 'Beauty', 'Food', 'Tech', 'Finance', 'Education', 'Gaming', 'Travel', 'Fitness'] as const).map((niche) => {
            const active = campNiche === niche;
            return (
              <TouchableOpacity
                key={niche}
                style={[styles.gridBtn, active && styles.gridBtnActive]}
                onPress={() => updateField('campNiche', niche)}
                activeOpacity={0.8}
              >
                <Text style={[styles.gridBtnText, active && styles.gridBtnTextActive]}>{niche}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Campaign Description *</Text>
        <TextInput
          style={[styles.formInput, styles.textArea]}
          multiline
          numberOfLines={4}
          placeholder="Provide details about what creators should do..."
          placeholderTextColor="rgba(63,3,11,0.35)"
          value={campDescription}
          onChangeText={(v) => updateField('campDescription', v)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Location Type *</Text>
        <View style={styles.toggleRow}>
          {(['Pan India', 'State', 'City'] as const).map((locType) => {
            const active = campLocationType === locType;
            return (
              <TouchableOpacity
                key={locType}
                style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                onPress={() => updateField('campLocationType', locType)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{locType}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {campLocationType !== 'Pan India' && (
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>{campLocationType} Details</Text>
          <TextInput
            style={styles.formInput}
            placeholder={`e.g. Maharashtra, Mumbai, or 400001`}
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={campLocationValue}
            onChangeText={(v) => updateField('campLocationValue', v)}
          />
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Campaign Priority *</Text>
        <View style={styles.toggleRow}>
          {(['Normal', 'High', 'Urgent'] as const).map((pri) => {
            const active = campPriority === pri;
            return (
              <TouchableOpacity
                key={pri}
                style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                onPress={() => updateField('campPriority', pri)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{pri}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TactileButton
        onPress={handleNext}
        text="Next"
        fullWidth
        icon="arrow"
        iconPosition="right"
      />
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
  textArea: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: 'top',
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
  primaryActionBtn: {
    backgroundColor: Colors.oxblood,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryActionBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 13.5,
    color: '#ffffff',
  },
});
