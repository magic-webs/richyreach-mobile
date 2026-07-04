import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { Image } from 'expo-image';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  Search01Icon,
  ShoppingBag01Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useProfilesStore } from '@/store/profiles';
import type { ServiceOrder } from '@/types/order';

type OrderTab = 'pending' | 'active' | 'completed' | 'cancelled';

export default function BrandOrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const activeBrandProfileId = useProfilesStore((s) => s.activeBrandProfileId);
  const [activeTab, setActiveTab] = useState<OrderTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: orders = [], isLoading: loading } = useQuery<ServiceOrder[]>({
    queryKey: ['brandOrders', activeBrandProfileId],
    queryFn: () => api.brands.orders.list(activeBrandProfileId),
  });

  const filteredOrders = orders.filter((order) => {
    const creatorName = order.influencer?.user?.name || '';
    // Declined (creator never accepted) reads the same as cancelled to the brand.
    const effectiveStatus = order.status === 'declined' ? 'cancelled' : order.status;
    const matchesTab = effectiveStatus === activeTab;
    const matchesQuery =
      creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock01Icon;
      case 'active':
        return ShoppingBag01Icon;
      case 'completed':
        return CheckmarkCircle02Icon;
      case 'cancelled':
      case 'declined':
        return CancelCircleIcon;
      default:
        return Clock01Icon;
    }
  };

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
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        {(['pending', 'active', 'completed', 'cancelled'] as const).map((tab) => {
          const count = orders.filter((o) => (o.status === 'declined' ? 'cancelled' : o.status) === tab).length;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              <View style={[styles.tabBadge, activeTab === tab && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === tab && styles.tabBadgeTextActive]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <HugeiconsIcon icon={Search01Icon} size={18} color="rgba(63,3,11,0.4)" />
        <TextInput
          placeholder="Search by creator or service..."
          placeholderTextColor="rgba(63,3,11,0.35)"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.oxblood} />
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.centerContainer}>
          <HugeiconsIcon icon={ShoppingBag01Icon} size={48} color="rgba(63,3,11,0.15)" />
          <Text style={styles.emptyTitle}>No Orders Found</Text>
          <Text style={styles.emptySub}>There are no {activeTab} orders matching your search.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredOrders.map((order) => {
            const IconComponent = getStatusIcon(order.status);
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                activeOpacity={0.9}
                onPress={() => router.push({ pathname: '/profile/orders/[id]', params: { id: order.id } })}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.creatorInfo}>
                    <Image
                      source={{ uri: order.influencer?.avatar || order.influencer?.user?.image || 'https://pub-c7a89526fe7541b0a1d6bc2d831710d2.r2.dev/plaform-images/avatar.png' }}
                      style={styles.creatorAvatar}
                    />
                    <View>
                      <Text style={styles.creatorName}>{order.influencer?.user?.name || 'Creator'}</Text>
                      <Text style={styles.orderDate}>
                        Ordered {new Date(order.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                    <HugeiconsIcon icon={IconComponent} size={12} color={getStatusColor(order.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {order.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.serviceName}>{order.serviceName}</Text>
                <Text style={styles.categoryLabel}>{order.category}</Text>

                <View style={styles.divider} />

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.footerLabel}>Spend</Text>
                    <Text style={styles.priceValue}>₹{(order.price / 100).toLocaleString()}</Text>
                  </View>
                  <View style={styles.viewDetailsRow}>
                    <Text style={styles.viewDetailsText}>View Order</Text>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} color={Colors.oxblood} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite,
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(63, 3, 11, 0.04)',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(63,3,11,0.03)',
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: Colors.oxblood,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(63,3,11,0.6)',
    fontFamily: FontFamily.sansMedium,
  },
  tabLabelActive: {
    color: Colors.white,
  },
  tabBadge: {
    backgroundColor: 'rgba(63,3,11,0.06)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(63,3,11,0.7)',
  },
  tabBadgeTextActive: {
    color: Colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(63,3,11,0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.06)',
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.oxblood,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.45)',
    fontFamily: FontFamily.sansMedium,
    textAlign: 'center',
    lineHeight: 18,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
    gap: 12,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    ...Shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  creatorName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  orderDate: {
    fontSize: 10,
    color: 'rgba(63,3,11,0.4)',
    fontFamily: FontFamily.sansMedium,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: FontFamily.sans,
  },
  serviceName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },
  categoryLabel: {
    fontSize: 11,
    color: Colors.roseDeep,
    fontFamily: FontFamily.sansMedium,
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(63,3,11,0.08)',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 10,
    color: 'rgba(63,3,11,0.4)',
    fontFamily: FontFamily.sans,
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.oxblood,
    fontFamily: FontFamily.sans,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.oxblood,
    fontFamily: FontFamily.sans,
  },
});
