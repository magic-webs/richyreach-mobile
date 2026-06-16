import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';

interface SelectedServicesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedServices: any[];
  onRemoveService: (id: string) => void;
  onInviteService: (service: any) => void;
  onViewCreatorProfile: (creatorId: string) => void;
}

export function SelectedServicesSheet({
  isOpen,
  onClose,
  selectedServices,
  onRemoveService,
  onInviteService,
  onViewCreatorProfile,
}: SelectedServicesSheetProps) {
  return (
    <BottomSheet
      visible={isOpen}
      title="Shortlisted Services"
      icon="bookmark"
      onClose={onClose}
    >
      <View style={styles.sheetBody}>
        {selectedServices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="bookmark" size={40} color="rgba(63, 3, 11, 0.2)" />
            <Text style={styles.emptyText}>No services shortlisted yet.</Text>
            <Text style={styles.emptySubText}>
              Swipe right on service cards to add them to your shortlist.
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {selectedServices.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                {/* Creator & Service Info */}
                <TouchableOpacity
                  style={styles.infoContainer}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onViewCreatorProfile(service.creator.id);
                  }}
                >
                  <PlaceholderImage
                    tone={service.creator?.tone || 'rose'}
                    height={40}
                    width={40}
                    borderRadius={20}
                  />
                  <View style={styles.textContainer}>
                    <Text style={styles.creatorName} numberOfLines={1}>
                      {service.creator?.name}
                    </Text>
                    <Text style={styles.serviceName} numberOfLines={1}>
                      {service.name}
                    </Text>
                    <Text style={styles.priceText}>
                      ₹{service.price?.toLocaleString()}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Actions */}
                <View style={styles.actionGroup}>
                  {/* Remove Button */}
                  <TouchableOpacity
                    style={styles.iconBtn}
                    activeOpacity={0.8}
                    onPress={() => onRemoveService(service.id)}
                  >
                    <Icon name="trash" size={16} color="#FF3B30" />
                  </TouchableOpacity>

                  {/* View Profile Button */}
                  <TouchableOpacity
                    style={[styles.iconBtn, styles.profileBtn]}
                    activeOpacity={0.8}
                    onPress={() => {
                      onClose();
                      onViewCreatorProfile(service.creator.id);
                    }}
                  >
                    <Icon name="user" size={16} color={Colors.oxblood} />
                  </TouchableOpacity>

                  {/* Invite Button */}
                  <TouchableOpacity
                    style={styles.inviteBtn}
                    activeOpacity={0.85}
                    onPress={() => {
                      onClose();
                      onInviteService(service);
                    }}
                  >
                    <Text style={styles.inviteBtnText}>Invite</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBody: {
    maxHeight: 450,
    minHeight: 200,
    paddingTop: 8,
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    color: Colors.oxblood,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubText: {
    fontFamily: FontFamily.sans,
    fontSize: 12.5,
    color: 'rgba(63, 3, 11, 0.45)',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: Radius.md,
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.05)',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  creatorName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  serviceName: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: 'rgba(63, 3, 11, 0.6)',
  },
  priceText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.green,
    fontWeight: '700',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtn: {
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
  },
  inviteBtn: {
    backgroundColor: Colors.oxblood,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.cream,
    fontWeight: '700',
  },
});
