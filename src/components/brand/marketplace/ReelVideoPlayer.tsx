import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, AppState, AppStateStatus, Platform } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Icon } from '@/components/ui/icon';
import { useIsFocused } from 'expo-router';

// Module-level cache to persist the user's mute/unmute preference across item swiping/unmounting
let isGlobalMuted = false;

interface ReelVideoPlayerProps {
  videoUrl: string;
  isPlaying: boolean;
  height: number;
}

export function ReelVideoPlayer({ videoUrl, isPlaying, height }: ReelVideoPlayerProps) {
  const [muted, setMuted] = useState(isGlobalMuted);
  const [userPaused, setUserPaused] = useState(false);
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState(AppState.currentState);

  // Reset pause state when video or visibility changes
  useEffect(() => {
    setUserPaused(false);
  }, [videoUrl, isPlaying]);

  // Sync appState (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  // Initialize expo-video player
  const player = useVideoPlayer(videoUrl, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.muted = muted;
  });

  const shouldPlay = isPlaying && isFocused && appState === 'active' && !userPaused;

  // Watch shouldPlay changes to play/pause the video
  useEffect(() => {
    if (shouldPlay) {
      try {
        player.play();
      } catch (e) {
        // Safe catch for native video player play attempts
      }
    } else {
      try {
        player.pause();
      } catch (e) {
        // Safe catch for cases where player is already released
      }
    }
  }, [shouldPlay, player]);

  // Sync player muted state if state changes
  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  const togglePlayPause = () => {
    setUserPaused(!userPaused);
  };

  const toggleMuted = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    isGlobalMuted = nextMuted;
  };

  return (
    <Pressable onPress={togglePlayPause} style={[styles.container, { height }]}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
      {/* Floating Mute/Unmute Indicator */}
      <Pressable onPress={toggleMuted} style={styles.muteBtn}>
        <Icon name={muted ? 'mute' : 'volume'} size={15} color="#ffffff" />
      </Pressable>
      {/* Centered Play Button when Paused */}
      {userPaused && (
        <View style={styles.playOverlay}>
          <Icon name="play" size={20} color="#ffffff" />
        </View>
      )}
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
    zIndex: 15,
  },
  playOverlay: {
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
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 10,
  },
});
