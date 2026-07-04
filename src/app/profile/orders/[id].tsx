import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { Image } from 'expo-image';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  FolderOpenIcon,
  LinkIcon,
  CheckIcon,
  ChatIcon,
} from '@hugeicons/core-free-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TactileButton } from '@/components/ui/tactile-button';

interface ServiceOrder {
  id: string;
  serviceName: string;
  price: number;
  deliveryTime: string;
  brandName: string;
  brandAvatar?: string;
  category: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  deliverables: string[];
  scriptUrl?: string;
  videoUrl?: string;
  notes?: string;
}

const STORAGE_KEY = '@richyreach_service_orders';

export default function OrderDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // Script and video URL text inputs
  const [scriptInput, setScriptInput] = useState('');
  const [videoInput, setVideoInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Load order detail from storage
  useEffect(() => {
    const loadOrderDetail = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const list: ServiceOrder[] = JSON.parse(stored);
          const found = list.find((o) => o.id === id);
          if (found) {
            setOrder(found);
            setScriptInput(found.scriptUrl || '');
            setVideoInput(found.videoUrl || '');
            setNotesInput(found.notes || '');
          }
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOrderDetail();
  }, [id]);

  const updateOrderStatus = async (newStatus: 'pending' | 'active' | 'completed' | 'cancelled', updates?: Partial<ServiceOrder>) => {
    if (!order) return;
    setActionLoading(true);
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const list: ServiceOrder[] = JSON.parse(stored);
        const updatedList = list.map((o) => {
          if (o.id === order.id) {
            const merged = { ...o, status: newStatus, ...updates };
            setOrder(merged);
            return merged;
          }
          return o;
        });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      }
    } catch (err) {
      console.error('Failed to update order:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = () => {
    updateOrderStatus('active');
  };

  const handleReject = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this service order?', [
      { text: 'No' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => updateOrderStatus('cancelled') },
    ]);
  };

  const handleSaveConcept = () => {
    if (!scriptInput.trim()) {
      Alert.alert('Validation Error', 'Please enter a valid concept or script link.');
      return;
    }
    updateOrderStatus(order?.status || 'active', { scriptUrl: scriptInput.trim(), notes: notesInput.trim() });
    Alert.alert('Concept Saved', 'Your concept/script link has been saved and shared with the brand.');
  };

  const handleSaveVideo = () => {
    if (!videoInput.trim()) {
      Alert.alert('Validation Error', 'Please enter a valid video link.');
      return;
    }
    updateOrderStatus(order?.status || 'active', { videoUrl: videoInput.trim() });
    Alert.alert('Video Work Submitted', 'Your video submission link has been saved.');
  };

  const handleComplete = () => {
    Alert.alert('Complete Collaboration', 'Mark this service order as completed? This will release the escrow funds.', [
      { text: 'Cancel' },
      { text: 'Yes, Complete', onPress: () => updateOrderStatus('completed') },
    ]);
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
        return 'rgba(63,3,11,0.45)';
      default:
        return Colors.oxblood;
    }
  };

  const getOrderStep = (status: string) => {
    if (status === 'pending') return 1;
    if (status === 'active') {
      if (order?.videoUrl) return 3;
      if (order?.scriptUrl) return 2;
      return 1.5;
    }
    if (status === 'completed') return 4;
    return 0; // Cancelled
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
        {/* Status Stepper / Progress (Vibrant mockup styling) */}
        {order.status !== 'cancelled' && (
          <View style={styles.stepperCard}>
            <Text style={styles.sectionTitle}>ORDER TIMELINE</Text>
            <View style={styles.stepperRow}>
              {/* Step 1 */}
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive, currentStep > 1 && styles.stepCircleCompleted]}>
                  {currentStep > 1 ? <HugeiconsIcon icon={CheckIcon} size={11} color={Colors.white} /> : <Text style={[styles.stepNum, currentStep >= 1 && styles.stepNumActive]}>1</Text>}
                </View>
                <Text style={[styles.stepLabel, currentStep >= 1 && styles.stepLabelActive]}>Order Placed</Text>
              </View>

              <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />

              {/* Step 2 */}
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive, currentStep > 2 && styles.stepCircleCompleted]}>
                  {currentStep > 2 ? <HugeiconsIcon icon={CheckIcon} size={11} color={Colors.white} /> : <Text style={[styles.stepNum, currentStep >= 2 && styles.stepNumActive]}>2</Text>}
                </View>
                <Text style={[styles.stepLabel, currentStep >= 2 && styles.stepLabelActive]}>Concept Shared</Text>
              </View>

              <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />

              {/* Step 3 */}
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, currentStep >= 3 && styles.stepCircleActive, currentStep > 3 && styles.stepCircleCompleted]}>
                  {currentStep > 3 ? <HugeiconsIcon icon={CheckIcon} size={11} color={Colors.white} /> : <Text style={[styles.stepNum, currentStep >= 3 && styles.stepNumActive]}>3</Text>}
                </View>
                <Text style={[styles.stepLabel, currentStep >= 3 && styles.stepLabelActive]}>Work Submitted</Text>
              </View>

              <View style={[styles.stepLine, currentStep >= 4 && styles.stepLineActive]} />

              {/* Step 4 */}
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

          {/* Pricing and Delivery Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Total Earnings</Text>
              <Text style={styles.metricValue}>₹{(order.price / 100).toLocaleString()}</Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Delivery Time</Text>
              <Text style={styles.metricValue}>{order.deliveryTime}</Text>
            </View>
          </View>
        </View>

        {/* Brand Information Section */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>BUYER DETAILS</Text>
          <View style={styles.brandRow}>
            <Image
              source={{ uri: order.brandAvatar || 'https://pub-c7a89526fe7541b0a1d6bc2d831710d2.r2.dev/plaform-images/avatar.png' }}
              style={styles.brandAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.brandName}>{order.brandName}</Text>
              <Text style={styles.brandVerifiedLabel}>Verified Brand Buyer</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/chat')}
              style={styles.chatIconBtn}
              activeOpacity={0.7}
            >
              <HugeiconsIcon icon={ChatIcon} size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Deliverables list */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>DELIVERABLES & SCOPE</Text>
          <View style={styles.deliverablesList}>
            {order.deliverables.map((item, idx) => (
              <View key={idx} style={styles.deliverableRow}>
                <View style={styles.bulletCheck}>
                  <HugeiconsIcon icon={CheckIcon} size={10} color={Colors.white} />
                </View>
                <Text style={styles.deliverableText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Manage Content Submissions (Concept link / Video links) */}
        {order.status === 'active' && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>SUBMIT CREATIVE CONTENT</Text>

            {/* Concept / Script submission */}
            <View style={styles.inputWrap}>
              <Text style={styles.fieldLabel}>Concept / Script Link</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Google Doc or Concept brief link"
                placeholderTextColor="rgba(63,3,11,0.3)"
                value={scriptInput}
                onChangeText={setScriptInput}
              />
              <TextInput
                style={[styles.textInput, { height: 60, textAlignVertical: 'top', marginTop: 8 }]}
                placeholder="Add private note for the brand (Optional)"
                placeholderTextColor="rgba(63,3,11,0.3)"
                multiline
                numberOfLines={2}
                value={notesInput}
                onChangeText={setNotesInput}
              />
              <TactileButton
                text={order.scriptUrl ? "Update Concept" : "Submit Concept"}
                onPress={handleSaveConcept}
                variant="white"
                style={{ marginTop: 8 }}
                disabled={actionLoading}
              />
            </View>

            <View style={styles.innerDivider} />

            {/* Video Submission */}
            <View style={styles.inputWrap}>
              <Text style={styles.fieldLabel}>Final Video Link</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Google Drive, Dropbox, or Youtube Link"
                placeholderTextColor="rgba(63,3,11,0.3)"
                value={videoInput}
                onChangeText={setVideoInput}
                editable={!!order.scriptUrl}
              />
              {!order.scriptUrl && (
                <Text style={styles.helperText}>Please submit and save your concept first.</Text>
              )}
              <TactileButton
                text={order.videoUrl ? "Update Video Link" : "Submit Final Video"}
                onPress={handleSaveVideo}
                variant="primary"
                style={{ marginTop: 8 }}
                disabled={!order.scriptUrl || actionLoading}
              />
            </View>
          </View>
        )}

        {/* Display Submitted URLs for completed / cancelled / review states */}
        {(order.scriptUrl || order.videoUrl) && order.status !== 'active' && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>SUBMITTED LINKS</Text>
            {order.scriptUrl && (
              <TouchableOpacity
                onPress={() => Linking.openURL(order.scriptUrl!)}
                style={styles.submittedLinkRow}
                activeOpacity={0.8}
              >
                <HugeiconsIcon icon={LinkIcon} size={14} color={Colors.roseDeep} />
                <Text style={styles.submittedLinkLabel}>View Submitted Concept/Script</Text>
              </TouchableOpacity>
            )}
            {order.videoUrl && (
              <TouchableOpacity
                onPress={() => Linking.openURL(order.videoUrl!)}
                style={[styles.submittedLinkRow, { marginTop: 8 }]}
                activeOpacity={0.8}
              >
                <HugeiconsIcon icon={LinkIcon} size={14} color={Colors.roseDeep} />
                <Text style={styles.submittedLinkLabel}>View Submitted Final Video</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Operation Action Panel at bottom */}
        <View style={styles.actionPanel}>
          {order.status === 'pending' && (
            <View style={styles.buttonRow}>
              <TactileButton
                text="Decline"
                onPress={handleReject}
                variant="white"
                style={{ flex: 1 }}
                disabled={actionLoading}
              />
              <TactileButton
                text="Accept Order"
                onPress={handleAccept}
                variant="primary"
                style={{ flex: 2 }}
                disabled={actionLoading}
              />
            </View>
          )}

          {order.status === 'active' && order.videoUrl && (
            <TactileButton
              text="Complete Collaboration"
              onPress={handleComplete}
              variant="primary"
              fullWidth
              disabled={actionLoading}
            />
          )}

          {order.status === 'completed' && (
            <View style={styles.completedReceipt}>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} color={Colors.green} />
              <Text style={styles.receiptText}>
                Order has been successfully completed. ₹{(order.price / 100).toLocaleString()} credited to your wallet balance.
              </Text>
            </View>
          )}

          {order.status === 'cancelled' && (
            <View style={[styles.completedReceipt, { backgroundColor: 'rgba(63,3,11,0.04)' }]}>
              <HugeiconsIcon icon={CancelCircleIcon} size={18} color="rgba(63,3,11,0.4)" />
              <Text style={[styles.receiptText, { color: 'rgba(63,3,11,0.5)' }]}>
                This service order has been cancelled and funds refunded.
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
  textInput: {
    backgroundColor: 'rgba(63,3,11,0.02)',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    fontSize: 13.5,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
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
  errorText: {
    fontSize: 15,
    fontFamily: FontFamily.sansMedium,
    color: 'rgba(63,3,11,0.6)',
  },
});
