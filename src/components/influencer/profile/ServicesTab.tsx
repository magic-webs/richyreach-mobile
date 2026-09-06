import LottieView from 'lottie-react-native';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { TactileButton } from '@/components/ui/tactile-button';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { Image } from 'expo-image';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

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

  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>My Services</Text>
        <TactileButton
          text="Add new service"
          icon="plus"
          variant="primary"
          size="sm"
          borderRadius={99}
          onPress={onAddServicePress}
        />
      </View>

      {/* Services List / Horizontal Scroll */}
      {loadingServices ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          <Skeleton width={270} height={380} borderRadius={24} />
          <Skeleton width={270} height={380} borderRadius={24} />
        </ScrollView>
      ) : services.length === 0 ? (
        <View style={styles.emptyCard}>
          <LottieView
            source={require('@/assets/lottie-animation/empty-ghost.json')}
            autoPlay
            loop
            style={{ width: 140, height: 140, marginBottom: 8 }}
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
            return (
              <TouchableOpacity
                key={srv.id}
                style={styles.serviceCard}
                activeOpacity={0.9}
                onPress={() => router.push({ pathname: '/profile/service/[id]', params: { id: srv.id } })}
              >
                {/* Video Thumbnail Section */}
                <View style={styles.thumbnailContainer}>
                  <Image source={{ uri: coverImage }} style={styles.thumbnailImage} contentFit="cover" />
                  <View style={styles.thumbnailOverlay} />

                  {/* Category Badge overlay */}
                  <View style={styles.categoryBadgeOverlay}>
                    <Icon name="grid" size={10} color={Colors.white} />
                    <Text style={styles.categoryBadgeText}>{srv.subCategory || srv.category || 'General'}</Text>
                  </View>

                  {/* Price Tag overlay */}
                  <View style={styles.priceTagOverlay}>
                    <Text style={styles.priceTagText}>₹{rupeePrice.toLocaleString()}</Text>
                  </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoContainer}>
                  <View style={styles.titleRow}>
                    <Text numberOfLines={2} style={styles.serviceTitle}>{srv.name}</Text>
                    {/* Delete Option */}
                    <TouchableOpacity
                      onPress={() => onDeleteService(srv.id)}
                      style={styles.moreBtn}
                      activeOpacity={0.7}
                    >
                      <Icon name="trash" size={15} color="rgba(63, 3, 11, 0.4)" />
                    </TouchableOpacity>
                  </View>

                  <Text numberOfLines={1} style={styles.deliveryLabel}>
                    Delivered in {srv.deliveryTime || '5 Days'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Stats Card */}
      {false && <View style={styles.statsCard}>
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
      </View>}

      {/* Premium Pro Banner */}
      {false && <View style={styles.proBanner}>
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
        </View>}
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
    paddingVertical: 8,
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
  categoryBadgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(180, 106, 116, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: 9.5,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.4,
  },
  priceTagOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(63, 3, 11, 0.9)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  priceTagText: {
    fontSize: 12,
    fontFamily: FontFamily.sans,
    fontWeight: '800',
    color: Colors.white,
  },
  deliveryLabel: {
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.45)',
    fontFamily: FontFamily.sansMedium,
    marginTop: 2,
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
