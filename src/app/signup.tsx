import { Colors } from '@/constants/brand';
import { useAuthStore } from '@/store/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

/**
 * Landing route for referral links (https://app.richyreach.com/signup?ref=CODE).
 *
 * The link has to point somewhere the app can actually resolve, so this exists purely to
 * catch it and hand the code onward to the auth screen, which prefills the referral field.
 * Someone already signed in is sent home instead: a referral code only applies at signup,
 * and silently dropping them onto a login screen would be worse than ignoring it.
 */
export default function SignupRedirect() {
  const router = useRouter();
  const { ref } = useLocalSearchParams<{ ref?: string }>();
  const isLoggedIn = !!useAuthStore((s) => s.session);

  useEffect(() => {
    const code = typeof ref === 'string' ? ref.trim().toUpperCase() : '';

    if (isLoggedIn) {
      router.replace('/(tabs)');
      return;
    }

    router.replace(code ? { pathname: '/(auth)', params: { ref: code } } : '/(auth)');
  }, [ref, isLoggedIn, router]);

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={Colors.oxblood} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.creamLite,
  },
});
