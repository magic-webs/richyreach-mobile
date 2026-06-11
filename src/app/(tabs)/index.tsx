import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HappeningNow } from '@/components/home/happening-now';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { HomeFooter } from '@/components/home/home-footer';
import { HomeHeader } from '@/components/home/home-header';
import { LiveCampaigns } from '@/components/home/live-campaigns';
import { OfferBanner } from '@/components/home/offer-banner';
import { TrendingAudio } from '@/components/home/trending-audio';

import { Colors } from '@/constants/brand';
import * as mock from '@/data/mock';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import { SwitchInfluencerProfileSheet } from '@/components/influencer/SwitchInfluencerProfileSheet';
import { SwitchBrandProfileSheet } from '@/components/brand/home/SwitchBrandProfileSheet';
import { CreateBrandProfileSheet } from '@/components/brand/home/CreateBrandProfileSheet';
import { CreateInfluencerProfileSheet } from '@/components/influencer/CreateInfluencerProfileSheet';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const role = useAuthStore((s) => s.role);
  const setRole = useAuthStore((s) => s.setRole);
  const session = useAuthStore((s) => s.session);
  const userName = session?.user?.name || 'Muskan';

  const [campaignList, setCampaignList] = useState<any[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // Switcher and creation sheets state
  const [isInfluencerSwitcherOpen, setIsInfluencerSwitcherOpen] = useState(false);
  const [isBrandSwitcherOpen, setIsBrandSwitcherOpen] = useState(false);
  const [isCreateBrandOpen, setIsCreateBrandOpen] = useState(false);
  const [isCreateInfluencerOpen, setIsCreateInfluencerOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
        loadBrandProfiles(session.user.id).catch(() => {});
      } else {
        loadInfluencerProfiles(session.user.id).catch(() => {});
      }
    }
  }, [session?.user?.id, role, refreshTrigger, activeBrandProfileId, activeInfluencerProfileId]);

  useEffect(() => {
    let active = true;
    const fetchCampaigns = async () => {
      if (active) setLoadingCampaigns(true);
      try {
        let res: any[] = [];
        if ((role as string) === 'brand') {
          res = (await api.campaigns.list()) as any[];
        } else {
          res = (await api.influencers.marketplace()) as any[];
        }
        if (active) {
          if (res && res.length > 0) {
            const mapped = res.map((c: any) => ({
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
            }));
            setCampaignList(mapped);
          } else {
            setCampaignList([]);
          }
        }
      } catch (err: any) {
        if (active) {
          setCampaignList([]);
        }
        // Silently fall back to empty list on auth/role mismatch — no console spam
        const msg: string = err?.message ?? '';
        if (!msg.includes('Forbidden') && !msg.includes('401') && !msg.includes('403')) {
          console.error('Failed to load campaigns on HomeScreen:', err);
        }
      } finally {
        if (active) {
          setLoadingCampaigns(false);
        }
      }
    };
    fetchCampaigns();
    return () => {
      active = false;
    };
  }, [role, refreshTrigger, activeBrandProfileId, activeInfluencerProfileId]);

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

        {/* Category pills */}
        {/* <CategoryPills onCatPress={() => router.push('/(tabs)/marketplace')} /> */}

        {/* Subscription offer */}
        <View style={styles.section}>
          <OfferBanner />
        </View>

        {/* Live campaigns */}
        <LiveCampaigns
          campaignList={campaignList}
          loading={loadingCampaigns}
          onSeeAllPress={() => router.push('/(tabs)/marketplace')}
          onCampaignPress={(id) => router.push({ pathname: '/collab/[id]', params: { id } })}
        />

        {/* Happening now */}
        <HappeningNow activity={mock.activity} />

        {/* Trending audio */}
        <TrendingAudio musics={mock.musics} />

        {/* Tagline footer */}
        <HomeFooter />
      </ScrollView>

      <SwitchInfluencerProfileSheet
        isOpen={isInfluencerSwitcherOpen}
        onClose={() => setIsInfluencerSwitcherOpen(false)}
        onSwitchSuccess={() => setRefreshTrigger((t) => t + 1)}
        onAddNewProfile={() => {
          setIsInfluencerSwitcherOpen(false);
          setIsCreateInfluencerOpen(true);
        }}
      />

      <SwitchBrandProfileSheet
        isOpen={isBrandSwitcherOpen}
        onClose={() => setIsBrandSwitcherOpen(false)}
        onSwitchSuccess={() => setRefreshTrigger((t) => t + 1)}
        onAddNewProfile={() => {
          setIsBrandSwitcherOpen(false);
          setIsCreateBrandOpen(true);
        }}
      />

      <CreateBrandProfileSheet
        isOpen={isCreateBrandOpen}
        onClose={() => setIsCreateBrandOpen(false)}
        onSuccess={() => setRefreshTrigger((t) => t + 1)}
        initialData={null}
      />

      <CreateInfluencerProfileSheet
        isOpen={isCreateInfluencerOpen}
        onClose={() => setIsCreateInfluencerOpen(false)}
        onSuccess={() => setRefreshTrigger((t) => t + 1)}
        initialData={null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  bodyContainer: { padding: 18, paddingBottom: 130 },
  section: { marginTop: 22 },
});
