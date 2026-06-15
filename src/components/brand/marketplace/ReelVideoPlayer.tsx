import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Icon } from '@/components/ui/icon';

interface ReelVideoPlayerProps {
  videoUrl: string;
  isPlaying: boolean;
  height: number;
}

export function ReelVideoPlayer({ videoUrl, isPlaying, height }: ReelVideoPlayerProps) {
  const [muted, setMuted] = useState(false);

  // Initialize expo-video player
  const player = useVideoPlayer(videoUrl, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.muted = muted;
    if (isPlaying) {
      playerInstance.play();
    }
  });

  // Watch isPlaying changes to play/pause the video
  useEffect(() => {
    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
    return () => {
      player.pause();
    };
  }, [isPlaying, player]);

  // Sync player muted state if state changes
  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  const toggleMuted = () => {
    setMuted(!muted);
  };

  return (
    <Pressable onPress={toggleMuted} style={[styles.container, { height }]}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
      {/* Floating Mute/Unmute Indicator */}
      <View style={styles.muteBtn}>
        <Icon name={muted ? 'mute' : 'volume'} size={15} color="#ffffff" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#000000',
  },
  muteBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
});
