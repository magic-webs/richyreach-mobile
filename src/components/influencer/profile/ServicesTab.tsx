import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, FontFamily, Shadow } from '@/constants/brand';

interface ServicesTabProps {
  services: any[];
  loadingServices: boolean;
  onAddServicePress: () => void;
  onDeleteService: (id: string) => void;
}

export function ServicesTab({
  services,
  loadingServices,
  onAddServicePress,
  onDeleteService,
}: ServicesTabProps) {
  return (
    <View style={{ gap: 14, marginTop: 14 }}>
      {/* Add Service button */}
      <TouchableOpacity
        style={styles.addServiceBtn}
        activeOpacity={0.85}
        onPress={onAddServicePress}
      >
        <Icon name="plus" size={16} color={Colors.oxblood} />
        <Text style={styles.addServiceBtnText}>Add new service</Text>
      </TouchableOpacity>

      {loadingServices ? (
        <View style={{ gap: 12 }}>
          <Skeleton width="100%" height={80} borderRadius={16} />
          <Skeleton width="100%" height={80} borderRadius={16} />
        </View>
      ) : services.length === 0 ? (
        <View style={styles.emptyCard}>
          <Image
            source={require('@/assets/images/empty_services.png')}
            style={styles.emptyStateImage}
            contentFit="contain"
          />
          <Text style={styles.emptyStateText}>No services listed yet</Text>
          <Text style={styles.emptyStateSub}>
            Offer specialized services (like reviews, sponsored posts) directly to brands.
          </Text>
        </View>
      ) : (
        services.map((srv) => {
          const rupeePrice = typeof srv.price === 'number' ? srv.price / 100 : 0;
          return (
            <View key={srv.id} style={styles.serviceCard}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.serviceName}>{srv.name}</Text>
                <Text style={styles.serviceMeta}>
                  ₹{rupeePrice.toLocaleString()} · {srv.deliveryTime || '5 days delivery'}
                </Text>
                {srv.exampleUrl ? (
                  <Text numberOfLines={1} style={styles.serviceLink}>
                    Link: {srv.exampleUrl}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={() => onDeleteService(srv.id)}
                style={styles.serviceDeleteBtn}
                activeOpacity={0.8}
              >
                <Icon name="trash" size={16} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  addServiceBtn: { height: 48, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(63,3,11,0.25)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'transparent' },
  addServiceBtnText: { fontWeight: '700', fontSize: 14, color: Colors.oxblood },
  serviceCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 20, padding: 16, ...Shadow.card, borderWidth: 0.5, borderColor: 'rgba(63,3,11,0.04)' },
  serviceName: { fontFamily: FontFamily.serif, fontWeight: '700', fontSize: 15, color: Colors.ink },
  serviceMeta: { fontSize: 13, color: Colors.rose, fontWeight: '600' },
  serviceLink: { fontSize: 11.5, color: 'rgba(63,3,11,0.45)' },
  serviceDeleteBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,59,48,0.08)', alignItems: 'center', justifyContent: 'center' },

  // Empty state styles
  emptyCard: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20, backgroundColor: '#fff', borderRadius: 20, marginTop: 14, ...Shadow.card, gap: 8 },
  emptyStateImage: { width: 140, height: 120, marginBottom: 8 },
  emptyStateText: { fontFamily: FontFamily.serif, fontSize: 16, fontWeight: '700', color: Colors.ink, textAlign: 'center' },
  emptyStateSub: { fontSize: 12.5, color: 'rgba(63,3,11,0.5)', textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },
});
