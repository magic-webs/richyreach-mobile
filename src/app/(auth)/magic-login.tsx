import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { deleteToken, saveToken, setOnboardingSeen } from '@/lib/storage';
import { useAuthStore } from '@/store/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MagicLoginScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const setRole = useAuthStore((s) => s.setRole);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No login token was provided in the link.');
      return;
    }

    const performLogin = async () => {
      try {
        // Step 1: Temporarily save the token
        await saveToken(token);

        // Step 2: Fetch user session details from backend using the token
        const data = await api.auth.session() as any;

        if (data && data.user) {
          // Mark onboarding as seen so the user is not forced back to onboarding page
          await setOnboardingSeen();
          useAuthStore.setState({ onboardingSeen: true });

          // Step 3: Complete login by setting the active session & role
          await setSession({ user: data.user, token });
          setRole(data.user.role);

          setStatus('success');

          // Delay redirect slightly to show success checkmark micro-animation
          setTimeout(() => {
            if (data.user.role === 'brand') {
              router.replace('/brand');
            } else {
              router.replace('/(tabs)');
            }
          }, 1500);
        } else {
          throw new Error('Invalid session response from server.');
        }
      } catch (err: any) {
        console.error('Magic login authentication failed:', err);
        await deleteToken();
        setStatus('error');
        setErrorMessage(err?.message || 'Verification failed. The link may have expired or is invalid.');
      }
    };

    performLogin();
  }, [token]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.cream, 'rgba(244, 236, 228, 0.95)']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.card, Shadow.card]}>
        {status === 'loading' && (
          <View style={styles.content}>
            <ActivityIndicator size="large" color={Colors.oxblood} style={styles.spinner} />
            <Text style={styles.title}>Securing Your Entry</Text>
            <Text style={styles.subtitle}>Verifying your single sign-in link...</Text>
          </View>
        )}

        {status === 'success' && (
          <View style={styles.content}>
            <View style={styles.iconContainerSuccess}>
              <Icon name="check" size={32} color={Colors.cream} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Authentication successful. Logging you in...</Text>
          </View>
        )}

        {status === 'error' && (
          <View style={styles.content}>
            <View style={styles.iconContainerError}>
              <Icon name="x" size={32} color={Colors.cream} />
            </View>
            <Text style={styles.title}>Login Failed</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>

            <TouchableOpacity
              onPress={() => router.replace('/(auth)')}
              style={[styles.button, Shadow.button]}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[Colors.oxblood, Colors.oxbloodDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Back to Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: Radius.xl,
    padding: 32,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  spinner: {
    marginBottom: 24,
  },
  iconContainerSuccess: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981', // Emerald green
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconContainerError: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444', // Red
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 24,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Colors.rose,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    width: '100%',
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: FontFamily.sans,
    fontSize: 15,
    color: Colors.cream,
    letterSpacing: 0.5,
  },
});
