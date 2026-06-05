import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { chats, campaigns } from '@/data/mock';
import type { ChatMessage } from '@/types';
import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';

export default function ChatConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const conv = chats.find((c) => c.id === id) ?? chats[0];
  const campaign = campaigns.find((c) => c.id === id);

  const [msgs, setMsgs] = useState<ChatMessage[]>(conv.thread);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [msgs]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { me: true, t, time: 'now' }]);
    setText('');
    setTimeout(() => {
      setMsgs((m) => [...m, { me: false, t: 'Amazing — sending the full brief & moodboard your way now ✨', time: 'now' }]);
    }, 1100);
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Icon name="back" size={22} color={Colors.oxblood} />
        </TouchableOpacity>
        <View style={{ position: 'relative' }}>
          <PlaceholderImage tone={conv.tone} height={40} width={40} borderRadius={99} />
          {conv.online && <View style={styles.onlineDot} />}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={styles.convName} numberOfLines={1}>{conv.name}</Text>
            {conv.verified && <Icon name="verified" size={14} color={Colors.rose} />}
          </View>
          <Text style={[styles.onlineStatus, { color: conv.online ? '#3ec97a' : 'rgba(63,3,11,0.45)' }]}>
            {conv.online ? 'Active now' : 'Active 1h ago'}
          </Text>
        </View>
        <View style={styles.moreBtn}><Icon name="more" size={20} color={Colors.oxblood} /></View>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={msgs}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Pinned campaign */}
            {campaign && (
              <View style={styles.pinnedCard}>
                <Icon name="pin" size={18} color={Colors.roseSoft} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pinnedLabel}>Campaign</Text>
                  <Text style={styles.pinnedTitle}>{campaign.title}</Text>
                </View>
                <Text style={styles.pinnedBudget}>{campaign.budget}</Text>
              </View>
            )}
            <Text style={styles.dateSep}>Today</Text>
          </>
        }
        renderItem={({ item: m }) => (
          <View style={[styles.msgRow, m.me && styles.msgRowMe]}>
            <View style={[styles.bubble, m.me ? styles.bubbleMe : styles.bubbleThem]}>
              <Text style={[styles.bubbleText, m.me && styles.bubbleTextMe]}>{m.t}</Text>
            </View>
          </View>
        )}
      />

      {/* Input */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.attachBtn} activeOpacity={0.8}>
          <Icon name="attach" size={20} color={Colors.oxblood} />
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Message…"
            placeholderTextColor="rgba(63,3,11,0.4)"
            multiline
            returnKeyType="send"
            onSubmitEditing={send}
          />
          <TouchableOpacity onPress={send} activeOpacity={0.85}>
            <GradientView variant="rose" style={styles.sendBtn}>
              <Icon name="send" size={18} color="#fff" />
            </GradientView>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(244,236,228,0.92)', borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.08)' },
  backBtn: { width: 36, height: 36, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: 99, backgroundColor: '#3ec97a', borderWidth: 2, borderColor: Colors.creamLite },
  convName: { fontWeight: '700', fontSize: 15.5, color: Colors.ink },
  onlineStatus: { fontSize: 11.5, fontWeight: '600' },
  moreBtn: { width: 38, height: 38, borderRadius: 99, backgroundColor: 'rgba(63,3,11,0.06)', alignItems: 'center', justifyContent: 'center' },

  messageList: { padding: 16, gap: 10 },
  pinnedCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.oxblood, borderRadius: 16, padding: 12, marginBottom: 4 },
  pinnedLabel: { fontSize: 11, color: Colors.roseSoft, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  pinnedTitle: { fontSize: 13.5, fontWeight: '600', color: Colors.cream },
  pinnedBudget: { fontFamily: FontFamily.serif, fontSize: 16, fontWeight: '700', color: Colors.cream, flexShrink: 0 },
  dateSep: { textAlign: 'center', fontSize: 11, color: 'rgba(63,3,11,0.4)', fontWeight: '600', marginVertical: 4 },
  msgRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  msgRowMe: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', padding: 10, borderRadius: 18, ...Shadow.card },
  bubbleMe: { backgroundColor: Colors.oxblood, borderBottomRightRadius: 5, shadowOpacity: 0 },
  bubbleThem: { backgroundColor: '#fff', borderBottomLeftRadius: 5 },
  bubbleText: { fontSize: 14, lineHeight: 20, color: Colors.ink },
  bubbleTextMe: { color: Colors.cream },

  inputBar: { flexShrink: 0, paddingHorizontal: 14, paddingTop: 8, backgroundColor: 'rgba(244,236,228,0.95)', flexDirection: 'row', alignItems: 'center', gap: 9 },
  attachBtn: { width: 40, height: 40, borderRadius: 99, backgroundColor: 'rgba(63,3,11,0.06)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 999, paddingLeft: 16, paddingRight: 4, paddingVertical: 4, ...Shadow.card },
  input: { flex: 1, fontSize: 14.5, color: Colors.ink, fontFamily: FontFamily.sansMedium, maxHeight: 100 },
  sendBtn: { width: 36, height: 36, borderRadius: 99, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
