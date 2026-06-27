import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { CounterOfferSheet } from '@/components/brand/CounterOfferSheet';
import { CampaignHeader } from '@/components/brand/campaign/CampaignHeader';
import { CampaignBriefSection } from '@/components/brand/campaign/CampaignBriefSection';
import { CampaignTargetingSection } from '@/components/brand/campaign/CampaignTargetingSection';
import { CampaignBudgetSection } from '@/components/brand/campaign/CampaignBudgetSection';
import { CampaignGuidelinesSection } from '@/components/brand/campaign/CampaignGuidelinesSection';
import { ApplicantCard } from '@/components/brand/campaign/ApplicantCard';
import { EditMediaCard } from '@/components/brand/campaign/EditMediaCard';
import { EditBasicsCard } from '@/components/brand/campaign/EditBasicsCard';
import { EditDeliverablesCard } from '@/components/brand/campaign/EditDeliverablesCard';
import { EditRewardsCard } from '@/components/brand/campaign/EditRewardsCard';
import { EditTargetingCard } from '@/components/brand/campaign/EditTargetingCard';
import { EditGuidelinesCard } from '@/components/brand/campaign/EditGuidelinesCard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProfilesStore } from '@/store/profiles';
import * as ImagePicker from 'expo-image-picker';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showModal = useUIStore((s) => s.showModal);
  const activeProfileId = useProfilesStore((s) => s.activeProfileId);
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [saving, setSaving] = useState(false);

  const { data: queryData, isLoading: loading, error } = useQuery<any>({
    queryKey: ['brandCampaign', id],
    queryFn: () => api.campaigns.get(id),
    enabled: !!id,
    refetchInterval: 15_000,
  });

  const campaign = queryData?.campaign || queryData;
  console.log(JSON.stringify(campaign, null, 2));

  // ── Local Form State ─────────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Fashion');
  const [objective, setObjective] = useState('Brand Awareness');
  const [location, setLocation] = useState('Pan India');
  const [priority, setPriority] = useState('normal');
  const [reelCount, setReelCount] = useState('0');
  const [storyCount, setStoryCount] = useState('0');
  const [paymentType, setPaymentType] = useState('Paid');
  const [costPerCreator, setCostPerCreator] = useState('5000');
  const [numCreators, setNumCreators] = useState('5');
  const [prodName, setProdName] = useState('');
  const [prodValue, setProdValue] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodUrl, setProdUrl] = useState('');
  const [prodShipping, setProdShipping] = useState('');
  const [minFollowers, setMinFollowers] = useState('10000');
  const [targetGender, setTargetGender] = useState('All');
  const [targetAgeRange, setTargetAgeRange] = useState('25-34');
  const [customAgeRange, setCustomAgeRange] = useState('');
  const [creatorSize, setCreatorSize] = useState('Micro (10K-100K)');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [mustMention, setMustMention] = useState('');
  const [cta, setCta] = useState('Visit Website');
  const [hashtags, setHashtags] = useState('');
  const [brandTone, setBrandTone] = useState('Fun');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-30');
  const [applicationDeadline, setApplicationDeadline] = useState('2026-06-25');
  const [bannerUrl, setBannerUrl] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [brandName, setBrandName] = useState('');

  // ── Tab bar / floating chat visibility ────────────────────────────────────
  useEffect(() => {
    const setTabBarVisible = useUIStore.getState().setTabBarVisible;
    const setFloatingChatVisible = useUIStore.getState().setFloatingChatVisible;
    setTabBarVisible(false);
    setFloatingChatVisible(false);
    return () => {
      setTabBarVisible(true);
      setFloatingChatVisible(true);
    };
  }, []);

  // ── Sync campaign data to local state ─────────────────────────────────────
  useEffect(() => {
    if (campaign) {
      setTitle(campaign.title || '');
      setDescription(campaign.description || '');
      setCategory(campaign.category || 'Fashion');
      setBannerUrl(campaign.bannerUrl || campaign.imageUrl);

      const brief = campaign.briefDetails
        ? typeof campaign.briefDetails === 'string'
          ? JSON.parse(campaign.briefDetails)
          : campaign.briefDetails
        : {};

      setBrandName(brief.brandName || campaign.brandName || '');
      setObjective(brief.objective || campaign.objective || 'Brand Awareness');
      setPriority(brief.priority || campaign.priority || 'normal');
      setLocation(brief.location || campaign.location || 'Pan India');

      const deliverables = brief.deliverables || [];
      const reel = deliverables.find((d: any) => d.type === 'reel');
      const story = deliverables.find((d: any) => d.type === 'story');
      setReelCount(String(reel?.quantity ?? campaign.reelCount ?? 0));
      setStoryCount(String(story?.quantity ?? campaign.storyCount ?? 0));

      setPaymentType(brief.paymentType || campaign.paymentType || 'Paid');
      setCostPerCreator(String(brief.costPerCreator ?? campaign.costPerCreator ?? 0));
      setNumCreators(String(brief.numCreators ?? campaign.numCreators ?? 1));

      const prod = brief.productInfo || {};
      setProdName(prod.name || campaign.prodName || '');
      setProdValue(String(prod.value ?? campaign.prodValue ?? ''));
      setProdDescription(prod.description || campaign.prodDescription || '');
      setProdSku(prod.sku || campaign.prodSku || '');
      setProdUrl(prod.url || campaign.prodUrl || '');
      setProdShipping(prod.shippingDetails || campaign.prodShipping || '');

      setMinFollowers(String(brief.minFollowers ?? campaign.minFollowers ?? 10000));
      setTargetGender(brief.gender || campaign.gender || 'All');

      const age = brief.ageRange || campaign.ageRange || '25–34';
      if (['18–24', '25–34', '35–44'].includes(age)) {
        setTargetAgeRange(age);
        setCustomAgeRange('');
      } else {
        setTargetAgeRange('Custom');
        setCustomAgeRange(age);
      }

      setCreatorSize(brief.creatorSize || campaign.creatorSize || 'Micro (10K-100K)');
      setTargetLanguage(brief.languages?.[0] || campaign.targetLanguage || 'English');

      const guide = brief.guidelines || {};
      setMustMention(
        guide.mustMention ? guide.mustMention.join(', ') : campaign.mustMention || ''
      );
      setCta(guide.cta || campaign.cta || 'Visit Website');
      setHashtags(
        guide.hashtags ? guide.hashtags.join(', ') : campaign.hashtags || ''
      );
      setBrandTone(guide.brandTone || campaign.brandTone || 'Fun');

      const time = brief.timeline || {};
      setStartDate(time.startDate || campaign.startDate || '2026-07-01');
      setEndDate(time.endDate || campaign.endDate || '2026-07-30');
      setApplicationDeadline(
        time.applicationDeadline || campaign.applicationDeadline || '2026-06-25'
      );

      const media = brief.mediaUploads || {};
      setReferenceLinks(
        media.referenceLinks ? media.referenceLinks.join(', ') : campaign.referenceLinks || ''
      );
      setAudioUrl(media.audioInstructionUrl || campaign.audioInstructionUrl || '');
    }
  }, [campaign, mode]);

  // ── Audio Player ──────────────────────────────────────────────────────────
  const player = useAudioPlayer(audioUrl || undefined);
  const playerStatus = useAudioPlayerStatus(player);

  const handlePlayPause = () => {
    if (playerStatus.playing) {
      player.pause();
    } else {
      player.seekTo(0);
      player.play();
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ── Image Picker ──────────────────────────────────────────────────────────
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      try {
        setSaving(true);
        showModal({ title: 'Uploading Image...', message: 'Uploading new banner image to R2 storage...' });

        const formData = new FormData();
        const extension = selectedUri.split('.').pop() || 'jpg';
        const filename = `banner.${extension}`;

        if (Platform.OS === 'web' || selectedUri.startsWith('blob:') || selectedUri.startsWith('data:')) {
          const response = await fetch(selectedUri);
          const blob = await response.blob();
          formData.append('file', blob, filename);
        } else {
          let formattedUri = selectedUri;
          if (!formattedUri.startsWith('file://') && !formattedUri.startsWith('content://')) {
            formattedUri = `file://${formattedUri}`;
          }
          formData.append('file', { uri: formattedUri, name: filename, type: `image/${extension}` } as any);
        }

        const uploadRes = await api.media.upload(formData, activeProfileId);
        setBannerUrl(uploadRes.url);
        showModal({ title: 'Upload Successful', message: 'Campaign banner updated successfully.' });
      } catch (err: any) {
        console.error('Failed to upload banner:', err);
        showModal({ title: 'Upload Failed', message: err.message || 'Failed to upload new banner image.' });
      } finally {
        setSaving(false);
      }
    }
  };

  // ── Share ─────────────────────────────────────────────────────────────────
  const handleShareCampaign = async () => {
    try {
      const shareUrl = `https://app.richyreach.com/shared/${id}`;
      await Share.share({
        message: `Check out this campaign "${title}" on RichyReach! View details here: ${shareUrl}`,
      });
    } catch (err) {
      console.error('Failed to share campaign:', err);
    }
  };

  // ── Update Campaign ───────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!title.trim() || !brandName.trim() || !description.trim()) {
      showModal({
        title: 'Validation Error',
        message: 'Campaign Name, Brand Profile, and Description are required.',
      });
      return;
    }

    setSaving(true);
    try {
      const parsedReel = parseInt(reelCount) || 0;
      const parsedStory = parseInt(storyCount) || 0;
      const deliverables = [];
      if (parsedReel > 0) deliverables.push({ type: 'reel', quantity: parsedReel });
      if (parsedStory > 0) deliverables.push({ type: 'story', quantity: parsedStory });

      const updatedBrief = {
        brandName,
        objective,
        priority,
        location,
        gender: targetGender,
        ageRange: targetAgeRange === 'Custom' ? customAgeRange : targetAgeRange,
        creatorSize,
        paymentType,
        minFollowers: parseInt(minFollowers) || 10000,
        languages: [targetLanguage],
        deliverables,
        costPerCreator: paymentType === 'Barter' ? 0 : parseInt(costPerCreator) || 0,
        numCreators: paymentType === 'Barter' ? 1 : parseInt(numCreators) || 1,
        productInfo:
          paymentType !== 'Paid'
            ? {
                name: prodName,
                value: parseInt(prodValue) || 0,
                description: prodDescription,
                sku: prodSku,
                url: prodUrl,
                shippingDetails: prodShipping,
              }
            : null,
        guidelines: {
          mustMention: mustMention ? mustMention.split(',').map((s) => s.trim()).filter(Boolean) : [],
          cta,
          hashtags: hashtags ? hashtags.split(',').map((s) => s.trim()).filter(Boolean) : [],
          brandTone,
        },
        timeline: { startDate, endDate, applicationDeadline },
        mediaUploads: {
          referenceLinks: referenceLinks ? referenceLinks.split(',').map((s) => s.trim()).filter(Boolean) : [],
          audioInstructionUrl: audioUrl,
          bannerUrl,
        },
      };

      const finalCost = paymentType === 'Barter' ? 0 : parseInt(costPerCreator) || 0;
      const finalCreators = paymentType === 'Barter' ? 1 : parseInt(numCreators) || 1;
      const budget = finalCost * finalCreators * 100;

      await api.campaigns.update(id, {
        title,
        description,
        budget,
        expectedReach: 250000,
        category,
        briefDetails: updatedBrief,
      });

      showModal({
        title: 'Campaign Updated',
        message: `Your campaign "${title}" has been successfully updated.`,
      });
      queryClient.invalidateQueries({ queryKey: ['brandCampaign', id] });
      queryClient.invalidateQueries({ queryKey: ['brandCampaigns', activeProfileId] });
      setMode('view');
    } catch (err: any) {
      console.error('Failed to update campaign:', err);
      showModal({
        title: 'Update Failed',
        message: err.message || 'An error occurred while updating the campaign details.',
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Delete Campaign ───────────────────────────────────────────────────────
  const handleDelete = () => {
    showModal({
      title: 'Delete Campaign',
      message: 'Are you sure you want to delete this campaign? This action is permanent and cannot be undone.',
      actions: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.campaigns.delete(id);
              showModal({ title: 'Campaign Deleted', message: 'The campaign has been removed successfully.' });
              queryClient.invalidateQueries({ queryKey: ['brandCampaigns', activeProfileId] });
              router.replace('/brand/index' as any);
            } catch (err: any) {
              console.error('Failed to delete campaign:', err);
              showModal({ title: 'Delete Failed', message: err.message || 'An error occurred while deleting the campaign.' });
            }
          },
        },
      ],
    });
  };

  // ── Applicant actions ─────────────────────────────────────────────────────
  const [negotiatingApp, setNegotiatingApp] = useState<any>(null);
  const [counterSubmitting, setCounterSubmitting] = useState(false);
  const [expandedCollabAppId, setExpandedCollabAppId] = useState<string | null>(null);

  const reviewScriptMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: 'approved' | 'rejected' }) =>
      api.brands.reviewScript(appId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brandCampaign', id] });
      showModal({ title: 'Success', message: 'Script status updated successfully!' });
    },
    onError: (err: any) => {
      showModal({ title: 'Error', message: err.message || 'Failed to update script status' });
    },
  });

  const completeCollabMutation = useMutation({
    mutationFn: (appId: string) => api.brands.completeCollaboration(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brandCampaign', id] });
      showModal({ title: 'Success', message: 'Collaboration marked as complete! 🎉' });
    },
    onError: (err: any) => {
      showModal({ title: 'Error', message: err.message || 'Failed to complete collaboration' });
    },
  });

  const handleAcceptApplicant = async (app: any) => {
    try {
      const res: any = await api.brands.acceptApplication(app.id);
      queryClient.invalidateQueries({ queryKey: ['brandCampaign', id] });
      showModal({
        title: 'Application Accepted',
        message: `You accepted ${app.name || app.instagramHandle}'s application. Navigating to the chat room...`,
        actions: [
          {
            text: 'Go to Chat',
            onPress: () => router.push({ pathname: '/brand/chat/[id]' as any, params: { id: res.roomId } }),
          },
        ],
      });
    } catch (err: any) {
      console.error('Failed to accept applicant:', err);
      showModal({ title: 'Error', message: err.message || 'Failed to accept application.' });
    }
  };

  const handleRejectApplicant = async (app: any) => {
    try {
      await api.brands.rejectApplication(app.id);
      queryClient.invalidateQueries({ queryKey: ['brandCampaign', id] });
      showModal({
        title: 'Application Rejected',
        message: `Successfully rejected application from ${app.name || app.instagramHandle}.`,
      });
    } catch (err: any) {
      console.error('Failed to reject applicant:', err);
      showModal({ title: 'Error', message: err.message || 'Failed to reject application.' });
    }
  };

  const handleNegotiateSubmit = async (counterAmount: number) => {
    if (!negotiatingApp) return;
    setCounterSubmitting(true);
    try {
      await api.brands.negotiateApplication(negotiatingApp.id, counterAmount);
      setNegotiatingApp(null);
      queryClient.invalidateQueries({ queryKey: ['brandCampaign', id] });
      showModal({
        title: 'Counter Offer Proposed',
        message: `You proposed a counter-offer of ₹${counterAmount.toLocaleString()} to ${negotiatingApp.name || negotiatingApp.instagramHandle}.`,
      });
    } catch (err: any) {
      console.error('Failed to send counter-offer:', err);
      showModal({ title: 'Error', message: err.message || 'Failed to send counter-offer.' });
    } finally {
      setCounterSubmitting(false);
    }
  };

  // ── Loading / Error States ────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.oxblood} />
        <Text style={styles.loadingText}>Fetching campaign details...</Text>
      </View>
    );
  }

  if (error || !campaign) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="x" size={40} color={Colors.roseDeep} />
        <Text style={styles.errorText}>Failed to retrieve campaign details.</Text>
        <TouchableOpacity style={styles.backBtnLarge} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const brief = campaign.briefDetails
    ? typeof campaign.briefDetails === 'string'
      ? JSON.parse(campaign.briefDetails)
      : campaign.briefDetails
    : {};

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* Navigation Bar */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navBackBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Icon name="back" size={22} color={Colors.oxblood} />
          </TouchableOpacity>
          <Text style={styles.navTitle} numberOfLines={1}>
            {mode === 'edit' ? 'Edit Campaign' : 'Campaign Details'}
          </Text>
          {mode === 'view' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity onPress={handleShareCampaign} activeOpacity={0.8} style={{ padding: 4 }}>
                <Icon name="share" size={20} color={Colors.oxblood} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.editHeaderBtn} onPress={() => setMode('edit')} activeOpacity={0.8}>
                <Text style={styles.editHeaderText}>Edit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.editHeaderBtn} onPress={() => setMode('view')} activeOpacity={0.8}>
              <Text style={styles.cancelHeaderText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        >
          {mode === 'view' ? (
            // ══════════════════════════════════════════
            // VIEW MODE
            // ══════════════════════════════════════════
            <View style={{ gap: 20 }}>
              <CampaignHeader
                bannerUrl={bannerUrl}
                priority={brief.priority}
                category={category}
                title={title}
                brandName={brief.brandName}
              />

              <CampaignBriefSection
                description={description}
                startDate={startDate}
                endDate={endDate}
                applicationDeadline={applicationDeadline}
                reelCount={reelCount}
                storyCount={storyCount}
                formatDate={formatDate}
              />

              <CampaignTargetingSection
                minFollowers={minFollowers}
                creatorSize={creatorSize}
                targetGender={targetGender}
                targetAgeRange={targetAgeRange}
                customAgeRange={customAgeRange}
                targetLanguage={targetLanguage}
                location={location}
              />

              <CampaignBudgetSection
                paymentType={paymentType}
                costPerCreator={costPerCreator}
                numCreators={numCreators}
                prodName={prodName}
                prodValue={prodValue}
                prodSku={prodSku}
                prodUrl={prodUrl}
                prodDescription={prodDescription}
                prodShipping={prodShipping}
              />

              <CampaignGuidelinesSection
                cta={cta}
                brandTone={brandTone}
                hashtags={hashtags}
                mustMention={mustMention}
                audioUrl={audioUrl}
                referenceLinks={referenceLinks}
                playerPlaying={playerStatus.playing}
                playerCurrentTime={playerStatus.currentTime}
                playerDuration={playerStatus.duration ?? 0}
                onPlayPause={handlePlayPause}
                formatDuration={formatDuration}
              />

              {/* Applicants Section */}
              {queryData?.applications && queryData.applications.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionHeading}>
                    Applicants ({queryData.applications.length})
                  </Text>
                  <View style={{ gap: 16, marginTop: 8 }}>
                    {queryData.applications.map((app: any) => (
                      <ApplicantCard
                        key={app.id}
                        app={app}
                        expandedCollabAppId={expandedCollabAppId}
                        onToggleCollab={(appId) =>
                          setExpandedCollabAppId(expandedCollabAppId === appId ? null : appId)
                        }
                        onAccept={handleAcceptApplicant}
                        onReject={handleRejectApplicant}
                        onNegotiate={setNegotiatingApp}
                        onReviewScript={(appId, status) =>
                          reviewScriptMutation.mutate({ appId, status })
                        }
                        onCompleteCollab={(appId) => completeCollabMutation.mutate(appId)}
                        reviewScriptPending={reviewScriptMutation.isPending}
                        completeCollabPending={completeCollabMutation.isPending}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Delete Button */}
              <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.8} onPress={handleDelete}>
                <Icon name="x" size={16} color={Colors.roseDeep} />
                <Text style={styles.deleteBtnText}>Delete Campaign</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // ══════════════════════════════════════════
            // EDIT MODE
            // ══════════════════════════════════════════
            <View style={{ gap: 20 }}>
              <EditMediaCard
                bannerUrl={bannerUrl}
                title={title}
                brandName={brandName}
                onPickImage={pickImage}
                onChangeTitle={setTitle}
                onChangeBrandName={setBrandName}
              />

              <EditBasicsCard
                category={category}
                objective={objective}
                description={description}
                priority={priority}
                onChangeCategory={setCategory}
                onChangeObjective={setObjective}
                onChangeDescription={setDescription}
                onChangePriority={setPriority}
              />

              <EditDeliverablesCard
                reelCount={reelCount}
                storyCount={storyCount}
                startDate={startDate}
                endDate={endDate}
                applicationDeadline={applicationDeadline}
                onChangeReelCount={setReelCount}
                onChangeStoryCount={setStoryCount}
                onChangeStartDate={setStartDate}
                onChangeEndDate={setEndDate}
                onChangeApplicationDeadline={setApplicationDeadline}
              />

              <EditRewardsCard
                paymentType={paymentType}
                costPerCreator={costPerCreator}
                numCreators={numCreators}
                prodName={prodName}
                prodValue={prodValue}
                prodSku={prodSku}
                prodUrl={prodUrl}
                prodDescription={prodDescription}
                prodShipping={prodShipping}
                onChangePaymentType={setPaymentType}
                onChangeCostPerCreator={setCostPerCreator}
                onChangeNumCreators={setNumCreators}
                onChangeProdName={setProdName}
                onChangeProdValue={setProdValue}
                onChangeProdSku={setProdSku}
                onChangeProdUrl={setProdUrl}
                onChangeProdDescription={setProdDescription}
                onChangeProdShipping={setProdShipping}
              />

              <EditTargetingCard
                minFollowers={minFollowers}
                creatorSize={creatorSize}
                targetGender={targetGender}
                targetAgeRange={targetAgeRange}
                customAgeRange={customAgeRange}
                targetLanguage={targetLanguage}
                location={location}
                onChangeMinFollowers={setMinFollowers}
                onChangeCreatorSize={setCreatorSize}
                onChangeTargetGender={setTargetGender}
                onChangeTargetAgeRange={setTargetAgeRange}
                onChangeCustomAgeRange={setCustomAgeRange}
                onChangeTargetLanguage={setTargetLanguage}
                onChangeLocation={setLocation}
              />

              <EditGuidelinesCard
                cta={cta}
                brandTone={brandTone}
                hashtags={hashtags}
                mustMention={mustMention}
                referenceLinks={referenceLinks}
                onChangeCta={setCta}
                onChangeBrandTone={setBrandTone}
                onChangeHashtags={setHashtags}
                onChangeMustMention={setMustMention}
                onChangeReferenceLinks={setReferenceLinks}
              />

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveBtn}
                activeOpacity={0.8}
                onPress={handleUpdate}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Icon name="check" size={16} color={Colors.white} />
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>

      {negotiatingApp && (
        <CounterOfferSheet
          isOpen={!!negotiatingApp}
          onClose={() => setNegotiatingApp(null)}
          onSubmit={handleNegotiateSubmit}
          submitting={counterSubmitting}
          originalBidAmount={negotiatingApp.counterAmount || negotiatingApp.bidAmount || 0}
          campaignTitle={title}
          influencerName={negotiatingApp.name || negotiatingApp.instagramHandle || 'Influencer'}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.08)',
  },
  navBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  navTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.oxblood,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  editHeaderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
  },
  editHeaderText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14.5,
    color: Colors.roseDeep,
    fontWeight: '700',
  },
  cancelHeaderText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: 'rgba(63, 3, 11, 0.45)',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.creamLite,
    gap: 12,
  },
  loadingText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Colors.oxblood,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.creamLite,
    padding: 30,
    gap: 16,
  },
  errorText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    color: Colors.roseDeep,
    textAlign: 'center',
  },
  backBtnLarge: {
    backgroundColor: Colors.oxblood,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: Radius.md,
    ...Shadow.button,
  },
  backBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    color: Colors.cream,
    fontWeight: '700',
  },
  sectionContainer: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.05)',
    ...Shadow.card,
    gap: 12,
  },
  sectionHeading: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(180, 106, 116, 0.35)',
    justifyContent: 'center',
    backgroundColor: 'rgba(180, 106, 116, 0.04)',
    marginTop: 8,
  },
  deleteBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.roseDeep,
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.oxblood,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    ...Shadow.button,
    marginTop: 16,
  },
  saveBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    color: Colors.cream,
    fontWeight: '700',
  },
});
