import { ArrowLeft, BarChart2, CornerUpLeft } from 'lucide-react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import type { AutomationLog } from '@/types/instagram-automation';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Filter = 'all' | 'sent' | 'skipped' | 'failed';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Everything' },
  { key: 'sent', label: 'Sent' },
  { key: 'skipped', label: 'Skipped' },
  { key: 'failed', label: 'Failed' },
];

const STATUS_STYLE: Record<AutomationLog['status'], { bg: string; fg: string; label: string }> = {
  sent: { bg: 'rgba(42,122,90,0.12)', fg: '#2a7a5a', label: 'Sent' },
  skipped: { bg: 'rgba(63,3,11,0.07)', fg: 'rgba(63,3,11,0.5)', label: 'Skipped' },
  failed: { bg: 'rgba(163,50,63,0.1)', fg: '#a3323f', label: 'Failed' },
};

const CHANNEL_LABEL: Record<AutomationLog['channel'], string> = {
  public_comment: 'Public reply',
  private_dm: 'Private reply',
  dm: 'Direct message',
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff) || diff < 0) return 'just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days < 30 ? `${days}d ago` : new Date(iso).toLocaleDateString('en-IN');
}

export default function AutomationActivityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const logsQuery = useQuery({
    queryKey: ['igAutomationLogs'],
    queryFn: () => api.social.instagramAutomation.getLogs(100, 0),
    retry: false,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await logsQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const logs = logsQuery.data ?? [];
  const visible = filter === 'all' ? logs : logs.filter((l) => l.status === filter);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <ArrowLeft size={22} color={Colors.oxblood} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerEye}>Automation</Text>
          <Text style={styles.headerTitle}>Activity</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const n = f.key === 'all' ? logs.length : logs.filter((l) => l.status === f.key).length;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              activeOpacity={0.8}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
                {n > 0 ? ` ${n}` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.oxblood} />
        }
      >
        {logsQuery.isLoading ? (
          Array.from({ length: 5 }).map((_, k) => (
            <Skeleton key={k} width="100%" height={96} borderRadius={18} />
          ))
        ) : logsQuery.isError ? (
          <Empty
            title="Could not load activity"
            text="Check your connection and pull down to try again."
          />
        ) : visible.length === 0 ? (
          <Empty
            title={filter === 'all' ? 'Nothing yet' : `No ${filter} events`}
            text={
              filter === 'all'
                ? 'Once your rules start firing, every reply and every skip shows up here with the reason.'
                : 'Try a different filter.'
            }
          />
        ) : (
          visible.map((log) => {
            const status = STATUS_STYLE[log.status];
            return (
              <View key={log.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.fg }]}>{status.label}</Text>
                  </View>
                  <Text style={styles.channel}>{CHANNEL_LABEL[log.channel]}</Text>
                  {log.aiGenerated && (
                    <View style={styles.aiPill}>
                      <Text style={styles.aiPillText}>AI</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }} />
                  <Text style={styles.time}>{relativeTime(log.createdAt)}</Text>
                </View>

                {log.automationName && <Text style={styles.ruleName}>{log.automationName}</Text>}

                {log.incomingText ? (
                  <View style={styles.quoteRow}>
                    <View style={styles.quoteBar} />
                    <Text style={styles.incoming} numberOfLines={3}>
                      {log.senderUsername ? `@${log.senderUsername}: ` : ''}
                      {log.incomingText}
                    </Text>
                  </View>
                ) : null}

                {log.responseText ? (
                  <View style={styles.responseRow}>
                    <CornerUpLeft size={13} color={Colors.rose} />
                    <Text style={styles.response} numberOfLines={4}>
                      {log.responseText}
                    </Text>
                  </View>
                ) : null}

                {/* The reason is the whole point of logging a skip or a failure. */}
                {log.reason ? (
                  <Text style={[styles.reason, log.status === 'failed' && { color: '#a3323f' }]}>
                    {log.reason}
                  </Text>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <BarChart2 size={26} color={Colors.rose} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 14 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(63,3,11,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEye: { fontSize: 11, fontWeight: '700', color: Colors.rose, textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontFamily: FontFamily.sansMedium, fontSize: 20, fontWeight: '700', color: Colors.ink, marginTop: 1 },

  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingBottom: 12 },
  filterChip: { borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#fff' },
  filterChipActive: { backgroundColor: Colors.oxblood },
  filterText: { fontSize: 11.5, fontWeight: '700', color: 'rgba(63,3,11,0.55)' },
  filterTextActive: { color: Colors.cream },

  body: { paddingHorizontal: 18, paddingBottom: 130, gap: 12 },

  card: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: 15, ...Shadow.card },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusPill: { borderRadius: 99, paddingHorizontal: 9, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  channel: { fontSize: 10.5, fontWeight: '700', color: 'rgba(63,3,11,0.4)' },
  aiPill: { backgroundColor: 'rgba(42,122,90,0.12)', borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 },
  aiPillText: { fontSize: 9.5, fontWeight: '800', color: Colors.green, letterSpacing: 0.5 },
  time: { fontSize: 10.5, color: 'rgba(63,3,11,0.35)', fontWeight: '600' },

  ruleName: { fontSize: 13, fontWeight: '700', color: Colors.ink, marginTop: 9 },

  quoteRow: { flexDirection: 'row', gap: 9, marginTop: 9 },
  quoteBar: { width: 2.5, borderRadius: 99, backgroundColor: 'rgba(63,3,11,0.12)' },
  incoming: { flex: 1, fontSize: 12, color: 'rgba(63,3,11,0.6)', lineHeight: 17 },

  responseRow: { flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'flex-start' },
  response: { flex: 1, fontSize: 12.5, color: Colors.ink, lineHeight: 18 },

  reason: { fontSize: 11, color: 'rgba(63,3,11,0.42)', marginTop: 9, fontStyle: 'italic' },

  empty: { alignItems: 'center', gap: 6, paddingVertical: 70, paddingHorizontal: 30 },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(180,106,116,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: { fontFamily: FontFamily.sansMedium, fontSize: 16, fontWeight: '700', color: Colors.ink },
  emptyText: { fontSize: 12.5, color: 'rgba(63,3,11,0.5)', textAlign: 'center', lineHeight: 18 },
});
