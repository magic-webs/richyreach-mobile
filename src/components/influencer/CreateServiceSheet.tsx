import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Step1Details } from './wizard/Step1Details';
import { Step2Media } from './wizard/Step2Media';
import { Step3Review } from './wizard/Step3Review';
import { styles } from './CreateServiceSheet.styles';

interface CreateServiceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  service?: any; // If passed, we are in Edit Mode
}

// Preset categories and subcategories matching the platform
export const CATEGORIES = [
  { label: 'Instagram', value: 'Instagram', icon: 'camera' }
];

export const SUB_CATEGORIES = [
  'UGC / Product Review',
  'Unboxing',
  'Dedicated Brand Reel',
  'Sponsored Post',
  'Tutorial / Walkthrough',
];

export const DELIVERY_TIMES = [
  '1 Day',
  '3 Days',
  '5 Days',
  '7 Days',
  '10 Days',
  '14 Days',
];



export function CreateServiceSheet({
  isOpen,
  onClose,
  onSuccess,
  service,
}: CreateServiceSheetProps) {
  const showModal = useUIStore((s) => s.showModal);

  // Step tracker
  const [step, setStep] = useState(1);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Instagram');
  const [subCategory, setSubCategory] = useState('UGC / Product Review');
  const [price, setPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('5 Days');
  const [shortDesc, setShortDesc] = useState('');
  const [tags, setTags] = useState<string[]>(['Brand Reel', 'UGC Creator', 'Product Review']);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // Step 2 Fields
  const [detailedDesc, setDetailedDesc] = useState('');
  const [videoFile, setVideoFile] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<any>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [selectedFrameIdx, setSelectedFrameIdx] = useState(0);
  const [localExtractedFrames, setLocalExtractedFrames] = useState<any[]>([]);
  const [extractingFrames, setExtractingFrames] = useState(false);
  const [videoDuration, setVideoDuration] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>([
    'High quality video',
    'Script & Concept',
    'Royalty free music',
    'Up to 2 revisions',
  ]);
  const [delivInput, setDelivInput] = useState('');
  const [showDelivInput, setShowDelivInput] = useState(false);

  // Step 3 Fields
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Web file input references
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const getFrames = () => {
    if (localExtractedFrames.length === 4) {
      return localExtractedFrames;
    }
    if (videoUrl && videoUrl.includes('cloudinary.com')) {
      const baseUrl = videoUrl.split('?')[0];
      const extIdx = baseUrl.lastIndexOf('.');
      if (extIdx !== -1) {
        const base = baseUrl.substring(0, extIdx);
        const cleanBase = base.replace('/video/upload/', '/video/upload/f_jpg,so_');
        return [
          cleanBase + '5p.jpg',
          cleanBase + '25p.jpg',
          cleanBase + '50p.jpg',
          cleanBase + '75p.jpg',
        ];
      }
    }
    return [];
  };

  // Detect Edit Mode & Pre-populate
  useEffect(() => {
    if (isOpen) {
      if (service) {
        setName(service.name || '');
        setCategory(service.category || 'Instagram');
        setSubCategory(service.subCategory || 'UGC / Product Review');
        setPrice(service.price ? String(service.price / 100) : '');
        setDeliveryTime(service.deliveryTime || '5 Days');
        setShortDesc(service.description || '');
        setDetailedDesc(service.description || '');
        setVideoUrl(service.videoUrl || service.exampleUrl || '');
        setThumbnailUrl(service.thumbnailUrl || '');
        setVideoDuration('');

        // Parse tags if stored
        if (service.tags) {
          try {
            setTags(JSON.parse(service.tags));
          } catch {
            setTags(service.tags.split(',').map((t: string) => t.trim()));
          }
        }
        // Parse deliverables
        if (service.deliverables) {
          try {
            setDeliverables(JSON.parse(service.deliverables));
          } catch {
            setDeliverables(service.deliverables.split(',').map((t: string) => t.trim()));
          }
        }
      } else {
        // Reset to default
        setName('');
        setCategory('Instagram');
        setSubCategory('UGC / Product Review');
        setPrice('');
        setDeliveryTime('5 Days');
        setShortDesc('');
        setDetailedDesc('');
        setTags(['Brand Reel', 'UGC Creator', 'Product Review']);
        setDeliverables([
          'High quality video',
          'Script & Concept',
          'Royalty free music',
          'Up to 2 revisions',
        ]);
        setVideoFile(null);
        setVideoUrl('');
        setThumbnailFile(null);
        setThumbnailUrl('');
        setSelectedFrameIdx(0);
        setLocalExtractedFrames([]);
        setExtractingFrames(false);
        setConfirmed(false);
        setVideoDuration('');
      }
      setStep(1);
    }
  }, [isOpen, service]);

  // Helper to determine if a URL is a remote web asset (excludes base64 data URIs and blob URIs)
  const isRemoteUrl = (url: any) => {
    return typeof url === 'string' && url.startsWith('http') && !url.startsWith('blob:');
  };

  // Extract live video frames when videoUrl changes (supporting web and native)
  useEffect(() => {
    let active = true;

    const extractFrames = async () => {
      if (!videoUrl) {
        setLocalExtractedFrames([]);
        setVideoDuration('');
        return;
      }

      // If it's a Cloudinary url, we don't need to extract locally (handled by getFrames fallback)
      if (videoUrl.includes('cloudinary.com')) {
        setLocalExtractedFrames([]);
        return;
      }

      setExtractingFrames(true);

      if (Platform.OS === 'web') {
        try {
          const video = document.createElement('video');
          video.src = videoUrl;
          video.crossOrigin = 'anonymous';
          video.muted = true;
          video.playsInline = true;

          video.addEventListener('loadedmetadata', async () => {
            if (!active) return;
            try {
              const duration = video.duration;
              if (!duration || isNaN(duration)) {
                setExtractingFrames(false);
                return;
              }

              // Extract duration
              const mins = Math.floor(duration / 60);
              const secs = Math.floor(duration % 60);
              setVideoDuration(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);

              const times = [duration * 0.05, duration * 0.25, duration * 0.5, duration * 0.75];
              const frames: string[] = [];

              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');

              for (const t of times) {
                if (!active) break;
                await new Promise<void>((seekResolve) => {
                  const onSeeked = () => {
                    video.removeEventListener('seeked', onSeeked);
                    if (ctx) {
                      canvas.width = video.videoWidth || 320;
                      canvas.height = video.videoHeight || 180;
                      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                      try {
                        frames.push(canvas.toDataURL('image/jpeg', 0.7));
                      } catch (e) {
                        console.error('Canvas export error:', e);
                      }
                    }
                    seekResolve();
                  };
                  video.addEventListener('seeked', onSeeked);
                  video.currentTime = t;
                });
              }

              if (active && frames.length === 4) {
                setLocalExtractedFrames(frames);
              }
            } catch (err) {
              console.error('Web frame extraction inner error:', err);
            } finally {
              setExtractingFrames(false);
            }
          });

          video.addEventListener('error', (e) => {
            console.error('Web video load error:', e);
            setExtractingFrames(false);
          });
        } catch (err) {
          console.error('Web frame extraction error:', err);
          setExtractingFrames(false);
        }
      } else {
        // Native Platforms (iOS/Android) using expo-video
        let player: any = null;
        try {
          const { createVideoPlayer } = require('expo-video');
          player = createVideoPlayer(videoUrl);

          // Poll for duration/readiness
          const start = Date.now();
          const waitForReady = () => new Promise<void>((resolveReady) => {
            const check = () => {
              if (!active) {
                resolveReady();
                return;
              }
              if (player.status === 'readyToPlay' || player.duration > 0) {
                resolveReady();
              } else if (Date.now() - start > 4000) {
                resolveReady(); // Timeout after 4s
              } else {
                setTimeout(check, 100);
              }
            };
            check();
          });

          await waitForReady();

          if (!active) {
            player.release();
            return;
          }

          const durationSec = player.duration || 0;
          if (durationSec > 0) {
            const mins = Math.floor(durationSec / 60);
            const secs = Math.floor(durationSec % 60);
            setVideoDuration(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
          }

          const durationMs = durationSec * 1000;
          const times = [durationMs * 0.05, durationMs * 0.25, durationMs * 0.50, durationMs * 0.75];

          const thumbnails = await player.generateThumbnailsAsync(times, {
            maxWidth: 200,
            maxHeight: 200,
          });

          if (active && thumbnails && thumbnails.length > 0) {
            // Check if we got enough frames, pad with first frame or keep what we got
            const frames = [...thumbnails];
            while (frames.length < 4 && frames.length > 0) {
              frames.push(frames[frames.length - 1]);
            }
            if (frames.length === 4) {
              setLocalExtractedFrames(frames);
            }
          }
        } catch (err) {
          console.error('Native frame extraction error:', err);
        } finally {
          if (player) {
            try {
              player.release();
            } catch (e) {
              console.error('Player release error:', e);
            }
          }
          setExtractingFrames(false);
        }
      }
    };

    setLocalExtractedFrames([]);
    setVideoDuration('');
    extractFrames();

    return () => {
      active = false;
    };
  }, [videoUrl]);

  const handleNextStep = () => {
    if (step === 1) {
      if (!name.trim()) {
        showModal({ title: 'Validation Error', message: 'Please enter a service title.' });
        return;
      }
      if (!price.trim() || isNaN(Number(price.trim())) || Number(price.trim()) <= 0) {
        showModal({ title: 'Validation Error', message: 'Please enter a valid price.' });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!detailedDesc.trim() && !shortDesc.trim()) {
        showModal({ title: 'Validation Error', message: 'Please write a description for this service.' });
        return;
      }
      setStep(3);
    }
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Deliverables manager
  const addDeliverable = () => {
    if (delivInput.trim()) {
      setDeliverables([...deliverables, delivInput.trim()]);
      setDelivInput('');
      setShowDelivInput(false);
    }
  };

  const removeDeliverable = (idx: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== idx));
  };

  // Tags manager
  const addTag = () => {
    if (tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      setShowTagInput(false);
    }
  };

  const removeTag = (idx: number) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  // Real file pickers for both Web and Native
  const triggerVideoPicker = async () => {
    if (Platform.OS === 'web') {
      videoInputRef.current?.click();
    } else {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['videos'],
          allowsEditing: true,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setVideoFile({
            uri: asset.uri,
            name: asset.fileName || 'video.mp4',
            type: asset.mimeType || 'video/mp4',
            size: asset.fileSize || 0,
          });
          setVideoUrl(asset.uri);
        }
      } catch (err: any) {
        console.error('Failed to pick video:', err);
        showModal({
          title: 'Picker Failed',
          message: 'Could not access the library to select a video.',
        });
      }
    }
  };

  const triggerThumbnailPicker = async () => {
    if (Platform.OS === 'web') {
      thumbInputRef.current?.click();
    } else {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setThumbnailFile({
            uri: asset.uri,
            name: asset.fileName || 'image.jpg',
            type: asset.mimeType || 'image/jpeg',
            size: asset.fileSize || 0,
          });
          setThumbnailUrl(asset.uri);
        }
      } catch (err: any) {
        console.error('Failed to pick thumbnail:', err);
        showModal({
          title: 'Picker Failed',
          message: 'Could not access the library to select an image.',
        });
      }
    }
  };

  const handleSuggestedPoints = () => {
    const points = [
      '• High-quality vertical format (9:16) ideal for Reels.',
      '• Product integrations showcasing benefits, usage, and real results.',
      '• Direct voiceover or trending background audio with text overlays.',
      '• Call to action (discount code/link) in caption and video.',
    ];
    setDetailedDesc((prev) => {
      const spacing = prev.trim() ? '\n\n' : '';
      return prev + spacing + points.join('\n');
    });
  };

  const submitMutation = useMutation({
    mutationFn: async (payload: FormData) => {
      if (service?.id) {
        return api.influencers.services.update(service.id, payload);
      } else {
        return api.influencers.services.create(payload);
      }
    },
    onSuccess: () => {
      if (service?.id) {
        showModal({
          title: 'Service Updated! 🎉',
          message: `"${name}" has been successfully updated.`,
        });
      } else {
        showModal({
          title: 'Service Published! 🚀',
          message: `"${name}" is now live and visible to brands.`,
        });
      }
      onSuccess(null);
      onClose();
    },
    onError: (err: any) => {
      console.error('Failed to submit service:', err);
      showModal({
        title: 'Operation Failed',
        message: err?.message || 'An error occurred. Please try again.',
      });
    },
    onSettled: () => {
      setSubmitting(false);
    }
  });

  const handleSubmit = async () => {
    if (step !== 3) return;

    if (!confirmed) {
      showModal({
        title: 'Confirmation Required',
        message: 'Please check the confirmation box before publishing.',
      });
      return;
    }

    setSubmitting(true);
    const formattedPrice = Number(price.trim()).toFixed(2);
    const payload = new FormData();
    payload.append('name', name.trim());
    payload.append('type', 'service');
    payload.append('price', formattedPrice);
    payload.append('deliveryTime', deliveryTime);
    payload.append('category', category);
    payload.append('subCategory', subCategory);
    payload.append('description', detailedDesc.trim() || shortDesc.trim());
    payload.append('tags', JSON.stringify(tags));
    payload.append('deliverables', JSON.stringify(deliverables));
    payload.append('selectedFrameIdx', String(selectedFrameIdx));

    // Append Video
    if (videoFile) {
      payload.append('video', videoFile);
    } else if (videoUrl) {
      payload.append('exampleUrl', videoUrl);
    }

    // Append Thumbnail
    if (thumbnailFile) {
      payload.append('thumbnail', thumbnailFile);
    } else if (thumbnailUrl && isRemoteUrl(thumbnailUrl)) {
      payload.append('thumbnailUrl', thumbnailUrl);
    } else {
      // Fallback to selected frame index
      const frames = getFrames();
      const frame = frames[selectedFrameIdx >= 0 ? selectedFrameIdx : 0];
      if (isRemoteUrl(frame)) {
        payload.append('thumbnailUrl', frame as string);
      } else {
        // Local/base64/native frame, let the backend generate the transformed thumbnail from the video using selectedFrameIdx
        payload.append('thumbnailUrl', '');
      }
    }

    submitMutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="fade" presentationStyle="fullScreen">
      <SafeAreaView style={styles.safeRoot}>
        {/* Web Hidden File Inputs */}
        {Platform.OS === 'web' && (
          <>
            <input
              type="file"
              accept="video/*"
              ref={videoInputRef}
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setVideoFile(file);
                  setVideoUrl(URL.createObjectURL(file));
                }
              }}
            />
            <input
              type="file"
              accept="image/*"
              ref={thumbInputRef}
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setThumbnailFile(file);
                  setThumbnailUrl(URL.createObjectURL(file));
                }
              }}
            />
          </>
        )}

        {/* Wizard Top Bar Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBackStep} disabled={step === 1} style={[styles.barCircleBtn, step === 1 && { opacity: 0.3 }]}>
            <Icon name="back" size={18} color={Colors.oxblood} />
          </TouchableOpacity>
          <View style={styles.barTitleCenter}>
            <Text style={styles.barTitleText}>{service ? 'Edit Service' : 'Add new service'}</Text>
            <Text style={styles.barSubText}>
              {step === 1 && 'Create a service brands will love'}
              {step === 2 && 'Step 2 of 3: Media & Preview'}
              {step === 3 && 'Step 3 of 3: Review & Publish'}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.barCircleBtn}>
            <Icon name="x" size={18} color={Colors.oxblood} />
          </TouchableOpacity>
        </View>

        {/* Stepper Progress bar */}
        <View style={styles.stepperContainer}>
          {/* Step 1 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive, step > 1 && styles.stepCircleCompleted]}>
              {step > 1 ? <Icon name="check" size={12} color={Colors.white} /> : <Text style={[styles.stepNum, step >= 1 && styles.stepNumActive]}>1</Text>}
            </View>
            <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Details</Text>
            <Text style={styles.stepSubLabel}>Basic info</Text>
          </View>

          {/* Line 1-2 */}
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />

          {/* Step 2 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, step >= 2 && styles.stepCircleActive, step > 2 && styles.stepCircleCompleted]}>
              {step > 2 ? <Icon name="check" size={12} color={Colors.white} /> : <Text style={[styles.stepNum, step >= 2 && styles.stepNumActive]}>2</Text>}
            </View>
            <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>Media</Text>
            <Text style={styles.stepSubLabel}>Upload & preview</Text>
          </View>

          {/* Line 2-3 */}
          <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />

          {/* Step 3 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, step === 3 && styles.stepCircleActive]}>
              <Text style={[styles.stepNum, step === 3 && styles.stepNumActive]}>3</Text>
            </View>
            <Text style={[styles.stepLabel, step === 3 && styles.stepLabelActive]}>Publish</Text>
            <Text style={styles.stepSubLabel}>Review & publish</Text>
          </View>
        </View>

        {/* Main Form Body Scrollable */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {/* ================= STEP 1 DETAILS ================= */}
            {step === 1 && (
              <Step1Details
                name={name}
                setName={setName}
                category={category}
                setCategory={setCategory}
                subCategory={subCategory}
                setSubCategory={setSubCategory}
                price={price}
                setPrice={setPrice}
                deliveryTime={deliveryTime}
                setDeliveryTime={setDeliveryTime}
                videoUrl={videoUrl}
                triggerVideoPicker={triggerVideoPicker}
                getFrames={getFrames}
                shortDesc={shortDesc}
                setShortDesc={setShortDesc}
                setDetailedDesc={setDetailedDesc}
                tags={tags}
                removeTag={removeTag}
                showTagInput={showTagInput}
                setShowTagInput={setShowTagInput}
                tagInput={tagInput}
                setTagInput={setTagInput}
                addTag={addTag}
                handleNextStep={handleNextStep}
                videoDuration={videoDuration}
              />
            )}

            {step === 2 && (
              <Step2Media
                videoFile={videoFile}
                videoUrl={videoUrl}
                thumbnailUrl={thumbnailUrl}
                selectedFrameIdx={selectedFrameIdx}
                setSelectedFrameIdx={setSelectedFrameIdx}
                setThumbnailFile={setThumbnailFile}
                setThumbnailUrl={setThumbnailUrl}
                extractingFrames={extractingFrames}
                getFrames={getFrames}
                triggerVideoPicker={triggerVideoPicker}
                triggerThumbnailPicker={triggerThumbnailPicker}
                detailedDesc={detailedDesc}
                setDetailedDesc={setDetailedDesc}
                handleSuggestedPoints={handleSuggestedPoints}
                deliverables={deliverables}
                removeDeliverable={removeDeliverable}
                showDelivInput={showDelivInput}
                setShowDelivInput={setShowDelivInput}
                delivInput={delivInput}
                setDelivInput={setDelivInput}
                addDeliverable={addDeliverable}
                handleBackStep={handleBackStep}
                handleNextStep={handleNextStep}
                videoDuration={videoDuration}
              />
            )}

            {step === 3 && (
              <Step3Review
                thumbnailUrl={thumbnailUrl}
                getFrames={getFrames}
                selectedFrameIdx={selectedFrameIdx}
                name={name}
                category={category}
                subCategory={subCategory}
                price={price}
                deliveryTime={deliveryTime}
                detailedDesc={detailedDesc}
                shortDesc={shortDesc}
                deliverables={deliverables}
                tags={tags}
                confirmed={confirmed}
                setConfirmed={setConfirmed}
                submitting={submitting}
                handleBackStep={handleBackStep}
                handleSubmit={handleSubmit}
                setStep={setStep}
                service={service}
                videoDuration={videoDuration}
              />
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
