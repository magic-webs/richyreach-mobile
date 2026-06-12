import React from 'react';
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/icon';
import { Colors } from '@/constants/brand';
import {
  CATEGORIES,
  DELIVERY_TIMES,
  SUB_CATEGORIES,
  styles,
} from '../CreateServiceSheet';

import { TactileButton } from '@/components/ui/tactile-button';

interface Step1DetailsProps {
  name: string;
  setName: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  subCategory: string;
  setSubCategory: (val: string) => void;
  price: string;
  setPrice: (val: string) => void;
  deliveryTime: string;
  setDeliveryTime: (val: string) => void;
  videoUrl: string;
  triggerVideoPicker: () => void;
  getFrames: () => any[];
  shortDesc: string;
  setShortDesc: (val: string) => void;
  setDetailedDesc: (val: string) => void;
  tags: string[];
  removeTag: (idx: number) => void;
  showTagInput: boolean;
  setShowTagInput: (val: boolean) => void;
  tagInput: string;
  setTagInput: (val: string) => void;
  addTag: () => void;
  handleNextStep: () => void;
}

export function Step1Details({
  name,
  setName,
  category,
  setCategory,
  subCategory,
  setSubCategory,
  price,
  setPrice,
  deliveryTime,
  setDeliveryTime,
  videoUrl,
  triggerVideoPicker,
  getFrames,
  shortDesc,
  setShortDesc,
  setDetailedDesc,
  tags,
  removeTag,
  showTagInput,
  setShowTagInput,
  tagInput,
  setTagInput,
  addTag,
  handleNextStep,
}: Step1DetailsProps) {
  return (
    <View style={styles.stepWrapper}>
      {/* Basic Info Card */}
      <View style={styles.formCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconBox}><Icon name="briefcase" size={16} color={Colors.white} /></View>
          <View>
            <Text style={styles.cardTitle}>Basic information</Text>
            <Text style={styles.cardSub}>Tell brands about your service</Text>
          </View>
        </View>

        <View style={styles.inputsStack}>
          {/* Service Title */}
          <View style={styles.inputWrap}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Service Title <Text style={{ color: '#FF3B30' }}>*</Text></Text>
              <Text style={styles.counterText}>{name.length}/60</Text>
            </View>
            <TextInput
              maxLength={60}
              style={styles.textInput}
              placeholder="Make Dedicated Brand Reel"
              placeholderTextColor="rgba(63, 3, 11, 0.35)"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Category & Sub Category Row */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Category <Text style={{ color: '#FF3B30' }}>*</Text></Text>
              <View style={styles.dropdownPicker}>
                <Icon name={category.toLowerCase() === 'youtube' ? 'play' : category.toLowerCase() === 'tiktok' ? 'music' : 'camera'} size={14} color={Colors.roseDeep} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat.value}
                        onPress={() => setCategory(cat.value)}
                        style={[styles.pickerItem, category === cat.value && styles.pickerItemActive]}
                      >
                        <Text style={[styles.pickerItemText, category === cat.value && styles.pickerItemTextActive]}>{cat.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Sub Category <Text style={{ color: '#FF3B30' }}>*</Text></Text>
              <View style={styles.dropdownPicker}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {SUB_CATEGORIES.map((sc) => (
                      <TouchableOpacity
                        key={sc}
                        onPress={() => setSubCategory(sc)}
                        style={[styles.pickerItem, subCategory === sc && styles.pickerItemActive]}
                      >
                        <Text style={[styles.pickerItemText, subCategory === sc && styles.pickerItemTextActive]}>{sc}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Price & Delivery Time */}
          <View style={styles.rowFields}>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Price (₹) <Text style={{ color: '#FF3B30' }}>*</Text></Text>
              <TextInput
                keyboardType="numeric"
                style={styles.textInput}
                placeholder="1500"
                placeholderTextColor="rgba(63, 3, 11, 0.35)"
                value={price}
                onChangeText={setPrice}
              />
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
            <Text style={styles.cardTitle}>Sample Video Preview</Text>
            <Text style={styles.cardSub}>Upload a video so brands know what to expect</Text>
          </View>
          <View style={styles.optionalBadge}><Text style={styles.optionalBadgeText}>Optional</Text></View>
        </View>

        {/* Video Selector body */}
        {videoUrl ? (
          <View style={styles.videoSelectedContainer}>
            <View style={styles.videoPreviewMedia}>
              <Image 
                source={typeof getFrames()[0] === 'string' ? { uri: getFrames()[0] as string } : getFrames()[0]} 
                style={styles.videoPreviewImage} 
                contentFit="cover" 
              />
              <View style={styles.videoPreviewOverlay} />
              <View style={styles.videoPreviewPlayCircle}>
                <Icon name="play" size={20} color={Colors.white} />
              </View>
              <Text style={styles.videoDurationLabel}>00:34</Text>
              <TouchableOpacity onPress={triggerVideoPicker} style={styles.replaceVideoBtn}>
                <Icon name="swap" size={12} color={Colors.oxblood} />
                <Text style={styles.replaceVideoText}>Replace</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.videoFootnote}>Max 100MB • MP4, MOV • 9:16 recommended</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={triggerVideoPicker} style={styles.dashedUploadBox} activeOpacity={0.75}>
            <Icon name="plus" size={24} color="rgba(63, 3, 11, 0.3)" />
            <Text style={styles.uploadBoxTitle}>Select Video File</Text>
            <Text style={styles.uploadBoxSub}>Max 100MB • MP4, MOV • 9:16 recommended</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Short Description */}
      <View style={styles.formCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconBox}><Icon name="edit" size={15} color={Colors.white} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Short Description</Text>
            <Text style={styles.cardSub}>What brands will get</Text>
          </View>
          <Text style={styles.counterText}>{shortDesc.length}/1000</Text>
        </View>

        <TextInput
          multiline
          maxLength={1000}
          numberOfLines={4}
          style={styles.textAreaInput}
          placeholder="I will create high-quality, engaging brand reel that showcases your product in the best way possible."
          placeholderTextColor="rgba(63, 3, 11, 0.35)"
          value={shortDesc}
          onChangeText={(val) => {
            setShortDesc(val);
            setDetailedDesc(val); // Sync
          }}
        />
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
