import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily } from '@/constants/brand';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

interface NotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

function getRelativeTime(dateStr: string) {
  if (!dateStr) return 'now';
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs) || diffMs < 0) return 'now';
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d`;
  } catch {
    return 'now';
  }
}

function EmptyStateIllustration() {
  return (
    <View style={styles.emptyWrap}>
      <Svg width={180} height={180} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="circleGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="rgba(180, 106, 116, 0.14)" />
            <Stop offset="100%" stopColor="rgba(63, 3, 11, 0.02)" />
          </LinearGradient>
        </Defs>
        <Circle cx="100" cy="100" r="70" fill="url(#circleGrad)" />
        
        {/* Bell group, rotated slightly to look sleeping/relaxed */}
        <G transform="rotate(-15 100 95)">
          {/* Bell loop */}
          <Path 
            d="M100 45 C100 38.5, 96.5 35, 90 35 C83.5 35, 80 38.5, 80 45" 
            fill="none" 
            stroke={Colors.oxblood} 
            strokeWidth={2} 
            strokeLinecap="round"
          />
          {/* Bell body */}
          <Path 
            d="M100 45 C115 45, 128 55, 128 75 L128 110 C128 116, 131 122, 136 126 C139 129, 137 134, 132 134 L68 134 C63 134, 61 129, 64 126 C69 122, 72 116, 72 110 L72 75 C72 55, 85 45, 100 45 Z" 
            fill="rgba(63, 3, 11, 0.08)" 
            stroke={Colors.oxblood} 
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Bell clapper */}
          <Path 
            d="M112 134 C112 140.6, 106.6 146, 100 146 C93.4 146, 88 140.6, 88 134" 
            fill="none" 
            stroke={Colors.oxblood} 
            strokeWidth={2} 
            strokeLinecap="round"
          />
        </G>

        {/* Sparkles / Stars */}
        <Path d="M145 50 L147 54 L152 56 L147 58 L145 62 L143 58 L138 56 L143 54 Z" fill="rgba(180, 106, 116, 0.4)" />
        <Path d="M55 85 L56 88 L59 89 L56 90 L55 93 L54 90 L51 89 L54 88 Z" fill="rgba(180, 106, 116, 0.3)" />
        
        {/* Floating Zzz symbols */}
        <Path d="M145 80 L153 80 L145 88 L153 88" stroke={Colors.rose} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.65} />
        <Path d="M158 68 L164 68 L158 74 L164 74" stroke={Colors.rose} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.4} />
      </Svg>
      <Text style={styles.emptyTitle}>All quiet for now</Text>
      <Text style={styles.emptyText}>We will notify you about updates, invites, and payout actions here.</Text>
    </View>
  );
}

export function NotificationsSheet({ isOpen, onClose }: NotificationsSheetProps) {
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<any[]>({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.list().catch(() => []),
    enabled: isOpen && !!session?.user?.id,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.notifications.read(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.notifications.read(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const hasUnread = notifications.some((n: any) => !n.read);

  if (!isOpen) return null;

  return (
    <BottomSheet visible={isOpen} title="Notifications" icon="bell" onClose={onClose} snapPoints={['65%', '90%']}>
      {isLoading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.oxblood} />
        </View>
      ) : notifications.length === 0 ? (
        <EmptyStateIllustration />
      ) : (
        <View style={{ gap: 14 }}>
          {hasUnread && (
            <TouchableOpacity
              style={styles.markAllBtn}
              onPress={() => markAllReadMutation.mutate()}
              activeOpacity={0.8}
              disabled={markAllReadMutation.isPending}
            >
              <Icon name="check" size={14} color={Colors.rose} />
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          )}

          <View style={styles.listContainer}>
            {notifications.map((n: any) => (
              <TouchableOpacity
                key={n.id}
                style={[styles.notificationCard, !n.read && styles.notificationUnread]}
                onPress={() => !n.read && markReadMutation.mutate(n.id)}
                activeOpacity={0.8}
                disabled={n.read || markReadMutation.isPending}
              >
                <View style={[styles.bellIndicator, !n.read && styles.bellIndicatorUnread]}>
                  <Icon name={n.read ? 'bell' : 'star'} size={15} color={n.read ? 'rgba(63,3,11,0.4)' : Colors.rose} />
                  {!n.read && <View style={styles.unreadDot} />}
                </View>
                
                <View style={styles.contentWrap}>
                  <Text style={[styles.notiTitle, !n.read && styles.notiTitleUnread]}>{n.title}</Text>
                  <Text style={styles.notiMessage}>{n.message}</Text>
                  <Text style={styles.notiTime}>{getRelativeTime(n.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  loaderWrap: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: FontFamily.serif,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
    marginTop: 12,
  },
  emptyText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(63, 3, 11, 0.5)',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingVertical: 4,
    marginRight: 2,
  },
  markAllText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.rose,
  },
  listContainer: {
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.05)',
  },
  notificationUnread: {
    borderColor: 'rgba(180, 106, 116, 0.15)',
    backgroundColor: 'rgba(180, 106, 116, 0.02)',
  },
  bellIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(63, 3, 11, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellIndicatorUnread: {
    backgroundColor: 'rgba(180, 106, 116, 0.08)',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.rose,
    borderWidth: 1,
    borderColor: '#fff',
  },
  contentWrap: {
    flex: 1,
    gap: 3,
  },
  notiTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    color: 'rgba(63, 3, 11, 0.6)',
  },
  notiTitleUnread: {
    fontFamily: FontFamily.sansMedium,
    color: Colors.ink,
    fontWeight: '700',
  },
  notiMessage: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: Colors.ink,
    lineHeight: 18,
  },
  notiTime: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10.5,
    color: 'rgba(63, 3, 11, 0.4)',
    marginTop: 2,
  },
});
