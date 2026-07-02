import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily } from '@/constants/brand';
import { useCampaignWizardStore } from '@/store/campaignWizard';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDuration } from '@/lib/formatDuration';

export function VoiceNoteRecorder() {
  const { audioInstructionUri, updateField } = useCampaignWizardStore();

  // Recorder
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 250);

  // Player (only loads when we have a URI)
  const player = useAudioPlayer(audioInstructionUri ?? undefined);
  const playerStatus = useAudioPlayerStatus(player);

  // Request mic permission & set audio mode on mount
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
      updateField('audioInstructionUri', audioRecorder.uri);
    }
  };

  const handlePlayPause = () => {
    if (playerStatus.playing) {
      player.pause();
    } else {
      player.seekTo(0);
      player.play();
    }
  };

  const deleteRecording = () => {
    player.pause();
    updateField('audioInstructionUri', null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Voice Note Instructions</Text>
      <Text style={styles.headerSubtitle}>Record detailed verbal instructions for creators</Text>

      <View style={styles.recorderCard}>
        {!audioInstructionUri ? (
          /* --- Record State --- */
          <View style={styles.recordActionArea}>
            <TouchableOpacity
              style={[styles.recordBtn, recorderState.isRecording && styles.recordingBtnActive]}
              onPress={recorderState.isRecording ? stopRecording : startRecording}
              activeOpacity={0.8}
            >
              {recorderState.isRecording ? (
                <View style={styles.stopIcon} />
              ) : (
                <Icon name="mic" size={24} color="#ffffff" />
              )}
            </TouchableOpacity>
            <Text style={styles.recordStatusText}>
              {recorderState.isRecording
                ? `Recording… ${formatDuration(recorderState.durationMillis / 1000)}`
                : 'Tap to start recording'}
            </Text>
          </View>
        ) : (
          /* --- Playback State --- */
          <View style={styles.playbackArea}>
            <View style={styles.playbackControls}>
              <TouchableOpacity style={styles.playBtn} onPress={handlePlayPause} activeOpacity={0.8}>
                <Icon name={playerStatus.playing ? 'pause' : 'play'} size={20} color={Colors.oxblood} />
              </TouchableOpacity>

              <View style={styles.waveformContainer}>
                <Text style={styles.durationText}>
                  {playerStatus.playing
                    ? `${formatDuration(playerStatus.currentTime)} / ${formatDuration(playerStatus.duration ?? 0)}`
                    : `Voice Note (${formatDuration(playerStatus.duration ?? 0)})`}
                </Text>
              </View>

              <TouchableOpacity style={styles.deleteBtn} onPress={deleteRecording} activeOpacity={0.8}>
                <Icon name="trash" size={18} color={Colors.roseDeep} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    marginBottom: 6,
  },
  headerTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 10.5,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: 'rgba(63,3,11,0.5)',
    marginBottom: 4,
  },
  recorderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  recordActionArea: {
    alignItems: 'center',
    gap: 12,
  },
  recordBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.oxblood,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  recordingBtnActive: {
    backgroundColor: Colors.roseDeep,
  },
  stopIcon: {
    width: 18,
    height: 18,
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  recordStatusText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  playbackArea: {
    width: '100%',
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(63,3,11,0.03)',
    borderRadius: 10,
    padding: 8,
    paddingHorizontal: 12,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(63,3,11,0.12)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  waveformContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  durationText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(63,3,11,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
