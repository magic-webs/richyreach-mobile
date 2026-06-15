import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily } from '@/constants/brand';

import { useCampaignWizardStore } from '@/store/campaignWizard';

interface StepMediaReviewProps {
  onPublish: () => void;
}

export function StepMediaReview({ onPublish }: StepMediaReviewProps) {
  const {
    campaignBanner,
    brandLogo,
    sampleCreative,
    referenceLinks,
    startDate,
    endDate,
    applicationDeadline,
    contentUsageRights,
    whitelistingPermission,
    paidAdsPermission,
    exclusivityMonths,
    ndaRequired,
    contractRequired,
    autoApprove,
    revisionCount,
    couponCode,
    trackingLink,
    affiliateCommType,
    affiliateCommValue,
    appQuestions,
    brandName,
    campName,
    campNiche,
    campObjective,
    paymentType,
    costPerCreator,
    numCreators,
    campLocationValue,
    campLocationType,
    campaignBannerUri,
    brandLogoUri,
    sampleCreativeUri,
    addQuestion,
    removeQuestion,
    updateField,
  } = useCampaignWizardStore();

  const [newQuestion, setNewQuestion] = useState('');

  const cost = parseInt(costPerCreator) || 0;
  const creators = parseInt(numCreators) || 0;
  const totalBudget = cost * creators;

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      addQuestion(newQuestion.trim());
      setNewQuestion('');
    }
  };

  const handleBack = () => {
    updateField('createStep', 4);
  };

  const pickImage = async (field: 'campaignBannerUri' | 'brandLogoUri' | 'sampleCreativeUri') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      updateField(field, result.assets[0].uri);
    }
  };

  const clearImage = (field: 'campaignBannerUri' | 'brandLogoUri' | 'sampleCreativeUri') => {
    updateField(field, null);
  };

  const renderImagePicker = (label: string, uri: string | null, field: 'campaignBannerUri' | 'brandLogoUri' | 'sampleCreativeUri') => (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>{label}</Text>
      {uri ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.clearImageBtn} onPress={() => clearImage(field)}>
            <Icon name="x" size={12} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.imagePickerBtn} onPress={() => pickImage(field)} activeOpacity={0.8}>
          <Icon name="image" size={20} color={Colors.roseDeep} />
          <Text style={styles.imagePickerText}>Select from device</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Media Guidelines & Links</Text>
        
        {renderImagePicker('Campaign Banner Image', campaignBannerUri, 'campaignBannerUri')}
        {renderImagePicker('Brand Logo', brandLogoUri, 'brandLogoUri')}
        {renderImagePicker('Sample Creative / Guidelines', sampleCreativeUri, 'sampleCreativeUri')}

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Reference Video / Post URL</Text>
          <TextInput
            style={styles.formInput}
            placeholder="https://instagram.com/p/..."
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={referenceLinks}
            onChangeText={(v) => updateField('referenceLinks', v)}
          />
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Campaign Timeline Dates</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Campaign Start Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="2026-07-01"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={startDate}
            onChangeText={(v) => updateField('startDate', v)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Campaign End Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="2026-07-30"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={endDate}
            onChangeText={(v) => updateField('endDate', v)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Application Deadline (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="2026-06-25"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={applicationDeadline}
            onChangeText={(v) => updateField('applicationDeadline', v)}
          />
        </View>
      </View>

      {/* Legal Permissions */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Legal & Rights</Text>
        
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Content Usage Rights</Text>
          <TouchableOpacity
            style={[styles.switchTrack, contentUsageRights && styles.switchTrackActive]}
            onPress={() => updateField('contentUsageRights', !contentUsageRights)}
            activeOpacity={0.8}
          >
            <View style={[styles.switchThumb, contentUsageRights && styles.switchThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Whitelisting Permission</Text>
          <TouchableOpacity
            style={[styles.switchTrack, whitelistingPermission && styles.switchTrackActive]}
            onPress={() => updateField('whitelistingPermission', !whitelistingPermission)}
            activeOpacity={0.8}
          >
            <View style={[styles.switchThumb, whitelistingPermission && styles.switchThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Paid Ads Permission</Text>
          <TouchableOpacity
            style={[styles.switchTrack, paidAdsPermission && styles.switchTrackActive]}
            onPress={() => updateField('paidAdsPermission', !paidAdsPermission)}
            activeOpacity={0.8}
          >
            <View style={[styles.switchThumb, paidAdsPermission && styles.switchThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>NDA Required</Text>
          <TouchableOpacity
            style={[styles.switchTrack, ndaRequired && styles.switchTrackActive]}
            onPress={() => updateField('ndaRequired', !ndaRequired)}
            activeOpacity={0.8}
          >
            <View style={[styles.switchThumb, ndaRequired && styles.switchThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Exclusivity Duration (Months)</Text>
          <TextInput
            style={[styles.formInput, { width: 80, height: 36, textAlign: 'center' }]}
            keyboardType="numeric"
            value={exclusivityMonths}
            onChangeText={(v) => updateField('exclusivityMonths', v)}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Contract Required</Text>
          <TouchableOpacity
            style={[styles.switchTrack, contractRequired && styles.switchTrackActive]}
            onPress={() => updateField('contractRequired', !contractRequired)}
            activeOpacity={0.8}
          >
            <View style={[styles.switchThumb, contractRequired && styles.switchThumbActive]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Approval settings */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Approval Workflow</Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Auto Approve Content</Text>
          <TouchableOpacity
            style={[styles.switchTrack, autoApprove && styles.switchTrackActive]}
            onPress={() => updateField('autoApprove', !autoApprove)}
            activeOpacity={0.8}
          >
            <View style={[styles.switchThumb, autoApprove && styles.switchThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Revision Limit Count</Text>
          <TextInput
            style={[styles.formInput, { width: 80, height: 36, textAlign: 'center' }]}
            keyboardType="numeric"
            value={revisionCount}
            onChangeText={(v) => updateField('revisionCount', v)}
          />
        </View>
      </View>

      {/* Advanced coupon and affiliate */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Advanced Settings</Text>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Coupon Code Preset</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. SUMMER20"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={couponCode}
            onChangeText={(v) => updateField('couponCode', v)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>UTM Tracking Link</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. https://brand.com/?utm_source=rr"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={trackingLink}
            onChangeText={(v) => updateField('trackingLink', v)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Affiliate Commission Type</Text>
          <View style={styles.toggleRow}>
            {(['Fixed', 'Percentage'] as const).map((type) => {
              const active = affiliateCommType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                  onPress={() => updateField('affiliateCommType', type)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{type}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Affiliate Commission Value ({affiliateCommType === 'Percentage' ? '%' : '₹'})</Text>
          <TextInput
            style={styles.formInput}
            keyboardType="numeric"
            placeholder="e.g. 10"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={affiliateCommValue}
            onChangeText={(v) => updateField('affiliateCommValue', v)}
          />
        </View>
      </View>

      {/* Creator Application Custom Questions */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Creator Application Questions</Text>
        {appQuestions.map((item, idx) => (
          <View key={idx} style={styles.listItem}>
            <View style={styles.listTextContainer}>
              <Icon name="star" size={14} color={Colors.oxblood} />
              <Text style={styles.listText}>{item}</Text>
            </View>
            <TouchableOpacity onPress={() => removeQuestion(idx)} activeOpacity={0.7}>
              <Icon name="trash" size={14} color={Colors.roseDeep} />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addInputRow}>
          <TextInput
            style={[styles.formInput, { flex: 1, height: 38 }]}
            placeholder="Add application question..."
            placeholderTextColor="rgba(63,3,11,0.3)"
            value={newQuestion}
            onChangeText={setNewQuestion}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddQuestion} activeOpacity={0.8}>
            <Icon name="plus" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Brief Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Campaign Summary Preview</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Brand Name</Text>
          <Text style={styles.summaryValue}>{brandName}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Campaign Title</Text>
          <Text style={styles.summaryValue}>{campName}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Niche & Objective</Text>
          <Text style={styles.summaryValue}>{campNiche} · {campObjective}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment Type</Text>
          <Text style={styles.summaryValue}>{paymentType}</Text>
        </View>
        {paymentType !== 'Barter' && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Calculated Budget</Text>
            <Text style={styles.summaryValue}>₹{totalBudget.toLocaleString('en-IN')}</Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Target Location</Text>
          <Text style={styles.summaryValue}>{campLocationValue || campLocationType}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.launchBtn} onPress={onPublish} activeOpacity={0.85}>
          <Text style={styles.launchBtnText}>Publish Campaign</Text>
        </TouchableOpacity>
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
  imagePickerBtn: {
    backgroundColor: 'rgba(63,3,11,0.03)',
    borderRadius: 12,
    height: 46,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePickerText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.roseDeep,
  },
  imagePreviewContainer: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  clearImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: Colors.oxblood,
  },
  toggleText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.oxblood,
  },
  toggleTextActive: {
    fontFamily: FontFamily.sans,
    color: '#ffffff',
  },
  sectionCard: {
    backgroundColor: 'rgba(63,3,11,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.05)',
    borderRadius: 14,
    padding: 12,
    gap: 12,
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.05)',
  },
  listTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  listText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.ink,
    flex: 1,
    marginRight: 12,
  },
  addInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  addButton: {
    width: 40,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  switchTrack: {
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.creamDk,
    padding: 2,
  },
  switchTrackActive: {
    backgroundColor: Colors.oxblood,
  },
  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
  },
  switchThumbActive: {
    transform: [{ translateX: 18 }],
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
  summaryValue: {
    fontFamily: FontFamily.sans,
    fontSize: 12.5,
    color: Colors.oxblood,
    textAlign: 'right',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  backBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.creamDk,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  backBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: Colors.oxblood,
  },
  launchBtn: {
    flex: 2,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  launchBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: '#ffffff',
  },
});
