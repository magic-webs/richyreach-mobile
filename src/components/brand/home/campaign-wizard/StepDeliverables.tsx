import { Colors, FontFamily } from '@/constants/brand';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';

import { TactileButton } from '@/components/ui/tactile-button';
import { useCampaignWizardStore } from '@/store/campaignWizard';

export function StepDeliverables() {
  "use no memo";
  const { updateField } = useCampaignWizardStore();
  const { control, setValue, trigger, watch, formState: { errors } } = useFormContext();

  const paymentType = watch('paymentType');
  const campaignBudget = watch('campaignBudget');
  const numCreators = watch('numCreators');

  const totalBudget = parseInt(campaignBudget) || 0;
  const creators = parseInt(numCreators) || 0;
  const platformFee = Math.floor(totalBudget * 0.1);
  const netPayout = totalBudget - platformFee;
  const costPerCreatorCalculated = creators > 0 ? Math.floor(netPayout / creators) : 0;

  const handleNext = async () => {
    const fieldsToValidate = [];
    if (paymentType === 'Paid' || paymentType === 'Hybrid') {
      fieldsToValidate.push('campaignBudget', 'numCreators');
    }
    if (paymentType === 'Barter' || paymentType === 'Hybrid') {
      fieldsToValidate.push('prodName', 'prodValue');
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      updateField('createStep', 3);
    }
  };

  const handleBack = () => {
    updateField('createStep', 1);
  };

  return (
    <View style={{ gap: 16 }}>
      {/* Campaign Type Selector */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Campaign Type *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
          {(['Paid', 'Barter', 'Hybrid'] as const).map((type) => {
            const active = paymentType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.toggleBtn, active && styles.toggleBtnActive, { minWidth: 90, marginHorizontal: 4 }]}
                onPress={() => setValue('paymentType', type)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{type}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Barter Product Details */}
      {(paymentType === 'Barter' || paymentType === 'Hybrid') && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Barter Product Information</Text>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Product Name *</Text>
            <Controller
              control={control}
              name="prodName"
              rules={{ required: 'Product name is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.formInput, errors.prodName && styles.formInputError]}
                  placeholder="e.g. Skin Hydration Serum"
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.prodName && <Text style={styles.errorText}>{errors.prodName.message as string}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Product Retail Value (₹) *</Text>
            <Controller
              control={control}
              name="prodValue"
              rules={{
                required: 'Product retail value is required',
                pattern: { value: /^\d+$/, message: 'Must be a valid number' }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.formInput, errors.prodValue && styles.formInputError]}
                  placeholder="e.g. 1499"
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.prodValue && <Text style={styles.errorText}>{errors.prodValue.message as string}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Product Description</Text>
            <Controller
              control={control}
              name="prodDescription"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  multiline
                  placeholder="Describe the product details..."
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>SKU / Product Code</Text>
            <Controller
              control={control}
              name="prodSku"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. SERUM-HYD-50"
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Product Page URL</Text>
            <Controller
              control={control}
              name="prodUrl"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. https://brand.com/serum"
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Shipping / Delivery Details</Text>
            <Controller
              control={control}
              name="prodShipping"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Shipped via BlueDart within 3 days of selection"
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
        </View>
      )}

      {/* Budget configuration for Paid & Hybrid */}
      {paymentType !== 'Barter' && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Budget Configuration</Text>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Total Campaign Budget (₹) *</Text>
            <Controller
              control={control}
              name="campaignBudget"
              rules={{
                required: 'Total campaign budget is required',
                pattern: { value: /^\d+$/, message: 'Must be a valid number' },
                validate: (val) => parseInt(val) >= 1000 || 'Minimum budget is ₹1,000 to cover platform fee'
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.formInput, errors.campaignBudget && styles.formInputError]}
                  keyboardType="numeric"
                  placeholder="e.g. 10000"
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.campaignBudget && <Text style={styles.errorText}>{errors.campaignBudget.message as string}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Number of Creators *</Text>
            <Controller
              control={control}
              name="numCreators"
              rules={{
                required: 'Number of creators is required',
                pattern: { value: /^\d+$/, message: 'Must be a valid number' },
                validate: (val) => parseInt(val) > 0 || 'Must be at least 1 creator'
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.formInput, errors.numCreators && styles.formInputError]}
                  keyboardType="numeric"
                  placeholder="e.g. 5"
                  placeholderTextColor="rgba(63,3,11,0.35)"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.numCreators && <Text style={styles.errorText}>{errors.numCreators.message as string}</Text>}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Budget Breakdown</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Campaign Budget</Text>
              <Text style={styles.summaryVal}>₹{totalBudget.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Platform Fee</Text>
              <Text style={[styles.summaryVal, { color: '#e74c3c' }]}>-₹{platformFee.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Net Creators Payout</Text>
              <Text style={styles.summaryVal}>₹{netPayout.toLocaleString('en-IN')}</Text>
            </View>
            <View style={[styles.summaryRow, { borderTopWidth: 0.5, borderTopColor: 'rgba(63,3,11,0.08)', marginTop: 6, paddingTop: 6 }]}>
              <Text style={styles.summaryLabel}>Estimated Pay per Creator</Text>
              <Text style={styles.totalBudgetPrice}>₹{costPerCreatorCalculated.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.bottomRow}>
        <TactileButton text="Back" onPress={handleBack} icon="arrowLeft" iconPosition="left" variant="secondary" />
        <TactileButton onPress={handleNext} text="Next" icon="arrow" iconPosition="right" variant="primary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    gap: 6,
    marginBottom: 6,
  },
  formLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 10.5,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
  formInputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 11,
    fontFamily: FontFamily.sansMedium,
    marginTop: 4,
    marginBottom: 4,
  },
  textArea: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: 'rgba(63,3,11,0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: Colors.oxblood,
    borderWidth: 1.5,
  },
  toggleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.oxblood,
  },
  toggleTextActive: {
    fontFamily: FontFamily.sans,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: 'rgba(63,3,11,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.05)',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  sectionCardError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  sectionHeader: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.oxblood,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.08)',
    paddingBottom: 4,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  counterLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.creamDk,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 16,
    color: Colors.oxblood,
  },
  counterValue: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    color: Colors.oxblood,
    width: 20,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: 'rgba(63,3,11,0.04)',
    borderRadius: 14,
    padding: 12,
  },
  summaryTitle: {
    fontFamily: FontFamily.serif,
    fontSize: 15,
    color: Colors.ink,
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.55)',
  },
  summaryVal: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: Colors.ink,
    fontWeight: '600',
  },
  totalBudgetPrice: {
    fontFamily: FontFamily.sans,
    fontSize: 18,
    color: Colors.oxblood,
  },
  bottomRow: {
    justifyContent: 'space-between',
    width: "100%",
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  horizontalScrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
});
