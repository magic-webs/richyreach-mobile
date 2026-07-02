import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { CheckIcon } from '@hugeicons/core-free-icons';
import { Colors, FontFamily } from '@/constants/brand';
import type { DisplayChatMessage } from '@/types/chat';

interface CollabAcceptedCardProps {
  message: DisplayChatMessage;
  viewHref: { pathname: string; params: { id: string } };
}

export function CollabAcceptedCard({ message, viewHref }: CollabAcceptedCardProps) {
  const router = useRouter();

  return (
    <View style={styles.campaignCard}>
      <View style={styles.campaignCardHeader}>
        <HugeiconsIcon icon={CheckIcon} size={16} color={Colors.green} strokeWidth={2} />
        <Text style={[styles.campaignLabel, { color: Colors.green }]}>Collaboration Accepted</Text>
      </View>
      <Text style={styles.campaignTitle}>{message.campaignTitle}</Text>
      <Text style={[styles.campaignDesc, { color: Colors.ink, marginTop: 8 }]}>{message.content}</Text>
      <TouchableOpacity style={styles.viewStepsBtn} onPress={() => router.push(viewHref as any)}>
        <Text style={styles.viewStepsBtnText}>View Collaboration Steps</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  campaignCard: { padding: 2 },
  campaignCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  campaignLabel: { fontSize: 10.5, fontWeight: '700', color: Colors.rose, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: FontFamily.sans },
  campaignTitle: { fontSize: 16, fontWeight: '700', color: Colors.ink, marginBottom: 6, fontFamily: FontFamily.sans },
  campaignDesc: { fontSize: 13, color: 'rgba(63,3,11,0.6)', marginBottom: 12, lineHeight: 18, fontFamily: FontFamily.sansRegular },
  viewStepsBtn: {
    backgroundColor: Colors.oxblood,
    marginTop: 12,
    width: '100%',
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewStepsBtnText: { color: Colors.cream, fontWeight: '700', fontSize: 13 },
});
