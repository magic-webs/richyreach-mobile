import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryPills } from '@/components/home/category-pills';
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

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const role = useAuthStore((s) => s.role);
  const setRole = useAuthStore((s) => s.setRole);
  const session = useAuthStore((s) => s.session);
  const userName = session?.user?.name || 'Muskan';

  const [campaignList, setCampaignList] = useState<any[]>(mock.campaigns);

  useEffect(() => {
    let active = true;
    const fetchCampaigns = async () => {
      try {
        let res: any[] = [];
        if ((role as string) === 'brand') {
          res = (await api.campaigns.list()) as any[];
        } else {
          res = (await api.influencers.marketplace()) as any[];
        }
        if (active && res && res.length > 0) {
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
        }
      } catch (err: any) {
        // Silently fall back to mock data on auth/role mismatch — no console spam
        const msg: string = err?.message ?? '';
        if (!msg.includes('Forbidden') && !msg.includes('401') && !msg.includes('403')) {
          console.error('Failed to load campaigns on HomeScreen:', err);
        }
      }
    };
    fetchCampaigns();
    return () => {
      active = false;
    };
  }, [role]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Sticky header */}
      <HomeHeader
        isBrand={false}
        userName={userName}
        onRoleChange={(r) => setRole(r === 'creator' ? 'influencer' : 'brand')}
        onSearchPress={() => router.push('/(tabs)/marketplace')}
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
        <CategoryPills onCatPress={() => router.push('/(tabs)/marketplace')} />

        {/* Subscription offer */}
        <View style={styles.section}>
          <OfferBanner />
        </View>

        {/* Live campaigns */}
        <LiveCampaigns
          campaignList={campaignList}
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  bodyContainer: { padding: 18, paddingBottom: 130 },
  section: { marginTop: 22 },
});
