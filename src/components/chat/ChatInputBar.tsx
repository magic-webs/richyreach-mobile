import { ReactNode } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Image } from 'expo-image';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Navigation03Icon } from '@hugeicons/core-free-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { formatDuration } from '@/lib/formatDuration';
import { useVoiceRecorder } from '@/hooks/chat/useVoiceRecorder';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ChatMessage } from '@/types/chat';

interface ChatInputBarProps {
  text: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isSending: boolean;
  onSendVoiceNote: (uri: string, durationSec: number) => void;
  isSendingVoiceNote: boolean;
  attachSlot?: ReactNode;
  onSendMedia?: (uri: string, type: 'image' | 'video') => void;
  replyingTo?: ChatMessage | null;
  onCancelReply?: () => void;
}

function ReviewRow({
  recordedUri,
  durationMillis,
  isSendingVoiceNote,
  onDiscard,
  onSend,
}: {
  recordedUri: string;
  durationMillis: number;
  isSendingVoiceNote: boolean;
  onDiscard: () => void;
  onSend: () => void;
}) {
  const player = useAudioPlayer(recordedUri);
  const playerStatus = useAudioPlayerStatus(player);

  const handlePlayPause = () => {
    if (playerStatus.playing) {
      player.pause();
    } else {
      if (playerStatus.currentTime >= (playerStatus.duration ?? 0)) player.seekTo(0);
      player.play();
    }
  };

  return (
    <View style={styles.inputWrap}>
      <TouchableOpacity style={styles.reviewPlayBtn} onPress={handlePlayPause} activeOpacity={0.8}>
        <Icon name={playerStatus.playing ? 'pause' : 'play'} size={18} color={Colors.oxblood} />
      </TouchableOpacity>
      <Text style={styles.reviewDurationText}>{formatDuration(durationMillis / 1000)}</Text>
      <TouchableOpacity style={styles.iconBtn} onPress={onDiscard} activeOpacity={0.8} disabled={isSendingVoiceNote}>
        <Icon name="trash" size={18} color={Colors.roseDeep} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onSend} activeOpacity={0.85} disabled={isSendingVoiceNote}>
        <GradientView variant="rose" style={styles.sendBtn}>
          {isSendingVoiceNote ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <HugeiconsIcon icon={Navigation03Icon} size={18} color="#ffffff" strokeWidth={2.5} />
          )}
        </GradientView>
      </TouchableOpacity>
    </View>
  );
}

export function ChatInputBar({
  text,
  onChangeText,
  onSend,
  isSending,
  onSendVoiceNote,
  isSendingVoiceNote,
  attachSlot,
  onSendMedia,
  replyingTo,
  onCancelReply,
}: ChatInputBarProps) {
  const recorder = useVoiceRecorder();
  const insets = useSafeAreaInsets();

  const handleSendVoice = () => {
    if (!recorder.recordedUri) return;
    const durationSec = recorder.durationMillis / 1000;
    const uri = recorder.recordedUri;
    recorder.discardRecordedNote();
    onSendVoiceNote(uri, durationSec);
  };

  const handlePickMedia = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alert('Permission to access photo library is required to attach images or videos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        quality: 0.85,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const type = asset.type === 'video' ? 'video' : 'image';
        if (onSendMedia) {
          onSendMedia(asset.uri, type);
        }
      }
    } catch (err) {
      console.error('[ChatInputBar] Error picking media:', err);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === 'web' ? 12 : Math.max(insets.bottom, 12) }]}>
      {Platform.OS !== 'web' ? (
        <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={StyleSheet.absoluteFill} />
      )}

      {/* Reply Quote Preview Bar */}
      {replyingTo && (
        <View style={styles.replyPreviewBar}>
          <View style={styles.replyPreviewIndicator} />
          <View style={styles.replyPreviewTextContainer}>
            <Text style={styles.replyPreviewSender}>{replyingTo.senderName}</Text>
            <Text numberOfLines={1} style={styles.replyPreviewContent}>
              {replyingTo.attachmentType === 'audio'
                ? '🎤 Voice note'
                : replyingTo.attachmentType === 'image'
                ? '📷 Photo'
                : replyingTo.attachmentType === 'video'
                ? '🎥 Video'
                : replyingTo.content}
            </Text>
          </View>
          {(replyingTo.attachmentType === 'image' || replyingTo.attachmentType === 'video') && replyingTo.attachmentUrl && (
            <Image source={{ uri: replyingTo.attachmentUrl }} style={styles.replyPreviewThumbnail} contentFit="cover" />
          )}
          <TouchableOpacity style={styles.replyPreviewCancelBtn} onPress={onCancelReply}>
            <Icon name="x" size={16} color="rgba(63,3,11,0.5)" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputRow}>
        {attachSlot}

        {!recorder.recordedUri && recorder.phase !== 'recording' && (
          <TouchableOpacity onPress={handlePickMedia} activeOpacity={0.8} style={styles.mediaBtn}>
            <Icon name="attach" size={18} color={Colors.oxblood} />
          </TouchableOpacity>
        )}

        {recorder.phase === 'recording' ? (
          <View style={styles.inputWrap}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingDurationText}>{formatDuration(recorder.durationMillis / 1000)}</Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.iconBtn} onPress={recorder.cancelRecording} activeOpacity={0.8}>
              <Icon name="trash" size={18} color={Colors.roseDeep} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.stopBtn} onPress={recorder.stopRecording} activeOpacity={0.8}>
              <Icon name="check" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ) : recorder.phase === 'stopped' && recorder.recordedUri ? (
          <ReviewRow
            recordedUri={recorder.recordedUri}
            durationMillis={recorder.durationMillis}
            isSendingVoiceNote={isSendingVoiceNote}
            onDiscard={recorder.discardRecordedNote}
            onSend={handleSendVoice}
          />
        ) : (
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={onChangeText}
              placeholder={recorder.permissionDenied ? 'Microphone access is needed for voice notes' : 'Message…'}
              placeholderTextColor="rgba(63,3,11,0.4)"
              multiline
              returnKeyType="next"
              onSubmitEditing={onSend}
              editable={!isSending}
            />
            {text.trim().length > 0 ? (
              <TouchableOpacity onPress={onSend} activeOpacity={0.85} disabled={isSending}>
                <GradientView variant="rose" style={styles.sendBtn}>
                  {isSending ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <HugeiconsIcon icon={Navigation03Icon} size={18} color="#ffffff" strokeWidth={2.5} />
                  )}
                </GradientView>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={recorder.startRecording} activeOpacity={0.85} style={styles.micBtn}>
                <Icon name="mic" size={18} color={Colors.oxblood} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
    paddingHorizontal: 14,
    paddingTop: 8,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.7)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(63,3,11,0.08)',
    flexDirection: 'column',
    gap: 8,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 9,
    width: '100%',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingTop: 6,
    paddingBottom: 6,
    ...Shadow.card,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.06)',
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 8,
    textAlignVertical: 'center',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  micBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: 'rgba(63,3,11,0.05)' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stopBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: Colors.oxblood },
  recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.rose },
  recordingDurationText: { marginLeft: 8, fontSize: 14, fontFamily: FontFamily.sansMedium, color: Colors.ink },
  reviewPlayBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(63,3,11,0.06)' },
  reviewDurationText: { flex: 1, marginLeft: 10, fontSize: 14, fontFamily: FontFamily.sansMedium, color: Colors.ink },

  mediaBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: 'rgba(63,3,11,0.05)' },
  replyPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(63,3,11,0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.rose,
    marginBottom: 4,
  },
  replyPreviewTextContainer: { flex: 1, marginLeft: 8 },
  replyPreviewSender: { fontSize: 12, fontFamily: FontFamily.sans, color: Colors.oxblood },
  replyPreviewContent: { fontSize: 12, fontFamily: FontFamily.sansMedium, color: 'rgba(63,3,11,0.6)', marginTop: 2 },
  replyPreviewCancelBtn: { padding: 4 },
  replyPreviewIndicator: {
    width: 3,
    backgroundColor: Colors.rose,
    height: '100%',
    borderRadius: 1.5,
  },
  replyPreviewThumbnail: {
    width: 36,
    height: 36,
    borderRadius: 4,
    marginLeft: 8,
    marginRight: 4,
  },
});
