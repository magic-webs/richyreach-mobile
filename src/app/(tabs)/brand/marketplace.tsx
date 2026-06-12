import { Colors } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { InviteCreatorSheet } from '@/components/brand/marketplace/InviteCreatorSheet';
import { MarketplaceBanner } from '@/components/brand/marketplace/MarketplaceBanner';
import { Creator } from '@/components/brand/marketplace/MarketplaceCreatorCard';
import { MarketplaceCreatorList } from '@/components/brand/marketplace/MarketplaceCreatorList';
import { MarketplaceFilters } from '@/components/brand/marketplace/MarketplaceFilters';
import { MarketplaceHeader } from '@/components/brand/marketplace/MarketplaceHeader';
import { MarketplaceSearch } from '@/components/brand/marketplace/MarketplaceSearch';
import { SwitchBrandProfileSheet } from '@/components/brand/home/SwitchBrandProfileSheet';
import { CreateBrandProfileSheet } from '@/components/brand/home/CreateBrandProfileSheet';

export default function BrandMarketplaceScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ inviteCreator?: string; followers?: string; eng?: string; tone?: string }>();
  const showModal = useUIStore((s) => s.showModal);

  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');

  const queryClient = useQueryClient();

  // Invite sheet state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Partial<Creator> | null>(null);
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  // Switcher and creation sheets state
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);

  const session = useAuthStore((s) => s.session);
  const {
    brandProfiles,
    activeBrandProfileId,
    loadBrandProfiles,
  } = useProfilesStore();

  const activeBrand = brandProfiles.find((p) => p.id === activeBrandProfileId);

  // Load profiles on mount/refresh
  useEffect(() => {
    if (session?.user?.id) {
      loadBrandProfiles(session.user.id).catch(() => {});
    }
  }, [session?.user?.id, activeBrandProfileId]);

  const { data: rawCreatorsData, isLoading: loading } = useQuery<any>({
    queryKey: ['influencersList'],
    queryFn: () => api.influencers.list().catch(() => []),
  });

  const rawCreators = (rawCreatorsData ?? []) as any[];

  const creators = React.useMemo(() => {
    if (!rawCreators || rawCreators.length === 0) {
      return [];
    }
    return rawCreators.map((c: any) => {
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
  }, [rawCreators]);

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

  const filteredCreators = creators.filter((creator: any) => {
    const matchesSearch = creator.name.toLowerCase().includes(search.toLowerCase()) ||
      creator.handle.toLowerCase().includes(search.toLowerCase()) ||
      creator.niche.some((n: string) => n.toLowerCase().includes(search.toLowerCase()));

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
      <MarketplaceHeader
        activeBrandLogo={activeBrand?.logo}
        activeBrandName={activeBrand?.companyName}
        onProfileSwitchPress={() => setIsSwitcherOpen(true)}
      />

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

      <CreateBrandProfileSheet
        isOpen={isProfileSheetOpen}
        onClose={() => setIsProfileSheetOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['brandProfile'] });
        }}
        initialData={activeBrand ? {
          companyName: activeBrand.companyName,
          website: activeBrand.website,
          logo: activeBrand.logo || undefined,
          category: activeBrand.category,
          description: activeBrand.description || undefined,
        } : null}
      />

      <SwitchBrandProfileSheet
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        onSwitchSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['brandProfile'] });
          queryClient.invalidateQueries({ queryKey: ['brandDashboard', activeBrandProfileId] });
          queryClient.invalidateQueries({ queryKey: ['brandCampaigns', activeBrandProfileId] });
        }}
        onAddNewProfile={() => {
          setIsSwitcherOpen(false);
          setIsProfileSheetOpen(true);
        }}
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
