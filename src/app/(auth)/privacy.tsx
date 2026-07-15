import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily } from '@/constants/brand';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft } from '@hugeicons/core-free-icons';

export default function PrivacyPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <HugeiconsIcon icon={ArrowLeft} size={24} color="#3f030b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last Updated: July 15, 2026</Text>

        <Text style={styles.paragraph}>
          Your privacy is highly important to us. This Privacy Policy describes how RichyReach collects, uses, shares, and protects your information when you use our mobile app.
        </Text>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.sectionText}>
            • <Text style={{ fontWeight: 'bold' }}>Personal Info</Text>: Full name, email address, WhatsApp/phone number, and country code.{'\n'}
            • <Text style={{ fontWeight: 'bold' }}>Social Data</Text>: Account stats and content handles you choose to link.{'\n'}
            • <Text style={{ fontWeight: 'bold' }}>Device Info</Text>: IP address, push notifications token, and operating system data.
          </Text>

          <Text style={styles.sectionTitle}>2. How We Use Your Data</Text>
          <Text style={styles.sectionText}>
            We use the collected information to setup user profiles, authenticate login requests via OTP, link brands with creators, facilitate secure payouts, and send notifications regarding campaign activities.
          </Text>

          <Text style={styles.sectionTitle}>3. Data Sharing & Security</Text>
          <Text style={styles.sectionText}>
            We share social reach statistics with registered brands when you apply for campaigns. We never sell your personal contact info to third parties. We use standard encryption methods to safeguard your information.
          </Text>

          <Text style={styles.sectionTitle}>4. Your Rights & Choices</Text>
          <Text style={styles.sectionText}>
            You may edit your account details at any time. If you wish to permanently delete your account and associated personal data, you can request account deletion by contacting us or inside the account profile settings.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#f1ebd9',
  },
  backButton: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(63, 3, 11, 0.05)',
  },
  headerTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    fontWeight: '700',
    color: '#3f030b',
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: 24,
    color: Colors.ink,
    fontWeight: '700',
    marginBottom: 4,
  },
  lastUpdated: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: 'rgba(63,3,11,0.5)',
    marginBottom: 20,
  },
  paragraph: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: 'rgba(63,3,11,0.7)',
    lineHeight: 22,
    marginBottom: 20,
  },
  sectionContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: FontFamily.sans,
    fontSize: 16,
    color: Colors.oxblood,
    fontWeight: '700',
    marginTop: 8,
  },
  sectionText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: 'rgba(63,3,11,0.7)',
    lineHeight: 20,
  },
});
