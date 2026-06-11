import type { Account, ActivityItem, Campaign, ChatRoom, Contest, LeaderboardEntry, MusicTrack, PortfolioItem } from '@/types';

export const campaigns: Campaign[] = [
  { id: 'lumiere', brand: 'Lumière Beauty', cat: 'Beauty', verified: true, title: 'Summer glow serum — reel + story', budget: '₹45,000', budgetNum: 45000, type: '1 Reel · 2 Stories', platform: 'Instagram', deadline: '4 days left', applicants: 48, followers: '20k+', tone: 'rose', about: 'Showcase our new vitamin-C glow serum in a natural, sunlit get-ready-with-me reel. We love authentic, unfiltered skin moments.', deliverables: ['1 Reel (15–30s)', '2 Story frames w/ link', 'Usage rights 30 days'] },
  { id: 'atlas', brand: 'Atlas Watches', cat: 'Luxury', verified: true, title: 'Heritage chronograph — cinematic reel', budget: '₹1,20,000', budgetNum: 120000, type: '1 Reel · 3 Posts', platform: 'Instagram + YouTube', deadline: '6 days left', applicants: 12, followers: '80k+', tone: 'ox', about: 'A cinematic, moody showcase of our heritage chronograph. Think golden hour, considered framing, a story of timeless craft.', deliverables: ['1 Reel (30–45s)', '3 Feed posts', 'Exclusive 14 days'] },
  { id: 'verre', brand: 'Verre Skincare', cat: 'Beauty', verified: false, title: 'Glass-skin routine — story series', budget: '₹28,000', budgetNum: 28000, type: '3 Stories', platform: 'Instagram', deadline: '2 days left', applicants: 90, followers: '10k+', tone: 'rose', about: 'Walk through your evening glass-skin routine with our 3-step system. Cosy, dewy, real.', deliverables: ['3 Story frames', 'Honest review', 'Discount code'] },
  { id: 'elan', brand: 'Élan Active', cat: 'Fitness', verified: true, title: 'Morning movement — activewear haul', budget: '₹38,000', budgetNum: 38000, type: '1 Reel', platform: 'Instagram', deadline: '8 days left', applicants: 33, followers: '15k+', tone: 'rose', about: 'A bright, energetic morning workout reel featuring our new seamless collection. Movement, sweat, joy.', deliverables: ['1 Reel (15–30s)', '1 Carousel', 'Tag + code'] },
  { id: 'aurora', brand: 'Aurora Tech', cat: 'Tech', verified: true, title: 'Unboxing the Aurora Buds Pro', budget: '₹65,000', budgetNum: 65000, type: '1 Reel · 1 Post', platform: 'YouTube + Instagram', deadline: '5 days left', applicants: 26, followers: '50k+', tone: 'ox', about: 'Crisp, satisfying unboxing + first-impressions of our flagship earbuds. Honest take on sound + fit.', deliverables: ['1 Long-form (3–5m)', '1 Reel', '1 Feed post'] },
  { id: 'maison', brand: 'Maison Noir', cat: 'Fashion', verified: true, title: 'AW collection — editorial reel', budget: '₹92,000', budgetNum: 92000, type: '1 Reel · 4 Posts', platform: 'Instagram', deadline: '3 days left', applicants: 19, followers: '60k+', tone: 'ox', about: 'Editorial, high-fashion showcase of our autumn-winter drop. Texture, silhouette, attitude.', deliverables: ['1 Reel (20–30s)', '4 Feed posts', 'Exclusive 30 days'] },
];

export const contests: Contest[] = [
  { id: 'summerglow', title: '#SummerGlow', brand: 'Lumière Beauty', prize: '₹10,00,000', entries: 1842, daysLeft: 6, progress: 0.7, tone: 'rose', desc: 'Create your best sun-kissed glow reel. Top 10 win cash + a yearly brand deal.' },
  { id: 'unbox', title: '#UnboxAurora', brand: 'Aurora Tech', prize: '₹6,50,000', entries: 920, daysLeft: 11, progress: 0.4, tone: 'ox', desc: 'Most creative unboxing wins. Judged on originality + watch-time.' },
  { id: 'styleoff', title: '#MaisonStyleOff', brand: 'Maison Noir', prize: '₹8,00,000', entries: 1336, daysLeft: 4, progress: 0.85, tone: 'ox', desc: 'Style one piece three ways. Editorial eye wins.' },
  { id: 'movemore', title: '#MoveMore', brand: 'Élan Active', prize: '₹3,50,000', entries: 612, daysLeft: 15, progress: 0.3, tone: 'rose', desc: '30-day movement challenge. Consistency + community votes.' },
];

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Neha Verma', handle: '@neha.creates', pts: 9840, tone: 'ox', verified: true, up: true },
  { rank: 2, name: 'Kabir Rao', handle: '@kabir.shoots', pts: 9120, tone: 'rose', verified: true, up: true },
  { rank: 3, name: 'Muskan', handle: '@muskan.creates', pts: 8760, tone: 'ox', verified: true, up: false, me: true },
  { rank: 4, name: 'Lavanya Iyer', handle: '@lavanya.creates', pts: 7400, tone: 'rose', verified: false, up: true },
  { rank: 5, name: 'Ishan Malhotra', handle: '@ishan.films', pts: 6980, tone: 'ox', verified: true, up: false },
];

export const winners = [
  { contest: '#GlowUp', name: 'Mira Shah', prize: '₹4,00,000', tone: 'rose' },
  { contest: '#TechDrop', name: 'Ishan Malhotra', prize: '₹2,50,000', tone: 'ox' },
  { contest: '#RunwayReel', name: 'Neha Verma', prize: '₹5,00,000', tone: 'ox' },
];

export const activity: ActivityItem[] = [
  { who: 'Kabir Rao', act: 'earned', detail: '₹50,000 from Atlas Watches', time: '2m', tone: 'ox', icon: 'dollar-sign' },
  { who: 'Maison Noir', act: 'connected with', detail: 'you — wants to collaborate', time: '14m', tone: 'rose', icon: 'user-plus', verified: true },
  { who: 'Lavanya Iyer', act: 'joined', detail: 'Richy Reach as a creator', time: '38m', tone: 'rose', icon: 'star' },
  { who: 'Aurora Tech', act: 'launched', detail: 'a new campaign · ₹65k budget', time: '1h', tone: 'ox', icon: 'zap', verified: true },
  { who: 'Ishan Malhotra', act: 'won', detail: '#UnboxAurora — 1st place 🏆', time: '3h', tone: 'ox', icon: 'award' },
];

export const musics: MusicTrack[] = [
  { title: 'Golden Hour', artist: 'JVKE', reels: '2.4M', dur: '0:18', tone: 'rose' },
  { title: 'Espresso', artist: 'Sabrina Carpenter', reels: '5.1M', dur: '0:22', tone: 'ox' },
  { title: 'Birds of a Feather', artist: 'Billie Eilish', reels: '3.8M', dur: '0:15', tone: 'rose' },
  { title: 'Tum Hi Ho', artist: 'Arijit Singh', reels: '1.9M', dur: '0:20', tone: 'ox' },
  { title: 'Not Like Us', artist: 'Kendrick Lamar', reels: '4.2M', dur: '0:17', tone: 'ox' },
];

export const chats: ChatRoom[] = [
  { id: 'maison', name: 'Maison Noir', verified: true, last: 'Loved your last reel — can we brief you?', time: '2m', unread: 2, online: true, tone: 'ox', thread: [{ me: false, t: 'Hi Muskan! We came across your profile and love your editorial eye ✨', time: '10:02' }, { me: false, t: 'Loved your last reel — can we brief you on the AW campaign?', time: '10:02' }, { me: true, t: "Hi! Thank you so much 🙏 I'd love to hear more about it.", time: '10:14' }] },
  { id: 'lumiere', name: 'Lumière Beauty', verified: true, last: 'Payment of ₹45,000 released 🎉', time: '1h', unread: 0, online: false, tone: 'rose', thread: [{ me: false, t: 'Your deliverables look perfect — approved!', time: 'Yesterday' }, { me: false, t: 'Payment of ₹45,000 released 🎉', time: '1h' }] },
  { id: 'aurora', name: 'Aurora Tech', verified: true, last: 'Buds shipping today, tracking soon.', time: '5h', unread: 0, online: true, tone: 'ox', thread: [{ me: true, t: 'Excited for this one! When do the buds arrive?', time: '8:40' }, { me: false, t: 'Buds shipping today, tracking soon.', time: '9:05' }] },
  { id: 'elan', name: 'Élan Active', verified: false, last: 'Can you do an extra carousel?', time: '1d', unread: 1, online: false, tone: 'rose', thread: [{ me: false, t: 'Can you do an extra carousel for ₹6k more?', time: 'Mon' }] },
];

export const accounts: Account[] = [
  { id: 'creates', name: 'Muskan', handle: '@muskan.creates', kind: 'Creator · Personal', followers: '184k', verified: true, tone: 'ox', current: true },
  { id: 'beauty', name: 'Muskan Beauty', handle: '@muskan.beauty', kind: 'Creator · Niche', followers: '62k', verified: false, tone: 'rose', current: false },
  { id: 'magicwebs', name: 'Magic Webs', handle: '@magicwebs', kind: 'Brand account', followers: '410k', verified: true, tone: 'ox', current: false },
];

export const portfolio: PortfolioItem[] = [
  { tone: 'rose', tag: 'Beauty', views: '1.2M' },
  { tone: 'ox', tag: 'Fashion', views: '890k' },
  { tone: 'ox', tag: 'Luxury', views: '2.1M' },
  { tone: 'rose', tag: 'Skincare', views: '540k' },
  { tone: 'rose', tag: 'Fitness', views: '760k' },
  { tone: 'ox', tag: 'Tech', views: '1.0M' },
];
