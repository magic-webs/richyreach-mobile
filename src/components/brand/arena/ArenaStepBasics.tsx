import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';

const CATEGORIES = ['Fashion', 'Beauty', 'Tech', 'Food', 'Travel', 'Fitness', 'Lifestyle', 'Gaming', 'Education', 'General'];

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
  const { control, watch } = useFormContext();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Arena Details</Text>
      <Text style={styles.subheading}>Set the title, description, dates, and category.</Text>

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
            <View style={styles.pillRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.8}
                  onPress={() => onChange(cat)}
                  style={[styles.pill, value === cat && styles.pillActive]}
                >
                  <Text style={[styles.pillText, value === cat && styles.pillTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
            <View style={styles.counterRow}>
              {[10, 25, 50, 100, 250, 500].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.counterBtn, value === n && styles.counterBtnActive]}
                  onPress={() => onChange(n)}
                >
                  <Text style={[styles.counterBtnText, value === n && styles.counterBtnTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      {/* Dates */}
      <View style={styles.dateRow}>
        <DateField label="Start Date" control={control} name="startDate" />
        <View style={{ width: 12 }} />
        <DateField label="End Date" control={control} name="endDate" />
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
    flexWrap: 'wrap',
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
    flexWrap: 'wrap',
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
});
