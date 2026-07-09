import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { registerForPushNotificationsAsync } from '@/lib/push-notifications';
import { playSound } from '@/lib/sound';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Modal
} from 'react-native';

const COUNTRY_CODES = [
  { code: '91', name: 'India' },
  { code: '1', name: 'USA/Canada' },
  { code: '44', name: 'United Kingdom' },
  { code: '61', name: 'Australia' },
  { code: '971', name: 'UAE' },
  { code: '65', name: 'Singapore' },
  { code: '60', name: 'Malaysia' },
  { code: '81', name: 'Japan' },
  { code: '49', name: 'Germany' },
  { code: '33', name: 'France' },
];


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
  const _showModal = useUIStore((s) => s.showModal);

  const showModal = (params: Parameters<typeof _showModal>[0]) => {
    playSound('error');
    _showModal(params);
  };

  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [method, setMethod] = useState<'email' | 'whatsapp'>('email');
  const [role, setLocalRole] = useState<'influencer' | 'brand'>('influencer');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('91');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [otp, setOtp] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  const otpInputRef = useRef<TextInput>(null);

  // Animations for toggles
  const modeAnim = useMemo(() => new Animated.Value(0), []);
  const roleAnim = useMemo(() => new Animated.Value(0), []);
  const methodAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.timing(modeAnim, {
      toValue: mode === 'login' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [mode, modeAnim]);

  useEffect(() => {
    Animated.timing(roleAnim, {
      toValue: role === 'influencer' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [role, roleAnim]);

  useEffect(() => {
    Animated.timing(methodAnim, {
      toValue: method === 'email' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [method, methodAnim]);

  const getIdentifier = () => {
    return method === 'email' ? email.trim() : `${countryCode.trim()}${phone.trim()}`;
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
      const errorMsg = err?.message?.toLowerCase() || '';
      if (mode === 'login' && (errorMsg.includes('not found') || errorMsg.includes('does not exist') || errorMsg.includes('no account'))) {
        setMode('signup');
        showModal({
          title: 'Account Not Found',
          message: 'We could not find an account with these details. Please sign up instead.',
        });
      } else {
        showModal({
          title: 'Request Failed',
          message: err?.message || 'Failed to send verification code. Please check your details and try again.',
        });
      }
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
      const data = await api.auth.verifyOtp(
        identifier,
        otp,
        role,
        mode === 'signup' ? name : undefined,
        mode === 'signup' ? referralCode : undefined
      ) as any;

      // Extract the actual registered user role returned from the backend (or fallback to selected local role)
      const userRole = data?.user?.role || role;

      // Update local role and session
      setRole(userRole);
      await setSession(data);

      registerForPushNotificationsAsync()
        .then((device) => (device ? api.devices.register(device) : null))
        .catch((err) => console.error('Failed to register push token:', err));

      if (userRole === 'brand') {
        router.replace('/brand');
      } else {
        router.replace('/(tabs)');
      }
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
          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 40 }}>

            {step === 'request' ? (
              <>
                {/* Header / Logo */}
                <View style={{ alignItems: 'center', marginBottom: 32 }}>
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
                <View style={{ flexDirection: 'row', marginBottom: 24, position: 'relative', width: 224, alignSelf: 'center' }}>
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
                    style={{ flex: 1, paddingVertical: 8, alignItems: 'center' }}
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
                    style={{ flex: 1, paddingVertical: 8, alignItems: 'center' }}
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
                {mode === 'signup' && (
                  <View style={[{ marginBottom: 24, backgroundColor: 'white', borderRadius: 999, padding: 6 }, Shadow.card]}>
                    <View style={{ flexDirection: 'row', position: 'relative' }}>
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
                        style={{ flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', zIndex: 10 }}
                        onPress={() => setLocalRole('influencer')}
                        activeOpacity={0.8}
                      >
                        <Icon name="sparkle" size={16} color={role === 'influencer' ? Colors.cream : Colors.oxblood} />
                        <Text style={{ fontFamily: FontFamily.sans, fontSize: 13, marginLeft: 6, color: role === 'influencer' ? Colors.cream : Colors.oxblood }}>Creator</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', zIndex: 10 }}
                        onPress={() => setLocalRole('brand')}
                        activeOpacity={0.8}
                      >
                        <Icon name="briefcase" size={16} color={role === 'brand' ? Colors.cream : Colors.oxblood} />
                        <Text style={{ fontFamily: FontFamily.sans, fontSize: 13, marginLeft: 6, color: role === 'brand' ? Colors.cream : Colors.oxblood }}>Brand</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Method Selector (Email vs WhatsApp) */}
                <View style={[{ marginBottom: 24, backgroundColor: 'white', borderRadius: 12, padding: 4 }, Shadow.card]}>
                  <View style={{ flexDirection: 'row', position: 'relative' }}>
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
                      style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', zIndex: 10 }}
                      onPress={() => setMethod('email')}
                      activeOpacity={0.8}
                    >
                      <Icon name="mail" size={16} color={method === 'email' ? '#fff' : Colors.rose} />
                      <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 12, marginLeft: 6, color: method === 'email' ? '#fff' : Colors.rose }}>Email OTP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', zIndex: 10 }}
                      onPress={() => setMethod('whatsapp')}
                      activeOpacity={0.8}
                    >
                      <Icon name="phone" size={16} color={method === 'whatsapp' ? '#fff' : Colors.rose} />
                      <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 12, marginLeft: 6, color: method === 'whatsapp' ? '#fff' : Colors.rose }}>WhatsApp OTP</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Form Input Fields */}
                <View style={{ gap: 16, marginBottom: 32 }}>
                  {mode === 'signup' && (
                    <View>
                      <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 12, color: Colors.ink, marginBottom: 8, marginLeft: 6 }}>Full Name</Text>
                      <View style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 20, height: 56 }, Shadow.card]}>
                        <Icon name="user" size={18} color={Colors.rose} />
                        <TextInput
                          style={{ flex: 1, marginLeft: 12, height: '100%', fontFamily: FontFamily.sansMedium, fontSize: 15, color: Colors.ink, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) } as any}
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
                      <View style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 20, height: 56 }, Shadow.card]}>
                        <Icon name="mail" size={18} color={Colors.rose} />
                        <TextInput
                          style={{ flex: 1, marginLeft: 12, height: '100%', fontFamily: FontFamily.sansMedium, fontSize: 15, color: Colors.ink, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) } as any}
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
                      <View style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 20, height: 56 }, Shadow.card]}>
                        <Icon name="phone" size={18} color={Colors.rose} />
                        <TouchableOpacity
                          style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12, borderRightWidth: 1, borderRightColor: 'rgba(63,3,11,0.1)', paddingRight: 8 }}
                          onPress={() => setShowCountryPicker(true)}
                        >
                          <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 15, color: Colors.ink }}>+</Text>
                          <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 15, color: Colors.ink, minWidth: 28, marginLeft: 2 }}>{countryCode}</Text>
                          <Icon name="chevron-down" size={14} color="rgba(63,3,11,0.5)" />
                        </TouchableOpacity>
                        <TextInput
                          style={{ flex: 1, marginLeft: 8, height: '100%', fontFamily: FontFamily.sansMedium, fontSize: 15, color: Colors.ink, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) } as any}
                          placeholder="XXXXX XXXXX"
                          placeholderTextColor="rgba(63,3,11,0.3)"
                          value={phone}
                          onChangeText={setPhone}
                          keyboardType="phone-pad"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>
                  )}

                  {mode === 'signup' && (
                    <View>
                      <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 12, color: Colors.ink, marginBottom: 8, marginLeft: 6 }}>Referral Code (Optional)</Text>
                      <View style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 20, height: 56 }, Shadow.card]}>
                        <Icon name="gift" size={18} color={Colors.rose} />
                        <TextInput
                          style={{ flex: 1, marginLeft: 12, height: '100%', fontFamily: FontFamily.sansMedium, fontSize: 15, color: Colors.ink, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) } as any}
                          placeholder="e.g. RR_ALEX1234"
                          placeholderTextColor="rgba(63,3,11,0.3)"
                          value={referralCode}
                          onChangeText={setReferralCode}
                          autoCapitalize="characters"
                          autoCorrect={false}
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

                <View style={{ alignItems: 'center', marginTop: 32 }}>
                  <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 12, color: 'rgba(63,3,11,0.5)', textAlign: 'center', lineHeight: 18 }}>
                    By continuing, you agree to {"RichyReach's"}{'\n'}
                    <Text style={{ color: Colors.roseDeep, fontWeight: '700' }}>Terms of Service</Text> and <Text style={{ color: Colors.roseDeep, fontWeight: '700' }}>Privacy Policy</Text>
                  </Text>
                </View>
              </>
            ) : (
              <>
                {/* Back Button */}
                <TouchableOpacity
                  onPress={() => setStep('request')}
                  style={[{ position: 'absolute', top: 48, left: 24, padding: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.4)' }, Shadow.card]}
                >
                  <Icon name="back" size={20} color={Colors.oxblood} />
                </TouchableOpacity>

                {/* Verification Header */}
                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                  <View style={[{ width: 64, height: 64, backgroundColor: 'white', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }, Shadow.card]}>
                    <Icon name={method === 'email' ? 'mail' : 'phone'} size={28} color={Colors.rose} />
                  </View>
                  <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 32, color: Colors.ink, textAlign: 'center', lineHeight: 38 }}>
                    Verify Your Account
                  </Text>
                  <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 14, color: Colors.rose, marginTop: 12, textAlign: 'center', lineHeight: 20, paddingHorizontal: 12 }}>
                    {"We've"} sent a 6-digit OTP code to{'\n'}
                    <Text style={{ fontWeight: 'bold', color: Colors.oxblood }}>{getIdentifier()}</Text>
                  </Text>
                </View>

                {/* OTP Box Inputs */}
                <View style={{ alignItems: 'center', width: '100%' }}>
                  <View style={{ position: 'relative', width: '100%', height: 64, marginVertical: 24 }}>
                    {/* The OTP Box display */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', height: '100%', paddingHorizontal: 4 }} pointerEvents="none">
                      {codeArray.map((_, index) => {
                        const char = otp[index] || '';
                        const isFocused = otp.length === index;
                        return (
                          <View
                            key={index}
                            style={[
                              { width: 44, height: 64, backgroundColor: 'white', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
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
                  style={[Shadow.button, { borderRadius: Radius.xl, marginTop: 24 }]}
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
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32, alignItems: 'center' }}>
                  <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 13, color: 'rgba(63,3,11,0.5)' }}>
                    {"Didn't"} receive the code?
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

      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={() => setShowCountryPicker(false)}>
          <TouchableWithoutFeedback>
            <View style={{ backgroundColor: Colors.creamLite, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Icon name="globe" size={24} color={Colors.rose} />
                <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 18, color: Colors.ink, marginLeft: 12, fontWeight: '700' }}>Select Country Code</Text>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ gap: 8, paddingBottom: 40 }}>
                  {COUNTRY_CODES.map((item) => (
                    <TouchableOpacity
                      key={item.code}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        backgroundColor: countryCode === item.code ? 'rgba(63,3,11,0.05)' : 'transparent',
                        borderRadius: 12,
                      }}
                      onPress={() => {
                        setCountryCode(item.code);
                        setShowCountryPicker(false);
                      }}
                    >
                      <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 16, color: Colors.ink, flex: 1 }}>{item.name}</Text>
                      <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 16, color: Colors.ink }}>+{item.code}</Text>
                      {countryCode === item.code && (
                        <View style={{ marginLeft: 12 }}>
                          <Icon name="check" size={18} color={Colors.rose} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}
