export const triggerTabHaptic = () => {
  // Web fallback (e.g., navigator.vibrate if supported by the browser)
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(10);
    } catch (_) {}
  }
};
