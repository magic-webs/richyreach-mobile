import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/brand';

export default function ChatDetailRedirect() {
  const router = useRouter();
  const { role } = useAuthStore();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (role === 'brand') {
      router.replace({
        pathname: '/chat/brand/[id]',
        params: {
          id: params.id,
          name: params.name || '',
          avatar: params.avatar || '',
        }
      });
    } else {
      router.replace({
        pathname: '/chat/influencer/[id]',
        params: {
          id: params.id,
          name: params.name || '',
          avatar: params.avatar || '',
        }
      });
    }
  }, [role, params.id]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.creamLite }}>
      <ActivityIndicator size="large" color={Colors.rose} />
    </View>
  );
}
