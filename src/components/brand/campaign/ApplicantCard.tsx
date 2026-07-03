import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { Image } from 'expo-image';
import React, { useState, useEffect, useRef } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator, Pressable, Platform } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useRouter } from 'expo-router';

interface ApplicantCardProps {
  app: any;
  campaignId: string;
  expandedCollabAppId?: string | null;
  onToggleCollab?: (id: string) => void;
  onAccept: (app: any) => void;
  onReject: (app: any) => void;
  onNegotiate: (app: any) => void;
  onReviewScript?: (appId: string, status: 'approved' | 'rejected') => void;
  onCompleteCollab?: (appId: string) => void;
  reviewScriptPending?: boolean;
  completeCollabPending?: boolean;
}

export function ApplicantCard({
  app,
  campaignId,
  expandedCollabAppId,
  onToggleCollab,
  onAccept,
  onReject,
  onNegotiate,
  onReviewScript,
  onCompleteCollab,
  reviewScriptPending,
  completeCollabPending,
}: ApplicantCardProps) {
  const router = useRouter();
  const isPending = app.status === 'pending';
  const isAccepted = app.status === 'accepted';
  const isRejected = app.status === 'rejected';
  const isNegotiating = app.status === 'negotiating';
  const brandNeedsToRespond =
    isPending || (isNegotiating && app.lastActionBy === 'influencer');

  let followersStr = String(app.followers || '0');
  const followersNum = Number(app.followers || 0);
  if (followersNum >= 1000000) followersStr = `${(followersNum / 1000000).toFixed(1)}M`;
  else if (followersNum >= 1000) followersStr = `${(followersNum / 1000).toFixed(0)}k`;

  return (
    <View style={styles.applicantCard}>
      {/* Header */}
      <View style={styles.applicantHeader}>
        {app.avatar ? (
          <Image source={{ uri: app.avatar }} style={styles.applicantAvatar} />
        ) : (
          <PlaceholderImage tone="rose" height={40} width={40} borderRadius={20} />
        )}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.applicantName}>{app.name || app.instagramHandle}</Text>
          <Text style={styles.applicantHandle}>@{app.instagramHandle}</Text>
        </View>
        <View style={styles.applicantMeta}>
          <Text style={styles.applicantMetaVal}>{followersStr}</Text>
          <Text style={styles.applicantMetaLabel}>Followers</Text>
        </View>
      </View>

      {/* Bid */}
      <View style={styles.bidContainer}>
        <View style={styles.bidItem}>
          <Text style={styles.bidLabel}>Bid Price:</Text>
          <Text style={styles.bidText}>₹{((app.bidAmount || 0) / 100).toLocaleString()}</Text>
        </View>
        {app.counterAmount && app.counterAmount > 0 && (
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              Countered: ₹{((app.counterAmount || 0) / 100).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {/* Proposal */}
      <View style={styles.proposalContainer}>
        <Text style={styles.proposalLabel}>Proposal:</Text>
        <Text style={styles.proposalText}>"{app.proposal}"</Text>
      </View>

      {/* Actions */}
      <View style={styles.applicantActions}>
        {brandNeedsToRespond ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.rejectApplicantBtn}
              activeOpacity={0.8}
              onPress={() => onReject(app)}
            >
              <Text style={styles.rejectApplicantBtnText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.negotiateApplicantBtn}
              activeOpacity={0.8}
              onPress={() => onNegotiate(app)}
            >
              <Text style={styles.negotiateApplicantBtnText}>Negotiate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptApplicantBtn}
              activeOpacity={0.8}
              onPress={() => onAccept(app)}
            >
              <Icon name="check" size={14} color={Colors.white} />
              <Text style={styles.acceptApplicantBtnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flexDirection: 'column', width: '100%', gap: 10, marginTop: 10 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <View
                style={[
                  styles.statusBadge,
                  isAccepted && styles.statusAccepted,
                  isRejected && styles.statusDeclined,
                  isNegotiating && { backgroundColor: 'rgba(180, 106, 116, 0.12)' },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    isAccepted && styles.statusAcceptedText,
                    isRejected && styles.statusDeclinedText,
                    isNegotiating && { color: Colors.roseDeep },
                  ]}
                >
                  {isAccepted
                    ? 'Accepted ✓'
                    : isRejected
                      ? 'Declined ✕'
                      : `Countered: ₹${((app.counterAmount || 0) / 100).toLocaleString()} (Awaiting Creator)`}
                </Text>
              </View>

              {isAccepted && (
                <TouchableOpacity
                  style={styles.reviewCollabBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/brand/campaign/collab/[id]' as any,
                      params: { id: app.id, campaignId },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.reviewCollabBtnText}>Review Progress</Text>
                  <Icon
                    name="chevron"
                    size={14}
                    color={Colors.oxblood}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  applicantCard: {
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.06)',
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  applicantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  applicantName: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
  },
  applicantHandle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.45)',
  },
  applicantMeta: {
    alignItems: 'flex-end',
  },
  applicantMetaVal: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    fontWeight: '800',
    color: Colors.roseDeep,
  },
  applicantMetaLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 9,
    color: 'rgba(63, 3, 11, 0.45)',
  },
  bidContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  bidItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bidLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: 'rgba(63, 3, 11, 0.55)',
  },
  bidText: {
    fontFamily: FontFamily.sans,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  counterBadge: {
    backgroundColor: 'rgba(180, 106, 116, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  counterText: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.roseDeep,
  },
  proposalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.05)',
    marginBottom: 12,
  },
  proposalLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Colors.rose,
    fontWeight: '700',
    marginBottom: 2,
  },
  proposalText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(42, 2, 7, 0.75)',
    fontStyle: 'italic',
  },
  applicantActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  acceptApplicantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.oxblood,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptApplicantBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.cream,
    fontWeight: '700',
  },
  rejectApplicantBtn: {
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectApplicantBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: 'rgba(63, 3, 11, 0.6)',
    fontWeight: '700',
  },
  negotiateApplicantBtn: {
    backgroundColor: Colors.rose,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  negotiateApplicantBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.white,
    fontWeight: '700',
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  statusAccepted: {
    backgroundColor: 'rgba(62,201,122,0.12)',
  },
  statusAcceptedText: {
    color: '#279a55',
  },
  statusDeclined: {
    backgroundColor: 'rgba(235,94,85,0.12)',
  },
  statusDeclinedText: {
    color: '#d93e36',
  },
  reviewCollabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.oxblood,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  reviewCollabBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Colors.oxblood,
    fontWeight: '700',
  },

});
