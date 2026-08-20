import React from 'react';
import * as LucideIcons from 'lucide-react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

const ICON_MAPPING: Record<string, string> = {
  verified: 'BadgeCheck',
  medal: 'Medal',
  crown: 'Crown',
  flame: 'Flame',
  sparkle: 'Sparkles',
  reel: 'Film',
  arena: 'Trophy',
  trending: 'TrendingUp',
  swap: 'ArrowLeftRight',
  wallet: 'Wallet',
  addUser: 'UserPlus',
  trophy: 'Trophy',
  ticket: 'Ticket',
  tag: 'Tag',
  category: 'LayoutGrid',
  
  home: 'Home',
  grid: 'Grid',
  list: 'List',
  user: 'User',
  chat: 'MessageSquare',
  search: 'Search',
  bell: 'Bell',
  heart: 'Heart',
  star: 'Star',
  bolt: 'Zap',
  arrow: 'ArrowRight',
  arrowLeft: 'ArrowLeft',
  plus: 'Plus',
  play: 'Play',
  dollar: 'DollarSign',
  chevron: 'ChevronRight',
  chevDown: 'ChevronDown',
  'chevron-down': 'ChevronDown',
  eye: 'Eye',
  filter: 'Sliders',
  clock: 'Clock',
  bookmark: 'Bookmark',
  location: 'MapPin',
  send: 'Send',
  settings: 'Settings',
  camera: 'Camera',
  check: 'Check',
  x: 'X',
  pause: 'Pause',
  briefcase: 'Briefcase',
  users: 'Users',
  back: 'ArrowLeft',
  music: 'Music',
  calendar: 'Calendar',
  edit: 'Pencil',
  logout: 'LogOut',
  globe: 'Globe',
  lock: 'Lock',
  chart: 'BarChart2',
  more: 'MoreHorizontal',
  attach: 'Paperclip',
  mic: 'Mic',
  gift: 'Gift',
  share: 'Share2',
  pin: 'MapPin',
  mail: 'Mail',
  phone: 'Phone',
  sun: 'Sun',
  trash: 'Trash2',
  volume: 'Volume2',
  mute: 'VolumeX',
  instagram: 'Instagram',
  image: 'Image',
  video: 'Video',
  reply: 'CornerUpLeft',
};

export function Icon({ name, size = 24, color = 'currentColor' }: IconProps) {
  const lucideName = ICON_MAPPING[name] || 'Star';
  const LucideIcon = (LucideIcons as any)[lucideName] || (LucideIcons as any).Star;
  
  if (!LucideIcon) {
    return null;
  }
  
  return <LucideIcon size={size} color={color} />;
}
