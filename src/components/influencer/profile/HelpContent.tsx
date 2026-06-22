import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { Icon } from '@/components/ui/icon';
import { useUIStore } from '@/store/ui';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'How do I get paid for collaborations?',
    a: 'Once the brand approves your campaign milestones and deliverables, the funds are cleared into your Wallet within 24-48 hours. You can withdraw them instantly to your bank account.',
  },
  {
    q: 'How do I list services on my profile?',
    a: 'Go to your profile, tap the "Services" tab, and click "Add Service". Fill in the title, description, price, delivery time, and platform. This will let brands buy your services directly.',
  },
  {
    q: 'What is the platform service charge?',
    a: 'RichyReach charges a flat 10% platform service fee on completed bookings to maintain secure escrow, customer support, and platform operations.',
  },
  {
    q: 'How do referral points work?',
    a: 'Invite creators and brands to RichyReach. When they register using your code, they get signup bonuses, and you get ₹100 cash plus 10,000 Reach Points which you can convert to cash anytime.',
  },
];

export function HelpContent() {
  const showModal = useUIStore((s) => s.showModal);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  const handleContactSupport = (method: string) => {
    showModal({
      title: 'Connecting to Support 💬',
      message: `Opening support channel via ${method}... Our support agents are available 24/7.`,
    });
  };

  return (
    <View style={styles.container}>
      {/* Contact Cards */}
      <Text style={styles.sectionTitle}>Contact Channels</Text>
      <View style={styles.supportRow}>
        <TouchableOpacity
          style={styles.supportCard}
          onPress={() => handleContactSupport('WhatsApp')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconBox, { backgroundColor: 'rgba(37,211,102,0.12)' }]}>
            <Icon name="chat" size={20} color="#25D366" />
          </View>
          <Text style={styles.supportCardTitle}>WhatsApp Support</Text>
          <Text style={styles.supportCardSub}>Chat with us instantly</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.supportCard}
          onPress={() => handleContactSupport('Email')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconBox, { backgroundColor: 'rgba(180,106,116,0.12)' }]}>
            <Icon name="globe" size={20} color={Colors.oxblood} />
          </View>
          <Text style={styles.supportCardTitle}>Email Support</Text>
          <Text style={styles.supportCardSub}>support@richyreach.com</Text>
        </TouchableOpacity>
      </View>

      {/* FAQ Accordion */}
      <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Frequently Asked Questions</Text>
      <View style={styles.faqList}>
        {FAQS.map((faq, idx) => {
          const isExpanded = expandedFaq === idx;
          return (
            <View
              key={idx}
              style={[
                styles.faqItem,
                idx < FAQS.length - 1 && styles.faqBorder,
              ]}
            >
              <TouchableOpacity
                onPress={() => toggleFaq(idx)}
                style={styles.faqHeader}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Icon name={isExpanded ? 'chevDown' : 'chevron'} size={14} color="rgba(63,3,11,0.4)" />
              </TouchableOpacity>
              {isExpanded && (
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontFamily: FontFamily.serif,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 12,
  },
  supportRow: {
    flexDirection: 'row',
    gap: 12,
  },
  supportCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Shadow.card,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  supportCardTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
  },
  supportCardSub: {
    fontFamily: FontFamily.sans,
    fontSize: 10.5,
    color: 'rgba(63,3,11,0.45)',
    marginTop: 2,
    textAlign: 'center',
  },
  faqList: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    ...Shadow.card,
  },
  faqItem: {
    paddingVertical: 14,
  },
  faqBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.06)',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.ink,
    lineHeight: 18,
  },
  faqAnswer: {
    fontFamily: FontFamily.sans,
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.55)',
    lineHeight: 18,
    marginTop: 10,
  },
});
