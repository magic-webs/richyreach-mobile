import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { Image } from 'expo-image';

import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { Colors, FontFamily } from '@/constants/brand';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
  });

  const togglePlay = () => {
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  return (
    <Pressable
      onPress={togglePlay}
      {...(Platform.OS === 'web' ? { onContextMenu: (e: any) => e.preventDefault() } : {})}
      style={styles.watermarkedPlayerContainer}
    >
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%', position: 'absolute' }}
        contentFit="contain"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
      <View style={styles.protectedBadge}>
        <Icon name="lock" size={10} color="#fff" />
        <Text style={styles.protectedBadgeText}>PROTECTED PREVIEW</Text>
      </View>
      <View style={styles.watermarkOverlay} pointerEvents="none">
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
      </View>
      {!isPlaying && (
        <View style={styles.videoPlayOverlay}>
          <Icon name="play" size={24} color="#ffffff" />
        </View>
      )}
    </Pressable>
  );
}

interface VideoReviewWidgetProps {
  app: any;
  onReviewComplete: () => void;
}

function VideoReviewWidget({ app, onReviewComplete }: VideoReviewWidgetProps) {
  const queryClient = useQueryClient();
  const showModal = useUIStore((s) => s.showModal);

  const [mode, setMode] = useState<'none' | 'text' | 'voice'>('none');
  const [textFeedback, setTextFeedback] = useState('');
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 250);

  const player = useAudioPlayer(audioUri ?? undefined);
  const playerStatus = useAudioPlayerStatus(player);

  useEffect(() => {
    (async () => {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) return;
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  const startRecording = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
    await audioRecorder.stop();
    if (audioRecorder.uri) {
      setAudioUri(audioRecorder.uri);
    }
  };

  const deleteRecording = () => {
    player.pause();
    setAudioUri(null);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePlayPause = () => {
    if (playerStatus.playing) {
      player.pause();
    } else {
      player.seekTo(0);
      player.play();
    }
  };

  const reviewVideoMutation = useMutation({
    mutationFn: (data: { status: 'approved' | 'rejected', feedbackType?: 'none' | 'text' | 'voice', feedbackText?: string, feedbackVoiceUrl?: string }) =>
      api.brands.reviewVideo(app.id, data.status, data.feedbackType, data.feedbackText, data.feedbackVoiceUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brandCampaign'] });
      showModal({ title: 'Success', message: 'Video review submitted successfully!' });
      onReviewComplete();
    },
    onError: (err: any) => {
      showModal({ title: 'Error', message: err.message || 'Failed to submit video review' });
    }
  });

  const handleApprove = () => {
    reviewVideoMutation.mutate({ status: 'approved' });
  };

  const handleReject = async () => {
    if (mode === 'text' && !textFeedback.trim()) {
      showModal({ title: 'Validation Error', message: 'Please write change instructions.' });
      return;
    }

    if (mode === 'voice') {
      if (!audioUri) {
        showModal({ title: 'Validation Error', message: 'Please record voice feedback.' });
        return;
      }

      try {
        setUploadingVoice(true);
        showModal({ title: 'Uploading Feedback...', message: 'Saving your voice feedback instructions. Please wait...' });

        const formData = new FormData();
        const extension = audioUri.split('.').pop() || 'm4a';
        const filename = `voice_feedback.${extension}`;

        if (Platform.OS === 'web' || audioUri.startsWith('blob:') || audioUri.startsWith('data:')) {
          const response = await fetch(audioUri);
          const blob = await response.blob();
          formData.append('file', blob, filename);
        } else {
          let formattedUri = audioUri;
          if (!formattedUri.startsWith('file://') && !formattedUri.startsWith('content://')) {
            formattedUri = `file://${formattedUri}`;
          }
          formData.append('file', {
            uri: formattedUri,
            name: filename,
            type: `audio/${extension}`,
          } as any);
        }

        const uploadRes = await api.media.upload(formData);
        reviewVideoMutation.mutate({
          status: 'rejected',
          feedbackType: 'voice',
          feedbackVoiceUrl: uploadRes.url,
        });
      } catch (err: any) {
        console.error('Failed to upload voice feedback:', err);
        showModal({ title: 'Upload Failed', message: err.message || 'An error occurred during voice feedback upload.' });
      } finally {
        setUploadingVoice(false);
      }
    } else {
      reviewVideoMutation.mutate({
        status: 'rejected',
        feedbackType: 'text',
        feedbackText: textFeedback,
      });
    }
  };

  if (reviewVideoMutation.isPending || uploadingVoice) {
    return (
      <View style={{ padding: 12, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="small" color={Colors.oxblood} />
        <Text style={{ marginTop: 8, fontSize: 12, color: 'rgba(63,3,11,0.5)' }}>Submitting review...</Text>
      </View>
    );
  }

  return (
    <View style={styles.reviewWidgetCard}>
      {mode === 'none' ? (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <TouchableOpacity
            style={[styles.reviewActionBtn, { backgroundColor: '#eb5757', flex: 1 }]}
            onPress={() => setMode('text')}
          >
            <Text style={styles.reviewActionBtnText}>Request Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reviewActionBtn, { backgroundColor: '#2ecc71', flex: 1 }]}
            onPress={handleApprove}
          >
            <Text style={styles.reviewActionBtnText}>Approve Video</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.feedbackTitle}>Choose Feedback Mode:</Text>
            <TouchableOpacity onPress={() => setMode('none')}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, mode === 'text' && styles.tabActive]}
              onPress={() => setMode('text')}
            >
              <Text style={[styles.tabBtnText, mode === 'text' && styles.tabActiveText]}>Text Instructions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, mode === 'voice' && styles.tabActive]}
              onPress={() => setMode('voice')}
            >
              <Text style={[styles.tabBtnText, mode === 'voice' && styles.tabActiveText]}>Voice Note</Text>
            </TouchableOpacity>
          </View>

          {mode === 'text' && (
            <TextInput
              style={styles.reviewTextInput}
              placeholder="Provide clear changes requested (e.g. adjust logo size, fix script voiceover at 0:10)..."
              placeholderTextColor="rgba(63,3,11,0.3)"
              multiline
              numberOfLines={3}
              value={textFeedback}
              onChangeText={setTextFeedback}
            />
          )}

          {mode === 'voice' && (
            <View style={styles.miniRecorderContainer}>
              {!audioUri ? (
                <View style={{ alignItems: 'center', gap: 6 }}>
                  <TouchableOpacity
                    style={[styles.micBtn, recorderState.isRecording && styles.micBtnRecording]}
                    onPress={recorderState.isRecording ? stopRecording : startRecording}
                  >
                    {recorderState.isRecording ? (
                      <View style={styles.stopMicIcon} />
                    ) : (
                      <Icon name="mic" size={18} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.micStatusText}>
                    {recorderState.isRecording
                      ? `Recording: ${formatDuration(recorderState.durationMillis / 1000)}`
                      : 'Tap mic to start recording'}
                  </Text>
                </View>
              ) : (
                <View style={styles.miniPlaybackRow}>
                  <TouchableOpacity style={styles.miniPlayBtn} onPress={handlePlayPause}>
                    <Icon name={playerStatus.playing ? 'pause' : 'play'} size={14} color={Colors.oxblood} />
                  </TouchableOpacity>
                  <Text style={styles.miniDurationText}>
                    {playerStatus.playing
                      ? `${formatDuration(playerStatus.currentTime)} / ${formatDuration(playerStatus.duration ?? 0)}`
                      : `Voice Note (${formatDuration(playerStatus.duration ?? 0)})`}
                  </Text>
                  <TouchableOpacity style={styles.miniTrashBtn} onPress={deleteRecording}>
                    <Icon name="trash" size={15} color={Colors.roseDeep} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitFeedbackBtn, { backgroundColor: '#eb5757' }]}
            onPress={handleReject}
          >
            <Text style={styles.submitFeedbackBtnText}>Send Change Request</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function BrandCollabProgressScreen() {
  const { id, campaignId } = useLocalSearchParams<{ id: string; campaignId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const showModal = useUIStore((s) => s.showModal);

  const { data: queryData, isLoading, refetch } = useQuery<any>({
    queryKey: ['brandCampaign', campaignId],
    queryFn: () => api.campaigns.get(campaignId as string),
    enabled: !!campaignId,
  });

  const app = queryData?.applications?.find((a: any) => a.id === id);

  const reviewScriptMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: 'approved' | 'rejected' }) =>
      api.brands.reviewScript(appId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brandCampaign', campaignId] });
      showModal({ title: 'Success', message: 'Script status updated successfully!' });
      refetch();
    },
    onError: (err: any) => {
      showModal({ title: 'Error', message: err.message || 'Failed to update script status' });
    },
  });

  const completeCollabMutation = useMutation({
    mutationFn: (appId: string) => api.brands.completeCollaboration(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brandCampaign', campaignId] });
      showModal({ title: 'Success', message: 'Collaboration marked as complete! 🎉' });
      refetch();
    },
    onError: (err: any) => {
      showModal({ title: 'Error', message: err.message || 'Failed to complete collaboration' });
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.oxblood} />
      </View>
    );
  }

  if (!app) {
    return (
      <View style={[styles.center, { paddingTop: insets.top, paddingHorizontal: 20 }]}>
        <Text style={styles.errorText}>Collaboration data not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Icon name="arrowLeft" size={20} color={Colors.oxblood} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Collaboration Progress
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.influencerMetaCard}>
          {app.avatar ? (
            <Image source={{ uri: app.avatar }} style={{ width: 44, height: 44, borderRadius: 22 }} />
          ) : (
            <PlaceholderImage tone="rose" height={44} width={44} borderRadius={22} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.influencerName}>{app.name || 'Creator'}</Text>
            <Text style={styles.influencerHandle}>@{app.instagramHandle || 'instagram_user'}</Text>
          </View>
        </View>

        <View style={styles.collabReviewPanel}>
          {/* Step 1: Script Review */}
          <View style={styles.reviewStep}>
            <View style={styles.reviewStepLeft}>
              <View
                style={[
                  styles.stepCircle,
                  app.scriptStatus === 'approved'
                    ? styles.stepCircleDone
                    : app.scriptStatus === 'pending'
                      ? styles.stepCirclePending
                      : styles.stepCircleActive,
                ]}
              >
                {app.scriptStatus === 'approved' ? (
                  <Icon name="check" size={10} color="#fff" />
                ) : (
                  <Text style={styles.stepCircleText}>1</Text>
                )}
              </View>
              <View style={styles.stepLine} />
            </View>
            <View style={styles.reviewStepContent}>
              <Text style={styles.reviewStepTitle}>Script Draft Review</Text>
              {app.scriptStatus === 'approved' ? (
                <View style={{ gap: 4, marginTop: 4 }}>
                  <Text style={styles.reviewSuccessText}>✓ Approved script</Text>
                  <TouchableOpacity onPress={() => app.scriptUrl && Linking.openURL(app.scriptUrl)}>
                    <Text style={styles.reviewLinkText} numberOfLines={1}>
                      {app.scriptUrl} ↗
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : app.scriptStatus === 'pending' ? (
                <View style={{ marginTop: 6, gap: 8 }}>
                  <Text style={styles.reviewWarningText}>⏱ Awaiting Script Review</Text>
                  <TouchableOpacity onPress={() => app.scriptUrl && Linking.openURL(app.scriptUrl)}>
                    <Text style={styles.reviewLinkText} numberOfLines={1}>
                      {app.scriptUrl} ↗
                    </Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                    <TouchableOpacity
                      style={[styles.reviewActionBtn, { backgroundColor: '#eb5757' }]}
                      onPress={() => reviewScriptMutation.mutate({ appId: app.id, status: 'rejected' })}
                      disabled={reviewScriptMutation.isPending}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.reviewActionBtnText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reviewActionBtn, { backgroundColor: '#2ecc71' }]}
                      onPress={() => reviewScriptMutation.mutate({ appId: app.id, status: 'approved' })}
                      disabled={reviewScriptMutation.isPending}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.reviewActionBtnText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : app.scriptStatus === 'rejected' ? (
                <Text style={styles.reviewDescText}>
                  ✕ Script Rejected. Waiting for creator to resubmit.
                </Text>
              ) : (
                <Text style={styles.reviewDescText}>Awaiting script draft upload from creator.</Text>
              )}
            </View>
          </View>

          {/* Step 2: Video Draft Review */}
          <View style={styles.reviewStep}>
            <View style={styles.reviewStepLeft}>
              <View
                style={[
                  styles.stepCircle,
                  app.videoStatus === 'approved'
                    ? styles.stepCircleDone
                    : app.videoStatus === 'pending'
                      ? styles.stepCirclePending
                      : styles.stepCircleActive,
                ]}
              >
                {app.videoStatus === 'approved' ? (
                  <Icon name="check" size={10} color="#fff" />
                ) : (
                  <Text style={styles.stepCircleText}>2</Text>
                )}
              </View>
              <View style={styles.stepLine} />
            </View>
            <View style={styles.reviewStepContent}>
              <Text style={styles.reviewStepTitle}>Video Draft Review</Text>
              {app.videoStatus === 'approved' ? (
                <View style={{ gap: 4, marginTop: 4 }}>
                  <Text style={styles.reviewSuccessText}>✓ Approved video draft</Text>
                  {app.videoUrl && <WatermarkedVideoPlayer url={app.videoUrl} />}
                </View>
              ) : app.videoStatus === 'pending' ? (
                <View style={{ marginTop: 6, gap: 8 }}>
                  <Text style={styles.reviewWarningText}>⏱ Awaiting Video Review</Text>
                  {app.videoUrl && <WatermarkedVideoPlayer url={app.videoUrl} />}
                  <VideoReviewWidget
                    app={app}
                    onReviewComplete={() => refetch()}
                  />
                </View>
              ) : app.videoStatus === 'rejected' ? (
                <View style={{ gap: 6, marginTop: 4 }}>
                  <Text style={styles.reviewDescText}>
                    ✕ Video draft changes requested. Feedback sent to creator.
                  </Text>
                  {app.videoFeedbackType === 'text' && app.videoFeedbackText && (
                    <View style={styles.feedbackContainer}>
                      <Text style={styles.feedbackLabel}>Changes Requested:</Text>
                      <Text style={styles.feedbackTextContent}>{app.videoFeedbackText}</Text>
                    </View>
                  )}
                  {app.videoFeedbackType === 'voice' && app.videoFeedbackVoiceUrl && (
                    <View style={styles.feedbackContainer}>
                      <VoiceFeedbackPlayer url={app.videoFeedbackVoiceUrl} />
                    </View>
                  )}
                  <Text style={styles.reviewDescText}>Awaiting revised video draft from creator.</Text>
                </View>
              ) : (
                <Text style={styles.reviewDescText}>Awaiting video draft upload from creator.</Text>
              )}
            </View>
          </View>

          {/* Step 3: Live Post Link */}
          <View style={styles.reviewStep}>
            <View style={styles.reviewStepLeft}>
              <View
                style={[
                  styles.stepCircle,
                  app.postLink ? styles.stepCircleDone : styles.stepCircleActive,
                ]}
              >
                {app.postLink ? (
                  <Icon name="check" size={10} color="#fff" />
                ) : (
                  <Text style={styles.stepCircleText}>3</Text>
                )}
              </View>
              <View style={styles.stepLine} />
            </View>
            <View style={styles.reviewStepContent}>
              <Text style={styles.reviewStepTitle}>Reel / Post Deliverable</Text>
              {app.postLink ? (
                <View style={{ gap: 4, marginTop: 4 }}>
                  <Text style={styles.reviewSuccessText}>✓ Creator shared post link</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(app.postLink)}>
                    <Text style={styles.reviewLinkText} numberOfLines={1}>
                      {app.postLink} ↗
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.reviewDescText}>
                  Awaiting post upload (unlocked once video is approved).
                </Text>
              )}
            </View>
          </View>

          {/* Step 4: Completion */}
          <View style={[styles.reviewStep, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <View style={styles.reviewStepLeft}>
              <View
                style={[
                  styles.stepCircle,
                  app.collaborationStatus === 'completed'
                    ? styles.stepCircleDone
                    : styles.stepCircleActive,
                ]}
              >
                {app.collaborationStatus === 'completed' ? (
                  <Icon name="check" size={10} color="#fff" />
                ) : (
                  <Text style={styles.stepCircleText}>4</Text>
                )}
              </View>
            </View>
            <View style={styles.reviewStepContent}>
              <Text style={styles.reviewStepTitle}>Completion Status</Text>
              {app.collaborationStatus === 'completed' ? (
                <Text style={[styles.reviewSuccessText, { marginTop: 4 }]}>
                  🎉 Collaboration marked complete.
                </Text>
              ) : app.postLink ? (
                <View style={{ marginTop: 6 }}>
                  <Text style={styles.reviewWarningText}>
                    ⏱ Deliverables submitted! Review and mark complete to release payout.
                  </Text>
                  <TouchableOpacity
                    style={[styles.completeCollabBtn, { marginTop: 8 }]}
                    onPress={() => completeCollabMutation.mutate(app.id)}
                    disabled={completeCollabMutation.isPending}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.completeCollabBtnText}>
                      {completeCollabMutation.isPending ? 'Completing...' : 'Mark Collaboration Complete'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.reviewDescText}>Awaiting link submission to mark complete.</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.creamLite,
  },
  errorText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Colors.roseDeep,
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: Colors.oxblood,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: Colors.cream,
    fontWeight: '700',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(63, 3, 11, 0.05)',
    backgroundColor: Colors.creamLite,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.oxblood,
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  influencerMetaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    marginBottom: 16,
  },
  influencerName: {
    fontFamily: FontFamily.sans,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },
  influencerHandle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: 'rgba(63, 3, 11, 0.45)',
    marginTop: 2,
  },
  collabReviewPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.06)',
  },
  reviewStep: {
    flexDirection: 'row',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.06)',
  },
  reviewStepLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: Colors.rose,
  },
  stepCircleDone: {
    backgroundColor: Colors.green,
  },
  stepCirclePending: {
    backgroundColor: '#e67e22',
  },
  stepCircleText: {
    fontFamily: FontFamily.sansMedium,
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: 'rgba(63,3,11,0.05)',
    marginTop: 4,
    marginBottom: -14,
  },
  reviewStepContent: {
    flex: 1,
  },
  reviewStepTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
  },
  reviewSuccessText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.green,
  },
  reviewWarningText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: '#e67e22',
  },
  reviewDescText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
    color: 'rgba(63,3,11,0.5)',
    marginTop: 4,
  },
  reviewLinkText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.roseDeep,
    textDecorationLine: 'underline',
  },
  reviewActionBtn: {
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewActionBtnText: {
    fontFamily: FontFamily.sansMedium,
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  completeCollabBtn: {
    backgroundColor: Colors.green,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeCollabBtnText: {
    fontFamily: FontFamily.sansMedium,
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
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
    marginTop: 6,
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
  watermarkedPlayerContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 8,
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
  videoPlayOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 20,
  },
  feedbackContainer: {
    backgroundColor: 'rgba(63,3,11,0.03)',
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
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
  reviewWidgetCard: {
    backgroundColor: 'rgba(63,3,11,0.02)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.06)',
    marginTop: 8,
    width: '100%',
  },
  feedbackTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  cancelText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: 'rgba(63,3,11,0.5)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(63,3,11,0.04)',
    borderRadius: 6,
    padding: 2,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 5,
    alignItems: 'center',
    borderRadius: 4,
  },
  tabActive: {
    backgroundColor: '#ffffff',
  },
  tabBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: 'rgba(63,3,11,0.5)',
  },
  tabActiveText: {
    color: Colors.oxblood,
    fontWeight: '700',
  },
  reviewTextInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    borderRadius: 8,
    padding: 8,
    fontSize: 12.5,
    fontFamily: FontFamily.sansMedium,
    color: Colors.ink,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  miniRecorderContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnRecording: {
    backgroundColor: Colors.roseDeep,
  },
  stopMicIcon: {
    width: 12,
    height: 12,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  micStatusText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: 'rgba(63,3,11,0.6)',
    marginTop: 4,
  },
  miniPlaybackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(63,3,11,0.03)',
    borderRadius: 8,
    padding: 6,
    paddingHorizontal: 10,
    width: '100%',
  },
  miniPlayBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDurationText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Colors.ink,
    flex: 1,
  },
  miniTrashBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(63,3,11,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitFeedbackBtn: {
    borderRadius: 8,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitFeedbackBtnText: {
    fontFamily: FontFamily.sansMedium,
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
