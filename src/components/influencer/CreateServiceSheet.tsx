import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, FontFamily } from '@/constants/brand';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CreateServiceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export function CreateServiceSheet({ isOpen, onClose, onSuccess }: CreateServiceSheetProps) {
  const showModal = useUIStore((s) => s.showModal);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('5 days');
  const [exampleUrl, setExampleUrl] = useState('');
  const [videoFile, setVideoFile] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      showModal({
        title: 'Validation Error',
        message: 'Please enter a service name.',
      });
      return;
    }

    if (!price.trim() || isNaN(Number(price.trim())) || Number(price.trim()) <= 0) {
      showModal({
        title: 'Validation Error',
        message: 'Please enter a valid positive price.',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Format price: e.g. 1500 -> "1500.00"
      const formattedPrice = Number(price.trim()).toFixed(2);

      let payload: FormData | any;
      
      // If we have a file upload (on Web)
      if (videoFile) {
        payload = new FormData();
        payload.append('name', name.trim());
        payload.append('type', 'service');
        payload.append('price', formattedPrice);
        payload.append('deliveryTime', deliveryTime.trim());
        if (exampleUrl.trim()) {
          payload.append('exampleUrl', exampleUrl.trim());
        }
        payload.append('video', videoFile);
      } else {
        // Fallback or standard JSON payload if no file selected
        payload = {
          name: name.trim(),
          type: 'service',
          price: formattedPrice,
          deliveryTime: deliveryTime.trim(),
          exampleUrl: exampleUrl.trim() || undefined,
        };
      }

      const res = await api.influencers.services.create(payload);

      showModal({
        title: 'Service Created! 🚀',
        message: 'Your service has been successfully listed.',
      });

      onSuccess(res);
      onClose();
      // Reset state
      setName('');
      setPrice('');
      setDeliveryTime('5 days');
      setExampleUrl('');
      setVideoFile(null);
    } catch (err: any) {
      console.error('Failed to create service:', err);
      showModal({
        title: 'Operation Failed',
        message: err?.message || 'Failed to save service. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BottomSheet
      visible={isOpen}
      title="Add new service"
      icon="briefcase"
      onClose={onClose}
      snapPoints={['75%']}
      hideHeaderBorder
    >
      <ScrollView contentContainerStyle={{ gap: 18, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* SERVICE NAME */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Service Title *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. Dedicated Instagram Reel Review"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={name}
            onChangeText={setName}
            editable={!submitting}
          />
        </View>

        {/* PRICE */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Price (₹) *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. 15000"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            editable={!submitting}
          />
        </View>

        {/* DELIVERY TIME */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Delivery Time *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. 5 days"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={deliveryTime}
            onChangeText={setDeliveryTime}
            editable={!submitting}
          />
        </View>

        {/* EXAMPLE WORK URL */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Example Video/Work URL (Optional)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. https://instagram.com/reel/abc"
            placeholderTextColor="rgba(63,3,11,0.35)"
            value={exampleUrl}
            onChangeText={setExampleUrl}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
          />
        </View>

        {/* VIDEO FILE UPLOAD (WEB ONLY) */}
        {Platform.OS === 'web' && (
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Upload Example Video File (Web Only)</Text>
            <View style={styles.fileInputContainer}>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setVideoFile(file);
                }}
                style={{
                  fontFamily: FontFamily.sansMedium,
                  color: Colors.ink,
                  fontSize: '13px',
                }}
                disabled={submitting}
              />
              {videoFile && (
                <Text style={styles.selectedFileText}>
                  Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                </Text>
              )}
            </View>
          </View>
        )}

        {/* ACTION BUTTON */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>List Service 🚀</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    gap: 8,
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
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    fontSize: 14,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
  },
  fileInputContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(63,3,11,0.2)',
    gap: 6,
  },
  selectedFileText: {
    fontSize: 12,
    color: Colors.green,
    fontWeight: '600',
    fontFamily: FontFamily.sansMedium,
  },
  submitBtn: {
    backgroundColor: Colors.oxblood,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(63,3,11,0.5)',
  },
  submitBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    color: '#ffffff',
  },
});
