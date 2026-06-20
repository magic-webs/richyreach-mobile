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
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';

export default function ChatConversationScreen() {
  const { id, name, avatar } = useLocalSearchParams<{ id: string; name?: string; avatar?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, role } = useAuthStore();
  const currentUserId = session?.user?.id;

  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  
  const listRef = useRef<FlatList>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch initial messages
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setIsLoading(true);
        const data = await api.chat.messages(id);
        if (active) {
          setMsgs(data);
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  // Connect to WebSocket Durable Object
  useEffect(() => {
    let socket: WebSocket | null = null;
    let isMounted = true;

    function connect() {
      try {
        const token = session?.token;
        if (!token) return;

        // Construct WebSocket url
        const rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';
        const wsBaseUrl = rawApiUrl.replace(/^http/, 'ws');
        const wsUrl = `${wsBaseUrl}/chat/ws/${id}?token=${token}`;

        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          console.log("WebSocket connected for room:", id);
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
  }, [id, session]);

  useEffect(() => {
    if (msgs.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [msgs]);

  const send = () => {
    const t = text.trim();
    if (!t) return;

    const payload = {
      content: t,
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      setText('');
    } else {
      // Fallback
      api.chat.send(id, t)
        .then((res: any) => {
          setMsgs((prev) => [
            ...prev,
            {
              id: res.id,
              content: res.content,
              createdAt: res.createdAt,
              senderId: currentUserId,
              senderName: session?.user?.name || "Me",
              senderAvatar: undefined,
            },
          ]);
          setText('');
        })
        .catch((err) => console.error("Error sending via fallback API", err));
    }
  };

  // Open Campaign Picker Modal
  const openCampaignPicker = async () => {
    try {
      setShowCampaignModal(true);
      setIsLoadingCampaigns(true);
      const data = (await api.campaigns.list()) as any[];
      // Only list active campaigns
      setCampaigns(data.filter((c: any) => c.status === 'active'));
    } catch (err) {
      console.error("Failed to load campaigns", err);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  // Invite Selected Campaign on Chat
  const inviteCampaign = (campaignId: string) => {
    const payload = {
      content: "I've invited you to collaborate on our campaign!",
      campaignId,
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      setShowCampaignModal(false);
    } else {
      // Fallback
      api.chat.send(id, payload.content, campaignId)
        .then(() => {
          setShowCampaignModal(false);
          // Reload messages
          api.chat.messages(id).then(setMsgs);
        })
        .catch((err) => console.error("Failed to send campaign invite", err));
    }
  };

  // Respond to Campaign Invitation (Influencer)
  const respondToInvite = async (inviteId: string, status: 'accepted' | 'declined') => {
    try {
      await api.chat.respondInvite(inviteId, status);
      
      // Update locally
      setMsgs((prev) =>
        prev.map((msg) =>
          msg.inviteId === inviteId ? { ...msg, inviteStatus: status } : msg
        )
      );

      // Broadcast update over WebSocket
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

  return (
    <KeyboardAvoidingView style={[styles.root, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Icon name="back" size={22} color={Colors.oxblood} />
        </TouchableOpacity>
        <View style={{ position: 'relative' }}>
          <PlaceholderImage tone="rose" height={40} width={40} borderRadius={99} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.convName} numberOfLines={1}>{name || "Support Room"}</Text>
          <Text style={styles.onlineStatus}>Active Chat</Text>
        </View>
        {role === 'brand' && (
          <TouchableOpacity onPress={openCampaignPicker} style={styles.inviteHeaderBtn} activeOpacity={0.8}>
            <Text style={styles.inviteHeaderBtnText}>Invite Campaign</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Messages list */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.rose} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: m }) => {
            const isMe = m.senderId === currentUserId;
            const isCampaign = !!m.campaignId;

            return (
              <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
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

                      {/* Respond Controls */}
                      {m.inviteId ? (
                        <View style={styles.actionContainer}>
                          {m.inviteStatus === 'pending' ? (
                            role === 'influencer' && !isMe ? (
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
            );
          }}
        />
      )}

      {/* Input bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        {role === 'brand' && (
          <TouchableOpacity onPress={openCampaignPicker} style={styles.attachBtn} activeOpacity={0.8}>
            <Icon name="attach" size={20} color={Colors.oxblood} />
          </TouchableOpacity>
        )}
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

      {/* Campaign Picker Modal */}
      <Modal visible={showCampaignModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Campaign</Text>
              <TouchableOpacity onPress={() => setShowCampaignModal(false)}>
                <Icon name="close" size={24} color={Colors.oxblood} />
              </TouchableOpacity>
            </View>

            {isLoadingCampaigns ? (
              <ActivityIndicator style={{ margin: 40 }} size="large" color={Colors.rose} />
            ) : campaigns.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No active campaigns found.</Text>
              </View>
            ) : (
              <FlatList
                data={campaigns}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.campaignListContainer}
                renderItem={({ item }) => (
                  <View style={styles.campaignItem}>
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
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamLite },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(244,236,228,0.92)', borderBottomWidth: 0.5, borderBottomColor: 'rgba(63,3,11,0.08)' },
  backBtn: { width: 36, height: 36, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  convName: { fontWeight: '700', fontSize: 15.5, color: Colors.ink },
  onlineStatus: { fontSize: 11.5, fontWeight: '600', color: Colors.rose },
  inviteHeaderBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.oxblood },
  inviteHeaderBtnText: { color: Colors.cream, fontSize: 12, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  messageList: { padding: 16, gap: 12 },
  msgRow: { flexDirection: 'row', justifyContent: 'flex-start', marginVertical: 2 },
  msgRowMe: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', padding: 10, borderRadius: 18, ...Shadow.card, position: 'relative' },
  bubbleMe: { backgroundColor: Colors.oxblood, borderBottomRightRadius: 5, shadowOpacity: 0 },
  bubbleThem: { backgroundColor: '#fff', borderBottomLeftRadius: 5 },
  campaignBubble: { width: '80%', maxWidth: '80%', backgroundColor: '#fff', borderRadius: 16, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, borderLeftWidth: 4, borderLeftColor: Colors.rose },
  bubbleText: { fontSize: 14, lineHeight: 20, color: Colors.ink },
  bubbleTextMe: { color: Colors.cream },
  msgTime: { fontSize: 9, color: 'rgba(63,3,11,0.4)', alignSelf: 'flex-end', marginTop: 4 },
  msgTimeMe: { color: 'rgba(244,236,228,0.6)' },

  // Campaign invitation card styles
  campaignCard: { padding: 4 },
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
  attachBtn: { width: 40, height: 40, borderRadius: 99, backgroundColor: 'rgba(63,3,11,0.06)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 999, paddingLeft: 16, paddingRight: 4, paddingVertical: 4, ...Shadow.card },
  input: { flex: 1, fontSize: 14.5, color: Colors.ink, fontFamily: FontFamily.sansMedium, maxHeight: 100 },
  sendBtn: { width: 36, height: 36, borderRadius: 99, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  // Modal styles
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
