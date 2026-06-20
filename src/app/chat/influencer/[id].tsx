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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import { api } from '@/lib/api';
import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Image } from 'expo-image';

export default function InfluencerChatConversationScreen() {
  const { id: routeId, name: routeName, avatar: routeAvatar } = useLocalSearchParams<{ id: string; name?: string; avatar?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuthStore();
  const currentUserId = session?.user?.id;

  const [roomId, setRoomId] = useState<string | null>(routeId.startsWith('bp_') ? null : routeId);
  const [roomName, setRoomName] = useState<string | null>(routeName || null);
  const [roomAvatar, setRoomAvatar] = useState<string | null>(routeAvatar || null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const listRef = useRef<FlatList>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Resolve room and metadata dynamically on mount
  useEffect(() => {
    let active = true;
    async function resolve() {
      try {
        setIsLoading(true);
        let resolvedId = routeId;
        
        const allRooms = await api.chat.rooms();
        
        if (routeId.startsWith('bp_')) {
          const foundRoom = allRooms.find((r: any) => r.brandId === routeId);
          if (foundRoom) {
            resolvedId = foundRoom.roomId;
            if (active) {
              setRoomId(foundRoom.roomId);
            }
          } else {
            console.warn("No active room found for brand profile:", routeId);
          }
        }

        // Fetch details from allRooms
        const found = allRooms.find((r: any) => r.roomId === resolvedId);
        if (found && active) {
          setRoomName(found.companyName);
          setRoomAvatar(found.logo);
        } else if (active) {
          if (!roomName && routeName) setRoomName(routeName);
          if (!roomAvatar && routeAvatar) setRoomAvatar(routeAvatar);
        }
      } catch (err) {
        console.error("Failed to resolve room details", err);
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
    let socket: WebSocket | null = null;
    let isMounted = true;

    function connect() {
      try {
        const token = session?.token;
        if (!token) return;

        const rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';
        const wsBaseUrl = rawApiUrl.replace(/^http/, 'ws');
        
        const activeProfileId = useProfilesStore.getState().activeInfluencerProfileId;
        const wsUrl = `${wsBaseUrl}/chat/ws/${currentRoomId}?token=${token}&activeProfileId=${activeProfileId || ''}`;

        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          console.log("Influencer WebSocket connected for room:", currentRoomId);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "message" && isMounted) {
              setMsgs((prev) => {
                if (prev.some((m) => m.id === data.message.id)) return prev;
                return [...prev, data.message];
              });
            } else if (data.type === "invite-status-update" && isMounted) {
              setMsgs((prev) =>
                prev.map((msg) =>
                  msg.inviteId === data.inviteId ? { ...msg, inviteStatus: data.status } : msg
                )
              );
            }
          } catch (err) {
            console.error("Error parsing WS message", err);
          }
        };

        socket.onerror = (e) => {
          console.warn("WebSocket error:", e);
        };

        socket.onclose = (e) => {
          console.log("WebSocket closed. Reconnecting in 3s...", e.reason);
          if (isMounted) {
            setTimeout(connect, 3000);
          }
        };
      } catch (err) {
        console.error("WS connection error", err);
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (socket) {
        socket.close();
      }
    };
  }, [roomId, session]);

  useEffect(() => {
    if (msgs.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [msgs]);

  const send = () => {
    const t = text.trim();
    if (!t || !roomId) return;

    const payload = {
      content: t,
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      setText('');
    } else {
      api.chat.send(roomId, t)
        .then((res: any) => {
          const activeInfluencerProfileId = useProfilesStore.getState().activeInfluencerProfileId;
          const activeProfile = useProfilesStore.getState().influencerProfiles.find(p => p.id === activeInfluencerProfileId);
          setMsgs((prev) => [
            ...prev,
            {
              id: res.id,
              content: res.content,
              createdAt: res.createdAt,
              senderId: currentUserId,
              senderName: activeProfile?.instagramHandle ? `@${activeProfile.instagramHandle}` : (session?.user?.name || "Me"),
              senderAvatar: activeProfile?.avatar || undefined,
            },
          ]);
          setText('');
        })
        .catch((err) => console.error("Error sending message via API", err));
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
    <KeyboardAvoidingView style={[styles.root, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/chat/influencer')} style={styles.backBtn} activeOpacity={0.8}>
          <Icon name="back" size={22} color={Colors.oxblood} />
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
                          <Icon name="pin" size={16} color={Colors.roseSoft} />
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
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
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
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    backgroundColor: 'rgba(244,236,228,0.92)', 
    borderBottomWidth: 0.5, 
    borderBottomColor: 'rgba(63,3,11,0.08)' 
  },
  backBtn: { width: 36, height: 36, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  convName: { fontWeight: '700', fontSize: 15.5, color: Colors.ink },
  onlineStatus: { fontSize: 11.5, fontWeight: '600', color: Colors.rose },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  messageList: { padding: 16 },
  msgRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8 },
  msgRowMe: { justifyContent: 'flex-end' },
  bubbleAvatarWrap: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden' },
  bubbleAvatar: { width: 32, height: 32 },
  bubbleContentContainer: { maxWidth: '80%', flexDirection: 'column' },
  bubbleContentContainerMe: { alignItems: 'flex-end' },
  bubbleContentContainerThem: { alignItems: 'flex-start' },
  senderLabel: { fontSize: 11, color: 'rgba(63,3,11,0.5)', fontWeight: '600', marginBottom: 2, marginLeft: 4 },

  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, ...Shadow.card, position: 'relative' },
  bubbleMe: { 
    backgroundColor: Colors.oxblood, 
    borderBottomRightRadius: 4, 
    shadowColor: Colors.oxblood,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1 
  },
  bubbleThem: { 
    backgroundColor: '#fff', 
    borderBottomLeftRadius: 4, 
    borderWidth: 1, 
    borderColor: 'rgba(63,3,11,0.06)' 
  },
  campaignBubble: { 
    width: 280, 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    borderBottomLeftRadius: 4, 
    borderBottomRightRadius: 4, 
    borderLeftWidth: 4, 
    borderLeftColor: Colors.rose,
    padding: 12
  },
  bubbleText: { fontSize: 14, lineHeight: 20, color: Colors.ink },
  bubbleTextMe: { color: Colors.cream },
  msgTime: { fontSize: 9, color: 'rgba(63,3,11,0.4)', alignSelf: 'flex-end', marginTop: 4 },
  msgTimeMe: { color: 'rgba(244,236,228,0.6)' },

  campaignCard: { padding: 2 },
  campaignCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  campaignLabel: { fontSize: 11, fontWeight: '700', color: Colors.rose, textTransform: 'uppercase', letterSpacing: 0.5 },
  campaignTitle: { fontSize: 15, fontWeight: '700', color: Colors.ink, marginBottom: 4 },
  campaignDesc: { fontSize: 12.5, color: 'rgba(63,3,11,0.6)', marginBottom: 10, lineHeight: 18 },
  campaignMetaRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: 'rgba(63,3,11,0.08)', paddingTop: 8, marginTop: 4 },
  metaLabel: { fontSize: 10, color: 'rgba(63,3,11,0.4)', textTransform: 'uppercase', fontWeight: '600' },
  metaValue: { fontSize: 13.5, fontWeight: '700', color: Colors.oxblood, marginTop: 1 },
  
  actionContainer: { marginTop: 12, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: 'rgba(63,3,11,0.08)' },
  btnRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  declineBtn: { backgroundColor: 'rgba(63,3,11,0.06)', borderWidth: 1, borderColor: 'rgba(63,3,11,0.1)' },
  declineBtnText: { color: Colors.ink, fontSize: 13, fontWeight: '600' },
  acceptBtn: { backgroundColor: Colors.oxblood },
  acceptBtnText: { color: Colors.cream, fontSize: 13, fontWeight: '700' },
  
  statusBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: 'rgba(63,3,11,0.05)', alignItems: 'center' },
  statusBadgeText: { fontSize: 12, fontWeight: '600', color: 'rgba(63,3,11,0.5)' },
  statusAccepted: { backgroundColor: 'rgba(62,201,122,0.12)' },
  statusAcceptedText: { color: '#279a55', fontWeight: '700' },
  statusDeclined: { backgroundColor: 'rgba(235,94,85,0.12)' },
  statusDeclinedText: { color: '#d93e36', fontWeight: '700' },

  inputBar: { flexShrink: 0, paddingHorizontal: 14, paddingTop: 8, backgroundColor: 'rgba(244,236,228,0.95)', flexDirection: 'row', alignItems: 'center', gap: 9 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, paddingLeft: 16, paddingRight: 4, paddingVertical: 4, ...Shadow.card, borderWidth: 1, borderColor: 'rgba(63,3,11,0.05)' },
  input: { 
    flex: 1, 
    fontSize: 14.5, 
    color: Colors.ink, 
    fontFamily: FontFamily.sansMedium, 
    maxHeight: 100,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  sendBtn: { width: 36, height: 36, borderRadius: 99, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
