import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { Image } from 'expo-image';
import { createVideoPlayer } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface CreateServiceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  service?: any; // If passed, we are in Edit Mode
}

// Preset categories and subcategories matching the platform
const CATEGORIES = [
  { label: 'Instagram', value: 'Instagram', icon: 'camera' },
  { label: 'YouTube', value: 'YouTube', icon: 'play' },
  { label: 'TikTok', value: 'TikTok', icon: 'music' },
];

const SUB_CATEGORIES = [
  'UGC / Product Review',
  'Unboxing',
  'Dedicated Brand Reel',
  'Sponsored Post',
  'Tutorial / Walkthrough',
];

const DELIVERY_TIMES = [
  '1 Day',
  '3 Days',
  '5 Days',
  '7 Days',
  '10 Days',
  '14 Days',
];

const MOCK_FRAMES = [
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=200',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=200',
  'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=200',
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
    return MOCK_FRAMES;
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

          const duration = player.duration || 10; // Fallback to 10 seconds if metadata load timed out
          const times = [duration * 0.05, duration * 0.25, duration * 0.50, duration * 0.75];
          
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

  // Mock video picker for Native Simulator, real filepicker trigger for Web
  const triggerVideoPicker = () => {
    if (Platform.OS === 'web') {
      videoInputRef.current?.click();
    } else {
      // Mock video file select on Native Simulation
      setVideoFile({ name: 'mock_video_916.mp4', size: 18.2 * 1024 * 1024, type: 'video/mp4' });
      setVideoUrl('https://res.cloudinary.com/demo/video/upload/dog.mp4');
      showModal({
        title: 'Video Selected 🎥',
        message: 'Preselected a sample creator video for native simulation.',
      });
    }
  };

  const triggerThumbnailPicker = () => {
    if (Platform.OS === 'web') {
      thumbInputRef.current?.click();
    } else {
      setThumbnailFile({ name: 'custom_thumbnail.jpg', size: 2.1 * 1024 * 1024, type: 'image/jpeg' });
      setThumbnailUrl('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600');
      showModal({
        title: 'Thumbnail Selected 🖼️',
        message: 'Preselected a sample thumbnail image for native simulation.',
      });
    }
  };

  const handleSuggestedPoints = () => {
    const points = [
      '• High-quality vertical format (9:16) ideal for Reels and TikTok.',
      '• Product integrations showcasing benefits, usage, and real results.',
      '• Direct voiceover or trending background audio with text overlays.',
      '• Call to action (discount code/link) in caption and video.',
    ];
    setDetailedDesc((prev) => {
      const spacing = prev.trim() ? '\n\n' : '';
      return prev + spacing + points.join('\n');
    });
  };

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
    try {
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

      if (service?.id) {
        // Edit Mode -> Update
        await api.influencers.services.update(service.id, payload);
        showModal({
          title: 'Service Updated! 🎉',
          message: `"${name}" has been successfully updated.`,
        });
      } else {
        // Create Mode -> Add new
        await api.influencers.services.create(payload);
        showModal({
          title: 'Service Published! 🚀',
          message: `"${name}" is now live and visible to brands.`,
        });
      }

      onSuccess(null);
      onClose();
    } catch (err: any) {
      console.error('Failed to submit service:', err);
      showModal({
        title: 'Operation Failed',
        message: err?.message || 'An error occurred. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
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
                <TouchableOpacity onPress={handleNextStep} style={styles.continueBtn} activeOpacity={0.85}>
                  <Text style={styles.continueBtnText}>Save & Continue</Text>
                  <Icon name="arrow" size={15} color={Colors.white} />
                </TouchableOpacity>
              </View>
            )}

            {/* ================= STEP 2 MEDIA & PREVIEW ================= */}
            {step === 2 && (
              <View style={styles.stepWrapper}>

                {/* Upload Preview Video details */}
                <View style={styles.formCard}>
                  <Text style={styles.sectionFormLabel}>Upload Preview Video <Text style={{ color: '#FF3B30' }}>*</Text></Text>
                  <Text style={styles.sectionFormSub}>Upload a sample of your work. Max size 200MB</Text>

                  <View style={styles.mediaDetailsRow}>
                    <View style={styles.mediaDetailsLeft}>
                      <Image 
                        source={typeof getFrames()[0] === 'string' ? { uri: getFrames()[0] as string } : getFrames()[0]} 
                        style={styles.mediaThumbImage} 
                        contentFit="cover" 
                      />
                      <View style={styles.mediaThumbOverlay} />
                      <View style={styles.mediaThumbPlayCircle}><Icon name="play" size={16} color={Colors.white} /></View>
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
                  <Text style={styles.sectionFormLabel}>Cover Thumbnail <Text style={{ color: '#FF3B30' }}>*</Text></Text>
                  <Text style={styles.sectionFormSub}>Choose a thumbnail that represents your service</Text>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.framesScroll}>
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
                              style={[styles.frameCard, selectedFrameIdx === idx && !thumbnailUrl && styles.frameCardActive]}
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
                    <TouchableOpacity onPress={triggerThumbnailPicker} style={styles.dashedFrameUpload} activeOpacity={0.8}>
                      <Icon name="plus" size={16} color={Colors.roseDeep} />
                      <Text style={styles.frameUploadText}>Custom Cover</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>

                {/* Service Description Card */}
                <View style={styles.formCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={styles.sectionFormLabel}>Service Description <Text style={{ color: '#FF3B30' }}>*</Text></Text>
                    <TouchableOpacity onPress={handleSuggestedPoints} style={styles.suggestedPointsBtn} activeOpacity={0.7}>
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
                        <TouchableOpacity onPress={() => removeDeliverable(idx)} style={styles.delivPillClose}>
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
                      <TouchableOpacity onPress={() => setShowDelivInput(true)} style={styles.delivAddBtn}>
                        <Icon name="plus" size={12} color={Colors.oxblood} />
                        <Text style={styles.delivAddText}>Add another</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Actions bottom */}
                <View style={styles.wizardFooterRow}>
                  <TouchableOpacity onPress={handleBackStep} style={styles.wizardBackBtn} activeOpacity={0.8}>
                    <Icon name="back" size={14} color={Colors.oxblood} />
                    <Text style={styles.wizardBackText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleNextStep} style={styles.wizardContinueBtn} activeOpacity={0.85}>
                    <Text style={styles.wizardContinueText}>Continue</Text>
                    <Icon name="arrow" size={14} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ================= STEP 3 REVIEW & PUBLISH ================= */}
            {step === 3 && (
              <View style={styles.stepWrapper}>
                {/* Sparkle banner notification */}
                <View style={styles.sparkleBanner}>
                  <View style={styles.sparkleIconWrap}>
                    <Icon name="sparkle" size={16} color={Colors.roseDeep} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sparkleTitle}>Almost there!</Text>
                    <Text style={styles.sparkleMessage}>Review your service details before publishing.</Text>
                  </View>
                </View>

                {/* Two column summary details (Structured like mockup 3) */}
                <View style={styles.reviewLayout}>
                  {/* Left Column / Card details */}
                  <View style={styles.reviewMain}>

                    {/* Live Preview card */}
                    <Text style={styles.reviewSecTitle}>Service Preview</Text>
                    <View style={styles.reviewPreviewCard}>
                      <View style={styles.reviewThumbContainer}>
                        <Image 
                          source={
                            thumbnailUrl
                              ? { uri: thumbnailUrl }
                              : (typeof getFrames()[selectedFrameIdx >= 0 ? selectedFrameIdx : 0] === 'string'
                                  ? { uri: getFrames()[selectedFrameIdx >= 0 ? selectedFrameIdx : 0] as string }
                                  : getFrames()[selectedFrameIdx >= 0 ? selectedFrameIdx : 0])
                          } 
                          style={styles.reviewThumb} 
                          contentFit="cover" 
                        />
                        <View style={styles.reviewThumbOverlay} />
                        <View style={styles.reviewThumbPlay}><Icon name="play" size={20} color={Colors.white} /></View>
                        <Text style={styles.reviewThumbDur}>00:34</Text>
                      </View>
                      <View style={styles.reviewCardBody}>
                        <Text style={styles.reviewCardTitle}>{name}</Text>

                        <View style={styles.tagsRow}>
                          <View style={styles.platformBadge}>
                            <Icon name={category.toLowerCase() === 'youtube' ? 'play' : 'camera'} size={11} color={Colors.roseDeep} />
                            <Text style={styles.platformText}>{category}</Text>
                          </View>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{subCategory}</Text>
                          </View>
                        </View>

                        <View style={styles.ratingRow}>
                          <Icon name="star" size={12} color={Colors.gold} />
                          <Text style={styles.ratingText}><Text style={{ fontWeight: '700' }}>4.9</Text> (26 reviews)</Text>
                        </View>
                      </View>
                    </View>

                    {/* Service Details info */}
                    <View style={styles.reviewDataCard}>
                      <View style={styles.reviewCardHeader}>
                        <Text style={styles.reviewDataTitle}>Service Details</Text>
                        <TouchableOpacity onPress={() => setStep(1)} style={styles.editLinkBtn}>
                          <Icon name="edit" size={12} color={Colors.roseDeep} />
                          <Text style={styles.editLinkLabel}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.reviewDataGrid}>
                        <View style={styles.reviewGridRow}>
                          <Text style={styles.gridLabel}>Category</Text>
                          <Text style={styles.gridValue}>{category}</Text>
                        </View>
                        <View style={styles.reviewGridRow}>
                          <Text style={styles.gridLabel}>Sub Category</Text>
                          <Text style={styles.gridValue}>{subCategory}</Text>
                        </View>
                        <View style={styles.reviewGridRow}>
                          <Text style={styles.gridLabel}>Price</Text>
                          <Text style={styles.gridValue}>₹{Number(price).toLocaleString()}</Text>
                        </View>
                        <View style={styles.reviewGridRow}>
                          <Text style={styles.gridLabel}>Delivery Time</Text>
                          <Text style={styles.gridValue}>{deliveryTime}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Description review */}
                    <View style={styles.reviewDataCard}>
                      <View style={styles.reviewCardHeader}>
                        <Text style={styles.reviewDataTitle}>Description</Text>
                        <TouchableOpacity onPress={() => setStep(2)} style={styles.editLinkBtn}>
                          <Icon name="edit" size={12} color={Colors.roseDeep} />
                          <Text style={styles.editLinkLabel}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.reviewDescText}>{detailedDesc || shortDesc}</Text>
                    </View>

                    {/* Deliverables summary */}
                    <View style={styles.reviewDataCard}>
                      <View style={styles.reviewCardHeader}>
                        <Text style={styles.reviewDataTitle}>What's Included</Text>
                        <TouchableOpacity onPress={() => setStep(2)} style={styles.editLinkBtn}>
                          <Icon name="edit" size={12} color={Colors.roseDeep} />
                          <Text style={styles.editLinkLabel}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.deliverablesList}>
                        {deliverables.map((del, i) => (
                          <View key={i} style={styles.deliverableItem}>
                            <View style={styles.greenCheck}><Icon name="check" size={10} color={Colors.white} /></View>
                            <Text style={styles.delLabelText}>{del}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Tags review */}
                    <View style={styles.reviewDataCard}>
                      <View style={styles.reviewCardHeader}>
                        <Text style={styles.reviewDataTitle}>Tags</Text>
                        <TouchableOpacity onPress={() => setStep(1)} style={styles.editLinkBtn}>
                          <Icon name="edit" size={12} color={Colors.roseDeep} />
                          <Text style={styles.editLinkLabel}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.tagsContainer}>
                        {tags.map((tag, i) => (
                          <View key={i} style={[styles.tagPill, { paddingRight: 10 }]}>
                            <Text style={styles.tagPillText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                  </View>

                  {/* Right Column / Pricing summaries & Tips */}
                  <View style={styles.reviewAside}>
                    {/* Pricing Summary */}
                    <View style={styles.asideCard}>
                      <Text style={styles.asideTitle}>Pricing Summary</Text>
                      <View style={styles.asideDivider} />
                      <View style={styles.asideRow}>
                        <Text style={styles.asideLabel}>Package</Text>
                        <Text style={[styles.asideVal, { color: Colors.roseDeep }]}>Basic</Text>
                      </View>
                      <View style={styles.asideRow}>
                        <Text style={styles.asideLabel}>Price</Text>
                        <Text style={[styles.asideVal, { fontWeight: '700' }]}>₹{Number(price).toLocaleString()}</Text>
                      </View>
                      <View style={styles.asideRow}>
                        <Text style={styles.asideLabel}>Delivery Time</Text>
                        <Text style={styles.asideVal}>{deliveryTime}</Text>
                      </View>
                    </View>

                    {/* Service Highlights */}
                    <View style={styles.asideCard}>
                      <Text style={styles.asideTitle}>Service Highlights</Text>
                      <View style={styles.asideDivider} />
                      <View style={styles.highlightRow}>
                        <Icon name="edit" size={12} color={Colors.roseDeep} />
                        <Text style={styles.highlightText}>High quality content</Text>
                      </View>
                      <View style={styles.highlightRow}>
                        <Icon name="sparkle" size={12} color={Colors.roseDeep} />
                        <Text style={styles.highlightText}>Engaging & authentic</Text>
                      </View>
                      <View style={styles.highlightRow}>
                        <Icon name="clock" size={12} color={Colors.roseDeep} />
                        <Text style={styles.highlightText}>On-time delivery</Text>
                      </View>
                      <View style={styles.highlightRow}>
                        <Icon name="star" size={12} color={Colors.roseDeep} />
                        <Text style={styles.highlightText}>100% satisfaction</Text>
                      </View>
                    </View>

                    {/* Tips to get orders */}
                    <View style={styles.asideCard}>
                      <Text style={styles.asideTitle}>Tips to get more orders</Text>
                      <View style={styles.asideDivider} />
                      <Text style={styles.tipCheck}><Icon name="check" size={10} color={Colors.green} /> Use a catchy title</Text>
                      <Text style={styles.tipCheck}><Icon name="check" size={10} color={Colors.green} /> Upload a clear sample video</Text>
                      <Text style={styles.tipCheck}><Icon name="check" size={10} color={Colors.green} /> Describe the benefits clearly</Text>
                      <Text style={styles.tipCheck}><Icon name="check" size={10} color={Colors.green} /> Set realistic delivery time</Text>
                      <Text style={styles.tipCheck}><Icon name="check" size={10} color={Colors.green} /> Add relevant tags</Text>
                    </View>

                    {/* You're in control card */}
                    <View style={[styles.asideCard, { backgroundColor: 'rgba(180, 106, 116, 0.08)', borderColor: 'rgba(180, 106, 116, 0.2)' }]}>
                      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <Icon name="settings" size={14} color={Colors.roseDeep} />
                        <Text style={[styles.asideTitle, { marginBottom: 0 }]}>You're in control</Text>
                      </View>
                      <Text style={styles.controlSubText}>You can edit all details anytime after publishing.</Text>
                    </View>
                  </View>
                </View>

                {/* Confirmation Checkbox */}
                <TouchableOpacity
                  onPress={() => setConfirmed(!confirmed)}
                  style={styles.confirmCheckboxRow}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
                    {confirmed && <Icon name="check" size={10} color={Colors.white} />}
                  </View>
                  <Text style={styles.confirmLabel}>
                    I confirm that all the information provided is accurate and I have the necessary rights to the content.
                  </Text>
                </TouchableOpacity>

                {/* Actions Bottom */}
                <View style={styles.wizardFooterRow}>
                  <TouchableOpacity onPress={handleBackStep} style={styles.wizardBackBtn} activeOpacity={0.8} disabled={submitting}>
                    <Icon name="back" size={14} color={Colors.oxblood} />
                    <Text style={styles.wizardBackText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSubmit}
                    style={[styles.wizardContinueBtn, submitting && { opacity: 0.7 }]}
                    activeOpacity={0.85}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <>
                        <Text style={styles.wizardContinueText}>{service ? 'Save Changes' : 'Publish Service 🚀'}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

          </ScrollView>
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
    borderColor: 'rgba(63, 3, 11, 0.2)',
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
  continueBtn: {
    backgroundColor: Colors.oxblood,
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    ...Shadow.button,
  },
  continueBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 13.5,
    color: Colors.white,
    fontWeight: '700',
  },

  // Step 2 Media layout
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
  suggestedPointsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(180, 106, 116, 0.3)',
    backgroundColor: 'rgba(180, 106, 116, 0.05)',
  },
  suggestedText: {
    fontSize: 10.5,
    color: Colors.roseDeep,
    fontFamily: FontFamily.sans,
    fontWeight: '700',
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
  wizardFooterRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  wizardBackBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.oxblood,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.white,
  },
  wizardBackText: {
    fontFamily: FontFamily.sans,
    fontSize: 13.5,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  wizardContinueBtn: {
    flex: 2,
    height: 48,
    backgroundColor: Colors.oxblood,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...Shadow.button,
  },
  wizardContinueText: {
    fontFamily: FontFamily.sans,
    fontSize: 13.5,
    color: Colors.white,
    fontWeight: '700',
  },

  // Step 3 Review & Publish
  sparkleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(180, 106, 116, 0.08)',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(180, 106, 116, 0.15)',
  },
  sparkleIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(180, 106, 116, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.roseDeep,
  },
  sparkleMessage: {
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.6)',
    fontFamily: FontFamily.sansMedium,
  },
  reviewLayout: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  reviewMain: {
    flex: 1.5,
    minWidth: 280,
    gap: 14,
  },
  reviewAside: {
    flex: 1,
    minWidth: 220,
    gap: 14,
  },
  reviewSecTitle: {
    fontSize: 11,
    fontFamily: FontFamily.sans,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  reviewPreviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.08)',
    ...Shadow.card,
  },
  reviewThumbContainer: {
    position: 'relative',
    height: 120,
  },
  reviewThumb: {
    width: '100%',
    height: '100%',
  },
  reviewThumbOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  reviewThumbPlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewThumbDur: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 4,
    color: Colors.white,
    fontSize: 8.5,
    fontWeight: '700',
  },
  reviewCardBody: {
    padding: 10,
    gap: 6,
  },
  reviewCardTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  reviewDataCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    ...Shadow.card,
    gap: 10,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewDataTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  editLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  editLinkLabel: {
    fontSize: 11,
    fontFamily: FontFamily.sans,
    color: Colors.roseDeep,
    fontWeight: '700',
  },
  reviewDataGrid: {
    gap: 8,
  },
  reviewGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.05)',
    paddingBottom: 6,
  },
  gridLabel: {
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.45)',
    fontFamily: FontFamily.sansMedium,
  },
  gridValue: {
    fontSize: 11.5,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '700',
  },
  reviewDescText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: 'rgba(63, 3, 11, 0.7)',
    fontFamily: FontFamily.sansMedium,
  },
  deliverablesList: {
    gap: 6,
  },
  deliverableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delLabelText: {
    fontSize: 12,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
  },
  asideCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    ...Shadow.card,
    gap: 8,
  },
  asideTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 2,
  },
  asideDivider: {
    height: 0.5,
    backgroundColor: 'rgba(63, 3, 11, 0.08)',
  },
  asideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  asideLabel: {
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.45)',
    fontFamily: FontFamily.sansMedium,
  },
  asideVal: {
    fontSize: 11.5,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 1,
  },
  highlightText: {
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.75)',
    fontFamily: FontFamily.sansMedium,
  },
  tipCheck: {
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.7)',
    fontFamily: FontFamily.sansMedium,
    paddingVertical: 1,
  },
  controlSubText: {
    fontSize: 10.5,
    color: 'rgba(63, 3, 11, 0.5)',
    fontFamily: FontFamily.sansMedium,
    lineHeight: 14,
  },
  confirmCheckboxRow: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.08)',
    marginTop: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(63, 3, 11, 0.3)',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.oxblood,
    borderColor: Colors.oxblood,
  },
  confirmLabel: {
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.65)',
    fontFamily: FontFamily.sansMedium,
    flex: 1,
    lineHeight: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(180, 106, 116, 0.15)',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    gap: 4,
  },
  platformText: {
    fontSize: 9.5,
    color: Colors.roseDeep,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  categoryText: {
    fontSize: 9.5,
    color: 'rgba(63, 3, 11, 0.6)',
    fontFamily: FontFamily.sansMedium,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 10,
    color: 'rgba(63, 3, 11, 0.6)',
    fontFamily: FontFamily.sansMedium,
    marginLeft: 4,
  },
  loadingFramesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    height: 64,
  },
  loadingFramesText: {
    fontSize: 12,
    color: 'rgba(63, 3, 11, 0.5)',
    fontFamily: FontFamily.sansMedium,
  },
  skeletonFrameCard: {
    backgroundColor: 'rgba(63, 3, 11, 0.04)',
    borderColor: 'rgba(63, 3, 11, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
