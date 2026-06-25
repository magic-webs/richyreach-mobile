import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { CounterOfferSheet } from '@/components/brand/CounterOfferSheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProfilesStore } from '@/store/profiles';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

const OBJECTIVES = ['Brand Awareness', 'Product Launch', 'App Installs', 'Website Traffic', 'Sales/Conversions', 'Lead Generation'];
const PRIORITIES = ['normal', 'high', 'urgent'] as const;
const TONES = ['Fun', 'Professional', 'Luxury', 'Casual'];
const NICHES = ['Fashion', 'Real Estate', 'Beauty', 'Food', 'Tech', 'Finance', 'Education', 'Gaming', 'Travel', 'Fitness'];
const GENDERS = ['All', 'Male', 'Female'];
const PAYMENT_TYPES = ['Paid', 'Barter', 'Hybrid'];

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showModal = useUIStore((s) => s.showModal);
  const activeProfileId = useProfilesStore((s) => s.activeProfileId);
  const queryClient = useQueryClient();

  // Mode: 'view' | 'edit'
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [saving, setSaving] = useState(false);

  // Fetch campaign details from backend API
  const { data: queryData, isLoading: loading, error } = useQuery<any>({
    queryKey: ['brandCampaign', id],
    queryFn: () => api.campaigns.get(id),
    enabled: !!id,
  });


  const campaign = queryData?.campaign || queryData;
  console.log(JSON.stringify(campaign, null, 2));
  // Local Form State for editing
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Fashion');
  const [objective, setObjective] = useState('Brand Awareness');
  const [location, setLocation] = useState('Pan India');
  const [priority, setPriority] = useState('normal');

  // Deliverables
  const [reelCount, setReelCount] = useState('0');
  const [storyCount, setStoryCount] = useState('0');

  // Budget
  const [paymentType, setPaymentType] = useState('Paid');
  const [costPerCreator, setCostPerCreator] = useState('5000');
  const [numCreators, setNumCreators] = useState('5');

  // Barter Details
  const [prodName, setProdName] = useState('');
  const [prodValue, setProdValue] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodUrl, setProdUrl] = useState('');
  const [prodShipping, setProdShipping] = useState('');

  // Targeting
  const [minFollowers, setMinFollowers] = useState('10000');
  const [targetGender, setTargetGender] = useState('All');
  const [targetAgeRange, setTargetAgeRange] = useState('25-34');
  const [customAgeRange, setCustomAgeRange] = useState('');
  const [creatorSize, setCreatorSize] = useState('Micro (10K-100K)');
  const [targetLanguage, setTargetLanguage] = useState('English');

  // Guidelines
  const [mustMention, setMustMention] = useState('');
  const [cta, setCta] = useState('Visit Website');
  const [hashtags, setHashtags] = useState('');
  const [brandTone, setBrandTone] = useState('Fun');

  // Media & Dates
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-30');
  const [applicationDeadline, setApplicationDeadline] = useState('2026-06-25');
  const [bannerUrl, setBannerUrl] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  // Brand Name
  const [brandName, setBrandName] = useState('');

  // Hide tab bar and floating chat when viewing campaign details
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

  // Sync campaign data to local form states on load or edit mode switch
  useEffect(() => {
    if (campaign) {
      setTitle(campaign.title || '');
      setDescription(campaign.description || '');
      setCategory(campaign.category || 'Fashion');
      setBannerUrl(campaign.bannerUrl || campaign.imageUrl);

      const brief = campaign.briefDetails ? (typeof campaign.briefDetails === 'string' ? JSON.parse(campaign.briefDetails) : campaign.briefDetails) : {};

      setBrandName(brief.brandName || campaign.brandName || '');
      setObjective(brief.objective || campaign.objective || 'Brand Awareness');
      setPriority(brief.priority || campaign.priority || 'normal');
      setLocation(brief.location || campaign.location || 'Pan India');

      // Deliverables
      const deliverables = brief.deliverables || [];
      const reel = deliverables.find((d: any) => d.type === 'reel');
      const story = deliverables.find((d: any) => d.type === 'story');
      setReelCount(String(reel?.quantity ?? campaign.reelCount ?? 0));
      setStoryCount(String(story?.quantity ?? campaign.storyCount ?? 0));

      // Rewards
      setPaymentType(brief.paymentType || campaign.paymentType || 'Paid');
      setCostPerCreator(String(brief.costPerCreator ?? campaign.costPerCreator ?? 0));
      setNumCreators(String(brief.numCreators ?? campaign.numCreators ?? 1));

      // Product info (barter)
      const prod = brief.productInfo || {};
      setProdName(prod.name || campaign.prodName || '');
      setProdValue(String(prod.value ?? campaign.prodValue ?? ''));
      setProdDescription(prod.description || campaign.prodDescription || '');
      setProdSku(prod.sku || campaign.prodSku || '');
      setProdUrl(prod.url || campaign.prodUrl || '');
      setProdShipping(prod.shippingDetails || campaign.prodShipping || '');

      // Targeting
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

      // Guidelines
      const guide = brief.guidelines || {};
      setMustMention(guide.mustMention ? guide.mustMention.join(', ') : (campaign.mustMention || ''));
      setCta(guide.cta || campaign.cta || 'Visit Website');
      setHashtags(guide.hashtags ? guide.hashtags.join(', ') : (campaign.hashtags || ''));
      setBrandTone(guide.brandTone || campaign.brandTone || 'Fun');

      // Dates & Media
      const time = brief.timeline || {};
      setStartDate(time.startDate || campaign.startDate || '2026-07-01');
      setEndDate(time.endDate || campaign.endDate || '2026-07-30');
      setApplicationDeadline(time.applicationDeadline || campaign.applicationDeadline || '2026-06-25');

      const media = brief.mediaUploads || {};
      setReferenceLinks(media.referenceLinks ? media.referenceLinks.join(', ') : (campaign.referenceLinks || ''));
      setAudioUrl(media.audioInstructionUrl || campaign.audioInstructionUrl || '');
    }
  }, [campaign, mode]);

  // Audio Player hook
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

  // Image Picker for Banner
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
        showModal({
          title: 'Uploading Image...',
          message: 'Uploading new banner image to R2 storage...',
        });

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
          formData.append('file', {
            uri: formattedUri,
            name: filename,
            type: `image/${extension}`,
          } as any);
        }

        const uploadRes = await api.media.upload(formData, activeProfileId);
        setBannerUrl(uploadRes.url);

        showModal({
          title: 'Upload Successful',
          message: 'Campaign banner updated successfully.',
        });
      } catch (err: any) {
        console.error('Failed to upload banner:', err);
        showModal({
          title: 'Upload Failed',
          message: err.message || 'Failed to upload new banner image.',
        });
      } finally {
        setSaving(false);
      }
    }
  };

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
        costPerCreator: paymentType === 'Barter' ? 0 : (parseInt(costPerCreator) || 0),
        numCreators: paymentType === 'Barter' ? 1 : (parseInt(numCreators) || 1),
        productInfo: paymentType !== 'Paid' ? {
          name: prodName,
          value: parseInt(prodValue) || 0,
          description: prodDescription,
          sku: prodSku,
          url: prodUrl,
          shippingDetails: prodShipping
        } : null,
        guidelines: {
          mustMention: mustMention ? mustMention.split(',').map((s) => s.trim()).filter(Boolean) : [],
          cta,
          hashtags: hashtags ? hashtags.split(',').map((s) => s.trim()).filter(Boolean) : [],
          brandTone
        },
        timeline: {
          startDate,
          endDate,
          applicationDeadline
        },
        mediaUploads: {
          referenceLinks: referenceLinks ? referenceLinks.split(',').map((s) => s.trim()).filter(Boolean) : [],
          audioInstructionUrl: audioUrl,
          bannerUrl: bannerUrl
        }
      };

      const finalCost = paymentType === 'Barter' ? 0 : (parseInt(costPerCreator) || 0);
      const finalCreators = paymentType === 'Barter' ? 1 : (parseInt(numCreators) || 1);
      const budget = finalCost * finalCreators * 100; // in cents

      const payload = {
        title,
        description,
        budget,
        expectedReach: 250000,
        category,
        briefDetails: updatedBrief,
      };

      await api.campaigns.update(id, payload);

      showModal({
        title: 'Campaign Updated',
        message: `Your campaign "${title}" has been successfully updated.`,
      });

      // Invalidate queries to refresh lists and detail view
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

  const handleDelete = () => {
    showModal({
      title: 'Delete Campaign',
      message: 'Are you sure you want to delete this campaign? This action is permanent and cannot be undone.',
      actions: [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.campaigns.delete(id);
              showModal({
                title: 'Campaign Deleted',
                message: 'The campaign has been removed successfully.',
              });
              queryClient.invalidateQueries({ queryKey: ['brandCampaigns', activeProfileId] });
              router.replace('/brand/index' as any);
            } catch (err: any) {
              console.error('Failed to delete campaign:', err);
              showModal({
                title: 'Delete Failed',
                message: err.message || 'An error occurred while deleting the campaign.',
              });
            }
          },
        },
      ],
    });
  };

  const [negotiatingApp, setNegotiatingApp] = useState<any>(null);
  const [counterSubmitting, setCounterSubmitting] = useState(false);

  // Collaboration review state & mutations
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
    }
  });

  const completeCollabMutation = useMutation({
    mutationFn: (appId: string) => api.brands.completeCollaboration(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brandCampaign', id] });
      showModal({ title: 'Success', message: 'Collaboration marked as complete! 🎉' });
    },
    onError: (err: any) => {
      showModal({ title: 'Error', message: err.message || 'Failed to complete collaboration' });
    }
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
            onPress: () => {
              router.push({
                pathname: '/brand/chat/[id]' as any,
                params: {
                  id: res.roomId,
                }
              });
            }
          }
        ]
      });
    } catch (err: any) {
      console.error('Failed to accept applicant:', err);
      showModal({
        title: 'Error',
        message: err.message || 'Failed to accept application.',
      });
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
      showModal({
        title: 'Error',
        message: err.message || 'Failed to reject application.',
      });
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
      showModal({
        title: 'Error',
        message: err.message || 'Failed to send counter-offer.',
      });
    } finally {
      setCounterSubmitting(false);
    }
  };

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

  const brief = campaign.briefDetails ? (typeof campaign.briefDetails === 'string' ? JSON.parse(campaign.briefDetails) : campaign.briefDetails) : {};
  const toneColor = brief.priority === 'urgent' ? 'ox' : 'rose';

  // Format Date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}>
          {mode === 'view' ? (
            // ==========================================
            // VIEW MODE
            // ==========================================
            <View style={{ gap: 20 }}>
              {/* Campaign Header Card */}
              <View style={styles.detailsCard}>
                {!bannerUrl ? (
                  <PlaceholderImage tone={toneColor} height={150} borderRadius={16} />
                ) : (
                  <Image source={{ uri: bannerUrl }} style={styles.bannerImage} />
                )}
                <View style={styles.headerMetaRow}>
                  <View style={styles.badgeRow}>
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeText}>ACTIVE</Text>
                    </View>
                    <View style={[styles.priorityBadge, brief.priority === 'urgent' && styles.priorityBadgeUrgent]}>
                      <Text style={[styles.priorityText, brief.priority === 'urgent' && styles.priorityTextUrgent]}>
                        {brief.priority ? brief.priority.toUpperCase() : 'NORMAL'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.nicheLabel}>{category.toUpperCase()}</Text>
                </View>
                <Text style={styles.campaignTitleText}>{title}</Text>
                <Text style={styles.brandSubtitleText}>by {brief.brandName || 'My Brand'}</Text>
              </View>

              {/* Campaign Brief & Timeline */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeading}>Campaign Brief & Timeline</Text>
                <Text style={styles.bodyDescription}>{description}</Text>

                <View style={styles.dividerLight} />

                <View style={styles.timelineGrid}>
                  <View style={styles.timelineCell}>
                    <Text style={styles.timelineCellLabel}>Start Date</Text>
                    <Text style={styles.timelineCellValue}>{formatDate(startDate)}</Text>
                  </View>
                  <View style={styles.timelineCell}>
                    <Text style={styles.timelineCellLabel}>End Date</Text>
                    <Text style={styles.timelineCellValue}>{formatDate(endDate)}</Text>
                  </View>
                  <View style={styles.timelineCell}>
                    <Text style={styles.timelineCellLabel}>Apply Deadline</Text>
                    <Text style={styles.timelineCellValueUrgent}>{formatDate(applicationDeadline)}</Text>
                  </View>
                </View>
              </View>

              {/* Deliverables Section */}
              {((parseInt(reelCount) || 0) > 0 || (parseInt(storyCount) || 0) > 0) && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionHeading}>Deliverables Required</Text>
                  <View style={styles.deliverablesList}>
                    {parseInt(reelCount) > 0 && (
                      <View style={styles.deliverablePill}>
                        <Icon name="check" size={12} color={Colors.green} />
                        <Text style={styles.deliverableText}>{reelCount}x Reel(s)</Text>
                      </View>
                    )}
                    {parseInt(storyCount) > 0 && (
                      <View style={styles.deliverablePill}>
                        <Icon name="check" size={12} color={Colors.green} />
                        <Text style={styles.deliverableText}>{storyCount}x Story(ies)</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Targeting Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeading}>Creator Targeting Profile</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsRowLabel}>Minimum Followers:</Text>
                  <Text style={styles.detailsRowValue}>
                    {parseInt(minFollowers) >= 1000000
                      ? `${(parseInt(minFollowers) / 1000000).toFixed(1)}M+`
                      : parseInt(minFollowers) >= 1000
                        ? `${(parseInt(minFollowers) / 1000).toFixed(0)}k+`
                        : `${minFollowers}+`}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsRowLabel}>Creator Size Class:</Text>
                  <Text style={styles.detailsRowValue}>{creatorSize}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsRowLabel}>Target Gender:</Text>
                  <Text style={[styles.detailsRowValue, { textTransform: 'capitalize' }]}>{targetGender}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsRowLabel}>Target Age Range:</Text>
                  <Text style={styles.detailsRowValue}>{targetAgeRange === 'Custom' ? customAgeRange : targetAgeRange}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsRowLabel}>Target Language:</Text>
                  <Text style={styles.detailsRowValue}>{targetLanguage}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsRowLabel}>Geographic Location:</Text>
                  <Text style={styles.detailsRowValue}>{location}</Text>
                </View>
              </View>

              {/* Budget and Rewards Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeading}>Rewards & Budget</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoGridCell}>
                    <Text style={styles.infoCellLabel}>Payment Type</Text>
                    <Text style={[styles.infoCellVal, { textTransform: 'capitalize' }]}>{paymentType}</Text>
                  </View>
                  <View style={styles.infoGridCell}>
                    <Text style={styles.infoCellLabel}>Cost per Creator</Text>
                    <Text style={styles.infoCellVal}>
                      {paymentType === 'Barter' ? 'Product Barter' : `₹${(parseInt(costPerCreator) || 0).toLocaleString()}`}
                    </Text>
                  </View>
                  <View style={styles.infoGridCell}>
                    <Text style={styles.infoCellLabel}>Target Creators</Text>
                    <Text style={styles.infoCellVal}>{numCreators}</Text>
                  </View>
                  <View style={styles.infoGridCell}>
                    <Text style={styles.infoCellLabel}>Total Budget</Text>
                    <Text style={styles.infoCellValPrice}>
                      {paymentType === 'Barter' ? 'Barter' : `₹${((parseInt(costPerCreator) || 0) * (parseInt(numCreators) || 0)).toLocaleString()}`}
                    </Text>
                  </View>
                </View>


                {/* Barter Product Details */}
                {paymentType !== 'Paid' && prodName ? (
                  <View style={styles.barterCard}>
                    <Text style={styles.barterHeading}>Barter Product details</Text>
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsRowLabel}>Product Name:</Text>
                      <Text style={styles.detailsRowValue}>{prodName}</Text>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsRowLabel}>Product Value:</Text>
                      <Text style={styles.detailsRowValue}>₹{(parseInt(prodValue) || 0).toLocaleString()}</Text>
                    </View>
                    {prodSku ? (
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsRowLabel}>SKU / Code:</Text>
                        <Text style={styles.detailsRowValue}>{prodSku}</Text>
                      </View>
                    ) : null}
                    {prodUrl ? (
                      <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(prodUrl)}>
                        <Text style={styles.linkText}>View Product Link ↗</Text>
                      </TouchableOpacity>
                    ) : null}
                    {prodDescription ? (
                      <View style={{ marginTop: 6 }}>
                        <Text style={styles.barterDescLabel}>Product Description:</Text>
                        <Text style={styles.barterDescVal}>{prodDescription}</Text>
                      </View>
                    ) : null}
                    {prodShipping ? (
                      <View style={{ marginTop: 6 }}>
                        <Text style={styles.barterDescLabel}>Shipping Instructions:</Text>
                        <Text style={styles.barterDescVal}>{prodShipping}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>

              {/* Guidelines & Tone Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeading}>Guidelines & Tone</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsRowLabel}>Call To Action:</Text>
                  <Text style={styles.detailsRowValue}>{cta}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsRowLabel}>Brand Tone / Mood:</Text>
                  <Text style={styles.detailsRowValue}>{brandTone}</Text>
                </View>
                {hashtags ? (
                  <View style={{ marginTop: 4 }}>
                    <Text style={styles.blockLabel}>Hashtags Required:</Text>
                    <Text style={styles.blockValue}>{hashtags}</Text>
                  </View>
                ) : null}
                {mustMention ? (
                  <View style={{ marginTop: 4 }}>
                    <Text style={styles.blockLabel}>Must Mention Keywords:</Text>
                    <Text style={styles.blockValue}>{mustMention}</Text>
                  </View>
                ) : null}

                {/* Voice Note Audio Player */}
                {audioUrl ? (
                  <View style={styles.audioPlayerCard}>
                    <TouchableOpacity style={styles.playBtnSmall} onPress={handlePlayPause} activeOpacity={0.8}>
                      <Icon name={playerStatus.playing ? 'pause' : 'play'} size={16} color={Colors.oxblood} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.audioLabel}>
                        {playerStatus.playing
                          ? `Playing: ${formatDuration(playerStatus.currentTime)} / ${formatDuration(playerStatus.duration ?? 0)}`
                          : `Listen to Voice Instructions (${formatDuration(playerStatus.duration ?? 0)})`}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>

              {/* Reference Links Section */}
              {referenceLinks ? (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionHeading}>Reference Links</Text>
                  {referenceLinks.split(',').map((link, idx) => {
                    const cleanLink = link.trim();
                    if (!cleanLink) return null;
                    return (
                      <TouchableOpacity key={idx} style={styles.linkItemRow} onPress={() => Linking.openURL(cleanLink)}>
                        <Icon name="link" size={14} color={Colors.roseDeep} />
                        <Text style={styles.linkItemText} numberOfLines={1}>{cleanLink}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}

              {/* Applicants Section */}
              {queryData?.applications && queryData.applications.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionHeading}>Applicants ({queryData.applications.length})</Text>
                  <View style={{ gap: 16, marginTop: 8 }}>
                    {queryData.applications.map((app: any) => {
                      const isPending = app.status === 'pending';
                      const isAccepted = app.status === 'accepted';
                      const isRejected = app.status === 'rejected';
                      const isNegotiating = app.status === 'negotiating';
                      const brandNeedsToRespond = isPending || (isNegotiating && app.lastActionBy === 'influencer');

                      let followersStr = String(app.followers || '0');
                      const followersNum = Number(app.followers || 0);
                      if (followersNum >= 1000000) followersStr = `${(followersNum / 1000000).toFixed(1)}M`;
                      else if (followersNum >= 1000) followersStr = `${(followersNum / 1000).toFixed(0)}k`;

                      return (
                        <View key={app.id} style={styles.applicantCard}>
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
                            <View style={[styles.applicantMeta, { marginLeft: 12 }]}>
                              <Text style={styles.applicantMetaVal}>{app.engagementRate || '4.5'}%</Text>
                              <Text style={styles.applicantMetaLabel}>Eng. Rate</Text>
                            </View>
                          </View>

                          <View style={styles.bidContainer}>
                            <View style={styles.bidItem}>
                              <Text style={styles.bidLabel}>Bid Price:</Text>
                              <Text style={styles.bidText}>₹{((app.bidAmount || 0) / 100).toLocaleString()}</Text>
                            </View>
                            {app.counterAmount && app.counterAmount > 0 && (
                              <View style={styles.counterBadge}>
                                <Text style={styles.counterText}>Countered: ₹{((app.counterAmount || 0) / 100).toLocaleString()}</Text>
                              </View>
                            )}
                          </View>

                          <View style={styles.proposalContainer}>
                            <Text style={styles.proposalLabel}>Proposal:</Text>
                            <Text style={styles.proposalText}>"{app.proposal}"</Text>
                          </View>

                          <View style={styles.applicantActions}>
                            {brandNeedsToRespond ? (
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity
                                  style={styles.rejectApplicantBtn}
                                  activeOpacity={0.8}
                                  onPress={() => handleRejectApplicant(app)}
                                >
                                  <Text style={styles.rejectApplicantBtnText}>Reject</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.negotiateApplicantBtn}
                                  activeOpacity={0.8}
                                  onPress={() => setNegotiatingApp(app)}
                                >
                                  <Text style={styles.negotiateApplicantBtnText}>Negotiate</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.acceptApplicantBtn}
                                  activeOpacity={0.8}
                                  onPress={() => handleAcceptApplicant(app)}
                                >
                                  <Icon name="check" size={14} color={Colors.white} />
                                  <Text style={styles.acceptApplicantBtnText}>Accept</Text>
                                </TouchableOpacity>
                              </View>
                            ) : (
                              <View style={{ flexDirection: 'column', width: '100%', gap: 10, marginTop: 10 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                  <View style={[
                                    styles.statusBadge,
                                    isAccepted && styles.statusAccepted,
                                    isRejected && styles.statusDeclined,
                                    isNegotiating && { backgroundColor: 'rgba(180, 106, 116, 0.12)' }
                                  ]}>
                                    <Text style={[
                                      styles.statusBadgeText,
                                      isAccepted && styles.statusAcceptedText,
                                      isRejected && styles.statusDeclinedText,
                                      isNegotiating && { color: Colors.roseDeep }
                                    ]}>
                                      {isAccepted ? 'Accepted ✓' : (
                                        isRejected ? 'Declined ✕' : `Countered: ₹${((app.counterAmount || 0) / 100).toLocaleString()} (Awaiting Creator)`
                                      )}
                                    </Text>
                                  </View>

                                  {isAccepted && (
                                    <TouchableOpacity
                                      style={styles.reviewCollabBtn}
                                      onPress={() => setExpandedCollabAppId(expandedCollabAppId === app.id ? null : app.id)}
                                      activeOpacity={0.8}
                                    >
                                      <Text style={styles.reviewCollabBtnText}>
                                        {expandedCollabAppId === app.id ? 'Hide Progress' : 'Review Progress'}
                                      </Text>
                                      <Icon name={expandedCollabAppId === app.id ? 'chevDown' : 'chevron'} size={14} color={Colors.oxblood} />
                                    </TouchableOpacity>
                                  )}
                                </View>

                                {isAccepted && expandedCollabAppId === app.id && (
                                  <View style={styles.collabReviewPanel}>
                                    <View style={styles.collabReviewHeader}>
                                      <Text style={styles.collabReviewTitle}>Collaboration Progress</Text>
                                    </View>

                                    {/* Step 1: Script Review */}
                                    <View style={styles.reviewStep}>
                                      <View style={styles.reviewStepLeft}>
                                        <View style={[
                                          styles.stepCircle,
                                          app.scriptStatus === 'approved' ? styles.stepCircleDone : (app.scriptStatus === 'pending' ? styles.stepCirclePending : styles.stepCircleActive)
                                        ]}>
                                          {app.scriptStatus === 'approved' ? (
                                            <Icon name="check" size={10} color="#fff" />
                                          ) : (
                                            <Text style={styles.stepCircleText}>1</Text>
                                          )}
                                        </View>
                                        <View style={styles.stepLine} />
                                      </View>
                                      <View style={styles.reviewStepContent}>
                                        <Text style={styles.reviewStepTitle}>Script Draft Review</Text>
                                        
                                        {app.scriptStatus === 'approved' ? (
                                          <View style={{ gap: 4, marginTop: 4 }}>
                                            <Text style={styles.reviewSuccessText}>✓ Approved script</Text>
                                            <TouchableOpacity onPress={() => app.scriptUrl && Linking.openURL(app.scriptUrl)}>
                                              <Text style={styles.reviewLinkText} numberOfLines={1}>{app.scriptUrl} ↗</Text>
                                            </TouchableOpacity>
                                          </View>
                                        ) : app.scriptStatus === 'pending' ? (
                                          <View style={{ marginTop: 6, gap: 8 }}>
                                            <Text style={styles.reviewWarningText}>⏱ Awaiting Script Review</Text>
                                            <TouchableOpacity onPress={() => app.scriptUrl && Linking.openURL(app.scriptUrl)}>
                                              <Text style={styles.reviewLinkText} numberOfLines={1}>{app.scriptUrl} ↗</Text>
                                            </TouchableOpacity>
                                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                                              <TouchableOpacity
                                                style={[styles.reviewActionBtn, { backgroundColor: '#eb5757' }]}
                                                onPress={() => reviewScriptMutation.mutate({ appId: app.id, status: 'rejected' })}
                                                disabled={reviewScriptMutation.isPending}
                                                activeOpacity={0.8}
                                              >
                                                <Text style={styles.reviewActionBtnText}>Reject</Text>
                                              </TouchableOpacity>
                                              <TouchableOpacity
                                                style={[styles.reviewActionBtn, { backgroundColor: '#2ecc71' }]}
                                                onPress={() => reviewScriptMutation.mutate({ appId: app.id, status: 'approved' })}
                                                disabled={reviewScriptMutation.isPending}
                                                activeOpacity={0.8}
                                              >
                                                <Text style={styles.reviewActionBtnText}>Approve</Text>
                                              </TouchableOpacity>
                                            </View>
                                          </View>
                                        ) : app.scriptStatus === 'rejected' ? (
                                          <Text style={styles.reviewDescText}>
                                            ✕ Script Rejected. Waiting for creator to resubmit.
                                          </Text>
                                        ) : (
                                          <Text style={styles.reviewDescText}>
                                            Awaiting script draft upload from creator.
                                          </Text>
                                        )}
                                      </View>
                                    </View>

                                    {/* Step 2: Instagram Handle Connection */}
                                    <View style={styles.reviewStep}>
                                      <View style={styles.reviewStepLeft}>
                                        <View style={[
                                          styles.stepCircle,
                                          app.igHandle ? styles.stepCircleDone : styles.stepCircleActive
                                        ]}>
                                          {app.igHandle ? (
                                            <Icon name="check" size={10} color="#fff" />
                                          ) : (
                                            <Text style={styles.stepCircleText}>2</Text>
                                          )}
                                        </View>
                                        <View style={styles.stepLine} />
                                      </View>
                                      <View style={styles.reviewStepContent}>
                                        <Text style={styles.reviewStepTitle}>Creator Instagram Handle</Text>
                                        {app.igHandle ? (
                                          <Text style={styles.reviewConnectedText}>
                                            Linked Handle: @{app.igHandle}
                                          </Text>
                                        ) : (
                                          <Text style={styles.reviewDescText}>
                                            Awaiting Instagram handle linkage from creator.
                                          </Text>
                                        )}
                                      </View>
                                    </View>

                                    {/* Step 3: Live Post Link */}
                                    <View style={styles.reviewStep}>
                                      <View style={styles.reviewStepLeft}>
                                        <View style={[
                                          styles.stepCircle,
                                          app.postLink ? styles.stepCircleDone : styles.stepCircleActive
                                        ]}>
                                          {app.postLink ? (
                                            <Icon name="check" size={10} color="#fff" />
                                          ) : (
                                            <Text style={styles.stepCircleText}>3</Text>
                                          )}
                                        </View>
                                        <View style={styles.stepLine} />
                                      </View>
                                      <View style={styles.reviewStepContent}>
                                        <Text style={styles.reviewStepTitle}>Reel / Post Deliverable</Text>
                                        {app.postLink ? (
                                          <View style={{ gap: 4, marginTop: 4 }}>
                                            <Text style={styles.reviewSuccessText}>✓ Creator shared post link</Text>
                                            <TouchableOpacity onPress={() => Linking.openURL(app.postLink)}>
                                              <Text style={styles.reviewLinkText} numberOfLines={1}>{app.postLink} ↗</Text>
                                            </TouchableOpacity>
                                          </View>
                                        ) : (
                                          <Text style={styles.reviewDescText}>
                                            Awaiting post upload (unlocked once script is approved).
                                          </Text>
                                        )}
                                      </View>
                                    </View>

                                    {/* Step 4: Completion */}
                                    <View style={[styles.reviewStep, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                                      <View style={styles.reviewStepLeft}>
                                        <View style={[
                                          styles.stepCircle,
                                          app.collaborationStatus === 'completed' ? styles.stepCircleDone : styles.stepCircleActive
                                        ]}>
                                          {app.collaborationStatus === 'completed' ? (
                                            <Icon name="check" size={10} color="#fff" />
                                          ) : (
                                            <Text style={styles.stepCircleText}>4</Text>
                                          )}
                                        </View>
                                      </View>
                                      <View style={styles.reviewStepContent}>
                                        <Text style={styles.reviewStepTitle}>Completion Status</Text>
                                        
                                        {app.collaborationStatus === 'completed' ? (
                                          <Text style={[styles.reviewSuccessText, { marginTop: 4 }]}>
                                            🎉 Collaboration marked complete.
                                          </Text>
                                        ) : app.postLink ? (
                                          <View style={{ marginTop: 6 }}>
                                            <Text style={styles.reviewWarningText}>
                                              ⏱ Deliverables submitted! Review and mark complete to release payout.
                                            </Text>
                                            <TouchableOpacity
                                              style={[styles.completeCollabBtn, { marginTop: 8 }]}
                                              onPress={() => completeCollabMutation.mutate(app.id)}
                                              disabled={completeCollabMutation.isPending}
                                              activeOpacity={0.8}
                                            >
                                              <Text style={styles.completeCollabBtnText}>
                                                {completeCollabMutation.isPending ? 'Completing...' : 'Mark Collaboration Complete'}
                                              </Text>
                                            </TouchableOpacity>
                                          </View>
                                        ) : (
                                          <Text style={styles.reviewDescText}>
                                            Awaiting link submission to mark complete.
                                          </Text>
                                        )}
                                      </View>
                                    </View>
                                  </View>
                                )}
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Delete Button */}
              <TouchableOpacity
                style={styles.deleteBtn}
                activeOpacity={0.8}
                onPress={handleDelete}
              >
                <Icon name="x" size={16} color={Colors.roseDeep} />
                <Text style={styles.deleteBtnText}>Delete Campaign</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // ==========================================
            // EDIT MODE
            // ==========================================
            <View style={{ gap: 20 }}>
              {/* Campaign Banner Edit Picker */}
              <View style={styles.formSectionCard}>
                <Text style={styles.formSectionHeader}>Campaign Media & Name</Text>

                <TouchableOpacity style={styles.editBannerContainer} onPress={pickImage} activeOpacity={0.9}>
                  {bannerUrl ? (
                    <Image source={{ uri: bannerUrl }} style={styles.editBannerImage} />
                  ) : (
                    <View style={styles.editBannerPlaceholder}>
                      <Icon name="link" size={24} color={Colors.roseDeep} />
                      <Text style={styles.editBannerPlaceholderText}>Tap to upload new banner</Text>
                    </View>
                  )}
                  <View style={styles.editBannerOverlay}>
                    <Text style={styles.editBannerOverlayText}>Change Image 📸</Text>
                  </View>
                </TouchableOpacity>

                <View style={[styles.formGroup, { marginTop: 12 }]}>
                  <Text style={styles.formLabel}>Campaign Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Summer Glow Launch"
                    placeholderTextColor="rgba(63,3,11,0.35)"
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Brand Profile Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. L'Oreal Paris"
                    placeholderTextColor="rgba(63,3,11,0.35)"
                    value={brandName}
                    onChangeText={setBrandName}
                  />
                </View>
              </View>

              {/* Basics Card */}
              <View style={styles.formSectionCard}>
                <Text style={styles.formSectionHeader}>basices Details</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Campaign Category / Niche *</Text>
                  <View style={styles.gridRow}>
                    {NICHES.map((n) => {
                      const active = category.toLowerCase() === n.toLowerCase();
                      return (
                        <TouchableOpacity
                          key={n}
                          style={[styles.gridBtn, active && styles.gridBtnActive]}
                          onPress={() => setCategory(n)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.gridBtnText, active && styles.gridBtnTextActive]}>{n}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Campaign Objective *</Text>
                  <View style={styles.gridRow}>
                    {OBJECTIVES.map((o) => {
                      const active = objective.toLowerCase() === o.toLowerCase().replace(/[\/\s]+/g, '_');
                      return (
                        <TouchableOpacity
                          key={o}
                          style={[styles.gridBtn, active && styles.gridBtnActive]}
                          onPress={() => setObjective(o.toLowerCase().replace(/[\/\s]+/g, '_'))}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.gridBtnText, active && styles.gridBtnTextActive]}>{o}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Campaign Description *</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    multiline
                    numberOfLines={4}
                    placeholder="Provide details about the campaign..."
                    placeholderTextColor="rgba(63,3,11,0.35)"
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Priority *</Text>
                  <View style={styles.toggleRow}>
                    {PRIORITIES.map((pri) => {
                      const active = priority === pri;
                      return (
                        <TouchableOpacity
                          key={pri}
                          style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                          onPress={() => setPriority(pri)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{pri.toUpperCase()}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Deliverables & Timeline Card */}
              <View style={styles.formSectionCard}>
                <Text style={styles.formSectionHeader}>Deliverables & Dates</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Deliverables Count</Text>
                  <View style={styles.deliverablesEditRow}>
                    <View style={styles.delivEditCell}>
                      <Text style={styles.delivEditLabel}>Reels</Text>
                      <TextInput
                        style={styles.delivEditInput}
                        keyboardType="numeric"
                        value={reelCount}
                        onChangeText={setReelCount}
                      />
                    </View>
                    <View style={styles.delivEditCell}>
                      <Text style={styles.delivEditLabel}>Stories</Text>
                      <TextInput
                        style={styles.delivEditInput}
                        keyboardType="numeric"
                        value={storyCount}
                        onChangeText={setStoryCount}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Campaign Duration Dates</Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={styles.inputSubLabel}>Start Date (YYYY-MM-DD)</Text>
                      <TextInput
                        style={styles.formInput}
                        value={startDate}
                        onChangeText={setStartDate}
                        placeholder="2026-07-01"
                      />
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={styles.inputSubLabel}>End Date (YYYY-MM-DD)</Text>
                      <TextInput
                        style={styles.formInput}
                        value={endDate}
                        onChangeText={setEndDate}
                        placeholder="2026-07-30"
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Application Deadline (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={applicationDeadline}
                    onChangeText={setApplicationDeadline}
                    placeholder="2026-06-25"
                  />
                </View>
              </View>

              {/* Rewards & Budget Card */}
              <View style={styles.formSectionCard}>
                <Text style={styles.formSectionHeader}>Rewards & Payment</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Payment Type</Text>
                  <View style={styles.toggleRow}>
                    {PAYMENT_TYPES.map((type) => {
                      const active = paymentType.toLowerCase() === type.toLowerCase();
                      return (
                        <TouchableOpacity
                          key={type}
                          style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                          onPress={() => setPaymentType(type)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{type}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {paymentType !== 'Barter' && (
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Cash Compensation Details</Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={styles.inputSubLabel}>Rate per Creator (₹)</Text>
                        <TextInput
                          style={styles.formInput}
                          keyboardType="numeric"
                          value={costPerCreator}
                          onChangeText={setCostPerCreator}
                        />
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={styles.inputSubLabel}>No. of Creators</Text>
                        <TextInput
                          style={styles.formInput}
                          keyboardType="numeric"
                          value={numCreators}
                          onChangeText={setNumCreators}
                        />
                      </View>
                    </View>
                  </View>
                )}


                {/* Barter Product Details Form */}
                {paymentType !== 'Paid' && (
                  <View style={styles.barterFormCard}>
                    <Text style={styles.barterHeading}>Product Details *</Text>

                    <View style={styles.formGroup}>
                      <Text style={styles.inputSubLabel}>Product Name *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={prodName}
                        onChangeText={setProdName}
                        placeholder="e.g. Lip Gloss Trio Bundle"
                      />
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={styles.inputSubLabel}>Estimated Value (₹)</Text>
                        <TextInput
                          style={styles.formInput}
                          keyboardType="numeric"
                          value={prodValue}
                          onChangeText={setProdValue}
                          placeholder="2499"
                        />
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={styles.inputSubLabel}>SKU / Reference ID</Text>
                        <TextInput
                          style={styles.formInput}
                          value={prodSku}
                          onChangeText={setProdSku}
                          placeholder="LG-TRIO-01"
                        />
                      </View>
                    </View>

                    <View style={[styles.formGroup, { marginTop: 8 }]}>
                      <Text style={styles.inputSubLabel}>Product Link (URL)</Text>
                      <TextInput
                        style={styles.formInput}
                        value={prodUrl}
                        onChangeText={setProdUrl}
                        placeholder="https://brand.com/products/lipgloss"
                        autoCapitalize="none"
                        keyboardType="url"
                      />
                    </View>

                    <View style={[styles.formGroup, { marginTop: 8 }]}>
                      <Text style={styles.inputSubLabel}>Product Description</Text>
                      <TextInput
                        style={[styles.formInput, styles.smallTextArea]}
                        multiline
                        numberOfLines={3}
                        value={prodDescription}
                        onChangeText={setProdDescription}
                        placeholder="Briefly describe the product rewards..."
                      />
                    </View>

                    <View style={[styles.formGroup, { marginTop: 8 }]}>
                      <Text style={styles.inputSubLabel}>Shipping Details / Instructions</Text>
                      <TextInput
                        style={[styles.formInput, styles.smallTextArea]}
                        multiline
                        numberOfLines={3}
                        value={prodShipping}
                        onChangeText={setProdShipping}
                        placeholder="Shipping timeline or region requirements..."
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* Creator Targeting Card */}
              <View style={styles.formSectionCard}>
                <Text style={styles.formSectionHeader}>Creator Targeting</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Minimum Followers Required</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="numeric"
                    value={minFollowers}
                    onChangeText={setMinFollowers}
                    placeholder="10000"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Creator Size Class</Text>
                  <TextInput
                    style={styles.formInput}
                    value={creatorSize}
                    onChangeText={setCreatorSize}
                    placeholder="Micro (10K-100K)"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Target Creator Gender</Text>
                  <View style={styles.toggleRow}>
                    {GENDERS.map((g) => {
                      const active = targetGender.toLowerCase() === g.toLowerCase();
                      return (
                        <TouchableOpacity
                          key={g}
                          style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                          onPress={() => setTargetGender(g)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{g}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Target Creator Age Range</Text>
                  <View style={styles.toggleRow}>
                    {['18–24', '25–34', '35–44', 'Custom'].map((age) => {
                      const active = targetAgeRange === age;
                      return (
                        <TouchableOpacity
                          key={age}
                          style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                          onPress={() => setTargetAgeRange(age)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{age}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {targetAgeRange === 'Custom' && (
                  <View style={styles.formGroup}>
                    <Text style={styles.inputSubLabel}>Custom Age Range Input</Text>
                    <TextInput
                      style={styles.formInput}
                      value={customAgeRange}
                      onChangeText={setCustomAgeRange}
                      placeholder="e.g. 16-22 years, or 45+"
                    />
                  </View>
                )}

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Target Language</Text>
                  <TextInput
                    style={styles.formInput}
                    value={targetLanguage}
                    onChangeText={setTargetLanguage}
                    placeholder="English / Hindi / Hinglish"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Target Location</Text>
                  <TextInput
                    style={styles.formInput}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Pan India, or State/City name"
                  />
                </View>
              </View>

              {/* Guidelines Card */}
              <View style={styles.formSectionCard}>
                <Text style={styles.formSectionHeader}>Guidelines & Tone</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Call To Action *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={cta}
                    onChangeText={setCta}
                    placeholder="Visit Website / Download App"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Brand Tone / Mood</Text>
                  <View style={styles.gridRow}>
                    {TONES.map((t) => {
                      const active = brandTone.toLowerCase() === t.toLowerCase();
                      return (
                        <TouchableOpacity
                          key={t}
                          style={[styles.gridBtn, active && styles.gridBtnActive]}
                          onPress={() => setBrandTone(t)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.gridBtnText, active && styles.gridBtnTextActive]}>{t}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Hashtags Required (comma separated)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={hashtags}
                    onChangeText={setHashtags}
                    placeholder="#RichyReach, #collab"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Must Mention Keywords (comma separated)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={mustMention}
                    onChangeText={setMustMention}
                    placeholder="Natural, Affordable, Long-lasting"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Reference Links (comma separated)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={referenceLinks}
                    onChangeText={setReferenceLinks}
                    placeholder="https://instagram.com/p/..."
                  />
                </View>
              </View>

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
  bannerImage: {
    width: '100%',
    height: 150,
    borderRadius: 16,
  },
  navTitle: {
    fontFamily: FontFamily.serif,
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
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    ...Shadow.card,
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeBadge: {
    backgroundColor: 'rgba(42, 122, 90, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeText: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    color: Colors.green,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  priorityBadge: {
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  priorityBadgeUrgent: {
    backgroundColor: 'rgba(180, 106, 116, 0.12)',
  },
  priorityText: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    color: 'rgba(63, 3, 11, 0.6)',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  priorityTextUrgent: {
    color: Colors.roseDeep,
  },
  nicheLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 9.5,
    color: Colors.roseDeep,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  campaignTitleText: {
    fontFamily: FontFamily.serif,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.oxblood,
    marginTop: 4,
  },
  brandSubtitleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.rose,
    marginTop: 2,
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
  bodyDescription: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(42, 2, 7, 0.75)',
  },
  timelineGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  timelineCell: {
    flex: 1,
    backgroundColor: 'rgba(63, 3, 11, 0.015)',
    padding: 8,
    borderRadius: Radius.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.03)',
  },
  timelineCellLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9,
    color: 'rgba(63, 3, 11, 0.4)',
    textTransform: 'uppercase',
  },
  timelineCellValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  timelineCellValueUrgent: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.roseDeep,
    fontWeight: '800',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoGridCell: {
    width: '46%',
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
    gap: 4,
  },
  infoCellLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10,
    color: 'rgba(63, 3, 11, 0.45)',
    fontWeight: '600',
  },
  infoCellVal: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  infoCellValPrice: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.green,
  },
  dividerLight: {
    height: 0.5,
    backgroundColor: 'rgba(63, 3, 11, 0.08)',
    marginVertical: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  detailsRowLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(63, 3, 11, 0.55)',
  },
  detailsRowValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  deliverablesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  deliverablePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(42, 122, 90, 0.04)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(42, 122, 90, 0.12)',
  },
  deliverableText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.green,
  },
  barterCard: {
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    marginTop: 6,
    gap: 6,
  },
  barterHeading: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Colors.oxblood,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  linkRow: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  linkText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.roseDeep,
    fontWeight: '700',
  },
  barterDescLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.45)',
  },
  barterDescVal: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(42, 2, 7, 0.75)',
    marginTop: 2,
    lineHeight: 18,
  },
  blockLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.roseDeep,
    marginBottom: 2,
  },
  blockValue: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(42, 2, 7, 0.75)',
    lineHeight: 18,
  },
  audioPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(63,3,11,0.03)',
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
  },
  playBtnSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  audioLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.oxblood,
  },
  linkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  linkItemText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.roseDeep,
    flex: 1,
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
  formSectionCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.05)',
    ...Shadow.card,
    gap: 12,
  },
  formSectionHeader: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.oxblood,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.08)',
    paddingBottom: 4,
    marginBottom: 4,
  },
  editBannerContainer: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.08)',
  },
  editBannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editBannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: 'rgba(63, 3, 11, 0.15)',
    borderRadius: 16,
  },
  editBannerPlaceholderText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.roseDeep,
  },
  editBannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  editBannerOverlayText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.white,
    fontWeight: '700',
  },
  formGroup: {
    gap: 6,
    marginBottom: 4,
  },
  formLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 10.5,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputSubLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.5)',
  },
  formInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    fontSize: 14,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  smallTextArea: {
    height: 70,
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  toggleBtn: {
    flex: 1,
    minWidth: '22%',
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: Colors.oxblood,
    borderColor: Colors.oxblood,
  },
  toggleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.oxblood,
  },
  toggleTextActive: {
    fontFamily: FontFamily.sans,
    color: Colors.white,
    fontWeight: '700',
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBtnActive: {
    backgroundColor: Colors.oxblood,
    borderColor: Colors.oxblood,
  },
  gridBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.oxblood,
  },
  gridBtnTextActive: {
    fontFamily: FontFamily.sans,
    color: Colors.white,
    fontWeight: '700',
  },
  deliverablesEditRow: {
    flexDirection: 'row',
    gap: 8,
  },
  delivEditCell: {
    flex: 1,
    gap: 4,
  },
  delivEditLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9.5,
    color: 'rgba(63, 3, 11, 0.5)',
    textAlign: 'center',
  },
  delivEditInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    fontSize: 13,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
    textAlign: 'center',
  },
  barterFormCard: {
    backgroundColor: 'rgba(63, 3, 11, 0.015)',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    marginTop: 8,
    gap: 8,
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

  // Collaboration review panel styles
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
  collabReviewPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(63,3,11,0.06)',
    marginTop: 10,
  },
  collabReviewHeader: {
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.06)',
    paddingBottom: 6,
  },
  collabReviewTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  reviewStep: {
    flexDirection: 'row',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.05)',
  },
  reviewStepLeft: {
    alignItems: 'center',
    marginRight: 10,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: Colors.rose,
  },
  stepCircleDone: {
    backgroundColor: Colors.green,
  },
  stepCirclePending: {
    backgroundColor: '#e67e22',
  },
  stepCircleText: {
    fontFamily: FontFamily.sansMedium,
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  stepLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: 'rgba(63,3,11,0.05)',
    marginTop: 4,
    marginBottom: -10,
  },
  reviewStepContent: {
    flex: 1,
  },
  reviewStepTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  reviewSuccessText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.green,
  },
  reviewWarningText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: '#e67e22',
  },
  reviewConnectedText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.ink,
    marginTop: 4,
  },
  reviewDescText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11.5,
    color: 'rgba(63,3,11,0.5)',
    marginTop: 4,
  },
  reviewLinkText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.roseDeep,
    textDecorationLine: 'underline',
  },
  reviewActionBtn: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewActionBtnText: {
    fontFamily: FontFamily.sansMedium,
    color: '#fff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  completeCollabBtn: {
    backgroundColor: Colors.green,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeCollabBtnText: {
    fontFamily: FontFamily.sansMedium,
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
