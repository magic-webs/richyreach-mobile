import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, FontFamily, Radius } from '@/constants/brand';
import { api } from '@/lib/api';
import { useProfilesStore } from '@/store/profiles';
import { useUIStore } from '@/store/ui';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface CampaignInviteSheetProps {
  isOpen: boolean;
  onClose: () => void;
  creator: any | null;
}

export function CampaignInviteSheet({ isOpen, onClose, creator }: CampaignInviteSheetProps) {
  const activeProfileId = useProfilesStore((s) => s.activeProfileId);
  const showModal = useUIStore((s) => s.showModal);
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useQuery<any[]>({
    queryKey: ['campaigns', 'active'],
    queryFn: async () => {
      const data = (await api.campaigns.list()) as any[];
      return data.filter((c: any) => c.status === 'active');
    },
    enabled: isOpen && !!creator,
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ campaignId, campaignTitle }: { campaignId: string; campaignTitle: string }) => {
      const room = await api.chat.createRoom(creator.id);
      await api.chat.send(
        room.id,
        `I've invited you to collaborate on our campaign: "${campaignTitle}"!`,
        campaignId,
      );
    },
    onSuccess: (_, { campaignTitle }) => {
      onClose();
      queryClient.invalidateQueries({ queryKey: ['brandDashboard', activeProfileId] });
      showModal({
        title: 'Invitation Sent',
        message: `Successfully invited ${creator?.name} to collaborate!`,
      });
    },
    onError: (err: any) => {
      console.error('Failed to send invitation', err);
      showModal({
        title: 'Error',
        message: err.message || 'Failed to send invitation',
      });
    },
  });

  if (!isOpen) return null;

  return (
    <BottomSheet
      visible={isOpen}
      title={creator ? `Invite ${creator.name}` : 'Select Campaign'}
      icon="briefcase"
      onClose={onClose}
      snapPoints={['55%', '85%']}
    >
      {isLoadingCampaigns ? (
        <ActivityIndicator style={{ margin: 40 }} size="large" color={Colors.rose} />
      ) : campaigns.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No active campaigns found. Please launch a campaign first.
          </Text>
        </View>
      ) : (
        <View style={styles.campaignList}>
          {campaigns.map((item) => (
            <View key={item.id} style={styles.campaignItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.campaignTitle}>{item.title}</Text>
                <Text style={styles.campaignBudget}>
                  Budget: ₹{(item.budget / 100).toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.inviteBtn, inviteMutation.isPending && styles.inviteBtnDisabled]}
                disabled={inviteMutation.isPending}
                activeOpacity={0.85}
                onPress={() => inviteMutation.mutate({ campaignId: item.id, campaignTitle: item.title })}
              >
                {inviteMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.inviteBtnText}>Invite</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(63,3,11,0.5)',
    fontSize: 14,
    textAlign: 'center',
  },
  campaignList: {
    gap: 12,
  },
  campaignItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(63,3,11,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.06)',
  },
  campaignTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansMedium,
    color: Colors.oxblood,
  },
  campaignBudget: {
    fontSize: 12,
    color: Colors.rose,
    fontWeight: '600',
    marginTop: 2,
  },
  inviteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.oxblood,
  },
  inviteBtnDisabled: {
    opacity: 0.7,
  },
  inviteBtnText: {
    color: Colors.cream,
    fontSize: 13,
    fontWeight: '700',
  },
});
