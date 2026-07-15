import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TextInput, View, Linking, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ExternalLinkIcon, Location01Icon, Search01Icon, Cancel01Icon, Image01Icon } from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';

const CATEGORIES = ['General', 'Fashion', 'Beauty', 'Tech', 'Food', 'Travel', 'Fitness', 'Lifestyle', 'Gaming', 'Education'];

// Places autocomplete lookup
const fetchSuggestions = async (input: string) => {
  if (!input || input.length < 2) return [];
  try {
    const data = await api.places.autocomplete(input);
    if (Array.isArray(data.predictions) && data.predictions.length > 0) {
      return data.predictions.map((p: any) => ({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle,
        placeId: p.placeId,
        isGoogle: true,
      }));
    }
  } catch (e) {
    console.warn('Places proxy fetch error:', e);
  }

  try {
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(input)}` +
      `&format=json&limit=6&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'RichyReachMobileApp/1.0' },
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

function uuid4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text style={styles.label}>
      {label}
      {required && <Text style={{ color: Colors.rose }}> *</Text>}
    </Text>
  );
}

export function GoogleReviewStepBasics() {
  const { control, watch, setValue } = useFormContext();

  const mapsLink = watch('googleMapsLink');
  const businessNameValue = watch('businessName') || '';
  const bannerUrl = watch('bannerUrl');
  const currentCategory = watch('category');

  const [inputValue, setInputValue] = useState(businessNameValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionTokenRef = useRef<string>(uuid4());

  useEffect(() => {
    if (businessNameValue !== inputValue) {
      setInputValue(businessNameValue);
    }
  }, [businessNameValue]);

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setValue('businessName', text, { shouldValidate: true, shouldDirty: true });

    if (timerRef.current) clearTimeout(timerRef.current);
    if (text.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      const results = await fetchSuggestions(text);
      setSuggestions(results);
      setLoading(false);
    }, 400);
  };

  const handleSelectSuggestion = (item: any) => {
    setInputValue(item.title);
    setValue('businessName', item.title, { shouldValidate: true, shouldDirty: true });
    sessionTokenRef.current = uuid4();

    let generatedLink = '';
    if (item.isGoogle && item.placeId) {
      generatedLink = `https://search.google.com/local/writereview?placeid=${item.placeId}`;
    } else {
      generatedLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.title + ' ' + (item.subtitle || ''))}`;
    }
    setValue('googleMapsLink', generatedLink, { shouldValidate: true, shouldDirty: true });
    setSuggestions([]);
  };

  const { data: templates = [] } = useQuery<any[]>({
    queryKey: ['arenaTemplates'],
    queryFn: async () => {
      const res = await api.arena.getTemplates();
      return res || [];
    },
  });

  const filteredTemplates = templates.filter(
    (t) => t.category?.toLowerCase() === currentCategory?.toLowerCase()
  );
  const templatesToShow = filteredTemplates.length > 0
    ? filteredTemplates
    : templates.filter((t) => t.category?.toLowerCase() === 'general').length > 0
      ? templates.filter((t) => t.category?.toLowerCase() === 'general')
      : templates;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setValue('bannerUrl', result.assets[0].uri, { shouldValidate: true, shouldDirty: true });
    }
  };

  const clearImage = () => {
    setValue('bannerUrl', '', { shouldValidate: true, shouldDirty: true });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Google Review Details</Text>
      <Text style={styles.subheading}>
        Configure your business location and general details for the Google Review Arena.
      </Text>

      {/* Business details container */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <HugeiconsIcon icon={Location01Icon} size={15} color={Colors.oxblood} strokeWidth={2} />
          <Text style={styles.sectionTitle}>Business Details</Text>
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Business / Location Name</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.searchIconWrap} pointerEvents="none">
              <HugeiconsIcon icon={Search01Icon} size={15} color="rgba(63,3,11,0.4)" strokeWidth={2} />
            </View>
            <TextInput
              style={[styles.input, styles.inputWithIcon]}
              placeholder="Type a business name…"
              placeholderTextColor="rgba(63,3,11,0.35)"
              onChangeText={handleInputChange}
              value={inputValue}
              autoCorrect={false}
              autoCapitalize="words"
              returnKeyType="search"
            />
            {loading && (
              <ActivityIndicator style={styles.inputLoader} size="small" color={Colors.oxblood} />
            )}
          </View>

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

        <View style={styles.field}>
          <Text style={styles.label}>Auto-generated Google Review Link</Text>
          <Controller
            control={control}
            name="googleMapsLink"
            rules={{ required: 'Google Review Link is required' }}
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

      <View style={styles.divider} />

      {/* Basics details */}
      <View style={styles.section}>
        <View style={styles.field}>
          <FieldLabel label="Arena Title" required />
          <Controller
            control={control}
            name="title"
            rules={{ required: 'Title is required', minLength: { value: 5, message: 'Min 5 characters' } }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="e.g. Summer Review Drive"
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={String(value ?? '')}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />
        </View>

        <View style={styles.field}>
          <FieldLabel label="Description" required />
          <Controller
            control={control}
            name="description"
            rules={{ required: 'Description is required' }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  style={[styles.input, styles.textArea, error && styles.inputError]}
                  placeholder="Describe your review drive..."
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={String(value ?? '')}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <FieldLabel label="Category" />
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.8}
                    onPress={() => {
                      onChange(cat);
                      setValue('bannerUrl', '', { shouldValidate: true });
                    }}
                    style={[styles.pill, value === cat && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, value === cat && styles.pillTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          />
        </View>

        {/* Banner Selector */}
        <View style={styles.field}>
          <FieldLabel label="Arena Banner Image" required />
          <Controller
            control={control}
            name="bannerUrl"
            rules={{ required: 'Arena banner is required' }}
            render={({ fieldState: { error } }) => (
              <>
                {bannerUrl ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: bannerUrl }} style={styles.imagePreview} contentFit="cover" />
                    <TouchableOpacity style={styles.clearImageBtn} onPress={clearImage}>
                      <HugeiconsIcon icon={Cancel01Icon} size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : null}

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templatesScroll}>
                  <TouchableOpacity
                    style={[styles.templateCard, styles.devicePickerCard]}
                    onPress={pickImage}
                    activeOpacity={0.8}
                  >
                    <HugeiconsIcon icon={Image01Icon} size={20} color={Colors.oxblood} />
                    <Text style={styles.devicePickerText}>Upload custom</Text>
                  </TouchableOpacity>

                  {templatesToShow.map((tmpl) => {
                    const active = bannerUrl === tmpl.imageUrl;
                    return (
                      <TouchableOpacity
                        key={tmpl.id}
                        style={[styles.templateCard, active && styles.templateCardActive]}
                        onPress={() => setValue('bannerUrl', tmpl.imageUrl, { shouldValidate: true, shouldDirty: true })}
                        activeOpacity={0.8}
                      >
                        <Image source={{ uri: tmpl.imageUrl }} style={styles.templateImage} contentFit="cover" />
                        {active && (
                          <View style={styles.activeOverlay}>
                            <Text style={styles.activeCheck}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />
        </View>

        {/* Max Participants */}
        <View style={styles.field}>
          <FieldLabel label="Max Participants" />
          <Controller
            control={control}
            name="maxParticipants"
            rules={{ required: true, min: { value: 1, message: 'Min 1' } }}
            render={({ field: { onChange, value } }) => (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.counterRow}>
                {[10, 25, 50, 100, 250, 500].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.counterBtn, value === n && styles.counterBtnActive]}
                    onPress={() => onChange(n)}
                  >
                    <Text style={[styles.counterBtnText, value === n && styles.counterBtnTextActive]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          />
        </View>

        {/* Duration */}
        <View style={styles.field}>
          <FieldLabel label="Arena Duration" required />
          <Controller
            control={control}
            name="startDate"
            rules={{ required: 'Duration is required' }}
            render={({ fieldState: { error } }) => {
              const startVal = watch('startDate');
              const endVal = watch('endDate');
              return (
                <>
                  <DateRangePicker
                    startDate={startVal}
                    endDate={endVal}
                    onChange={(start, end) => {
                      setValue('startDate', start, { shouldValidate: true, shouldDirty: true });
                      setValue('endDate', end, { shouldValidate: true, shouldDirty: true });
                    }}
                    label="Select Arena Duration"
                  />
                  {error && <Text style={styles.errorText}>{error.message}</Text>}
                </>
              );
            }}
          />
        </View>
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
  divider: {
    height: 1,
    backgroundColor: 'rgba(63,3,11,0.08)',
    marginVertical: 4,
  },
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
  searchIconWrap: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: 38,
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
  },
  inputDisabled: {
    backgroundColor: 'rgba(63,3,11,0.03)',
    color: 'rgba(63,3,11,0.5)',
    borderColor: 'rgba(63,3,11,0.08)',
    shadowOpacity: 0,
    elevation: 0,
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
  textArea: {
    height: 110,
    paddingTop: 12,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.1)',
  },
  pillActive: {
    backgroundColor: Colors.oxblood,
    borderColor: Colors.oxblood,
  },
  pillText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: 'rgba(63,3,11,0.6)',
  },
  pillTextActive: {
    color: '#fff',
  },
  counterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  counterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.md,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.1)',
    minWidth: 52,
    alignItems: 'center',
  },
  counterBtnActive: {
    backgroundColor: Colors.oxblood,
    borderColor: Colors.oxblood,
  },
  counterBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(63,3,11,0.6)',
  },
  counterBtnTextActive: {
    color: '#fff',
  },
  imagePreviewContainer: {
    position: 'relative',
    height: 120,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.1)',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  clearImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: Radius.full,
    padding: 6,
  },
  templatesScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  templateCard: {
    width: 120,
    height: 70,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(63,3,11,0.1)',
    backgroundColor: '#fff',
    position: 'relative',
  },
  templateCardActive: {
    borderColor: Colors.oxblood,
  },
  templateImage: {
    width: '100%',
    height: '100%',
  },
  devicePickerCard: {
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  devicePickerText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9,
    color: Colors.oxblood,
    textAlign: 'center',
  },
  activeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(63,3,11,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCheck: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
