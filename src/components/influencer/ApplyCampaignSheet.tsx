import { BottomSheet } from '@/components/ui/bottom-sheet';
import { BidSlider } from '@/components/influencer/BidSlider';
import { TactileButton } from '@/components/ui/tactile-button';
import { Colors, FontFamily } from '@/constants/brand';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useUIStore } from '@/store/ui';

// ─── Niche-specific proposal templates ───────────────────────────────────────
const PROPOSAL_BANK: Record<string, string[]> = {
  beauty: [
    "Hey! I'm a beauty content creator with 3+ years of skincare & makeup experience. My audience trusts my honest reviews, and I'd love to create authentic, tutorial-style content that showcases your product naturally in my routine.",
    "Your brand speaks my language! I specialise in GRWM reels and product reveals with high save rates. I'll craft a genuine, aesthetic video that drives real curiosity and swipe-ups from my beauty-obsessed followers.",
    "I've built a community of skincare-first followers who actively try products I recommend. I'd love to do an honest 7-day skin test series featuring your product — real results, zero filter.",
  ],
  fashion: [
    "Fashion is my canvas. I create outfit-of-the-day and styling content that feels editorial yet relatable. I'd style your pieces across three different looks to show versatility and inspire my followers to shop.",
    "Your collection deserves a storytelling approach. I'll build a lookbook-style reel that pairs each piece with a mood, a location, and a voiceover — the kind of content that gets saved and shared obsessively.",
    "I have a sharp eye for aesthetics and an audience that actively asks where my outfits are from. I'd love to integrate your brand naturally into a 'week of outfits' content series for maximum product exposure.",
  ],
  food: [
    "Food is my love language. I create recipe videos and restaurant reels that make people genuinely hungry. I'll feature your product in a recipe challenge or taste-test that's both entertaining and mouth-watering.",
    "My followers trust my food recommendations because I never oversell. I'd do an honest, enthusiastic taste-test reel and a behind-the-scenes story series showing how I incorporate your product into everyday cooking.",
    "I run a cooking community where real people share real recipes. I'll produce a step-by-step recipe reel using your product as the hero ingredient, with text overlays, aesthetic shots, and a full ingredients pinned story.",
  ],
  fitness: [
    "I document my fitness journey honestly — the sweaty 5 AMs, the sore muscles, and the real gains. I'd love to feature your product as part of my actual pre/post-workout routine in a way that resonates with active followers.",
    "My audience follows me for unfiltered gym content and supplement deep-dives. I'll create a performance-focused review reel that tests your product over a week and reports back authentically — no fluff.",
    "Fitness content works best when it's real. I'll build a '30-day challenge' story series using your product, with weekly progress updates that keep my audience returning and interacting throughout the collaboration.",
  ],
  tech: [
    "I review tech with a focus on everyday usability — not just specs. I'll create a hands-on first-impressions reel and a full features walkthrough story series, designed to convert curious followers into buyers.",
    "My tech audience is skeptical by nature and loves deep dives. I'll do a no-hype, honest comparison-style video placing your product in real use cases — the kind of review that gets shared in tech communities.",
    "I've built a gadget-loving community that watches every unboxing I post. I'll produce a polished unboxing reel, a 1-week daily driver story update, and a final verdict post that clearly drives purchase intent.",
  ],
  travel: [
    "I create travel content that makes people book flights. I'd love to feature your brand in a destination reel — woven naturally into my packing ritual, hotel routine, or local experience — wherever it fits authentically.",
    "My travel reels hit consistently high save rates because I tell a story, not just show a place. I'd build a 'travel essential' narrative around your product that resonates with my wanderlust-driven audience.",
    "I travel full-time and my audience is always asking what I carry, use, and recommend. A natural product integration into my next trip content would feel organic and hit a highly engaged, adventure-ready community.",
  ],
  lifestyle: [
    "I create calm, aesthetic lifestyle content that my audience describes as 'mood board worthy'. I'd integrate your product into a cozy day-in-my-life reel and multiple story frames that feel genuinely personal.",
    "My lifestyle content focuses on intentional living — morning routines, slow weekends, mindful choices. Your brand fits naturally into that world, and I'd showcase it in a way that feels aspirational but always real.",
    "My followers engage most when I share things that actually changed my day. I'd love to share how your product slots into my daily life across a real week of stories, building familiarity and trust over time.",
  ],
  gaming: [
    "I stream and create gaming content for an audience that hates obvious ads. I'd build a genuine integration — whether it's a setup reveal, a sponsored segment, or a challenge — that feels native to my content style.",
    "My gaming community is sharp and they'll call out anything inauthentic immediately. I'd approach this as a real collaboration: honest talk about your product, how I actually use it, and why I genuinely rate it.",
    "I create gaming content that blends humour, skill, and community. I'd love to weave your brand into a challenge video or a 'ultimate setup' reel that naturally drives curiosity and click-throughs from my viewers.",
  ],
  finance: [
    "My audience comes to me for honest money tips and product breakdowns. I'd create a clear, jargon-free explainer reel about your offering — focused on real value, not hype — that converts curious viewers into users.",
    "Finance content needs trust above everything else. I've built mine by being transparent about my own money moves. I'd frame your product within a genuine use case that makes my audience say 'I actually need this'.",
    "I produce finance content for young professionals who want straightforward advice. I'd create a 'money move' style reel featuring your product as a practical tool, backed by numbers that speak to my analytical audience.",
  ],
};

const FALLBACK_PROPOSALS = [
  "I'm genuinely excited about this campaign! I create content that feels authentic, on-brand, and drives real engagement — not just views. Let me show your audience why your brand matters.",
  "I've followed what you're building and I'd love to be part of it. I'll craft content that speaks honestly to my audience about why your product is something they need — no scripts, just real enthusiasm.",
  "My content strategy is built around trust. I never promote something I don't believe in, so when I do — my audience listens. I'd love to create honest, high-quality content that genuinely represents your brand.",
];

function pickProposal(niche: string | null | undefined): string {
  const key = (niche || '').toLowerCase().trim();
  // try exact match, then partial
  const matched =
    PROPOSAL_BANK[key] ||
    Object.entries(PROPOSAL_BANK).find(([k]) => key.includes(k) || k.includes(key))?.[1] ||
    FALLBACK_PROPOSALS;
  return matched[Math.floor(Math.random() * matched.length)];
}
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────


interface ApplyCampaignSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proposal: string, bidAmount: number, reelCount: number, storyCount: number) => void;
  submitting: boolean;
  campaignTitle: string;
  campaignCategory?: string | null; // niche/category for proposal selection
  suggestedBudget: number;          // per-spot price in paise
  totalBudget?: number;             // total campaign budget in paise (cap)
}

export function ApplyCampaignSheet({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  campaignTitle,
  campaignCategory,
  suggestedBudget,
  totalBudget,
}: ApplyCampaignSheetProps) {
  const showModal = useUIStore((s) => s.showModal);

  const spotPrice = Math.floor(suggestedBudget / 100);
  const maxPrice = totalBudget ? Math.floor(totalBudget / 100) : spotPrice * 3;

  const [proposal, setProposal] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [reelCount, setReelCount] = useState('1');
  const [storyCount, setStoryCount] = useState('0');
  const [memeVisible, setMemeVisible] = useState(false);

  // Pick a random proposal on open (stable per open via ref)
  const pickedRef = useRef('');
  useEffect(() => {
    if (isOpen) {
      pickedRef.current = pickProposal(campaignCategory);
      setProposal(pickedRef.current);
      setBidPrice(String(spotPrice));
      setReelCount('1');
      setStoryCount('0');
      setMemeVisible(false);
    }
  }, [isOpen, suggestedBudget, campaignCategory]);

  const triggerMeme = (price: number) => {
    setBidPrice(String(price));
    setMemeVisible(true);
  };

  const handleMemeDismiss = () => {
    setMemeVisible(false);
    setBidPrice(String(spotPrice));
  };

  const applyPercentBump = (pct: number) => {
    const bumped = Math.round(spotPrice * (1 + pct / 100));
    if (bumped >= maxPrice) {
      triggerMeme(maxPrice);
    } else {
      setBidPrice(String(bumped));
    }
  };

  const handleBidChange = (val: string) => {
    const n = Number(val);
    if (!isNaN(n) && n >= maxPrice) {
      triggerMeme(maxPrice);
    } else {
      setBidPrice(val);
    }
  };

  const handleSubmit = () => {
    if (!bidPrice.trim() || isNaN(Number(bidPrice.trim())) || Number(bidPrice.trim()) <= 0) {
      showModal({ title: 'Validation Error', message: 'Please enter a valid positive bid price.' });
      return;
    }
    if (reelCount.trim() === '' || isNaN(Number(reelCount.trim())) || Number(reelCount.trim()) < 0) {
      showModal({ title: 'Validation Error', message: 'Please enter a valid number of reels.' });
      return;
    }
    if (storyCount.trim() === '' || isNaN(Number(storyCount.trim())) || Number(storyCount.trim()) < 0) {
      showModal({ title: 'Validation Error', message: 'Please enter a valid number of stories.' });
      return;
    }
    if (proposal.trim().length < 10) {
      showModal({ title: 'Validation Error', message: 'Your proposal must be at least 10 characters long.' });
      return;
    }
    onSubmit(proposal.trim(), Number(bidPrice.trim()), Number(reelCount.trim()), Number(storyCount.trim()));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Ashneer meme popup  */}
      <Modal
        visible={memeVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleMemeDismiss}
      >
        <Pressable style={styles.memeOverlay} onPress={handleMemeDismiss}>
          <Pressable style={styles.memeCard} onPress={(e) => e.stopPropagation()}>
            <Image
              source={require('@/assets/meme/bhai-kya-kar-raha-hai-tu-ashneer-grover.gif')}
              style={styles.memeGif}
              resizeMode="cover"
            />
            <Text style={styles.memeTitle}>Bhai kya kar raha hai tu 😅</Text>
            <TouchableOpacity
              style={styles.memeDismissBtn}
              onPress={handleMemeDismiss}
              activeOpacity={0.85}
            >
              <Text style={styles.memeDismissText}>OK, thik hai bhai 🙏</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Main Sheet*/}
      <BottomSheet
        visible={isOpen}
        title="Apply to Campaign"
        icon="checkmark-circle"
        onClose={onClose}
        snapPoints={['92%']}
        hideHeaderBorder
      >
        <ScrollView
          contentContainerStyle={{ gap: 18, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Campaign Info Card */}
          <View style={styles.campaignInfo}>
            <Text style={styles.campaignLabel}>CAMPAIGN</Text>
            <Text style={styles.campaignTitle}>{campaignTitle}</Text>
            {campaignCategory ? (
              <View style={styles.nicheChip}>
                <Text style={styles.nicheChipText}>{campaignCategory}</Text>
              </View>
            ) : null}
          </View>

          {/* BID PRICE */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Your Bid Price (₹) *</Text>

            {/* Per-spot baseline */}
            <View style={styles.baselineRow}>
              <Text style={styles.baselineText}>Base (per spot):</Text>
              <View style={styles.baselineChip}>
                <Text style={styles.baselineChipText}>₹{spotPrice.toLocaleString()}</Text>
              </View>
            </View>

            {/* Quick-bump buttons */}
            <View style={styles.bumpRow}>
              {[10, 15, 25].map((pct) => (
                <TouchableOpacity
                  key={pct}
                  style={styles.bumpBtn}
                  onPress={() => applyPercentBump(pct)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.bumpBtnText}>+{pct}%</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.bumpBtn, styles.bumpBtnMax]}
                onPress={() => triggerMeme(maxPrice)}
                activeOpacity={0.8}
              >
                <Text style={[styles.bumpBtnText, { color: Colors.oxblood }]}>
                  Max ₹{maxPrice.toLocaleString()}
                </Text>
              </TouchableOpacity>
            </View>

            <BidSlider
              value={Number(bidPrice) || spotPrice}
              minValue={Math.max(1, Math.floor(spotPrice * 0.5))}
              maxValue={maxPrice}
              onChange={(v) => handleBidChange(String(v))}
              disabled={submitting}
            />
          </View>

          {/* REELS COUNT */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Number of Reels you want to create *</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={[styles.stepperBtn, Number(reelCount) <= 0 && styles.stepperBtnDisabled]}
                onPress={() => setReelCount(String(Math.max(0, Number(reelCount) - 1)))}
                disabled={submitting || Number(reelCount) <= 0}
                activeOpacity={0.75}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <View style={styles.stepperValue}>
                <Text style={styles.stepperValueText}>{reelCount}</Text>
              </View>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setReelCount(String(Number(reelCount) + 1))}
                disabled={submitting}
                activeOpacity={0.75}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* STORIES COUNT */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Number of Stories you want to create *</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={[styles.stepperBtn, Number(storyCount) <= 0 && styles.stepperBtnDisabled]}
                onPress={() => setStoryCount(String(Math.max(0, Number(storyCount) - 1)))}
                disabled={submitting || Number(storyCount) <= 0}
                activeOpacity={0.75}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <View style={styles.stepperValue}>
                <Text style={styles.stepperValueText}>{storyCount}</Text>
              </View>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setStoryCount(String(Number(storyCount) + 1))}
                disabled={submitting}
                activeOpacity={0.75}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* PROPOSAL */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Collaboration Proposal *</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              multiline
              numberOfLines={5}
              placeholder="Introduce yourself and describe why you'd be a great fit..."
              placeholderTextColor="rgba(63,3,11,0.35)"
              value={proposal}
              onChangeText={setProposal}
              editable={!submitting}
            />
          </View>

          {/* SUBMIT */}
          <TactileButton
            text="Submit Application"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            variant="primary"
            size="lg"
            fullWidth
            style={{ marginTop: 10 }}
          />
        </ScrollView>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  // ── Campaign info ──
  campaignInfo: {
    backgroundColor: 'rgba(63,3,11,0.03)',
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.05)',
  },
  campaignLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    color: Colors.rose,
    letterSpacing: 0.8,
  },
  campaignTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },
  nicheChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(63,3,11,0.07)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 2,
  },
  nicheChipText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: Colors.oxblood,
    textTransform: 'capitalize',
  },
  // ── Form ──
  formGroup: { gap: 8 },
  formLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 10.5,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  baselineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  baselineText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: 'rgba(63,3,11,0.5)',
  },
  baselineChip: {
    backgroundColor: 'rgba(63,3,11,0.06)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  baselineChipText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.oxblood,
    fontWeight: '700',
  },
  bumpRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  bumpBtn: {
    backgroundColor: 'rgba(63,3,11,0.06)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
  },
  bumpBtnMax: {
    backgroundColor: 'rgba(180,106,116,0.10)',
    borderColor: 'rgba(180,106,116,0.25)',
  },
  bumpBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.ink,
    fontWeight: '600',
  },
  formInput: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    fontSize: 14,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
  },
  textArea: {
    height: 140,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  // ── Stepper ──
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(63,3,11,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.35,
  },
  stepperBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    color: Colors.oxblood,
    fontWeight: '700',
    lineHeight: 24,
  },
  stepperInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    fontSize: 16,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '700',
  },
  stepperValue: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(63,3,11,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValueText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 20,
    color: Colors.ink,
    fontWeight: '800',
  },
  helperText: {
    fontSize: 10,
    color: 'rgba(63,3,11,0.45)',
    fontFamily: FontFamily.sansMedium,
    lineHeight: 14,
  },
  // ── Submit ──
  submitBtn: {
    backgroundColor: Colors.oxblood,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnDisabled: { backgroundColor: 'rgba(63,3,11,0.5)' },
  submitBtnText: { fontFamily: FontFamily.sans, fontSize: 14, color: '#ffffff' },
  // ── Meme Modal ──
  memeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  memeCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    paddingBottom: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  memeGif: {
    width: '100%',
    height: 400,
  },
  memeTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    marginTop: 16,
    marginHorizontal: 20,
    textAlign: 'center',
  },
  memeSubtitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: 'rgba(63,3,11,0.55)',
    marginTop: 6,
    marginHorizontal: 20,
    textAlign: 'center',
    lineHeight: 17,
  },
  memeDismissBtn: {
    marginTop: 18,
    marginHorizontal: 20,
    backgroundColor: Colors.oxblood,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  memeDismissText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
});
