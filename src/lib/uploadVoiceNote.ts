import { Platform } from 'react-native';
import { api } from '@/lib/api';

export async function uploadVoiceNote(localUri: string): Promise<{ url: string; key: string }> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    // Web recordings are blob: URLs — the {uri, name, type} object below is an RN-only
    // convention that native fetch/FormData understands; the browser's own FormData needs
    // an actual Blob/File part instead.
    const blob = await (await fetch(localUri)).blob();
    const ext = blob.type.split('/')[1]?.split(';')[0] || 'webm';
    formData.append('file', blob, `voice-note-${Date.now()}.${ext}`);
  } else {
    formData.append('file', {
      uri: localUri,
      name: `voice-note-${Date.now()}.m4a`,
      type: 'audio/m4a',
    } as any);
  }

  return api.media.upload(formData);
}
