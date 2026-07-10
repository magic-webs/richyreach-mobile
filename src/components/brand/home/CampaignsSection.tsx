import LottieView from 'lottie-react-native';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useEffect, useState, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useProfilesStore } from '@/store/profiles';
import { useUIStore } from '@/store/ui';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Trash2 } from 'lucide-react-native';

interface CampaignCardProps {
  title: string;
  tone: 'rose' | 'ox';
  creators: number;
  reach: string;
  spent: number;
  total: number;
  viewMode?: 'list' | 'grid';
  onPress?: () => void;
  onDeletePress?: () => void;
  image?: string;
  status?: string;
}

function CampaignCard({ title, tone, creators, reach, spent, total, viewMode = 'list', onPress, onDeletePress, image, status }: CampaignCardProps) {
  const percentage = Math.round((spent / total) * 100);
  const isGrid = viewMode === 'grid';
  const isDraft = status === 'draft';
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.campaignCardContainer, isGrid && styles.campaignCardGridContainer]}
    >
      <BlurView intensity={80} tint="light" style={[styles.campaignCard, isGrid && styles.campaignCardGrid]}>
        <View style={[styles.campaignHeader, isGrid && styles.campaignHeaderGrid]}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={[styles.bannerImage, isGrid && styles.bannerImageGrid]}
            />
          ) : (
            <PlaceholderImage tone={tone} height={isGrid ? 90 : 48} width={isGrid ? '100%' : 48} borderRadius={12} />
          )}
          <View style={styles.campaignInfo}>
            <View style={styles.titleRow}>
              <Text style={[styles.campaignTitle, isGrid && styles.campaignTitleGrid]} numberOfLines={isGrid ? 2 : 1}>{title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {!isGrid && (
                  <View style={[styles.activeBadge, isDraft && styles.draftBadge]}>
                    <Text style={[styles.activeText, isDraft && styles.draftText]}>
                      {isDraft ? 'Draft' : 'Active'}
                    </Text>
                  </View>
                )}
                {isDraft && onDeletePress && (
                  <TouchableOpacity
                    onPress={(e) => { e.stopPropagation(); onDeletePress(); }}
                    style={{ marginLeft: 8 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Trash2 size={14} color={Colors.roseDeep} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <Text style={[styles.campaignMeta, isGrid && styles.campaignMetaGrid]}>
              <Text style={{ fontWeight: '700', color: Colors.oxblood }}>{creators}</Text> {isGrid ? 'crs' : 'creators'} {isGrid ? '\nReach: ' : '  Reach: '}
              <Text style={{ fontWeight: '700', color: Colors.oxblood }}>{reach}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.campaignProgress}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressBudget}>
              ₹{spent.toLocaleString()}{!isGrid && ` of ₹${total.toLocaleString()}`}
            </Text>
            <Text style={styles.progressPercent}>{percentage}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

function CampaignCardSkeleton({ viewMode = 'list' }: { viewMode?: 'list' | 'grid' }) {
  const isGrid = viewMode === 'grid';
  return (
    <View style={[styles.campaignCardContainer, isGrid && styles.campaignCardGridContainer]}>
      <BlurView intensity={80} tint="light" style={[styles.campaignCard, isGrid && styles.campaignCardGrid]}>
        <View style={[styles.campaignHeader, isGrid && styles.campaignHeaderGrid]}>
          <Skeleton variant="rect" width={isGrid ? '100%' : 48} height={isGrid ? 90 : 48} borderRadius={12} />
          <View style={styles.campaignInfo}>
            <View style={styles.titleRow}>
              <Skeleton variant="text" width={isGrid ? "90%" : "60%"} />
              {!isGrid && <Skeleton variant="rect" width={50} height={18} borderRadius={99} style={{ marginLeft: 8 }} />}
            </View>
            <Skeleton variant="text" width={isGrid ? "60%" : "40%"} style={{ marginTop: 8 }} />
          </View>
        </View>

        <View style={styles.campaignProgress}>
          <View style={styles.progressTextRow}>
            <Skeleton variant="text" width="45%" />
            <Skeleton variant="text" width="15%" />
          </View>
          <Skeleton variant="rect" height={8} borderRadius={4} style={{ marginTop: 8 }} />
        </View>
      </BlurView>
    </View>
  );
}

interface CampaignsSectionProps {
  onNewCampaign: () => void;
  onEditDraft?: (campaign: any) => void;
  refreshTrigger?: number;
}

export function CampaignsSection({ onNewCampaign, onEditDraft }: CampaignsSectionProps) {
  const activeProfileId = useProfilesStore((s) => s.activeProfileId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const showModal = useUIStore((s) => s.showModal);

  const handleDeleteDraft = (id: string) => {
    showModal({
      title: "Delete Draft",
      message: "Are you sure you want to delete this draft campaign?",
      actions: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.campaigns.delete(id);
              queryClient.invalidateQueries({ queryKey: ['brandCampaigns', activeProfileId] });
            } catch (err: any) {
              showModal({
                title: 'Error',
                message: err.message || 'Failed to delete draft'
              });
            }
          }
        }
      ]
    });
  };

  const { data: campaignsData, isLoading: loading } = useQuery<any>({
    queryKey: ['brandCampaigns', activeProfileId],
    queryFn: () => api.campaigns.list().catch(() => []),
    enabled: !!activeProfileId,
  });

  const campaigns = (campaignsData ?? []) as any[];

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [btnWidth, setBtnWidth] = useState(29); // fallback

  const slideAnim = useRef(new Animated.Value(viewMode === 'list' ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: viewMode === 'list' ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();
  }, [viewMode, slideAnim]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, btnWidth]
  });

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Campaigns</Text>
        <View style={styles.headerControls}>
          <View style={styles.viewToggleGroup}>
            <Animated.View style={[styles.viewToggleSlider, { width: btnWidth, transform: [{ translateX }] }]} />
            <TouchableOpacity
              onLayout={(e) => setBtnWidth(e.nativeEvent.layout.width)}
              onPress={() => setViewMode('grid')}
              style={styles.viewToggleBtn}
              activeOpacity={0.8}
            >
              <Icon name="grid" size={13} color={viewMode === 'grid' ? Colors.cream : 'rgba(63, 3, 11, 0.4)'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setViewMode('list')} style={styles.viewToggleBtn} activeOpacity={0.8}>
              <Icon name="list" size={13} color={viewMode === 'list' ? Colors.cream : 'rgba(63, 3, 11, 0.4)'} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onNewCampaign} activeOpacity={0.8} style={styles.newCampaignBtn}>
            <Text style={styles.newCampaignText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.campaignList, viewMode === 'grid' && styles.campaignListGrid]}>
        {(!activeProfileId || loading) ? (
          <>
            <CampaignCardSkeleton viewMode={viewMode} />
            <CampaignCardSkeleton viewMode={viewMode} />
            <CampaignCardSkeleton viewMode={viewMode} />
          </>
        ) : campaigns.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <LottieView
              source={require('@/assets/lottie-animation/empty-ghost.json')}
              autoPlay
              loop
              style={{ width: 140, height: 140, marginBottom: 8, alignSelf: 'center' }}
            />
            <Text style={styles.emptyStateTitle}>No campaigns created yet</Text>
            <Text style={styles.emptyStateDescription}>
              Launch your first campaign to start collaborating with top creators and grow your brand.
            </Text>
            <TouchableOpacity
              onPress={onNewCampaign}
              activeOpacity={0.8}
              style={styles.emptyStateBtn}
            >
              <Text style={styles.emptyStateBtnText}>Create Campaign</Text>
            </TouchableOpacity>
          </View>
        ) : (
          campaigns.map((c: any) => {
            const total = typeof c.budget === 'number' ? c.budget / 100 : 10000;
            const spent = typeof c.spent === 'number' ? c.spent : Math.round(total * 0.75);
            const creators = (c.creatorsCount ?? c.applicants) || 0;

            let reachStr = '0';
            if (c.expectedReach) {
              const n = Number(c.expectedReach);
              if (!isNaN(n)) {
                if (n >= 1000000) reachStr = `${(n / 1000000).toFixed(1)}M`;
                else if (n >= 1000) reachStr = `${(n / 1000).toFixed(0)}k`;
                else reachStr = String(n);
              } else {
                reachStr = String(c.expectedReach);
              }
            }

            return (
              <CampaignCard
                key={c.id}
                image={c.bannerImage || c.imageUrl}
                title={c.title}
                tone={c.tone || (c.campaignType === 'Beauty' ? 'rose' : 'ox')}
                creators={creators}
                reach={reachStr}
                spent={spent}
                total={total}
                viewMode={viewMode}
                status={c.status}
                onPress={() => {
                  if (c.status === 'draft' && onEditDraft) {
                    onEditDraft(c);
                  } else {
                    router.push({ pathname: '/brand/campaign/[id]', params: { id: c.id } } as any);
                  }
                }}
                onDeletePress={() => handleDeleteDraft(c.id)}
              />
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  bannerImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  bannerImageGrid: {
    width: '100%',
    height: 90,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    borderRadius: Radius.full,
    padding: 3,
    position: 'relative',
  },
  viewToggleSlider: {
    position: 'absolute',
    top: 3,
    left: 3,
    bottom: 3,
    backgroundColor: Colors.oxblood,
    borderRadius: Radius.full,
  },
  viewToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    zIndex: 1,
  },
  newCampaignBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(63, 3, 11, 0.04)',
    borderRadius: Radius.full,
  },
  newCampaignText: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.oxbloodDeep,
  },
  campaignList: {
    gap: 14,
  },
  campaignListGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  campaignCardContainer: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  campaignCardGridContainer: {
    width: '48%',
  },
  campaignCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderWidth: 1,
    borderRadius: Radius.lg,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  campaignHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  campaignInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  campaignTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    color: Colors.oxblood,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  activeBadge: {
    backgroundColor: 'rgba(42, 122, 90, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeText: {
    fontFamily: FontFamily.sans,
    fontSize: 9.5,
    color: Colors.green,
    fontWeight: '800',
  },
  draftBadge: {
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
  },
  draftText: {
    color: '#d35400',
  },
  campaignMeta: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.5)',
    marginTop: 4,
  },
  campaignProgress: {
    marginTop: 14,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBudget: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.5)',
  },
  progressPercent: {
    fontFamily: FontFamily.sans,
    fontSize: 11.5,
    color: Colors.oxblood,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(63, 3, 11, 0.06)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.roseDeep,
    borderRadius: 3,
  },
  campaignCardGrid: {
    padding: 12,
  },
  campaignHeaderGrid: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  campaignTitleGrid: {
    fontSize: 13,
    marginRight: 0,
    lineHeight: 18,
  },
  campaignMetaGrid: {
    fontSize: 10,
    marginTop: 2,
    lineHeight: 14,
  },
  emptyStateContainer: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
    marginTop: 4,
    width: '100%',
  },
  emptyStateImage: {
    width: 160,
    height: 160,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    color: Colors.oxblood,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: 'rgba(63, 3, 11, 0.6)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  emptyStateBtn: {
    backgroundColor: Colors.oxblood,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radius.full,
    ...Shadow.button,
  },
  emptyStateBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Colors.cream,
    fontWeight: '700',
  },
});
