import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GradientView } from '@/components/ui/gradient-view';
import { Icon } from '@/components/ui/icon';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Colors, FontFamily, Shadow } from '@/constants/brand';

const { width: W } = Dimensions.get('window');

interface LiveCampaignsProps {
  campaignList: any[];
  onSeeAllPress: () => void;
  onCampaignPress: (id: string) => void;
}

export function LiveCampaigns({ campaignList, onSeeAllPress, onCampaignPress }: LiveCampaignsProps) {
  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <GradientView variant="rose" style={styles.sectionIcon}>
          <Icon name="briefcase" size={16} color="#fff" />
        </GradientView>
        <Text style={styles.sectionTitle}>Live campaigns</Text>
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <View style={styles.campaignGrid}>
        {campaignList.slice(0, 4).map((cm) => (
          <TouchableOpacity
            key={cm.id}
            onPress={() => onCampaignPress(cm.id)}
            activeOpacity={0.85}
            style={styles.campaignCard}
          >
            <View style={styles.campaignThumb}>
              <PlaceholderImage tone={cm.tone} height={92} borderRadius={0} />
              <View style={styles.campaignApplied}>
                <Text style={styles.campaignAppliedText}>{cm.applicants} applied</Text>
              </View>
              {cm.verified && (
                <View style={styles.verifiedBadge}>
                  <Icon name="verified" size={14} color={Colors.cream} />
                </View>
              )}
            </View>
            <View style={styles.campaignInfo}>
              <Text style={styles.campaignBrand} numberOfLines={1}>
                {cm.brand}
              </Text>
              <View style={styles.campaignFooter}>
                <Text style={styles.campaignBudget}>{cm.budget}</Text>
                <GradientView variant="rose" style={styles.campaignArrow}>
                  <Icon name="arrow" size={14} color="#fff" />
                </GradientView>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 22 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontFamily: FontFamily.serif, fontSize: 20, fontWeight: '700', color: Colors.ink, flex: 1 },
  seeAll: { fontSize: 13, color: Colors.rose, fontWeight: '700' },
  campaignGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  campaignCard: { width: (W - 36 - 14) / 2, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', ...Shadow.card },
  campaignThumb: { position: 'relative' },
  campaignApplied: { position: 'absolute', top: 7, right: 7, backgroundColor: 'rgba(42,2,7,0.62)', borderRadius: 99, paddingHorizontal: 7, paddingVertical: 3 },
  campaignAppliedText: { color: Colors.cream, fontSize: 10, fontWeight: '700' },
  verifiedBadge: { position: 'absolute', bottom: 7, left: 7, width: 20, height: 20, borderRadius: 99, backgroundColor: Colors.oxblood, alignItems: 'center', justifyContent: 'center' },
  campaignInfo: { padding: 10 },
  campaignBrand: { fontWeight: '700', fontSize: 13.5, color: Colors.ink },
  campaignFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  campaignBudget: { fontFamily: FontFamily.serif, fontSize: 16, fontWeight: '700', color: Colors.oxblood },
  campaignArrow: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
