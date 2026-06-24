import React from 'react';
import { StyleSheet, Text, TextInput, View, Linking, TouchableOpacity } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ExternalLinkIcon, Location01Icon } from '@hugeicons/core-free-icons';

function TextAreaField({ label, control, name, placeholder, required, description }: any) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}>*</Text>}
      </View>
      {description && <Text style={styles.fieldDesc}>{description}</Text>}
      <Controller
        control={control}
        name={name}
        rules={required ? { required: `${label} is required` } : undefined}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <TextInput
              style={[styles.textArea, error && styles.inputError]}
              placeholder={placeholder}
              placeholderTextColor="rgba(63,3,11,0.35)"
              onChangeText={onChange}
              value={value}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />
    </View>
  );
}

function InputField({ label, control, name, placeholder, required, description, keyboardType }: any) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}>*</Text>}
      </View>
      {description && <Text style={styles.fieldDesc}>{description}</Text>}
      <Controller
        control={control}
        name={name}
        rules={required ? { required: `${label} is required` } : undefined}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder={placeholder}
              placeholderTextColor="rgba(63,3,11,0.35)"
              onChangeText={onChange}
              value={value}
              keyboardType={keyboardType || 'default'}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />
    </View>
  );
}

export function ArenaStepGoogleReview() {
  const { control, watch } = useFormContext();
  const arenaType = watch('arenaType');
  const mapsLink = watch('googleMapsLink');

  if (arenaType !== 'google_review') {
    // For non-Google-Review arenas, show general guidelines only
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Guidelines & Rules</Text>
        <Text style={styles.subheading}>Tell participants what to do and what's expected.</Text>

        <TextAreaField
          label="Review Guidelines"
          control={control}
          name="reviewGuidelines"
          placeholder="e.g. Post an authentic reel showcasing the product. Use our brand hashtag. Min 15 seconds."
          description="Instructions shown to all participants after they join."
        />

        <TextAreaField
          label="Verification Rules"
          control={control}
          name="verificationRules"
          placeholder="e.g. Reel must be public. Hashtag must appear in caption. Minimum 1,000 views."
          description="Rules used to approve or reject submissions."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Google Review Arena</Text>
      <Text style={styles.subheading}>
        Set up your business location. Influencers will visit and leave a verified review.
      </Text>

      {/* Business Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Business Details</Text>

        <InputField
          label="Business / Location Name"
          control={control}
          name="businessName"
          placeholder="e.g. Café Bloom, Hotel Royale, The Shoe Store"
          required
        />

        <InputField
          label="Google Maps Link"
          control={control}
          name="googleMapsLink"
          placeholder="https://maps.google.com/?cid=..."
          required
          description="Paste the Google Maps link to your exact business listing."
          keyboardType="url"
        />

        {/* Preview link */}
        {mapsLink ? (
          <TouchableOpacity
            style={styles.previewLinkBtn}
            onPress={() => Linking.openURL(mapsLink).catch(() => {})}
            activeOpacity={0.8}
          >
            <HugeiconsIcon icon={Location01Icon} size={14} color={Colors.green} strokeWidth={2} />
            <Text style={styles.previewLinkText}>Open in Google Maps</Text>
            <HugeiconsIcon icon={ExternalLinkIcon} size={13} color={Colors.green} strokeWidth={2} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Review Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Review Instructions</Text>

        <TextAreaField
          label="Review Guidelines"
          control={control}
          name="reviewGuidelines"
          placeholder="e.g. Leave an honest 4-5 star review. Mention the service quality, ambience, and staff. Must include a photo."
          required
          description="Shown to participants after joining. Be specific about what the review should cover."
        />

        <TextAreaField
          label="Verification Rules"
          control={control}
          name="verificationRules"
          placeholder="e.g. Review must be posted on your real Google account. Minimum 50 words. Screenshot + review link required."
          description="Rules used by admin to approve the submission and credit the reward."
        />
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>✅ How Verification Works</Text>
        <Text style={styles.infoItem}>1. Influencer joins arena and pays 2,000 coin entry fee</Text>
        <Text style={styles.infoItem}>2. They visit your business and leave a genuine review</Text>
        <Text style={styles.infoItem}>3. They upload a screenshot + share the review link</Text>
        <Text style={styles.infoItem}>4. Admin verifies authenticity and approves</Text>
        <Text style={styles.infoItem}>5. 2,500 coins (₹25) credited to their wallet instantly</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
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
    marginTop: -8,
  },
  section: { gap: 14 },
  sectionTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  field: { gap: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  required: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.rose,
    fontWeight: '700',
  },
  fieldDesc: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
    color: 'rgba(63,3,11,0.45)',
    lineHeight: 17,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FontFamily.sansRegular,
    fontSize: 14,
    color: Colors.ink,
    ...Shadow.card,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FontFamily.sansRegular,
    fontSize: 14,
    color: Colors.ink,
    height: 110,
    ...Shadow.card,
  },
  inputError: {
    borderColor: Colors.rose,
  },
  errorText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: Colors.rose,
  },
  previewLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(42,122,90,0.08)',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(42,122,90,0.2)',
  },
  previewLinkText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.green,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: 'rgba(42,122,90,0.07)',
    borderRadius: Radius.lg,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(42,122,90,0.2)',
  },
  infoTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.green,
    marginBottom: 4,
  },
  infoItem: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(42,122,90,0.85)',
    lineHeight: 18,
  },
});
