import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/icon';
import { Colors } from '@/constants/brand';
import { styles } from '../CreateServiceSheet';
import { TactileButton } from '@/components/ui/tactile-button';

interface Step3ReviewProps {
  thumbnailUrl: string;
  getFrames: () => any[];
  selectedFrameIdx: number;
  name: string;
  category: string;
  subCategory: string;
  price: string;
  deliveryTime: string;
  detailedDesc: string;
  shortDesc: string;
  deliverables: string[];
  tags: string[];
  confirmed: boolean;
  setConfirmed: (val: boolean) => void;
  submitting: boolean;
  handleBackStep: () => void;
  handleSubmit: () => void;
  setStep: (step: number) => void;
  service: any;
}

export function Step3Review({
  thumbnailUrl,
  getFrames,
  selectedFrameIdx,
  name,
  category,
  subCategory,
  price,
  deliveryTime,
  detailedDesc,
  shortDesc,
  deliverables,
  tags,
  confirmed,
  setConfirmed,
  submitting,
  handleBackStep,
  handleSubmit,
  setStep,
  service,
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
                    : typeof getFrames()[selectedFrameIdx >= 0 ? selectedFrameIdx : 0] === 'string'
                    ? { uri: getFrames()[selectedFrameIdx >= 0 ? selectedFrameIdx : 0] as string }
                    : getFrames()[selectedFrameIdx >= 0 ? selectedFrameIdx : 0]
                }
                style={styles.reviewThumb}
                contentFit="cover"
              />
              <View style={styles.reviewThumbOverlay} />
              <View style={styles.reviewThumbPlay}>
                <Icon name="play" size={20} color={Colors.white} />
              </View>
              <Text style={styles.reviewThumbDur}>00:34</Text>
            </View>
            <View style={styles.reviewCardBody}>
              <Text style={styles.reviewCardTitle}>{name}</Text>

              <View style={styles.tagsRow}>
                <View style={styles.platformBadge}>
                  <Icon
                    name={category.toLowerCase() === 'youtube' ? 'play' : 'camera'}
                    size={11}
                    color={Colors.roseDeep}
                  />
                  <Text style={styles.platformText}>{category}</Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{subCategory}</Text>
                </View>
              </View>

              <View style={styles.ratingRow}>
                <Icon name="star" size={12} color={Colors.gold} />
                <Text style={styles.ratingText}>
                  <Text style={{ fontWeight: '700' }}>4.9</Text> (26 reviews)
                </Text>
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
                <Text style={styles.gridLabel}>Sub Category</Text>
                <Text style={styles.gridValue}>{subCategory}</Text>
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
              <TouchableOpacity onPress={() => setStep(2)} style={styles.editLinkBtn}>
                <Icon name="edit" size={12} color={Colors.roseDeep} />
                <Text style={styles.editLinkLabel}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.reviewDescText}>{detailedDesc || shortDesc}</Text>
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

          {/* You're in control card */}
          <View
            style={[
              styles.asideCard,
              {
                backgroundColor: 'rgba(180, 106, 116, 0.08)',
                borderColor: 'rgba(180, 106, 116, 0.2)',
              },
            ]}
          >
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Icon name="settings" size={14} color={Colors.roseDeep} />
              <Text style={[styles.asideTitle, { marginBottom: 0 }]}>You're in control</Text>
            </View>
            <Text style={styles.controlSubText}>
              You can edit all details anytime after publishing.
            </Text>
          </View>
        </View>
      </View>

      {/* Confirmation Checkbox */}
      <TouchableOpacity
        onPress={() => setConfirmed(!confirmed)}
        style={styles.confirmCheckboxRow}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
          {confirmed && <Icon name="check" size={10} color={Colors.white} />}
        </View>
        <Text style={styles.confirmLabel}>
          I confirm that all the information provided is accurate and I have the necessary rights to
          the content.
        </Text>
      </TouchableOpacity>

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
