import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Linking, TouchableOpacity } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { BadgeCheckIcon, CheckIcon, ExternalLinkIcon, Film01Icon, Location01Icon, NoteEditIcon } from '@hugeicons/core-free-icons';

// ─── Option data ─────────────────────────────────────────────────────────────

const REEL_GUIDELINE_OPTIONS = [
  {
    label: 'Standard Collab',
    desc: 'Authentic reel + invite @richyreach_official as collaborator',
    text: "Create an authentic Instagram Reel showcasing our brand. Invite @richyreach_official and our brand's Instagram as collaborators. Include our brand hashtag in the caption. Minimum 15 seconds. Reel must be public.",
  },
  {
    label: 'Product Showcase',
    desc: 'Feature the product in action and highlight key benefits',
    text: "Feature our product/service prominently in a creative reel. Invite @richyreach_official and our brand as collaborators. Demonstrate the product in use and highlight its key benefits. Include brand hashtag.",
  },
  {
    label: 'Event Promo',
    desc: 'Promote an upcoming event or offer with excitement',
    text: "Create a reel promoting our upcoming event or offer. Invite @richyreach_official and our brand's page as collaborators. Show excitement and include date/details in caption with brand hashtag.",
  },
  {
    label: 'Story + Reel Combo',
    desc: 'Create both a Story and a Reel, invite as collaborator on both',
    text: "Create a matching Instagram Story and Reel showcasing our brand. Invite @richyreach_official and our brand's Instagram as collaborators on both. Include our brand hashtag. Story must be pinned as a Highlight. Reel must be minimum 15 seconds and public.",
  },
  {
    label: 'Lifestyle Promo',
    desc: 'Organic day-in-life reel featuring the product naturally',
    text: "Create an organic, day-in-life style Instagram Reel featuring our product or service naturally in your routine. Invite @richyreach_official and our brand as collaborators. Avoid overly scripted content — authentic lifestyle integration preferred. Include brand hashtag in caption.",
  },
  {
    label: 'Custom',
    desc: 'Write your own guidelines',
    text: '',
  },
];

const REEL_RULE_OPTIONS = [
  {
    label: 'Standard',
    desc: 'Collaboration link + both collaborators tagged + hashtag',
    text: 'Collaboration reel link must be submitted. Both @richyreach_official and brand Instagram must appear as collaborators. Brand hashtag must be in the caption. Reel must be public.',
  },
  {
    label: 'Strict Reach',
    desc: 'All standard rules + minimum 500 views + 30-day public window',
    text: 'Collaboration reel link required. Both collaborators must be tagged. Brand hashtag in caption. Minimum 500 views. Reel must stay public for at least 30 days.',
  },
  {
    label: 'Engagement Focus',
    desc: 'Minimum 200 likes + 20 comments required',
    text: 'Collaboration reel link must be submitted. Both @richyreach_official and brand Instagram must be tagged as collaborators. Brand hashtag required in caption. Reel must reach a minimum of 200 likes and 20 comments within 7 days of posting.',
  },
  {
    label: 'Long-term Presence',
    desc: 'Reel stays public 60 days + brand hashtag pinned in bio',
    text: 'Collaboration reel link required. Both collaborators must be tagged. Brand hashtag must appear in caption. Reel must remain public for a minimum of 60 days. Brand hashtag must be pinned in the creator\'s Instagram bio for the duration of the campaign.',
  },
  {
    label: 'Custom',
    desc: 'Write your own rules',
    text: '',
  },
];

const REVIEW_GUIDELINE_OPTIONS = [
  {
    label: 'Standard Review',
    desc: 'Honest 4–5 star review mentioning key experience aspects',
    text: 'Visit our business and leave an honest 4–5 star Google Review. Mention the service quality, ambience, and staff experience. Include at least one photo. Review must be from your real Google account.',
  },
  {
    label: 'Detailed Review',
    desc: '100+ words covering food, staff, cleanliness, and value',
    text: 'Leave a comprehensive 4–5 star review covering food/product quality, staff friendliness, cleanliness, and value for money. Minimum 100 words. Include 2+ photos from your visit.',
  },
  {
    label: 'Photo Required',
    desc: 'At least 3 clear photos + honest experience in review',
    text: 'Visit our location and share your experience in a 4–5 star Google Review. At least 3 clear photos required. Mention what you liked most. Review must be from a genuine Google account.',
  },
  {
    label: 'Food Critic Style',
    desc: '150+ words covering taste, presentation, service, and value',
    text: 'Leave a thorough food critic-style 4–5 star Google Review covering taste, presentation, service quality, and value for money. Minimum 150 words. Include at least 3 high-quality photos of the food, ambience, and staff interaction. Review must be from your real Google account.',
  },
  {
    label: 'Local Explorer',
    desc: 'Local guide perspective highlighting what makes it stand out',
    text: 'Visit our business and write a 4–5 star Google Review from the perspective of a local guide. Highlight what makes our business stand out in the area — unique features, signature offerings, or standout service. Minimum 80 words. Include at least 2 photos. Review must be from your genuine Google account.',
  },
  {
    label: 'Custom',
    desc: 'Write your own guidelines',
    text: '',
  },
];

const REVIEW_RULE_OPTIONS = [
  {
    label: 'Standard',
    desc: 'Real account + 50 words + review link submitted',
    text: 'Review must be posted on a real Google account. Minimum 50 words. Google review link must be submitted. Review must be public and verifiable.',
  },
  {
    label: 'Strict',
    desc: 'No new accounts + 100 words + 2 photos + stays live 30 days',
    text: 'Real Google account required (no new accounts). Minimum 100 words. At least 2 photos required. Review link must be submitted. Review must remain live for 30 days.',
  },
  {
    label: 'Photo + Stars Focus',
    desc: '5-star only + min 3 photos + account must have profile picture',
    text: 'Review must be 5 stars. Minimum 3 photos required. Google account must have a profile picture. Review link must be submitted. Review must remain public and verifiable.',
  },
  {
    label: 'Account Age Verified',
    desc: 'Account >6 months old with min 5 prior reviews',
    text: 'Google account must be at least 6 months old with a minimum of 5 existing reviews on the profile. Minimum 75 words. At least 1 photo required. Review link must be submitted. Review must remain live for at least 30 days.',
  },
  {
    label: 'Custom',
    desc: 'Write your own rules',
    text: '',
  },
];

// ─── OptionSelectGroup ────────────────────────────────────────────────────────

interface Option {
  label: string;
  desc: string;
  text: string;
}

interface OptionSelectGroupProps {
  options: Option[];
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  error?: string;
}

function OptionSelectGroup({ options, value, onChange, placeholder, error }: OptionSelectGroupProps) {
  const predefined = options.filter((o) => o.label !== 'Custom');
  const customOption = options.find((o) => o.label === 'Custom');

  // Determine selected index: match value against predefined texts
  const matchedIdx = predefined.findIndex((o) => o.text === value);
  const isCustom = value !== '' && matchedIdx === -1;
  const [showCustom, setShowCustom] = useState(isCustom);

  const handleSelect = (opt: Option) => {
    if (opt.label === 'Custom') {
      setShowCustom(true);
      // Don't clear the existing value — let user edit it
    } else {
      setShowCustom(false);
      onChange(opt.text);
    }
  };

  return (
    <View style={sg.root}>
      {predefined.map((opt) => {
        const selected = !showCustom && opt.text === value;
        return (
          <TouchableOpacity
            key={opt.label}
            style={[sg.card, selected && sg.cardSelected]}
            onPress={() => handleSelect(opt)}
            activeOpacity={0.75}
          >
            <View style={sg.cardInner}>
              <View style={sg.cardText}>
                <Text style={[sg.cardLabel, selected && sg.cardLabelSelected]}>{opt.label}</Text>
                <Text style={sg.cardDesc} numberOfLines={2}>{opt.desc}</Text>
              </View>
              <View style={[sg.radio, selected && sg.radioSelected]}>
                {selected && <HugeiconsIcon icon={CheckIcon} size={11} color="#fff" strokeWidth={2.5} />}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Custom option */}
      {customOption && (
        <TouchableOpacity
          style={[sg.card, showCustom && sg.cardSelected]}
          onPress={() => handleSelect(customOption)}
          activeOpacity={0.75}
        >
          <View style={sg.cardInner}>
            <View style={sg.cardText}>
              <Text style={[sg.cardLabel, showCustom && sg.cardLabelSelected]}>Custom</Text>
              <Text style={sg.cardDesc}>Write your own guidelines</Text>
            </View>
            <View style={[sg.radio, showCustom && sg.radioSelected]}>
              {showCustom && <HugeiconsIcon icon={CheckIcon} size={11} color="#fff" strokeWidth={2.5} />}
            </View>
          </View>
        </TouchableOpacity>
      )}

      {showCustom && (
        <TextInput
          style={[sg.textArea, error && sg.inputError]}
          placeholder={placeholder || 'Type your custom text…'}
          placeholderTextColor="rgba(63,3,11,0.35)"
          onChangeText={onChange}
          value={value}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      )}

      {error && <Text style={sg.errorText}>{error}</Text>}
    </View>
  );
}

// ─── InputField helper ────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export function ArenaStepGoogleReview() {
  const { control, watch, setValue } = useFormContext();
  const arenaType = watch('arenaType');
  const mapsLink = watch('googleMapsLink');

  if (arenaType !== 'google_review') {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Guidelines & Rules</Text>
        <Text style={styles.subheading}>Guidelines and verification rules are pre-configured for optimal engagement.</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoTitleRow}>
            <HugeiconsIcon icon={Film01Icon} size={13} color={Colors.green} strokeWidth={2} />
            <Text style={styles.infoTitle}>How Reel Reach Works</Text>
          </View>
          <Text style={styles.infoItem}>1. Influencer joins and pays the 2,000 coin entry fee</Text>
          <Text style={styles.infoItem}>2. They create a Reel showcasing your brand</Text>
          <Text style={styles.infoItem}>3. They invite @richyreach_official and your brand's Instagram as collaborators</Text>
          <Text style={styles.infoItem}>4. They submit the collaboration reel link — reach is auto-fetched via Instagram API</Text>
          <Text style={styles.infoItem}>5. Highest reach wins 50% of the prize pool</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Google Review Arena</Text>
      <Text style={styles.subheading}>
        Set up your business location. Influencers will visit and leave a verified review — no entry fee.
      </Text>

      {/* Business Info */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <HugeiconsIcon icon={Location01Icon} size={15} color={Colors.oxblood} strokeWidth={2} />
          <Text style={styles.sectionTitle}>Business Details</Text>
        </View>

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

      {/* Google Review instructions are pre-configured */}

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoTitleRow}>
          <HugeiconsIcon icon={BadgeCheckIcon} size={13} color={Colors.green} strokeWidth={2} />
          <Text style={styles.infoTitle}>How Verification Works</Text>
        </View>
        <Text style={styles.infoItem}>1. Influencer joins for free — no entry fee</Text>
        <Text style={styles.infoItem}>2. They visit your business and leave a genuine Google review</Text>
        <Text style={styles.infoItem}>3. They submit the review link for verification</Text>
        <Text style={styles.infoItem}>4. Admin verifies authenticity and approves</Text>
        <Text style={styles.infoItem}>5. 2,500 coins (₹25) credited to their wallet instantly</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sg = StyleSheet.create({
  root: { gap: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(63,3,11,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 11,
    ...Shadow.card,
  },
  cardSelected: {
    borderColor: Colors.oxblood,
    backgroundColor: 'rgba(63,3,11,0.04)',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardText: { flex: 1, gap: 2 },
  cardLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(63,3,11,0.6)',
  },
  cardLabelSelected: { color: Colors.oxblood },
  cardDesc: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: 'rgba(63,3,11,0.4)',
    lineHeight: 16,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(63,3,11,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioSelected: {
    borderColor: Colors.oxblood,
    backgroundColor: Colors.oxblood,
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
    marginTop: 4,
    ...Shadow.card,
  },
  inputError: { borderColor: Colors.rose },
  errorText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: Colors.rose,
  },
});

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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
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
  inputError: { borderColor: Colors.rose },
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
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.green,
  },
  infoItem: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(42,122,90,0.85)',
    lineHeight: 18,
  },
});
