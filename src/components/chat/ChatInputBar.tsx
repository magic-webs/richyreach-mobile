import { ReactNode } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Navigation03Icon } from '@hugeicons/core-free-icons';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { formatDuration } from '@/lib/formatDuration';
import { useVoiceRecorder } from '@/hooks/chat/useVoiceRecorder';

interface ChatInputBarProps {
  text: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isSending: boolean;
  onSendVoiceNote: (uri: string, durationSec: number) => void;
  isSendingVoiceNote: boolean;
  attachSlot?: ReactNode;
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

export function ChatInputBar({ text, onChangeText, onSend, isSending, onSendVoiceNote, isSendingVoiceNote, attachSlot }: ChatInputBarProps) {
  const recorder = useVoiceRecorder();

  const handleSendVoice = () => {
    if (!recorder.recordedUri) return;
    const durationSec = recorder.durationMillis / 1000;
    const uri = recorder.recordedUri;
    recorder.discardRecordedNote();
    onSendVoiceNote(uri, durationSec);
  };

  return (
    <View style={styles.inputBar}>
      {Platform.OS !== 'web' ? (
        <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={StyleSheet.absoluteFill} />
      )}
      {attachSlot}

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
  );
}

const styles = StyleSheet.create({
  inputBar: {
    flexShrink: 0,
    paddingHorizontal: 14,
    paddingTop: 8,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.7)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(63,3,11,0.08)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 9,
    overflow: 'hidden',
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
});
