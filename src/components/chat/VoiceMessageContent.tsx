import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily } from '@/constants/brand';
import { formatDuration } from '@/lib/formatDuration';

interface VoiceMessageContentProps {
  url: string;
  durationSec: number;
  isMe: boolean;
}

export function VoiceMessageContent({ url, durationSec, isMe }: VoiceMessageContentProps) {
  const player = useAudioPlayer(url);
  const playerStatus = useAudioPlayerStatus(player);

  const handlePlayPause = () => {
    if (playerStatus.playing) {
      player.pause();
    } else {
      if (playerStatus.didJustFinish || playerStatus.currentTime >= (playerStatus.duration ?? 0)) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.playBtn, isMe && styles.playBtnMe]}
        onPress={handlePlayPause}
        activeOpacity={0.8}
      >
        <Icon name={playerStatus.playing ? 'pause' : 'play'} size={16} color={isMe ? '#ffffff' : Colors.oxblood} />
      </TouchableOpacity>
      <Text style={[styles.durationText, isMe && styles.durationTextMe]}>
        {playerStatus.playing
          ? `${formatDuration(playerStatus.currentTime)} / ${formatDuration(playerStatus.duration ?? durationSec)}`
          : `Voice note · ${formatDuration(durationSec)}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 160, paddingVertical: 2 },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(63,3,11,0.06)',
  },
  playBtnMe: { backgroundColor: 'rgba(255,255,255,0.2)' },
  durationText: { fontSize: 13, fontFamily: FontFamily.sansMedium, color: Colors.ink },
  durationTextMe: { color: '#ffffff' },
});
