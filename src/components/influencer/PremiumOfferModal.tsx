import { Colors, FontFamily } from '@/constants/brand';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, Path, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

interface PremiumOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockPress?: () => void;
}

function Sparkle({ size = 12, color = '#f3c969', style = {} }: { size?: number; color?: string; style?: any }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
      <Path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z" />
    </Svg>
  );
}

function LeftLeafWreath() {
  return (
    <Svg width={20} height={50} viewBox="0 0 24 60" fill="none">
      <Path d="M18 10 C14 12, 10 18, 12 30 C13 36, 16 42, 20 48" stroke="#e8d8cc" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <Path d="M12 18 C8 16, 6 18, 10 21 C12 22, 12 20, 12 18 Z" fill="#e8d8cc" opacity="0.75" />
      <Path d="M10 28 C6 26, 4 28, 8 31 C10 32, 10 30, 10 28 Z" fill="#e8d8cc" opacity="0.75" />
      <Path d="M11 38 C7 36, 5 38, 9 41 C11 42, 11 40, 11 38 Z" fill="#e8d8cc" opacity="0.75" />
      <Path d="M14 47 C10 46, 8 49, 12 51 C14 52, 14 49, 14 47 Z" fill="#e8d8cc" opacity="0.75" />
      <Path d="M16 13 C14 9, 15 7, 18 9 C19 10, 18 12, 16 13 Z" fill="#e8d8cc" opacity="0.75" />
      <Path d="M14 23 C11 19, 12 17, 15 19 C16 20, 15 22, 14 23 Z" fill="#e8d8cc" opacity="0.75" />
      <Path d="M13 33 C10 29, 11 27, 14 29 C15 30, 14 32, 13 33 Z" fill="#e8d8cc" opacity="0.75" />
    </Svg>
  );
}

function RightLeafWreath() {
  return (
    <Svg width={20} height={50} viewBox="0 0 24 60" fill="none">
      <Path d="M6 10 C10 12, 14 18, 12 30 C11 36, 8 42, 4 48" stroke="#e8d8cc" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <Path d="M12 18 C16 16, 18 18, 14 21 C12 22, 12 20, 12 18 Z" fill="#e8d8cc" opacity="0.75" />
      <Path d="M14 28 C18 26, 20 28, 16 31 C14 32, 14 30, 14 28 Z" fill="#e8d8cc" opacity="0.75" />
      <Path d="M13 38 C17 36, 19 38, 15 41 C13 42, 13 40, 13 38 Z" fill="#e8d8cc" opacity="0.75" />
      <Path d="M10 47 C14 46, 16 49, 12 51 C10 52, 10 49, 10 47 Z" fill="#e8d8cc" opacity="0.75" />
      <Path d="M8 13 C10 9, 9 7, 6 9 C5 10, 6 12, 8 13 Z" fill="#e8d8cc" opacity="0.75" />
      <Path d="M10 23 C12 19, 11 17, 8 19 C7 20, 8 22, 10 23 Z" fill="#e8d8cc" opacity="0.75" />
      <Path d="M11 33 C13 29, 12 27, 9 29 C8 30, 9 32, 11 33 Z" fill="#e8d8cc" opacity="0.75" />
    </Svg>
  );
}

export function PremiumOfferModal({ isOpen, onClose, onUnlockPress }: PremiumOfferModalProps) {
  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
        
        {/* Background Sparkles */}
        <Sparkle size={14} style={{ position: 'absolute', top: '15%', left: '15%' }} />
        <Sparkle size={10} style={{ position: 'absolute', top: '22%', right: '12%', opacity: 0.6 }} />
        <Sparkle size={12} style={{ position: 'absolute', bottom: '30%', left: '8%', opacity: 0.8 }} />
        <Sparkle size={8} style={{ position: 'absolute', bottom: '25%', right: '16%' }} />

        {/* Premium Card Container */}
        <LinearGradient
          colors={['#3e161c', '#240409', '#140004']}
          style={styles.card}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} activeOpacity={0.8} onPress={onClose}>
            <Feather name="x" size={16} color="#e8d8cc" />
          </TouchableOpacity>

          {/* Top Crown Section */}
          <View style={styles.crownContainer}>
            <View style={styles.crownGlow} />
            <View style={styles.crownBox}>
              <Svg width={44} height={44} viewBox="0 0 64 64" fill="none">
                <Path d="M10 46 L6 22 L20 34 L32 14 L44 34 L58 22 L54 46 Z" fill="url(#crownGrad)" />
                <Rect x="10" y="48" width="44" height="4" rx="2" fill="url(#crownGrad)" />
                <Circle cx="6" cy="20" r="2.5" fill="#f3c969" />
                <Circle cx="20" cy="32" r="2.5" fill="#f3c969" />
                <Circle cx="32" cy="12" r="2.5" fill="#f3c969" />
                <Circle cx="44" cy="32" r="2.5" fill="#f3c969" />
                <Circle cx="58" cy="20" r="2.5" fill="#f3c969" />
                <Defs>
                  <SvgLinearGradient id="crownGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                    <Stop offset="0" stopColor="#f4ece4" stopOpacity={0.9} />
                    <Stop offset="0.5" stopColor="#e8d8cc" />
                    <Stop offset="1" stopColor="#f3c969" />
                  </SvgLinearGradient>
                </Defs>
              </Svg>
            </View>
          </View>

          {/* Membership Badge */}
          <View style={styles.badgeCapsule}>
            <Text style={styles.badgeText}>PREMIUM MEMBERSHIP</Text>
          </View>

          {/* Title Area */}
          <View style={styles.titleArea}>
            <Text style={styles.titleText}>Unlock Your</Text>
            <Text style={styles.titleText}>Full Potential</Text>
            <View style={styles.subtitleRow}>
              <View style={styles.titleLine} />
              <Text style={styles.subtitleText}>
                with <Text style={styles.accentBrandText}>Richy Reach</Text>
              </Text>
              <View style={styles.titleLine} />
            </View>
          </View>

          {/* Features Horizontal Grid */}
          <View style={styles.benefitsRow}>
            {/* Feature 1 */}
            <View style={styles.benefitCol}>
              <View style={styles.benefitIconCircle}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2 L14.1 3.5 L16.6 3 L17.5 5.4 L19.9 6.2 L19.5 8.7 L21 10.7 L19.5 12.7 L19.9 15.2 L17.5 16 L16.6 18.4 L14.1 17.9 L12 19.4 L9.9 17.9 L7.4 18.4 L6.5 16 L4.1 15.2 L4.5 12.7 L3 10.7 L4.5 8.7 L4.1 6.2 L6.5 5.4 L7.4 3 L9.9 3.5 Z" fill="#b46a74" stroke="#e8d8cc" strokeWidth="1" />
                  <Path d="M9 11.5 L11 13.5 L15 9.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={styles.benefitLabel}>Verified{"\n"}Badge</Text>
            </View>

            <Sparkle size={6} color="#e8d8cc" />

            {/* Feature 2 */}
            <View style={styles.benefitCol}>
              <View style={styles.benefitIconCircle}>
                <FontAwesome5 name="handshake" size={16} color="#e8d8cc" />
              </View>
              <Text style={styles.benefitLabel}>Priority{"\n"}Opportunities</Text>
            </View>

            <Sparkle size={6} color="#e8d8cc" />

            {/* Feature 3 */}
            <View style={styles.benefitCol}>
              <View style={styles.benefitIconCircle}>
                <FontAwesome5 name="rocket" size={15} color="#e8d8cc" />
              </View>
              <Text style={styles.benefitLabel}>Boost Your{"\n"}Visibility</Text>
            </View>

            <Sparkle size={6} color="#e8d8cc" />

            {/* Feature 4 */}
            <View style={styles.benefitCol}>
              <View style={styles.benefitIconCircle}>
                <FontAwesome5 name="gem" size={15} color="#e8d8cc" />
              </View>
              <Text style={styles.benefitLabel}>Exclusive{"\n"}Perks</Text>
            </View>
          </View>

          {/* Pricing Glass Card */}
          <View style={styles.priceCard}>
            <LeftLeafWreath />
            
            <View style={styles.priceCenterContent}>
              <Text style={styles.priceHeader}>✦ Membership Fee ✦</Text>
              <Text style={styles.priceValue}>₹299</Text>
              <View style={styles.priceCapsule}>
                <Text style={styles.priceCapsuleText}>ONE-TIME PAYMENT • 1 YEAR ACCESS</Text>
              </View>
            </View>

            <RightLeafWreath />
          </View>

          {/* Grow trust banner */}
          <View style={styles.trustBanner}>
            <MaterialCommunityIcons name="shield-check" size={18} color="#f3c969" />
            <Text style={styles.trustText}>
              Join thousands of creators and grow with <Text style={styles.trustBrandAccent}>Richy Reach.</Text>
            </Text>
          </View>

          {/* Premium Gradient Unlock Button */}
          <TouchableOpacity
            style={styles.unlockButtonWrap}
            activeOpacity={0.88}
            onPress={() => {
              if (onUnlockPress) {
                onUnlockPress();
              }
              onClose();
            }}
          >
            <LinearGradient
              colors={['#e89fa8', '#dfb0a3', '#f3c969']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.unlockButtonGradient}
            >
              <View style={styles.btnIconLeft}>
                <FontAwesome5 name="lock" size={14} color="#2a0207" />
              </View>
              <Text style={styles.unlockButtonText}>Unlock Membership</Text>
              <View style={styles.btnIconRight}>
                <Feather name="arrow-right" size={16} color="#2a0207" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer secure info */}
          <View style={styles.footerWrap}>
            <Ionicons name="lock-closed-outline" size={11} color="#e8d8cc" style={{ opacity: 0.6 }} />
            <Text style={styles.footerText}>Secure Payment | Cancel Anytime</Text>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,0,4,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: 'rgba(232,216,204,0.14)',
    paddingTop: 44,
    paddingBottom: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#3f030b',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 0.8,
    borderColor: 'rgba(232,216,204,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  crownContainer: {
    position: 'relative',
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  crownGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#b46a74',
    opacity: 0.2,
    filter: 'blur(10px)',
  },
  crownBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(232,216,204,0.05)',
    borderWidth: 1.2,
    borderColor: 'rgba(232,216,204,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badgeCapsule: {
    borderWidth: 0.8,
    borderColor: 'rgba(232,216,204,0.4)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 16,
    backgroundColor: 'rgba(232,216,204,0.02)',
  },
  badgeText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9.5,
    color: '#e8d8cc',
    letterSpacing: 1.5,
  },
  titleArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleText: {
    fontFamily: FontFamily.serif,
    fontSize: 34,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 10,
  },
  titleLine: {
    width: 22,
    height: 1,
    backgroundColor: 'rgba(232,216,204,0.3)',
  },
  subtitleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14.5,
    color: '#e8d8cc',
    opacity: 0.95,
  },
  accentBrandText: {
    fontFamily: FontFamily.serif,
    color: '#f9b2b9',
    fontWeight: 'bold',
  },
  benefitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 6,
    marginBottom: 20,
  },
  benefitCol: {
    alignItems: 'center',
    width: 66,
  },
  benefitIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(232,216,204,0.18)',
    backgroundColor: 'rgba(63,3,11,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 9,
    color: '#e8d8cc',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 12,
    opacity: 0.85,
  },
  priceCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: 'rgba(232,216,204,0.14)',
    backgroundColor: 'rgba(232,216,204,0.03)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  priceCenterContent: {
    alignItems: 'center',
    flex: 1,
  },
  priceHeader: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: '#e8d8cc',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  priceValue: {
    fontFamily: FontFamily.serif,
    fontSize: 54,
    color: '#ffffff',
    lineHeight: 60,
    marginVertical: 2,
  },
  priceCapsule: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(232,216,204,0.08)',
  },
  priceCapsuleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 8.2,
    color: '#e8d8cc',
    letterSpacing: 0.6,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232,216,204,0.02)',
    borderWidth: 0.8,
    borderColor: 'rgba(232,216,204,0.08)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    width: '100%',
    marginBottom: 20,
  },
  trustText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: '#e8d8cc',
    flex: 1,
    lineHeight: 14,
    opacity: 0.9,
  },
  trustBrandAccent: {
    color: '#f9b2b9',
    fontFamily: FontFamily.sansMedium,
  },
  unlockButtonWrap: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    marginBottom: 14,
    shadowColor: '#f3c969',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  unlockButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    width: '100%',
    borderRadius: 26,
    paddingHorizontal: 20,
  },
  btnIconLeft: {
    width: 20,
    alignItems: 'flex-start',
  },
  btnIconRight: {
    width: 20,
    alignItems: 'flex-end',
  },
  unlockButtonText: {
    fontFamily: FontFamily.sans,
    fontSize: 15,
    color: '#2a0207',
    fontWeight: '800',
  },
  footerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    opacity: 0.5,
  },
  footerText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10,
    color: '#e8d8cc',
  },
});
