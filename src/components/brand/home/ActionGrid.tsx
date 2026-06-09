import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius } from '@/constants/brand';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActionGridProps {
  onNewCampaign: () => void;
}

export function ActionGrid({ onNewCampaign }: ActionGridProps) {
  const router = useRouter();

  return (
    <View style={styles.actionGrid}>
      <View style={styles.gridRow}>
        <TouchableOpacity
          style={[styles.gridBtn, { backgroundColor: Colors.oxbloodDeep }]}
          activeOpacity={0.9}
          onPress={onNewCampaign}
        >
          <Icon name="plus" size={18} color={Colors.cream} />
          <Text style={[styles.gridBtnText, { color: Colors.cream }]}>New campaign</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridBtn, { backgroundColor: Colors.roseDeep }]}
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/marketplace')}
        >
          <Icon name="users" size={18} color={Colors.cream} />
          <Text style={[styles.gridBtnText, { color: Colors.cream }]}>Find creators</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridRow}>
        <TouchableOpacity
          style={[styles.gridBtn, styles.gridBtnLight]}
          activeOpacity={0.85}
          onPress={() => router.push('/insights')}
        >
          <Icon name="chart" size={18} color={Colors.oxblood} />
          <Text style={[styles.gridBtnText, { color: Colors.oxblood }]}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridBtn, styles.gridBtnLight]}
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/arena')}
        >
          <Icon name="trophy" size={18} color={Colors.oxblood} />
          <Text style={[styles.gridBtnText, { color: Colors.oxblood }]}>My contests</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionGrid: {
    gap: 12,
    marginBottom: 28,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridBtn: {
    flex: 1,
    height: 90,
    borderRadius: Radius.xl,
    padding: 16,
    justifyContent: 'space-between',
  },
  gridBtnLight: {
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.06)',
  },
  gridBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
  },
});
