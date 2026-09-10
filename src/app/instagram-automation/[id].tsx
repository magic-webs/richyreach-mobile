import { Check, Plus, Trash2, X } from 'lucide-react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { TactileButton } from '@/components/ui/tactile-button';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import {
  AUTOMATION_META,
  MATCH_TYPE_LABELS,
  type AutomationInput,
  type AutomationType,
  type DmButton,
  type MatchType,
} from '@/types/instagram-automation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TYPES: AutomationType[] = ['comment_reply', 'comment_dm', 'dm_reply', 'welcome_dm'];
const MATCH_TYPES: MatchType[] = ['contains', 'exact', 'starts_with', 'any'];

/** Comment-driven rules can be limited to particular posts; DM rules cannot. */
function isCommentType(t: AutomationType) {
  return t === 'comment_reply' || t === 'comment_dm';
}

/** Only a public comment reply uses the multi-template pool; the rest send one DM body. */
function usesTemplatePool(t: AutomationType) {
  return t === 'comment_reply';
}

/** The Meta limit worth knowing before you save this kind of rule. */
const TYPE_CAVEAT: Record<AutomationType, string> = {
  comment_reply: 'Posted publicly under the comment, visible to everyone.',
  comment_dm: 'Instagram allows one private reply per comment, within 7 days of it.',
  dm_reply: 'Instagram only accepts a reply within 24 hours of the person messaging you.',
  welcome_dm: 'Sent once, the first time somebody ever messages this account.',
};

const emptyDraft = (type: AutomationType): AutomationInput => ({
  name: '',
  type,
  enabled: true,
  matchType: type === 'welcome_dm' ? 'any' : 'contains',
  keywords: [],
  caseSensitive: false,
  mediaScope: 'all',
  mediaIds: [],
  replyTemplates: [],
  dmTemplate: null,
  dmButtons: [],
  aiFallbackEnabled: false,
  aiPrompt: null,
  cooldownSeconds: 0,
  maxPerDay: 0,
  skipIfAlreadyHandled: true,
});

export default function AutomationEditorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const showModal = useUIStore((s) => s.showModal);
  const { id, type: presetType } = useLocalSearchParams<{ id: string; type?: string }>();

  const isNew = id === 'new';
  const [draft, setDraft] = useState<AutomationInput>(() =>
    emptyDraft((presetType as AutomationType) || 'comment_reply')
  );
  const [keywordInput, setKeywordInput] = useState('');
  const [loadedId, setLoadedId] = useState<string | null>(null);

  const existing = useQuery({
    queryKey: ['igAutomation', id],
    queryFn: () => api.social.instagramAutomation.get(id),
    enabled: !isNew,
    retry: false,
  });

  // Seed the form once the record arrives. Keyed on loadedId rather than an effect so a
  // background refetch never overwrites edits already in progress.
  if (!isNew && existing.data && loadedId !== existing.data.id) {
    const d = existing.data;
    setLoadedId(d.id);
    setDraft({
      name: d.name,
      type: d.type,
      enabled: d.enabled,
      matchType: d.matchType,
      keywords: d.keywords ?? [],
      caseSensitive: d.caseSensitive,
      mediaScope: d.mediaScope,
      mediaIds: d.mediaIds ?? [],
      replyTemplates: d.replyTemplates ?? [],
      dmTemplate: d.dmTemplate,
      dmButtons: d.dmButtons ?? [],
      aiFallbackEnabled: d.aiFallbackEnabled,
      aiPrompt: d.aiPrompt,
      cooldownSeconds: d.cooldownSeconds,
      maxPerDay: d.maxPerDay,
      skipIfAlreadyHandled: d.skipIfAlreadyHandled,
    });
  }

  const mediaQuery = useQuery({
    queryKey: ['igAutomationMedia'],
    queryFn: () => api.social.instagramAutomation.getMedia(),
    enabled: isCommentType(draft.type) && draft.mediaScope === 'specific',
    retry: false,
  });

  const settingsQuery = useQuery({
    queryKey: ['igAutomationSettings'],
    queryFn: () => api.social.instagramAutomation.getSettings(),
    retry: false,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['igAutomations'] });
    queryClient.invalidateQueries({ queryKey: ['igAutomationStats'] });
    if (!isNew) queryClient.invalidateQueries({ queryKey: ['igAutomation', id] });
  };

  const saveMutation = useMutation({
    mutationFn: (body: AutomationInput) =>
      isNew ? api.social.instagramAutomation.create(body) : api.social.instagramAutomation.update(id, body),
    onSuccess: () => {
      invalidate();
      router.back();
    },
    onError: (err: any) =>
      showModal({ title: 'Could not save', message: err?.message || 'Please try again.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.social.instagramAutomation.remove(id),
    onSuccess: () => {
      invalidate();
      router.back();
    },
    onError: (err: any) =>
      showModal({ title: 'Could not delete', message: err?.message || 'Please try again.' }),
  });

  const patch = (p: Partial<AutomationInput>) => setDraft((d) => ({ ...d, ...p }));

  const addKeyword = () => {
    const value = keywordInput.trim();
    if (!value) return;
    // Case-insensitive de-dupe, since matching is case-insensitive by default.
    if (draft.keywords.some((k) => k.toLowerCase() === value.toLowerCase())) {
      setKeywordInput('');
      return;
    }
    patch({ keywords: [...draft.keywords, value] });
    setKeywordInput('');
  };

  // Mirrors the two server-side refinements, so a save is not round-tripped just to fail.
  const needsKeywords = draft.matchType !== 'any' && draft.type !== 'welcome_dm';
  const hasReplyText = usesTemplatePool(draft.type)
    ? draft.replyTemplates.some((t) => t.trim())
    : Boolean(draft.dmTemplate?.trim());
  const problems: string[] = [];
  if (!draft.name.trim()) problems.push('Give the rule a name');
  if (needsKeywords && draft.keywords.length === 0) problems.push('Add at least one keyword');
  if (!hasReplyText && !draft.aiFallbackEnabled) problems.push('Add a reply, or turn on the AI fallback');
  if (draft.mediaScope === 'specific' && draft.mediaIds.length === 0) problems.push('Pick at least one post');

  const onSave = () => {
    if (problems.length > 0) return;
    saveMutation.mutate({
      ...draft,
      name: draft.name.trim(),
      // Drop blank rows the editor leaves behind rather than letting the API reject them.
      replyTemplates: draft.replyTemplates.map((t) => t.trim()).filter(Boolean),
      dmTemplate: draft.dmTemplate?.trim() || null,
      aiPrompt: draft.aiPrompt?.trim() || null,
      dmButtons: draft.dmButtons.filter((b) => b.title.trim() && b.url.trim()),
    });
  };

  const onDelete = () => {
    Alert.alert('Delete this rule?', 'Its activity history is kept, but it will stop replying.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  const meta = AUTOMATION_META[draft.type];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color={Colors.oxblood} strokeWidth={2} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerEye}>{isNew ? 'New rule' : 'Edit rule'}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {draft.name.trim() || meta.label}
          </Text>
        </View>
        {!isNew && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} activeOpacity={0.8}>
            <Trash2 size={18} color="#a3323f" />
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
        bottomOffset={20}
      >
        {/* Type */}
        <Section title="What should happen" caption={TYPE_CAVEAT[draft.type]}>
          <View style={styles.typeGrid}>
            {TYPES.map((t) => {
              const m = AUTOMATION_META[t];
              const active = draft.type === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeCard, active && { borderColor: m.accent, backgroundColor: `${m.accent}12` }]}
                  activeOpacity={0.85}
                  onPress={() =>
                    patch({
                      type: t,
                      // Welcome messages greet everyone, so a keyword trigger makes no sense.
                      matchType: t === 'welcome_dm' ? 'any' : draft.matchType,
                      mediaScope: isCommentType(t) ? draft.mediaScope : 'all',
                    })
                  }
                >
                  <View style={[styles.typeIcon, { backgroundColor: `${m.accent}1f` }]}>
                    <m.Icon size={15} color={m.accent} />
                  </View>
                  <Text style={[styles.typeLabel, active && { color: m.accent }]}>{m.label}</Text>
                  <Text style={styles.typeBlurb} numberOfLines={2}>
                    {m.blurb}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* Name */}
        <Section title="Name">
          <TextInput
            style={styles.input}
            value={draft.name}
            onChangeText={(v) => patch({ name: v })}
            placeholder="Link request auto-reply"
            placeholderTextColor="rgba(63,3,11,0.3)"
            maxLength={80}
          />
        </Section>

        {/* Trigger */}
        {draft.type !== 'welcome_dm' && (
          <Section title="When it fires">
            <View style={styles.chipRow}>
              {MATCH_TYPES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.chip, draft.matchType === m && styles.chipActive]}
                  activeOpacity={0.8}
                  onPress={() => patch({ matchType: m })}
                >
                  <Text style={[styles.chipText, draft.matchType === m && styles.chipTextActive]}>
                    {MATCH_TYPE_LABELS[m]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {draft.matchType !== 'any' && (
              <View style={{ marginTop: 14 }}>
                <Text style={styles.fieldLabel}>Keywords</Text>
                <View style={styles.keywordInputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={keywordInput}
                    onChangeText={setKeywordInput}
                    onSubmitEditing={addKeyword}
                    returnKeyType="done"
                    placeholder="link, price, send"
                    placeholderTextColor="rgba(63,3,11,0.3)"
                    maxLength={60}
                  />
                  <TouchableOpacity style={styles.addKeywordBtn} onPress={addKeyword} activeOpacity={0.85}>
                    <Plus size={16} color={Colors.cream} />
                  </TouchableOpacity>
                </View>

                {draft.keywords.length > 0 && (
                  <View style={styles.keywordWrap}>
                    {draft.keywords.map((k) => (
                      <TouchableOpacity
                        key={k}
                        style={styles.keywordChip}
                        activeOpacity={0.8}
                        onPress={() => patch({ keywords: draft.keywords.filter((x) => x !== k) })}
                      >
                        <Text style={styles.keywordChipText}>{k}</Text>
                        <X size={12} color={Colors.oxblood} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <Toggle
                  label="Match capital letters exactly"
                  value={draft.caseSensitive}
                  onChange={(v) => patch({ caseSensitive: v })}
                />
              </View>
            )}
          </Section>
        )}

        {/* Post scope */}
        {isCommentType(draft.type) && (
          <Section title="Which posts">
            <View style={styles.chipRow}>
              {(['all', 'specific'] as const).map((scope) => (
                <TouchableOpacity
                  key={scope}
                  style={[styles.chip, draft.mediaScope === scope && styles.chipActive]}
                  activeOpacity={0.8}
                  onPress={() => patch({ mediaScope: scope })}
                >
                  <Text style={[styles.chipText, draft.mediaScope === scope && styles.chipTextActive]}>
                    {scope === 'all' ? 'Every post' : 'Chosen posts'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {draft.mediaScope === 'specific' && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {(mediaQuery.data ?? []).map((post) => {
                    const picked = draft.mediaIds.includes(post.id);
                    return (
                      <TouchableOpacity
                        key={post.id}
                        activeOpacity={0.85}
                        onPress={() =>
                          patch({
                            mediaIds: picked
                              ? draft.mediaIds.filter((x) => x !== post.id)
                              : [...draft.mediaIds, post.id],
                          })
                        }
                      >
                        <Image
                          source={{ uri: post.thumbnailUrl }}
                          style={[styles.postThumb, picked && styles.postThumbPicked]}
                          contentFit="cover"
                        />
                        {picked && (
                          <View style={styles.postCheck}>
                            <Check size={12} color={Colors.cream} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                  {mediaQuery.isLoading && <Text style={styles.helper}>Loading your posts…</Text>}
                  {mediaQuery.isError && (
                    <Text style={styles.helper}>Could not load posts from Instagram.</Text>
                  )}
                </View>
              </ScrollView>
            )}
          </Section>
        )}

        {/* Response */}
        <Section
          title="What to send"
          caption={
            usesTemplatePool(draft.type)
              ? 'One is picked at random each time, so your comment section does not fill up with the same sentence.'
              : 'Use {{username}} for their handle and {{message}} for what they wrote.'
          }
        >
          {usesTemplatePool(draft.type) ? (
            <View style={{ gap: 10 }}>
              {draft.replyTemplates.map((t, i) => (
                <View key={i} style={styles.templateRow}>
                  <TextInput
                    style={[styles.input, styles.multiline, { flex: 1 }]}
                    value={t}
                    onChangeText={(v) =>
                      patch({ replyTemplates: draft.replyTemplates.map((x, xi) => (xi === i ? v : x)) })
                    }
                    placeholder="Thanks {{username}}! Just sent you a DM."
                    placeholderTextColor="rgba(63,3,11,0.3)"
                    multiline
                    maxLength={900}
                  />
                  <TouchableOpacity
                    style={styles.removeRowBtn}
                    activeOpacity={0.8}
                    onPress={() =>
                      patch({ replyTemplates: draft.replyTemplates.filter((_, xi) => xi !== i) })
                    }
                  >
                    <X size={14} color="#a3323f" />
                  </TouchableOpacity>
                </View>
              ))}
              {draft.replyTemplates.length < 10 && (
                <TouchableOpacity
                  style={styles.addRowBtn}
                  activeOpacity={0.8}
                  onPress={() => patch({ replyTemplates: [...draft.replyTemplates, ''] })}
                >
                  <Plus size={14} color={Colors.oxblood} />
                  <Text style={styles.addRowText}>Add a variation</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TextInput
              style={[styles.input, styles.multiline]}
              value={draft.dmTemplate ?? ''}
              onChangeText={(v) => patch({ dmTemplate: v })}
              placeholder="Hey {{username}}! Here is the link you asked for."
              placeholderTextColor="rgba(63,3,11,0.3)"
              multiline
              maxLength={900}
            />
          )}

          {/* Link buttons only exist on the DM channels. */}
          {draft.type !== 'comment_reply' && (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.fieldLabel}>Link buttons (up to 3)</Text>
              <View style={{ gap: 10, marginTop: 8 }}>
                {draft.dmButtons.map((b, i) => (
                  <View key={i} style={styles.buttonRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={b.title}
                      onChangeText={(v) =>
                        patch({
                          dmButtons: draft.dmButtons.map((x, xi) =>
                            xi === i ? { ...x, title: v } : x
                          ) as DmButton[],
                        })
                      }
                      placeholder="Label"
                      placeholderTextColor="rgba(63,3,11,0.3)"
                      maxLength={20}
                    />
                    <TextInput
                      style={[styles.input, { flex: 1.6 }]}
                      value={b.url}
                      onChangeText={(v) =>
                        patch({
                          dmButtons: draft.dmButtons.map((x, xi) =>
                            xi === i ? { ...x, url: v } : x
                          ) as DmButton[],
                        })
                      }
                      placeholder="https://…"
                      placeholderTextColor="rgba(63,3,11,0.3)"
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                    <TouchableOpacity
                      style={styles.removeRowBtn}
                      activeOpacity={0.8}
                      onPress={() => patch({ dmButtons: draft.dmButtons.filter((_, xi) => xi !== i) })}
                    >
                      <X size={14} color="#a3323f" />
                    </TouchableOpacity>
                  </View>
                ))}
                {draft.dmButtons.length < 3 && (
                  <TouchableOpacity
                    style={styles.addRowBtn}
                    activeOpacity={0.8}
                    onPress={() => patch({ dmButtons: [...draft.dmButtons, { title: '', url: '' }] })}
                  >
                    <Plus size={14} color={Colors.oxblood} />
                    <Text style={styles.addRowText}>Add a button</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </Section>

        {/* AI fallback */}
        <Section
          title="AI fallback"
          caption="Used only when this rule matches but has no reply written for it."
        >
          <Toggle
            label="Let AI write the reply"
            value={draft.aiFallbackEnabled}
            onChange={(v) => patch({ aiFallbackEnabled: v })}
          />
          {draft.aiFallbackEnabled && settingsQuery.data && !settingsQuery.data.aiAvailable && (
            <Text style={styles.warnText}>
              The server has no OpenAI key configured, so this rule will skip instead of replying.
            </Text>
          )}
          {draft.aiFallbackEnabled && (
            <TextInput
              style={[styles.input, styles.multiline, { marginTop: 12 }]}
              value={draft.aiPrompt ?? ''}
              onChangeText={(v) => patch({ aiPrompt: v })}
              placeholder="Answer questions about my rates warmly, and always point people to my link in bio."
              placeholderTextColor="rgba(63,3,11,0.3)"
              multiline
              maxLength={1000}
            />
          )}
        </Section>

        {/* Limits */}
        <Section title="Limits" caption="Keeps a viral post from turning into a wall of identical replies.">
          <View style={styles.limitRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Wait between sends</Text>
              <View style={styles.limitInputWrap}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={draft.cooldownSeconds ? String(draft.cooldownSeconds) : ''}
                  onChangeText={(v) => patch({ cooldownSeconds: Math.min(Number(v.replace(/\D/g, '')) || 0, 86400) })}
                  placeholder="0"
                  placeholderTextColor="rgba(63,3,11,0.3)"
                  keyboardType="number-pad"
                />
                <Text style={styles.limitUnit}>sec</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Max per day</Text>
              <View style={styles.limitInputWrap}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={draft.maxPerDay ? String(draft.maxPerDay) : ''}
                  onChangeText={(v) => patch({ maxPerDay: Math.min(Number(v.replace(/\D/g, '')) || 0, 10000) })}
                  placeholder="No limit"
                  placeholderTextColor="rgba(63,3,11,0.3)"
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          <Toggle
            label="Never reply twice to the same comment or message"
            value={draft.skipIfAlreadyHandled}
            onChange={(v) => patch({ skipIfAlreadyHandled: v })}
          />
          <Toggle
            label="Rule is active"
            value={draft.enabled}
            onChange={(v) => patch({ enabled: v })}
          />
        </Section>

        {problems.length > 0 && (
          <View style={styles.problemCard}>
            {problems.map((p) => (
              <View key={p} style={styles.problemRow}>
                <X size={12} color="#a3323f" />
                <Text style={styles.problemText}>{p}</Text>
              </View>
            ))}
          </View>
        )}

        <TactileButton
          text={isNew ? 'Create rule' : 'Save changes'}
          icon="check"
          variant={problems.length > 0 ? 'disabled' : 'primary'}
          disabled={problems.length > 0}
          loading={saveMutation.isPending}
          fullWidth
          onPress={onSave}
          style={{ marginTop: 4 }}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

// --- Pieces ------------------------------------------------------------------

function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {caption && <Text style={styles.sectionCaption}>{caption}</Text>}
      <View style={{ marginTop: 12 }}>{children}</View>
    </View>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: 'rgba(63,3,11,0.15)', true: Colors.rose }}
        thumbColor={Colors.creamLite}
      />
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
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(163,50,63,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEye: { fontSize: 11, fontWeight: '700', color: Colors.rose, textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontFamily: FontFamily.sansMedium, fontSize: 19, fontWeight: '700', color: Colors.ink, marginTop: 1 },

  body: { paddingHorizontal: 18, paddingTop: 4, paddingBottom: 60, gap: 14 },

  section: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: 17, ...Shadow.card },
  sectionTitle: { fontFamily: FontFamily.sansMedium, fontSize: 15.5, fontWeight: '700', color: Colors.ink },
  sectionCaption: { fontSize: 11.5, color: 'rgba(63,3,11,0.45)', marginTop: 4, lineHeight: 16 },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: {
    width: '47%',
    flexGrow: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(63,3,11,0.09)',
    borderRadius: Radius.lg,
    padding: 12,
    gap: 6,
  },
  typeIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  typeLabel: { fontSize: 12.5, fontWeight: '700', color: Colors.ink },
  typeBlurb: { fontSize: 10.5, color: 'rgba(63,3,11,0.45)', lineHeight: 14 },

  input: {
    backgroundColor: Colors.creamLite,
    borderRadius: Radius.md,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 13.5,
    color: Colors.ink,
  },
  multiline: { minHeight: 74, textAlignVertical: 'top', paddingTop: 11 },

  fieldLabel: { fontSize: 11.5, fontWeight: '700', color: 'rgba(63,3,11,0.55)', marginBottom: 7 },
  helper: { fontSize: 11.5, color: 'rgba(63,3,11,0.45)' },
  warnText: { fontSize: 11.5, color: '#8a5a12', marginTop: 8, lineHeight: 16 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 99,
    paddingHorizontal: 13,
    paddingVertical: 7,
    backgroundColor: Colors.creamLite,
  },
  chipActive: { backgroundColor: Colors.oxblood },
  chipText: { fontSize: 12, fontWeight: '700', color: 'rgba(63,3,11,0.55)' },
  chipTextActive: { color: Colors.cream },

  keywordInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addKeywordBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keywordWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 11 },
  keywordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(180,106,116,0.15)',
    borderRadius: 99,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  keywordChipText: { fontSize: 12, fontWeight: '700', color: Colors.oxblood },

  postThumb: { width: 68, height: 68, borderRadius: 14, borderWidth: 2.5, borderColor: 'transparent' },
  postThumbPicked: { borderColor: Colors.oxblood },
  postCheck: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 99,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },

  templateRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  buttonRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  removeRowBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(163,50,63,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  addRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(63,3,11,0.18)',
  },
  addRowText: { fontSize: 12.5, fontWeight: '700', color: Colors.oxblood },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    marginTop: 12,
  },
  toggleLabel: { flex: 1, fontSize: 12.5, color: Colors.ink, lineHeight: 17 },

  limitRow: { flexDirection: 'row', gap: 12 },
  limitInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  limitUnit: { fontSize: 12, fontWeight: '700', color: 'rgba(63,3,11,0.4)' },

  problemCard: { backgroundColor: 'rgba(163,50,63,0.07)', borderRadius: Radius.lg, padding: 13, gap: 7 },
  problemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  problemText: { fontSize: 12, color: '#a3323f', fontWeight: '600' },
});
