import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Shadow } from '@/constants/brand';

interface VerificationContentProps {
  profile: any;
  onGoToInstagram: () => void;
}

export function VerificationContent({ profile, onGoToInstagram }: VerificationContentProps) {
  const isVerified = profile?.verified ?? false;
  const hasInstagram = !!profile?.instagramHandle;

  if (isVerified) {
    return (
      <View style={styles.container}>
        <View style={styles.verifiedBox}>
          <View style={styles.iconCircle}>
            <Icon name="verified" size={42} color={Colors.gold} />
          </View>
          <Text style={styles.verifiedTitle}>Profile Verified</Text>
          <Text style={styles.verifiedDesc}>
            Congratulations! Your account is verified as an official RichyReach creator. You enjoy higher campaign match priority and verified creator perks.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get Verified Creator Badge</Text>
      <Text style={styles.subtitle}>
        Verification is automatic — connect your Instagram Business/Creator account and your profile is verified right away. A verified badge shows brands that your profile is authentic and active.
      </Text>

      <View style={styles.infoBox}>
        <View style={[styles.statusIcon, hasInstagram ? styles.checked : styles.unchecked]}>
          <Icon name={hasInstagram ? 'verified' : 'close'} size={14} color={hasInstagram ? Colors.cream : 'rgba(63,3,11,0.4)'} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.criterionName}>Linked Instagram Account</Text>
          <Text style={styles.criterionDesc}>
            {hasInstagram
              ? `Connected as @${profile.instagramHandle}. If your profile isn't showing as verified yet, try reconnecting or contact support.`
              : 'Connect your Instagram account to get verified instantly.'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.applyBtn}
        onPress={onGoToInstagram}
        activeOpacity={0.8}
      >
        <Text style={styles.applyBtnText}>
          {hasInstagram ? 'Manage Instagram Connection' : 'Connect Instagram'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.adminNote}>
        Admins can also verify your profile manually in special cases.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  verifiedBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...Shadow.card,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(238,198,111,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  verifiedTitle: {
    fontFamily: FontFamily.serif,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 8,
  },
  verifiedDesc: {
    fontFamily: FontFamily.sans,
    fontSize: 13.5,
    lineHeight: 20,
    color: 'rgba(42,2,7,0.7)',
    textAlign: 'center',
  },
  title: {
    fontFamily: FontFamily.serif,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: 'rgba(63,3,11,0.6)',
    lineHeight: 19,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadow.card,
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: '#2a7a5a',
  },
  unchecked: {
    backgroundColor: 'rgba(63,3,11,0.08)',
  },
  criterionName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.ink,
  },
  criterionDesc: {
    fontFamily: FontFamily.sans,
    fontSize: 11.5,
    color: 'rgba(63,3,11,0.5)',
    marginTop: 2,
  },
  applyBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontFamily: FontFamily.sans,
    fontWeight: '800',
    fontSize: 14.5,
    color: Colors.cream,
  },
  adminNote: {
    fontFamily: FontFamily.sans,
    fontSize: 11.5,
    color: 'rgba(63,3,11,0.45)',
    textAlign: 'center',
    marginTop: 14,
  },
});
