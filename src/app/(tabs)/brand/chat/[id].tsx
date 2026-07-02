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
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import { api } from '@/lib/api';
import { getToken } from '@/lib/storage';
import { GradientView } from '@/components/ui/gradient-view';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Image } from 'expo-image';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  Attachment01FreeIcons,
  Navigation03Icon,
  Pin02FreeIcons,
  CheckIcon
} from '@hugeicons/core-free-icons';

export default function BrandChatConversationScreen() {
  const { id: routeId, name: routeName, avatar: routeAvatar } = useLocalSearchParams<{ id: string; name?: string; avatar?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuthStore();
  const currentUserId = session?.user?.id;


  const [roomId, setRoomId] = useState<string | null>(routeId && typeof routeId === 'string' && routeId.startsWith('ip_') ? null : (routeId || null));
  const [roomName, setRoomName] = useState<string | null>(routeName || null);
  const [roomAvatar, setRoomAvatar] = useState<string | null>(routeAvatar || null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(!!routeId);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

  const listRef = useRef<FlatList>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

        if (active && typeof routeId === 'string') {
          if (routeId.startsWith('ip_')) {
            // Create (or get existing) room between this brand profile and the influencer
            const room = await api.chat.createRoom(routeId);
            resolvedId = room.id;
            setRoomId(room.id);
            if (room.name) setRoomName(room.name);
            if (room.avatar) setRoomAvatar(room.avatar);
          } else {
            setRoomId(routeId);
          }
        }

        // Fetch rooms to lookup the counterpart's display info
        const allRooms = await api.chat.rooms();
        const found = allRooms.find((r: any) => r.roomId === resolvedId);
        if (found && active) {
          setRoomName(found.instagramHandle ? `@${found.instagramHandle}` : (found.name || routeName || 'Creator'));
          setRoomAvatar(found.avatar || routeAvatar || null);
        } else if (active) {
          // Fallback to route params if room not in list yet
          if (routeName) setRoomName(routeName);
          if (routeAvatar) setRoomAvatar(routeAvatar);
        }
      } catch (err) {
        console.error('Failed to resolve room details', err);
        // Fallback to route params on error
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
        // Read token async from SecureStore — same path as REST API calls.
        // Using session?.token from Zustand is unreliable on mobile because
        // the store may not be populated yet when this effect fires.
        const token = await getToken();
        if (!token || !isMounted) return;

        // Cancel any pending reconnect timer before creating a new socket
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }

        // Close any existing socket before reconnecting
        if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
          wsRef.current.onclose = null; // prevent reconnect loop from old socket
          wsRef.current.close();
        }

        const rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';
        // Convert http(s):// → ws(s)://
        const wsBaseUrl = rawApiUrl.replace(/^https/, 'wss').replace(/^http(?!s)/, 'ws');

        const activeProfileId = useProfilesStore.getState().activeBrandProfileId;
        const wsUrl = `${wsBaseUrl}/chat/ws/${currentRoomId}?token=${encodeURIComponent(token)}&activeProfileId=${encodeURIComponent(activeProfileId || '')}`;

        console.log('[WS] Brand connecting to:', wsUrl.replace(token, '***'));

        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          console.log('[WS] Brand connected for room:', currentRoomId);
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

        socket.onerror = (e) => {
          console.warn('[WS] Error:', e);
        };

        socket.onclose = (e) => {
          console.log('[WS] Closed. Code:', e.code, 'Reason:', e.reason);
          wsRef.current = null;
          // Only reconnect if still mounted and it wasn't a clean intentional close
          if (isMounted && e.code !== 1000) {
            console.log('[WS] Scheduling reconnect in 3s...');
            reconnectTimerRef.current = setTimeout(() => {
              if (isMounted) connect();
            }, 3000);
          }
        };
      } catch (err) {
        console.error('[WS] Connection error:', err);
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
      const activeBrandProfileId = useProfilesStore.getState().activeBrandProfileId;
      const activeProfile = useProfilesStore.getState().brandProfiles.find(p => p.id === activeBrandProfileId);
      api.chat.send(roomId, t)
        .then((res: any) => {
          setMsgs((prev) => [
            ...prev,
            {
              id: res.id,
              content: res.content,
              createdAt: res.createdAt,
              senderId: currentUserId,
              senderName: activeProfile?.companyName || session?.user?.name || 'Me',
              senderAvatar: activeProfile?.logo || undefined,
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

  const openCampaignPicker = async () => {
    try {
      setShowCampaignModal(true);
      setIsLoadingCampaigns(true);
      const data = (await api.campaigns.list()) as any[];
      setCampaigns(data.filter((c: any) => c.status === 'active'));
    } catch (err) {
      console.error("Failed to load campaigns", err);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  const inviteCampaign = (campaignId: string) => {
    if (!roomId) return;
    const payload = {
      content: "I've invited you to collaborate on our campaign!",
      campaignId,
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      setShowCampaignModal(false);
    } else {
      api.chat.send(roomId, payload.content, campaignId)
        .then(() => {
          setShowCampaignModal(false);
          api.chat.messages(roomId).then(setMsgs);
        })
        .catch((err) => console.error("Failed to send campaign invite", err));
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
    <KeyboardAvoidingView style={styles.root} behavior="padding" >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {Platform.OS !== 'web' ? (
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(244,236,228,0.96)' }]} />
        )}
        <TouchableOpacity onPress={() => router.replace('/brand/chat' as any)} style={styles.backBtn} activeOpacity={0.8}>
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={24}
            color={Colors.oxblood}
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
          <Text style={styles.convName} numberOfLines={1}>{roomName || "Creator"}</Text>
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
            const isCollabAccepted = !!m.campaignId && m.content && m.content.includes("Collaboration accepted!");
            const isCampaign = !!m.campaignId && !isCollabAccepted && !(m.content && m.content.startsWith("Application Proposal:"));

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
                    (isCampaign || isCollabAccepted) && styles.campaignBubble
                  ]}>
                    {isCollabAccepted ? (
                      <View style={styles.campaignCard}>
                        <View style={styles.campaignCardHeader}>
                          <HugeiconsIcon icon={CheckIcon} size={16} color={Colors.green} strokeWidth={2} />
                          <Text style={[styles.campaignLabel, { color: Colors.green }]}>Collaboration Accepted</Text>
                        </View>
                        <Text style={styles.campaignTitle}>{m.campaignTitle}</Text>
                        <Text style={[styles.campaignDesc, { color: Colors.ink, marginTop: 8 }]}>
                          {m.content}
                        </Text>
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: Colors.oxblood, marginTop: 12, width: '100%', height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }]}
                          onPress={() => {
                            router.push({
                              pathname: '/brand/campaign/[id]' as any,
                              params: { id: m.campaignId }
                            });
                          }}
                        >
                          <Text style={{ color: Colors.cream, fontWeight: '700', fontSize: 13 }}>
                            View Collaboration Steps
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : isCampaign ? (
                      <View style={styles.campaignCard}>
                        <View style={styles.campaignCardHeader}>
                          <HugeiconsIcon
                            icon={Pin02FreeIcons}
                            size={16}
                            color={Colors.roseSoft}
                          />
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

                        {/* Brand views the status badge but has no action buttons */}
                        {m.inviteId ? (
                          <View style={styles.actionContainer}>
                            <View style={[
                              styles.statusBadge,
                              m.inviteStatus === 'accepted' ? styles.statusAccepted :
                                m.inviteStatus === 'declined' ? styles.statusDeclined : styles.statusPending
                            ]}>
                              <Text style={[
                                styles.statusBadgeText,
                                m.inviteStatus === 'accepted' ? styles.statusAcceptedText :
                                  m.inviteStatus === 'declined' ? styles.statusDeclinedText : styles.statusPendingText
                              ]}>
                                {m.inviteStatus === 'accepted' ? 'Accepted ✓' :
                                  m.inviteStatus === 'declined' ? 'Declined ✕' : 'Invitation Pending'}
                              </Text>
                            </View>
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
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 12 }]}>
        {Platform.OS !== 'web' ? (
          <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.96)' }]} />
        )}
        <TouchableOpacity onPress={openCampaignPicker} style={styles.attachBtn} activeOpacity={0.8}>
          <HugeiconsIcon
            icon={Attachment01FreeIcons}
            size={20}
            color={Colors.oxblood}
          />
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
              <HugeiconsIcon
                icon={Navigation03Icon}
                size={18}
                color={Colors.cream}
              />
            </GradientView>
          </TouchableOpacity>

        </View>
      </View>
      {/* Campaign Picker Bottom Sheet */}
      <BottomSheet
        visible={showCampaignModal}
        title="Select Campaign"
        icon="briefcase"
        onClose={() => setShowCampaignModal(false)}
        snapPoints={['55%', '90%']}
      >
        {isLoadingCampaigns ? (
          <ActivityIndicator style={{ margin: 40 }} size="large" color={Colors.rose} />
        ) : campaigns.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active campaigns found.</Text>
          </View>
        ) : (
          <View style={styles.campaignListContainer}>
            {campaigns.map((item) => (
              <View key={item.id} style={styles.campaignItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.campaignItemTitle}>{item.title}</Text>
                  <Text style={styles.campaignItemBudget}>Budget: ₹{(item.budget / 100).toLocaleString()}</Text>
                </View>
                <TouchableOpacity
                  style={styles.campaignInviteBtn}
                  onPress={() => inviteCampaign(item.id)}
                >
                  <Text style={styles.campaignInviteBtnText}>Invite</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </BottomSheet>
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
  inviteHeaderBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.oxblood },
  inviteHeaderBtnText: { color: Colors.cream, fontSize: 12, fontWeight: '700', fontFamily: FontFamily.sans },
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
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statusBadge: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(63,3,11,0.04)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 },
  statusBadgeText: { fontSize: 12, fontWeight: '700', color: 'rgba(63,3,11,0.5)', fontFamily: FontFamily.sansMedium },
  statusAccepted: { backgroundColor: 'rgba(42,122,90,0.1)' },
  statusAcceptedText: { color: Colors.green, fontWeight: '700' },
  statusDeclined: { backgroundColor: 'rgba(180,106,116,0.1)' },
  statusDeclinedText: { color: Colors.rose, fontWeight: '700' },
  statusPending: { backgroundColor: 'rgba(63,3,11,0.04)' },
  statusPendingText: { color: 'rgba(63,3,11,0.5)', fontWeight: '700' },

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
  attachBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(63,3,11,0.04)', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end', marginBottom: 4 },
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
    borderColor: 'rgba(63,3,11,0.06)'
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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '75%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.ink },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: 'rgba(63,3,11,0.5)', fontSize: 14 },
  campaignListContainer: { gap: 12, paddingBottom: 20 },
  campaignItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 12, backgroundColor: 'rgba(63,3,11,0.03)', borderWidth: 1, borderColor: 'rgba(63,3,11,0.06)' },
  campaignItemTitle: { fontSize: 14.5, fontWeight: '700', color: Colors.ink },
  campaignItemBudget: { fontSize: 12, color: Colors.rose, fontWeight: '600', marginTop: 2 },
  campaignInviteBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, backgroundColor: Colors.oxblood },
  campaignInviteBtnText: { color: Colors.cream, fontSize: 13, fontWeight: '700' },
});
