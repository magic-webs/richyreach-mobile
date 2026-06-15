import { Colors, FontFamily } from '@/constants/brand';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { TactileButton } from '@/components/ui/tactile-button';
import { useCampaignWizardStore } from '@/store/campaignWizard';
import { useUIStore } from '@/store/ui';

export function StepDeliverables() {
  const showModal = useUIStore((s) => s.showModal);
  const {
    reelCount,
    storyCount,
    postCount,
    carouselCount,
    ytShortCount,
    ytVideoCount,
    liveCount,
    paymentType,
    costPerCreator,
    numCreators,
    paymentMethod,
    paymentTimeline,
    prodName,
    prodValue,
    prodDescription,
    prodSku,
    prodUrl,
    prodShipping,
    updateField,
  } = useCampaignWizardStore();

  const cost = parseInt(costPerCreator) || 0;
  const creators = parseInt(numCreators) || 0;
  const totalBudget = cost * creators;

  const handleNext = () => {
    if (reelCount === 0 && storyCount === 0 && postCount === 0 && carouselCount === 0 && ytShortCount === 0 && ytVideoCount === 0 && liveCount === 0) {
      showModal({ title: 'OOps!', message: 'Please select at least 1 deliverable quantity.' });
      return;
    }
    if ((paymentType === 'Barter' || paymentType === 'Hybrid') && !prodName.trim()) {
      showModal({ title: 'OOps!', message: 'Product name is required for barter campaigns.' });
      return;
    }
    updateField('createStep', 3);
  };

  const handleBack = () => {
    updateField('createStep', 1);
  };

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Deliverables Quantity</Text>

        {/* Reels count */}
        <View style={styles.counterRow}>
          <Text style={styles.counterLabel}>Instagram Reel</Text>
          <View style={styles.counterControls}>
            <TouchableOpacity style={styles.counterBtn} onPress={() => updateField('reelCount', Math.max(0, reelCount - 1))}>
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{reelCount}</Text>
            <TouchableOpacity style={styles.counterBtn} onPress={() => updateField('reelCount', reelCount + 1)}>
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stories count */}
        <View style={styles.counterRow}>
          <Text style={styles.counterLabel}>Instagram Story</Text>
          <View style={styles.counterControls}>
            <TouchableOpacity style={styles.counterBtn} onPress={() => updateField('storyCount', Math.max(0, storyCount - 1))}>
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{storyCount}</Text>
            <TouchableOpacity style={styles.counterBtn} onPress={() => updateField('storyCount', storyCount + 1)}>
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Static posts count */}
        <View style={styles.counterRow}>
          <Text style={styles.counterLabel}>Instagram Feed Post</Text>
          <View style={styles.counterControls}>
            <TouchableOpacity style={styles.counterBtn} onPress={() => updateField('postCount', Math.max(0, postCount - 1))}>
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{postCount}</Text>
            <TouchableOpacity style={styles.counterBtn} onPress={() => updateField('postCount', postCount + 1)}>
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Carousels count */}
        <View style={styles.counterRow}>
          <Text style={styles.counterLabel}>Instagram Carousel</Text>
          <View style={styles.counterControls}>
            <TouchableOpacity style={styles.counterBtn} onPress={() => updateField('carouselCount', Math.max(0, carouselCount - 1))}>
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{carouselCount}</Text>
            <TouchableOpacity style={styles.counterBtn} onPress={() => updateField('carouselCount', carouselCount + 1)}>
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* YouTube short count */}
        <View style={styles.counterRow}>
          <Text style={styles.counterLabel}>YouTube Short</Text>
          <View style={styles.counterControls}>
            <TouchableOpacity style={styles.counterBtn} onPress={() => updateField('ytShortCount', Math.max(0, ytShortCount - 1))}>
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{ytShortCount}</Text>
            <TouchableOpacity style={styles.counterBtn} onPress={() => updateField('ytShortCount', ytShortCount + 1)}>
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* YouTube video count */}
        <View style={styles.counterRow}>
          <Text style={styles.counterLabel}>YouTube Video</Text>
          <View style={styles.counterControls}>
            <TouchableOpacity style={styles.counterBtn} onPress={() => updateField('ytVideoCount', Math.max(0, ytVideoCount - 1))}>
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{ytVideoCount}</Text>
            <TouchableOpacity style={styles.counterBtn} onPress={() => updateField('ytVideoCount', ytVideoCount + 1)}>
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Campaign Type *</Text>
        <View style={styles.toggleRow}>
          {(['Paid', 'Barter', 'Hybrid'] as const).map((type) => {
            const active = paymentType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                onPress={() => updateField('paymentType', type)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{type}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Barter Product Details */}
      {(paymentType === 'Barter' || paymentType === 'Hybrid') && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Barter Product Information</Text>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Product Name *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. Skin Hydration Serum"
              placeholderTextColor="rgba(63,3,11,0.35)"
              value={prodName}
              onChangeText={(v) => updateField('prodName', v)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Product Retail Value (₹)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. 1499"
              placeholderTextColor="rgba(63,3,11,0.35)"
              keyboardType="numeric"
              value={prodValue}
              onChangeText={(v) => updateField('prodValue', v)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Product Description</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              multiline
              placeholder="Describe the product details..."
              placeholderTextColor="rgba(63,3,11,0.35)"
              value={prodDescription}
              onChangeText={(v) => updateField('prodDescription', v)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>SKU / Product Code</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. SERUM-HYD-50"
              placeholderTextColor="rgba(63,3,11,0.35)"
              value={prodSku}
              onChangeText={(v) => updateField('prodSku', v)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Product Page URL</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. https://brand.com/serum"
              placeholderTextColor="rgba(63,3,11,0.35)"
              value={prodUrl}
              onChangeText={(v) => updateField('prodUrl', v)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Shipping / Delivery Details</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. Shipped via BlueDart within 3 days of selection"
              placeholderTextColor="rgba(63,3,11,0.35)"
              value={prodShipping}
              onChangeText={(v) => updateField('prodShipping', v)}
            />
          </View>
        </View>
      )}

      {/* Budget section for Paid & Hybrid */}
      {paymentType !== 'Barter' && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Budget Configuration</Text>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Cost per Creator (₹) *</Text>
            <TextInput
              style={styles.formInput}
              keyboardType="numeric"
              placeholder="e.g. 5000"
              placeholderTextColor="rgba(63,3,11,0.35)"
              value={costPerCreator}
              onChangeText={(v) => updateField('costPerCreator', v)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Number of Creators *</Text>
            <TextInput
              style={styles.formInput}
              keyboardType="numeric"
              placeholder="e.g. 5"
              placeholderTextColor="rgba(63,3,11,0.35)"
              value={numCreators}
              onChangeText={(v) => updateField('numCreators', v)}
            />
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Auto Calculated Budget</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Budget</Text>
              <Text style={styles.totalBudgetPrice}>₹{totalBudget.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>
      )}
      <View style={styles.bottomRow}>
        <TactileButton
          text="Back"
          onPress={handleBack}
          icon="arrowLeft"
          iconPosition="left"
        />
        <TactileButton
          onPress={handleNext}
          text="Next"
          icon="arrow"
          iconPosition="right"
        />
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
