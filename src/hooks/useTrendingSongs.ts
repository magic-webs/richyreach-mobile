import * as mock from '@/data/mock';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

// Matches PlaceholderImage's tone prop, which renders these rows when a song has no art.
type SongTone = 'rose' | 'ox' | 'cream';

export interface TrendingSong {
  title: string;
  artist: string;
  imageUrl?: string | null;
  reels: string;
  dur: string;
  tone: SongTone;
  instagramAudioUrl?: string;
}

// Alternated over the mock rows so the placeholder cards still open something.
const FALLBACK_AUDIO = [
  'https://www.instagram.com/reels/audio/360707759600124/',
  'https://www.instagram.com/reels/audio/824355552391032/',
];

// Single source for the trending audio list. The home rail and the full list page
// share both the cache entry and this normalisation, so they cannot drift apart.
export function useTrendingSongs() {
  const userId = useAuthStore((s) => s.session?.user?.id);

  const { data, isLoading } = useQuery<any[]>({
    queryKey: ['trendingSongs'],
    queryFn: () => api.songs.list().catch(() => []),
    enabled: !!userId,
  });

  const songs = React.useMemo<TrendingSong[]>(() => {
    if (!data || data.length === 0) {
      return mock.musics.map((m, idx) => ({
        ...m,
        instagramAudioUrl: FALLBACK_AUDIO[idx % FALLBACK_AUDIO.length],
      }));
    }
    return data.map((song: any) => ({
      title: song.title,
      artist: song.artist,
      imageUrl: song.imageUrl,
      reels: song.reels || '1.5M',
      dur: song.dur || '0:20',
      tone: (song.tone as SongTone) || 'ox',
      instagramAudioUrl: song.instagramAudioUrl,
    }));
  }, [data]);

  return { songs, isLoading };
}
