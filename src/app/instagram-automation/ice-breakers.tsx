import {
  ArrowLeft,
  Camera,
  Check,
  Image as ImageIcon,
  Mic,
  Plus,
  Sticker,
  X,
} from 'lucide-react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { TactileButton } from '@/components/ui/tactile-button';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import type { IceBreaker } from '@/types/instagram-automation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Meta shows at most four ice breakers, and truncates a question past 80 characters. */
const MAX_ICE_BREAKERS = 4;
const MAX_QUESTION = 80;

const SUGGESTIONS = [
  'What are your rates?',
  'Are you free for a collab?',
  'Where do I get the link?',
  'Do you ship outside India?',
];

export default function IceBreakersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const showModal = useUIStore((s) => s.showModal);

  const [items, setItems] = useState<IceBreaker[] | null>(null);

  const settingsQuery = useQuery({
    queryKey: ['igAutomationSettings'],
    queryFn: () => api.social.instagramAutomation.getSettings(),
    retry: false,
  });

  // Seed once from the server, then let local edits own the state.
  const list = items ?? settingsQuery.data?.iceBreakers ?? [];

  const saveMutation = useMutation({
    mutationFn: (next: IceBreaker[]) => api.social.instagramAutomation.updateIceBreakers(next),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['igAutomationSettings'] });
      if (result.synced) {
        router.back();
      } else {
        // Saved on our side but Meta refused; staying put lets them retry.
        showModal({
          title: 'Saved, but not live yet',
          message:
            result.syncError ||
            'Instagram did not accept the ice breakers. They are stored here and you can try publishing again.',
        });
      }
    },
    onError: (err: any) =>
      showModal({ title: 'Could not save', message: err?.message || 'Please try again.' }),
  });

  const update = (next: IceBreaker[]) => setItems(next);

  const add = (question = '') => {
    if (list.length >= MAX_ICE_BREAKERS) return;
    // The payload is what comes back as the message text when someone taps it, so it
    // doubles as the trigger your DM keyword rules can match on.
    update([...list, { question, payload: question || 'ICE_BREAKER' }]);
  };

  const problems = list.filter((i) => !i.question.trim()).length;
  const dirty = items !== null;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <ArrowLeft size={22} color={Colors.oxblood} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerEye}>Automation</Text>
          <Text style={styles.headerTitle}>Ice breakers</Text>
        </View>
      </View>

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
        bottomOffset={20}
      >
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Questions people can tap</Text>
          <Text style={styles.introText}>
            Instagram shows these in an empty DM thread. Tapping one sends it as the person&apos;s
            first message, so a DM auto-reply rule with a matching keyword can answer it
            immediately.
          </Text>
          {settingsQuery.data?.iceBreakersSyncedAt && (
            <View style={styles.syncedRow}>
              <Check size={13} color={Colors.green} />
              <Text style={styles.syncedText}>
                Live on @{settingsQuery.data.username}
              </Text>
            </View>
          )}
        </View>

        <IceBreakerPreview
          username={settingsQuery.data?.username}
          questions={list.map((i) => i.question).filter((q) => q.trim())}
        />

        {settingsQuery.isLoading ? (
          <View style={{ gap: 12 }}>
            <Skeleton width="100%" height={84} borderRadius={18} />
            <Skeleton width="100%" height={84} borderRadius={18} />
          </View>
        ) : settingsQuery.isError ? (
          <Text style={styles.errorText}>
            Could not load your settings. Connect Instagram, then try again.
          </Text>
        ) : (
          <>
            <View style={{ gap: 12 }}>
              {list.map((item, i) => (
                <View key={i} style={styles.card}>
                  <View style={styles.cardHead}>
                    <View style={styles.indexPill}>
                      <Text style={styles.indexText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.cardLabel}>Question</Text>
                    <View style={{ flex: 1 }} />
                    <Text style={styles.counter}>
                      {item.question.length}/{MAX_QUESTION}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      activeOpacity={0.8}
                      onPress={() => update(list.filter((_, xi) => xi !== i))}
                    >
                      <X size={13} color="#a3323f" />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={styles.input}
                    value={item.question}
                    onChangeText={(v) =>
                      update(
                        list.map((x, xi) =>
                          // Keep payload mirroring the question so keyword rules can match it.
                          xi === i ? { question: v, payload: v || 'ICE_BREAKER' } : x
                        )
                      )
                    }
                    placeholder="What are your rates?"
                    placeholderTextColor="rgba(63,3,11,0.3)"
                    maxLength={MAX_QUESTION}
                  />
                </View>
              ))}
            </View>

            {list.length < MAX_ICE_BREAKERS && (
              <>
                <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={() => add()}>
                  <Plus size={15} color={Colors.oxblood} />
                  <Text style={styles.addText}>Add a question</Text>
                </TouchableOpacity>

                <View>
                  <Text style={styles.suggestLabel}>Or start from one of these</Text>
                  <View style={styles.suggestWrap}>
                    {SUGGESTIONS.filter((s) => !list.some((i) => i.question === s)).map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={styles.suggestChip}
                        activeOpacity={0.8}
                        onPress={() => add(s)}
                      >
                        <Plus size={11} color={Colors.oxblood} />
                        <Text style={styles.suggestText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}

            {list.length === 0 && (
              <Text style={styles.helper}>
                With none set, Instagram shows an empty thread and people have to type first.
                Saving an empty list also removes the ones already live.
              </Text>
            )}

            <TactileButton
              text="Publish to Instagram"
              icon="send"
              variant={problems > 0 || !dirty ? 'disabled' : 'primary'}
              disabled={problems > 0 || !dirty}
              loading={saveMutation.isPending}
              fullWidth
              onPress={() => saveMutation.mutate(list.filter((i) => i.question.trim()))}
              style={{ marginTop: 4 }}
            />
            {problems > 0 && <Text style={styles.errorText}>Fill in or remove the empty question.</Text>}
          </>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

/**
 * How the thread actually looks on Instagram: dark, the questions right-aligned as
 * tappable pills under a grey caption, above the composer. Rendered from the live list
 * so a question that is too long to fit is obvious while it is still being typed.
 */
function IceBreakerPreview({
  username,
  questions,
}: {
  username?: string;
  questions: string[];
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.previewLabel}>Preview</Text>

      <View style={styles.phone}>
        <Text style={styles.phoneCaption}>
          Tap to send a question suggested by {username || "you"}
        </Text>

        <View style={styles.bubbles}>
          {questions.length === 0 ? (
            <Text style={styles.phoneEmpty}>
              Your questions appear here once you add them.
            </Text>
          ) : (
            questions.map((q, i) => (
              <View key={i} style={styles.bubble}>
                <Text style={styles.bubbleText}>{q}</Text>
              </View>
            ))
          )}
        </View>

        {/* Composer, purely decorative -- it anchors the bubbles the way Instagram does. */}
        <View style={styles.composer}>
          <View style={styles.composerCamera}>
            <Camera size={14} color="#fff" />
          </View>
          <Text style={styles.composerPlaceholder}>Message...</Text>
          <Mic size={15} color="#c7c7c7" />
          <ImageIcon size={15} color="#c7c7c7" />
          <Sticker size={15} color="#c7c7c7" />
          <Plus size={15} color="#c7c7c7" />
        </View>
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

  body: { paddingHorizontal: 18, paddingTop: 4, paddingBottom: 60, gap: 14 },

  introCard: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: 17, ...Shadow.card },
  introTitle: { fontFamily: FontFamily.sansMedium, fontSize: 15.5, fontWeight: '700', color: Colors.ink },
  introText: { fontSize: 12, color: 'rgba(63,3,11,0.5)', marginTop: 6, lineHeight: 17 },
  syncedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 11 },
  syncedText: { fontSize: 11.5, fontWeight: '700', color: Colors.green },

  card: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: 15, ...Shadow.card },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  indexPill: {
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: 'rgba(63,3,11,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: { fontSize: 11, fontWeight: '800', color: Colors.oxblood },
  cardLabel: { fontSize: 11.5, fontWeight: '700', color: 'rgba(63,3,11,0.5)' },
  counter: { fontSize: 10.5, color: 'rgba(63,3,11,0.35)', fontWeight: '600' },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: 'rgba(163,50,63,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  input: {
    backgroundColor: Colors.creamLite,
    borderRadius: Radius.md,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 13.5,
    color: Colors.ink,
  },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(63,3,11,0.18)',
  },
  addText: { fontSize: 13, fontWeight: '700', color: Colors.oxblood },

  suggestLabel: { fontSize: 11.5, fontWeight: '700', color: 'rgba(63,3,11,0.45)', marginBottom: 9 },
  suggestWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  suggestText: { fontSize: 11.5, fontWeight: '600', color: Colors.oxblood },

  previewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  phone: {
    backgroundColor: '#000',
    borderRadius: Radius.xl,
    paddingTop: 18,
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 14,
  },
  phoneCaption: {
    fontSize: 11.5,
    color: '#a8a8a8',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  bubbles: { gap: 8, alignItems: 'flex-end' },
  bubble: {
    backgroundColor: '#262628',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '88%',
  },
  // Instagram renders a tappable ice breaker in its link blue, not white.
  bubbleText: { fontSize: 13.5, fontWeight: '700', color: '#7d8cf8' },
  phoneEmpty: {
    alignSelf: 'center',
    fontSize: 11.5,
    color: '#6b6b6b',
    paddingVertical: 14,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: '#1c1c1e',
    borderRadius: 999,
    paddingLeft: 5,
    paddingRight: 14,
    paddingVertical: 5,
    marginTop: 4,
  },
  composerCamera: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#4b62f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerPlaceholder: { flex: 1, fontSize: 12.5, color: '#8e8e8e' },

  helper: { fontSize: 11.5, color: 'rgba(63,3,11,0.45)', lineHeight: 16 },
  errorText: { fontSize: 12, color: '#a3323f', lineHeight: 17 },
});
