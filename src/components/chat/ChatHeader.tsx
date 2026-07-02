import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { Colors, FontFamily } from '@/constants/brand';
import { PlaceholderImage } from '@/components/ui/placeholder-image';

interface ChatHeaderProps {
  name: string;
  avatarUrl: string | null;
  onBackPress: () => void;
  statusText?: string;
}

export function ChatHeader({ name, avatarUrl, onBackPress, statusText = 'Active Chat' }: ChatHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      {Platform.OS !== 'web' ? (
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(244,236,228,0.96)' }]} />
      )}
      <TouchableOpacity onPress={onBackPress} style={styles.backBtn} activeOpacity={0.8}>
        <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={Colors.oxblood} strokeWidth={2} />
      </TouchableOpacity>
      <View style={{ position: 'relative' }}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} contentFit="cover" />
        ) : (
          <PlaceholderImage tone="rose" height={40} width={40} borderRadius={99} />
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.convName} numberOfLines={1}>{name}</Text>
        <Text style={styles.onlineStatus}>{statusText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Platform.OS === 'web' ? 'rgba(244,236,228,0.96)' : 'rgba(244,236,228,0.6)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.08)',
    overflow: 'hidden',
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(63,3,11,0.04)' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  convName: { fontFamily: FontFamily.sans, fontSize: 16, color: Colors.ink, fontWeight: '700' },
  onlineStatus: { fontFamily: FontFamily.sansMedium, fontSize: 11.5, color: Colors.rose, fontWeight: '600' },
});
