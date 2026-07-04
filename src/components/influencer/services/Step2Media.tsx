import React from 'react';
import {
  ActivityIndicator,
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
  deliverables: string[];
  removeDeliverable: (idx: number) => void;
  showDelivInput: boolean;
  setShowDelivInput: (val: boolean) => void;
  delivInput: string;
  setDelivInput: (val: string) => void;
  addDeliverable: () => void;
  handleBackStep: () => void;
  handleNextStep: () => void;
  videoDuration: string;
}

export function Step2Media({
  videoFile,
  videoUrl,
  thumbnailUrl,
  selectedFrameIdx,
  setSelectedFrameIdx,
  setThumbnailFile,
  setThumbnailUrl,
  extractingFrames,
  getFrames,
  triggerVideoPicker,
  triggerThumbnailPicker,
  deliverables,
  removeDeliverable,
  showDelivInput,
  setShowDelivInput,
  delivInput,
  setDelivInput,
  addDeliverable,
  handleBackStep,
  handleNextStep,
  videoDuration,
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
                getFrames()[0]
                  ? (typeof getFrames()[0] === 'string'
                    ? { uri: getFrames()[0] as string }
                    : getFrames()[0])
                  : null
              }
              style={styles.mediaThumbImage}
              contentFit="cover"
            />
            <View style={styles.mediaThumbOverlay} />
            <View style={styles.mediaThumbPlayCircle}>
              <Icon name="play" size={16} color={Colors.white} />
            </View>
            {videoDuration ? <Text style={styles.mediaThumbDuration}>{videoDuration}</Text> : null}
          </View>
          <View style={styles.mediaDetailsRight}>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <Icon name="play" size={18} color={Colors.roseDeep} />
              <Text numberOfLines={1} style={styles.mediaFilename}>
                {videoFile ? videoFile.name : (videoUrl ? 'Attached Preview Video' : '')}
              </Text>
            </View>
            {videoFile && (
              <Text style={styles.mediaFilesize}>
                {`${(videoFile.size / (1024 * 1024)).toFixed(1)} MB`}
              </Text>
            )}
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
  sectionFormLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  sectionFormSub: {
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.45)',
    fontFamily: FontFamily.sansMedium,
    marginBottom: 4,
  },
  mediaDetailsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    gap: 12,
  },
  mediaDetailsLeft: {
    position: 'relative',
    width: 64,
    height: 74,
    borderRadius: 10,
    overflow: 'hidden',
  },
  mediaThumbImage: {
    width: '100%',
    height: '100%',
  },
  mediaThumbOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  mediaThumbPlayCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaThumbDuration: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 3,
    paddingVertical: 1,
    paddingHorizontal: 3,
    color: Colors.white,
    fontSize: 7.5,
    fontWeight: '700',
  },
  mediaDetailsRight: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  mediaFilename: {
    fontSize: 13,
    fontFamily: FontFamily.sansMedium,
    color: Colors.ink,
    fontWeight: '700',
    flex: 1,
  },
  mediaFilesize: {
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.4)',
    fontFamily: FontFamily.sansMedium,
  },
  replaceVideoTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  replaceVideoTextBtnLabel: {
    fontSize: 11,
    fontFamily: FontFamily.sans,
    color: Colors.roseDeep,
    fontWeight: '700',
  },
  framesScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  frameCard: {
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  skeletonFrameCard: {
    backgroundColor: 'rgba(63, 3, 11, 0.04)',
    borderColor: 'rgba(63, 3, 11, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameCardActive: {
    borderColor: Colors.oxblood,
  },
  frameImage: {
    width: '100%',
    height: '100%',
  },
  frameChecked: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedFrameUpload: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(63, 3, 11, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  frameUploadText: {
    fontSize: 7.5,
    fontFamily: FontFamily.sans,
    fontWeight: '700',
    color: Colors.roseDeep,
  },
  deliverablesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  delivPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 122, 90, 0.08)',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 9,
    gap: 6,
  },
  delivPillText: {
    fontSize: 11.5,
    color: Colors.green,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '600',
  },
  delivPillClose: {
    padding: 2,
  },
  delivAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(63, 3, 11, 0.3)',
    paddingHorizontal: 10,
    gap: 4,
  },
  delivAddText: {
    fontSize: 11,
    fontFamily: FontFamily.sansMedium,
    color: Colors.oxblood,
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
  wizardFooterRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
});
