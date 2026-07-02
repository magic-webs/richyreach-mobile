import { useRef, useState } from 'react';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

export type VoiceRecorderPhase = 'idle' | 'recording' | 'stopped';

export function useVoiceRecorder() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 250);

  const [phase, setPhase] = useState<VoiceRecorderPhase>('idle');
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [frozenDurationMillis, setFrozenDurationMillis] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const permissionGrantedRef = useRef(false);

  const startRecording = async () => {
    if (!permissionGrantedRef.current) {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        setPermissionDenied(true);
        return;
      }
      permissionGrantedRef.current = true;
      setPermissionDenied(false);
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    }
    setRecordedUri(null);
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setPhase('recording');
  };

  const stopRecording = async () => {
    await audioRecorder.stop();
    setFrozenDurationMillis(recorderState.durationMillis);
    setRecordedUri(audioRecorder.uri ?? null);
    setPhase('stopped');
  };

  const cancelRecording = async () => {
    if (phase === 'recording') {
      await audioRecorder.stop();
    }
    setRecordedUri(null);
    setFrozenDurationMillis(0);
    setPhase('idle');
  };

  const discardRecordedNote = () => {
    setRecordedUri(null);
    setFrozenDurationMillis(0);
    setPhase('idle');
  };

  return {
    phase,
    durationMillis: phase === 'recording' ? recorderState.durationMillis : frozenDurationMillis,
    recordedUri,
    startRecording,
    stopRecording,
    cancelRecording,
    discardRecordedNote,
    permissionDenied,
  };
}
