import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, Linking, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { BadgeCheckIcon, CheckIcon, ExternalLinkIcon, Film01Icon, Location01Icon, Search01Icon } from '@hugeicons/core-free-icons';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const fetchSuggestions = async (input: string) => {
  if (!input || input.length < 3) return [];

  if (GOOGLE_API_KEY) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=establishment&key=${GOOGLE_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'OK' && data.predictions) {
        return data.predictions.map((p: any) => ({
          id: p.place_id,
          title: p.structured_formatting?.main_text || p.description,
          subtitle: p.structured_formatting?.secondary_text || '',
          placeId: p.place_id,
          isGoogle: true,
        }));
      }
    } catch (e) {
      console.warn('Google Places Autocomplete error:', e);
    }
  }

  // Fallback to OpenStreetMap Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&limit=5`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'RichyReachMobileApp/1.0',
      },
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        id: String(item.place_id),
        title: item.name || item.display_name.split(',')[0],
        subtitle: item.display_name,
        placeId: '',
        isGoogle: false,
      }));
    }
  } catch (e) {
    console.warn('Nominatim autocomplete error:', e);
  }

  return [];
};

export function ArenaStepGoogleReview() {
  const { control, watch, setValue } = useFormContext();
  const arenaType = watch('arenaType');
  const mapsLink = watch('googleMapsLink');
  const businessNameValue = watch('businessName') || '';

  const [inputValue, setInputValue] = useState(businessNameValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSearchTimer, setActiveSearchTimer] = useState<any>(null);

  // Sync state if form value updates from outside
  useEffect(() => {
    if (businessNameValue !== inputValue) {
      setInputValue(businessNameValue);
    }
  }, [businessNameValue]);

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setValue('businessName', text, { shouldValidate: true, shouldDirty: true });

    if (activeSearchTimer) {
      clearTimeout(activeSearchTimer);
    }

    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const results = await fetchSuggestions(text);
      setSuggestions(results);
      setLoading(false);
    }, 500);
    setActiveSearchTimer(timer);
  };

  const handleSelectSuggestion = (item: any) => {
    setInputValue(item.title);
    setValue('businessName', item.title, { shouldValidate: true, shouldDirty: true });

    // Automatically generate direct Google Review link
    let generatedLink = '';
    if (item.isGoogle && item.placeId) {
      generatedLink = `https://search.google.com/local/writereview?placeid=${item.placeId}`;
    } else {
      generatedLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.title + ' ' + (item.subtitle || ''))}`;
    }
    setValue('googleMapsLink', generatedLink, { shouldValidate: true, shouldDirty: true });
    setSuggestions([]);
  };

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

        {/* Business Name Autocomplete Input */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Business / Location Name</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Start typing business name (e.g. Starbucks Connaught Place)"
              placeholderTextColor="rgba(63,3,11,0.35)"
              onChangeText={handleInputChange}
              value={inputValue}
              autoCorrect={false}
            />
            {loading && (
              <ActivityIndicator style={styles.inputLoader} size="small" color={Colors.oxblood} />
            )}
          </View>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsCard}>
              {suggestions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectSuggestion(item)}
                  activeOpacity={0.8}
                >
                  <HugeiconsIcon icon={Location01Icon} size={14} color="rgba(63,3,11,0.4)" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestionTitle}>{item.title}</Text>
                    {item.subtitle ? (
                      <Text style={styles.suggestionSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Read-Only Google Maps Link Auto-Created */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Auto-generated Google Review Link</Text>
          </View>
          <Controller
            control={control}
            name="googleMapsLink"
            render={({ field: { value }, fieldState: { error } }) => (
              <>
                <TextInput
                  style={[styles.input, styles.inputDisabled, error && styles.inputError]}
                  value={value}
                  editable={false}
                  placeholder="Will be auto-generated when location is selected"
                  placeholderTextColor="rgba(63,3,11,0.35)"
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />
        </View>

        {mapsLink ? (
          <TouchableOpacity
            style={styles.previewLinkBtn}
            onPress={() => Linking.openURL(mapsLink).catch(() => {})}
            activeOpacity={0.8}
          >
            <HugeiconsIcon icon={Location01Icon} size={14} color={Colors.green} strokeWidth={2} />
            <Text style={styles.previewLinkText}>Verify Generated Link</Text>
            <HugeiconsIcon icon={ExternalLinkIcon} size={13} color={Colors.green} strokeWidth={2} />
          </TouchableOpacity>
        ) : null}
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
  field: { gap: 6, position: 'relative', zIndex: 10 },
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
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
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
  inputDisabled: {
    backgroundColor: 'rgba(63,3,11,0.03)',
    color: 'rgba(63,3,11,0.5)',
    borderColor: 'rgba(63,3,11,0.08)',
  },
  inputLoader: {
    position: 'absolute',
    right: 14,
  },
  inputError: { borderColor: Colors.rose },
  errorText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: Colors.rose,
  },
  suggestionsCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.12)',
    marginTop: 4,
    ...Shadow.card,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.06)',
    gap: 10,
  },
  suggestionTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    color: Colors.ink,
    fontWeight: '600',
  },
  suggestionSubtitle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: 'rgba(63,3,11,0.4)',
    marginTop: 2,
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
