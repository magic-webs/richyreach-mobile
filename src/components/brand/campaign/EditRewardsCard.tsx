import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PAYMENT_TYPES = ['Paid', 'Barter', 'Hybrid'];

interface Props {
  paymentType: string;
  costPerCreator: string;
  numCreators: string;
  prodName: string;
  prodValue: string;
  prodSku: string;
  prodUrl: string;
  prodDescription: string;
  prodShipping: string;
  onChangePaymentType: (v: string) => void;
  onChangeCostPerCreator: (v: string) => void;
  onChangeNumCreators: (v: string) => void;
  onChangeProdName: (v: string) => void;
  onChangeProdValue: (v: string) => void;
  onChangeProdSku: (v: string) => void;
  onChangeProdUrl: (v: string) => void;
  onChangeProdDescription: (v: string) => void;
  onChangeProdShipping: (v: string) => void;
}

export function EditRewardsCard({
  paymentType,
  costPerCreator,
  numCreators,
  prodName,
  prodValue,
  prodSku,
  prodUrl,
  prodDescription,
  prodShipping,
  onChangePaymentType,
  onChangeCostPerCreator,
  onChangeNumCreators,
  onChangeProdName,
  onChangeProdValue,
  onChangeProdSku,
  onChangeProdUrl,
  onChangeProdDescription,
  onChangeProdShipping,
}: Props) {
  return (
    <View style={styles.formSectionCard}>
      <Text style={styles.formSectionHeader}>Rewards & Payment</Text>

      {/* Payment Type */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Payment Type</Text>
        <View style={styles.toggleRow}>
          {PAYMENT_TYPES.map((type) => {
            const active = paymentType.toLowerCase() === type.toLowerCase();
            return (
              <TouchableOpacity
                key={type}
                style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                onPress={() => onChangePaymentType(type)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{type}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Cash Compensation */}
      {paymentType !== 'Barter' && (
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Cash Compensation Details</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.inputSubLabel}>Rate per Creator (₹)</Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                value={costPerCreator}
                onChangeText={onChangeCostPerCreator}
              />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.inputSubLabel}>No. of Creators</Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                value={numCreators}
                onChangeText={onChangeNumCreators}
              />
            </View>
          </View>
        </View>
      )}

      {/* Barter Product Form */}
      {paymentType !== 'Paid' && (
        <View style={styles.barterFormCard}>
          <Text style={styles.barterHeading}>Product Details *</Text>

          <View style={styles.formGroup}>
            <Text style={styles.inputSubLabel}>Product Name *</Text>
            <TextInput
              style={styles.formInput}
              value={prodName}
              onChangeText={onChangeProdName}
              placeholder="e.g. Lip Gloss Trio Bundle"
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.inputSubLabel}>Estimated Value (₹)</Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                value={prodValue}
                onChangeText={onChangeProdValue}
                placeholder="2499"
              />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.inputSubLabel}>SKU / Reference ID</Text>
              <TextInput
                style={styles.formInput}
                value={prodSku}
                onChangeText={onChangeProdSku}
                placeholder="LG-TRIO-01"
              />
            </View>
          </View>

          <View style={[styles.formGroup, { marginTop: 8 }]}>
            <Text style={styles.inputSubLabel}>Product Link (URL)</Text>
            <TextInput
              style={styles.formInput}
              value={prodUrl}
              onChangeText={onChangeProdUrl}
              placeholder="https://brand.com/products/lipgloss"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={[styles.formGroup, { marginTop: 8 }]}>
            <Text style={styles.inputSubLabel}>Product Description</Text>
            <TextInput
              style={[styles.formInput, styles.smallTextArea]}
              multiline
              numberOfLines={3}
              value={prodDescription}
              onChangeText={onChangeProdDescription}
              placeholder="Briefly describe the product rewards..."
            />
          </View>

          <View style={[styles.formGroup, { marginTop: 8 }]}>
            <Text style={styles.inputSubLabel}>Shipping Details / Instructions</Text>
            <TextInput
              style={[styles.formInput, styles.smallTextArea]}
              multiline
              numberOfLines={3}
              value={prodShipping}
              onChangeText={onChangeProdShipping}
              placeholder="Shipping timeline or region requirements..."
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  formSectionCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.05)',
    ...Shadow.card,
    gap: 12,
  },
  formSectionHeader: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.oxblood,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63, 3, 11, 0.08)',
    paddingBottom: 4,
    marginBottom: 4,
  },
  formGroup: {
    gap: 6,
    marginBottom: 4,
  },
  formLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 10.5,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputSubLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 11,
    color: 'rgba(63, 3, 11, 0.5)',
  },
  formInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    fontSize: 14,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
  },
  smallTextArea: {
    height: 70,
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  toggleBtn: {
    flex: 1,
    minWidth: '22%',
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(63, 3, 11, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: Colors.oxblood,
    borderColor: Colors.oxblood,
  },
  toggleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11.5,
    color: Colors.oxblood,
  },
  toggleTextActive: {
    fontFamily: FontFamily.sans,
    color: Colors.white,
    fontWeight: '700',
  },
  barterFormCard: {
    backgroundColor: 'rgba(63, 3, 11, 0.015)',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.06)',
    marginTop: 8,
    gap: 8,
  },
  barterHeading: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Colors.oxblood,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
});
