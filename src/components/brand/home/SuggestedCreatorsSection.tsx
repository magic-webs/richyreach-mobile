import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

const MOCK_CREATORS = [
  { id: 'mira', name: 'Muskan', tone: 'rose' as const, followers: '184k', engagement: '6.2%', niche: 'Beauty' },
  { id: 'kai', name: 'Kai Rao', tone: 'ox' as const, followers: '96k', engagement: '7.8%', niche: 'Tech' },
  { id: 'lea', name: 'Léa Fontaine', tone: 'rose' as const, followers: '218k', engagement: '5.4%', niche: 'Fashion' }
];

export function SuggestedCreatorsSection() {
  const router = useRouter();

  const { data: rawCreatorsData, isLoading: loading } = useQuery<any>({
    queryKey: ['influencersList'],
    queryFn: () => api.influencers.list().catch(() => []),
  });

  const rawCreators = (rawCreatorsData ?? []) as any[];

  const creators = React.useMemo(() => {
    if (!Array.isArray(rawCreators) || rawCreators.length === 0) {
      return MOCK_CREATORS;
    }

    const mapped = rawCreators
      .map((c: any, idx: number) => {
        if (!c || typeof c !== 'object') return null;

        let fCount = c.followers ? Number(c.followers) : 0;
        let fStr = `${fCount}`;
        if (fCount >= 1000000) fStr = `${(fCount / 1000000).toFixed(1)}M`;
        else if (fCount >= 1000) fStr = `${(fCount / 1000).toFixed(0)}k`;

        // Prefer influencer profile id (ip_…), fall back to userId, then index
        const rawId = c.id || c._id || c.userId || `creator-${idx}`;

        return {
          id: rawId,
          name: c.name || c.instagramHandle || 'Creator',
          tone: (c.niche === 'Beauty' ? 'rose' : 'ox') as 'rose' | 'ox',
          followers: fStr,
          engagement: c.engagementRate ? `${Number(c.engagementRate).toFixed(1)}%` : '5.0%',
          niche: c.niche || 'Lifestyle',
        };
      })
      .filter((item): item is NonNullable<typeof item> => !!item);

    // Deduplicate: keep first occurrence of each id
    const seen = new Set<string>();
    return mapped.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    }).slice(0, 5);
  }, [rawCreators]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Suggested creators</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/marketplace')} activeOpacity={0.8}>
          <Text style={styles.browseAllText}>Browse all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestedScrollContent}
      >
        {loading && creators.length === 0 ? (
           MOCK_CREATORS.map((creator, idx) => (
             <View key={`mock-${creator.id}-${idx}`} style={[styles.creatorCard, { opacity: 0.5 }]}>
               <View style={styles.creatorAvatarWrap}>
                 <PlaceholderImage tone={creator.tone} height={60} width={60} borderRadius={30} />
               </View>
               <Text style={styles.creatorName}>{creator.name}</Text>
             </View>
           ))
        ) : (
          creators.map((creator: any, idx: number) => (
            <View key={`${creator.id}-${idx}`} style={styles.creatorCard}>
              <View style={styles.creatorAvatarWrap}>
                <PlaceholderImage tone={creator.tone} height={60} width={60} borderRadius={30} />
              </View>
              <Text style={styles.creatorName} numberOfLines={1}>{creator.name}</Text>
              <Text style={styles.creatorStats}>
                {creator.followers}  <Text style={styles.creatorEngText}>{creator.engagement}</Text>
              </Text>
              <View style={styles.nichePill}>
                <Text style={styles.nichePillText} numberOfLines={1}>{creator.niche}</Text>
              </View>
              <TouchableOpacity
                style={styles.inviteBtn}
                activeOpacity={0.85}
                onPress={() => router.push({
                  pathname: '/(tabs)/marketplace',
                  params: { inviteCreator: creator.name, followers: creator.followers, eng: creator.engagement, tone: creator.tone }
                })}
              >
                <Text style={styles.inviteBtnText}>Invite</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
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
  browseAllText: {
    fontFamily: FontFamily.sans,
    fontSize: 12.5,
    color: Colors.roseDeep,
  },
  suggestedScrollContent: {
    gap: 14,
    paddingRight: 20,
  },
  creatorCard: {
    width: 130,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 14,
    alignItems: 'center',
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  creatorAvatarWrap: {
    marginBottom: 8,
  },
  creatorName: {
    fontFamily: FontFamily.sans,
    fontSize: 13.5,
    color: Colors.oxblood,
    textAlign: 'center',
  },
  creatorStats: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10.5,
    color: 'rgba(63, 3, 11, 0.45)',
    marginTop: 2,
    textAlign: 'center',
  },
  creatorEngText: {
    color: Colors.green,
    fontWeight: '700',
  },
  nichePill: {
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 8,
  },
  nichePillText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9.5,
    color: Colors.oxblood,
  },
  inviteBtn: {
    backgroundColor: Colors.oxbloodDeep,
    borderRadius: Radius.full,
    width: '100%',
    paddingVertical: 7,
    alignItems: 'center',
    marginTop: 12,
  },
  inviteBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.cream,
  },
});
