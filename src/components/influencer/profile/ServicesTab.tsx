import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { Image } from 'expo-image';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ServicesTabProps {
  services: any[];
  loadingServices: boolean;
  onAddServicePress: () => void;
  onEditService: (srv: any) => void;
  onDeleteService: (id: string) => void;
}

// Beautiful fallback cover images for services based on category/index
const FALLBACK_THUMBNAILS = [
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600', // Fashion/Instagram
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600', // Tech/Product
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600', // Vlog/Unboxing
  'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600', // Lifestyle
];

export function ServicesTab({
  services,
  loadingServices,
  onAddServicePress,
  onEditService,
  onDeleteService,
}: ServicesTabProps) {

  // Helper to generate realistic deterministic mock statistics for services
  const getMockMetadata = (srv: any, index: number) => {
    const badges = ['FEATURED', 'BEST SELLER', 'NEW'];
    const badge = badges[index % badges.length];

    const ratings = [4.9, 4.8, 4.7];
    const rating = ratings[index % ratings.length];

    const reviewCounts = [26, 19, 11];
    const reviewCount = reviewCounts[index % reviewCounts.length];

    const orderCounts = [32, 21, 15];
    const orderCount = orderCounts[index % orderCounts.length];

    const durations = ['00:34', '00:28', '00:41'];
    const duration = durations[index % durations.length];

    return { badge, rating, reviewCount, orderCount, duration };
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>My Services</Text>
        <TouchableOpacity
          style={styles.addServiceBtn}
          activeOpacity={0.85}
          onPress={onAddServicePress}
        >
          <Icon name="plus" size={14} color={Colors.white} />
          <Text style={styles.addServiceBtnText}>Add new service</Text>
        </TouchableOpacity>
      </View>

      {/* Services List / Horizontal Scroll */}
      {loadingServices ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          <Skeleton width={270} height={380} borderRadius={24} />
          <Skeleton width={270} height={380} borderRadius={24} />
        </ScrollView>
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
          <TouchableOpacity
            style={[styles.addServiceBtn, { alignSelf: 'center', marginTop: 12 }]}
            onPress={onAddServicePress}
          >
            <Icon name="plus" size={14} color={Colors.white} />
            <Text style={styles.addServiceBtnText}>Create a service</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {services.map((srv, index) => {
            const rupeePrice = typeof srv.price === 'number' ? srv.price / 100 : 0;
            const { badge, rating, reviewCount, orderCount, duration } = getMockMetadata(srv, index);

            // Choose cover image
            let coverImage = srv.thumbnailUrl;
            if (!coverImage && srv.videoUrl) {
              if (srv.videoUrl.includes('cloudinary.com')) {
                const baseUrl = srv.videoUrl.split('?')[0];
                const extIdx = baseUrl.lastIndexOf('.');
                if (extIdx !== -1) {
                  const ext = baseUrl.substring(extIdx).toLowerCase();
                  if (['.mp4', '.mov', '.avi', '.mkv', '.webm', '.3gp'].includes(ext)) {
                    coverImage = baseUrl.substring(0, extIdx) + '.jpg';
                  }
                }
              } else {
                coverImage = srv.videoUrl;
              }
            }
            if (!coverImage) {
              coverImage = FALLBACK_THUMBNAILS[index % FALLBACK_THUMBNAILS.length];
            }
            const platform = srv.category || 'Instagram';
            const catTag = srv.subCategory || 'UGC';

            // Badge Color styles
            let badgeBg = 'rgba(235, 94, 40, 0.9)'; // orange for FEATURED
            if (badge === 'BEST SELLER') badgeBg = 'rgba(180, 20, 30, 0.9)'; // deep red
            if (badge === 'NEW') badgeBg = 'rgba(180, 106, 116, 0.9)'; // pink/rose

            return (
              <View key={srv.id} style={styles.serviceCard}>
                {/* Video Thumbnail Section */}
                <View style={styles.thumbnailContainer}>
                  <Image source={{ uri: coverImage }} style={styles.thumbnailImage} contentFit="cover" />
                  <View style={styles.thumbnailOverlay} />

                  {/* Badge */}
                  <View style={[styles.badgeContainer, { backgroundColor: badgeBg }]}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>

                  {/* Play Button Overlay */}
                  <View style={styles.playButtonWrapper}>
                    <Icon name="play" size={24} color={Colors.white} />
                  </View>

                  {/* Duration Label */}
                  <View style={styles.durationContainer}>
                    <Text style={styles.durationText}>{duration}</Text>
                  </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoContainer}>
                  <View style={styles.titleRow}>
                    <Text numberOfLines={1} style={styles.serviceTitle}>{srv.name}</Text>
                    {/* Delete Option via three-dots trigger */}
                    <TouchableOpacity
                      onPress={() => onDeleteService(srv.id)}
                      style={styles.moreBtn}
                      activeOpacity={0.7}
                    >
                      <Icon name="trash" size={15} color="rgba(63, 3, 11, 0.4)" />
                    </TouchableOpacity>
                  </View>

                  {/* Category Tags */}
                  <View style={styles.tagsRow}>
                    <View style={styles.platformBadge}>
                      <Icon name={platform.toLowerCase() === 'youtube' ? 'play' : 'camera'} size={11} color={Colors.roseDeep} />
                      <Text style={styles.platformText}>{platform}</Text>
                    </View>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{catTag}</Text>
                    </View>
                  </View>

                  {/* Rating and Reviews */}
                  <View style={styles.ratingRow}>
                    <Icon name="star" size={13} color={Colors.gold} />
                    <Text style={styles.ratingText}>
                      <Text style={styles.boldText}>{rating}</Text> ({reviewCount} reviews)
                    </Text>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.ordersText}>{orderCount} Orders</Text>
                  </View>

                  <View style={styles.divider} />

                  {/* Price and Delivery info */}
                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailValue}>₹{rupeePrice.toLocaleString()}</Text>
                      <Text style={styles.detailLabel}>Starting Price</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailValue}>{srv.deliveryTime || '5 Days'}</Text>
                      <Text style={styles.detailLabel}>Delivery Time</Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.previewBtn}
                      activeOpacity={0.8}
                      onPress={() => {
                        // Open exampleUrl
                        if (srv.exampleUrl || srv.videoUrl) {
                          if (Platform.OS === 'web') {
                            window.open(srv.exampleUrl || srv.videoUrl, '_blank');
                          }
                        }
                      }}
                    >
                      <Icon name="eye" size={13} color={Colors.oxblood} />
                      <Text style={styles.previewBtnText}>Preview</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editCardBtn}
                      activeOpacity={0.8}
                      onPress={() => onEditService(srv)}
                    >
                      <Icon name="edit" size={13} color={Colors.white} />
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScrollContent}>
          {/* Stat 1 */}
          <View style={styles.statBox}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(180, 106, 116, 0.15)' }]}>
              <Icon name="eye" size={16} color={Colors.rose} />
            </View>
            <View>
              <Text style={styles.statNum}>12.5K</Text>
              <Text style={styles.statLabelText}>Total Views</Text>
            </View>
          </View>
          {/* Stat 2 */}
          <View style={styles.statBox}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(63, 3, 11, 0.1)' }]}>
              <Icon name="briefcase" size={15} color={Colors.oxblood} />
            </View>
            <View>
              <Text style={styles.statNum}>68</Text>
              <Text style={styles.statLabelText}>Total Orders</Text>
            </View>
          </View>
          {/* Stat 3 */}
          <View style={styles.statBox}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(243, 201, 105, 0.15)' }]}>
              <Icon name="star" size={15} color={Colors.gold} />
            </View>
            <View>
              <Text style={styles.statNum}>4.8</Text>
              <Text style={styles.statLabelText}>Avg. Rating</Text>
            </View>
          </View>
          {/* Stat 4 */}
          <View style={styles.statBox}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(42, 122, 90, 0.15)' }]}>
              <Icon name="chart" size={15} color={Colors.green} />
            </View>
            <View>
              <Text style={styles.statNum}>92%</Text>
              <Text style={styles.statLabelText}>Response Rate</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Premium Pro Banner */}
      <View style={styles.proBanner}>
        <View style={styles.proLeft}>
          <View style={styles.proIconCircle}>
            <Icon name="crown" size={18} color={Colors.gold} />
          </View>
          <View style={styles.proTexts}>
            <Text style={styles.proTitle}>Stand out with RichyReach Pro</Text>
            <Text style={styles.proSubtitle}>Get featured, priority in search & more brand deals.</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.proUpgradeBtn} activeOpacity={0.9}>
          <Text style={styles.proUpgradeText}>Upgrade Now  ➔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 21,
    color: Colors.ink,
    fontWeight: '700',
  },
  addServiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.oxblood,
    borderRadius: 99,
    paddingVertical: 7,
    paddingHorizontal: 13,
    gap: 5,
  },
  addServiceBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.white,
    fontWeight: '700',
  },
  scrollContainer: {
    gap: 16,
    paddingVertical: 4,
    paddingRight: 20,
  },
  serviceCard: {
    width: 270,
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.08)',
    ...Shadow.card,
  },
  thumbnailContainer: {
    position: 'relative',
    height: 150,
    backgroundColor: 'rgba(63, 3, 11, 0.1)',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  badgeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 9.5,
    fontFamily: FontFamily.sans,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.4,
  },
  playButtonWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  durationContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  durationText: {
    fontSize: 10,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '600',
    color: Colors.white,
  },
  infoContainer: {
    padding: 14,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
    flex: 1,
  },
  moreBtn: {
    padding: 4,
    marginLeft: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(180, 106, 116, 0.1)',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    gap: 4,
  },
  platformText: {
    fontSize: 10.5,
    color: Colors.roseDeep,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  categoryText: {
    fontSize: 10.5,
    color: 'rgba(63, 3, 11, 0.6)',
    fontFamily: FontFamily.sansMedium,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.6)',
    fontFamily: FontFamily.sansMedium,
    marginLeft: 4,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.ink,
  },
  bulletDot: {
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.3)',
    marginHorizontal: 5,
  },
  ordersText: {
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.6)',
    fontFamily: FontFamily.sansMedium,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(63, 3, 11, 0.08)',
    marginVertical: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    gap: 2,
  },
  detailValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  detailLabel: {
    fontSize: 9.5,
    color: 'rgba(63, 3, 11, 0.45)',
    fontFamily: FontFamily.sansMedium,
    fontWeight: '600',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  previewBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.oxblood,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  previewBtnText: {
    fontSize: 11,
    fontFamily: FontFamily.sans,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  editCardBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.oxblood,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  editBtnText: {
    fontSize: 11,
    fontFamily: FontFamily.sans,
    color: Colors.white,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.08)',
    ...Shadow.card,
    gap: 8,
  },
  emptyStateImage: {
    width: 140,
    height: 120,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
  },
  emptyStateSub: {
    fontSize: 12.5,
    color: 'rgba(63, 3, 11, 0.5)',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  statsCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.05)',
    ...Shadow.card,
  },
  statsScrollContent: {
    gap: 16,
    paddingRight: 12,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 100,
  },
  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNum: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  statLabelText: {
    fontSize: 9.5,
    color: 'rgba(63, 3, 11, 0.45)',
    fontFamily: FontFamily.sansMedium,
    fontWeight: '600',
  },
  proBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.oxblood,
    borderRadius: 20,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.1)',
    ...Shadow.card,
    overflow: 'hidden',
  },
  proLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  proIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  proTexts: {
    gap: 2,
    flex: 1,
  },
  proTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.white,
  },
  proSubtitle: {
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: FontFamily.sansMedium,
  },
  proUpgradeBtn: {
    backgroundColor: Colors.white,
    borderRadius: 99,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  proUpgradeText: {
    fontFamily: FontFamily.sans,
    fontSize: 10,
    color: Colors.oxblood,
    fontWeight: '700',
  },
});
