import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { Image } from 'expo-image';
import { api } from '@/lib/api';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

interface SuggestedCreatorsSectionProps {
  onInviteCreator?: (creator: any) => void;
}

function CreatorCardSkeleton() {
  return (
    <View style={styles.creatorCard}>
      <View style={styles.creatorAvatarWrap}>
        <Skeleton variant="circle" width={60} height={60} />
      </View>
      <Skeleton variant="text" width={70} style={{ marginTop: 4 }} />
      <Skeleton variant="text" width={55} style={{ marginTop: 6 }} />
      <Skeleton variant="rect" width={50} height={18} borderRadius={6} style={{ marginTop: 8 }} />
      <Skeleton variant="rect" width="100%" height={28} borderRadius={99} style={{ marginTop: 12 }} />
    </View>
  );
}

export function SuggestedCreatorsSection({ onInviteCreator }: SuggestedCreatorsSectionProps) {
  const router = useRouter();

  const { data: rawCreatorsData, isLoading: loading } = useQuery<any>({
    queryKey: ['influencersList'],
    queryFn: () => api.influencers.list().catch(() => []),
  });

  const rawCreators = (rawCreatorsData ?? []) as any[];

  const creators = React.useMemo(() => {
    if (!Array.isArray(rawCreators) || rawCreators.length === 0) {
      return [];
    }

    const mapped = rawCreators
      .map((c: any, idx: number) => {
        if (!c || typeof c !== 'object') return null;

        let fCount = c.followers ? Number(c.followers) : 0;
        let fStr = `${fCount}`;
        if (fCount >= 1000000) fStr = `${(fCount / 1000000).toFixed(1)}M`;
        else if (fCount >= 1000) fStr = `${(fCount / 1000).toFixed(0)}k`;

        const rawId = c.id || c._id || c.userId || `creator-${idx}`;

        return {
          id: rawId,
          name: c.name || (c.instagramHandle ? `@${c.instagramHandle}` : 'Creator'),
          instagramHandle: c.instagramHandle ? `@${c.instagramHandle}` : '@creator',
          avatar: c.avatar || null,
          tone: (c.niche === 'Beauty' ? 'rose' : 'ox') as 'rose' | 'ox',
          followers: fStr,
          engagement: c.engagementRate ? `${Number(c.engagementRate).toFixed(1)}%` : '5.0%',
          niche: c.niche || 'Lifestyle',
        };
      })
      .filter((item): item is NonNullable<typeof item> => !!item);

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
        {loading ? (
          <>
            <CreatorCardSkeleton />
            <CreatorCardSkeleton />
            <CreatorCardSkeleton />
          </>
        ) : (
          creators.map((creator: any, idx: number) => (
            <View key={`${creator.id}-${idx}`} style={styles.creatorCard}>
              <View style={styles.creatorAvatarWrap}>
                <Image
                  source={{ uri: creator.avatar || 'https://pub-c7a89526fe7541b0a1d6bc2d831710d2.r2.dev/plaform-images/avatar.png' }}
                  style={{ width: 60, height: 60, borderRadius: 30 }}
                  contentFit="cover"
                />
              </View>
              <Text style={styles.creatorName} numberOfLines={1}>{creator.name}</Text>
              <Text style={styles.creatorHandle} numberOfLines={1}>{creator.instagramHandle}</Text>
              <Text style={styles.creatorStats}>
                {creator.followers}  <Text style={styles.creatorEngText}>{creator.engagement}</Text>
              </Text>
              <View style={styles.nichePill}>
                <Text style={styles.nichePillText} numberOfLines={1}>{creator.niche}</Text>
              </View>
              <TouchableOpacity
                style={styles.inviteBtn}
                activeOpacity={0.85}
                onPress={() => onInviteCreator?.(creator)}
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
    paddingBottom: 20
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
  creatorHandle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: Colors.roseDeep,
    textAlign: 'center',
    marginTop: 1,
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
