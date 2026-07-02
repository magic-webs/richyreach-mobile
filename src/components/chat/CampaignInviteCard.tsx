import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Pin02FreeIcons } from '@hugeicons/core-free-icons';
import { Colors, FontFamily } from '@/constants/brand';
import type { DisplayChatMessage } from '@/types/chat';

interface CampaignInviteCardProps {
  message: DisplayChatMessage;
  isMe: boolean;
  isRespondable: boolean;
  onRespond: (inviteId: string, status: 'accepted' | 'declined') => void;
}

export function CampaignInviteCard({ message, isMe, isRespondable, onRespond }: CampaignInviteCardProps) {
  const showActionButtons = isRespondable && message.inviteStatus === 'pending' && !isMe;
  const showReadOnlyBadge = !!message.inviteId && !showActionButtons;

  return (
    <View style={styles.campaignCard}>
      <View style={styles.campaignCardHeader}>
        <HugeiconsIcon icon={Pin02FreeIcons} size={16} color={Colors.roseSoft} strokeWidth={2} />
        <Text style={styles.campaignLabel}>Campaign Invitation</Text>
      </View>
      <Text style={styles.campaignTitle}>{message.campaignTitle}</Text>
      {message.campaignDescription && (
        <Text style={styles.campaignDesc} numberOfLines={2}>
          {message.campaignDescription}
        </Text>
      )}

      <View style={styles.campaignMetaRow}>
        <View>
          <Text style={styles.metaLabel}>Budget</Text>
          <Text style={styles.metaValue}>₹{((message.campaignBudget ?? 0) / 100).toLocaleString()}</Text>
        </View>
      </View>

      {showActionButtons ? (
        <View style={styles.actionContainer}>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.declineBtn]}
              onPress={() => onRespond(message.inviteId!, 'declined')}
            >
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => onRespond(message.inviteId!, 'accepted')}
            >
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : showReadOnlyBadge ? (
        <View style={styles.actionContainer}>
          <View
            style={[
              styles.statusBadge,
              message.inviteStatus === 'accepted' && styles.statusAccepted,
              message.inviteStatus === 'declined' && styles.statusDeclined,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                message.inviteStatus === 'accepted' && styles.statusAcceptedText,
                message.inviteStatus === 'declined' && styles.statusDeclinedText,
              ]}
            >
              {message.inviteStatus === 'accepted'
                ? 'Accepted ✓'
                : message.inviteStatus === 'declined'
                ? 'Declined ✕'
                : 'Invitation Pending'}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
