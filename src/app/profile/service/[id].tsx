import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { Image } from 'expo-image';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  Share01Icon,
  Clock01Icon,
  CheckIcon,
  ChatIcon,
  PlayIcon,
} from '@hugeicons/core-free-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import { TactileButton } from '@/components/ui/tactile-button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateServiceSheet } from '@/components/influencer/services/CreateServiceSheet';
import { useVideoPlayer, VideoView } from 'expo-video';

interface CreatorService {
  id: string;
  name: string;
  price: number;
  deliveryTime: string;
  category: string;
  description: string;
  deliverables: string[];
  exampleUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  creatorName?: string;
  creatorAvatar?: string;
}

const STORAGE_KEY = '@richyreach_service_orders';



export default function ServiceDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  const role = useAuthStore((s) => s.role);
  const session = useAuthStore((s) => s.session);
  const activeInfluencerProfileId = useProfilesStore((s) => s.activeInfluencerProfileId);

  const [service, setService] = useState<CreatorService | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [guidelines, setGuidelines] = useState('');
  const [ordering, setOrdering] = useState(false);
  const videoSource = service?.videoUrl || (service?.exampleUrl?.endsWith('.mp4') ? service.exampleUrl : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4');

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
  });

  useEffect(() => {
    if (player && videoSource) {
      player.replaceAsync(videoSource).catch(() => {});
    }
  }, [videoSource, player]);

  // Fetch all services from backend — keyed by profile so cache busts on profile switch
  const { data: servicesList = [], isLoading: isServicesListLoading, refetch: refetchServices } = useQuery<any[]>({
    queryKey: ['allServicesList', activeInfluencerProfileId],
    queryFn: () => api.influencers.services.list().catch(() => []),
    enabled: true,
  });

  const loadServiceDetails = () => {
    const backendMatch = servicesList.find((s) => String(s.id) === String(id));
    if (backendMatch) {
      let parsedDeliverables: string[] = ['1x Video Deliverable'];
      if (backendMatch.deliverables) {
        if (Array.isArray(backendMatch.deliverables)) {
          parsedDeliverables = backendMatch.deliverables;
        } else {
          try {
            parsedDeliverables = JSON.parse(backendMatch.deliverables);
          } catch {
            parsedDeliverables = String(backendMatch.deliverables).split(',').map((t: string) => t.trim());
          }
        }
      }

      setService({
        id: backendMatch.id,
        name: backendMatch.name,
        price: backendMatch.price,
        deliveryTime: backendMatch.deliveryTime || '5 Days',
        category: backendMatch.category || 'General',
        description: backendMatch.description || 'No description provided.',
        deliverables: parsedDeliverables,
        exampleUrl: backendMatch.exampleUrl || backendMatch.videoUrl,
        thumbnailUrl: backendMatch.thumbnailUrl || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600',
        creatorName: backendMatch.influencer?.user?.name || backendMatch.influencer?.name || 'RichyReach Creator',
        creatorAvatar: backendMatch.influencer?.avatar || backendMatch.influencer?.user?.image || 'https://pub-c7a89526fe7541b0a1d6bc2d831710d2.r2.dev/plaform-images/avatar.png',
      });
    } else {
      setService(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Wait for the services list to actually resolve before deciding the
    // service is missing — otherwise this runs against the empty initial
    // `[]` and briefly flashes "Service not found" before the real data
    // arrives.
    if (isServicesListLoading) return;
    loadServiceDetails();
  }, [id, servicesList, isServicesListLoading]);

  // Delete Service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: string) => api.influencers.services.delete(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencerServices'] });
      Alert.alert('Deleted', 'Service deleted successfully.');
      router.back();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to delete service.');
    },
  });

  const handleDeletePress = () => {
    if (!service) return;
    Alert.alert('Delete Service', 'Are you sure you want to delete this service permanently?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteServiceMutation.mutate(service.id) },
    ]);
  };

  const handleShare = async () => {
    Alert.alert('Share Service', `Link copied: https://app.richyreach.com/profile/service/${id}`);
  };

  const openExample = () => {
    if (service?.exampleUrl) {
      Linking.openURL(service.exampleUrl);
    } else {
      Alert.alert('Preview', 'No video preview link available for this service.');
    }
  };

  const handleBuyPress = () => {
    if (!session) {
      Alert.alert('Login Required', 'Please log in to purchase services.', [
        { text: 'Cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)') },
      ]);
      return;
    }
    setPurchaseModalVisible(true);
  };

  const handleConfirmOrder = async () => {
    if (!service) return;
    setOrdering(true);
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const orders = stored ? JSON.parse(stored) : [];

      const newOrder = {
        id: `SO-${Math.floor(100 + Math.random() * 900)}`,
        serviceName: service.name,
        price: service.price,
        deliveryTime: service.deliveryTime,
        brandName: 'My Brand Store',
        brandAvatar: 'https://pub-c7a89526fe7541b0a1d6bc2d831710d2.r2.dev/plaform-images/avatar.png',
        category: service.category,
        status: 'pending',
        createdAt: new Date().toISOString(),
        deliverables: service.deliverables.length > 0 ? service.deliverables : ['1x Deliverable'],
        notes: guidelines,
      };

      orders.unshift(newOrder);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

      setPurchaseModalVisible(false);
      Alert.alert(
        'Order Placed!',
        'Your service order has been successfully placed. The creator will review and accept it soon.',
        [{ text: 'View Orders', onPress: () => router.push('/profile/orders') }, { text: 'OK' }]
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to place service order.');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={28} color={Colors.oxblood} strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Service Details</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Cover media skeleton */}
          <Skeleton height={200} borderRadius={20} />

          {/* Creator info skeleton */}
          <View style={styles.detailsCard}>
            <Skeleton width={80} height={10} style={{ marginBottom: 12 }} />
            <View style={styles.creatorRow}>
              <Skeleton variant="circle" width={40} height={40} />
              <View style={{ flex: 1, gap: 6 }}>
                <Skeleton width="55%" height={14} />
                <Skeleton width="35%" height={11} />
              </View>
            </View>
          </View>

          {/* Title & details skeleton */}
          <View style={styles.detailsCard}>
            <View style={[styles.badgeRow, { marginBottom: 12 }]}>
              <Skeleton width={70} height={20} borderRadius={6} />
              <Skeleton width={70} height={20} borderRadius={6} />
            </View>
            <Skeleton width="70%" height={18} style={{ marginBottom: 10 }} />
            <Skeleton width="35%" height={22} style={{ marginBottom: 14 }} />
            <View style={styles.divider} />
            <Skeleton width={110} height={11} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={13} style={{ marginBottom: 6 }} />
            <Skeleton width="90%" height={13} style={{ marginBottom: 6 }} />
            <Skeleton width="60%" height={13} />
          </View>

          {/* Deliverables skeleton */}
          <View style={styles.detailsCard}>
            <Skeleton width={150} height={10} style={{ marginBottom: 12 }} />
            <View style={styles.deliverablesList}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={styles.deliverableRow}>
                  <Skeleton variant="circle" width={16} height={16} />
                  <Skeleton width={`${70 - i * 12}%`} height={13} />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Sticky footer skeleton */}
        <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <View style={styles.brandActionRow}>
            <View style={styles.footerPriceCol}>
              <Skeleton width={60} height={10} style={{ marginBottom: 6 }} />
              <Skeleton width={80} height={18} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Skeleton height={44} borderRadius={14} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (!service) {
    return (
      <View style={[styles.root, styles.centerContainer, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Service not found</Text>
        <TactileButton text="Go Back" onPress={() => router.back()} variant="primary" style={{ marginTop: 12 }} />
      </View>
    );
  }

  const isOwner = role === 'influencer';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={28} color={Colors.oxblood} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Service Details</Text>
        <TouchableOpacity
          onPress={handleShare}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <HugeiconsIcon icon={Share01Icon} size={22} color={Colors.oxblood} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cover Video Player */}
        <View style={styles.mediaContainer}>
          <VideoView
            style={styles.coverVideo}
            player={player}
            nativeControls={true}
          />
        </View>

        {service.exampleUrl && (service.exampleUrl.includes('youtube.com') || service.exampleUrl.includes('youtu.be')) && (
          <TouchableOpacity
            style={styles.youtubeLinkBtn}
            onPress={openExample}
            activeOpacity={0.8}
          >
            <HugeiconsIcon icon={PlayIcon} size={14} color={Colors.white} />
            <Text style={styles.youtubeLinkText}>Watch External YouTube Preview</Text>
          </TouchableOpacity>
        )}

        {/* Creator Info */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>OFFERED BY</Text>
          <View style={styles.creatorRow}>
            <Image
              source={{ uri: service.creatorAvatar || 'https://pub-c7a89526fe7541b0a1d6bc2d831710d2.r2.dev/plaform-images/avatar.png' }}
              style={styles.creatorAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.creatorName}>{service.creatorName}</Text>
              <Text style={styles.creatorSub}>Verified Creator Profile</Text>
            </View>
            {!isOwner && (
              <TouchableOpacity
                onPress={() => router.push('/chat')}
                style={styles.chatBtn}
                activeOpacity={0.7}
              >
                <HugeiconsIcon icon={ChatIcon} size={16} color={Colors.oxblood} />
                <Text style={styles.chatBtnText}>Chat</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Service title & details */}
        <View style={styles.detailsCard}>
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{service.category}</Text>
            </View>
            <View style={styles.timeBadge}>
              <HugeiconsIcon icon={Clock01Icon} size={12} color={Colors.roseDeep} />
              <Text style={styles.timeText}>{service.deliveryTime}</Text>
            </View>
          </View>

          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.priceValue}>₹{(service.price / 100).toLocaleString()}</Text>

          <View style={styles.divider} />

          <Text style={styles.descriptionLabel}>About this service</Text>
          <Text style={styles.descriptionText}>{service.description || 'No description added yet.'}</Text>
        </View>

        {/* Deliverables Checklist */}
        {service.deliverables && service.deliverables.length > 0 && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>DELIVERABLES & BENEFITS</Text>
            <View style={styles.deliverablesList}>
              {service.deliverables.map((item, idx) => (
                <View key={idx} style={styles.deliverableRow}>
                  <View style={styles.bulletCheck}>
                    <HugeiconsIcon icon={CheckIcon} size={10} color={Colors.white} />
                  </View>
                  <Text style={styles.deliverableText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Panel */}
      <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        {isOwner ? (
          <View style={styles.ownerActions}>
            <TactileButton
              text="Delete"
              onPress={handleDeletePress}
              variant="white"
              style={{ flex: 1 }}
              fullWidth={true}
            />
            <TactileButton
              text="Edit Service"
              onPress={() => setEditSheetOpen(true)}
              variant="primary"
              style={{ flex: 2 }}
              fullWidth={true}
            />
          </View>
        ) : (
          <View style={styles.brandActionRow}>
            <View style={styles.footerPriceCol}>
              <Text style={styles.footerPriceLabel}>Total Price</Text>
              <Text style={styles.footerPriceVal}>₹{(service.price / 100).toLocaleString()}</Text>
            </View>
            <TactileButton
              text="Order Service"
              onPress={handleBuyPress}
              variant="primary"
              style={{ flex: 1 }}
              fullWidth={true}
            />
          </View>
        )}
      </View>

      {/* Confirm Purchase Modal */}
      <Modal
        visible={purchaseModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPurchaseModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Order</Text>
            <Text style={styles.modalSub}>
              You are ordering "{service.name}" from {service.creatorName}.
            </Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Price</Text>
                <Text style={styles.summaryVal}>₹{(service.price / 100).toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Time</Text>
                <Text style={styles.summaryVal}>{service.deliveryTime}</Text>
              </View>
            </View>

            <Text style={styles.instructionLabel}>CAMPAIGN INSTRUCTIONS & BRIEF</Text>
            <TextInput
              style={styles.instructionInput}
              placeholder="E.g. Please speak about our sunscreen's SPF 50 rating, smooth texture, and non-greasy formula..."
              placeholderTextColor="rgba(63,3,11,0.3)"
              multiline
              numberOfLines={4}
              value={guidelines}
              onChangeText={setGuidelines}
            />

            <View style={styles.modalActions}>
              <TactileButton
                text="Cancel"
                onPress={() => setPurchaseModalVisible(false)}
                variant="white"
                style={{ flex: 1 }}
                disabled={ordering}
                fullWidth={true}
              />
              <TactileButton
                text={ordering ? "Ordering..." : "Confirm & Pay"}
                onPress={handleConfirmOrder}
                variant="primary"
                style={{ flex: 1.5 }}
                disabled={ordering}
                fullWidth={true}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Inline Create/Edit Service Sheet */}
      {editSheetOpen && (
        <CreateServiceSheet
          isOpen={editSheetOpen}
          onClose={() => setEditSheetOpen(false)}
          onSuccess={(updated) => {
            setEditSheetOpen(false);
            refetchServices();
            loadServiceDetails();
            Alert.alert('Success', 'Service updated successfully.');
          }}
          service={service}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(63, 3, 11, 0.04)',
    backgroundColor: Colors.creamLite,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.oxblood,
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 16,
  },
  youtubeLinkBtn: {
    backgroundColor: '#FF0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    marginTop: -8,
    ...Shadow.button,
  },
  youtubeLinkText: {
    color: Colors.white,
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    fontWeight: '700',
  },
  mediaContainer: {
    height: 200,
    backgroundColor: 'rgba(63,3,11,0.1)',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    ...Shadow.card,
  },
  coverVideo: {
    width: '100%',
    height: '100%',
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    ...Shadow.card,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: FontFamily.sans,
    color: Colors.roseDeep,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  creatorName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  creatorSub: {
    fontSize: 11,
    color: 'rgba(63,3,11,0.45)',
    fontFamily: FontFamily.sansMedium,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.oxblood,
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  chatBtnText: {
    fontSize: 11,
    fontFamily: FontFamily.sans,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: 'rgba(180, 106, 116, 0.1)',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  categoryText: {
    fontSize: 10,
    color: Colors.roseDeep,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '700',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(63,3,11,0.03)',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    gap: 4,
  },
  timeText: {
    fontSize: 10,
    color: 'rgba(63,3,11,0.6)',
    fontFamily: FontFamily.sansMedium,
    fontWeight: '700',
  },
  serviceName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
  },
  priceValue: {
    fontFamily: FontFamily.sans,
    fontSize: 22,
    fontWeight: '900',
    color: Colors.oxblood,
    marginTop: 8,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(63,3,11,0.08)',
    marginVertical: 14,
  },
  descriptionLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 11.5,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
    lineHeight: 20,
  },
  deliverablesList: {
    gap: 10,
  },
  deliverableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliverableText: {
    fontSize: 13,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(63, 3, 11, 0.06)',
    ...Shadow.card,
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  brandActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  footerPriceCol: {
    justifyContent: 'center',
  },
  footerPriceLabel: {
    fontSize: 10,
    color: 'rgba(63,3,11,0.45)',
    fontFamily: FontFamily.sans,
    textTransform: 'uppercase',
  },
  footerPriceVal: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.oxblood,
    fontFamily: FontFamily.sans,
    marginTop: 2,
  },
  errorText: {
    fontSize: 15,
    fontFamily: FontFamily.sansMedium,
    color: 'rgba(63,3,11,0.6)',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    gap: 14,
  },
  modalTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.oxblood,
  },
  modalSub: {
    fontSize: 13,
    color: 'rgba(63,3,11,0.5)',
    fontFamily: FontFamily.sansMedium,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: 'rgba(63,3,11,0.02)',
    borderWidth: 0.5,
    borderColor: 'rgba(63,3,11,0.08)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12.5,
    fontFamily: FontFamily.sansMedium,
    color: 'rgba(63,3,11,0.5)',
  },
  summaryVal: {
    fontSize: 13.5,
    fontFamily: FontFamily.sans,
    fontWeight: '700',
    color: Colors.ink,
  },
  instructionLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 6,
  },
  instructionInput: {
    backgroundColor: 'rgba(63,3,11,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    borderRadius: 12,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 13.5,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
});
