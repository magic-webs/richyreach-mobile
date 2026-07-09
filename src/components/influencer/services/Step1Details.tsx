import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { Controller } from 'react-hook-form';
import {
  CATEGORIES,
  DELIVERY_TIMES,
} from './constants';

import { TactileButton } from '@/components/ui/tactile-button';

interface Step1DetailsProps {
  control: any;
  errors: any;
  deliveryTime: string;
  setDeliveryTime: (val: string) => void;
  videoUrl: string;
  triggerVideoPicker: () => void;
  getFrames: () => any[];
  tags: string[];
  removeTag: (idx: number) => void;
  showTagInput: boolean;
  setShowTagInput: (val: boolean) => void;
  tagInput: string;
  setTagInput: (val: string) => void;
  addTag: () => void;
  handleNextStep: () => void;
  videoDuration: string;
  watch: any;
  videoError?: string;
}

export function Step1Details({
  control,
  errors,
  deliveryTime,
  setDeliveryTime,
  videoUrl,
  triggerVideoPicker,
  getFrames,
  tags,
  removeTag,
  showTagInput,
  setShowTagInput,
  tagInput,
  setTagInput,
  addTag,
  handleNextStep,
  videoDuration,
  watch,
  videoError,
}: Step1DetailsProps) {
  const nameValue = watch('name') || '';
  const shortDescValue = watch('shortDesc') || '';

  return (
    <View style={styles.stepWrapper}>
      {/* Basic Info Card */}
      <View style={styles.formCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconBox}>
            <Icon name="briefcase" size={16} color={Colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Basic information</Text>
            <Text style={styles.cardSub}>Tell brands about your service</Text>
          </View>
        </View>

        <View style={styles.inputsStack}>
          {/* Service Title */}
          <View style={styles.inputWrap}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Service Title <Text style={{ color: '#FF3B30' }}>*</Text></Text>
              <Text style={styles.counterText}>{nameValue.length}/60</Text>
            </View>
            <Controller
              control={control}
              name="name"
              rules={{
                required: 'Please enter a service title.',
                maxLength: { value: 60, message: 'Title cannot exceed 60 characters.' }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  maxLength={60}
                  style={[styles.textInput, errors.name && { borderColor: '#FF3B30' }]}
                  placeholder="Make Dedicated Brand Reel"
                  placeholderTextColor="rgba(63, 3, 11, 0.35)"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.name && (
              <Text style={{ color: '#FF3B30', fontSize: 11, marginTop: 2 }}>{errors.name.message}</Text>
            )}
          </View>

          {/* Category Section (Single dropdown selecting UGC, Reel, etc.) */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Category <Text style={{ color: '#FF3B30' }}>*</Text></Text>
              <Controller
                control={control}
                name="category"
                rules={{ required: 'Please select a category.' }}
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.dropdownPicker, errors.category && { borderColor: '#FF3B30' }]}>
                    <Icon name="grid" size={14} color={Colors.roseDeep} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {CATEGORIES.map((cat) => (
                          <TouchableOpacity
                            key={cat}
                            onPress={() => onChange(cat)}
                            style={[styles.pickerItem, value === cat && styles.pickerItemActive]}
                          >
                            <Text style={[styles.pickerItemText, value === cat && styles.pickerItemTextActive]}>{cat}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}
              />
              {errors.category && (
                <Text style={{ color: '#FF3B30', fontSize: 11, marginTop: 2 }}>{errors.category.message}</Text>
              )}
            </View>
          </View>

          {/* Price & Delivery Time */}
          <View style={styles.rowFields}>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Price (₹) <Text style={{ color: '#FF3B30' }}>*</Text></Text>
              <Controller
                control={control}
                name="price"
                rules={{
                  required: 'Please enter a valid price.',
                  validate: (val) => {
                    const num = Number(val);
                    if (!val || isNaN(num) || num <= 0) {
                      return 'Price must be greater than 0.';
                    }
                    return true;
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    keyboardType="numeric"
                    style={[styles.textInput, errors.price && { borderColor: '#FF3B30' }]}
                    placeholder="1500"
                    placeholderTextColor="rgba(63, 3, 11, 0.35)"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.price && (
                <Text style={{ color: '#FF3B30', fontSize: 11, marginTop: 2 }}>{errors.price.message}</Text>
              )}
            </View>

            <View style={[styles.inputWrap, { flex: 1.2 }]}>
              <Text style={styles.inputLabel}>Delivery Time <Text style={{ color: '#FF3B30' }}>*</Text></Text>
              <View style={styles.dropdownPicker}>
                <Icon name="clock" size={14} color="rgba(63, 3, 11, 0.45)" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {DELIVERY_TIMES.map((dt) => (
                      <TouchableOpacity
                        key={dt}
                        onPress={() => setDeliveryTime(dt)}
                        style={[styles.pickerItem, deliveryTime === dt && styles.pickerItemActive]}
                      >
                        <Text style={[styles.pickerItemText, deliveryTime === dt && styles.pickerItemTextActive]}>{dt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Tip box */}
          <View style={styles.tipBox}>
            <Icon name="sparkle" size={14} color={Colors.gold} />
            <Text style={styles.tipText}>Tip: Be clear, specific & catchy to get more orders</Text>
          </View>
        </View>
      </View>

      {/* Sample Video Preview Card */}
      <View style={styles.formCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconBox, { backgroundColor: Colors.roseDeep }]}><Icon name="play" size={15} color={Colors.white} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Service Video <Text style={{ color: '#FF3B30' }}>*</Text></Text>
            <Text style={styles.cardSub}>Upload your service video</Text>
          </View>
        </View>

        {/* Video Selector body */}
        {videoUrl ? (
          <View style={styles.videoSelectedContainer}>
            <View style={styles.videoPreviewMedia}>
              <Image
                source={getFrames()[0] ? (typeof getFrames()[0] === 'string' ? { uri: getFrames()[0] as string } : getFrames()[0]) : null}
                style={styles.videoPreviewImage}
                contentFit="cover"
              />
              <View style={styles.videoPreviewOverlay} />
              <View style={styles.videoPreviewPlayCircle}>
                <Icon name="play" size={20} color={Colors.white} />
              </View>
              {videoDuration ? <Text style={styles.videoDurationLabel}>{videoDuration}</Text> : null}
              <TouchableOpacity onPress={triggerVideoPicker} style={styles.replaceVideoBtn}>
                <Icon name="swap" size={12} color={Colors.oxblood} />
                <Text style={styles.replaceVideoText}>Replace</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.videoFootnote}>Max 100MB • MP4, MOV • 9:16 recommended</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={triggerVideoPicker} style={[styles.dashedUploadBox, !!videoError && { borderColor: '#FF3B30', backgroundColor: 'rgba(255, 59, 48, 0.05)' }]} activeOpacity={0.75}>
            <Icon name="plus" size={24} color={!!videoError ? "#FF3B30" : "rgba(63, 3, 11, 0.3)"} />
            <Text style={[styles.uploadBoxTitle, !!videoError && { color: '#FF3B30' }]}>Select Video File</Text>
            <Text style={[styles.uploadBoxSub, !!videoError && { color: '#FF3B30' }]}>Max 100MB • MP4, MOV • 9:16 recommended</Text>
          </TouchableOpacity>
        )}
        {!!videoError && (
          <Text style={{ color: '#FF3B30', fontSize: 11, marginTop: 8 }}>{videoError}</Text>
        )}
      </View>

      {/* Short Description */}
      <View style={styles.formCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconBox}><Icon name="edit" size={15} color={Colors.white} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Description</Text>
            <Text style={styles.cardSub}>Explain what brands will get from this service</Text>
          </View>
          <Text style={styles.counterText}>{shortDescValue.length}/1000</Text>
        </View>

        <Controller
          control={control}
          name="shortDesc"
          rules={{
            required: 'Please write a description for this service.',
            maxLength: { value: 1000, message: 'Description cannot exceed 1000 characters.' }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              multiline
              maxLength={1000}
              numberOfLines={4}
              style={[styles.textAreaInput, errors.shortDesc && { borderColor: '#FF3B30' }]}
              placeholder="Describe your service in detail... what brands will get, how it helps them."
              placeholderTextColor="rgba(63, 3, 11, 0.35)"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.shortDesc && (
          <Text style={{ color: '#FF3B30', fontSize: 11, marginTop: 2 }}>{errors.shortDesc.message}</Text>
        )}
      </View>

      {/* Add Tags */}
      <View style={styles.formCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconBox}><Icon name="grid" size={14} color={Colors.white} /></View>
          <Text style={styles.cardTitle}>Add Tags</Text>
        </View>

        <View style={styles.tagsContainer}>
          {tags.map((tag, idx) => (
            <View key={idx} style={styles.tagPill}>
              <Text style={styles.tagPillText}>{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(idx)} style={styles.tagPillClose}>
                <Icon name="x" size={10} color={Colors.roseDeep} />
              </TouchableOpacity>
            </View>
          ))}

          {showTagInput ? (
            <View style={styles.tagInputWrapper}>
              <TextInput
                autoFocus
                style={styles.tagInputInline}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                onBlur={addTag}
                placeholder="Tag name"
              />
            </View>
          ) : (
            <TouchableOpacity onPress={() => setShowTagInput(true)} style={styles.tagAddBtn}>
              <Icon name="plus" size={12} color={Colors.oxblood} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Next Button */}
      <TactileButton
        text="Save & Continue"
        onPress={handleNextStep}
        variant="primary"
        icon="arrow"
        iconPosition="right"
        fullWidth
        style={{ marginTop: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stepWrapper: {
    gap: 16,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    ...Shadow.card,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
  },
  cardSub: {
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.45)',
    fontFamily: FontFamily.sansMedium,
  },
  inputsStack: {
    gap: 12,
  },
  inputWrap: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  counterText: {
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.35)',
    fontFamily: FontFamily.sansMedium,
  },
  textInput: {
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.08)',
    fontSize: 14,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  dropdownPicker: {
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.1)',
    backgroundColor: Colors.white,
  },
  pickerItemActive: {
    backgroundColor: Colors.oxblood,
    borderColor: Colors.oxblood,
  },
  pickerItemText: {
    fontSize: 11,
    fontFamily: FontFamily.sansMedium,
    color: 'rgba(63, 3, 11, 0.6)',
  },
  pickerItemTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 201, 105, 0.1)',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(243, 201, 105, 0.3)',
  },
  tipText: {
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.65)',
    fontFamily: FontFamily.sansMedium,
    flex: 1,
  },
  optionalBadge: {
    backgroundColor: 'rgba(180, 106, 116, 0.12)',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  optionalBadgeText: {
    fontSize: 9.5,
    color: Colors.roseDeep,
    fontFamily: FontFamily.sans,
    fontWeight: '700',
  },
  videoSelectedContainer: {
    gap: 10,
  },
  videoPreviewMedia: {
    position: 'relative',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
  },
  videoPreviewImage: {
    width: '100%',
    height: '100%',
  },
  videoPreviewOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  videoPreviewPlayCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDurationLabel: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    color: Colors.white,
    fontSize: 10,
    fontFamily: FontFamily.sansMedium,
  },
  replaceVideoBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: Colors.white,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 9,
    gap: 4,
    ...Shadow.card,
  },
  replaceVideoText: {
    fontSize: 10.5,
    fontFamily: FontFamily.sans,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  videoFootnote: {
    fontSize: 10,
    color: 'rgba(63, 3, 11, 0.4)',
    fontFamily: FontFamily.sansMedium,
    textAlign: 'center',
  },
  dashedUploadBox: {
    height: 120,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(63, 3, 11, 0.08)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadBoxTitle: {
    fontSize: 13.5,
    fontFamily: FontFamily.sans,
    color: Colors.oxblood,
  },
  uploadBoxSub: {
    fontSize: 10,
    color: 'rgba(63, 3, 11, 0.4)',
    fontFamily: FontFamily.sansMedium,
  },
  textAreaInput: {
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.08)',
    padding: 12,
    fontSize: 14.5,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
    height: 100,
    textAlignVertical: 'top',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(180, 106, 116, 0.1)',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 9,
    gap: 6,
  },
  tagPillText: {
    fontSize: 11.5,
    color: Colors.roseDeep,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '600',
  },
  tagPillClose: {
    padding: 2,
  },
  tagAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(63, 3, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagInputWrapper: {
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: Colors.white,
    height: 28,
    justifyContent: 'center',
  },
  tagInputInline: {
    fontSize: 11,
    fontFamily: FontFamily.sansMedium,
    color: Colors.ink,
    width: 80,
    padding: 0,
  },
});
