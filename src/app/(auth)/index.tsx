import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

function PageWrapper({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'web') {
    return <View style={{ flex: 1 }}>{children}</View>;
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {children}
    </TouchableWithoutFeedback>
  );
}

export default function AuthScreen() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const setRole = useAuthStore((s) => s.setRole);
  const showModal = useUIStore((s) => s.showModal);

  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [method, setMethod] = useState<'email' | 'whatsapp'>('email');
  const [role, setLocalRole] = useState<'influencer' | 'brand'>('influencer');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const otpInputRef = useRef<TextInput>(null);

  // Animations for toggles
  const modeAnim = useRef(new Animated.Value(mode === 'login' ? 0 : 1)).current;
  const roleAnim = useRef(new Animated.Value(role === 'influencer' ? 0 : 1)).current;
  const methodAnim = useRef(new Animated.Value(method === 'email' ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(modeAnim, {
      toValue: mode === 'login' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [mode]);

  useEffect(() => {
    Animated.timing(roleAnim, {
      toValue: role === 'influencer' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [role]);

  useEffect(() => {
    Animated.timing(methodAnim, {
      toValue: method === 'email' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [method]);

  const getIdentifier = () => {
    return method === 'email' ? email.trim() : phone.trim();
  };

  const handleRequestOtp = async () => {
    const identifier = getIdentifier();

    // Basic Validations
    if (mode === 'signup' && name.trim().length < 2) {
      showModal({
        title: 'Validation Error',
        message: 'Please enter your full name (minimum 2 characters).',
      });
      return;
    }

    if (!identifier) {
      showModal({
        title: 'Input Required',
        message: `Please enter your ${method === 'email' ? 'email address' : 'WhatsApp number'} to continue.`,
      });
      return;
    }

    if (method === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        showModal({
          title: 'Invalid Email',
          message: 'Please enter a valid email address.',
        });
        return;
      }
    } else {
      // WhatsApp phone validation (allow digits, plus, min 10 chars)
      const phoneDigits = identifier.replace(/[^0-9]/g, '');
      if (phoneDigits.length < 10) {
        showModal({
          title: 'Invalid Phone Number',
          message: 'Please enter a valid phone number (minimum 10 digits).',
        });
        return;
      }
    }

    setLoading(true);
    try {
      await api.auth.requestOtp(identifier, method, mode);
      setStep('verify');
      setOtp(''); // Clear previous OTP entry if any
    } catch (err: any) {
      showModal({
        title: 'Request Failed',
        message: err?.message || 'Failed to send verification code. Please check your details and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const identifier = getIdentifier();

    if (otp.length !== 6) {
      showModal({
        title: 'Verification Code Required',
        message: 'Please enter the complete 6-digit OTP sent to you.',
      });
      return;
    }

    setLoading(true);
    try {
      const data = await api.auth.verifyOtp(identifier, otp, role, mode === 'signup' ? name : undefined);

      // Update local role and session
      setRole(role);
      await setSession(data as any);

      router.replace('/(tabs)');
    } catch (err: any) {
      showModal({
        title: 'Verification Failed',
        message: err?.message || 'The OTP entered is incorrect or has expired. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const codeArray = Array(6).fill(0);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: 'rgba(244,236,228,0.9)' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <PageWrapper>
          <View className="flex-1 justify-center px-8 py-10">

            {step === 'request' ? (
              <>
                {/* Header / Logo */}
                <View className="items-center mb-8">
                  <Image
                    source={require('@/assets/images/richyreach-logo.png')}
                    style={{ width: 100, height: 100 }}
                    contentFit="cover"
                  />
                  <Text style={{ fontFamily: FontFamily.serif, fontSize: 36, color: Colors.ink, textAlign: 'center', lineHeight: 42 }}>
                    RichyReach
                  </Text>
                  <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 14, color: Colors.rose, marginTop: 8, textAlign: 'center' }}>
                    Where creators get <Text style={{ fontStyle: 'italic', fontWeight: 'bold' }}>Rich</Text>, and brands get <Text style={{ fontStyle: 'italic', fontWeight: 'bold' }}>Reach</Text>.
                  </Text>
                </View>

                {/* Login / Signup Selector */}
                <View className="flex-row mb-6 relative w-56 self-center">
                  <Animated.View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: modeAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '50%'] }),
                      width: '50%',
                      height: 2,
                      backgroundColor: Colors.oxblood,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setMode('login')}
                    className="flex-1 py-2 items-center"
                    activeOpacity={0.8}
                  >
                    <Text style={{
                      fontFamily: mode === 'login' ? FontFamily.sans : FontFamily.sansMedium,
                      color: mode === 'login' ? Colors.oxblood : 'rgba(63,3,11,0.4)',
                      fontSize: 16
                    }}>
                      Log In
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setMode('signup')}
                    className="flex-1 py-2 items-center"
                    activeOpacity={0.8}
                  >
                    <Text style={{
                      fontFamily: mode === 'signup' ? FontFamily.sans : FontFamily.sansMedium,
                      color: mode === 'signup' ? Colors.oxblood : 'rgba(63,3,11,0.4)',
                      fontSize: 16
                    }}>
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Role Toggle */}
                <View className="mb-6 bg-white rounded-full p-1.5" style={Shadow.card}>
                  <View className="flex-row relative">
                    <Animated.View
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: roleAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '50%'] }),
                        width: '50%',
                        backgroundColor: Colors.oxblood,
                        borderRadius: 999,
                      }}
                    />
                    <TouchableOpacity
                      className="flex-1 py-3 rounded-full items-center justify-center flex-row z-10"
                      onPress={() => setLocalRole('influencer')}
                      activeOpacity={0.8}
                    >
                      <Icon name="sparkle" size={16} color={role === 'influencer' ? Colors.cream : Colors.oxblood} />
                      <Text style={{ fontFamily: FontFamily.sans, fontSize: 13, marginLeft: 6, color: role === 'influencer' ? Colors.cream : Colors.oxblood }}>Creator</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 py-3 rounded-full items-center justify-center flex-row z-10"
                      onPress={() => setLocalRole('brand')}
                      activeOpacity={0.8}
                    >
                      <Icon name="briefcase" size={16} color={role === 'brand' ? Colors.cream : Colors.oxblood} />
                      <Text style={{ fontFamily: FontFamily.sans, fontSize: 13, marginLeft: 6, color: role === 'brand' ? Colors.cream : Colors.oxblood }}>Brand</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Method Selector (Email vs WhatsApp) */}
                <View className="mb-6 bg-white rounded-xl p-1" style={Shadow.card}>
                  <View className="flex-row relative">
                    <Animated.View
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: methodAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '50%'] }),
                        width: '50%',
                        backgroundColor: Colors.rose,
                        borderRadius: 8,
                      }}
                    />
                    <TouchableOpacity
                      className="flex-1 py-2.5 rounded-lg items-center justify-center flex-row z-10"
                      onPress={() => setMethod('email')}
                      activeOpacity={0.8}
                    >
                      <Icon name="mail" size={16} color={method === 'email' ? '#fff' : Colors.rose} />
                      <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 12, marginLeft: 6, color: method === 'email' ? '#fff' : Colors.rose }}>Email OTP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 py-2.5 rounded-lg items-center justify-center flex-row z-10"
                      onPress={() => setMethod('whatsapp')}
                      activeOpacity={0.8}
                    >
                      <Icon name="phone" size={16} color={method === 'whatsapp' ? '#fff' : Colors.rose} />
                      <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 12, marginLeft: 6, color: method === 'whatsapp' ? '#fff' : Colors.rose }}>WhatsApp OTP</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Form Input Fields */}
                <View className="gap-4 mb-8">
                  {mode === 'signup' && (
                    <View>
                      <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 12, color: Colors.ink, marginBottom: 8, marginLeft: 6 }}>Full Name</Text>
                      <View className="flex-row items-center bg-white rounded-2xl px-5 h-14" style={Shadow.card}>
                        <Icon name="user" size={18} color={Colors.rose} />
                        <TextInput
                          className="flex-1 ml-3 h-full"
                          style={{ fontFamily: FontFamily.sansMedium, fontSize: 15, color: Colors.ink, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) } as any}
                          placeholder="Enter your name"
                          placeholderTextColor="rgba(63,3,11,0.3)"
                          value={name}
                          onChangeText={setName}
                          autoCapitalize="words"
                        />
                      </View>
                    </View>
                  )}

                  {method === 'email' ? (
                    <View>
                      <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 12, color: Colors.ink, marginBottom: 8, marginLeft: 6 }}>Email Address</Text>
                      <View className="flex-row items-center bg-white rounded-2xl px-5 h-14" style={Shadow.card}>
                        <Icon name="mail" size={18} color={Colors.rose} />
                        <TextInput
                          className="flex-1 ml-3 h-full"
                          style={{ fontFamily: FontFamily.sansMedium, fontSize: 15, color: Colors.ink, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) } as any}
                          placeholder="Enter your email"
                          placeholderTextColor="rgba(63,3,11,0.3)"
                          value={email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                    </View>
                  ) : (
                    <View>
                      <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 12, color: Colors.ink, marginBottom: 8, marginLeft: 6 }}>WhatsApp Number</Text>
                      <View className="flex-row items-center bg-white rounded-2xl px-5 h-14" style={Shadow.card}>
                        <Icon name="phone" size={18} color={Colors.rose} />
                        <TextInput
                          className="flex-1 ml-3 h-full"
                          style={{ fontFamily: FontFamily.sansMedium, fontSize: 15, color: Colors.ink, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) } as any}
                          placeholder="+91 XXXXX XXXXX"
                          placeholderTextColor="rgba(63,3,11,0.3)"
                          value={phone}
                          onChangeText={setPhone}
                          keyboardType="phone-pad"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  onPress={handleRequestOtp}
                  activeOpacity={0.85}
                  disabled={loading}
                  style={[Shadow.button, { borderRadius: Radius.xl }]}
                >
                  <LinearGradient
                    colors={[Colors.oxblood, Colors.oxbloodDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingVertical: 18, borderRadius: Radius.xl, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={Colors.cream} />
                    ) : (
                      <>
                        <Text style={{ fontFamily: FontFamily.sans, fontSize: 16, color: Colors.cream, marginRight: 8, letterSpacing: 0.5 }}>
                          Send Verification Code
                        </Text>
                        <Icon name="arrow" size={18} color={Colors.cream} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View className="items-center mt-8">
                  <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 12, color: 'rgba(63,3,11,0.5)', textAlign: 'center', lineHeight: 18 }}>
                    By continuing, you agree to RichyReach's{'\n'}
                    <Text style={{ color: Colors.roseDeep, fontWeight: '700' }}>Terms of Service</Text> and <Text style={{ color: Colors.roseDeep, fontWeight: '700' }}>Privacy Policy</Text>
                  </Text>
                </View>
              </>
            ) : (
              <>
                {/* Back Button */}
                <TouchableOpacity
                  onPress={() => setStep('request')}
                  className="absolute top-12 left-6 p-2 rounded-full bg-white/40"
                  style={Shadow.card}
                >
                  <Icon name="back" size={20} color={Colors.oxblood} />
                </TouchableOpacity>

                {/* Verification Header */}
                <View className="items-center mb-8">
                  <View className="w-16 h-16 bg-white rounded-full items-center justify-center mb-6" style={Shadow.card}>
                    <Icon name={method === 'email' ? 'mail' : 'phone'} size={28} color={Colors.rose} />
                  </View>
                  <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 32, color: Colors.ink, textAlign: 'center', lineHeight: 38 }}>
                    Verify Your Account
                  </Text>
                  <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 14, color: Colors.rose, marginTop: 12, textAlign: 'center', lineHeight: 20, paddingHorizontal: 12 }}>
                    We've sent a 6-digit OTP code to{'\n'}
                    <Text style={{ fontWeight: 'bold', color: Colors.oxblood }}>{getIdentifier()}</Text>
                  </Text>
                </View>

                {/* OTP Box Inputs */}
                <View className="items-center w-full">
                  <View style={{ position: 'relative', width: '100%', height: 64, marginVertical: 24 }}>
                    {/* The OTP Box display */}
                    <View className="flex-row justify-between w-full h-full px-1" pointerEvents="none">
                      {codeArray.map((_, index) => {
                        const char = otp[index] || '';
                        const isFocused = otp.length === index;
                        return (
                          <View
                            key={index}
                            className="w-[44px] h-16 bg-white rounded-2xl items-center justify-center border"
                            style={[
                              Shadow.card,
                              {
                                borderColor: isFocused ? Colors.oxblood : 'rgba(63,3,11,0.06)',
                                borderWidth: isFocused ? 2 : 1
                              }
                            ]}
                          >
                            <Text style={{ fontFamily: FontFamily.sans, fontSize: 24, fontWeight: '700', color: Colors.ink }}>
                              {char}
                            </Text>
                          </View>
                        );
                      })}
                    </View>

                    {/* The hidden text input overlaying the boxes */}
                    <TextInput
                      ref={otpInputRef}
                      value={otp}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
                        setOtp(cleaned);
                      }}
                      keyboardType="number-pad"
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.01,
                        fontSize: 18,
                        color: 'transparent',
                        backgroundColor: 'transparent',
                        padding: 0,
                        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {})
                      } as any}
                      maxLength={6}
                      autoFocus
                    />
                  </View>
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  activeOpacity={0.85}
                  disabled={loading}
                  style={[Shadow.button, { borderRadius: Radius.xl }]}
                  className="mt-6"
                >
                  <LinearGradient
                    colors={[Colors.oxblood, Colors.oxbloodDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingVertical: 18, borderRadius: Radius.xl, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={Colors.cream} />
                    ) : (
                      <>
                        <Text style={{ fontFamily: FontFamily.sans, fontSize: 16, color: Colors.cream, marginRight: 8, letterSpacing: 0.5 }}>
                          Verify & Login
                        </Text>
                        <Icon name="check" size={18} color={Colors.cream} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Resend Actions */}
                <View className="flex-row justify-center mt-8 items-center">
                  <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 13, color: 'rgba(63,3,11,0.5)' }}>
                    Didn't receive the code?
                  </Text>
                  <TouchableOpacity onPress={handleRequestOtp} disabled={loading}>
                    <Text style={{ fontFamily: FontFamily.sans, fontSize: 13, color: Colors.roseDeep, marginLeft: 6, fontWeight: '700' }}>
                      Resend OTP
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

          </View>
        </PageWrapper>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
