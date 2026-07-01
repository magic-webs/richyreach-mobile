import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Image } from 'expo-image';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Cancel01Icon, Image01Icon } from '@hugeicons/core-free-icons';
import * as ImagePicker from 'expo-image-picker';



const CATEGORIES = ['General', 'Fashion', 'Beauty', 'Tech', 'Food', 'Travel', 'Fitness', 'Lifestyle', 'Gaming', 'Education'];

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text style={styles.label}>
      {label}
      {required && <Text style={{ color: Colors.rose }}> *</Text>}
    </Text>
  );
}

function InputField({ label, control, name, placeholder, multiline, rules, keyboardType }: any) {
  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={!!rules?.required} />
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <>
            <TextInput
              style={[styles.input, multiline && styles.textArea, error && styles.inputError]}
              placeholder={placeholder}
              placeholderTextColor="rgba(63,3,11,0.35)"
              onBlur={onBlur}
              onChangeText={onChange}
              value={String(value ?? '')}
              multiline={multiline}
              numberOfLines={multiline ? 4 : 1}
              keyboardType={keyboardType || 'default'}
              textAlignVertical={multiline ? 'top' : 'auto'}
            />
            {error && <Text style={styles.errorText}>{error.message || 'Required'}</Text>}
          </>
        )}
      />
    </View>
  );
}

function DateField({ label, control, name }: { label: string; control: any; name: string }) {
  return (
    <View style={[styles.field, { flex: 1 }]}>
      <FieldLabel label={label} required />
      <Controller
        control={control}
        name={name}
        rules={{ required: 'Required' }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="rgba(63,3,11,0.35)"
              onChangeText={onChange}
              value={value}
              keyboardType="numeric"
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />
    </View>
  );
}

export function ArenaStepBasics() {
  const { control, watch, setValue } = useFormContext();

  const currentCategory = watch('category');
  const bannerUrl = watch('bannerUrl');

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
      <InputField
        label="Arena Title"
        control={control}
        name="title"
        placeholder="e.g. Summer Glow Reel Challenge"
        rules={{ required: 'Title is required', minLength: { value: 5, message: 'Min 5 characters' } }}
      />

      <InputField
        label="Description"
        control={control}
        name="description"
        placeholder="Describe what creators need to do, what they win, and any special rules..."
        multiline
        rules={{ required: 'Description is required' }}
      />

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

      {/* Arena Banner Selector */}
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

      {/* Dates */}
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
  field: { gap: 8 },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.oxblood,
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
    height: 110,
    paddingTop: 12,
  },
  inputError: {
    borderColor: Colors.rose,
  },
  errorText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: Colors.rose,
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
