import { Feather, MaterialIcons } from '@expo/vector-icons';
import React from 'react';

type FeatherName = React.ComponentProps<typeof Feather>['name'];
type MaterialName = React.ComponentProps<typeof MaterialIcons>['name'];

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

const MATERIAL_ICONS: Record<string, MaterialName> = {
  verified: 'verified',
  medal: 'military-tech',
  crown: 'workspace-premium',
  flame: 'local-fire-department',
  sparkle: 'auto-awesome',
  reel: 'video-library',
  arena: 'emoji-events',
  trending: 'trending-up',
  swap: 'swap-horiz',
  wallet: 'account-balance-wallet',
  addUser: 'person-add',
  trophy: 'emoji-events',
  ticket: 'local-activity',
};

const FEATHER_MAP: Record<string, FeatherName> = {
  home: 'home',
  grid: 'grid',
  list: 'list',
  user: 'user',
  chat: 'message-square',
  search: 'search',
  bell: 'bell',
  heart: 'heart',
  star: 'star',
  bolt: 'zap',
  arrow: 'arrow-right',
  arrowLeft: 'arrow-left',
  plus: 'plus',
  play: 'play',
  dollar: 'dollar-sign',
  chevron: 'chevron-right',
  chevDown: 'chevron-down',
  eye: 'eye',
  filter: 'sliders',
  clock: 'clock',
  bookmark: 'bookmark',
  location: 'map-pin',
  send: 'send',
  settings: 'settings',
  camera: 'camera',
  check: 'check',
  x: 'x',
  pause: 'pause',
  briefcase: 'briefcase',
  users: 'users',
  back: 'arrow-left',
  music: 'music',
  calendar: 'calendar',
  edit: 'edit-2',
  logout: 'log-out',
  globe: 'globe',
  lock: 'lock',
  chart: 'bar-chart-2',
  more: 'more-horizontal',
  attach: 'paperclip',
  mic: 'mic',
  gift: 'gift',
  share: 'share-2',
  pin: 'map-pin',
  mail: 'mail',
  phone: 'phone',
  sun: 'sun',
  trash: 'trash-2',
  volume: 'volume-2',
  mute: 'volume-x',
  instagram: 'instagram',
};

export function Icon({ name, size = 24, color = 'currentColor' }: IconProps) {
  if (MATERIAL_ICONS[name]) {
    return <MaterialIcons name={MATERIAL_ICONS[name]} size={size} color={color} />;
  }
  const featherName = FEATHER_MAP[name] ?? 'star';
  return <Feather name={featherName} size={size} color={color} />;
}
