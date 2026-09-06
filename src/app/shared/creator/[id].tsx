import { TactileButton } from '@/components/ui/tactile-button';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { BadgeCheckIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Public, no-auth creator page behind a share link
 * (https://app.richyreach.com/shared/creator/[id]).
 *
 * Only the profile id travels in the link; everything shown is fetched from the public
 * endpoint (GET /influencers/public/:id), which returns an allow-listed projection rather
 * than the profile row.
 */
export default function SharedCreatorProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isLoggedIn = !!useAuthStore((s) => s.session);

  const { data: creator, isLoading, isError } = useQuery({
    queryKey: ['public-creator', id],
    queryFn: () => api.influencers.getPublic(id!),
    enabled: !!id,
    retry: false,
  });

  const compact = (n: number) =>
    n >= 1e7
      ? `${(n / 1e7).toFixed(1)}Cr`
      : n >= 1e5
        ? `${(n / 1e5).toFixed(1)}L`
        : n >= 1e3
          ? `${(n / 1e3).toFixed(1)}K`
          : String(n);

  if (isLoading) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.oxblood} />
      </View>
    );
  }

  if (isError || !creator) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top, paddingHorizontal: 40 }]}>
        <Text style={styles.errorTitle}>Creator not found</Text>
        <Text style={styles.errorText}>
          This profile may have been removed, or the link is no longer valid.
        </Text>
        <TactileButton
          text="Open RichyReach"
          variant="primary"
          onPress={() => router.replace(isLoggedIn ? '/(tabs)' : '/(auth)')}
          style={{ marginTop: 18 }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <ArrowLeft size={22} color={Colors.oxblood} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Creator</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <Image
            source={{
              uri:
                creator.avatar ||
                'https://pub-c7a89526fe7541b0a1d6bc2d831710d2.r2.dev/plaform-images/avatar.png',
            }}
            style={styles.avatar}
            contentFit="cover"
          />

          <View style={styles.nameRow}>
            <Text style={styles.name}>{creator.name}</Text>
            {creator.verified && (
              <HugeiconsIcon icon={BadgeCheckIcon} size={18} strokeWidth={2} color={Colors.gold} />
            )}
          </View>

          {creator.instagramHandle && (
            <Text style={styles.handle}>@{creator.instagramHandle}</Text>
          )}
          {creator.bio ? <Text style={styles.bio}>{creator.bio}</Text> : null}

          <View style={styles.statsRow}>
            <Stat value={compact(creator.followers)} label="Followers" />
            <Stat value={`${creator.engagementRate.toFixed(1)}%`} label="Engagement" last={!creator.niche} />
            {creator.niche ? <Stat value={creator.niche} label="Niche" last /> : null}
          </View>
        </View>

        {creator.services.length > 0 && (
          <View style={{ gap: 12 }}>
            <Text style={styles.sectionTitle}>Services</Text>
            {creator.services.map((s) => (
              <View key={s.id} style={styles.serviceRow}>
                {s.thumbnailUrl ? (
                  <Image source={{ uri: s.thumbnailUrl }} style={styles.serviceThumb} contentFit="cover" />
                ) : (
                  <View style={[styles.serviceThumb, styles.serviceThumbEmpty]} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceName} numberOfLines={2}>
                    {s.name}
                  </Text>
                  {s.deliveryTime ? (
                    <Text style={styles.serviceMeta}>{s.deliveryTime}</Text>
                  ) : null}
                </View>
                <Text style={styles.servicePrice}>
                  ₹{(s.price / 100).toLocaleString('en-IN')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* The share link is the acquisition surface, so the call to action differs by state. */}
        <TactileButton
          text={isLoggedIn ? 'Open in RichyReach' : 'Join RichyReach to collaborate'}
          icon="arrow"
          iconPosition="right"
          variant="primary"
          fullWidth
          onPress={() => router.replace(isLoggedIn ? '/(tabs)/marketplace' : '/(auth)')}
        />
      </ScrollView>
    </View>
  );
}

function Stat({ value, label, last }: { value: string; label: string; last?: boolean }) {
  return (
    <View style={[styles.statItem, !last && styles.statBorder]}>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  center: { alignItems: 'center', justifyContent: 'center', gap: 6 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 14 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(63,3,11,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: FontFamily.sansMedium, fontSize: 18, fontWeight: '700', color: Colors.ink },

  body: { paddingHorizontal: 18, paddingBottom: 60, gap: 20 },

  card: { backgroundColor: '#fff', borderRadius: Radius.xxl, padding: 22, alignItems: 'center', ...Shadow.card },
  avatar: { width: 88, height: 88, borderRadius: 999 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 },
  name: { fontFamily: FontFamily.serif, fontSize: 23, color: Colors.ink },
  handle: { fontSize: 13, color: Colors.rose, fontWeight: '700', marginTop: 3 },
  bio: { fontSize: 13, color: 'rgba(63,3,11,0.6)', textAlign: 'center', lineHeight: 19, marginTop: 10 },

  statsRow: { flexDirection: 'row', marginTop: 20, alignSelf: 'stretch' },
  statItem: { flex: 1, alignItems: 'center', gap: 3, paddingHorizontal: 4 },
  statBorder: { borderRightWidth: 1, borderRightColor: 'rgba(63,3,11,0.08)' },
  statValue: { fontFamily: FontFamily.sansMedium, fontSize: 16, fontWeight: '700', color: Colors.oxblood },
  statLabel: { fontSize: 10.5, color: 'rgba(63,3,11,0.5)', fontWeight: '600' },

  sectionTitle: { fontFamily: FontFamily.sansMedium, fontSize: 17, fontWeight: '700', color: Colors.ink },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 12,
    ...Shadow.card,
  },
  serviceThumb: { width: 52, height: 52, borderRadius: 13 },
  serviceThumbEmpty: { backgroundColor: 'rgba(180,106,116,0.15)' },
  serviceName: { fontSize: 13.5, fontWeight: '700', color: Colors.ink },
  serviceMeta: { fontSize: 11, color: 'rgba(63,3,11,0.45)', marginTop: 3 },
  servicePrice: { fontFamily: FontFamily.sansMedium, fontSize: 14, fontWeight: '800', color: Colors.oxblood },

  errorTitle: { fontFamily: FontFamily.sansMedium, fontSize: 17, fontWeight: '700', color: Colors.ink },
  errorText: { fontSize: 12.5, color: 'rgba(63,3,11,0.5)', textAlign: 'center', lineHeight: 18 },
});
