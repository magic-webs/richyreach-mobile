import { Presets } from 'react-native-pulsar';

export const triggerTabHaptic = () => {
  try {
    Presets.boulder();
  } catch (err) {
    console.warn('Failed to play Pulsar haptic:', err);
  }
};
