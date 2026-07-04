import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { Controller } from 'react-hook-form';
import { TactileButton } from '@/components/ui/tactile-button';

interface Step3ReviewProps {
  control: any;
  errors: any;
  thumbnailUrl: string;
  getFrames: () => any[];
  selectedFrameIdx: number;
  name: string;
  category: string;
  price: string;
  deliveryTime: string;
  shortDesc: string;
  deliverables: string[];
  tags: string[];
  submitting: boolean;
  handleBackStep: () => void;
  handleSubmit: () => void;
  setStep: (step: number) => void;
  service: any;
  videoDuration: string;
}

export function Step3Review({
  control,
  errors,
  thumbnailUrl,
  getFrames,
  selectedFrameIdx,
  name,
  category,
  price,
  deliveryTime,
  shortDesc,
  deliverables,
  tags,
  submitting,
  handleBackStep,
  handleSubmit,
  setStep,
  service,
  videoDuration,
}: Step3ReviewProps) {
  return (
    <View style={styles.stepWrapper}>
      {/* Sparkle banner notification */}
      <View style={styles.sparkleBanner}>
        <View style={styles.sparkleIconWrap}>
          <Icon name="sparkle" size={16} color={Colors.roseDeep} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sparkleTitle}>Almost there!</Text>
          <Text style={styles.sparkleMessage}>Review your service details before publishing.</Text>
        </View>
      </View>

      {/* Two column summary details (Structured like mockup 3) */}
      <View style={styles.reviewLayout}>
        {/* Left Column / Card details */}
        <View style={styles.reviewMain}>
          {/* Live Preview card */}
          <Text style={styles.reviewSecTitle}>Service Preview</Text>
          <View style={styles.reviewPreviewCard}>
            <View style={styles.reviewThumbContainer}>
              <Image
                source={
                  thumbnailUrl
                    ? { uri: thumbnailUrl }
                    : getFrames()[selectedFrameIdx >= 0 ? selectedFrameIdx : 0]
                    ? (typeof getFrames()[selectedFrameIdx >= 0 ? selectedFrameIdx : 0] === 'string'
                      ? { uri: getFrames()[selectedFrameIdx >= 0 ? selectedFrameIdx : 0] as string }
                      : getFrames()[selectedFrameIdx >= 0 ? selectedFrameIdx : 0])
                    : null
                }
                style={styles.reviewThumb}
                contentFit="cover"
              />
              <View style={styles.reviewThumbOverlay} />
              <View style={styles.reviewThumbPlay}>
                <Icon name="play" size={20} color={Colors.white} />
              </View>
              {videoDuration ? <Text style={styles.reviewThumbDur}>{videoDuration}</Text> : null}
            </View>
            <View style={styles.reviewCardBody}>
              <Text style={styles.reviewCardTitle}>{name}</Text>

              <View style={styles.tagsRow}>
                <View style={styles.platformBadge}>
                  <Icon
                    name="grid"
                    size={11}
                    color={Colors.roseDeep}
                  />
                  <Text style={styles.platformText}>{category}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Service Details info */}
          <View style={styles.reviewDataCard}>
            <View style={styles.reviewCardHeader}>
              <Text style={styles.reviewDataTitle}>Service Details</Text>
              <TouchableOpacity onPress={() => setStep(1)} style={styles.editLinkBtn}>
                <Icon name="edit" size={12} color={Colors.roseDeep} />
                <Text style={styles.editLinkLabel}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.reviewDataGrid}>
              <View style={styles.reviewGridRow}>
                <Text style={styles.gridLabel}>Category</Text>
                <Text style={styles.gridValue}>{category}</Text>
              </View>
              <View style={styles.reviewGridRow}>
                <Text style={styles.gridLabel}>Price</Text>
                <Text style={styles.gridValue}>₹{Number(price).toLocaleString()}</Text>
              </View>
              <View style={styles.reviewGridRow}>
                <Text style={styles.gridLabel}>Delivery Time</Text>
                <Text style={styles.gridValue}>{deliveryTime}</Text>
              </View>
            </View>
          </View>

          {/* Description review */}
          <View style={styles.reviewDataCard}>
            <View style={styles.reviewCardHeader}>
              <Text style={styles.reviewDataTitle}>Description</Text>
              <TouchableOpacity onPress={() => setStep(1)} style={styles.editLinkBtn}>
                <Icon name="edit" size={12} color={Colors.roseDeep} />
                <Text style={styles.editLinkLabel}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.reviewDescText}>{shortDesc}</Text>
          </View>

          {/* Deliverables summary */}
          <View style={styles.reviewDataCard}>
            <View style={styles.reviewCardHeader}>
              <Text style={styles.reviewDataTitle}>What's Included</Text>
              <TouchableOpacity onPress={() => setStep(2)} style={styles.editLinkBtn}>
                <Icon name="edit" size={12} color={Colors.roseDeep} />
                <Text style={styles.editLinkLabel}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.deliverablesList}>
              {deliverables.map((del, i) => (
                <View key={i} style={styles.deliverableItem}>
                  <View style={styles.greenCheck}>
                    <Icon name="check" size={10} color={Colors.white} />
                  </View>
                  <Text style={styles.delLabelText}>{del}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Tags review */}
          <View style={styles.reviewDataCard}>
            <View style={styles.reviewCardHeader}>
              <Text style={styles.reviewDataTitle}>Tags</Text>
              <TouchableOpacity onPress={() => setStep(1)} style={styles.editLinkBtn}>
                <Icon name="edit" size={12} color={Colors.roseDeep} />
                <Text style={styles.editLinkLabel}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {tags.map((tag, i) => (
                <View key={i} style={[styles.tagPill, { paddingRight: 10 }]}>
                  <Text style={styles.tagPillText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Right Column / Pricing summaries & Tips */}
        <View style={styles.reviewAside}>
          {/* Pricing Summary */}
          <View style={styles.asideCard}>
            <Text style={styles.asideTitle}>Pricing Summary</Text>
            <View style={styles.asideDivider} />
            <View style={styles.asideRow}>
              <Text style={styles.asideLabel}>Package</Text>
              <Text style={[styles.asideVal, { color: Colors.roseDeep }]}>Basic</Text>
            </View>
            <View style={styles.asideRow}>
              <Text style={styles.asideLabel}>Price</Text>
              <Text style={[styles.asideVal, { fontWeight: '700' }]}>
                ₹{Number(price).toLocaleString()}
              </Text>
            </View>
            <View style={styles.asideRow}>
              <Text style={styles.asideLabel}>Delivery Time</Text>
              <Text style={styles.asideVal}>{deliveryTime}</Text>
            </View>
          </View>

          {/* Service Highlights */}
          <View style={styles.asideCard}>
            <Text style={styles.asideTitle}>Service Highlights</Text>
            <View style={styles.asideDivider} />
            <View style={styles.highlightRow}>
              <Icon name="edit" size={12} color={Colors.roseDeep} />
              <Text style={styles.highlightText}>High quality content</Text>
            </View>
            <View style={styles.highlightRow}>
              <Icon name="sparkle" size={12} color={Colors.roseDeep} />
              <Text style={styles.highlightText}>Engaging & authentic</Text>
            </View>
            <View style={styles.highlightRow}>
              <Icon name="clock" size={12} color={Colors.roseDeep} />
              <Text style={styles.highlightText}>On-time delivery</Text>
            </View>
            <View style={styles.highlightRow}>
              <Icon name="star" size={12} color={Colors.roseDeep} />
              <Text style={styles.highlightText}>100% satisfaction</Text>
            </View>
          </View>

          {/* Tips to get orders */}
          <View style={styles.asideCard}>
            <Text style={styles.asideTitle}>Tips to get more orders</Text>
            <View style={styles.asideDivider} />
            <Text style={styles.tipCheck}>
              <Icon name="check" size={10} color={Colors.green} /> Use a catchy title
            </Text>
            <Text style={styles.tipCheck}>
              <Icon name="check" size={10} color={Colors.green} /> Upload a clear sample video
            </Text>
            <Text style={styles.tipCheck}>
              <Icon name="check" size={10} color={Colors.green} /> Describe the benefits clearly
            </Text>
            <Text style={styles.tipCheck}>
              <Icon name="check" size={10} color={Colors.green} /> Set realistic delivery time
            </Text>
            <Text style={styles.tipCheck}>
              <Icon name="check" size={10} color={Colors.green} /> Add relevant tags
            </Text>
          </View>
        </View>
      </View>

      {/* Confirmation Checkbox */}
      <Controller
        control={control}
        name="confirmed"
        rules={{ required: 'Please check the confirmation box before publishing.' }}
        render={({ field: { onChange, value } }) => (
          <TouchableOpacity
            onPress={() => onChange(!value)}
            style={[styles.confirmCheckboxRow, errors.confirmed && { borderLeftWidth: 2, borderLeftColor: '#FF3B30', paddingLeft: 4 }]}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, value && styles.checkboxChecked, errors.confirmed && { borderColor: '#FF3B30' }]}>
              {value && <Icon name="check" size={10} color={Colors.white} />}
            </View>
            <Text style={styles.confirmLabel}>
              I confirm that all the information provided is accurate and I have the necessary rights to
              the content.
            </Text>
          </TouchableOpacity>
        )}
      />
      {errors.confirmed && (
        <Text style={{ color: '#FF3B30', fontSize: 11, marginTop: 4, paddingHorizontal: 16 }}>
          {errors.confirmed.message}
        </Text>
      )}

      {/* Actions Bottom */}
      <View style={styles.wizardFooterRow}>
        <TactileButton
          text="Back"
          onPress={handleBackStep}
          variant="white"
          icon="back"
          iconPosition="left"
          style={{ flex: 1 }}
          fullWidth
          disabled={submitting}
        />
        <TactileButton
          text={service ? 'Save Changes' : 'Publish Service 🚀'}
          onPress={handleSubmit}
          variant="primary"
          style={{ flex: 2 }}
          fullWidth
          loading={submitting}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepWrapper: {
    gap: 16,
  },
  sparkleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(180, 106, 116, 0.08)',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(180, 106, 116, 0.15)',
  },
  sparkleIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(180, 106, 116, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.roseDeep,
  },
  sparkleMessage: {
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.6)',
    fontFamily: FontFamily.sansMedium,
  },
  reviewLayout: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  reviewMain: {
    flex: 1.5,
    minWidth: 280,
    gap: 14,
  },
  reviewAside: {
    flex: 1,
    minWidth: 220,
    gap: 14,
  },
  reviewSecTitle: {
    fontSize: 11,
    fontFamily: FontFamily.sans,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  reviewPreviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.08)',
    ...Shadow.card,
  },
  reviewThumbContainer: {
    position: 'relative',
    height: 120,
  },
  reviewThumb: {
    width: '100%',
    height: '100%',
  },
  reviewThumbOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  reviewThumbPlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewThumbDur: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 4,
    color: Colors.white,
    fontSize: 8.5,
    fontWeight: '700',
  },
  reviewCardBody: {
    padding: 10,
    gap: 6,
  },
  reviewCardTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  reviewDataCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    ...Shadow.card,
    gap: 10,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewDataTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  editLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  editLinkLabel: {
    fontSize: 11,
    fontFamily: FontFamily.sans,
    color: Colors.roseDeep,
    fontWeight: '700',
  },
  reviewDataGrid: {
    gap: 8,
  },
  reviewGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.05)',
    paddingBottom: 6,
  },
  gridLabel: {
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.45)',
    fontFamily: FontFamily.sansMedium,
  },
  gridValue: {
    fontSize: 11.5,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '700',
  },
  reviewDescText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: 'rgba(63, 3, 11, 0.7)',
    fontFamily: FontFamily.sansMedium,
  },
  deliverablesList: {
    gap: 6,
  },
  deliverableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delLabelText: {
    fontSize: 12,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
  },
  asideCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    ...Shadow.card,
    gap: 8,
  },
  asideTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 2,
  },
  asideDivider: {
    height: 0.5,
    backgroundColor: 'rgba(63, 3, 11, 0.08)',
  },
  asideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  asideLabel: {
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.45)',
    fontFamily: FontFamily.sansMedium,
  },
  asideVal: {
    fontSize: 11.5,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '700',
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 1,
  },
  highlightText: {
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.75)',
    fontFamily: FontFamily.sansMedium,
  },
  tipCheck: {
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.7)',
    fontFamily: FontFamily.sansMedium,
    paddingVertical: 1,
  },
  confirmCheckboxRow: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.08)',
    marginTop: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(63, 3, 11, 0.3)',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.oxblood,
    borderColor: Colors.oxblood,
  },
  confirmLabel: {
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.65)',
    fontFamily: FontFamily.sansMedium,
    flex: 1,
    lineHeight: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(180, 106, 116, 0.15)',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    gap: 4,
  },
  platformText: {
    fontSize: 9.5,
    color: Colors.roseDeep,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '600',
  },
  wizardFooterRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(180, 106, 116, 0.1)',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 9,
    gap: 6,
  },
  tagPillText: {
    fontSize: 11.5,
    color: Colors.roseDeep,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
