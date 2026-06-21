import { BottomSheet } from '@/components/ui/bottom-sheet';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Briefcase01Icon, ChatIcon } from '@hugeicons/core-free-icons';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Creator } from './MarketplaceCreatorCard';

interface InviteCreatorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  creator: Partial<Creator> | null;
  onMessageFirst: () => void;
  onSendInvite: (campaignId: string, campaignTitle: string) => void;
  selectedService?: any | null;
  campaigns?: any[];
}

export function InviteCreatorSheet({ isOpen, onClose, creator, onMessageFirst, onSendInvite, selectedService, campaigns = [] }: InviteCreatorSheetProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');

  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns]);

  return (
    <BottomSheet
      visible={isOpen}
      title={`Invite ${creator?.name || 'Creator'}`}
      icon="send"
      onClose={onClose}
    >
      <View style={styles.sheetBody}>
        {/* Creator Mini Card */}
        <View style={styles.sheetCreatorCard}>
          <PlaceholderImage tone={creator?.tone || 'rose'} height={40} width={40} borderRadius={20} />
          <View style={{ flex: 1 }}>
            <Text style={styles.sheetCreatorName}>{creator?.name}</Text>
            <Text style={styles.sheetCreatorStats}>
              {creator?.followers} followers · {creator?.engagement} eng
            </Text>
          </View>
          <View style={styles.sheetCreatorRate}>
            <Text style={styles.sheetCreatorRateText}>Rate: {creator?.rate}/post</Text>
          </View>
        </View>

        {/* Selected Service Info */}
        {selectedService && (
          <View style={styles.sheetServiceInfo}>
            <Text style={styles.sheetServiceLabel}>SELECTED SERVICE</Text>
            <View style={styles.sheetServiceCard}>
              <HugeiconsIcon icon={Briefcase01Icon} size={14} color={Colors.oxblood} />
              <Text style={styles.sheetServiceName} numberOfLines={1}>{selectedService.name}</Text>
              <Text style={styles.sheetServicePrice}>₹{selectedService.price.toLocaleString()}</Text>
            </View>
          </View>
        )}

        {/* Campaign Selection list */}
        <Text style={styles.sheetSelectLabel}>SELECT CAMPAIGN</Text>
        <View style={styles.campaignSelectionGroup}>
          {campaigns.length === 0 ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: 'rgba(63,3,11,0.5)' }}>No active campaigns available.</Text>
            </View>
          ) : (
            campaigns.map((campaign) => {
              const isChecked = selectedCampaignId === campaign.id;
              return (
                <TouchableOpacity
                  key={campaign.id}
                  style={[styles.campaignRow, isChecked && styles.campaignRowChecked]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCampaignId(campaign.id)}
                >
                  <Text style={[styles.campaignRowText, isChecked && styles.campaignRowTextChecked]} numberOfLines={1}>
                    {campaign.title}
                  </Text>
                  <View style={[styles.radioCircle, isChecked && styles.radioCircleChecked]}>
                    {isChecked && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Action Row */}
        <View style={styles.sheetActions}>
          <TouchableOpacity
            style={styles.sheetBtnSecondary}
            activeOpacity={0.8}
            onPress={onMessageFirst}
          >
            <HugeiconsIcon icon={ChatIcon} size={16} color={Colors.oxblood} />
            <Text style={styles.sheetBtnTextSecondary}>Message first</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sheetBtnPrimary, (!selectedCampaignId || campaigns.length === 0) && { opacity: 0.5 }]}
            activeOpacity={0.85}
            disabled={!selectedCampaignId || campaigns.length === 0}
            onPress={() => {
              const campaign = campaigns.find(c => c.id === selectedCampaignId);
              onSendInvite(selectedCampaignId, campaign?.title || '');
            }}
          >
            <Text style={styles.sheetBtnTextPrimary}>Send invite {'->'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBody: {
    gap: 16,
    paddingTop: 8,
  },
  sheetCreatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: Radius.md,
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  sheetCreatorName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  sheetCreatorStats: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.45)',
    marginTop: 2,
  },
  sheetCreatorRate: {
    backgroundColor: 'rgba(42, 122, 90, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sheetCreatorRateText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Colors.green,
    fontWeight: '700',
  },
  sheetSelectLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 10.5,
    color: 'rgba(63, 3, 11, 0.5)',
    letterSpacing: 0.8,
    marginTop: 6,
  },
  campaignSelectionGroup: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  campaignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.06)',
  },
  campaignRowChecked: {
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
  },
  campaignRowText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: 'rgba(63, 3, 11, 0.7)',
  },
  campaignRowTextChecked: {
    color: Colors.oxblood,
    fontWeight: '700',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(63, 3, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleChecked: {
    borderColor: Colors.oxblood,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.oxblood,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  sheetBtnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.oxblood,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.creamLite,
  },
  sheetBtnTextSecondary: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    color: Colors.oxblood,
  },
  sheetBtnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.oxbloodDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBtnTextPrimary: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    color: Colors.cream,
  },
  sheetServiceInfo: {
    gap: 6,
    marginTop: 4,
  },
  sheetServiceLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 10.5,
    color: 'rgba(63, 3, 11, 0.5)',
    letterSpacing: 0.8,
  },
  sheetServiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(180, 106, 116, 0.08)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(180, 106, 116, 0.15)',
  },
  sheetServiceName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.oxblood,
    fontWeight: '700',
    flex: 1,
  },
  sheetServicePrice: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.green,
    fontWeight: '700',
  },
});
