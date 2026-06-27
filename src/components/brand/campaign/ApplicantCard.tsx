import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { Image } from 'expo-image';
import React, { useState, useEffect, useRef } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator, Pressable, Platform } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
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

interface CollabReviewPanelProps {
  app: any;
  onReviewScript: (appId: string, status: 'approved' | 'rejected') => void;
  onCompleteCollab: (appId: string) => void;
  reviewScriptPending: boolean;
  completeCollabPending: boolean;
}

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
      {/* Protected Draft Badge */}
      <View style={styles.protectedBadge}>
        <Icon name="lock" size={10} color="#fff" />
        <Text style={styles.protectedBadgeText}>PROTECTED PREVIEW</Text>
      </View>
      {/* Repeated semi-transparent watermark overlays */}
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
      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <View style={styles.videoPlayOverlay}>
          <Icon name="play" size={24} color="#ffffff" />
        </View>
      )}
    </Pressable>
  );
}

function VideoReviewWidget({ app, onReviewComplete }: { app: any, onReviewComplete: () => void }) {
  const queryClient = useQueryClient();
  const showModal = useUIStore((s) => s.showModal);

  const [mode, setMode] = useState<'none' | 'text' | 'voice'>('none');
  const [textFeedback, setTextFeedback] = useState('');
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  // Audio Recorder
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 250);

  // Audio Player
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

  // Mutation
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
      // mode is text
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

function CollabReviewPanel({
  app,
  onReviewScript,
  onCompleteCollab,
  reviewScriptPending,
  completeCollabPending,
}: CollabReviewPanelProps) {
  return (
    <View style={styles.collabReviewPanel}>
      <View style={styles.collabReviewHeader}>
        <Text style={styles.collabReviewTitle}>Collaboration Progress</Text>
      </View>

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
                  onPress={() => onReviewScript(app.id, 'rejected')}
                  disabled={reviewScriptPending}
                  activeOpacity={0.8}
                >
                  <Text style={styles.reviewActionBtnText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.reviewActionBtn, { backgroundColor: '#2ecc71' }]}
                  onPress={() => onReviewScript(app.id, 'approved')}
                  disabled={reviewScriptPending}
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

      {/* Step 2: Instagram Handle */}
      <View style={styles.reviewStep}>
        <View style={styles.reviewStepLeft}>
          <View
            style={[
              styles.stepCircle,
              app.igHandle ? styles.stepCircleDone : styles.stepCircleActive,
            ]}
          >
            {app.igHandle ? (
              <Icon name="check" size={10} color="#fff" />
            ) : (
              <Text style={styles.stepCircleText}>2</Text>
            )}
          </View>
          <View style={styles.stepLine} />
        </View>
        <View style={styles.reviewStepContent}>
          <Text style={styles.reviewStepTitle}>Creator Instagram Handle</Text>
          {app.igHandle ? (
            <Text style={styles.reviewConnectedText}>Linked Handle: @{app.igHandle}</Text>
          ) : (
            <Text style={styles.reviewDescText}>
              Awaiting Instagram handle linkage from creator.
            </Text>
          )}
        </View>
      </View>

      {/* Step 3: Video Draft Review */}
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
              <Text style={styles.stepCircleText}>3</Text>
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
                onReviewComplete={() => {}}
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

      {/* Step 4: Live Post Link */}
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
              <Text style={styles.stepCircleText}>4</Text>
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

      {/* Step 5: Completion */}
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
              <Text style={styles.stepCircleText}>5</Text>
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
                onPress={() => onCompleteCollab(app.id)}
                disabled={completeCollabPending}
                activeOpacity={0.8}
              >
                <Text style={styles.completeCollabBtnText}>
                  {completeCollabPending ? 'Completing...' : 'Mark Collaboration Complete'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.reviewDescText}>Awaiting link submission to mark complete.</Text>
          )}
        </View>
      </View>
    </View>
  );
}

interface ApplicantCardProps {
  app: any;
  expandedCollabAppId: string | null;
  onToggleCollab: (id: string) => void;
  onAccept: (app: any) => void;
  onReject: (app: any) => void;
  onNegotiate: (app: any) => void;
  onReviewScript: (appId: string, status: 'approved' | 'rejected') => void;
  onCompleteCollab: (appId: string) => void;
  reviewScriptPending: boolean;
  completeCollabPending: boolean;
}

export function ApplicantCard({
  app,
  expandedCollabAppId,
  onToggleCollab,
  onAccept,
  onReject,
  onNegotiate,
  onReviewScript,
  onCompleteCollab,
  reviewScriptPending,
  completeCollabPending,
}: ApplicantCardProps) {
  const isPending = app.status === 'pending';
  const isAccepted = app.status === 'accepted';
  const isRejected = app.status === 'rejected';
  const isNegotiating = app.status === 'negotiating';
  const brandNeedsToRespond =
    isPending || (isNegotiating && app.lastActionBy === 'influencer');

  let followersStr = String(app.followers || '0');
  const followersNum = Number(app.followers || 0);
  if (followersNum >= 1000000) followersStr = `${(followersNum / 1000000).toFixed(1)}M`;
  else if (followersNum >= 1000) followersStr = `${(followersNum / 1000).toFixed(0)}k`;

  return (
    <View style={styles.applicantCard}>
      {/* Header */}
      <View style={styles.applicantHeader}>
        {app.avatar ? (
          <Image source={{ uri: app.avatar }} style={styles.applicantAvatar} />
        ) : (
          <PlaceholderImage tone="rose" height={40} width={40} borderRadius={20} />
        )}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.applicantName}>{app.name || app.instagramHandle}</Text>
          <Text style={styles.applicantHandle}>@{app.instagramHandle}</Text>
        </View>
        <View style={styles.applicantMeta}>
          <Text style={styles.applicantMetaVal}>{followersStr}</Text>
          <Text style={styles.applicantMetaLabel}>Followers</Text>
        </View>
        <View style={[styles.applicantMeta, { marginLeft: 12 }]}>
          <Text style={styles.applicantMetaVal}>{app.engagementRate || '4.5'}%</Text>
          <Text style={styles.applicantMetaLabel}>Eng. Rate</Text>
        </View>
      </View>

      {/* Bid */}
      <View style={styles.bidContainer}>
        <View style={styles.bidItem}>
          <Text style={styles.bidLabel}>Bid Price:</Text>
          <Text style={styles.bidText}>₹{((app.bidAmount || 0) / 100).toLocaleString()}</Text>
        </View>
        {app.counterAmount && app.counterAmount > 0 && (
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              Countered: ₹{((app.counterAmount || 0) / 100).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {/* Proposal */}
      <View style={styles.proposalContainer}>
        <Text style={styles.proposalLabel}>Proposal:</Text>
        <Text style={styles.proposalText}>"{app.proposal}"</Text>
      </View>

      {/* Actions */}
      <View style={styles.applicantActions}>
        {brandNeedsToRespond ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.rejectApplicantBtn}
              activeOpacity={0.8}
              onPress={() => onReject(app)}
            >
              <Text style={styles.rejectApplicantBtnText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.negotiateApplicantBtn}
              activeOpacity={0.8}
              onPress={() => onNegotiate(app)}
            >
              <Text style={styles.negotiateApplicantBtnText}>Negotiate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptApplicantBtn}
              activeOpacity={0.8}
              onPress={() => onAccept(app)}
            >
              <Icon name="check" size={14} color={Colors.white} />
              <Text style={styles.acceptApplicantBtnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flexDirection: 'column', width: '100%', gap: 10, marginTop: 10 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <View
                style={[
                  styles.statusBadge,
                  isAccepted && styles.statusAccepted,
                  isRejected && styles.statusDeclined,
                  isNegotiating && { backgroundColor: 'rgba(180, 106, 116, 0.12)' },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    isAccepted && styles.statusAcceptedText,
                    isRejected && styles.statusDeclinedText,
                    isNegotiating && { color: Colors.roseDeep },
                  ]}
                >
                  {isAccepted
                    ? 'Accepted ✓'
                    : isRejected
                      ? 'Declined ✕'
                      : `Countered: ₹${((app.counterAmount || 0) / 100).toLocaleString()} (Awaiting Creator)`}
                </Text>
              </View>

              {isAccepted && (
                <TouchableOpacity
                  style={styles.reviewCollabBtn}
                  onPress={() => onToggleCollab(app.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.reviewCollabBtnText}>
                    {expandedCollabAppId === app.id ? 'Hide Progress' : 'Review Progress'}
                  </Text>
                  <Icon
                    name={expandedCollabAppId === app.id ? 'chevDown' : 'chevron'}
                    size={14}
                    color={Colors.oxblood}
                  />
                </TouchableOpacity>
              )}
            </View>

            {isAccepted && expandedCollabAppId === app.id && (
              <CollabReviewPanel
                app={app}
                onReviewScript={onReviewScript}
                onCompleteCollab={onCompleteCollab}
                reviewScriptPending={reviewScriptPending}
                completeCollabPending={completeCollabPending}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  applicantCard: {
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.06)',
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  applicantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  applicantName: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
  },
  applicantHandle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.45)',
  },
  applicantMeta: {
    alignItems: 'flex-end',
  },
  applicantMetaVal: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    fontWeight: '800',
    color: Colors.roseDeep,
  },
  applicantMetaLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 9,
    color: 'rgba(63, 3, 11, 0.45)',
  },
  bidContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  bidItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bidLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: 'rgba(63, 3, 11, 0.55)',
  },
  bidText: {
    fontFamily: FontFamily.sans,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  counterBadge: {
    backgroundColor: 'rgba(180, 106, 116, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  counterText: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.roseDeep,
  },
  proposalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.05)',
    marginBottom: 12,
  },
  proposalLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Colors.rose,
    fontWeight: '700',
    marginBottom: 2,
  },
  proposalText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(42, 2, 7, 0.75)',
    fontStyle: 'italic',
  },
  applicantActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  acceptApplicantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.oxblood,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptApplicantBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.cream,
    fontWeight: '700',
  },
  rejectApplicantBtn: {
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectApplicantBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: 'rgba(63, 3, 11, 0.6)',
    fontWeight: '700',
  },
  negotiateApplicantBtn: {
    backgroundColor: Colors.rose,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  negotiateApplicantBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.white,
    fontWeight: '700',
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  statusAccepted: {
    backgroundColor: 'rgba(62,201,122,0.12)',
  },
  statusAcceptedText: {
    color: '#279a55',
  },
  statusDeclined: {
    backgroundColor: 'rgba(235,94,85,0.12)',
  },
  statusDeclinedText: {
    color: '#d93e36',
  },
  reviewCollabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.oxblood,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  reviewCollabBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Colors.oxblood,
    fontWeight: '700',
  },

  // Collab review panel
  collabReviewPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(63,3,11,0.06)',
    marginTop: 10,
  },
  collabReviewHeader: {
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.06)',
    paddingBottom: 6,
  },
  collabReviewTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  reviewStep: {
    flexDirection: 'row',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.05)',
  },
  reviewStepLeft: {
    alignItems: 'center',
    marginRight: 10,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
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
    fontSize: 11,
    fontWeight: '700',
  },
  stepLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: 'rgba(63,3,11,0.05)',
    marginTop: 4,
    marginBottom: -10,
  },
  reviewStepContent: {
    flex: 1,
  },
  reviewStepTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  reviewSuccessText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.green,
  },
  reviewWarningText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: '#e67e22',
  },
  reviewConnectedText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.ink,
    marginTop: 4,
  },
  reviewDescText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: 'rgba(63,3,11,0.5)',
    marginTop: 4,
  },
  reviewLinkText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.roseDeep,
    textDecorationLine: 'underline',
  },
  reviewActionBtn: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewActionBtnText: {
    fontFamily: FontFamily.sansMedium,
    color: '#fff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  completeCollabBtn: {
    backgroundColor: Colors.green,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeCollabBtnText: {
    fontFamily: FontFamily.sansMedium,
    color: '#fff',
    fontSize: 12,
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
    height: 200,
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

  // Feedback container
  feedbackContainer: {
    backgroundColor: 'rgba(63,3,11,0.03)',
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

  // Brand review widget card
  reviewWidgetCard: {
    backgroundColor: 'rgba(63,3,11,0.02)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.06)',
    marginTop: 6,
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
