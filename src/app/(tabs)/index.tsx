import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HappeningNow } from '@/components/home/happening-now';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { HomeFooter } from '@/components/home/home-footer';
import { HomeHeader } from '@/components/home/home-header';
import { LiveCampaigns } from '@/components/home/live-campaigns';
import { OfferBanner } from '@/components/home/offer-banner';
import { TrendingAudio } from '@/components/home/trending-audio';
import { NotificationsSheet } from '@/components/home/NotificationsSheet';

import { CreateBrandProfileSheet } from '@/components/brand/home/CreateBrandProfileSheet';
import { SwitchBrandProfileSheet } from '@/components/brand/home/SwitchBrandProfileSheet';
import { CreateInfluencerProfileSheet } from '@/components/influencer/CreateInfluencerProfileSheet';
import { SwitchInfluencerProfileSheet } from '@/components/influencer/SwitchInfluencerProfileSheet';
import { Colors } from '@/constants/brand';
import * as mock from '@/data/mock';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import { useQuery, useQueryClient } from '@tanstack/react-query';

function getRelativeTime(dateStr: string) {
  if (!dateStr) return 'now';
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs) || diffMs < 0) return 'now';
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d`;
  } catch {
    return 'now';
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const role = useAuthStore((s) => s.role);
  const setRole = useAuthStore((s) => s.setRole);
  const session = useAuthStore((s) => s.session);
  const userName = session?.user?.name || 'Muskan';
  const queryClient = useQueryClient();

  // Switcher and creation sheets state
  const [isInfluencerSwitcherOpen, setIsInfluencerSwitcherOpen] = useState(false);
  const [isBrandSwitcherOpen, setIsBrandSwitcherOpen] = useState(false);
  const [isCreateBrandOpen, setIsCreateBrandOpen] = useState(false);
  const [isCreateInfluencerOpen, setIsCreateInfluencerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const {
    influencerProfiles,
    activeInfluencerProfileId,
    brandProfiles,
    activeBrandProfileId,
    loadBrandProfiles,
    loadInfluencerProfiles,
  } = useProfilesStore();

  const activeInfluencer = influencerProfiles.find((p) => p.id === activeInfluencerProfileId);
  const activeBrand = brandProfiles.find((p) => p.id === activeBrandProfileId);

  const activeAvatar = role === 'brand' ? activeBrand?.logo : activeInfluencer?.avatar;
  const activeHandle = role === 'brand' ? activeBrand?.companyName : activeInfluencer?.instagramHandle;

  // Load profiles on mount/refresh
  useEffect(() => {
    if (session?.user?.id) {
      if (role === 'brand') {
        loadBrandProfiles(session.user.id).catch(() => { });
      } else {
        loadInfluencerProfiles(session.user.id).catch(() => { });
      }
    }
  }, [session?.user?.id, role, activeBrandProfileId, activeInfluencerProfileId, loadBrandProfiles, loadInfluencerProfiles]);

  const { data: rawCampaignListData, isLoading: loadingCampaigns } = useQuery<any>({
    queryKey: ['campaignsMarketplace', role, role === 'brand' ? activeBrandProfileId : activeInfluencerProfileId],
    queryFn: () => {
      if ((role as string) === 'brand') {
        return api.campaigns.list().catch(() => []);
      } else {
        return api.influencers.marketplace().catch(() => []);
      }
    },
  });

  const { data: songsData } = useQuery<any[]>({
    queryKey: ['trendingSongs'],
    queryFn: () => api.songs.list().catch(() => []),
    enabled: !!session?.user?.id,
  });

  const { data: notificationsData } = useQuery<any[]>({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.list().catch(() => []),
    enabled: !!session?.user?.id,
  });

  const campaignList = React.useMemo(() => {
    const list = (rawCampaignListData ?? []) as any[];
    if (list.length === 0) {
      return [];
    }
    return list.map((c: any) => ({
      id: c.id,
      brand: c.brandName || c.brand?.companyName || 'Richy Brand',
      cat: c.campaignType || c.category || 'General',
      verified: c.verified || c.brand?.verified || false,
      title: c.title,
      budget:
        typeof c.budget === 'number'
          ? `₹${(c.budget / 100).toLocaleString()}`
          : c.budget || '₹10,000',
      deadline: c.deadline || '5 days left',
      applicants: c.applicants || 0,
      tone: c.tone || (c.campaignType === 'Beauty' ? 'rose' : 'ox'),
      about: c.description || c.about,
      deliverables: c.requirements ? c.requirements.split('\n') : ['1 Reel'],
      imageUrl: c.imageUrl || null,
    }));
  }, [rawCampaignListData]);

  const musicsList = React.useMemo(() => {
    if (!songsData || songsData.length === 0) {
      return mock.musics.map((m, idx) => ({
        ...m,
        instagramAudioUrl: idx % 2 === 0
          ? 'https://www.instagram.com/reels/audio/360707759600124/'
          : 'https://www.instagram.com/reels/audio/824355552391032/',
      }));
    }
    return songsData.map((song: any) => ({
      title: song.title,
      artist: song.artist,
      imageUrl: song.imageUrl,
      reels: song.reels || '1.5M',
      dur: song.dur || '0:20',
      tone: song.tone || 'ox',
      instagramAudioUrl: song.instagramAudioUrl,
    }));
  }, [songsData]);

  const activityList = React.useMemo(() => {
    if (!notificationsData || notificationsData.length === 0) {
      return mock.activity;
    }
    return notificationsData.map((n: any, idx: number) => {
      let icon = 'bell';
      const msg = (n.message || '').toLowerCase();
      const title = (n.title || '').toLowerCase();

      if (msg.includes('invite') || title.includes('invite') || msg.includes('campaign') || title.includes('campaign')) {
        icon = 'zap';
      } else if (msg.includes('message') || title.includes('message') || msg.includes('chat') || title.includes('chat')) {
        icon = 'chat';
      } else if (msg.includes('pay') || msg.includes('earn') || msg.includes('released') || msg.includes('wallet')) {
        icon = 'dollar-sign';
      } else if (msg.includes('win') || title.includes('win') || title.includes('contest')) {
        icon = 'award';
      }

      return {
        who: n.title || 'Notification',
        act: '',
        detail: n.message || '',
        time: getRelativeTime(n.createdAt),
        tone: idx % 2 === 0 ? 'rose' : 'ox',
        icon,
        verified: false,
      };
    });
  }, [notificationsData]);

  const hasUnread = React.useMemo(() => {
    return (notificationsData ?? []).some((n: any) => !n.read);
  }, [notificationsData]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Sticky header */}
      <HomeHeader
        isBrand={role === 'brand'}
        userName={userName}
        onRoleChange={(r) => setRole(r === 'creator' ? 'influencer' : 'brand')}
        onSearchPress={() => router.push('/(tabs)/marketplace')}
        onProfileSwitchPress={() => {
          if (role === 'brand') {
            setIsBrandSwitcherOpen(true);
          } else {
            setIsInfluencerSwitcherOpen(true);
          }
        }}
        activeProfileAvatar={activeAvatar}
        activeProfileHandle={activeHandle}
        onNotificationPress={() => setIsNotificationsOpen(true)}
        hasUnread={hasUnread}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.bodyContainer}
      >
        {/* Hero carousel */}
        <HeroCarousel
          onArenaPress={() => router.push('/(tabs)/arena')}
          onStartPress={() => router.push('/(tabs)/marketplace')}
        />

        {/* Subscription offer */}
        <View style={styles.section}>
          <OfferBanner />
        </View>

        <View style={{ gap: 25 }}>

          {/* Live campaigns */}
          <LiveCampaigns
            campaignList={campaignList}
            loading={loadingCampaigns}
            onSeeAllPress={() => router.push('/(tabs)/marketplace')}
            onCampaignPress={(id) => router.push({ pathname: '/collab/[id]', params: { id } })}
          />

          {/* Happening now */}
          <HappeningNow activity={activityList} />

          {/* Trending audio */}
          <TrendingAudio musics={musicsList} />

          {/* Tagline footer */}
          <HomeFooter />
        </View>
      </ScrollView>

      <SwitchInfluencerProfileSheet
        isOpen={isInfluencerSwitcherOpen}
        onClose={() => setIsInfluencerSwitcherOpen(false)}
        onSwitchSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['campaignsMarketplace'] });
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['trendingSongs'] });
        }}
        onAddNewProfile={() => {
          setIsInfluencerSwitcherOpen(false);
          setIsCreateInfluencerOpen(true);
        }}
      />

      <SwitchBrandProfileSheet
        isOpen={isBrandSwitcherOpen}
        onClose={() => setIsBrandSwitcherOpen(false)}
        onSwitchSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['campaignsMarketplace'] });
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['trendingSongs'] });
        }}
        onAddNewProfile={() => {
          setIsBrandSwitcherOpen(false);
          setIsCreateBrandOpen(true);
        }}
      />

      <CreateBrandProfileSheet
        isOpen={isCreateBrandOpen}
        onClose={() => setIsCreateBrandOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['brandProfile'] });
          queryClient.invalidateQueries({ queryKey: ['campaignsMarketplace'] });
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['trendingSongs'] });
        }}
        initialData={null}
      />

      <CreateInfluencerProfileSheet
        isOpen={isCreateInfluencerOpen}
        onClose={() => setIsCreateInfluencerOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['influencerProfile'] });
          queryClient.invalidateQueries({ queryKey: ['campaignsMarketplace'] });
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['trendingSongs'] });
        }}
        initialData={null}
      />

      <NotificationsSheet
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  bodyContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 130
  },
  section: {
    marginTop: 30
  },
});
