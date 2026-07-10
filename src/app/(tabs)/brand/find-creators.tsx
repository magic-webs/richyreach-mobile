import { Creator } from '@/components/brand/marketplace/MarketplaceCreatorCard';
import { InviteCreatorSheet } from '@/components/brand/marketplace/InviteCreatorSheet';
import { MarketplaceCreatorList } from '@/components/brand/marketplace/MarketplaceCreatorList';
import { MarketplaceFilters } from '@/components/brand/marketplace/MarketplaceFilters';
import { MarketplaceSearch } from '@/components/brand/marketplace/MarketplaceSearch';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BrandFindCreatorsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showModal = useUIStore((s) => s.showModal);

  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  // Shares the marketplace query cache key so data is reused across screens.
  const { data: rawCreatorsData, isLoading } = useQuery<any>({
    queryKey: ['influencersList'],
    queryFn: () => api.influencers.list().catch(() => []),
  });
  const rawCreators = (rawCreatorsData ?? []) as any[];

  // Load active campaigns for the invite sheet.
  useEffect(() => {
    api.campaigns
      .list()
      .then((data: any) => setCampaigns((Array.isArray(data) ? data : []).filter((c: any) => c.status === 'active')))
      .catch(() => setCampaigns([]));
  }, []);

  const creators = React.useMemo<Creator[]>(() => {
    if (!Array.isArray(rawCreators) || rawCreators.length === 0) return [];
    const seen = new Set<string>();
    return rawCreators
      .map((c: any) => {
        if (!c || typeof c !== 'object') return null;
        const id = c.id || c._id || c.userId;
        if (!id || seen.has(id)) return null;
        seen.add(id);

        const fCount = c.followers ? Number(c.followers) : 0;
        let fStr = `${fCount}`;
        if (fCount >= 1000000) fStr = `${(fCount / 1000000).toFixed(1)}M`;
        else if (fCount >= 1000) fStr = `${(fCount / 1000).toFixed(0)}k`;

        return {
          id,
          name: c.name || c.instagramHandle || 'Creator',
          handle: `@${c.instagramHandle || 'creator'}`,
          followers: fStr,
          engagement: c.engagementRate ? `${Number(c.engagementRate).toFixed(1)}%` : '5.0%',
          collabs: c.collabs || 0,
          rating: c.rating ? Number(c.rating).toFixed(1) : '4.8',
          rate: c.pricing ? `₹${(c.pricing / 100).toLocaleString()}` : '₹15,000',
          niche: Array.isArray(c.niche) ? c.niche : c.niche ? [c.niche] : ['Lifestyle'],
          tone: (c.niche === 'Beauty' ? 'rose' : 'ox') as 'rose' | 'ox',
          avatar: c.avatar || null,
        } as Creator;
      })
      .filter((c): c is Creator => !!c);
  }, [rawCreators]);

  const filteredCreators = creators.filter((creator) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      creator.name.toLowerCase().includes(q) ||
      creator.handle.toLowerCase().includes(q) ||
      creator.niche.some((n) => n.toLowerCase().includes(q));
    if (!matchesSearch) return false;
    if (selectedTier === 'All') return true;

    const followersNum = parseFloat(creator.followers.replace('k', '').replace('M', '000')) || 0;
    if (selectedTier === 'Mega') return followersNum >= 100;
    if (selectedTier === 'Macro') return followersNum >= 50 && followersNum < 100;
    if (selectedTier === 'Micro') return followersNum >= 20 && followersNum < 50;
    if (selectedTier === 'Nano') return followersNum < 20;
    return true;
  });

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenInvite = (creator: Creator) => {
    setSelectedCreator(creator);
    setInviteOpen(true);
  };

  const handleSendInvite = async (campaignId: string, campaignTitle: string) => {
    if (!selectedCreator?.id) return;
    setInviteOpen(false);
    try {
      const room = await api.chat.createRoom(selectedCreator.id, campaignId);
      await api.chat.send(
        room.id,
        `I'd love to invite you to collaborate on our campaign "${campaignTitle}".`,
        campaignId
      );
      showModal({
        title: 'Invite Sent',
        message: `Successfully invited ${selectedCreator?.name} to collaborate on the "${campaignTitle}" campaign!`,
        actions: [
          { text: 'OK', style: 'default' },
          {
            text: 'Go to Chat',
            style: 'default',
            onPress: () => router.push({ pathname: '/brand/chat/[id]' as any, params: { id: room.id } }),
          },
        ],
      });
    } catch (err: any) {
      showModal({ title: 'Invite Failed', message: err.message || 'Failed to send campaign invitation. Please try again.' });
    }
  };

  const handleMessageCreator = async () => {
    setInviteOpen(false);
    if (!selectedCreator?.id) return;
    try {
      const room = await api.chat.createRoom(selectedCreator.id);
      router.push({ pathname: '/brand/chat/[id]' as any, params: { id: room.id } });
    } catch (err) {
      console.error('Failed to start conversation with creator', err);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={26} color={Colors.oxblood} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Creators</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <MarketplaceSearch search={search} setSearch={setSearch} />
        <MarketplaceFilters selectedTier={selectedTier} setSelectedTier={setSelectedTier} />
        <MarketplaceCreatorList
          loading={isLoading}
          creators={filteredCreators}
          bookmarked={bookmarked}
          onToggleBookmark={(id) => toggleBookmark(id)}
          onInvite={handleOpenInvite}
        />
      </ScrollView>

      <InviteCreatorSheet
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        creator={selectedCreator}
        onMessageFirst={handleMessageCreator}
        onSendInvite={handleSendInvite}
        campaigns={campaigns}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.06)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.07)',
    ...Shadow.card,
  },
  headerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    color: Colors.ink,
    fontWeight: '700',
  },
  placeholder: {
    width: 36,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
});
