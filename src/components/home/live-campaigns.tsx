import { GradientView } from '@/components/ui/gradient-view';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { Skeleton } from '@/components/ui/skeleton';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HugeiconsIcon } from '@hugeicons/react-native';
import { Briefcase01Icon, GridIcon, ListViewIcon, BadgeCheckIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

const { width: W } = Dimensions.get('window');

interface LiveCampaignsProps {
  campaignList: any[];
  onSeeAllPress: () => void;
  onCampaignPress: (id: string) => void;
  loading?: boolean;
}

function LiveCampaignSkeletonCard({ isGrid }: { isGrid: boolean }) {
  if (isGrid) {
    return (
      <View style={styles.campaignCard}>
        <Skeleton width="100%" height={92} borderRadius={0} />
        <View style={styles.campaignInfo}>
          <Skeleton width={80} height={14} borderRadius={4} />
          <View style={[styles.campaignFooter, { marginTop: 8 }]}>
            <Skeleton width={50} height={18} borderRadius={4} />
            <Skeleton width={26} height={26} borderRadius={8} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.campaignCardList}>
      <Skeleton width={80} height={80} borderRadius={12} />
      <View style={[styles.campaignInfoList, { justifyContent: 'space-between', paddingVertical: 4, flex: 1 }]}>
        <Skeleton width={100} height={16} borderRadius={4} />
        <Skeleton width={80} height={12} borderRadius={4} />
        <View style={[styles.campaignFooterList, { marginTop: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <Skeleton width={60} height={18} borderRadius={4} />
          <Skeleton width={26} height={26} borderRadius={8} />
        </View>
      </View>
    </View>
  );
}

export function LiveCampaigns({ campaignList, onSeeAllPress, onCampaignPress, loading }: LiveCampaignsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [btnWidth, setBtnWidth] = useState(29); // fallback

  const slideAnim = React.useMemo(() => new Animated.Value(0), []);

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
    outputRange: [0, btnWidth],
  });

  const isGrid = viewMode === 'grid';

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <GradientView variant="rose" style={styles.sectionIcon}>
          <HugeiconsIcon
            icon={Briefcase01Icon}
            size={16}
            color="#fff"
            strokeWidth={2}
          />
        </GradientView>
        <Text style={styles.sectionTitle}>Live campaigns</Text>

        {/* Sliding Toggle View Mode Button */}
        <View style={styles.viewToggleGroup}>
          <Animated.View style={[styles.viewToggleSlider, { width: btnWidth, transform: [{ translateX }] }]} />
          <TouchableOpacity
            onLayout={(e) => setBtnWidth(e.nativeEvent.layout.width)}
            onPress={() => setViewMode('grid')}
            style={styles.viewToggleBtn}
            activeOpacity={0.8}
          >
            <HugeiconsIcon
              icon={GridIcon}
              size={14}
              color={viewMode === 'grid' ? Colors.cream : 'rgba(63, 3, 11, 0.4)'}
              strokeWidth={2}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode('list')} style={styles.viewToggleBtn} activeOpacity={0.8}>
            <HugeiconsIcon
              icon={ListViewIcon}
              size={14}
              color={viewMode === 'list' ? Colors.cream : 'rgba(63, 3, 11, 0.4)'}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* Grid or List Layout */}
      {loading ? (
        <View style={isGrid ? styles.campaignGrid : styles.campaignGridList}>
          <LiveCampaignSkeletonCard isGrid={isGrid} />
          <LiveCampaignSkeletonCard isGrid={isGrid} />
          <LiveCampaignSkeletonCard isGrid={isGrid} />
          <LiveCampaignSkeletonCard isGrid={isGrid} />
        </View>
      ) : campaignList.length === 0 ? (
        <View style={styles.emptyCard}>
          <Image
            source={require('@/assets/images/empty_campaign.png')}
            style={styles.emptyStateImage}
            contentFit="contain"
          />
          <Text style={styles.emptyStateText}>No live campaigns</Text>
          <Text style={styles.emptyStateSub}>
            There are no campaigns active at the moment. Check back later!
          </Text>
        </View>
      ) : (
        <View style={isGrid ? styles.campaignGrid : styles.campaignGridList}>
          {campaignList.slice(0, 4).map((cm) => (
            <TouchableOpacity
              key={cm.id}
              onPress={() => onCampaignPress(cm.id)}
              activeOpacity={0.85}
              style={isGrid ? styles.campaignCard : styles.campaignCardList}
            >
              <View style={isGrid ? styles.campaignThumb : styles.campaignThumbList}>
                {cm.imageUrl ? (
                  <Image
                    source={{ uri: cm.imageUrl }}
                    style={isGrid ? { width: '100%', height: 92 } : { width: 80, height: 80 }}
                    contentFit="cover"
                  />
                ) : (
                  <PlaceholderImage
                    tone={cm.tone}
                    height={isGrid ? 92 : 80}
                    width={isGrid ? undefined : 80}
                    borderRadius={isGrid ? 0 : 12}
                  />
                )}
                {isGrid && (
                  <View style={styles.campaignApplied}>
                    <Text style={styles.campaignAppliedText}>{cm.applicants} applied</Text>
                  </View>
                )}
                {cm.verified && (
                  <View style={isGrid ? styles.verifiedBadge : styles.verifiedBadgeList}>
                    <HugeiconsIcon
                      icon={BadgeCheckIcon}
                      size={isGrid ? 14 : 11}
                      color={Colors.cream}
                      strokeWidth={2}
                    />
                  </View>
                )}
              </View>

              <View style={isGrid ? styles.campaignInfo : styles.campaignInfoList}>
                <Text style={styles.campaignBrand} numberOfLines={1}>
                  {cm.brand}
                </Text>

                <Text style={styles.campaignTitle} numberOfLines={1}>
                  {cm.title}
                </Text>

                {!isGrid && (
                  <Text style={styles.campaignAppliedTextList}>
                    {cm.applicants} applied · {cm.cat || 'Beauty'}
                  </Text>
                )}

                <View style={isGrid ? styles.campaignFooter : styles.campaignFooterList}>
                  <Text style={styles.campaignBudget}>{cm.budget}</Text>
                  <GradientView variant="rose" style={styles.campaignArrow}>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={14}
                      color="#fff"
                      strokeWidth={2}
                    />
                  </GradientView>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 30 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontFamily: FontFamily.sansMedium, fontSize: 20, fontWeight: '700', color: Colors.ink, flex: 1 },
  seeAll: { fontSize: 13, color: Colors.rose, fontWeight: '700' },

  // Toggle style
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    borderRadius: Radius.full,
    padding: 3,
    position: 'relative',
    marginRight: 6,
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

  // Grid style
  campaignGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  campaignCard: {
    width: (W - 32 - 14) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...Shadow.card,
  },
  campaignThumb: { position: 'relative' },
  campaignApplied: { position: 'absolute', top: 7, right: 7, backgroundColor: 'rgba(42,2,7,0.62)', borderRadius: 99, paddingHorizontal: 7, paddingVertical: 3 },
  campaignAppliedText: { color: Colors.cream, fontSize: 10, fontWeight: '700' },
  verifiedBadge: { position: 'absolute', bottom: 7, left: 7, width: 20, height: 20, borderRadius: 99, backgroundColor: Colors.oxblood, alignItems: 'center', justifyContent: 'center' },
  campaignInfo: { padding: 10 },
  campaignBrand: { fontWeight: '700', fontSize: 13.5, color: Colors.ink, fontFamily: FontFamily.sansMedium },
  campaignTitle: { fontSize: 11.5, color: 'rgba(63,3,11,0.5)', fontFamily: FontFamily.sansRegular, marginTop: 2 },
  campaignFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  campaignBudget: { fontFamily: FontFamily.sansMedium, fontSize: 16, fontWeight: '700', color: Colors.oxblood },
  campaignArrow: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  // List style
  campaignGridList: { flexDirection: 'column', gap: 12 },
  campaignCardList: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...Shadow.card,
    padding: 10,
    gap: 12,
  },
  campaignThumbList: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  verifiedBadgeList: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 16,
    height: 16,
    borderRadius: 99,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  campaignInfoList: {
    flex: 1,
    justifyContent: 'center',
  },
  campaignAppliedTextList: {
    color: 'rgba(63,3,11,0.5)',
    fontSize: 11.5,
    fontFamily: FontFamily.sansMedium,
    marginTop: 2,
  },
  campaignFooterList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 4,
    ...Shadow.card,
    gap: 8,
    width: '100%',
  },
  emptyStateImage: {
    width: 130,
    height: 110,
    marginBottom: 4,
  },
  emptyStateText: {
    fontFamily: FontFamily.serif,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
  },
  emptyStateSub: {
    fontSize: 12,
    color: 'rgba(63, 3, 11, 0.5)',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 10,
  },
});
