import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/brand';

export default function ChatIndexRedirect() {
  const router = useRouter();
  const { role } = useAuthStore();

  useEffect(() => {
    if (role === 'brand') {
      router.replace('/chat/brand');
    } else {
      router.replace('/chat/influencer');
    }
  }, [role]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.creamLite }}>
      <ActivityIndicator size="large" color={Colors.rose} />
    </View>
  );
}
