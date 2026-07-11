import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { Colors, FontFamily, Radius, Shadow, Gradients } from '@/constants/brand';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import { Icon } from '@/components/ui/icon';
import { Image } from 'expo-image';

// Tell WebBrowser to handle redirects
WebBrowser.maybeCompleteAuthSession();

export function InstagramConnectionCard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showModal = useUIStore((s) => s.showModal);

  // 1. Fetch connected Instagram profile details
  const { data: igData, isLoading, refetch } = useQuery({
    queryKey: ['instagramProfile'],
    queryFn: () => api.social.instagram.getProfile().catch(() => null),
  });

  // 2. Refresh/Sync stats mutation
  const refreshMutation = useMutation({
    mutationFn: () => api.social.instagram.refresh(),
    onSuccess: () => {
      refetch();
      // Invalidate general influencer profile query to sync overall dashboard stats
      queryClient.invalidateQueries({ queryKey: ['influencerProfile'] });
      showModal({
        title: 'Sync Complete 🔄',
        message: 'Your Instagram statistics have been successfully updated.',
      });
    },
    onError: (err: any) => {
      showModal({
        title: 'Sync Failed',
        message: err.message || 'Could not refresh Instagram statistics. Try logging in again.',
      });
    },
  });

  // 3. Disconnect account mutation
  const disconnectMutation = useMutation({
    mutationFn: () => api.social.instagram.disconnect(),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['influencerProfile'] });
      showModal({
        title: 'Account Disconnected 🔌',
        message: 'Your Instagram account has been disconnected from RichyReach.',
      });
    },
    onError: (err: any) => {
      showModal({
        title: 'Disconnect Failed',
        message: err.message || 'Could not disconnect Instagram account.',
      });
    },
  });

  // 4. Initiate login flow and open WebBrowser
  const [isConnecting, setIsConnecting] = React.useState(false);
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { url } = await api.social.instagram.getLoginUrl();
      
      // Open WebBrowser OAuth session
      const result = await WebBrowser.openAuthSessionAsync(url, 'richyreachmobile://');
      
      if (result.type === 'success') {
        // Callback redirected back to app. Refresh queries.
        refetch();
        queryClient.invalidateQueries({ queryKey: ['influencerProfile'] });
      }
    } catch (err: any) {
      console.error('[Instagram Connection Request Failed]', err);
      showModal({
        title: 'Connection Failed',
        message: err.message || 'Could not start Instagram connection flow.',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectConfirm = () => {
    Alert.alert(
      'Disconnect Instagram',
      'Are you sure you want to disconnect your Instagram Business account? You will lose connected reach verification stats for brand campaigns.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => disconnectMutation.mutate(),
        },
      ]
    );
  };

  // Helper to format counts cleanly (e.g. 15400 -> 15.4K)
  const formatCount = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="small" color={Colors.oxblood} />
      </View>
    );
  }

  const isConnected = igData?.connected && igData?.username;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.logoAndTitle}>
          <LinearGradient
            colors={Gradients.instagram as any}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.iconBackground}
          >
            <Icon name="instagram" size={20} color={Colors.white} />
          </LinearGradient>
          <View>
            <Text style={styles.title}>Instagram Business</Text>
            {isConnected ? (
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: Colors.green }]} />
                <Text style={styles.statusText}>Connected</Text>
              </View>
            ) : (
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: Colors.rose }]} />
                <Text style={styles.statusText}>Not Connected</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {isConnected ? (
        <View style={styles.connectedContent}>
          {/* User profile identifier */}
          <View style={styles.userInfoRow}>
            <Image
              source={{ uri: igData.profilePicture || 'https://api.dicebear.com/7.x/adventurer/svg?seed=instagram' }}
              style={styles.profilePic}
              contentFit="cover"
            />
            <Text style={styles.username}>@{igData.username}</Text>
          </View>

          {/* Followers / Following / Posts Counts */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{formatCount(igData.followers || 0)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={[styles.statCol, styles.borderCol]}>
              <Text style={styles.statVal}>{formatCount(igData.following || 0)}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{formatCount(igData.mediaCount || 0)}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
          </View>

          <Text style={styles.syncedText}>
            Last synced: {formatDate(igData.lastSyncedAt)}
          </Text>

          {/* View Analytics & Posts Action */}
          <TouchableOpacity
            onPress={() => router.push('/profile/instagram-analytics')}
            style={styles.analyticsBtn}
            activeOpacity={0.8}
          >
            <Icon name="chart" size={16} color={Colors.white} />
            <Text style={styles.analyticsBtnText}>View Analytics & Posts</Text>
          </TouchableOpacity>

          {/* Sync & Disconnect actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              style={styles.syncBtn}
              activeOpacity={0.8}
            >
              {refreshMutation.isPending ? (
                <ActivityIndicator size="small" color={Colors.oxblood} />
              ) : (
                <>
                  <Icon name="clock" size={14} color={Colors.oxblood} />
                  <Text style={styles.syncBtnText}>Sync Profile</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDisconnectConfirm}
              disabled={disconnectMutation.isPending}
              style={styles.disconnectBtn}
              activeOpacity={0.8}
            >
              <Icon name="trash" size={14} color="#FF3B30" />
              <Text style={styles.disconnectBtnText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.disconnectedContent}>
          <Text style={styles.infoText}>
            Connect your Instagram Creator or Business account to verify your follower counts and unlock premium brand collaboration offers.
          </Text>
          <TouchableOpacity
            onPress={handleConnect}
            disabled={isConnecting}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={Gradients.instagram as any}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.connectBtn}
            >
              {isConnecting ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Icon name="instagram" size={18} color={Colors.white} />
                  <Text style={styles.connectBtnText}>Connect Instagram</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 16,
    marginTop: 10,
    ...Shadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBackground: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
  },
  statusText: {
    fontSize: 11,
    color: 'rgba(63,3,11,0.5)',
    fontWeight: '600',
  },
  disconnectedContent: {
    marginTop: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(42,2,7,0.6)',
  },
  connectBtn: {
    height: 44,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  connectBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  connectedContent: {
    marginTop: 16,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(63,3,11,0.03)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  profilePic: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  username: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  borderCol: {
    borderLeftWidth: 0.5,
    borderLeftColor: 'rgba(63,3,11,0.1)',
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(63,3,11,0.1)',
  },
  statVal: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(63,3,11,0.5)',
    marginTop: 2,
  },
  syncedText: {
    fontSize: 10.5,
    color: 'rgba(63,3,11,0.4)',
    textAlign: 'center',
    marginTop: 14,
  },
  analyticsBtn: {
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.oxblood,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  analyticsBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  syncBtn: {
    flex: 1.3,
    height: 38,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  syncBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.oxblood,
  },
  disconnectBtn: {
    flex: 1,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,59,48,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  disconnectBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
