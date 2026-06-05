import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { useAuthStore } from '@/store/auth';
import { Icon } from '@/components/ui/icon';
import { RoleToggle } from '@/components/ui/role-toggle';

export default function VerifyOtp() {
  const { identifier, method, mode } = useLocalSearchParams<{
    identifier: string;
    method: string;
    mode?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setSession = useAuthStore((s) => s.setSession);
  const setRole = useAuthStore((s) => s.setRole);

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [role, setLocalRole] = useState<'creator' | 'brand'>('creator');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputs = useRef<(TextInput | null)[]>([]);
  const nameRef = useRef<TextInput>(null);

  React.useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (val: string, idx: number) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    let next = [...code];
    if (cleanVal.length > 1) {
      const pastedDigits = cleanVal.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        if (pastedDigits[i] !== undefined) {
          next[i] = pastedDigits[i];
        }
      }
      setCode(next);
      const focusIdx = Math.min(cleanVal.length - 1, 5);
      inputs.current[focusIdx]?.focus();
    } else {
      const digit = cleanVal.slice(-1);
      next[idx] = digit;
      setCode(next);
      if (digit && idx < 5) inputs.current[idx + 1]?.focus();
      if (!digit && idx > 0) inputs.current[idx - 1]?.focus();
    }

    const otp = next.join('');
    if (otp.length === 6) {
      setTimeout(() => {
        handleVerifyDirect(otp);
      }, 100);
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyDirect = async (otpValue: string) => {
    if (otpValue.length < 6) {
      Alert.alert('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const data = (await api.auth.verifyOtp(
        identifier,
        otpValue,
        role === 'creator' ? 'influencer' : 'brand',
        mode === 'signup' ? name : undefined,
      )) as any;
      await setSession({ user: data.user, token: data.token });
      if (data.user?.role) {
        setRole(data.user.role);
      } else {
        setRole(role === 'creator' ? 'influencer' : 'brand');
      }
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Invalid OTP', err.message ?? 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = () => {
    handleVerifyDirect(code.join(''));
  };

  const handleResend = async () => {
    try {
      await api.auth.requestOtp(identifier, method as 'email' | 'whatsapp', mode as any);
      setCountdown(30);
      Alert.alert('OTP resent!');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.root}>
      {/* Gradient background */}
      <LinearGradient
        colors={[Colors.oxbloodDeep, Colors.oxblood]}
        style={StyleSheet.absoluteFill}
      />

      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.back, { top: insets.top + 12 }]}
        activeOpacity={0.7}
      >
        <Icon name="back" size={22} color={Colors.cream} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sealCircle}>
            <Text style={styles.sealText}>RR</Text>
          </View>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.sub}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.identifierText}>{identifier}</Text>
          </Text>

          <View style={styles.card}>
            {/* Name input for signup */}
            {mode === 'signup' && (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => nameRef.current?.focus()}
                style={styles.inputWrap}
              >
                <Icon name="user" size={18} color={Colors.rose} />
                <TextInput
                  ref={nameRef}
                  style={styles.input}
                  placeholder="Your full name"
                  placeholderTextColor="rgba(63,3,11,0.4)"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => inputs.current[0]?.focus()}
                />
              </TouchableOpacity>
            )}

            {/* OTP boxes */}
            <View style={styles.otpRow}>
              {code.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(ref) => { inputs.current[i] = ref; }}
                  style={[styles.otpBox, !!digit && styles.otpBoxFilled]}
                  value={digit}
                  onChangeText={(v) => handleChange(v, i)}
                  onKeyPress={(e) => handleKeyPress(e, i)}
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                  textAlign="center"
                />
              ))}
            </View>

            {/* Role selector for signup */}
            {mode === 'signup' && (
              <View style={styles.roleSection}>
                <Text style={styles.roleLabel}>I am joining as a</Text>
                <RoleToggle role={role} onChange={setLocalRole} />
              </View>
            )}

            {/* Verify CTA */}
            <TouchableOpacity
              onPress={handleVerify}
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
                <Text style={styles.ctaBtnText}>{loading ? 'Verifying…' : 'Verify & Continue'}</Text>
                <Icon name="arrow" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend */}
            <TouchableOpacity
              onPress={handleResend}
              activeOpacity={0.7}
              disabled={countdown > 0}
              style={[styles.resendBtn, countdown > 0 && { opacity: 0.6 }]}
            >
              <Text style={styles.resendText}>
                {countdown > 0 ? (
                  `Resend OTP in ${countdown}s`
                ) : (
                  <>
                    {"Didn't get it?"}{' '}
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  </>
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  kav: { flex: 1 },
  scroll: { paddingHorizontal: 20, alignItems: 'center' },
  back: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 99,
    backgroundColor: 'rgba(232,216,204,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sealText: { fontFamily: FontFamily.serif, fontSize: 22, fontWeight: '700', color: Colors.cream },
  title: {
    fontFamily: FontFamily.serif,
    fontSize: 30,
    fontWeight: '700',
    color: Colors.cream,
    textAlign: 'center',
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: 'rgba(232,216,204,0.65)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    fontFamily: FontFamily.sansMedium,
  },
  identifierText: { color: Colors.roseSoft, fontWeight: '700' },

  card: { backgroundColor: Colors.creamLite, borderRadius: 28, padding: 24, width: '100%', ...Shadow.tab },

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

  otpRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 20 },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(63,3,11,0.2)',
    backgroundColor: '#fff',
    fontSize: 22,
    fontWeight: '700',
    color: Colors.ink,
    fontFamily: FontFamily.serif,
  },
  otpBoxFilled: { borderColor: Colors.oxblood, backgroundColor: 'rgba(63,3,11,0.04)' },

  roleSection: { alignItems: 'center', marginBottom: 20, gap: 8 },
  roleLabel: { fontSize: 13, color: 'rgba(63,3,11,0.55)', fontFamily: FontFamily.sansMedium },

  ctaBtn: { borderRadius: 16, overflow: 'hidden', ...Shadow.button, shadowColor: Colors.roseDeep },
  ctaBtnInner: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaBtnText: { fontFamily: FontFamily.sans, fontSize: 16, fontWeight: '800', color: '#fff' },

  resendBtn: { alignItems: 'center', marginTop: 16 },
  resendText: { fontSize: 13, color: 'rgba(63,3,11,0.5)', fontFamily: FontFamily.sansMedium },
  resendLink: { color: Colors.rose, fontWeight: '700' },
});
