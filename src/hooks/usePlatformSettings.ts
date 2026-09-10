import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

/**
 * Admin-controlled toggles, mirrored from `GET /settings`.
 *
 * Creator verification needs a connected Instagram account, so while the Meta
 * app is under review an admin can waive it for campaign applications and arena
 * joins. The server enforces the same flags — this only keeps the client-side
 * gate from blocking a creator the API would let through.
 *
 * Both default to `false` (gate enforced) while loading or if the request fails.
 */
export interface PlatformSettings {
  allowUnverifiedCampaignApply: boolean;
  allowUnverifiedArenaJoin: boolean;
}

const DEFAULTS: PlatformSettings = {
  allowUnverifiedCampaignApply: false,
  allowUnverifiedArenaJoin: false,
};

export function usePlatformSettings() {
  const { data } = useQuery<PlatformSettings>({
    queryKey: ['platformSettings'],
    queryFn: () => api.settings.get(),
    staleTime: 5 * 60 * 1000,
  });

  return data ?? DEFAULTS;
}
