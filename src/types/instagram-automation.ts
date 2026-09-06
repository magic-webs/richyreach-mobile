/**
 * Instagram automation types, mirroring src/db/schema/instagram-automation.ts on the API.
 *
 * The four automation kinds map onto distinct Meta capabilities, and each carries its own
 * limits, which the editor screen surfaces rather than hiding:
 *  - comment_reply : public reply under a comment
 *  - comment_dm    : Meta "private reply", once per comment and within 7 days of it
 *  - dm_reply      : keyword reply, only inside the 24-hour window the sender opened
 *  - welcome_dm    : greeting on someone's first ever message to the account
 */

import { CornerUpLeft, MessageSquare, Send, Sparkles } from 'lucide-react-native';

/** Shape of a lucide-react-native glyph. Declared locally: lucide does not export its own. */
export type IconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

export type AutomationType = 'comment_reply' | 'comment_dm' | 'dm_reply' | 'welcome_dm';

export type MatchType = 'any' | 'contains' | 'exact' | 'starts_with';

export interface DmButton {
  title: string;
  url: string;
}

export interface IceBreaker {
  question: string;
  payload: string;
}

export interface Automation {
  id: string;
  instagramAccountId: string;
  name: string;
  type: AutomationType;
  enabled: boolean;

  matchType: MatchType;
  keywords: string[];
  caseSensitive: boolean;
  mediaScope: 'all' | 'specific';
  mediaIds: string[];

  replyTemplates: string[];
  dmTemplate: string | null;
  dmButtons: DmButton[];

  aiFallbackEnabled: boolean;
  aiPrompt: string | null;

  cooldownSeconds: number;
  maxPerDay: number;
  skipIfAlreadyHandled: boolean;

  triggerCount: number;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** The writable subset. The server fills in ids, counters and timestamps. */
export type AutomationInput = Omit<
  Automation,
  'id' | 'instagramAccountId' | 'triggerCount' | 'lastTriggeredAt' | 'createdAt' | 'updatedAt'
>;

export interface AutomationSettings {
  instagramAccountId: string;
  masterEnabled: boolean;
  aiPersona: string | null;
  aiModel: string;
  iceBreakers: IceBreaker[];
  iceBreakersSyncedAt: string | null;
  username: string;
  profilePicture: string | null;
  instagramUserId: string;
  /** False when the server has no OPENAI_API_KEY, so AI fallback cannot run. */
  aiAvailable: boolean;
  /** False when the Meta webhook verify token is unset, so no events will arrive. */
  webhookConfigured: boolean;
}

export interface AutomationDiagnostics {
  username: string;
  instagramUserId: string;
  tokenExpiresAt: string | null;
  tokenExpired: boolean;
  /** Server-side setup. */
  verifyTokenConfigured: boolean;
  appSecretConfigured: boolean;
  aiAvailable: boolean;
  /** Your own switches. */
  masterEnabled: boolean;
  enabledAutomations: number;
  /** What Meta says this account is subscribed to. */
  subscribedFields: string[];
  subscribedToComments: boolean;
  subscribedToMessages: boolean;
  subscriptionError: string | null;
  /** Null means Meta has never delivered an event for this account. */
  lastWebhookAt: string | null;
}

export interface AutomationStats {
  totalSent: number;
  totalSkipped: number;
  totalFailed: number;
  sentLast7Days: number;
  activeAutomations: number;
  peopleReached: number;
}

export interface AutomationLog {
  id: string;
  automationId: string | null;
  automationName: string | null;
  eventType: 'comment' | 'message';
  channel: 'public_comment' | 'private_dm' | 'dm';
  sourceId: string | null;
  senderId: string | null;
  senderUsername: string | null;
  incomingText: string | null;
  responseText: string | null;
  aiGenerated: boolean;
  status: 'sent' | 'skipped' | 'failed';
  /** Why it was skipped, or what Meta said when it failed. */
  reason: string | null;
  createdAt: string;
}

export interface AutomationMedia {
  id: string;
  caption: string;
  mediaType: string;
  thumbnailUrl: string;
  permalink: string;
  timestamp: string;
}

// --- Presentation metadata, shared by the hub, editor and activity screens ---

export const AUTOMATION_META: Record<
  AutomationType,
  { label: string; blurb: string; Icon: IconComponent; accent: string; channel: string }
> = {
  comment_reply: {
    label: 'Comment reply',
    blurb: 'Reply publicly under matching comments',
    Icon: MessageSquare,
    accent: '#b46a74',
    channel: 'Public comment',
  },
  comment_dm: {
    label: 'Comment to DM',
    blurb: 'Send a DM to whoever leaves a matching comment',
    Icon: Send,
    accent: '#8d4750',
    channel: 'Private reply',
  },
  dm_reply: {
    label: 'DM auto-reply',
    blurb: 'Answer incoming messages that match your keywords',
    Icon: CornerUpLeft,
    accent: '#3f030b',
    channel: 'Direct message',
  },
  welcome_dm: {
    label: 'Welcome message',
    blurb: 'Greet someone the first time they ever message you',
    Icon: Sparkles,
    accent: '#2a7a5a',
    channel: 'Direct message',
  },
};

export const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  any: 'Any message',
  contains: 'Contains',
  exact: 'Exactly matches',
  starts_with: 'Starts with',
};
