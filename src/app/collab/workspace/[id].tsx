import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import LottieView from 'lottie-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

/**
 * Collaboration Workspace Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Displays the 2-step deliverable workflow for an accepted influencer:
 *   Step 1 — Submit script draft link  (brand reviews)
 *   Step 2 — Submit live post link     (unlocked after script approved)
 *   Step 3 — Completion & Payout       (brand marks complete)
 *
 * Route params:
 *   id — campaign ID (used to fetch campaign + the influencer's application)
 */
function VoiceFeedbackPlayer({ url }: { url: string }) {
  const player = useAudioPlayer(url);
  const playerStatus = useAudioPlayerStatus(player);

  const handlePlayPause = () => {
    if (playerStatus.playing) {
      player.pause();
    } else {
      player.seekTo(0);
      player.play();
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.voicePlayerCard}>
      <TouchableOpacity style={styles.voicePlayBtn} onPress={handlePlayPause} activeOpacity={0.8}>
        <Icon name={playerStatus.playing ? 'pause' : 'play'} size={16} color={Colors.oxblood} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.voicePlayerLabel}>Voice Note Feedback</Text>
        <Text style={styles.voicePlayerDuration}>
          {playerStatus.playing
            ? `${formatDuration(playerStatus.currentTime)} / ${formatDuration(playerStatus.duration ?? 0)}`
            : `Voice note (${formatDuration(playerStatus.duration ?? 0)})`}
        </Text>
      </View>
    </View>
  );
}

function WatermarkedVideoPlayer({ url }: { url: string }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
  });

  const handleOpenModal = () => {
    setIsModalVisible(true);
    player.play();
  };

  const handleCloseModal = () => {
    player.pause();
    setIsModalVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={handleOpenModal}
        {...(Platform.OS === 'web' ? { onContextMenu: (e: any) => e.preventDefault() } : {})}
        style={styles.watermarkedPlayerContainer}
      >
        <VideoView
          player={player}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
        {/* Play Overlay */}
        <View style={styles.videoThumbnailOverlay}>
          <View style={styles.videoPlayBtnCircle}>
            <Icon name="play" size={24} color="#ffffff" />
          </View>
          <Text style={styles.playOverlayText}>Click to Watch Fullscreen</Text>
        </View>

        {/* Protected Draft Badge */}
        <View style={styles.protectedBadge}>
          <Icon name="lock" size={10} color="#fff" />
          <Text style={styles.protectedBadgeText}>PROTECTED PREVIEW</Text>
        </View>
      </Pressable>

      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={false}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.fullScreenContainer}>
          {/* Video View */}
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            nativeControls={true}
            allowsPictureInPicture={true}
          />

          {/* Watermarks (for protection, overlaid on top of full-screen video) */}
          <View style={styles.fullScreenWatermarkOverlay} pointerEvents="none">
            <View style={styles.watermarkRow}>
              <Text style={styles.watermarkText}>RichyReach Preview</Text>
              <Text style={styles.watermarkText}>RichyReach Preview</Text>
            </View>
            <View style={styles.watermarkRow}>
              <Text style={styles.watermarkText}>Do Not Share</Text>
              <Text style={styles.watermarkText}>Do Not Share</Text>
            </View>
            <View style={styles.watermarkRow}>
              <Text style={styles.watermarkText}>RichyReach Preview</Text>
              <Text style={styles.watermarkText}>RichyReach Preview</Text>
            </View>
            <View style={styles.watermarkRow}>
              <Text style={styles.watermarkText}>Do Not Share</Text>
              <Text style={styles.watermarkText}>Do Not Share</Text>
            </View>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeModalBtn}
            onPress={handleCloseModal}
            activeOpacity={0.8}
          >
            <Icon name="x" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

export default function CollabWorkspacePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showModal = useUIStore((s) => s.showModal);
  const queryClient = useQueryClient();

  // ── Input state ────────────────────────────────────────────────────────────
  const [scriptInput, setScriptInput] = useState('');
  const [postLinkInput, setPostLinkInput] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const submitVideoMutation = useMutation({
    mutationFn: (videoUrl: string) =>
      api.influencers.submitVideo(myApplication!.id, videoUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', id] });
      showModal({ title: 'Submitted!', message: 'Video draft submitted for brand review.' });
    },
    onError: (err: any) =>
      showModal({ title: 'Error', message: err.message || 'Failed to submit video draft' }),
  });

  const handlePickAndUploadVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setUploadingVideo(true);
      showModal({ title: 'Uploading Draft...', message: 'Preparing and uploading your draft video. Please wait...' });

      const selectedUri = result.assets[0].uri;
      const formData = new FormData();

      let extension = 'mp4';
      const cleanUri = selectedUri.split('?')[0].split('#')[0];
      const lastSegment = cleanUri.split('/').pop() || '';
      const dotParts = lastSegment.split('.');
      if (dotParts.length > 1) {
        const possibleExt = dotParts.pop()?.toLowerCase();
        if (possibleExt && ['mp4', 'mov', 'mkv', 'avi', 'webm', 'm4v'].includes(possibleExt)) {
          extension = possibleExt;
        }
      }

      const filename = `draft_video.${extension}`;

      if (Platform.OS === 'web' || selectedUri.startsWith('blob:') || selectedUri.startsWith('data:')) {
        const response = await fetch(selectedUri);
        const blob = await response.blob();
        formData.append('file', blob, filename);
      } else {
        let formattedUri = selectedUri;
        if (!formattedUri.startsWith('file://') && !formattedUri.startsWith('content://')) {
          formattedUri = `file://${formattedUri}`;
        }
        formData.append('file', {
          uri: formattedUri,
          name: filename,
          type: `video/${extension}`,
        } as any);
      }

      const uploadRes = await api.media.upload(formData);
      submitVideoMutation.mutate(uploadRes.url);
    } catch (err: any) {
      console.error('Failed to upload video:', err);
      showModal({ title: 'Upload Failed', message: err.message || 'An error occurred during video upload.' });
    } finally {
      setUploadingVideo(false);
    }
  };

  // ── Confetti state (shown when collab is completed) ────────────────────────
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<LottieView>(null);
  const wasCompletedRef = useRef(false);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: collabData, isLoading } = useQuery<any>({
    queryKey: ['workspace', id],
    queryFn: () => api.influencers.workspace(id),
    enabled: !!id,
    refetchInterval: 15_000, // poll every 15 s so status updates appear quickly
  });

  const myApplication = collabData?.application ?? null;
  const campaign = collabData?.campaign;
  const brandInstagramPage = campaign?.brandInstagramPage ?? null;

  // Sync input defaults from loaded application data
  useEffect(() => {
    if (myApplication) {
      setScriptInput(myApplication.scriptUrl || '');
      setPostLinkInput(myApplication.postLink || '');
    }
  }, [myApplication?.scriptUrl, myApplication?.postLink, myApplication?.igHandle]);

  // Trigger confetti when collab is first completed
  useEffect(() => {
    if (myApplication?.collaborationStatus === 'completed' && !wasCompletedRef.current) {
      wasCompletedRef.current = true;
      setShowConfetti(true);
    }
  }, [myApplication?.collaborationStatus]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const submitScriptMutation = useMutation({
    mutationFn: (scriptUrl: string) =>
      api.influencers.submitScript(myApplication!.id, scriptUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', id] });
      showModal({ title: 'Submitted!', message: 'Script draft submitted for brand review.' });
    },
    onError: (err: any) =>
      showModal({ title: 'Error', message: err.message || 'Failed to submit script draft' }),
  });

  const submitPostLinkMutation = useMutation({
    mutationFn: (postLink: string) =>
      api.influencers.submitPostLink(myApplication!.id, postLink),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', id] });
      showModal({ title: 'Submitted!', message: 'Live post link shared with the brand.' });
    },
    onError: (err: any) =>
      showModal({ title: 'Error', message: err.message || 'Failed to submit post link' }),
  });

  // ── Loading / guard ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.oxblood} />
        <Text style={styles.loadingText}>Loading workspace…</Text>
      </View>
    );
  }

  if (!myApplication || myApplication.status !== 'accepted') {
    return (
      <View style={styles.errorContainer}>
        <Icon name="x" size={36} color={Colors.roseDeep} />
        <Text style={styles.errorText}>Workspace not available.</Text>
        <Text style={styles.errorSub}>
          This workspace is only accessible once your application has been accepted.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCompleted = myApplication.collaborationStatus === 'completed';
  const scriptApproved = myApplication.scriptStatus === 'approved';
  const scriptPending = myApplication.scriptStatus === 'pending';
  const scriptRejected = myApplication.scriptStatus === 'rejected';
  const videoApproved = myApplication.videoStatus === 'approved';
  const videoPending = myApplication.videoStatus === 'pending';
  const videoRejected = myApplication.videoStatus === 'rejected';
  const videoUrl = myApplication.videoUrl;
  const videoFeedbackType = myApplication.videoFeedbackType;
  const videoFeedbackText = myApplication.videoFeedbackText;
  const videoFeedbackVoiceUrl = myApplication.videoFeedbackVoiceUrl;
  const postSubmitted = !!myApplication.postLink;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* ── Nav Bar ─────────────────────────────────────────────────────── */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navBackBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color={Colors.oxblood} strokeWidth={2} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.navTitle} numberOfLines={1}>
              {campaign?.title || 'Collaboration Workspace'}
            </Text>
            <Text style={styles.navSub} numberOfLines={1}>
              {campaign?.brandName || campaign?.brand?.companyName || 'Brand'}
            </Text>
          </View>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Icon name="check" size={11} color="#fff" />
              <Text style={styles.completedBadgeText}>Done</Text>
            </View>
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        >
          {/* ── Accepted Banner ──────────────────────────────────────────── */}
          <View style={styles.acceptedBanner}>
            <View style={styles.acceptedBannerLeft}>
              <Text style={styles.acceptedBannerLabel}>Accepted Bid</Text>
              <Text style={styles.acceptedBannerAmount}>
                ₹{((myApplication.bidAmount || 0) / 100).toLocaleString()}
              </Text>
            </View>
            <View style={styles.acceptedBannerRight}>
              <Text style={styles.acceptedBannerStatus}>
                {isCompleted ? '🎉 Completed' : '⚡ In Progress'}
              </Text>
            </View>
          </View>

          {/* ── Progress Tracker ─────────────────────────────────────────── */}
          <View style={styles.progressCard}>
            {[
              {
                label: 'Script Review',
                done: scriptApproved,
                active: !scriptApproved,
                pending: scriptPending,
              },
              {
                label: 'Video Approved',
                done: videoApproved,
                active: scriptApproved && !videoApproved,
                pending: videoPending,
              },
              {
                label: 'Post Submitted',
                done: postSubmitted,
                active: videoApproved && !postSubmitted,
                pending: false,
              },
              {
                label: 'Payout Released',
                done: isCompleted,
                active: postSubmitted && !isCompleted,
                pending: false,
              },
            ].map((step, i, arr) => (
              <View key={step.label} style={styles.progressStep}>
                <View
                  style={[
                    styles.progressDot,
                    step.done && styles.progressDotDone,
                    step.pending && styles.progressDotPending,
                    step.active && !step.done && !step.pending && styles.progressDotActive,
                  ]}
                >
                  {step.done ? (
                    <Icon name="check" size={9} color="#fff" />
                  ) : (
                    <Text style={styles.progressDotNum}>{i + 1}</Text>
                  )}
                </View>
                {i < arr.length - 1 && (
                  <View style={[styles.progressLine, step.done && styles.progressLineDone]} />
                )}
                <Text
                  style={[
                    styles.progressLabel,
                    step.done && styles.progressLabelDone,
                    step.active && styles.progressLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* STEP 1: Script Draft                                            */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <View style={styles.stepCard}>
            <View style={styles.stepCardHeader}>
              <View
                style={[
                  styles.stepBadge,
                  scriptApproved
                    ? styles.stepBadgeDone
                    : scriptPending
                      ? styles.stepBadgePending
                      : styles.stepBadgeActive,
                ]}
              >
                {scriptApproved ? (
                  <Icon name="check" size={12} color="#fff" />
                ) : scriptPending ? (
                  <Icon name="clock" size={12} color="#fff" />
                ) : (
                  <Text style={styles.stepBadgeText}>1</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>Script Draft Review</Text>
                <Text style={styles.stepSubtitle}>
                  Share a Google Doc / Notion link for brand approval.
                </Text>
              </View>
            </View>

            {scriptApproved ? (
              <View style={styles.approvedRow}>
                <Icon name="check" size={14} color={Colors.green} />
                <Text style={styles.approvedText}>
                  Approved — {myApplication.scriptUrl}
                </Text>
              </View>
            ) : (
              <>
                {scriptRejected && (
                  <View style={styles.rejectedBanner}>
                    <Text style={styles.rejectedBannerText}>
                      ✕ Rejected — update your draft and resubmit.
                    </Text>
                  </View>
                )}
                {scriptPending && (
                  <View style={styles.pendingBanner}>
                    <Text style={styles.pendingBannerText}>
                      ⏳ Submitted for review: {myApplication.scriptUrl}
                    </Text>
                  </View>
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Google Doc, Notion, or Drive link…"
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  value={scriptInput}
                  onChangeText={setScriptInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[styles.actionBtn, (!scriptInput.trim() || submitScriptMutation.isPending) && styles.actionBtnDisabled]}
                  onPress={() => submitScriptMutation.mutate(scriptInput)}
                  disabled={!scriptInput.trim() || submitScriptMutation.isPending}
                  activeOpacity={0.8}
                >
                  {submitScriptMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.actionBtnText}>
                      {scriptPending ? 'Update Draft Link' : 'Submit Script Link'}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* STEP 2: Video Draft Review                                      */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <View style={[styles.stepCard, !scriptApproved && styles.stepCardLocked]}>
            <View style={styles.stepCardHeader}>
              <View
                style={[
                  styles.stepBadge,
                  !scriptApproved
                    ? styles.stepBadgeLocked
                    : videoApproved
                      ? styles.stepBadgeDone
                      : videoPending
                        ? styles.stepBadgePending
                        : styles.stepBadgeActive,
                ]}
              >
                {!scriptApproved ? (
                  <Icon name="lock" size={11} color="#aaa" />
                ) : videoApproved ? (
                  <Icon name="check" size={12} color="#fff" />
                ) : videoPending ? (
                  <Icon name="clock" size={12} color="#fff" />
                ) : (
                  <Text style={styles.stepBadgeText}>2</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, !scriptApproved && styles.stepTitleLocked]}>
                  Video Draft Review
                </Text>
                <Text style={[styles.stepSubtitle, !scriptApproved && styles.stepSubtitleLocked]}>
                  Upload your draft video for brand approval.
                </Text>
              </View>
            </View>

            {!scriptApproved ? (
              <View style={styles.lockedHint}>
                <Icon name="lock" size={11} color="rgba(63,3,11,0.35)" />
                <Text style={styles.lockedHintText}>
                  Unlocked after script approval.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {videoApproved && (
                  <View style={styles.approvedRow}>
                    <Icon name="check" size={14} color={Colors.green} />
                    <Text style={styles.approvedText}>Video Approved!</Text>
                  </View>
                )}

                {videoPending && (
                  <View style={styles.pendingBanner}>
                    <Text style={styles.pendingBannerText}>
                      ⏳ Video submitted. Awaiting brand review...
                    </Text>
                  </View>
                )}

                {videoRejected && (
                  <View style={[styles.rejectedBanner, { gap: 8 }]}>
                    <Text style={styles.rejectedBannerText}>
                      ✕ Brand requested changes for this video.
                    </Text>
                    {videoFeedbackType === 'text' && videoFeedbackText && (
                      <View style={styles.feedbackContainer}>
                        <Text style={styles.feedbackLabel}>Instructions:</Text>
                        <Text style={styles.feedbackTextContent}>{videoFeedbackText}</Text>
                      </View>
                    )}
                    {videoFeedbackType === 'voice' && videoFeedbackVoiceUrl && (
                      <View style={styles.feedbackContainer}>
                        <VoiceFeedbackPlayer url={videoFeedbackVoiceUrl} />
                      </View>
                    )}
                  </View>
                )}

                {videoUrl && (
                  <View style={{ marginTop: 4 }}>
                    <Text style={styles.previewLabel}>Video Preview:</Text>
                    <WatermarkedVideoPlayer url={videoUrl} />
                  </View>
                )}

                {(!videoUrl || videoRejected) && (
                  <TouchableOpacity
                    style={[styles.actionBtn, uploadingVideo && styles.actionBtnDisabled]}
                    onPress={handlePickAndUploadVideo}
                    disabled={uploadingVideo}
                    activeOpacity={0.8}
                  >
                    {uploadingVideo ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.actionBtnText}>
                        {videoRejected ? 'Upload Revised Video' : 'Upload Video Draft'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* STEP 3: Submit Live Post Link                                   */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <View style={[styles.stepCard, !videoApproved && styles.stepCardLocked]}>
            <View style={styles.stepCardHeader}>
              <View
                style={[
                  styles.stepBadge,
                  !videoApproved
                    ? styles.stepBadgeLocked
                    : postSubmitted
                      ? styles.stepBadgeDone
                      : styles.stepBadgeActive,
                ]}
              >
                {!videoApproved ? (
                  <Icon name="lock" size={11} color="#aaa" />
                ) : postSubmitted ? (
                  <Icon name="check" size={12} color="#fff" />
                ) : (
                  <Text style={styles.stepBadgeText}>3</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, !videoApproved && styles.stepTitleLocked]}>
                  Submit Live Post Link
                </Text>
                <Text style={[styles.stepSubtitle, !videoApproved && styles.stepSubtitleLocked]}>
                  Once the Reel/Post is live, share the Instagram link here.
                </Text>
              </View>
            </View>

            {!videoApproved ? (
              <View style={styles.lockedHint}>
                <Icon name="lock" size={11} color="rgba(63,3,11,0.35)" />
                <Text style={styles.lockedHintText}>
                  Unlocked after video draft approval.
                </Text>
              </View>
            ) : (
              <>
                {postSubmitted && (
                  <View style={[styles.pendingBanner, { backgroundColor: 'rgba(74,222,128,0.08)', borderColor: 'rgba(74,222,128,0.2)' }]}>
                    <Text style={[styles.pendingBannerText, { color: Colors.ink }]}>
                      Submitted:{' '}
                    </Text>
                    <TouchableOpacity onPress={() => Linking.openURL(myApplication.postLink)}>
                      <Text style={styles.linkText}>{myApplication.postLink}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {brandInstagramPage && (
                  <View style={styles.brandHandleHint}>
                    <Text style={styles.brandHandleHintTitle}>Invite Collaborators on Instagram</Text>
                    <Text style={styles.brandHandleHintText}>
                      {brandInstagramPage.toLowerCase() === 'richyreach_official' ? (
                        <>
                          You must add <Text style={{ fontWeight: '700', color: Colors.oxblood }}>@richyreach_official</Text> as a collaborator on your Reel/Post so it appears on both profiles.
                        </>
                      ) : (
                        <>
                          You must add <Text style={{ fontWeight: '700', color: Colors.oxblood }}>@richyreach_official</Text> and <Text style={{ fontWeight: '700', color: Colors.oxblood }}>@{brandInstagramPage}</Text> as collaborators on your Reel/Post so it appears on all profiles.
                        </>
                      )}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                      <TouchableOpacity
                        style={styles.hintActionBtn}
                        onPress={() => Linking.openURL(`https://www.instagram.com/richyreach_official`)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.hintActionBtnText}>@richyreach_official ↗</Text>
                      </TouchableOpacity>
                      {brandInstagramPage.toLowerCase() !== 'richyreach_official' && (
                        <TouchableOpacity
                          style={styles.hintActionBtn}
                          onPress={() => Linking.openURL(`https://www.instagram.com/${brandInstagramPage}`)}
                          activeOpacity={0.75}
                        >
                          <Text style={styles.hintActionBtnText}>@{brandInstagramPage} ↗</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
                <TextInput
                  style={styles.input}
                  placeholder="https://www.instagram.com/reel/…"
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  value={postLinkInput}
                  onChangeText={setPostLinkInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[styles.actionBtn, (!postLinkInput.trim() || submitPostLinkMutation.isPending) && styles.actionBtnDisabled]}
                  onPress={() => submitPostLinkMutation.mutate(postLinkInput)}
                  disabled={!postLinkInput.trim() || submitPostLinkMutation.isPending}
                  activeOpacity={0.8}
                >
                  {submitPostLinkMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.actionBtnText}>
                      {postSubmitted ? 'Update Post Link' : 'Submit Post Link'}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* STEP 4: Completion & Payout                                     */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <View style={[styles.stepCard, !postSubmitted && styles.stepCardLocked]}>
            <View style={styles.stepCardHeader}>
              <View
                style={[
                  styles.stepBadge,
                  !postSubmitted
                    ? styles.stepBadgeLocked
                    : isCompleted
                      ? styles.stepBadgeDone
                      : styles.stepBadgePending,
                ]}
              >
                {!postSubmitted ? (
                  <Icon name="lock" size={11} color="#aaa" />
                ) : isCompleted ? (
                  <Icon name="check" size={12} color="#fff" />
                ) : (
                  <Icon name="clock" size={12} color="#fff" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, !postSubmitted && styles.stepTitleLocked]}>
                  Completion & Payout
                </Text>
                <Text style={[styles.stepSubtitle, !postSubmitted && styles.stepSubtitleLocked]}>
                  Brand verifies deliverables and releases your payout.
                </Text>
              </View>
            </View>

            {isCompleted ? (
              <View style={styles.celebrationCard}>
                <Text style={styles.celebrationTitle}>🎉 Collaboration Completed!</Text>
                <Text style={styles.celebrationBody}>
                  The brand has verified your deliverables. Your payout of{' '}
                  <Text style={{ fontWeight: '700', color: Colors.green }}>
                    ₹{((myApplication.bidAmount || 0) / 100).toLocaleString()}
                  </Text>{' '}
                  has been processed. Check your wallet for the credit.
                </Text>
              </View>
            ) : postSubmitted ? (
              <View style={styles.pendingCompletionCard}>
                <Text style={styles.pendingCompletionText}>
                  ⏱ The brand is reviewing your live post. Payout will be released upon approval.
                </Text>
              </View>
            ) : (
              <View style={styles.lockedHint}>
                <Icon name="lock" size={11} color="rgba(63,3,11,0.35)" />
                <Text style={styles.lockedHintText}>
                  Unlocked after submitting your live post link.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* ── Confetti Overlay ────────────────────────────────────────────────── */}
      {showConfetti && (
        <View style={styles.confettiOverlay} pointerEvents="none">
          <LottieView
            ref={confettiRef}
            source={require('@/assets/lottie-animation/coffeti.json')}
            autoPlay
            loop={false}
            style={styles.confettiAnim}
            onAnimationFinish={() => {
              setTimeout(() => setShowConfetti(false), 400);
            }}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.creamLite,
    gap: 12,
  },
  loadingText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Colors.oxblood,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.creamLite,
    padding: 32,
    gap: 12,
  },
  errorText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 17,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  errorSub: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13.5,
    color: 'rgba(63,3,11,0.55)',
    textAlign: 'center',
    lineHeight: 20,
  },
  backBtn: {
    marginTop: 8,
    backgroundColor: Colors.oxblood,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: Radius.md,
    ...Shadow.button,
  },
  backBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    color: Colors.cream,
    fontWeight: '700',
  },

  // Nav
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.07)',
  },
  navBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  navTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  navSub: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: 'rgba(63,3,11,0.5)',
    marginTop: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.green,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  completedBadgeText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },

  scrollContent: {
    padding: 16,
    gap: 14,
  },

  // Accepted banner
  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.oxblood,
    borderRadius: 16,
    padding: 16,
    ...Shadow.card,
  },
  acceptedBannerLeft: {
    gap: 2,
  },
  acceptedBannerLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10.5,
    color: Colors.roseSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  acceptedBannerAmount: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 26,
    fontWeight: '700',
    color: Colors.cream,
  },
  acceptedBannerRight: {},
  acceptedBannerStatus: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.roseSoft,
    fontWeight: '600',
  },

  // Progress tracker
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: 'rgba(63,3,11,0.05)',
    ...Shadow.card,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(63,3,11,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  progressDotDone: {
    backgroundColor: Colors.green,
  },
  progressDotPending: {
    backgroundColor: '#e67e22',
  },
  progressDotActive: {
    backgroundColor: Colors.oxblood,
  },
  progressDotNum: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: 'rgba(63,3,11,0.4)',
    fontWeight: '700',
  },
  progressLine: {
    position: 'absolute',
    top: 12,
    left: '60%',
    right: '-60%',
    height: 1.5,
    backgroundColor: 'rgba(63,3,11,0.08)',
  },
  progressLineDone: {
    backgroundColor: Colors.green,
  },
  progressLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 9,
    color: 'rgba(63,3,11,0.4)',
    marginTop: 5,
    textAlign: 'center',
  },
  progressLabelDone: {
    color: Colors.green,
    fontWeight: '700',
  },
  progressLabelActive: {
    color: Colors.oxblood,
    fontWeight: '700',
  },

  // Step cards
  stepCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(63,3,11,0.05)',
    gap: 12,
    ...Shadow.card,
  },
  stepCardLocked: {
    opacity: 0.55,
  },
  stepCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepBadgeActive: {
    backgroundColor: Colors.oxblood,
  },
  stepBadgeDone: {
    backgroundColor: Colors.green,
  },
  stepBadgePending: {
    backgroundColor: '#e67e22',
  },
  stepBadgeLocked: {
    backgroundColor: 'rgba(63,3,11,0.06)',
  },
  stepBadgeText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.cream,
    fontWeight: '700',
  },
  stepTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  stepTitleLocked: {
    color: 'rgba(63,3,11,0.4)',
  },
  stepSubtitle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.55)',
    marginTop: 2,
    lineHeight: 18,
  },
  stepSubtitleLocked: {
    color: 'rgba(63,3,11,0.3)',
  },

  // Form
  input: {
    backgroundColor: 'rgba(63,3,11,0.02)',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    fontSize: 14,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
  },
  actionBtn: {
    backgroundColor: Colors.oxblood,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.button,
  },
  actionBtnDisabled: {
    opacity: 0.45,
  },
  actionBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.cream,
  },

  // Status banners
  approvedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(42,122,90,0.06)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(42,122,90,0.15)',
  },
  approvedText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.green,
    flex: 1,
  },
  rejectedBanner: {
    backgroundColor: 'rgba(235,87,87,0.08)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(235,87,87,0.2)',
  },
  rejectedBannerText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: '#d93e36',
  },
  pendingBanner: {
    backgroundColor: 'rgba(230,126,34,0.08)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(230,126,34,0.2)',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pendingBannerText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: '#b35700',
  },
  linkText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.roseDeep,
    textDecorationLine: 'underline',
  },
  lockedHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lockedHintText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
    color: 'rgba(63,3,11,0.4)',
  },

  // Completion cards
  celebrationCard: {
    backgroundColor: 'rgba(42,122,90,0.06)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(42,122,90,0.15)',
    gap: 6,
  },
  celebrationTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.green,
  },
  celebrationBody: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13.5,
    color: 'rgba(42,2,7,0.75)',
    lineHeight: 20,
  },
  pendingCompletionCard: {
    backgroundColor: 'rgba(230,126,34,0.06)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(230,126,34,0.18)',
  },
  pendingCompletionText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: '#b35700',
    lineHeight: 19,
  },

  // Confetti
  confettiOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    pointerEvents: 'none',
  },
  confettiAnim: {
    width: '100%',
    height: '100%',
  },
  brandHandleHint: {
    backgroundColor: 'rgba(225,48,108,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(225,48,108,0.18)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 2,
  },
  brandHandleHintTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.roseDeep,
  },
  brandHandleHintText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
    color: 'rgba(63,3,11,0.65)',
    marginTop: 4,
    lineHeight: 18,
  },
  hintActionBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(225,48,108,0.25)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintActionBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Colors.roseDeep,
    fontWeight: '700',
  },

  // Voice note player
  voicePlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    marginTop: 4,
  },
  voicePlayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(63,3,11,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voicePlayerLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.oxblood,
    fontWeight: '600',
  },
  voicePlayerDuration: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10,
    color: 'rgba(63,3,11,0.5)',
    marginTop: 1,
  },

  // Watermarked player
  watermarkedPlayerContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 6,
  },
  protectedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(235, 87, 87, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 15,
  },
  protectedBadgeText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  watermarkOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  watermarkRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '120%',
    transform: [{ rotate: '-15deg' }],
  },
  watermarkText: {
    color: 'rgba(255, 255, 255, 0.15)',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FontFamily.sansMedium,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  videoThumbnailOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  videoPlayBtnCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  playOverlayText: {
    color: '#fff',
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  fullScreenWatermarkOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-around',
    paddingVertical: 100,
    opacity: 0.15,
  },

  // Feedback container
  feedbackContainer: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    width: '100%',
  },
  feedbackLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63,3,11,0.6)',
    fontWeight: '700',
  },
  feedbackTextContent: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: Colors.ink,
    marginTop: 2,
    lineHeight: 17,
  },
  previewLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: 'rgba(63,3,11,0.5)',
    marginBottom: 2,
  },
});
