import { Platform } from 'react-native';
import { api } from '@/lib/api';

export async function uploadMediaFile(localUri: string, type: 'audio' | 'image' | 'video'): Promise<{ url: string; key: string }> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const blob = await (await fetch(localUri)).blob();
    const ext = blob.type.split('/')[1]?.split(';')[0] || (type === 'image' ? 'jpeg' : type === 'video' ? 'mp4' : 'webm');
    formData.append('file', blob, `${type}-${Date.now()}.${ext}`);
  } else {
    const ext = type === 'image' ? 'jpg' : type === 'video' ? 'mp4' : 'm4a';
    const mime = type === 'image' ? 'image/jpeg' : type === 'video' ? 'video/mp4' : 'audio/m4a';
    formData.append('file', {
      uri: localUri,
      name: `${type}-${Date.now()}.${ext}`,
      type: mime,
    } as any);
  }

  return api.media.upload(formData);
}

export async function uploadVoiceNote(localUri: string): Promise<{ url: string; key: string }> {
  return uploadMediaFile(localUri, 'audio');
}
