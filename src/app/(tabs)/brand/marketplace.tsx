import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { useUIStore } from '@/store/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Creator {
  id: string;
  name: string;
  handle: string;
  followers: string;
  engagement: string;
  collabs: number;
  rating: string;
  rate: string;
  niche: string[];
  tone: 'rose' | 'ox';
}

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
  const router = useRouter();
  const params = useLocalSearchParams<{ inviteCreator?: string; followers?: string; eng?: string; tone?: string }>();
  const showModal = useUIStore((s) => s.showModal);

  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');

  // Invite sheet state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Partial<Creator> | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState('Summer Glow Serum');
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

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

  const handleSendInvite = () => {
    setInviteOpen(false);
    showModal({
      title: 'Invite Sent',
      message: `Successfully invited ${selectedCreator?.name} to collaborate on the "${selectedCampaign}" campaign!`,
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

  const filteredCreators = ALL_CREATORS.filter((creator) => {
    const matchesSearch = creator.name.toLowerCase().includes(search.toLowerCase()) ||
      creator.handle.toLowerCase().includes(search.toLowerCase()) ||
      creator.niche.some((n) => n.toLowerCase().includes(search.toLowerCase()));

    if (selectedTier === 'All') return matchesSearch;

    // Follower tier rules
    const followersNum = parseFloat(creator.followers.replace('k', ''));
    if (selectedTier === 'Mega' && followersNum >= 100) return matchesSearch;
    if (selectedTier === 'Macro' && followersNum >= 50 && followersNum < 100) return matchesSearch;
    if (selectedTier === 'Micro' && followersNum >= 20 && followersNum < 50) return matchesSearch;
    if (selectedTier === 'Nano' && followersNum < 20) return matchesSearch;

    return matchesSearch;
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Icon name="users" size={20} color={Colors.cream} />
          </View>
          <View>
            <Text style={styles.headerSubtitle}>CREATOR DISCOVERY</Text>
            <Text style={styles.headerTitle}>Find creators</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.inviteListBtn} activeOpacity={0.8} onPress={() => showModal({ title: 'Invite List', message: 'You have 0 creators currently in your review invite list.' })}>
          <Text style={styles.inviteListText}>+ Invite list</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        style={styles.body}
      >
        {/* Search Input */}
        <View style={styles.searchBarRow}>
          <View style={styles.searchBar}>
            <Icon name="search" size={16} color="rgba(63, 3, 11, 0.4)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, niche, handle..."
              placeholderTextColor="rgba(63, 3, 11, 0.3)"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Filter Pills Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
        >
          {['All', 'Mega', 'Macro', 'Micro', 'Nano'].map((tier) => (
            <Chip
              key={tier}
              active={selectedTier === tier}
              onPress={() => setSelectedTier(tier)}
              dark
            >
              {tier}
            </Chip>
          ))}

          <TouchableOpacity
            style={styles.sortBtn}
            activeOpacity={0.8}
            onPress={() => showModal({ title: 'Sort Options', message: 'Currently sorting by highest Engagement rate.' })}
          >
            <Icon name="filter" size={13} color={Colors.oxblood} />
            <Text style={styles.sortBtnText}>Eng.</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Reels Style Banner */}
        <TouchableOpacity
          style={styles.banner}
          activeOpacity={0.9}
          onPress={() => showModal({ title: 'Swipe & Discover', message: 'Reels-style swipe matching is currently being loaded. Tap "Invite" in the search list to start collaborating immediately!' })}
        >
          <View style={styles.bannerIcon}>
            <Icon name="play" size={18} color={Colors.oxblood} />
          </View>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerSub}>NEW · REELS-STYLE</Text>
            <Text style={styles.bannerTitle}>Swipe & Discover</Text>
            <Text style={styles.bannerDesc}>Find your perfect creator match</Text>
          </View>
          <View style={styles.bannerArrow}>
            <Icon name="arrow" size={18} color={Colors.cream} />
          </View>
        </TouchableOpacity>

        {/* Results Counter */}
        <Text style={styles.resultsText}>{filteredCreators.length} creators found</Text>

        {/* Creator List */}
        <View style={styles.creatorList}>
          {filteredCreators.map((creator) => (
            <View key={creator.id} style={styles.creatorCard}>
              <View style={styles.cardHeader}>
                <PlaceholderImage tone={creator.tone} height={44} width={44} borderRadius={22} />
                <View style={styles.cardInfo}>
                  <Text style={styles.creatorName}>{creator.name}</Text>
                  <Text style={styles.creatorHandle}>{creator.handle}</Text>
                </View>
                <View style={styles.rateInfo}>
                  <Text style={styles.rateVal}>{creator.rate}</Text>
                  <Text style={styles.rateLabel}>per post</Text>
                </View>
              </View>

              {/* Stats Grid */}
              <View style={styles.statsRow}>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>{creator.followers}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={[styles.statValue, { color: Colors.green }]}>{creator.engagement}</Text>
                  <Text style={styles.statLabel}>Engagement</Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>{creator.collabs}</Text>
                  <Text style={styles.statLabel}>Collabs</Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>{creator.rating}★</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
              </View>

              {/* Tags and Actions */}
              <View style={styles.cardFooter}>
                <View style={styles.tagsContainer}>
                  {creator.niche.map((tag) => (
                    <View key={tag} style={styles.tagPill}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={[styles.bookmarkBtn, bookmarked[creator.id] && styles.bookmarkedActive]}
                    activeOpacity={0.8}
                    onPress={() => toggleBookmark(creator.id, creator.name)}
                  >
                    <Icon
                      name="bookmark"
                      size={16}
                      color={bookmarked[creator.id] ? Colors.cream : Colors.oxblood}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.inviteBtn}
                    activeOpacity={0.85}
                    onPress={() => handleOpenInvite(creator)}
                  >
                    <Text style={styles.inviteBtnText}>Invite {'->'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Invite Modal Bottom Sheet */}
      <BottomSheet
        visible={inviteOpen}
        title={`Invite ${selectedCreator?.name || 'Creator'}`}
        icon="send"
        onClose={() => setInviteOpen(false)}
      >
        <View style={styles.sheetBody}>
          {/* Creator Mini Card */}
          <View style={styles.sheetCreatorCard}>
            <PlaceholderImage tone={selectedCreator?.tone || 'rose'} height={40} width={40} borderRadius={20} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetCreatorName}>{selectedCreator?.name}</Text>
              <Text style={styles.sheetCreatorStats}>
                {selectedCreator?.followers} followers · {selectedCreator?.engagement} eng
              </Text>
            </View>
            <View style={styles.sheetCreatorRate}>
              <Text style={styles.sheetCreatorRateText}>Rate: {selectedCreator?.rate}/post</Text>
            </View>
          </View>

          {/* Campaign Selection list */}
          <Text style={styles.sheetSelectLabel}>SELECT CAMPAIGN</Text>
          <View style={styles.campaignSelectionGroup}>
            {['Summer Glow Serum', 'Heritage Chronograph', 'Glass-Skin Routine'].map((campaign) => {
              const isChecked = selectedCampaign === campaign;
              return (
                <TouchableOpacity
                  key={campaign}
                  style={[styles.campaignRow, isChecked && styles.campaignRowChecked]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCampaign(campaign)}
                >
                  <Text style={[styles.campaignRowText, isChecked && styles.campaignRowTextChecked]}>
                    {campaign}
                  </Text>
                  <View style={[styles.radioCircle, isChecked && styles.radioCircleChecked]}>
                    {isChecked && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action Row */}
          <View style={styles.sheetActions}>
            <TouchableOpacity
              style={styles.sheetBtnSecondary}
              activeOpacity={0.8}
              onPress={handleMessageCreator}
            >
              <Icon name="chat" size={16} color={Colors.oxblood} />
              <Text style={styles.sheetBtnTextSecondary}>Message first</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetBtnPrimary}
              activeOpacity={0.85}
              onPress={handleSendInvite}
            >
              <Text style={styles.sheetBtnTextPrimary}>Send invite {'->'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.07)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.oxbloodDeep,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  headerSubtitle: {
    fontFamily: FontFamily.sans,
    fontSize: 9.5,
    color: Colors.roseDeep,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    color: Colors.oxblood,
    fontWeight: '700',
    marginTop: -2,
  },
  inviteListBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.oxblood,
  },
  inviteListText: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.cream,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchBarRow: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    height: 48,
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    height: '100%',
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Colors.oxblood,
  },
  filterScroll: {
    marginBottom: 18,
    marginHorizontal: -20,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.1)',
  },
  sortBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.oxblood,
  },
  banner: {
    height: 86,
    borderRadius: Radius.xl,
    backgroundColor: Colors.oxbloodDeep,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 20,
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  bannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContent: {
    flex: 1,
    marginLeft: 14,
  },
  bannerSub: {
    fontFamily: FontFamily.sans,
    fontSize: 8,
    color: Colors.roseSoft,
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    color: Colors.cream,
    fontWeight: '700',
    marginTop: -2,
  },
  bannerDesc: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: 'rgba(232, 216, 204, 0.6)',
    marginTop: 2,
  },
  bannerArrow: {
    marginLeft: 10,
  },
  resultsText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.5)',
    marginBottom: 12,
  },
  creatorList: {
    gap: 14,
  },
  creatorCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardInfo: {
    flex: 1,
  },
  creatorName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  creatorHandle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: 'rgba(63, 3, 11, 0.45)',
    marginTop: 1,
  },
  rateInfo: {
    alignItems: 'flex-end',
  },
  rateVal: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  rateLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9.5,
    color: 'rgba(63, 3, 11, 0.45)',
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderRadius: Radius.md,
    paddingVertical: 10,
    marginTop: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14.5,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9.5,
    color: 'rgba(63, 3, 11, 0.45)',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  tagPill: {
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: Colors.oxblood,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  bookmarkBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(63, 3, 11, 0.14)',
  },
  bookmarkedActive: {
    backgroundColor: Colors.roseDeep,
    borderColor: Colors.roseDeep,
  },
  inviteBtn: {
    backgroundColor: Colors.oxblood,
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.cream,
  },
  sheetBody: {
    gap: 16,
    paddingTop: 8,
  },
  sheetCreatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: Radius.md,
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  sheetCreatorName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  sheetCreatorStats: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.45)',
    marginTop: 2,
  },
  sheetCreatorRate: {
    backgroundColor: 'rgba(42, 122, 90, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sheetCreatorRateText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Colors.green,
    fontWeight: '700',
  },
  sheetSelectLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 10.5,
    color: 'rgba(63, 3, 11, 0.5)',
    letterSpacing: 0.8,
    marginTop: 6,
  },
  campaignSelectionGroup: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  campaignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.06)',
  },
  campaignRowChecked: {
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
  },
  campaignRowText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: 'rgba(63, 3, 11, 0.7)',
  },
  campaignRowTextChecked: {
    color: Colors.oxblood,
    fontWeight: '700',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(63, 3, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleChecked: {
    borderColor: Colors.oxblood,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.oxblood,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  sheetBtnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.oxblood,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.creamLite,
  },
  sheetBtnTextSecondary: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    color: Colors.oxblood,
  },
  sheetBtnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.oxbloodDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBtnTextPrimary: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    color: Colors.cream,
  },
});
