import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius } from '@/constants/brand';
import { api } from '@/lib/api';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfilesStore } from '@/store/profiles';
import { useQuery } from '@tanstack/react-query';

interface TopBannerProps {
  onSwitchProfile?: () => void;
}

export function TopBanner({ onSwitchProfile }: TopBannerProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const activeProfileId = useProfilesStore((s) => s.activeProfileId);

  const { data: brandProfileData, isLoading: loadingProfile } = useQuery<any>({
    queryKey: ['brandProfile', activeProfileId],
    queryFn: () => api.brands.profile().catch(() => null),
  });

  const { data: dashRes, isLoading: loadingDashboard } = useQuery<any>({
    queryKey: ['brandDashboard', activeProfileId],
    queryFn: () => api.brands.dashboard().catch(() => null),
    enabled: !!activeProfileId,
  });

  const hasProfileButNotActiveYet = !!(brandProfileData && brandProfileData.id && !activeProfileId);
  const loading = loadingProfile || loadingDashboard || hasProfileButNotActiveYet;

  const stats = React.useMemo(() => {
    if (!dashRes) {
      return {
        totalReach: '0L+',
        activeCampaigns: 0,
        creatorsEngaged: 0,
        pendingReviews: 0,
      };
    }
    return {
      totalReach: dashRes.totalReach ? `${(dashRes.totalReach / 100000).toFixed(1)}L+` : '0L+',
      activeCampaigns: dashRes.activeCampaigns ?? 0,
      creatorsEngaged: dashRes.creatorsEngaged ?? 0,
      pendingReviews: dashRes.pendingReviews ?? 0,
    };
  }, [dashRes]);

  const brandProfile = React.useMemo(() => {
    if (!brandProfileData) {
      return {
        name: 'Brand Settings',
        letter: 'B',
        logo: ''
      };
    }
    const name = brandProfileData.companyName || brandProfileData.name || 'Brand Settings';
    return {
      name,
      letter: name.charAt(0).toUpperCase(),
      logo: brandProfileData.logo || ''
    };
  }, [brandProfileData]);

  return (
    <View style={[styles.topBanner, { paddingTop: insets.top + 10 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.brandProfile}
          activeOpacity={0.8}
          onPress={onSwitchProfile}
          disabled={!onSwitchProfile}
        >
          {loading ? (
            <Skeleton variant="circle" width={38} height={38} dark style={{ borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)' }} />
          ) : (
            <View style={styles.brandAvatar}>
              {brandProfile.logo ? (
                <Image source={{ uri: brandProfile.logo }} style={{ width: '100%', height: '100%', borderRadius: 19 }} contentFit="cover" />
              ) : (
                <Text style={styles.avatarLetter}>{brandProfile.letter}</Text>
              )}
            </View>
          )}
          <View style={styles.brandTitleWrap}>
            {loading ? (
              <View style={{ gap: 4 }}>
                <Skeleton variant="rect" width={100} height={16} borderRadius={4} dark />
                <Skeleton variant="rect" width={60} height={10} borderRadius={3} dark />
              </View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.headerTitle}>{brandProfile.name}</Text>
                  {onSwitchProfile && <Icon name="chevDown" size={14} color={Colors.roseSoft} />}
                </View>
                <Text style={styles.headerSubtitle}>BRAND DASHBOARD</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionBtn} activeOpacity={0.8} onPress={() => router.push('/(tabs)/profile')}>
            <Icon name="chat" size={18} color={Colors.cream} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn} activeOpacity={0.8} onPress={() => router.push('/(tabs)/profile')}>
            <Icon name="bell" size={18} color={Colors.cream} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Reach Card */}
      <View style={styles.reachCard}>
        <Text style={styles.reachCardSub}>TOTAL REACH THIS MONTH</Text>
        {loading ? (
          <Skeleton variant="rect" width={120} height={38} borderRadius={6} style={{ marginVertical: 8 }} dark />
        ) : (
          <Text style={styles.reachCardValue}>{stats.totalReach}</Text>
        )}

        <View style={styles.reachStatsRow}>
          {loading ? (
            <>
              <Skeleton variant="rect" width={60} height={16} borderRadius={4} dark />
              <Skeleton variant="rect" width={70} height={16} borderRadius={4} dark />
              <Skeleton variant="rect" width={65} height={16} borderRadius={4} dark />
            </>
          ) : (
            <>
              <View style={styles.reachStatItem}>
                <Icon name="briefcase" size={14} color={Colors.roseSoft} />
                <Text style={styles.reachStatText}>
                  <Text style={{ fontWeight: '800', color: Colors.cream }}>{stats.activeCampaigns}</Text> Active
                </Text>
              </View>
              <View style={styles.reachStatItem}>
                <Icon name="users" size={14} color={Colors.roseSoft} />
                <Text style={styles.reachStatText}>
                  <Text style={{ fontWeight: '800', color: Colors.cream }}>{stats.creatorsEngaged}</Text> Creators
                </Text>
              </View>
              <View style={styles.reachStatItem}>
                <Icon name="clock" size={14} color={Colors.roseSoft} />
                <Text style={styles.reachStatText}>
                  <Text style={{ fontWeight: '800', color: Colors.cream }}>{stats.pendingReviews}</Text> Pending
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBanner: {
    backgroundColor: Colors.oxbloodDeep,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  brandProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(232,216,204,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.cream,
  },
  avatarLetter: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    color: Colors.cream,
  },
  brandTitleWrap: {
    justifyContent: 'center',
  },
  headerSubtitle: {
    fontFamily: FontFamily.sans,
    fontSize: 9.5,
    color: Colors.roseSoft,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    color: Colors.cream,
    marginTop: -2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reachCard: {
    backgroundColor: 'rgba(232, 216, 204, 0.06)',
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(232, 216, 204, 0.12)',
  },
  reachCardSub: {
    fontFamily: FontFamily.sans,
    fontSize: 10.5,
    color: Colors.roseSoft,
    letterSpacing: 0.8,
  },
  reachCardValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 38,
    color: Colors.cream,
    marginVertical: 4,
  },
  reachStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
  },
  reachStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reachStatText: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: Colors.cream,
  },
});
