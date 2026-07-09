import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import LottieView from 'lottie-react-native';
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
import { Step1Details } from './Step1Details';
import { Step2Media } from './Step2Media';
import { Step3Review } from './Step3Review';
import { TactileButton } from '@/components/ui/tactile-button';
interface CreateServiceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  service?: any; // If passed, we are in Edit Mode
}

export function CreateServiceSheet(props: CreateServiceSheetProps) {
  if (!props.isOpen) return null;
  return <CreateServiceForm {...props} />;
}

function CreateServiceForm({
  isOpen,
  onClose,
  onSuccess,
  service,
}: CreateServiceSheetProps) {
  const showModal = useUIStore((s) => s.showModal);

  // React Hook Form initialization
  const { control, handleSubmit, setValue, trigger, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: service?.name || '',
      price: service?.price ? String(service.price / 100) : '',
      shortDesc: service?.description || '',
      category: service?.subCategory || service?.category || 'UGC / Product Review',
      confirmed: false,
    }
  });

  // Step tracker
  const [step, setStep] = useState(1);

  // Form Fields not managed by hook form rules
  const [deliveryTime, setDeliveryTime] = useState(service?.deliveryTime || '5 Days');
  const [tags, setTags] = useState<string[]>(() => {
    if (service?.tags) {
      if (Array.isArray(service.tags)) return service.tags;
      try {
        return JSON.parse(service.tags);
      } catch {
        return String(service.tags).split(',').map((t: string) => t.trim());
      }
    }
    return ['Brand Reel', 'UGC Creator', 'Product Review'];
  });
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // Step 2 Fields
  const [videoFile, setVideoFile] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState(service?.videoUrl || service?.exampleUrl || '');

  const [videoError, setVideoError] = useState('');
  useEffect(() => {
    if (videoUrl) {
      setVideoError('');
    }
  }, [videoUrl]);

  const [thumbnailFile, setThumbnailFile] = useState<any>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(service?.thumbnailUrl || '');
  const [selectedFrameIdx, setSelectedFrameIdx] = useState(service?.selectedFrameIdx || 0);
  const [localExtractedFrames, setLocalExtractedFrames] = useState<any[]>([]);
  const [extractingFrames, setExtractingFrames] = useState(false);
  const [videoDuration, setVideoDuration] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>(() => {
    if (service?.deliverables) {
      if (Array.isArray(service.deliverables)) return service.deliverables;
      try {
        return JSON.parse(service.deliverables);
      } catch {
        return String(service.deliverables).split(',').map((t: string) => t.trim());
      }
    }
    return [
      'High quality video',
      'Script & Concept',
      'Royalty free music',
      'Up to 2 revisions',
    ];
  });
  const [delivInput, setDelivInput] = useState('');
  const [showDelivInput, setShowDelivInput] = useState(false);

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

  const handleNextStep = async () => {
    if (step === 1) {
      const isValid = await trigger(['name', 'price', 'shortDesc', 'category']);
      
      if (!isValid || !videoUrl) {
        try {
          const { playSound } = require('@/lib/sound');
          playSound('error');
        } catch (e) {}
      }

      if (!isValid) {
        if (!videoUrl) {
          setVideoError('Please upload a service video to continue.');
        }
        return;
      }

      if (!videoUrl) {
        setVideoError('Please upload a service video to continue.');
        return;
      }

      setStep(2);
    } else if (step === 2) {
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

  const submitMutation = useMutation({
    mutationFn: async (payload: FormData | Record<string, any>) => {
      if (service?.id) {
        return api.influencers.services.update(service.id, payload);
      } else {
        return api.influencers.services.create(payload);
      }
    },
    onSuccess: () => {
      setStep(4); // Advance to success step!
    },
    onError: (err: any) => {
      console.error('Failed to submit service:', err);
      showModal({
        title: 'Operation Failed',
        message: err?.message || 'An error occurred. Please try again.',
      });
    }
  });

  const onSubmit = async (data: any) => {
    if (step !== 3) return;

    const formattedPrice = Number(data.price.trim()).toFixed(2);

    // On native, React Native's FormData polyfill has issues with string-only
    // multipart bodies. Use FormData ONLY when there are actual local file URIs
    // to upload; otherwise send a plain JSON body.
    const hasLocalVideo = !!videoFile && Platform.OS !== 'web';
    const hasLocalThumbnail = !!thumbnailFile && Platform.OS !== 'web';
    const needsMultipart = Platform.OS === 'web' || hasLocalVideo || hasLocalThumbnail;

    if (!needsMultipart) {
      // ── JSON path (native, no files picked) ────────────────────────────────
      const frames = getFrames();
      const frame = frames[selectedFrameIdx >= 0 ? selectedFrameIdx : 0];
      const thumbUrl = thumbnailUrl && isRemoteUrl(thumbnailUrl)
        ? thumbnailUrl
        : isRemoteUrl(frame) ? (frame as string) : '';

      const jsonPayload: Record<string, any> = {
        name: data.name.trim(),
        type: 'service',
        price: formattedPrice,
        deliveryTime,
        category: data.category,
        subCategory: data.category,
        description: data.shortDesc.trim(),
        tags,
        deliverables,
        selectedFrameIdx,
        ...(videoUrl ? { exampleUrl: videoUrl } : {}),
        ...(thumbUrl ? { thumbnailUrl: thumbUrl } : {}),
      };
      submitMutation.mutate(jsonPayload as any);
      return;
    }

    // ── FormData path (web or native with local files) ──────────────────────
    const payload = new FormData();
    payload.append('name', data.name.trim());
    payload.append('type', 'service');
    payload.append('price', formattedPrice);
    payload.append('deliveryTime', deliveryTime);
    payload.append('category', data.category);
    payload.append('subCategory', data.category);
    payload.append('description', data.shortDesc.trim());
    payload.append('tags', JSON.stringify(tags));
    payload.append('deliverables', JSON.stringify(deliverables));
    payload.append('selectedFrameIdx', String(selectedFrameIdx));

    // Append Video
    if (videoFile) {
      if (Platform.OS === 'web') {
        payload.append('video', videoFile);
      } else {
        payload.append('video', { uri: videoFile.uri, name: videoFile.name || 'video.mp4', type: videoFile.type || 'video/mp4' } as any);
      }
    } else if (videoUrl) {
      payload.append('exampleUrl', videoUrl);
    }

    // Append Thumbnail
    if (thumbnailFile) {
      if (Platform.OS === 'web') {
        payload.append('thumbnail', thumbnailFile);
      } else {
        payload.append('thumbnail', { uri: thumbnailFile.uri, name: thumbnailFile.name || 'image.jpg', type: thumbnailFile.type || 'image/jpeg' } as any);
      }
    } else if (thumbnailUrl && isRemoteUrl(thumbnailUrl)) {
      payload.append('thumbnailUrl', thumbnailUrl);
    } else {
      const frames = getFrames();
      const frame = frames[selectedFrameIdx >= 0 ? selectedFrameIdx : 0];
      if (isRemoteUrl(frame)) {
        payload.append('thumbnailUrl', frame as string);
      } else {
        payload.append('thumbnailUrl', '');
      }
    }

    submitMutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
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
        {step < 4 && (
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
        )}

        {/* Stepper Progress bar */}
        {step < 4 && (
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
        )}

        {/* Main Form Body Scrollable */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {step === 4 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
              <LottieView
                source={require('@/assets/lottie-animation/success.json')}
                autoPlay
                loop={false}
                style={{ width: 180, height: 180 }}
              />
              <Text style={{ fontFamily: FontFamily.sans, fontSize: 22, fontWeight: '800', color: Colors.ink, textAlign: 'center' }}>
                {service ? 'Service Saved! 🎉' : 'Service Published! 🚀'}
              </Text>
              <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 14, color: 'rgba(63, 3, 11, 0.5)', textAlign: 'center', lineHeight: 20 }}>
                {service
                  ? `"${watch('name')}" has been successfully updated.`
                  : `"${watch('name')}" is now live and visible to brands.`
                }
              </Text>
              <TactileButton
                text="Done"
                onPress={() => {
                  onSuccess(null);
                  onClose();
                }}
                variant="primary"
                fullWidth
                style={{ marginTop: 24 }}
              />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

              {/* ================= STEP 1 DETAILS ================= */}
              {step === 1 && (
                <Step1Details
                  control={control}
                  errors={errors}
                  deliveryTime={deliveryTime}
                  setDeliveryTime={setDeliveryTime}
                  videoUrl={videoUrl}
                  triggerVideoPicker={triggerVideoPicker}
                  getFrames={getFrames}
                  tags={tags}
                  removeTag={removeTag}
                  showTagInput={showTagInput}
                  setShowTagInput={setShowTagInput}
                  tagInput={tagInput}
                  setTagInput={setTagInput}
                  addTag={addTag}
                  handleNextStep={handleNextStep}
                  videoDuration={videoDuration}
                  watch={watch}
                  videoError={videoError}
                />
              )}

              {/* ================= STEP 2 MEDIA ================= */}
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

              {/* ================= STEP 3 REVIEW ================= */}
              {step === 3 && (
                <Step3Review
                  control={control}
                  errors={errors}
                  thumbnailUrl={thumbnailUrl}
                  getFrames={getFrames}
                  selectedFrameIdx={selectedFrameIdx}
                  name={watch('name')}
                  category={watch('category')}
                  price={watch('price')}
                  deliveryTime={deliveryTime}
                  shortDesc={watch('shortDesc')}
                  deliverables={deliverables}
                  tags={tags}
                  submitting={submitMutation.isPending}
                  handleBackStep={handleBackStep}
                  handleSubmit={handleSubmit(onSubmit)}
                  setStep={setStep}
                  service={service}
                  videoDuration={videoDuration}
                />
              )}

            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeRoot: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.08)',
    backgroundColor: Colors.white,
  },
  barCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTitleCenter: {
    alignItems: 'center',
    gap: 2,
  },
  barTitleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    color: Colors.ink,
    fontWeight: '700',
  },
  barSubText: {
    fontSize: 10.5,
    color: 'rgba(63, 3, 11, 0.45)',
    fontFamily: FontFamily.sansMedium,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.05)',
  },
  stepItem: {
    alignItems: 'center',
    width: 90,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(63, 3, 11, 0.15)',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    borderColor: Colors.oxblood,
    backgroundColor: Colors.oxblood,
  },
  stepCircleCompleted: {
    borderColor: Colors.green,
    backgroundColor: Colors.green,
  },
  stepNum: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.45)',
  },
  stepNumActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  stepLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 10,
    color: 'rgba(63, 3, 11, 0.45)',
    fontWeight: '700',
  },
  stepLabelActive: {
    color: Colors.oxblood,
  },
  stepSubLabel: {
    fontSize: 8,
    color: 'rgba(63, 3, 11, 0.35)',
    fontFamily: FontFamily.sansMedium,
  },
  stepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: 'rgba(63, 3, 11, 0.1)',
    marginHorizontal: -12,
    marginTop: -16,
  },
  stepLineActive: {
    backgroundColor: Colors.oxblood,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 56,
  },
});
