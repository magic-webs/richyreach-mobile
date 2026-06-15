import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/icon';
import { Colors } from '@/constants/brand';
import { styles } from '../CreateServiceSheet.styles';
import { TactileButton } from '@/components/ui/tactile-button';

interface Step2MediaProps {
  videoFile: any;
  videoUrl: string;
  thumbnailUrl: string;
  selectedFrameIdx: number;
  setSelectedFrameIdx: (val: number) => void;
  setThumbnailFile: (val: any) => void;
  setThumbnailUrl: (val: string) => void;
  extractingFrames: boolean;
  getFrames: () => any[];
  triggerVideoPicker: () => void;
  triggerThumbnailPicker: () => void;
  detailedDesc: string;
  setDetailedDesc: (val: string | ((prev: string) => string)) => void;
  handleSuggestedPoints: () => void;
  deliverables: string[];
  removeDeliverable: (idx: number) => void;
  showDelivInput: boolean;
  setShowDelivInput: (val: boolean) => void;
  delivInput: string;
  setDelivInput: (val: string) => void;
  addDeliverable: () => void;
  handleBackStep: () => void;
  handleNextStep: () => void;
}

export function Step2Media({
  videoFile,
  thumbnailUrl,
  selectedFrameIdx,
  setSelectedFrameIdx,
  setThumbnailFile,
  setThumbnailUrl,
  extractingFrames,
  getFrames,
  triggerVideoPicker,
  triggerThumbnailPicker,
  detailedDesc,
  setDetailedDesc,
  handleSuggestedPoints,
  deliverables,
  removeDeliverable,
  showDelivInput,
  setShowDelivInput,
  delivInput,
  setDelivInput,
  addDeliverable,
  handleBackStep,
  handleNextStep,
}: Step2MediaProps) {
  return (
    <View style={styles.stepWrapper}>
      {/* Upload Preview Video details */}
      <View style={styles.formCard}>
        <Text style={styles.sectionFormLabel}>
          Upload Preview Video <Text style={{ color: '#FF3B30' }}>*</Text>
        </Text>
        <Text style={styles.sectionFormSub}>Upload a sample of your work. Max size 200MB</Text>

        <View style={styles.mediaDetailsRow}>
          <View style={styles.mediaDetailsLeft}>
            <Image
              source={
                typeof getFrames()[0] === 'string'
                  ? { uri: getFrames()[0] as string }
                  : getFrames()[0]
              }
              style={styles.mediaThumbImage}
              contentFit="cover"
            />
            <View style={styles.mediaThumbOverlay} />
            <View style={styles.mediaThumbPlayCircle}>
              <Icon name="play" size={16} color={Colors.white} />
            </View>
            <Text style={styles.mediaThumbDuration}>00:34</Text>
          </View>
          <View style={styles.mediaDetailsRight}>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <Icon name="play" size={18} color={Colors.roseDeep} />
              <Text numberOfLines={1} style={styles.mediaFilename}>
                {videoFile ? videoFile.name : 'brand_reel_sample.mp4'}
              </Text>
            </View>
            <Text style={styles.mediaFilesize}>
              {videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB` : '82.4 MB'}
            </Text>
            <TouchableOpacity onPress={triggerVideoPicker} style={styles.replaceVideoTextBtn}>
              <Icon name="edit" size={12} color={Colors.roseDeep} />
              <Text style={styles.replaceVideoTextBtnLabel}>Replace Video</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Cover Thumbnail */}
      <View style={styles.formCard}>
        <Text style={styles.sectionFormLabel}>
          Cover Thumbnail <Text style={{ color: '#FF3B30' }}>*</Text>
        </Text>
        <Text style={styles.sectionFormSub}>Choose a thumbnail that represents your service</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.framesScroll}
        >
          {extractingFrames ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={[styles.frameCard, styles.skeletonFrameCard]}>
                  <ActivityIndicator size="small" color={Colors.roseDeep} />
                </View>
              ))}
            </View>
          ) : (
            <>
              {getFrames().map((url, idx) => {
                const frameSource = typeof url === 'string' ? { uri: url } : url;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setSelectedFrameIdx(idx);
                      setThumbnailFile(null);
                      setThumbnailUrl(''); // reset custom
                    }}
                    style={[
                      styles.frameCard,
                      selectedFrameIdx === idx && !thumbnailUrl && styles.frameCardActive,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Image source={frameSource} style={styles.frameImage} contentFit="cover" />
                    {selectedFrameIdx === idx && !thumbnailUrl && (
                      <View style={styles.frameChecked}>
                        <Icon name="check" size={11} color={Colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {/* Custom Thumbnail display if uploaded */}
          {thumbnailUrl && (
            <TouchableOpacity
              onPress={() => setSelectedFrameIdx(-1)}
              style={[styles.frameCard, styles.frameCardActive]}
            >
              <Image source={{ uri: thumbnailUrl }} style={styles.frameImage} contentFit="cover" />
              <View style={styles.frameChecked}>
                <Icon name="check" size={11} color={Colors.white} />
              </View>
            </TouchableOpacity>
          )}

          {/* Upload Custom Thumbnail Button */}
          <TouchableOpacity
            onPress={triggerThumbnailPicker}
            style={styles.dashedFrameUpload}
            activeOpacity={0.8}
          >
            <Icon name="plus" size={16} color={Colors.roseDeep} />
            <Text style={styles.frameUploadText}>Custom Cover</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Service Description Card */}
      <View style={styles.formCard}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <Text style={styles.sectionFormLabel}>
            Service Description <Text style={{ color: '#FF3B30' }}>*</Text>
          </Text>
          <TouchableOpacity
            onPress={handleSuggestedPoints}
            style={styles.suggestedPointsBtn}
            activeOpacity={0.7}
          >
            <Icon name="sparkle" size={12} color={Colors.roseDeep} />
            <Text style={styles.suggestedText}>Suggested points</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionFormSub}>Explain what brands will get from this service</Text>

        <TextInput
          multiline
          maxLength={1000}
          numberOfLines={8}
          style={[styles.textAreaInput, { height: 160 }]}
          placeholder="Describe your service in detail..."
          placeholderTextColor="rgba(63, 3, 11, 0.35)"
          value={detailedDesc}
          onChangeText={setDetailedDesc}
        />
        <Text style={[styles.counterText, { alignSelf: 'flex-end', marginTop: 4 }]}>
          {detailedDesc.length}/1000
        </Text>
      </View>

      {/* What's Included */}
      <View style={styles.formCard}>
        <Text style={styles.sectionFormLabel}>What's Included</Text>
        <Text style={styles.sectionFormSub}>Add key deliverables for brands</Text>

        <View style={styles.deliverablesContainer}>
          {deliverables.map((deliv, idx) => (
            <View key={idx} style={styles.delivPill}>
              <Icon name="check" size={10} color={Colors.green} />
              <Text style={styles.delivPillText}>{deliv}</Text>
              <TouchableOpacity
                onPress={() => removeDeliverable(idx)}
                style={styles.delivPillClose}
              >
                <Icon name="x" size={10} color={Colors.roseDeep} />
              </TouchableOpacity>
            </View>
          ))}

          {showDelivInput ? (
            <View style={styles.tagInputWrapper}>
              <TextInput
                autoFocus
                style={styles.tagInputInline}
                value={delivInput}
                onChangeText={setDelivInput}
                onSubmitEditing={addDeliverable}
                onBlur={addDeliverable}
                placeholder="Add deliverable"
              />
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setShowDelivInput(true)}
              style={styles.delivAddBtn}
            >
              <Icon name="plus" size={12} color={Colors.oxblood} />
              <Text style={styles.delivAddText}>Add another</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Actions bottom */}
      <View style={styles.wizardFooterRow}>
        <TactileButton
          text="Back"
          onPress={handleBackStep}
          variant="white"
          icon="back"
          iconPosition="left"
          style={{ flex: 1 }}
          fullWidth
        />
        <TactileButton
          text="Continue"
          onPress={handleNextStep}
          variant="primary"
          icon="arrow"
          iconPosition="right"
          style={{ flex: 2 }}
          fullWidth
        />
      </View>
    </View>
  );
}
