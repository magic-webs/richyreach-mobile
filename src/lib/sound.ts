import { createAudioPlayer } from 'expo-audio';

const sounds = {
  notification: require('../../assets/sounds/main_notification.wav'),
  coinCredit: require('../../assets/sounds/coin-credit.wav'),
  error: require('../../assets/sounds/error.wav'),
  messageSent: require('../../assets/sounds/message-sent.mp3'),
};

// Reuse player instances to optimize memory and performance
const players: Record<string, any> = {};

/**
 * Play a registered app sound effect.
 */
export function playSound(key: keyof typeof sounds) {
  try {
    let player = players[key];
    if (!player) {
      player = createAudioPlayer(sounds[key]);
      players[key] = player;
    }

    // Rewind to start and play
    player.seekTo(0);
    player.play();
  } catch (err) {
    console.warn(`[sound] Failed to play sound effect "${key}":`, err);
  }
}
