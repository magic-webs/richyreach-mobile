import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, MapPin, ExternalLink, Trophy, Coins, CheckCircle2, XCircle, Clock, FileText, UploadCloud, Camera, Award } from 'lucide-react-native';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { TactileButton } from '@/components/ui/tactile-button';
import { useProfilesStore } from '@/store/profiles';

const TYPE_LABELS: Record<string, string> = {
  reel_reach: 'Reel Reach',
  google_review: 'Google Review',
};

function LeaderboardRow({ rank, p }: { rank: number; p: any }) {
  return (
    <View style={styles.lbRow}>
      <View style={{ width: 28, alignItems: 'center', justifyContent: 'center' }}>
        {rank === 1 ? (
          <Trophy size={16} color={Colors.gold} />
        ) : rank === 2 ? (
          <Award size={16} color="#c0c0c0" />
        ) : rank === 3 ? (
          <Award size={16} color="#cd7f32" />
        ) : (
          <Text style={styles.lbRank}>{`#${rank}`}</Text>
        )}
      </View>
      <View style={styles.lbAvatar}>
        <Text style={styles.lbAvatarText}>{(p.name || '?')[0]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.lbName}>{p.name || 'Influencer'}</Text>
        <Text style={styles.lbHandle}>@{p.instagramHandle || '—'}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <View style={{ height: 20, justifyContent: 'center' }}>
          {p.verificationStatus === 'approved' ? (
            <CheckCircle2 size={16} color={Colors.green} />
          ) : p.verificationStatus === 'rejected' ? (
            <XCircle size={16} color={Colors.rose} />
          ) : (
            <Clock size={16} color="rgba(63, 3, 11, 0.45)" />
          )}
        </View>
        {p.accountReach > 0 && (
          <Text style={styles.lbReach}>{p.accountReach.toLocaleString()} views</Text>
        )}
        {p.coinsAwarded > 0 && (
          <Text style={styles.lbCoins}>+{p.coinsAwarded.toLocaleString()} coins</Text>
        )}
      </View>
    </View>
  );
}

export default function ArenaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showModal = useUIStore((s) => s.showModal);
  const queryClient = useQueryClient();
  const { activeInfluencerProfileId } = useProfilesStore();

  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const submitForm = useForm<{
    collaborationLink: string;
    reviewLink: string;
    reviewEmail: string;
    screenshotUrl: string;
  }>({
    mode: 'onSubmit',
    defaultValues: {
      collaborationLink: '',
      reviewLink: '',
      reviewEmail: '',
      screenshotUrl: '',
    },
  });

  const { data: arena, isLoading } = useQuery({
    queryKey: ['arena', id],
    queryFn: () => api.arena.get(id),
    enabled: !!id,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['arenaLeaderboard', id],
    queryFn: () => api.arena.leaderboard(id),
    enabled: !!id,
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['myParticipations', activeInfluencerProfileId],
    queryFn: () => api.arena.myParticipations(activeInfluencerProfileId),
    enabled: !!activeInfluencerProfileId,
  });

  const myParticipation = participations.find((p: any) => p.arenaId === id);
  const isJoined = !!myParticipation;
  const isGoogleReview = arena?.arenaType === 'google_review';

  const joinMutation = useMutation({
    mutationFn: () => api.arena.join(id, activeInfluencerProfileId),
    onSuccess: (newParticipant) => {
      // Optimistically update the participations cache to instantly reflect the joined status
      queryClient.setQueryData<any[]>(['myParticipations', activeInfluencerProfileId], (old = []) => {
        if (old.some((p: any) => p.arenaId === id)) return old;
        return [
          {
            ...newParticipant,
            arenaTitle: arena?.title,
            arenaType: arena?.arenaType,
            arenaStatus: arena?.status,
            arenaBannerUrl: arena?.bannerUrl,
            entryFeeCoins: arena?.entryFeeCoins,
          },
          ...old,
        ];
      });

      queryClient.invalidateQueries({ queryKey: ['myParticipations'] });
      queryClient.invalidateQueries({ queryKey: ['arena', id] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });

      showModal({
        title: 'Joined!',
        message: `You have joined "${arena?.title}". ${arena?.entryFeeCoins?.toLocaleString()} coins deducted. Now upload your submission!`,
      });
      setShowSubmitForm(true);
    },
    onError: (err: any) => showModal({ title: 'Join Failed', message: err.message }),
  });

  const submitMutation = useMutation({
    mutationFn: (data: { collaborationLink: string; reviewLink: string; reviewEmail: string; screenshotUrl: string }) =>
      isGoogleReview
        ? api.arena.submit(
          id,
          {
            reviewLink: data.reviewLink,
            reviewEmail: data.reviewEmail,
            screenshotUrl: data.screenshotUrl,
          },
          activeInfluencerProfileId
        )
        : api.arena.submit(id, { collaborationLink: data.collaborationLink }, activeInfluencerProfileId),
    onSuccess: (_, variables) => {
      // Optimistically update the myParticipations cache with the submitted details
      queryClient.setQueryData<any[]>(['myParticipations', activeInfluencerProfileId], (old = []) => {
        return old.map((p: any) => {
          if (p.arenaId === id) {
            return {
              ...p,
              postUrl: variables.collaborationLink || p.postUrl,
              reviewLink: variables.reviewLink || p.reviewLink,
              reviewEmail: variables.reviewEmail || p.reviewEmail,
              submissionUrl: variables.screenshotUrl || p.submissionUrl,
              verificationStatus: 'pending',
            };
          }
          return p;
        });
      });

      queryClient.invalidateQueries({ queryKey: ['myParticipations'] });
      queryClient.invalidateQueries({ queryKey: ['arenaLeaderboard', id] });
      submitForm.reset();
      showModal({
        title: 'Submission Uploaded!',
        message: 'Your entry has been submitted and is pending verification.',
      });
      setShowSubmitForm(false);
    },
    onError: (err: any) => showModal({ title: 'Submit Failed', message: err.message }),
  });

  const handlePickAndUploadScreenshot = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setUploadingImage(true);
      showModal({ title: 'Uploading Screenshot...', message: 'Uploading screenshot proof. Please wait...' });

      const selectedUri = result.assets[0].uri;
      const formData = new FormData();

      let extension = 'jpg';
      const cleanUri = selectedUri.split('?')[0].split('#')[0];
      const lastSegment = cleanUri.split('/').pop() || '';
      const dotParts = lastSegment.split('.');
      if (dotParts.length > 1) {
        const possibleExt = dotParts.pop()?.toLowerCase();
        if (possibleExt && ['png', 'jpg', 'jpeg', 'webp'].includes(possibleExt)) {
          extension = possibleExt;
        }
      }

      const filename = `review_screenshot.${extension}`;

      if (Platform.OS === 'web' || selectedUri.startsWith('blob:') || selectedUri.startsWith('data:')) {
        const response = await fetch(selectedUri);
        const blob = await response.blob();
        formData.append('file', blob, filename);
      } else {
        let formattedUri = selectedUri;
        if (!formattedUri.startsWith('file://') && !formattedUri.startsWith('content://')) {
          formattedUri = `file://${formattedUri}`;
        }
        formData.append('file', {
          uri: formattedUri,
          name: filename,
          type: `image/${extension === 'png' ? 'png' : 'jpeg'}`,
        } as any);
      }

      const uploadRes = await api.media.upload(formData);
      submitForm.setValue('screenshotUrl', uploadRes.url, { shouldValidate: true, shouldDirty: true });
      showModal({ title: 'Uploaded!', message: 'Screenshot proof uploaded successfully.' });
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      showModal({ title: 'Upload Failed', message: err.message || 'An error occurred during upload.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleJoin = () => {
    if (!arena) return;
    const isFree = arena.entryFeeCoins === 0;
    const message = isFree
      ? `Join "${arena.title}" for free. No entry fee for this Google Review arena.`
      : `Joining "${arena.title}" will deduct ${arena.entryFeeCoins?.toLocaleString()} coins (₹${(arena.entryFeeCoins / 100).toFixed(0)}) from your wallet. Continue?`;

    showModal({
      title: 'Join Arena',
      message: message,
      actions: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isFree ? 'Join Free' : 'Join & Pay',
          style: 'destructive',
          onPress: () => joinMutation.mutate(),
        },
      ],
    });
  };

  if (isLoading || !arena) {
    return (
      <View style={[styles.root, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.loadingText}>Loading arena...</Text>
      </View>
    );
  }

  const daysLeft = Math.max(0, Math.ceil((new Date(arena.endDate).getTime() - Date.now()) / 864e5));
  const winnerPool = Math.floor(arena.totalBudgetCoins * 0.5);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <ArrowLeft size={20} color={Colors.oxblood} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{arena.title}</Text>
            <Text style={styles.headerMeta}>
              {TYPE_LABELS[arena.arenaType] || arena.arenaType} · {daysLeft}d left
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 130 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Prize Pool</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                <Text style={[styles.statValue, { color: Colors.gold }]}>
                  {arena.totalBudgetCoins.toLocaleString()}
                </Text>
                <Coins size={14} color={Colors.gold} />
              </View>
              <Text style={styles.statSub}>
                = ₹{(arena.totalBudgetCoins / 100).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Entry Fee</Text>
              <Text style={styles.statValue}>{arena.entryFeeCoins.toLocaleString()} coins</Text>
              <Text style={styles.statSub}>= ₹{(arena.entryFeeCoins / 100).toFixed(0)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Joined</Text>
              <Text style={styles.statValue}>{arena.participantCount}</Text>
              <Text style={styles.statSub}>/ {arena.maxParticipants} max</Text>
            </View>
          </View>

          {/* Prize breakdown */}
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Trophy size={16} color={Colors.oxblood} />
              <Text style={styles.sectionTitle}>Prize Breakdown</Text>
            </View>
            <View style={styles.prizeCard}>
              {isGoogleReview ? (
                <View style={styles.prizeRow}>
                  <Text style={styles.prizeRowLabel}>Per Verified Review</Text>
                  <Text style={[styles.prizeRowValue, { color: Colors.gold }]}>
                    {(arena.rewardPerReview || 2500).toLocaleString()} coins
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.prizeRow}>
                    <Text style={styles.prizeRowLabel}>Winner Prize (50%)</Text>
                    <Text style={[styles.prizeRowValue, { color: Colors.gold }]}>
                      {winnerPool.toLocaleString()} coins
                    </Text>
                  </View>
                  <View style={styles.prizeRow}>
                    <Text style={styles.prizeRowLabel}>Others (50% split by reach)</Text>
                    <Text style={styles.prizeRowValue}>
                      {(arena.totalBudgetCoins - winnerPool).toLocaleString()} coins
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Google Review business info */}
          {isGoogleReview && arena.businessName && (
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <MapPin size={16} color={Colors.oxblood} />
                <Text style={styles.sectionTitle}>Business to Review</Text>
              </View>
              <View style={styles.businessCard}>
                <Text style={styles.businessName}>{arena.businessName}</Text>
                {arena.googleMapsLink && (
                  <TouchableOpacity
                    style={styles.mapsBtn}
                    onPress={() => Linking.openURL(arena.googleMapsLink).catch(() => { })}
                    activeOpacity={0.8}
                  >
                    <MapPin size={14} color={Colors.green} />
                    <Text style={styles.mapsBtnText}>Open Google Maps</Text>
                    <ExternalLink size={13} color={Colors.green} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Guidelines */}
          {arena.reviewGuidelines && (
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <FileText size={16} color={Colors.oxblood} />
                <Text style={styles.sectionTitle}>Guidelines</Text>
              </View>
              <View style={styles.guideCard}>
                <Text style={styles.guideText}>{arena.reviewGuidelines}</Text>
              </View>
            </View>
          )}

          {/* My participation status */}
          {isJoined && myParticipation && (
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Trophy size={16} color={Colors.oxblood} />
                <Text style={styles.sectionTitle}>My Status</Text>
              </View>
              <View style={styles.myStatusCard}>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Verification</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {myParticipation.verificationStatus === 'approved' ? (
                      <CheckCircle2 size={14} color={Colors.green} />
                    ) : myParticipation.verificationStatus === 'rejected' ? (
                      <XCircle size={14} color={Colors.rose} />
                    ) : (
                      <Clock size={14} color="rgba(63, 3, 11, 0.45)" />
                    )}
                    <Text style={styles.statusValue}>
                      {myParticipation.verificationStatus === 'approved'
                        ? 'Approved'
                        : myParticipation.verificationStatus === 'rejected'
                          ? 'Rejected'
                          : 'Pending'}
                    </Text>
                  </View>
                </View>
                {myParticipation.coinsAwarded > 0 && (
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Earned</Text>
                    <Text style={[styles.statusValue, { color: Colors.gold }]}>
                      +{myParticipation.coinsAwarded.toLocaleString()} coins
                    </Text>
                  </View>
                )}

                {/* Submission Details */}
                {(myParticipation.postUrl || myParticipation.reviewLink) && (
                  <View style={styles.submissionDetails}>
                    <Text style={styles.detailsTitle}>Current Submission Details:</Text>
                    {myParticipation.reviewEmail && (
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsLabel}>Email:</Text>
                        <Text style={styles.detailsVal}>{myParticipation.reviewEmail}</Text>
                      </View>
                    )}
                    {myParticipation.reviewLink && (
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsLabel}>Review Link:</Text>
                        <Text
                          style={[styles.detailsVal, { color: Colors.green, textDecorationLine: 'underline' }]}
                          onPress={() => Linking.openURL(myParticipation.reviewLink).catch(() => {})}
                        >
                          Open Review
                        </Text>
                      </View>
                    )}
                    {myParticipation.postUrl && (
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsLabel}>Reel Link:</Text>
                        <Text
                          style={[styles.detailsVal, { color: Colors.green, textDecorationLine: 'underline' }]}
                          onPress={() => Linking.openURL(myParticipation.postUrl).catch(() => {})}
                        >
                          Open Reel
                        </Text>
                      </View>
                    )}
                    {myParticipation.submissionUrl && (
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsLabel}>Screenshot:</Text>
                        <Image
                          source={{ uri: myParticipation.submissionUrl }}
                          style={styles.detailsScreenshot}
                          contentFit="contain"
                        />
                      </View>
                    )}
                  </View>
                )}

                {/* Submit / resubmit form toggle */}
                {myParticipation.verificationStatus !== 'approved' && (
                  <TouchableOpacity
                    style={styles.toggleSubmitBtn}
                    onPress={() => setShowSubmitForm(!showSubmitForm)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.toggleSubmitBtnText}>
                      {showSubmitForm
                        ? 'Hide Form'
                        : (myParticipation.postUrl || myParticipation.reviewLink)
                          ? 'Resubmit Entry'
                          : 'Upload Submission'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Submission form */}
          {isJoined && showSubmitForm && (
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <UploadCloud size={16} color={Colors.cream} />
                <Text style={styles.sectionTitle}>Submit Entry</Text>
              </View>
              <View style={styles.submitForm}>
                {!isGoogleReview && (
                  <Controller
                    control={submitForm.control}
                    name="collaborationLink"
                    rules={{
                      required: 'Collaboration link is required',
                      validate: (v) =>
                        v.includes('instagram.com') || 'Must be a valid Instagram URL',
                    }}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <View style={styles.formField}>
                        <Text style={styles.formLabel}>Instagram Collaboration Link *</Text>
                        <TextInput
                          style={[styles.formInput, error && styles.formInputError]}
                          placeholder="https://www.instagram.com/reel/..."
                          placeholderTextColor="rgba(232,216,204,0.3)"
                          value={value}
                          onChangeText={onChange}
                          keyboardType="url"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        {error ? (
                          <Text style={styles.formError}>{error.message}</Text>
                        ) : (
                          <Text style={styles.formHint}>
                            {'Invite @richyreach_official' +
                              (arena.brandInstagramPage ? ` and @${arena.brandInstagramPage}` : '') +
                              ' as collaborators on your reel, then paste the link here. Reach is auto-fetched.'}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                )}
                {isGoogleReview && (
                  <>
                    {/* Review Link */}
                    <Controller
                      control={submitForm.control}
                      name="reviewLink"
                      rules={{ required: 'Google Review link is required' }}
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <View style={styles.formField}>
                          <Text style={styles.formLabel}>Google Review Link *</Text>
                          <TextInput
                            style={[styles.formInput, error && styles.formInputError]}
                            placeholder="https://maps.google.com/...your-review..."
                            placeholderTextColor="rgba(232,216,204,0.3)"
                            value={value}
                            onChangeText={onChange}
                            keyboardType="url"
                            autoCapitalize="none"
                            autoCorrect={false}
                          />
                          {error && <Text style={styles.formError}>{error.message}</Text>}
                        </View>
                      )}
                    />

                    {/* Review Email */}
                    <Controller
                      control={submitForm.control}
                      name="reviewEmail"
                      rules={{
                        required: 'Google Account Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      }}
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <View style={styles.formField}>
                          <Text style={styles.formLabel}>Google Account Email *</Text>
                          <TextInput
                            style={[styles.formInput, error && styles.formInputError]}
                            placeholder="e.g. yourname@gmail.com"
                            placeholderTextColor="rgba(232,216,204,0.3)"
                            value={value}
                            onChangeText={onChange}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                          />
                          <Text style={styles.formHint}>The email address visible on your Google review.</Text>
                          {error && <Text style={styles.formError}>{error.message}</Text>}
                        </View>
                      )}
                    />

                    {/* Screenshot Proof */}
                    <Controller
                      control={submitForm.control}
                      name="screenshotUrl"
                      rules={{ required: 'Screenshot proof is required' }}
                      render={({ field: { value }, fieldState: { error } }) => (
                        <View style={styles.formField}>
                          <Text style={styles.formLabel}>Screenshot of Review *</Text>
                          {value ? (
                            <View style={styles.screenshotPreviewCard}>
                              <Image source={{ uri: value }} style={styles.screenshotPreviewImage} contentFit="contain" />
                              <TouchableOpacity
                                style={styles.changeScreenshotBtn}
                                onPress={handlePickAndUploadScreenshot}
                              >
                                <Text style={styles.changeScreenshotBtnText}>Change Image</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={[styles.uploadBox, error && styles.uploadBoxError]}
                              onPress={handlePickAndUploadScreenshot}
                              activeOpacity={0.8}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Camera size={16} color={Colors.cream} />
                                <Text style={styles.uploadBoxText}>
                                  {uploadingImage ? 'Uploading screenshot...' : 'Select Screenshot'}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          )}
                          {error && <Text style={styles.formError}>{error.message}</Text>}
                        </View>
                      )}
                    />
                  </>
                )}

                <TactileButton
                  text={submitMutation.isPending ? 'Submitting...' : 'Submit Entry'}
                  variant="green"
                  fullWidth
                  onPress={submitForm.handleSubmit((data) => submitMutation.mutate(data))}
                  loading={submitMutation.isPending}
                />
              </View>
            </View>
          )}

          {/* Leaderboard */}
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Trophy size={16} color={Colors.cream} />
              <Text style={styles.sectionTitle}>Leaderboard</Text>
            </View>
            {leaderboard.length === 0 ? (
              <View style={styles.emptyLb}>
                <Text style={styles.emptyLbText}>No participants yet — be the first!</Text>
              </View>
            ) : (
              <View style={styles.lbList}>
                {leaderboard.map((p: any, i: number) => (
                  <LeaderboardRow key={p.id} rank={i + 1} p={p} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Join CTA */}
        {!isJoined && arena.status === 'active' && (
          <View style={[styles.joinCta, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.joinCtaInfo}>
              <Text style={styles.joinCtaLabel}>Entry Fee</Text>
              {arena.entryFeeCoins === 0 ? (
                <Text style={[styles.joinCtaCoins, { color: Colors.green }]}>Free</Text>
              ) : (
                <Text style={styles.joinCtaCoins}>
                  {arena.entryFeeCoins.toLocaleString()} coins = ₹{(arena.entryFeeCoins / 100).toFixed(0)}
                </Text>
              )}
            </View>
            <TactileButton
              text={joinMutation.isPending ? 'Joining...' : 'Join Arena'}
              variant="rose"
              onPress={handleJoin}
              loading={joinMutation.isPending}
              size="lg"
            />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  loadingText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    color: Colors.oxblood,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.08)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  headerMeta: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.5)',
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cream,
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.1)',
    gap: 2,
    ...Shadow.card,
  },
  statLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 9.5,
    color: 'rgba(63, 3, 11, 0.5)',
  },
  statValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  statSub: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10,
    color: 'rgba(63, 3, 11, 0.4)',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  prizeCard: {
    backgroundColor: Colors.cream,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.1)',
    gap: 8,
    ...Shadow.card,
  },
  prizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prizeRowLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(63, 3, 11, 0.5)',
  },
  prizeRowValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  businessCard: {
    backgroundColor: Colors.cream,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.1)',
    gap: 10,
    ...Shadow.card,
  },
  businessName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15.5,
    fontWeight: '700',
    color: Colors.oxbloodDeep,
  },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(42,122,90,0.15)',
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  mapsBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.green,
    fontWeight: '700',
  },
  guideCard: {
    backgroundColor: Colors.cream,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.1)',
    ...Shadow.card,
  },
  guideText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(63, 3, 11, 0.7)',
    lineHeight: 19,
  },
  myStatusCard: {
    backgroundColor: Colors.cream,
    borderRadius: Radius.lg,
    padding: 16,
    gap: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.1)',
    ...Shadow.card,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(63, 3, 11, 0.55)',
  },
  statusValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  toggleSubmitBtn: {
    backgroundColor: 'rgba(63, 3, 11, 0.06)',
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'center',
    marginTop: 4,
  },
  toggleSubmitBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  submitForm: {
    backgroundColor: Colors.cream,
    borderRadius: Radius.lg,
    padding: 16,
    gap: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.1)',
    ...Shadow.card,
  },
  formField: { gap: 6 },
  formHint: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.45)',
    lineHeight: 17,
  },
  formError: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: Colors.rose,
  },
  formInputError: {
    borderColor: Colors.rose,
  },
  formLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(63, 3, 11, 0.7)',
  },
  formInput: {
    backgroundColor: 'rgba(63, 3, 11, 0.03)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: FontFamily.sansRegular,
    fontSize: 13.5,
    color: Colors.oxblood,
  },
  lbList: {
    backgroundColor: Colors.cream,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.1)',
    ...Shadow.card,
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.07)',
  },
  lbRank: { fontSize: 16, minWidth: 28, textAlign: 'center', color: 'rgba(63, 3, 11, 0.5)' },
  lbAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbAvatarText: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.oxblood,
  },
  lbName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    color: Colors.oxblood,
  },
  lbHandle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.4)',
  },
  lbStatus: { fontSize: 15 },
  lbReach: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10.5,
    color: 'rgba(63, 3, 11, 0.4)',
  },
  lbCoins: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  emptyLb: {
    backgroundColor: Colors.cream,
    borderRadius: Radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.1)',
    ...Shadow.card,
  },
  emptyLbText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13.5,
    color: 'rgba(63, 3, 11, 0.4)',
    textAlign: 'center',
  },
  joinCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 99,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(244, 236, 228, 0.96)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(63, 3, 11, 0.08)',
  },
  joinCtaInfo: { gap: 2 },
  joinCtaLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10,
    color: 'rgba(63, 3, 11, 0.5)',
  },
  joinCtaCoins: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.oxblood,
  },
  screenshotPreviewCard: {
    backgroundColor: 'rgba(63, 3, 11, 0.03)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.1)',
    padding: 10,
    alignItems: 'center',
    gap: 10,
  },
  screenshotPreviewImage: {
    width: '100%',
    height: 200,
    borderRadius: Radius.sm,
  },
  changeScreenshotBtn: {
    backgroundColor: 'rgba(63, 3, 11, 0.08)',
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeScreenshotBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.oxblood,
  },
  uploadBox: {
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(63, 3, 11, 0.2)',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBoxError: {
    borderColor: Colors.rose,
  },
  uploadBoxText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  submissionDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(63, 3, 11, 0.08)',
    gap: 8,
  },
  detailsTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(63, 3, 11, 0.7)',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailsLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(63, 3, 11, 0.45)',
    minWidth: 90,
  },
  detailsVal: {
    flex: 1,
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.oxblood,
    textAlign: 'right',
  },
  detailsScreenshot: {
    width: 120,
    height: 120,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
  },
});
