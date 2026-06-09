import { Colors } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InviteCreatorSheet } from '@/components/brand/marketplace/InviteCreatorSheet';
import { MarketplaceBanner } from '@/components/brand/marketplace/MarketplaceBanner';
import { Creator } from '@/components/brand/marketplace/MarketplaceCreatorCard';
import { MarketplaceCreatorList } from '@/components/brand/marketplace/MarketplaceCreatorList';
import { MarketplaceFilters } from '@/components/brand/marketplace/MarketplaceFilters';
import { MarketplaceHeader } from '@/components/brand/marketplace/MarketplaceHeader';
import { MarketplaceSearch } from '@/components/brand/marketplace/MarketplaceSearch';

const ALL_CREATORS: Creator[] = [
  { id: '1', name: 'Mira Sen', handle: '@mira.wellness', followers: '38k', engagement: '11.2%', collabs: 6, rating: '4.6', rate: '₹12,000', niche: ['Fitness', 'Wellness'], tone: 'ox' },
  { id: '2', name: 'Léa Fontaine', handle: '@lea.fr', followers: '62k', engagement: '9.1%', collabs: 9, rating: '4.7', rate: '₹20,000', niche: ['Skincare', 'Beauty'], tone: 'rose' },
  { id: '3', name: 'Kai Rao', handle: '@kai.shoots', followers: '96k', engagement: '7.8%', collabs: 14, rating: '4.8', rate: '₹28,000', niche: ['Tech', 'Unboxing'], tone: 'ox' },
  { id: '4', name: 'Muskan', handle: '@muskan.creates', followers: '184k', engagement: '6.2%', collabs: 28, rating: '4.9', rate: '₹45,000', niche: ['Beauty', 'Lifestyle'], tone: 'rose' },
  { id: '5', name: 'Noa Vey', handle: '@noa.creates', followers: '218k', engagement: '5.4%', collabs: 32, rating: '4.9', rate: '₹50,000', niche: ['Fashion', 'Editorial'], tone: 'ox' },
  { id: '6', name: 'Ivo Marsh', handle: '@ivo.films', followers: '50k', engagement: '6.8%', collabs: 8, rating: '4.5', rate: '₹15,000', niche: ['Tech', 'UGC'], tone: 'rose' },
];

export default function BrandMarketplaceScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ inviteCreator?: string; followers?: string; eng?: string; tone?: string }>();
  const showModal = useUIStore((s) => s.showModal);

  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');

  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite sheet state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Partial<Creator> | null>(null);
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    const fetchCreators = async () => {
      try {
        setLoading(true);
        const res = await api.influencers.list() as any[];
        if (active) {
          if (res && res.length > 0) {
            const mapped = res.map((c: any) => {
              let fCount = c.followers ? Number(c.followers) : 0;
              let fStr = `${fCount}`;
              if (fCount >= 1000000) fStr = `${(fCount / 1000000).toFixed(1)}M`;
              else if (fCount >= 1000) fStr = `${(fCount / 1000).toFixed(0)}k`;

              return {
                id: c.id || c._id,
                name: c.name || c.instagramHandle || 'Creator',
                handle: `@${c.instagramHandle || 'creator'}`,
                followers: fStr,
                engagement: c.engagementRate ? `${Number(c.engagementRate).toFixed(1)}%` : '5.0%',
                collabs: c.collabs || Math.floor(Math.random() * 20) + 1,
                rating: c.rating ? Number(c.rating).toFixed(1) : '4.8',
                rate: c.pricing ? `₹${(c.pricing / 100).toLocaleString()}` : '₹15,000',
                niche: Array.isArray(c.niche) ? c.niche : c.niche ? [c.niche] : ['Lifestyle'],
                tone: (c.niche === 'Beauty' ? 'rose' : 'ox') as 'rose' | 'ox',
              };
            });
            setCreators(mapped);
          } else {
            setCreators(ALL_CREATORS);
          }
        }
      } catch (err) {
        console.warn('Marketplace: failed to load creators', err);
        if (active) setCreators(ALL_CREATORS);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchCreators();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (params.inviteCreator) {
      setSelectedCreator({
        name: params.inviteCreator,
        followers: params.followers || '38k',
        engagement: params.eng || '11.2%',
        tone: (params.tone as 'rose' | 'ox') || 'rose',
        rate: params.inviteCreator === 'Muskan' ? '₹45,000' : '₹12,000'
      });
      setInviteOpen(true);
    }
  }, [params]);

  const handleOpenInvite = (creator: Creator) => {
    setSelectedCreator(creator);
    setInviteOpen(true);
  };

  const handleSendInvite = (campaign: string) => {
    setInviteOpen(false);
    showModal({
      title: 'Invite Sent',
      message: `Successfully invited ${selectedCreator?.name} to collaborate on the "${campaign}" campaign!`,
    });
  };

  const handleMessageCreator = () => {
    setInviteOpen(false);
    showModal({
      title: 'Message Center',
      message: `Opening direct messaging channel with ${selectedCreator?.name}. You can discuss campaign briefs and pricing details here.`,
    });
  };

  const toggleBookmark = (id: string, name: string) => {
    setBookmarked((prev) => {
      const state = !prev[id];
      if (state) {
        showModal({
          title: 'Added to List',
          message: `Saved ${name} to your shortlist.`,
        });
      }
      return { ...prev, [id]: state };
    });
  };

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch = creator.name.toLowerCase().includes(search.toLowerCase()) ||
      creator.handle.toLowerCase().includes(search.toLowerCase()) ||
      creator.niche.some((n) => n.toLowerCase().includes(search.toLowerCase()));

    if (selectedTier === 'All') return matchesSearch;

    const followersNum = parseFloat(creator.followers.replace('k', '').replace('M', '000'));
    if (selectedTier === 'Mega' && followersNum >= 100) return matchesSearch;
    if (selectedTier === 'Macro' && followersNum >= 50 && followersNum < 100) return matchesSearch;
    if (selectedTier === 'Micro' && followersNum >= 20 && followersNum < 50) return matchesSearch;
    if (selectedTier === 'Nano' && followersNum < 20) return matchesSearch;

    return matchesSearch;
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <MarketplaceHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        style={styles.body}
      >
        <MarketplaceSearch search={search} setSearch={setSearch} />

        <MarketplaceFilters selectedTier={selectedTier} setSelectedTier={setSelectedTier} />

        <MarketplaceBanner />

        <MarketplaceCreatorList
          loading={loading}
          creators={filteredCreators}
          bookmarked={bookmarked}
          onToggleBookmark={toggleBookmark}
          onInvite={handleOpenInvite}
        />
      </ScrollView>

      <InviteCreatorSheet
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        creator={selectedCreator}
        onMessageFirst={handleMessageCreator}
        onSendInvite={handleSendInvite}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
