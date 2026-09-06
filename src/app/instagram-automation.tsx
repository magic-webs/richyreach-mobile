import {
  ArrowLeft,
  BarChart2,
  Check,
  ChevronRight,
  Eye,
  Sparkles,
  TriangleAlert,
  X,
  Zap,
} from 'lucide-react-native';
import { Instagram } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { TactileButton } from '@/components/ui/tactile-button';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import {
  AUTOMATION_META,
  MATCH_TYPE_LABELS,
  type Automation,
  type AutomationType,
  type IconComponent,
} from '@/types/instagram-automation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ORDER: AutomationType[] = ['comment_reply', 'comment_dm', 'dm_reply', 'welcome_dm'];

/** One-line summary of what makes a rule fire, shown on its card. */
function triggerSummary(a: Automation) {
  if (a.type === 'welcome_dm') return 'Fires on a first-time message';
  if (a.matchType === 'any') return 'Fires on every message';
  const shown = a.keywords.slice(0, 3).join(', ');
  const extra = a.keywords.length > 3 ? ` +${a.keywords.length - 3}` : '';
  return `${MATCH_TYPE_LABELS[a.matchType]}: ${shown}${extra}`;
}

export default function AutomationHubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Authoritative connection check. The automation endpoints can fail for reasons that
  // have nothing to do with Instagram (a pending migration, for one), so connection state
  // is read from the same endpoint the Instagram tab uses rather than inferred from an error.
  const connectionQuery = useQuery({
    queryKey: ['instagramProfile'],
    queryFn: () => api.social.instagram.getProfile(),
    retry: false,
  });
  const isConnected = connectionQuery.data?.connected === true;

  const settingsQuery = useQuery({
    queryKey: ['igAutomationSettings'],
    queryFn: () => api.social.instagramAutomation.getSettings(),
    enabled: isConnected,
    retry: false,
  });

  const statsQuery = useQuery({
    queryKey: ['igAutomationStats'],
    queryFn: () => api.social.instagramAutomation.getStats(),
    enabled: isConnected && !settingsQuery.isError,
    retry: false,
  });

  const listQuery = useQuery({
    queryKey: ['igAutomations'],
    queryFn: () => api.social.instagramAutomation.list(),
    enabled: isConnected && !settingsQuery.isError,
    retry: false,
  });

  const masterMutation = useMutation({
    mutationFn: (enabled: boolean) => api.social.instagramAutomation.updateSettings({ masterEnabled: enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['igAutomationSettings'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      api.social.instagramAutomation.toggle(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['igAutomations'] });
      queryClient.invalidateQueries({ queryKey: ['igAutomationStats'] });
    },
  });

  // Why nothing is firing. Every condition below has to hold before a rule can run, so
  // this is checked and shown rather than left for someone to infer from silence.
  const diagnosticsQuery = useQuery({
    queryKey: ['igAutomationDiagnostics'],
    queryFn: () => api.social.instagramAutomation.getDiagnostics(),
    enabled: isConnected,
    retry: false,
  });

  const subscribeMutation = useMutation({
    mutationFn: () => api.social.instagramAutomation.subscribe(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['igAutomationDiagnostics'] }),
  });

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        connectionQuery.refetch(),
        settingsQuery.refetch(),
        statsQuery.refetch(),
        listQuery.refetch(),
        diagnosticsQuery.refetch(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const settings = settingsQuery.data;
  const automations = listQuery.data ?? [];
  const masterOn = settings?.masterEnabled ?? false;
  const diag = diagnosticsQuery.data;
  const allReady = Boolean(
    diag &&
      diag.subscribedToComments &&
      diag.subscribedToMessages &&
      diag.verifyTokenConfigured &&
      diag.appSecretConfigured &&
      !diag.tokenExpired &&
      diag.masterEnabled &&
      diag.enabledAutomations > 0
  );

  // Genuinely not connected: the only case that should send someone to the Instagram tab.
  if (connectionQuery.isSuccess && !isConnected) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Header onBack={() => router.back()} />
        <View style={styles.notConnected}>
          <View style={styles.notConnectedIcon}>
            <HugeiconsIcon icon={Instagram} size={30} color={Colors.rose} strokeWidth={2} />
          </View>
          <Text style={styles.notConnectedTitle}>Connect Instagram first</Text>
          <Text style={styles.notConnectedText}>
            Automation replies from your own Instagram professional account, so it needs to be
            connected before you can set up any rules.
          </Text>
          <TactileButton
            text="Go to Instagram tab"
            icon="arrow"
            iconPosition="right"
            variant="primary"
            onPress={() => router.replace('/(tabs)/profile?tab=instagram')}
            style={{ marginTop: 18 }}
          />
        </View>
      </View>
    );
  }

  // Connected, but something else went wrong. Showing the real message beats claiming
  // the account is disconnected when it plainly is not.
  const loadError = connectionQuery.error ?? settingsQuery.error;
  if (loadError) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Header onBack={() => router.back()} />
        <View style={styles.notConnected}>
          <View style={styles.notConnectedIcon}>
            <Zap size={28} color="#a3323f" />
          </View>
          <Text style={styles.notConnectedTitle}>Could not load automation</Text>
          <Text style={styles.notConnectedText}>
            {(loadError as Error)?.message || 'Something went wrong. Please try again.'}
          </Text>
          <TactileButton
            text="Try again"
            variant="primary"
            onPress={() => {
              connectionQuery.refetch();
              settingsQuery.refetch();
            }}
            style={{ marginTop: 18 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Header onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.oxblood} />
        }
      >
        {/* Master switch */}
        <LinearGradient
          colors={masterOn ? ['#5a1018', '#3f030b', '#2a0207'] : ['#cdbcae', '#bda99a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.masterCard}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.masterEyebrow}>{masterOn ? 'Running' : 'Paused'}</Text>
            <Text style={styles.masterTitle}>Automation</Text>
            <Text style={styles.masterSub}>
              {settings?.username ? `@${settings.username}` : 'Your account'}
              {masterOn ? ' is replying automatically' : ' is not replying right now'}
            </Text>
          </View>
          <Switch
            value={masterOn}
            onValueChange={(v) => masterMutation.mutate(v)}
            disabled={masterMutation.isPending || settingsQuery.isLoading}
            trackColor={{ false: 'rgba(63,3,11,0.25)', true: Colors.rose }}
            thumbColor={Colors.creamLite}
          />
        </LinearGradient>

        {/* Delivery checklist. Shown whenever something is missing, or when nothing has
            ever arrived from Meta -- two states that look identical from the outside. */}
        {diag && (!allReady || diag.lastWebhookAt === null) && (
          <View style={styles.diagCard}>
            <View style={styles.diagHead}>
              <TriangleAlert size={16} color="#8a5a12" />
              <Text style={styles.diagTitle}>
                {allReady ? 'Waiting for the first event' : 'Automation cannot run yet'}
              </Text>
            </View>

            <View style={{ gap: 9, marginTop: 12 }}>
              <DiagRow ok={diag.subscribedToComments} label="Subscribed to comment events" />
              <DiagRow ok={diag.subscribedToMessages} label="Subscribed to message events" />
              <DiagRow ok={diag.verifyTokenConfigured} label="Verify token set on the server" />
              <DiagRow ok={diag.appSecretConfigured} label="App secret set on the server" />
              <DiagRow ok={!diag.tokenExpired} label="Instagram access token valid" />
              <DiagRow ok={diag.masterEnabled} label="Automation switched on" />
              <DiagRow ok={diag.enabledAutomations > 0} label="At least one active rule" />
              <DiagRow
                ok={diag.lastWebhookAt !== null}
                label={
                  diag.lastWebhookAt
                    ? 'Events are arriving from Instagram'
                    : 'No events received from Instagram yet'
                }
              />
            </View>

            {diag.subscriptionError && (
              <Text style={styles.diagError}>{diag.subscriptionError}</Text>
            )}

            {(!diag.subscribedToComments || !diag.subscribedToMessages) && (
              <>
                <Text style={styles.diagHint}>
                  This account is connected but not subscribed to the app webhooks, so
                  Instagram has nowhere to send its events. This fixes it.
                </Text>
                <TactileButton
                  text="Subscribe this account"
                  variant="primary"
                  size="sm"
                  loading={subscribeMutation.isPending}
                  onPress={() => subscribeMutation.mutate()}
                  style={{ marginTop: 12 }}
                />
                {subscribeMutation.isError && (
                  <Text style={styles.diagError}>
                    {(subscribeMutation.error as Error)?.message}
                  </Text>
                )}
              </>
            )}

            {allReady && diag.lastWebhookAt === null && (
              <Text style={styles.diagHint}>
                Everything is set up. Instagram only delivers once the Meta app is in
                published state, and DM events additionally need Connected tools enabled in
                the Instagram app: Settings, Messages and story replies, Connected tools,
                Allow access to messages.
              </Text>
            )}
          </View>
        )}
        {settings && !settings.aiAvailable && automations.some((a) => a.aiFallbackEnabled) && (
          <Notice
            tone="warn"
            title="AI fallback unavailable"
            text="Some rules use the AI fallback, but the server has no OpenAI key configured. Those rules will skip instead of replying."
          />
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <Stat label="Sent, 7 days" value={statsQuery.data?.sentLast7Days} loading={statsQuery.isLoading} />
          <Stat label="Active rules" value={statsQuery.data?.activeAutomations} loading={statsQuery.isLoading} />
          <Stat label="People reached" value={statsQuery.data?.peopleReached} loading={statsQuery.isLoading} last />
        </View>

        {/* Shortcuts */}
        <View style={styles.shortcutRow}>
          <Shortcut
            icon={BarChart2}
            label="Activity"
            sub={`${statsQuery.data?.totalSent ?? 0} sent`}
            onPress={() => router.push('/instagram-automation/activity')}
          />
          <Shortcut
            icon={Sparkles}
            label="Ice breakers"
            sub={`${settings?.iceBreakers?.length ?? 0} of 4`}
            onPress={() => router.push('/instagram-automation/ice-breakers')}
          />
        </View>

        {/* Rules */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your rules</Text>
          <TactileButton
            text="New rule"
            icon="plus"
            variant="primary"
            size="sm"
            borderRadius={99}
            onPress={() =>
              router.push({ pathname: '/instagram-automation/[id]', params: { id: 'new' } })
            }
          />
        </View>

        {listQuery.isLoading ? (
          <View style={{ gap: 12 }}>
            <Skeleton width="100%" height={92} borderRadius={20} />
            <Skeleton width="100%" height={92} borderRadius={20} />
          </View>
        ) : automations.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nothing automated yet</Text>
            <Text style={styles.emptyText}>
              Pick a starting point. You can change every part of it afterwards.
            </Text>
            <View style={styles.presetGrid}>
              {ORDER.map((type) => {
                const meta = AUTOMATION_META[type];
                return (
                  <TouchableOpacity
                    key={type}
                    style={styles.presetCard}
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push({
                        pathname: '/instagram-automation/[id]',
                        params: { id: 'new', type },
                      })
                    }
                  >
                    <View style={[styles.presetIcon, { backgroundColor: `${meta.accent}1f` }]}>
                      <meta.Icon size={16} color={meta.accent} />
                    </View>
                    <Text style={styles.presetLabel}>{meta.label}</Text>
                    <Text style={styles.presetBlurb} numberOfLines={2}>
                      {meta.blurb}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {automations.map((a) => {
              const meta = AUTOMATION_META[a.type];
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.ruleCard, !a.enabled && styles.ruleCardOff]}
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push({ pathname: '/instagram-automation/[id]', params: { id: a.id } })
                  }
                >
                  <View style={[styles.ruleIcon, { backgroundColor: `${meta.accent}1f` }]}>
                    <meta.Icon size={17} color={meta.accent} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.ruleTopRow}>
                      <Text style={styles.ruleName} numberOfLines={1}>
                        {a.name}
                      </Text>
                      {a.aiFallbackEnabled && (
                        <View style={styles.aiPill}>
                          <Text style={styles.aiPillText}>AI</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.ruleType}>{meta.label}</Text>
                    <Text style={styles.ruleTrigger} numberOfLines={1}>
                      {triggerSummary(a)}
                    </Text>
                    <Text style={styles.ruleCount}>
                      {a.triggerCount === 0 ? 'Not triggered yet' : `Triggered ${a.triggerCount}x`}
                    </Text>
                  </View>

                  <Switch
                    value={a.enabled}
                    onValueChange={(v) => toggleMutation.mutate({ id: a.id, enabled: v })}
                    trackColor={{ false: 'rgba(63,3,11,0.15)', true: Colors.rose }}
                    thumbColor={Colors.creamLite}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Rules are inert while the master switch is off; say so rather than letting
            someone wonder why a green toggle is doing nothing. */}
        {!masterOn && automations.length > 0 && (
          <Notice
            tone="info"
            title="Automation is paused"
            text="Individual rules stay as you left them, but nothing will be sent until you turn automation on above."
          />
        )}
      </ScrollView>
    </View>
  );
}

// --- Pieces ------------------------------------------------------------------

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
        <ArrowLeft size={22} color={Colors.oxblood} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerEye}>Instagram</Text>
        <Text style={styles.headerTitle}>Automation</Text>
      </View>
      <LinearGradient
        colors={['#e1306c', '#c13584', '#405de6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerIcon}
      >
        <HugeiconsIcon icon={Instagram} size={16} color="#fff" strokeWidth={2} />
      </LinearGradient>
    </View>
  );
}

function Stat({
  label,
  value,
  loading,
  last,
}: {
  label: string;
  value?: number;
  loading: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.statItem, !last && styles.statBorder]}>
      {loading ? (
        <Skeleton width={38} height={18} borderRadius={4} />
      ) : (
        <Text style={styles.statValue}>{(value ?? 0).toLocaleString('en-IN')}</Text>
      )}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Shortcut({
  icon: Glyph,
  label,
  sub,
  onPress,
}: {
  icon: IconComponent;
  label: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.shortcut} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.shortcutIcon}>
        <Glyph size={16} color={Colors.oxblood} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.shortcutLabel}>{label}</Text>
        <Text style={styles.shortcutSub}>{sub}</Text>
      </View>
      <ChevronRight size={16} color="rgba(63,3,11,0.35)" />
    </TouchableOpacity>
  );
}

function DiagRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View style={styles.diagRow}>
      {ok ? <Check size={14} color={Colors.green} /> : <X size={14} color="#a3323f" />}
      <Text style={[styles.diagRowText, !ok && { color: '#a3323f', fontWeight: '700' }]}>
        {label}
      </Text>
    </View>
  );
}

function Notice({ tone, title, text }: { tone: 'warn' | 'info'; title: string; text: string }) {
  const warn = tone === 'warn';
  const Glyph = warn ? Zap : Eye;
  return (
    <View style={[styles.notice, warn ? styles.noticeWarn : styles.noticeInfo]}>
      <Glyph size={15} color={warn ? '#8a5a12' : Colors.oxblood} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.noticeTitle, warn && { color: '#8a5a12' }]}>{title}</Text>
        <Text style={[styles.noticeText, warn && { color: '#8a5a12' }]}>{text}</Text>
      </View>
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
  headerIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  body: { paddingHorizontal: 18, paddingTop: 4, paddingBottom: 130, gap: 16 },

  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 20,
    borderRadius: Radius.xxl,
    ...Shadow.card,
  },
  masterEyebrow: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.75)',
  },
  masterTitle: { fontFamily: FontFamily.serif, fontSize: 26, color: '#fff', marginTop: 4 },
  masterSub: { fontSize: 12.5, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    paddingVertical: 16,
    ...Shadow.card,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statBorder: { borderRightWidth: 1, borderRightColor: 'rgba(63,3,11,0.07)' },
  statValue: { fontFamily: FontFamily.sansMedium, fontSize: 19, fontWeight: '700', color: Colors.oxblood },
  statLabel: { fontSize: 10.5, color: 'rgba(63,3,11,0.5)', fontWeight: '600' },

  shortcutRow: { flexDirection: 'row', gap: 12 },
  shortcut: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: 13,
    ...Shadow.card,
  },
  shortcutIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(63,3,11,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: { fontSize: 13, fontWeight: '700', color: Colors.ink },
  shortcutSub: { fontSize: 11, color: 'rgba(63,3,11,0.45)', marginTop: 1 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  sectionTitle: { fontFamily: FontFamily.sansMedium, fontSize: 18, fontWeight: '700', color: Colors.ink },

  ruleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: 15,
    ...Shadow.card,
  },
  ruleCardOff: { opacity: 0.6 },
  ruleIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  ruleTopRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  ruleName: { fontSize: 14.5, fontWeight: '700', color: Colors.ink, flexShrink: 1 },
  aiPill: { backgroundColor: 'rgba(42,122,90,0.12)', borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 },
  aiPillText: { fontSize: 9.5, fontWeight: '800', color: Colors.green, letterSpacing: 0.5 },
  ruleType: { fontSize: 11, fontWeight: '700', color: Colors.rose, marginTop: 2 },
  ruleTrigger: { fontSize: 11.5, color: 'rgba(63,3,11,0.5)', marginTop: 3 },
  ruleCount: { fontSize: 10.5, color: 'rgba(63,3,11,0.35)', marginTop: 3 },

  emptyCard: { backgroundColor: '#fff', borderRadius: Radius.xxl, padding: 20, ...Shadow.card },
  emptyTitle: { fontFamily: FontFamily.sansMedium, fontSize: 16, fontWeight: '700', color: Colors.ink },
  emptyText: { fontSize: 12.5, color: 'rgba(63,3,11,0.5)', marginTop: 5, lineHeight: 18 },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  presetCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: Colors.creamLite,
    borderRadius: Radius.lg,
    padding: 13,
    gap: 6,
  },
  presetIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  presetLabel: { fontSize: 13, fontWeight: '700', color: Colors.ink },
  presetBlurb: { fontSize: 11, color: 'rgba(63,3,11,0.5)', lineHeight: 15 },

  diagCard: { backgroundColor: 'rgba(243,201,105,0.18)', borderRadius: Radius.xl, padding: 16 },
  diagHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  diagTitle: { fontFamily: FontFamily.sansMedium, fontSize: 14.5, fontWeight: '700', color: '#8a5a12' },
  diagRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  diagRowText: { flex: 1, fontSize: 12, color: 'rgba(63,3,11,0.65)', lineHeight: 16 },
  diagHint: { fontSize: 11.5, color: '#8a5a12', marginTop: 12, lineHeight: 16 },
  diagError: { fontSize: 11.5, color: '#a3323f', marginTop: 10, lineHeight: 16 },

  notice: { flexDirection: 'row', gap: 10, borderRadius: Radius.lg, padding: 13 },
  noticeWarn: { backgroundColor: 'rgba(243,201,105,0.22)' },
  noticeInfo: { backgroundColor: 'rgba(63,3,11,0.05)' },
  noticeTitle: { fontSize: 12.5, fontWeight: '700', color: Colors.ink },
  noticeText: { fontSize: 11.5, color: 'rgba(63,3,11,0.6)', marginTop: 2, lineHeight: 16 },

  notConnected: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 6 },
  notConnectedIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(180,106,116,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  notConnectedTitle: { fontFamily: FontFamily.sansMedium, fontSize: 17, fontWeight: '700', color: Colors.ink },
  notConnectedText: { fontSize: 12.5, color: 'rgba(63,3,11,0.5)', textAlign: 'center', lineHeight: 18 },
});
