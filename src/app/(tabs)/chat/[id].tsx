import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { BlurView } from 'expo-blur';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import { api } from '@/lib/api';
import { getToken } from '@/lib/storage';
import { GradientView } from '@/components/ui/gradient-view';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Image } from 'expo-image';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, Navigation03Icon, Pin02FreeIcons } from '@hugeicons/core-free-icons';

export default function InfluencerChatConversationScreen() {
  const { id: routeId, name: routeName, avatar: routeAvatar } = useLocalSearchParams<{ id: string; name?: string; avatar?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuthStore();
  const currentUserId = session?.user?.id;


  const [roomId, setRoomId] = useState<string | null>(routeId && typeof routeId === 'string' && routeId.startsWith('bp_') ? null : (routeId || null));
  const [roomName, setRoomName] = useState<string | null>(routeName || null);
  const [roomAvatar, setRoomAvatar] = useState<string | null>(routeAvatar || null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(!!routeId);

  const listRef = useRef<FlatList>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resolve room and metadata dynamically on mount
  useEffect(() => {
    if (!routeId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    async function resolve() {
      try {
        setIsLoading(true);
        let resolvedId = routeId;

        const allRooms = await api.chat.rooms();

        if (typeof routeId === 'string' && routeId.startsWith('bp_')) {
          const foundRoom = allRooms.find((r: any) => r.brandId === routeId);
          if (foundRoom) {
            resolvedId = foundRoom.roomId;
            if (active) {
              setRoomId(foundRoom.roomId);
            }
          } else {
            console.warn('No chat room found for brand profile:', routeId);
            if (active) {
              if (routeName) setRoomName(routeName);
              if (routeAvatar) setRoomAvatar(routeAvatar);
            }
            return;
          }
        }

        const found = allRooms.find((r: any) => r.roomId === resolvedId);
        if (found && active) {
          setRoomName(found.companyName || routeName || 'Brand');
          setRoomAvatar(found.logo || routeAvatar || null);
        } else if (active) {
          // Fallback to route params
          if (routeName) setRoomName(routeName);
          if (routeAvatar) setRoomAvatar(routeAvatar);
        }
      } catch (err) {
        console.error('Failed to resolve room details', err);
        // Graceful fallback on error
        if (active) {
          if (routeName) setRoomName(routeName);
          if (routeAvatar) setRoomAvatar(routeAvatar);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }
    resolve();
    return () => {
      active = false;
    };
  }, [routeId]);

  // Fetch initial messages
  useEffect(() => {
    if (!roomId) return;
    const currentRoomId = roomId;
    let active = true;
    async function load() {
      try {
        const data = await api.chat.messages(currentRoomId);
        if (active) {
          setMsgs(data);
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [roomId]);

  // Connect to WebSocket
  useEffect(() => {
    if (!roomId) return;
    const currentRoomId = roomId;
    let isMounted = true;

    async function connect() {
      try {
        const token = await getToken();
        if (!token || !isMounted) return;

        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }

        if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
          wsRef.current.onclose = null;
          wsRef.current.close();
        }

        const rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';
        const wsBaseUrl = rawApiUrl.replace(/^https/, 'wss').replace(/^http(?!s)/, 'ws');

        const activeProfileId = useProfilesStore.getState().activeInfluencerProfileId;
        const wsUrl = `${wsBaseUrl}/chat/ws/${currentRoomId}?token=${encodeURIComponent(token)}&activeProfileId=${encodeURIComponent(activeProfileId || '')}`;

        console.log('[WS] Connecting to:', wsUrl.replace(token, '***'));

        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          console.log('[WS] Influencer connected for room:', currentRoomId);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'message' && isMounted) {
              setMsgs((prev) => {
                if (prev.some((m) => m.id === data.message.id)) return prev;
                return [...prev, data.message];
              });
            } else if (data.type === 'invite-status-update' && isMounted) {
              setMsgs((prev) =>
                prev.map((msg) =>
                  msg.inviteId === data.inviteId ? { ...msg, inviteStatus: data.status } : msg
                )
              );
            }
          } catch (err) {
            console.error('[WS] Error parsing message:', err);
          }
        };

        socket.onclose = (e) => {
          wsRef.current = null;
          if (isMounted && e.code !== 1000) {
            reconnectTimerRef.current = setTimeout(() => {
              if (isMounted) connect();
            }, 3000);
          }
        };
      } catch (err) {
        if (isMounted) {
          reconnectTimerRef.current = setTimeout(() => {
            if (isMounted) connect();
          }, 3000);
        }
      }
    }

    connect();

    return () => {
      isMounted = false;
      // Cancel pending reconnect timer
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      // Close socket cleanly (code 1000 = normal closure, won't trigger reconnect)
      if (wsRef.current) {
        wsRef.current.onclose = null; // detach handler to prevent reconnect
        wsRef.current.close(1000, 'component unmounted');
        wsRef.current = null;
      }
    };
  }, [roomId]);

  useEffect(() => {
    if (msgs.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [msgs]);

  const send = () => {
    const t = text.trim();
    if (!t || !roomId) return;

    const payload = { content: t };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Clear text immediately for instant UX feedback
      setText('');
      wsRef.current.send(JSON.stringify(payload));
    } else {
      // HTTP fallback — optimistically clear and restore on error
      setText('');
      const activeInfluencerProfileId = useProfilesStore.getState().activeInfluencerProfileId;
      const activeProfile = useProfilesStore.getState().influencerProfiles.find(p => p.id === activeInfluencerProfileId);
      api.chat.send(roomId, t)
        .then((res: any) => {
          setMsgs((prev) => [
            ...prev,
            {
              id: res.id,
              content: res.content,
              createdAt: res.createdAt,
              senderId: currentUserId,
              senderName: activeProfile?.instagramHandle ? `@${activeProfile.instagramHandle}` : (session?.user?.name || 'Me'),
              senderAvatar: activeProfile?.avatar || undefined,
            },
          ]);
        })
        .catch((err) => {
          console.error('Error sending message via API', err);
          // Restore text so user can retry
          setText(t);
        });
    }
  };

  const respondToInvite = async (inviteId: string, status: 'accepted' | 'declined') => {
    try {
      await api.chat.respondInvite(inviteId, status);

      setMsgs((prev) =>
        prev.map((msg) =>
          msg.inviteId === inviteId ? { ...msg, inviteStatus: status } : msg
        )
      );

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "status-update",
          inviteId,
          status,
        }));
      }
    } catch (err) {
      console.error("Failed to respond to invite", err);
    }
  };

  // Preprocess messages to group consecutive ones from the same sender
  const processedMsgs = msgs.map((m, index) => {
    const prevMsg = msgs[index - 1];
    const isMe = m.senderId === currentUserId;
    const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== m.senderId);
    const isGroupContinuation = prevMsg && prevMsg.senderId === m.senderId;

    return {
      ...m,
      showAvatar,
      isGroupContinuation,
    };
  });

  return (
    <KeyboardAvoidingView style={styles.root} behavior='padding'>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {Platform.OS !== 'web' ? (
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(244,236,228,0.96)' }]} />
        )}
        <TouchableOpacity onPress={() => router.replace('/chat')} style={styles.backBtn} activeOpacity={0.8}>
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={24} color={Colors.oxblood}
            strokeWidth={2}
          />
        </TouchableOpacity>
        <View style={{ position: 'relative' }}>
          {roomAvatar ? (
            <Image source={{ uri: roomAvatar }} style={styles.headerAvatar} />
          ) : (
            <PlaceholderImage tone="rose" height={40} width={40} borderRadius={99} />
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.convName} numberOfLines={1}>{roomName || "Brand Support"}</Text>
          <Text style={styles.onlineStatus}>Active Chat</Text>
        </View>
      </View>

      {/* Messages list */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.rose} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={processedMsgs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: m }) => {
            const isMe = m.senderId === currentUserId;
            const isCampaign = !!m.campaignId;

            return (
              <View style={[
                styles.msgRow,
                isMe && styles.msgRowMe,
                { marginTop: m.isGroupContinuation ? 2 : 12 }
              ]}>
                {!isMe && (
                  <View style={styles.bubbleAvatarWrap}>
                    {m.showAvatar ? (
                      m.senderAvatar ? (
                        <Image source={{ uri: m.senderAvatar }} style={styles.bubbleAvatar} />
                      ) : (
                        <PlaceholderImage tone="rose" height={32} width={32} borderRadius={99} />
                      )
                    ) : null}
                  </View>
                )}
                <View style={[styles.bubbleContentContainer, isMe ? styles.bubbleContentContainerMe : styles.bubbleContentContainerThem]}>
                  <View style={[
                    styles.bubble,
                    isMe ? styles.bubbleMe : styles.bubbleThem,
                    isCampaign && styles.campaignBubble
                  ]}>
                    {isCampaign ? (
                      <View style={styles.campaignCard}>
                        <View style={styles.campaignCardHeader}>
                          <HugeiconsIcon icon={Pin02FreeIcons} size={16} color={Colors.roseSoft} strokeWidth={2} />
                          <Text style={styles.campaignLabel}>Campaign Invitation</Text>
                        </View>
                        <Text style={styles.campaignTitle}>{m.campaignTitle}</Text>
                        {m.campaignDescription && (
                          <Text style={styles.campaignDesc} numberOfLines={2}>
                            {m.campaignDescription}
                          </Text>
                        )}

                        <View style={styles.campaignMetaRow}>
                          <View>
                            <Text style={styles.metaLabel}>Budget</Text>
                            <Text style={styles.metaValue}>₹{(m.campaignBudget / 100).toLocaleString()}</Text>
                          </View>
                        </View>

                        {/* Respond Controls (Only shown for Influencer when they receive an invite) */}
                        {m.inviteId ? (
                          <View style={styles.actionContainer}>
                            {m.inviteStatus === 'pending' ? (
                              !isMe ? (
                                <View style={styles.btnRow}>
                                  <TouchableOpacity
                                    style={[styles.actionBtn, styles.declineBtn]}
                                    onPress={() => respondToInvite(m.inviteId, 'declined')}
                                  >
                                    <Text style={styles.declineBtnText}>Decline</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={[styles.actionBtn, styles.acceptBtn]}
                                    onPress={() => respondToInvite(m.inviteId, 'accepted')}
                                  >
                                    <Text style={styles.acceptBtnText}>Accept</Text>
                                  </TouchableOpacity>
                                </View>
                              ) : (
                                <View style={styles.statusBadge}>
                                  <Text style={styles.statusBadgeText}>Invitation Pending</Text>
                                </View>
                              )
                            ) : (
                              <View style={[
                                styles.statusBadge,
                                m.inviteStatus === 'accepted' ? styles.statusAccepted : styles.statusDeclined
                              ]}>
                                <Text style={[
                                  styles.statusBadgeText,
                                  m.inviteStatus === 'accepted' ? styles.statusAcceptedText : styles.statusDeclinedText
                                ]}>
                                  {m.inviteStatus === 'accepted' ? 'Accepted ✓' : 'Declined ✕'}
                                </Text>
                              </View>
                            )}
                          </View>
                        ) : null}
                      </View>
                    ) : (
                      <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{m.content}</Text>
                    )}
                    <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Input bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 12 }]}>
        {Platform.OS !== 'web' ? (
          <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill]} />
        )}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Message…"
            placeholderTextColor="rgba(63,3,11,0.4)"
            multiline
            returnKeyType="next"
            onSubmitEditing={send}
          />
          <TouchableOpacity onPress={send} activeOpacity={0.85}>
            <GradientView variant="rose" style={styles.sendBtn}>
              <HugeiconsIcon icon={Navigation03Icon} size={18} color="#ffffff" strokeWidth={2.5} />
            </GradientView>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Platform.OS === 'web' ? 'rgba(244,236,228,0.96)' : 'rgba(244,236,228,0.6)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.08)',
    overflow: 'hidden',
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(63,3,11,0.04)' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  convName: { fontFamily: FontFamily.sans, fontSize: 16, color: Colors.ink, fontWeight: '700' },
  onlineStatus: { fontFamily: FontFamily.sansMedium, fontSize: 11.5, color: Colors.rose, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  messageList: { paddingHorizontal: 16, paddingVertical: 12 },
  msgRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8 },
  msgRowMe: { justifyContent: 'flex-end' },
  bubbleAvatarWrap: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden' },
  bubbleAvatar: { width: 32, height: 32 },
  bubbleContentContainer: { maxWidth: '82%', flexDirection: 'column' },
  bubbleContentContainerMe: { alignItems: 'flex-end' },
  bubbleContentContainerThem: { alignItems: 'flex-start' },
  senderLabel: { fontSize: 11, color: 'rgba(63,3,11,0.5)', fontWeight: '600', marginBottom: 2, marginLeft: 4 },

  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, position: 'relative' },
  bubbleMe: {
    backgroundColor: Colors.oxblood,
    borderBottomRightRadius: 4,
    shadowColor: Colors.oxblood,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1.5,
  },
  bubbleThem: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  campaignBubble: {
    width: 290,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.rose,
    padding: 14,
    shadowColor: Colors.oxblood,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  bubbleText: { fontSize: 14.5, lineHeight: 20, color: Colors.ink, fontFamily: FontFamily.sansMedium },
  bubbleTextMe: { color: '#ffffff' },
  msgTime: { fontSize: 9.5, color: 'rgba(63,3,11,0.4)', alignSelf: 'flex-end', marginTop: 4, fontFamily: FontFamily.sansRegular },
  msgTimeMe: { color: 'rgba(244,236,228,0.6)' },

  campaignCard: { padding: 2 },
  campaignCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  campaignLabel: { fontSize: 10.5, fontWeight: '700', color: Colors.rose, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: FontFamily.sans },
  campaignTitle: { fontSize: 16, fontWeight: '700', color: Colors.ink, marginBottom: 6, fontFamily: FontFamily.sans },
  campaignDesc: { fontSize: 13, color: 'rgba(63,3,11,0.6)', marginBottom: 12, lineHeight: 18, fontFamily: FontFamily.sansRegular },
  campaignMetaRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: 'rgba(63,3,11,0.08)', paddingTop: 10, marginTop: 4 },
  metaLabel: { fontSize: 9.5, color: 'rgba(63,3,11,0.4)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.5, fontFamily: FontFamily.sans },
  metaValue: { fontSize: 14.5, fontWeight: '700', color: Colors.oxblood, marginTop: 2, fontFamily: FontFamily.sans },

  actionContainer: { marginTop: 12, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: 'rgba(63,3,11,0.08)' },
  btnRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  declineBtn: { backgroundColor: 'rgba(63,3,11,0.04)', borderWidth: 1, borderColor: 'rgba(63,3,11,0.08)' },
  declineBtnText: { color: Colors.ink, fontSize: 13, fontWeight: '700', fontFamily: FontFamily.sansMedium },
  acceptBtn: { backgroundColor: Colors.oxblood },
  acceptBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700', fontFamily: FontFamily.sans },

  statusBadge: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(63,3,11,0.04)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 },
  statusBadgeText: { fontSize: 12, fontWeight: '700', color: 'rgba(63,3,11,0.5)', fontFamily: FontFamily.sansMedium },
  statusAccepted: { backgroundColor: 'rgba(42,122,90,0.1)' },
  statusAcceptedText: { color: Colors.green, fontWeight: '700' },
  statusDeclined: { backgroundColor: 'rgba(180,106,116,0.1)' },
  statusDeclinedText: { color: Colors.rose, fontWeight: '700' },

  inputBar: {
    flexShrink: 0,
    paddingHorizontal: 14,
    paddingTop: 8,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.7)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(63,3,11,0.08)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 9,
    overflow: 'hidden',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingTop: 6,
    paddingBottom: 6,
    ...Shadow.card,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.06)',
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 8,
    textAlignVertical: 'center',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
