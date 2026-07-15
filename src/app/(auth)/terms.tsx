import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily } from '@/constants/brand';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft } from '@hugeicons/core-free-icons';

export default function TermsPage() {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.lastUpdated}>Last Updated: July 15, 2026</Text>

        <Text style={styles.paragraph}>
          Welcome to RichyReach! Please read these Terms of Service ("Terms") carefully before using our mobile application. By accessing or using RichyReach, you agree to be bound by these Terms.
        </Text>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>1. Platform Purpose & Eligibility</Text>
          <Text style={styles.sectionText}>
            RichyReach connects content creators ("Creators") with brand partners ("Brands") for marketing campaigns. You must be at least 18 years old, or have express consent from a parent or legal guardian, to create an account.
          </Text>

          <Text style={styles.sectionTitle}>2. User Accounts & Verification</Text>
          <Text style={styles.sectionText}>
            You agree to provide accurate registration information. Account verification requires connecting verified social media accounts or checking your contact details. You are responsible for all activities that occur under your credentials.
          </Text>

          <Text style={styles.sectionTitle}>3. Creator Content & Commitments</Text>
          <Text style={styles.sectionText}>
            Creators must deliver original content as agreed upon in campaign briefs. All sponsored posts must follow relevant commercial guidelines and clearly disclose paid sponsorships to the public (e.g., using #ad or #sponsored).
          </Text>

          <Text style={styles.sectionTitle}>4. Brand Payments & Fees</Text>
          <Text style={styles.sectionText}>
            Brands agree to complete payouts for approved milestones/deliverables within the specified timeline. RichyReach reserves the right to charge platform fees, which will be shown upfront prior to campaign launch.
          </Text>

          <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
          <Text style={styles.sectionText}>
            Unless otherwise specified in a campaign contract, Creators retain ownership of their content, granting Brands a non-exclusive, worldwide, royalty-free license to share and use the content for promotion.
          </Text>

          <Text style={styles.sectionTitle}>6. Account Termination</Text>
          <Text style={styles.sectionText}>
            We reserve the right to suspend or delete accounts that violate safety protocols, commit fraud, or display inappropriate behavior, without prior warning or liability.
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
