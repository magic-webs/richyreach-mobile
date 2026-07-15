import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { Colors, FontFamily, Radius } from '@/constants/brand';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { CrownIcon, Calendar01Icon, Coins01Icon, UserGroupIcon, Task01Icon } from '@hugeicons/core-free-icons';

interface ShareCardViewProps {
  cm: any;
}

export const ShareCardView = React.forwardRef<any, ShareCardViewProps>(({ cm }, ref) => {
  if (!cm) return null;

  const pay = cm.numCreators > 1 && cm.costPerCreator
    ? `₹${cm.costPerCreator.toLocaleString('en-IN')}`
    : cm.budget;

  const payLabel = cm.numCreators > 1 ? 'PER CREATOR' : 'BUDGET';

  return (
    <ViewShot
      ref={ref}
      options={{ format: 'png', quality: 0.95 }}
      style={styles.container}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={[Colors.oxbloodDeep, Colors.oxblood, '#180104']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative background circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      {/* Main Opaque Card Inner Wrapper */}
      <View style={styles.cardInner}>
        {/* Header Logo */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <HugeiconsIcon icon={CrownIcon} size={16} color={Colors.oxblood} strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.logoText}>RichyReach</Text>
            <Text style={styles.headerSubtitle}>CAMPAIGN SPOTLIGHT</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>OFFICIAL</Text>
          </View>
        </View>

        {/* Campaign Banner Image or Fallback Gradient */}
        <View style={styles.bannerContainer}>
          {cm.imageUrl ? (
            <Image source={{ uri: cm.imageUrl }} style={styles.bannerImage} contentFit="cover" />
          ) : (
            <LinearGradient
              colors={['#b46a74', '#3f030b']}
              style={styles.bannerImage}
            />
          )}
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{cm.cat?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Campaign Title & Brand */}
        <View style={styles.contentWrap}>
          <Text style={styles.brandText}>{cm.brand?.toUpperCase()}</Text>
          <Text style={styles.titleText} numberOfLines={2}>{cm.title}</Text>
        </View>

        {/* Highlights Row (Grid) */}
        <View style={styles.statsGrid}>
          {/* Payout */}
          <View style={styles.statBox}>
            <View style={styles.statIconWrap}>
              <HugeiconsIcon icon={Coins01Icon} size={15} color={Colors.oxblood} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.statValue}>{pay}</Text>
              <Text style={styles.statLabel}>{payLabel}</Text>
            </View>
          </View>

          {/* Spots / Creators */}
          <View style={styles.statBox}>
            <View style={styles.statIconWrap}>
              <HugeiconsIcon icon={UserGroupIcon} size={15} color={Colors.oxblood} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.statValue}>{cm.numCreators || 'Multiple'}</Text>
              <Text style={styles.statLabel}>SPOTS</Text>
            </View>
          </View>
        </View>

        <View style={[styles.statsGrid, { marginTop: 10 }]}>
          {/* Deadline */}
          <View style={styles.statBox}>
            <View style={styles.statIconWrap}>
              <HugeiconsIcon icon={Calendar01Icon} size={15} color={Colors.oxblood} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.statValue}>{cm.deadline}</Text>
              <Text style={styles.statLabel}>DEADLINE</Text>
            </View>
          </View>

          {/* Platform verification */}
          <View style={styles.statBox}>
            <View style={styles.statIconWrap}>
              <HugeiconsIcon icon={Task01Icon} size={15} color={Colors.oxblood} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.statValue}>Verified</Text>
              <Text style={styles.statLabel}>COLLAB STATUS</Text>
            </View>
          </View>
        </View>

        {/* Bottom Branding / QR Area */}
        <View style={styles.footer}>
          <View style={styles.footerTextWrap}>
            <Text style={styles.footerTitle}>Scan to Apply Now</Text>
            <Text style={styles.footerLink}>richyreach.com/shared/{cm.id}</Text>
          </View>
          
          {/* Decorative QR Code styling */}
          <View style={styles.qrCodeWrapper}>
            <View style={styles.qrCornerTopLeft} />
            <View style={styles.qrCornerTopRight} />
            <View style={styles.qrCornerBottomLeft} />
            <View style={styles.qrCornerBottomRight} />
            <View style={styles.qrInnerSquare} />
            <View style={styles.qrCenterDot} />
          </View>
        </View>
      </View>
    </ViewShot>
  );
});

ShareCardView.displayName = 'ShareCardView';

const styles = StyleSheet.create({
  container: {
    width: 480,
    height: 480,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(180, 106, 116, 0.15)',
  },
  circle2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(232, 216, 204, 0.06)',
  },
  cardInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FAF6F0', // solid opaque light warm cream background
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.creamDk,
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.creamDk,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    color: Colors.oxblood,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 7.5,
    color: 'rgba(63,3,11,0.5)',
    letterSpacing: 1,
    marginTop: -2,
  },
  verifiedBadge: {
    marginLeft: 'auto',
    backgroundColor: Colors.oxblood,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: {
    fontFamily: FontFamily.sans,
    fontSize: 7,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerContainer: {
    height: 130,
    width: '100%',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginTop: 10,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.creamDk,
  },
  categoryTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(63,3,11,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  categoryText: {
    fontFamily: FontFamily.sans,
    fontSize: 8,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  contentWrap: {
    marginTop: 12,
    gap: 4,
  },
  brandText: {
    fontFamily: FontFamily.sans,
    fontSize: 10,
    color: Colors.roseDeep,
    letterSpacing: 0.5,
  },
  titleText: {
    fontFamily: FontFamily.sans,
    fontSize: 19,
    color: Colors.oxblood,
    fontWeight: '800',
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.06)',
    padding: 8,
    gap: 8,
  },
  statIconWrap: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    backgroundColor: '#FAF5F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: FontFamily.sans,
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  statLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 6.5,
    color: 'rgba(63,3,11,0.45)',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(63,3,11,0.06)',
    paddingTop: 12,
    marginTop: 14,
  },
  footerTextWrap: {
    gap: 2,
  },
  footerTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 10.5,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  footerLink: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 8.5,
    color: Colors.roseDeep,
  },
  qrCodeWrapper: {
    width: 32,
    height: 32,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: Colors.oxblood,
  },
  qrCornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: Colors.oxblood,
  },
  qrCornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: Colors.oxblood,
  },
  qrCornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: Colors.oxblood,
  },
  qrInnerSquare: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: Colors.oxblood,
  },
  qrCenterDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: Colors.oxblood,
    borderRadius: 1,
  },
});
