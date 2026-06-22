import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';

interface VerificationContentProps {
  profile: any;
  servicesCount: number;
}

export function VerificationContent({ profile, servicesCount }: VerificationContentProps) {
  const showModal = useUIStore((s) => s.showModal);
  const queryClient = useQueryClient();

  const isVerified = profile?.verified ?? false;
  const followersCount = profile?.followers ?? 0;
  const hasInstagram = !!profile?.instagramHandle;
  const hasBio = !!profile?.bio && profile.bio.trim().length > 0;
  const hasService = servicesCount > 0;

  const followersReq = followersCount >= 5000;

  const meetAllCriteria = followersReq && hasInstagram && hasBio && hasService;

  const verifyMutation = useMutation({
    mutationFn: () => api.influencers.verifyProfile(),
    onSuccess: () => {
      showModal({
        title: 'Application Submitted! 🎉',
        message: 'Your verification request has been successfully submitted. Our team will review your profile within 2-3 business days.',
      });
      queryClient.invalidateQueries({ queryKey: ['influencerProfile'] });
    },
    onError: (err: any) => {
      showModal({
        title: 'Submission Failed',
        message: err.message || 'Something went wrong. Please try again.',
      });
    },
  });

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
        A blue verification badge shows brands that your profile is authentic, active, and meets our quality standards.
      </Text>

      <View style={styles.criteriaList}>
        <View style={styles.criterionRow}>
          <View style={[styles.statusIcon, followersReq ? styles.checked : styles.unchecked]}>
            <Icon name={followersReq ? 'verified' : 'close'} size={14} color={followersReq ? Colors.cream : 'rgba(63,3,11,0.4)'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.criterionName}>5,000+ Followers</Text>
            <Text style={styles.criterionDesc}>Your profile currently lists {followersCount.toLocaleString()} followers.</Text>
          </View>
        </View>

        <View style={styles.criterionRow}>
          <View style={[styles.statusIcon, hasInstagram ? styles.checked : styles.unchecked]}>
            <Icon name={hasInstagram ? 'verified' : 'close'} size={14} color={hasInstagram ? Colors.cream : 'rgba(63,3,11,0.4)'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.criterionName}>Linked Instagram Account</Text>
            <Text style={styles.criterionDesc}>
              {hasInstagram ? `Connected handle: @${profile.instagramHandle}` : 'No Instagram handle linked in profile.'}
            </Text>
          </View>
        </View>

        <View style={styles.criterionRow}>
          <View style={[styles.statusIcon, hasBio ? styles.checked : styles.unchecked]}>
            <Icon name={hasBio ? 'verified' : 'close'} size={14} color={hasBio ? Colors.cream : 'rgba(63,3,11,0.4)'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.criterionName}>Completed Bio</Text>
            <Text style={styles.criterionDesc}>{hasBio ? 'Bio details successfully provided.' : 'Please add a bio introducing yourself to brands.'}</Text>
          </View>
        </View>

        <View style={styles.criterionRow}>
          <View style={[styles.statusIcon, hasService ? styles.checked : styles.unchecked]}>
            <Icon name={hasService ? 'verified' : 'close'} size={14} color={hasService ? Colors.cream : 'rgba(63,3,11,0.4)'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.criterionName}>At least 1 Active Service</Text>
            <Text style={styles.criterionDesc}>{hasService ? 'Active collaboration offerings published.' : 'Please list at least one service/offering you sell.'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.applyBtn, !meetAllCriteria && styles.disabledBtn]}
        disabled={!meetAllCriteria || verifyMutation.isPending}
        onPress={() => verifyMutation.mutate()}
        activeOpacity={0.8}
      >
        {verifyMutation.isPending ? (
          <ActivityIndicator color={Colors.cream} size="small" />
        ) : (
          <Text style={styles.applyBtnText}>
            {meetAllCriteria ? 'Apply for Verification' : 'Criteria Not Met Yet'}
          </Text>
        )}
      </TouchableOpacity>
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
  criteriaList: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 24,
    ...Shadow.card,
  },
  criterionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.06)',
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
  disabledBtn: {
    backgroundColor: 'rgba(63,3,11,0.3)',
  },
});
