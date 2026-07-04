import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { Image } from 'expo-image';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  CheckIcon,
  ChatIcon,
  ImageUploadIcon,
  VideoReplayIcon,
} from '@hugeicons/core-free-icons';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TactileButton } from '@/components/ui/tactile-button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import type { ServiceOrder } from '@/types/order';

function parseDeliverables(deliverables: ServiceOrder['deliverables']): string[] {
  if (!deliverables) return [];
  if (Array.isArray(deliverables)) return deliverables;
  try {
    return JSON.parse(deliverables);
  } catch {
    return String(deliverables).split(',').map((t) => t.trim()).filter(Boolean);
  }
}

export default function OrderDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  const role = useAuthStore((s) => s.role);
  const activeBrandProfileId = useProfilesStore((s) => s.activeBrandProfileId);
  const isBrand = role === 'brand';

  const [uploadingConcept, setUploadingConcept] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const { data: orders = [], isLoading: loading } = useQuery<ServiceOrder[]>({
    queryKey: isBrand ? ['brandOrders', activeBrandProfileId] : ['influencerOrders'],
    queryFn: () => (isBrand ? api.brands.orders.list(activeBrandProfileId) : api.influencers.orders.list()),
  });

  const order = orders.find((o) => String(o.id) === String(id)) || null;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: isBrand ? ['brandOrders'] : ['influencerOrders'] });

  const acceptMutation = useMutation({
    mutationFn: () => api.influencers.orders.accept(order!.id),
    onSuccess: invalidate,
    onError: (err: any) => Alert.alert('Error', err.message || 'Failed to accept order'),
  });

  const declineMutation = useMutation({
    mutationFn: () => api.influencers.orders.decline(order!.id),
    onSuccess: () => {
      invalidate();
      router.back();
    },
    onError: (err: any) => Alert.alert('Error', err.message || 'Failed to decline order'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.brands.orders.cancel(order!.id, activeBrandProfileId),
    onSuccess: () => {
      invalidate();
      router.back();
    },
    onError: (err: any) => Alert.alert('Error', err.message || 'Failed to cancel order'),
  });

  const completeMutation = useMutation({
    mutationFn: () => api.brands.orders.complete(order!.id, activeBrandProfileId),
    onSuccess: invalidate,
    onError: (err: any) => Alert.alert('Error', err.message || 'Failed to complete order'),
  });

  const submitConceptMutation = useMutation({
    mutationFn: (conceptUrl: string) => api.influencers.orders.submitConcept(order!.id, conceptUrl),
    onSuccess: invalidate,
    onError: (err: any) => Alert.alert('Error', err.message || 'Failed to submit concept'),
  });

  const submitVideoMutation = useMutation({
    mutationFn: (videoUrl: string) => api.influencers.orders.submitVideo(order!.id, videoUrl),
    onSuccess: invalidate,
    onError: (err: any) => Alert.alert('Error', err.message || 'Failed to submit video'),
  });

  const handleDecline = () => {
    Alert.alert('Decline Order', 'Are you sure you want to decline this service order? The brand will be refunded.', [
      { text: 'No' },
      { text: 'Yes, Decline', style: 'destructive', onPress: () => declineMutation.mutate() },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order? You will be refunded.', [
      { text: 'No' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelMutation.mutate() },
    ]);
  };

  const handleComplete = () => {
    Alert.alert(
      'Complete Order',
      'Mark this order as complete? This will release the escrowed payment to the creator.',
      [
        { text: 'Cancel' },
        { text: 'Yes, Release Payment', onPress: () => completeMutation.mutate() },
      ]
    );
  };

  const uploadDeliverable = async (kind: 'concept' | 'video') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: kind === 'video' ? ['videos'] : ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      kind === 'video' ? setUploadingVideo(true) : setUploadingConcept(true);

      const selectedUri = result.assets[0].uri;
      const formData = new FormData();
      const extension = kind === 'video' ? 'mp4' : 'jpg';
      const filename = `order_${kind}.${extension}`;

      if (Platform.OS === 'web' || selectedUri.startsWith('blob:') || selectedUri.startsWith('data:')) {
        const response = await fetch(selectedUri);
        const blob = await response.blob();
        formData.append('file', blob, filename);
      } else {
        let formattedUri = selectedUri;
        if (!formattedUri.startsWith('file://') && !formattedUri.startsWith('content://')) {
          formattedUri = `file://${formattedUri}`;
        }
        formData.append('file', {
          uri: formattedUri,
          name: filename,
          type: kind === 'video' ? `video/${extension}` : `image/${extension}`,
        } as any);
      }

      const uploadRes = await api.media.upload(formData);
      if (kind === 'video') {
        submitVideoMutation.mutate(uploadRes.url);
      } else {
        submitConceptMutation.mutate(uploadRes.url);
      }
    } catch (err: any) {
      console.error(`Failed to upload ${kind}:`, err);
      Alert.alert('Upload Failed', err.message || 'An error occurred during upload.');
    } finally {
      kind === 'video' ? setUploadingVideo(false) : setUploadingConcept(false);
    }
  };

  const getStatusLabelColor = (status: string) => {
    switch (status) {
      case 'pending':
        return Colors.gold;
      case 'active':
        return Colors.roseDeep;
      case 'completed':
        return Colors.green;
      case 'cancelled':
      case 'declined':
        return 'rgba(63,3,11,0.45)';
      default:
        return Colors.oxblood;
    }
  };

  const getOrderStep = (status: string) => {
    if (status === 'pending') return 1;
    if (status === 'active') {
      if (order?.videoUrl) return 3;
      if (order?.conceptUrl) return 2;
      return 1.5;
    }
    if (status === 'completed') return 4;
    return 0; // Cancelled / Declined
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.oxblood} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.root, styles.centerContainer, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Order not found</Text>
        <TactileButton text="Back to Orders" onPress={() => router.back()} variant="primary" style={{ marginTop: 12 }} />
      </View>
    );
  }

  const currentStep = getOrderStep(order.status);
  const isClosed = order.status === 'cancelled' || order.status === 'declined';
  const deliverables = parseDeliverables(order.deliverables);

  const counterpartyName = isBrand
    ? order.influencer?.user?.name || 'Creator'
    : order.brand?.companyName || order.brand?.user?.name || 'Brand';
  const counterpartyAvatar = isBrand
    ? order.influencer?.avatar || order.influencer?.user?.image
    : order.brand?.logo || order.brand?.user?.image;

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
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Stepper */}
        {!isClosed && (
          <View style={styles.stepperCard}>
            <Text style={styles.sectionTitle}>ORDER TIMELINE</Text>
            <View style={styles.stepperRow}>
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive, currentStep > 1 && styles.stepCircleCompleted]}>
                  {currentStep > 1 ? <HugeiconsIcon icon={CheckIcon} size={11} color={Colors.white} /> : <Text style={[styles.stepNum, currentStep >= 1 && styles.stepNumActive]}>1</Text>}
                </View>
                <Text style={[styles.stepLabel, currentStep >= 1 && styles.stepLabelActive]}>Order Placed</Text>
              </View>

              <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />

              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive, currentStep > 2 && styles.stepCircleCompleted]}>
                  {currentStep > 2 ? <HugeiconsIcon icon={CheckIcon} size={11} color={Colors.white} /> : <Text style={[styles.stepNum, currentStep >= 2 && styles.stepNumActive]}>2</Text>}
                </View>
                <Text style={[styles.stepLabel, currentStep >= 2 && styles.stepLabelActive]}>Concept Shared</Text>
              </View>

              <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />

              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, currentStep >= 3 && styles.stepCircleActive, currentStep > 3 && styles.stepCircleCompleted]}>
                  {currentStep > 3 ? <HugeiconsIcon icon={CheckIcon} size={11} color={Colors.white} /> : <Text style={[styles.stepNum, currentStep >= 3 && styles.stepNumActive]}>3</Text>}
                </View>
                <Text style={[styles.stepLabel, currentStep >= 3 && styles.stepLabelActive]}>Work Submitted</Text>
              </View>

              <View style={[styles.stepLine, currentStep >= 4 && styles.stepLineActive]} />

              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, currentStep === 4 && styles.stepCircleCompleted]}>
                  {currentStep === 4 ? <HugeiconsIcon icon={CheckIcon} size={11} color={Colors.white} /> : <Text style={styles.stepNum}>4</Text>}
                </View>
                <Text style={[styles.stepLabel, currentStep === 4 && styles.stepLabelActive]}>Completed</Text>
              </View>
            </View>
          </View>
        )}

        {/* Basic Info Header Card */}
        <View style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.orderIdLabel}>Order ID: {order.id}</Text>
              <Text style={styles.serviceName}>{order.serviceName}</Text>
              <Text style={styles.categoryLabel}>{order.category}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusLabelColor(order.status) + '15' }]}>
              <Text style={[styles.statusBadgeText, { color: getStatusLabelColor(order.status) }]}>
                {order.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricsGrid}>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>{isBrand ? 'Total Spend' : 'Total Earnings'}</Text>
              <Text style={styles.metricValue}>₹{(order.price / 100).toLocaleString()}</Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Delivery Time</Text>
              <Text style={styles.metricValue}>{order.deliveryTime || '—'}</Text>
            </View>
          </View>
        </View>

        {/* Counterparty Information */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>{isBrand ? 'CREATOR DETAILS' : 'BUYER DETAILS'}</Text>
          <View style={styles.brandRow}>
            <Image
              source={{ uri: counterpartyAvatar || 'https://pub-c7a89526fe7541b0a1d6bc2d831710d2.r2.dev/plaform-images/avatar.png' }}
              style={styles.brandAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.brandName}>{counterpartyName}</Text>
              <Text style={styles.brandVerifiedLabel}>{isBrand ? 'Order Creator' : 'Verified Brand Buyer'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/chat')}
              style={styles.chatIconBtn}
              activeOpacity={0.7}
            >
              <HugeiconsIcon icon={ChatIcon} size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
          {order.notes ? (
            <>
              <View style={styles.innerDivider} />
              <Text style={styles.fieldLabel}>BRIEF / INSTRUCTIONS</Text>
              <Text style={styles.notesText}>{order.notes}</Text>
            </>
          ) : null}
        </View>

        {/* Deliverables list */}
        {deliverables.length > 0 && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>DELIVERABLES & SCOPE</Text>
            <View style={styles.deliverablesList}>
              {deliverables.map((item, idx) => (
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

        {/* Influencer: upload concept/video while active */}
        {!isBrand && order.status === 'active' && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>SUBMIT CREATIVE CONTENT</Text>

            <View style={styles.inputWrap}>
              <Text style={styles.fieldLabel}>Concept</Text>
              {order.conceptUrl && (
                <Image source={{ uri: order.conceptUrl }} style={styles.conceptPreview} contentFit="cover" />
              )}
              <TactileButton
                text={uploadingConcept ? 'Uploading...' : order.conceptUrl ? 'Update Concept' : 'Upload Concept Image'}
                onPress={() => uploadDeliverable('concept')}
                variant="white"
                style={{ marginTop: 8 }}
                disabled={uploadingConcept}
              />
            </View>

            <View style={styles.innerDivider} />

            <View style={styles.inputWrap}>
              <Text style={styles.fieldLabel}>Final Video</Text>
              {!order.conceptUrl && (
                <Text style={styles.helperText}>Please submit your concept first.</Text>
              )}
              {order.videoUrl && (
                <View style={styles.submittedLinkRow}>
                  <HugeiconsIcon icon={VideoReplayIcon} size={14} color={Colors.roseDeep} />
                  <Text style={styles.submittedLinkLabel}>Video submitted</Text>
                </View>
              )}
              <TactileButton
                text={uploadingVideo ? 'Uploading...' : order.videoUrl ? 'Update Video' : 'Upload Final Video'}
                onPress={() => uploadDeliverable('video')}
                variant="primary"
                style={{ marginTop: 8 }}
                disabled={!order.conceptUrl || uploadingVideo}
              />
            </View>
          </View>
        )}

        {/* Brand: read-only preview of submitted work */}
        {isBrand && order.status === 'active' && (order.conceptUrl || order.videoUrl) && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>SUBMITTED WORK</Text>
            {order.conceptUrl && (
              <>
                <Text style={styles.fieldLabel}>Concept</Text>
                <Image source={{ uri: order.conceptUrl }} style={styles.conceptPreview} contentFit="cover" />
              </>
            )}
            {order.videoUrl && (
              <View style={[styles.submittedLinkRow, { marginTop: 12 }]}>
                <HugeiconsIcon icon={VideoReplayIcon} size={14} color={Colors.roseDeep} />
                <Text style={styles.submittedLinkLabel}>Final video submitted — ready for review</Text>
              </View>
            )}
          </View>
        )}

        {/* Operation Action Panel at bottom */}
        <View style={styles.actionPanel}>
          {!isBrand && order.status === 'pending' && (
            <View style={styles.buttonRow}>
              <TactileButton
                text="Decline"
                onPress={handleDecline}
                variant="white"
                style={{ flex: 1 }}
                disabled={declineMutation.isPending}
              />
              <TactileButton
                text="Accept Order"
                onPress={() => acceptMutation.mutate()}
                variant="primary"
                style={{ flex: 2 }}
                disabled={acceptMutation.isPending}
              />
            </View>
          )}

          {isBrand && order.status === 'pending' && (
            <TactileButton
              text="Cancel Order"
              onPress={handleCancel}
              variant="white"
              fullWidth
              disabled={cancelMutation.isPending}
            />
          )}

          {!isBrand && order.status === 'active' && order.videoUrl && (
            <View style={styles.waitingReceipt}>
              <HugeiconsIcon icon={ImageUploadIcon} size={18} color={Colors.roseDeep} />
              <Text style={styles.waitingReceiptText}>
                Waiting for the brand to review your work and release payment.
              </Text>
            </View>
          )}

          {isBrand && order.status === 'active' && order.videoUrl && (
            <TactileButton
              text="Mark Complete & Release Payment"
              onPress={handleComplete}
              variant="primary"
              fullWidth
              disabled={completeMutation.isPending}
            />
          )}

          {order.status === 'completed' && (
            <View style={styles.completedReceipt}>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} color={Colors.green} />
              <Text style={styles.receiptText}>
                {isBrand
                  ? `Order completed. ₹${(order.price / 100).toLocaleString()} has been released to the creator.`
                  : `Order completed. ₹${(order.price / 100).toLocaleString()} credited to your wallet balance.`}
              </Text>
            </View>
          )}

          {isClosed && (
            <View style={[styles.completedReceipt, { backgroundColor: 'rgba(63,3,11,0.04)' }]}>
              <HugeiconsIcon icon={CancelCircleIcon} size={18} color="rgba(63,3,11,0.4)" />
              <Text style={[styles.receiptText, { color: 'rgba(63,3,11,0.5)' }]}>
                {order.status === 'declined'
                  ? 'This order was declined by the creator and funds have been refunded.'
                  : 'This service order has been cancelled and funds refunded.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  },
  placeholder: {
    width: 36,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  stepperCard: {
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
    marginBottom: 16,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    width: 68,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(63,3,11,0.1)',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    borderColor: Colors.oxblood,
    backgroundColor: Colors.oxblood,
  },
  stepCircleCompleted: {
    borderColor: Colors.green,
    backgroundColor: Colors.green,
  },
  stepNum: {
    fontSize: 10,
    color: 'rgba(63,3,11,0.4)',
    fontFamily: FontFamily.sans,
  },
  stepNumActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 8.5,
    color: 'rgba(63,3,11,0.4)',
    fontFamily: FontFamily.sansMedium,
    textAlign: 'center',
    fontWeight: '700',
  },
  stepLabelActive: {
    color: Colors.oxblood,
  },
  stepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: 'rgba(63, 3, 11, 0.1)',
    marginHorizontal: -8,
    marginTop: -16,
  },
  stepLineActive: {
    backgroundColor: Colors.oxblood,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    ...Shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderIdLabel: {
    fontSize: 10.5,
    color: 'rgba(63,3,11,0.4)',
    fontFamily: FontFamily.sans,
    fontWeight: '700',
  },
  serviceName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.ink,
    marginTop: 4,
  },
  categoryLabel: {
    fontSize: 12,
    color: Colors.roseDeep,
    fontFamily: FontFamily.sansMedium,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    fontFamily: FontFamily.sans,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(63,3,11,0.08)',
    marginVertical: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCell: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10.5,
    color: 'rgba(63,3,11,0.4)',
    fontFamily: FontFamily.sans,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.oxblood,
    fontFamily: FontFamily.sans,
    marginTop: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  brandName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },
  brandVerifiedLabel: {
    fontSize: 11,
    color: 'rgba(63,3,11,0.45)',
    fontFamily: FontFamily.sansMedium,
  },
  chatIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.button,
  },
  notesText: {
    fontSize: 12.5,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
    lineHeight: 18,
    marginTop: 4,
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
  inputWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 11.5,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  conceptPreview: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginTop: 6,
    backgroundColor: 'rgba(63,3,11,0.05)',
  },
  innerDivider: {
    height: 0.5,
    backgroundColor: 'rgba(63,3,11,0.06)',
    marginVertical: 16,
  },
  helperText: {
    fontSize: 11,
    color: 'rgba(63,3,11,0.4)',
    fontFamily: FontFamily.sansMedium,
    fontStyle: 'italic',
  },
  submittedLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(180, 106, 116, 0.08)',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(180, 106, 116, 0.2)',
  },
  submittedLinkLabel: {
    fontSize: 12.5,
    fontFamily: FontFamily.sansMedium,
    color: Colors.roseDeep,
    fontWeight: '700',
  },
  actionPanel: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  completedReceipt: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(42,122,90,0.08)',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(42,122,90,0.2)',
    gap: 10,
    alignItems: 'center',
  },
  receiptText: {
    flex: 1,
    fontSize: 12,
    color: Colors.green,
    fontFamily: FontFamily.sansMedium,
    lineHeight: 18,
  },
  waitingReceipt: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(180, 106, 116, 0.08)',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(180, 106, 116, 0.2)',
    gap: 10,
    alignItems: 'center',
  },
  waitingReceiptText: {
    flex: 1,
    fontSize: 12,
    color: Colors.roseDeep,
    fontFamily: FontFamily.sansMedium,
    lineHeight: 18,
  },
  errorText: {
    fontSize: 15,
    fontFamily: FontFamily.sansMedium,
    color: 'rgba(63,3,11,0.6)',
  },
});
