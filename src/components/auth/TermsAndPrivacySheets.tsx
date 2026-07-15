import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Colors, FontFamily } from '@/constants/brand';
import { Icon } from '@/components/ui/icon';

interface TermsAndPrivacySheetsProps {
  showTerms: boolean;
  setShowTerms: (show: boolean) => void;
  showPrivacy: boolean;
  setShowPrivacy: (show: boolean) => void;
}

export function TermsAndPrivacySheets({
  showTerms,
  setShowTerms,
  showPrivacy,
  setShowPrivacy,
}: TermsAndPrivacySheetsProps) {
  return (
    <>
      {/* Terms of Service Modal */}
      <Modal
        visible={showTerms}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTerms(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTerms(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconWrap}>
                  <Icon name="verified" size={20} color="#fff" />
                </View>
                <Text style={styles.title}>Terms of Service</Text>
                <TouchableOpacity
                  onPress={() => setShowTerms(false)}
                  style={styles.closeBtn}
                  activeOpacity={0.7}
                >
                  <Icon name="x" size={18} color={Colors.oxblood} />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
                <View style={{ gap: 16 }}>
                  <Text style={{ fontFamily: FontFamily.sans, fontSize: 18, color: Colors.ink, fontWeight: '700' }}>
                    Terms & Conditions
                  </Text>
                  <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 13, color: 'rgba(63,3,11,0.5)', marginBottom: 8 }}>
                    Last Updated: July 15, 2026
                  </Text>

                  <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 14, color: 'rgba(63,3,11,0.7)', lineHeight: 22 }}>
                    Welcome to RichyReach! Please read these Terms of Service ("Terms") carefully before using our mobile application. By accessing or using RichyReach, you agree to be bound by these Terms.
                  </Text>

                  <View style={{ gap: 12, marginTop: 8 }}>
                    <Text style={{ fontFamily: FontFamily.sans, fontSize: 15, color: Colors.oxblood, fontWeight: '700' }}>
                      1. Platform Purpose & Eligibility
                    </Text>
                    <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 14, color: 'rgba(63,3,11,0.7)', lineHeight: 20 }}>
                      RichyReach connects content creators ("Creators") with brand partners ("Brands") for marketing campaigns. You must be at least 18 years old, or have express consent from a parent or legal guardian, to create an account.
                    </Text>

                    <Text style={{ fontFamily: FontFamily.sans, fontSize: 15, color: Colors.oxblood, fontWeight: '700' }}>
                      2. User Accounts & Verification
                    </Text>
                    <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 14, color: 'rgba(63,3,11,0.7)', lineHeight: 20 }}>
                      You agree to provide accurate registration information. Account verification requires connecting verified social media accounts or checking your contact details. You are responsible for all activities that occur under your credentials.
                    </Text>

                    <Text style={{ fontFamily: FontFamily.sans, fontSize: 15, color: Colors.oxblood, fontWeight: '700' }}>
                      3. Creator Content & Commitments
                    </Text>
                    <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 14, color: 'rgba(63,3,11,0.7)', lineHeight: 20 }}>
                      Creators must deliver original content as agreed upon in campaign briefs. All sponsored posts must follow relevant commercial guidelines and clearly disclose paid sponsorships to the public (e.g., using #ad or #sponsored).
                    </Text>

                    <Text style={{ fontFamily: FontFamily.sans, fontSize: 15, color: Colors.oxblood, fontWeight: '700' }}>
                      4. Brand Payments & Fees
                    </Text>
                    <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 14, color: 'rgba(63,3,11,0.7)', lineHeight: 20 }}>
                      Brands agree to complete payouts for approved milestones/deliverables within the specified timeline. RichyReach reserves the right to charge platform fees, which will be shown upfront prior to campaign launch.
                    </Text>

                    <Text style={{ fontFamily: FontFamily.sans, fontSize: 15, color: Colors.oxblood, fontWeight: '700' }}>
                      5. Intellectual Property
                    </Text>
                    <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 14, color: 'rgba(63,3,11,0.7)', lineHeight: 20 }}>
                      Unless otherwise specified in a campaign contract, Creators retain ownership of their content, granting Brands a non-exclusive, worldwide, royalty-free license to share and use the content for promotion.
                    </Text>

                    <Text style={{ fontFamily: FontFamily.sans, fontSize: 15, color: Colors.oxblood, fontWeight: '700' }}>
                      6. Account Termination
                    </Text>
                    <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 14, color: 'rgba(63,3,11,0.7)', lineHeight: 20 }}>
                      We reserve the right to suspend or delete accounts that violate safety protocols, commit fraud, or display inappropriate behavior, without prior warning or liability.
                    </Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacy}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrivacy(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPrivacy(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconWrap}>
                  <Icon name="lock" size={20} color="#fff" />
                </View>
                <Text style={styles.title}>Privacy Policy</Text>
                <TouchableOpacity
                  onPress={() => setShowPrivacy(false)}
                  style={styles.closeBtn}
                  activeOpacity={0.7}
                >
                  <Icon name="x" size={18} color={Colors.oxblood} />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
                <View style={{ gap: 16 }}>
                  <Text style={{ fontFamily: FontFamily.sans, fontSize: 18, color: Colors.ink, fontWeight: '700' }}>
                    Privacy Policy
                  </Text>
                  <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 13, color: 'rgba(63,3,11,0.5)', marginBottom: 8 }}>
                    Last Updated: July 15, 2026
                  </Text>

                  <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 14, color: 'rgba(63,3,11,0.7)', lineHeight: 22 }}>
                    Your privacy is highly important to us. This Privacy Policy describes how RichyReach collects, uses, shares, and protects your information when you use our mobile app.
                  </Text>

                  <View style={{ gap: 12, marginTop: 8 }}>
                    <Text style={{ fontFamily: FontFamily.sans, fontSize: 15, color: Colors.oxblood, fontWeight: '700' }}>
                      1. Information We Collect
                    </Text>
                    <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 14, color: 'rgba(63,3,11,0.7)', lineHeight: 20 }}>
                      • <Text style={{ fontWeight: 'bold' }}>Personal Info</Text>: Full name, email address, WhatsApp/phone number, and country code.{'\n'}
                      • <Text style={{ fontWeight: 'bold' }}>Social Data</Text>: Account stats and content handles you choose to link.{'\n'}
                      • <Text style={{ fontWeight: 'bold' }}>Device Info</Text>: IP address, push notifications token, and operating system data.
                    </Text>

                    <Text style={{ fontFamily: FontFamily.sans, fontSize: 15, color: Colors.oxblood, fontWeight: '700' }}>
                      2. How We Use Your Data
                    </Text>
                    <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 14, color: 'rgba(63,3,11,0.7)', lineHeight: 20 }}>
                      We use the collected information to setup user profiles, authenticate login requests via OTP, link brands with creators, facilitate secure payouts, and send notifications regarding campaign activities.
                    </Text>

                    <Text style={{ fontFamily: FontFamily.sans, fontSize: 15, color: Colors.oxblood, fontWeight: '700' }}>
                      3. Data Sharing & Security
                    </Text>
                    <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 14, color: 'rgba(63,3,11,0.7)', lineHeight: 20 }}>
                      We share social reach statistics with registered brands when you apply for campaigns. We never sell your personal contact info to third parties. We use standard encryption methods to safeguard your information.
                    </Text>

                    <Text style={{ fontFamily: FontFamily.sans, fontSize: 15, color: Colors.oxblood, fontWeight: '700' }}>
                      4. Your Rights & Choices
                    </Text>
                    <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 14, color: 'rgba(63,3,11,0.7)', lineHeight: 20 }}>
                      You may edit your account details at any time. If you wish to permanently delete your account and associated personal data, you can request account deletion by contacting us or inside the account profile settings.
                    </Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(42,2,7,0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.creamLite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.creamLite,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.07)',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: Colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 21,
    fontWeight: '700',
    color: Colors.ink,
    flex: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 99,
    backgroundColor: 'rgba(63,3,11,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 56,
  },
});
