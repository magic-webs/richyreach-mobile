import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  paymentType: string;
  costPerCreator: string;
  numCreators: string;
  prodName?: string;
  prodValue?: string;
  prodSku?: string;
  prodUrl?: string;
  prodDescription?: string;
  prodShipping?: string;
  status?: string;
}

export function CampaignBudgetSection({
  paymentType,
  costPerCreator,
  numCreators,
  prodName,
  prodValue,
  prodSku,
  prodUrl,
  prodDescription,
  prodShipping,
  status,
}: Props) {
  const isBarter = paymentType === 'Barter';
  const totalBudget = (parseInt(costPerCreator) || 0) * (parseInt(numCreators) || 0);

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeading}>Rewards & Budget</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoGridCell}>
          <Text style={styles.infoCellLabel}>Payment Type</Text>
          <Text style={[styles.infoCellVal, { textTransform: 'capitalize' }]}>{paymentType}</Text>
        </View>
        <View style={styles.infoGridCell}>
          <Text style={styles.infoCellLabel}>Cost per Creator</Text>
          <Text style={styles.infoCellVal}>
            {isBarter ? 'Product Barter' : `₹${(parseInt(costPerCreator) || 0).toLocaleString()}`}
          </Text>
        </View>
        <View style={styles.infoGridCell}>
          <Text style={styles.infoCellLabel}>Target Creators</Text>
          <Text style={styles.infoCellVal}>{numCreators}</Text>
        </View>
        <View style={styles.infoGridCell}>
          <Text style={styles.infoCellLabel}>Creator Budget</Text>
          <Text style={styles.infoCellValPrice}>
            {isBarter ? 'Barter' : `₹${totalBudget.toLocaleString()}`}
          </Text>
        </View>
      </View>

      {/* Budget Breakdown for Paid Campaigns */}
      {paymentType === 'Paid' && (
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownHeading}>Budget Breakdown</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsRowLabel}>Creator Budget Payout:</Text>
            <Text style={styles.detailsRowValue}>₹{totalBudget.toLocaleString()}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsRowLabel}>Platform Service Fee (10%):</Text>
            <Text style={styles.detailsRowValue}>₹{Math.floor(totalBudget / 9).toLocaleString()}</Text>
          </View>
          <View style={[styles.detailsRow, styles.totalRow]}>
            <Text style={styles.totalRowLabel}>Total Campaign Budget:</Text>
            <Text style={styles.totalRowValue}>₹{(totalBudget + Math.floor(totalBudget / 9)).toLocaleString()}</Text>
          </View>
        </View>
      )}

      {/* Barter Product Details */}
      {paymentType !== 'Paid' && prodName ? (
        <View style={styles.barterCard}>
          <Text style={styles.barterHeading}>Barter Product details</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsRowLabel}>Product Name:</Text>
            <Text style={styles.detailsRowValue}>{prodName}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsRowLabel}>Product Value:</Text>
            <Text style={styles.detailsRowValue}>
              ₹{(parseInt(prodValue || '0') || 0).toLocaleString()}
            </Text>
          </View>
          {prodSku ? (
            <View style={styles.detailsRow}>
              <Text style={styles.detailsRowLabel}>SKU / Code:</Text>
              <Text style={styles.detailsRowValue}>{prodSku}</Text>
            </View>
          ) : null}
          {prodUrl ? (
            <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(prodUrl)}>
              <Text style={styles.linkText}>View Product Link ↗</Text>
            </TouchableOpacity>
          ) : null}
          {prodDescription ? (
            <View style={{ marginTop: 6 }}>
              <Text style={styles.barterDescLabel}>Product Description:</Text>
              <Text style={styles.barterDescVal}>{prodDescription}</Text>
            </View>
          ) : null}
          {prodShipping ? (
            <View style={{ marginTop: 6 }}>
              <Text style={styles.barterDescLabel}>Shipping Instructions:</Text>
              <Text style={styles.barterDescVal}>{prodShipping}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.05)',
    ...Shadow.card,
    gap: 12,
  },
  sectionHeading: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoGridCell: {
    width: '46%',
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
    gap: 4,
  },
  infoCellLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10,
    color: 'rgba(63, 3, 11, 0.45)',
    fontWeight: '600',
  },
  infoCellVal: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  infoCellValPrice: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.green,
  },
  barterCard: {
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    marginTop: 6,
    gap: 6,
  },
  barterHeading: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Colors.oxblood,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  breakdownCard: {
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    marginTop: 6,
    gap: 6,
  },
  breakdownHeading: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Colors.oxblood,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  totalRow: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(63, 3, 11, 0.08)',
    marginTop: 6,
    paddingTop: 6,
  },
  totalRowLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  totalRowValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  draftSection: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(63, 3, 11, 0.08)',
    marginTop: 6,
    paddingTop: 6,
    gap: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  detailsRowLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(63, 3, 11, 0.55)',
  },
  detailsRowValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  linkRow: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  linkText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.roseDeep,
    fontWeight: '700',
  },
  barterDescLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: 'rgba(63, 3, 11, 0.45)',
  },
  barterDescVal: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    color: 'rgba(42, 2, 7, 0.75)',
    marginTop: 2,
    lineHeight: 18,
  },
});
