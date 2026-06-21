import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useProfilesStore } from '@/store/profiles';
import { Image } from 'expo-image';

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

  const campaign = queryData?.campaign || queryData; // Fallback in case the API directly returns the campaign object


  // Local Form State for editing
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [expectedReach, setExpectedReach] = useState('');

  // Brief Details fields
  const [brandName, setBrandName] = useState('');
  const [objective, setObjective] = useState('');
  const [priority, setPriority] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [minFollowers, setMinFollowers] = useState('');
  const [costPerCreator, setCostPerCreator] = useState('');
  const [numCreators, setNumCreators] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentTimeline, setPaymentTimeline] = useState('');

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
      setImage(campaign.imageUrl || '');
      setDescription(campaign.description || '');
      setCategory(campaign.category || 'Fashion');
      setExpectedReach(String(campaign.expectedReach || 250000));

      const brief = campaign.briefDetails ? (typeof campaign.briefDetails === 'string' ? JSON.parse(campaign.briefDetails) : campaign.briefDetails) : {};
      setBrandName(brief.brandName || '');
      setObjective(brief.objective || 'brand_awareness');
      setPriority(brief.priority || 'normal');
      setLocation(brief.location || 'Pan India');
      setGender(brief.gender || 'all');
      setPaymentType(brief.paymentType || 'paid');
      setMinFollowers(String(brief.minFollowers || 10000));
      setCostPerCreator(String(brief.costPerCreator || 5000));
      setNumCreators(String(brief.numCreators || 5));
      setPaymentMethod(brief.paymentMethod || 'Bank Transfer');
      setPaymentTimeline(brief.paymentTimeline || 'After Approval');
    }
  }, [campaign, mode]);

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
      // Rebuild brief details object
      const currentBrief = campaign?.briefDetails ? (typeof campaign.briefDetails === 'string' ? JSON.parse(campaign.briefDetails) : campaign.briefDetails) : {};
      const updatedBrief = {
        ...currentBrief,
        brandName,
        objective,
        priority,
        location,
        gender,
        paymentType,
        minFollowers: parseInt(minFollowers) || 10000,
        costPerCreator: parseInt(costPerCreator) || 0,
        numCreators: parseInt(numCreators) || 0,
        paymentMethod,
        paymentTimeline,
      };

      const budget = (parseInt(costPerCreator) || 0) * (parseInt(numCreators) || 0) * 100; // in cents

      const payload = {
        title,
        description,
        budget,
        expectedReach: parseInt(expectedReach) || 250000,
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
              router.replace('/brand');
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

  const handleAcceptApplicant = async (app: any) => {
    try {
      const room = await api.chat.createRoom(app.influencerId, id);
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
                  id: room.id || room.roomId,
                  name: app.name || app.instagramHandle,
                  avatar: app.avatar || '',
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
            <TouchableOpacity style={styles.editHeaderBtn} onPress={() => setMode('edit')} activeOpacity={0.8}>
              <Text style={styles.editHeaderText}>Edit</Text>
            </TouchableOpacity>
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
                {!image ? <PlaceholderImage tone={toneColor} height={140} borderRadius={16} /> : <Image source={{ uri: image }} style={styles.bannerImage} />}
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

              {/* Description Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeading}>Campaign Brief</Text>
                <Text style={styles.bodyDescription}>{description}</Text>
              </View>

              {/* Budget and Payment Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeading}>Budget & Rewards</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoGridCell}>
                    <Text style={styles.infoCellLabel}>Payment Type</Text>
                    <Text style={[styles.infoCellVal, { textTransform: 'capitalize' }]}>{brief.paymentType || 'Paid'}</Text>
                  </View>
                  <View style={styles.infoGridCell}>
                    <Text style={styles.infoCellLabel}>Cost per Creator</Text>
                    <Text style={styles.infoCellVal}>₹{(brief.costPerCreator || 0).toLocaleString()}</Text>
                  </View>
                  <View style={styles.infoGridCell}>
                    <Text style={styles.infoCellLabel}>Target Creators</Text>
                    <Text style={styles.infoCellVal}>{brief.numCreators || 0}</Text>
                  </View>
                  <View style={styles.infoGridCell}>
                    <Text style={styles.infoCellLabel}>Total Budget</Text>
                    <Text style={styles.infoCellValPrice}>₹{((brief.costPerCreator || 0) * (brief.numCreators || 0)).toLocaleString()}</Text>
                  </View>
                </View>
                <View style={styles.dividerLight} />
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsRowLabel}>Payment Method:</Text>
                  <Text style={styles.detailsRowValue}>{brief.paymentMethod || 'Bank Transfer'}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsRowLabel}>Payment Timeline:</Text>
                  <Text style={styles.detailsRowValue}>{brief.paymentTimeline || 'After Approval'}</Text>
                </View>
              </View>

              {/* Deliverables Section */}
              {brief.deliverables && brief.deliverables.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionHeading}>Deliverables Required</Text>
                  <View style={styles.deliverablesList}>
                    {brief.deliverables.map((d: any, idx: number) => (
                      <View key={idx} style={styles.deliverablePill}>
                        <Icon name="check" size={12} color={Colors.green} />
                        <Text style={styles.deliverableText}>
                          {d.quantity}x <Text style={{ fontWeight: '700', textTransform: 'capitalize' }}>{d.type.replace('_', ' ')}</Text>
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Targeting Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeading}>Target Creator Profile</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsRowLabel}>Minimum Followers:</Text>
                  <Text style={styles.detailsRowValue}>
                    {brief.minFollowers ? (brief.minFollowers >= 1000000 ? `${(brief.minFollowers / 1000000).toFixed(1)}M` : brief.minFollowers >= 1000 ? `${(brief.minFollowers / 1000).toFixed(0)}k` : brief.minFollowers) : '10k'}+
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsRowLabel}>Engagement Rate:</Text>
                  <Text style={styles.detailsRowValue}>{brief.minEngagementRate || '3'}%+</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsRowLabel}>Target Gender:</Text>
                  <Text style={[styles.detailsRowValue, { textTransform: 'capitalize' }]}>{brief.gender || 'All'}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsRowLabel}>Geographic Location:</Text>
                  <Text style={styles.detailsRowValue}>{brief.location || 'Pan India'}</Text>
                </View>
              </View>

              {/* Guidelines Section */}
              {brief.guidelines && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionHeading}>Brand Guidelines</Text>
                  {brief.guidelines.cta && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsRowLabel}>Call To Action:</Text>
                      <Text style={styles.detailsRowValue}>{brief.guidelines.cta}</Text>
                    </View>
                  )}
                  {brief.guidelines.hashtags && brief.guidelines.hashtags.length > 0 && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsRowLabel}>Hashtags:</Text>
                      <Text style={styles.detailsRowValue}>{brief.guidelines.hashtags.join(', ')}</Text>
                    </View>
                  )}
                  {brief.guidelines.brandKeywords && brief.guidelines.brandKeywords.length > 0 && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsRowLabel}>Must Mention Keywords:</Text>
                      <Text style={styles.detailsRowValue}>{brief.guidelines.brandKeywords.join(', ')}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Applicants Section */}
              {queryData?.applications && queryData.applications.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionHeading}>Applicants ({queryData.applications.length})</Text>
                  <View style={{ gap: 16, marginTop: 8 }}>
                    {queryData.applications.map((app: any) => {
                      const isPending = app.status === 'pending';
                      const isAccepted = app.status === 'accepted';

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
                          <View style={styles.proposalContainer}>
                            <Text style={styles.proposalLabel}>Proposal:</Text>
                            <Text style={styles.proposalText}>"{app.proposal}"</Text>
                          </View>

                          <View style={styles.applicantActions}>
                            {isPending ? (
                              <TouchableOpacity
                                style={styles.acceptApplicantBtn}
                                activeOpacity={0.8}
                                onPress={() => handleAcceptApplicant(app)}
                              >
                                <Icon name="check" size={14} color={Colors.white} />
                                <Text style={styles.acceptApplicantBtnText}>Accept & Chat</Text>
                              </TouchableOpacity>
                            ) : (
                              <View style={[styles.statusBadge, isAccepted ? styles.statusAccepted : styles.statusDeclined]}>
                                <Text style={[styles.statusBadgeText, isAccepted ? styles.statusAcceptedText : styles.statusDeclinedText]}>
                                  {isAccepted ? 'Accepted ✓' : 'Declined ✕'}
                                </Text>
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
            <View style={{ gap: 16 }}>
              <View style={styles.formGroup}>
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

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Campaign Category *</Text>
                <View style={styles.gridRow}>
                  {(['Fashion', 'Real Estate', 'Beauty', 'Food', 'Tech', 'Finance', 'Education', 'Gaming', 'Travel', 'Fitness'] as const).map((n) => {
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
                <Text style={styles.formLabel}>Campaign Description *</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  placeholder="Provide brief details about the campaign..."
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Priority *</Text>
                <View style={styles.toggleRow}>
                  {(['normal', 'high', 'urgent'] as const).map((pri) => {
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

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Target Location</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Pan India, State, or City"
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Creators Budget / Pricing</Text>
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

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Minimum Followers Required</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 10000"
                  keyboardType="numeric"
                  value={minFollowers}
                  onChangeText={setMinFollowers}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Payment Method</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Bank Transfer, UPI, Wallet"
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  value={paymentMethod}
                  onChangeText={setPaymentMethod}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Payment Timeline</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Before Posting, After Approval"
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  value={paymentTimeline}
                  onChangeText={setPaymentTimeline}
                />
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
    height: 140,
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
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: Colors.oxblood,
    borderWidth: 1.5,
  },
  toggleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.oxblood,
  },
  toggleTextActive: {
    fontFamily: FontFamily.sans,
    color: Colors.oxblood,
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: Colors.oxblood,
    borderWidth: 1.5,
  },
  gridBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.oxblood,
  },
  gridBtnTextActive: {
    fontFamily: FontFamily.sans,
    color: Colors.oxblood,
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
});
