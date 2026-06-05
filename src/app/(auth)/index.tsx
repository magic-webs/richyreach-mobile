import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, Gradients, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { Icon } from '@/components/ui/icon';

type Method = 'email' | 'whatsapp';

export default function AuthLanding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [identifier, setIdentifier] = useState('');
  const [method, setMethod] = useState<Method>('email');
  const [loading, setLoading] = useState(false);

  const isEmail = identifier.includes('@');

  const handleSendOtp = async () => {
    if (!identifier.trim() || identifier.trim().length < 3) {
      Alert.alert('Enter your email or phone number');
      return;
    }
    setLoading(true);
    try {
      await api.auth.requestOtp(identifier.trim(), method, 'login');
      router.push({ pathname: '/(auth)/verify', params: { identifier: identifier.trim(), method } });
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!identifier.trim() || identifier.trim().length < 3) {
      Alert.alert('Enter your email or phone number');
      return;
    }
    setLoading(true);
    try {
      await api.auth.requestOtp(identifier.trim(), method, 'signup');
      router.push({
        pathname: '/(auth)/verify',
        params: { identifier: identifier.trim(), method, mode: 'signup' },
      });
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Gradient background */}
      <LinearGradient
        colors={[Colors.oxbloodDeep, Colors.oxblood, Colors.oxblood2]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo area */}
          <View style={styles.logoArea}>
            <View style={styles.sealCircle}>
              <Text style={styles.sealText}>RR</Text>
            </View>
            <Text style={styles.wordmark}>
              Richy <Text style={styles.wordmarkItalic}>Reach</Text>
            </Text>
            <Text style={styles.tagline}>Where creators get Rich · Brands get Reach</Text>
          </View>

          {/* Auth card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSub}>Enter your email or phone to continue</Text>

            {/* Identifier input — tap anywhere in the row to focus */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
              style={styles.inputWrap}
            >
              <Icon name={isEmail ? 'send' : 'mic'} size={18} color={Colors.rose} />
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Email or phone number"
                placeholderTextColor="rgba(63,3,11,0.4)"
                value={identifier}
                onChangeText={setIdentifier}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </TouchableOpacity>

            {/* OTP method selector */}
            <Text style={styles.methodLabel}>Send OTP via</Text>
            <View style={styles.methodRow}>
              {(['email', 'whatsapp'] as Method[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMethod(m)}
                  activeOpacity={0.8}
                  style={[styles.methodBtn, method === m && styles.methodBtnActive]}
                >
                  <Icon
                    name={m === 'email' ? 'send' : 'chat'}
                    size={16}
                    color={method === m ? Colors.cream : Colors.oxblood}
                  />
                  <Text style={[styles.methodBtnText, method === m && styles.methodBtnTextActive]}>
                    {m === 'email' ? 'Email' : 'WhatsApp'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* CTA */}
            <TouchableOpacity
              onPress={handleSendOtp}
              activeOpacity={0.85}
              disabled={loading}
              style={styles.ctaBtn}
            >
              <LinearGradient
                colors={[Gradients.rose[0], Gradients.rose[1]]}
                style={styles.ctaBtnInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.ctaBtnText}>{loading ? 'Sending…' : 'Send OTP'}</Text>
                <Icon name="arrow" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.terms}>
              By continuing you agree to our{' '}
              <Text style={styles.termsLink}>Terms</Text>
              {' & '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>New to Richy Reach?</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign up CTA */}
          <TouchableOpacity
            onPress={handleSignUp}
            activeOpacity={0.8}
            disabled={loading}
            style={[styles.signupBtn, loading && { opacity: 0.6 }]}
          >
            <Text style={styles.signupBtnText}>Create an account →</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  kav: { flex: 1 },
  scroll: { paddingHorizontal: 20 },

  logoArea: { alignItems: 'center', paddingBottom: 36 },
  sealCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...Shadow.button,
    shadowColor: Colors.rose,
  },
  sealText: { fontFamily: FontFamily.serif, fontSize: 28, fontWeight: '700', color: Colors.cream },
  wordmark: { fontFamily: FontFamily.serif, fontSize: 32, fontWeight: '700', color: Colors.cream, letterSpacing: 0.5 },
  wordmarkItalic: { fontStyle: 'italic', fontWeight: '500' },
  tagline: {
    fontSize: 13,
    color: 'rgba(232,216,204,0.6)',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: FontFamily.sansMedium,
  },

  card: { backgroundColor: Colors.creamLite, borderRadius: 28, padding: 24, ...Shadow.tab },
  cardTitle: { fontFamily: FontFamily.serif, fontSize: 26, fontWeight: '700', color: Colors.ink, marginBottom: 4 },
  cardSub: {
    fontSize: 14,
    color: 'rgba(63,3,11,0.55)',
    marginBottom: 22,
    fontFamily: FontFamily.sansMedium,
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.1)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
    paddingVertical: 0,
  },

  methodLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(63,3,11,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  methodRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  methodBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: 'rgba(63,3,11,0.07)',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  methodBtnActive: { backgroundColor: Colors.oxblood, borderColor: Colors.oxblood },
  methodBtnText: { fontFamily: FontFamily.sans, fontSize: 13, fontWeight: '700', color: Colors.oxblood },
  methodBtnTextActive: { color: Colors.cream },

  ctaBtn: { borderRadius: 16, overflow: 'hidden', ...Shadow.button, shadowColor: Colors.roseDeep },
  ctaBtnInner: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaBtnText: { fontFamily: FontFamily.sans, fontSize: 16, fontWeight: '800', color: '#fff' },

  terms: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(63,3,11,0.45)',
    marginTop: 16,
    lineHeight: 18,
  },
  termsLink: { color: Colors.rose, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(232,216,204,0.25)' },
  dividerText: { fontSize: 13, color: 'rgba(232,216,204,0.55)', fontFamily: FontFamily.sansMedium },

  signupBtn: {
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(232,216,204,0.3)',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  signupBtnText: { fontFamily: FontFamily.sans, fontWeight: '700', fontSize: 14, color: Colors.cream },
});
