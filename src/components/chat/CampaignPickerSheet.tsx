import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/brand';
import { BottomSheet } from '@/components/ui/bottom-sheet';

interface CampaignPickerSheetProps {
  visible: boolean;
  isLoading: boolean;
  campaigns: Array<{ id: string; title: string; budget: number }>;
  onClose: () => void;
  onInvite: (campaignId: string) => void;
}

export function CampaignPickerSheet({ visible, isLoading, campaigns, onClose, onInvite }: CampaignPickerSheetProps) {
  return (
    <BottomSheet visible={visible} title="Select Campaign" icon="briefcase" onClose={onClose} snapPoints={['55%', '90%']}>
      {isLoading ? (
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
              <TouchableOpacity style={styles.campaignInviteBtn} onPress={() => onInvite(item.id)}>
                <Text style={styles.campaignInviteBtnText}>Invite</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: 'rgba(63,3,11,0.5)', fontSize: 14 },
  campaignListContainer: { gap: 12, paddingBottom: 20 },
  campaignItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 12, backgroundColor: 'rgba(63,3,11,0.03)', borderWidth: 1, borderColor: 'rgba(63,3,11,0.06)' },
  campaignItemTitle: { fontSize: 14.5, fontWeight: '700', color: Colors.ink },
  campaignItemBudget: { fontSize: 12, color: Colors.rose, fontWeight: '600', marginTop: 2 },
  campaignInviteBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, backgroundColor: Colors.oxblood },
  campaignInviteBtnText: { color: Colors.cream, fontSize: 13, fontWeight: '700' },
});
