import { Colors } from '@/constants/brand';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ActionGrid } from '@/components/brand/home/ActionGrid';
import { CampaignsSection } from '@/components/brand/home/CampaignsSection';
import { CreateCampaignSheet } from '@/components/brand/home/CreateCampaignSheet';
import { SwitchBrandProfileSheet } from '@/components/brand/home/SwitchBrandProfileSheet';
import { CreateBrandProfileSheet } from '@/components/brand/home/CreateBrandProfileSheet';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import { PendingReviewsSection } from '@/components/brand/home/PendingReviewsSection';
import { SuggestedCreatorsSection } from '@/components/brand/home/SuggestedCreatorsSection';
import { TopBanner } from '@/components/brand/home/TopBanner';
import { api } from '@/lib/api';

export default function BrandHomeScreen() {
  const session = useAuthStore((s) => s.session);
  const loadProfiles = useProfilesStore((s) => s.loadProfiles);
  const activeProfileId = useProfilesStore((s) => s.activeProfileId);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let active = true;
    const checkProfile = async () => {
      try {
        const res = await api.brands.profile();
        if (active) {
          setHasProfile(res && (res as any).id ? true : false);
          
          // Seed the local profiles store with the active backend profile
          const userId = session?.user?.id;
          if (userId && res) {
            await loadProfiles(userId, res);
          }
        }
      } catch (err) {
        console.warn("BrandHomeScreen: failed to check profile status", err);
        if (active) {
          setHasProfile(false);
        }
      }
    };
    checkProfile();
    return () => { active = false; };
  }, [refreshTrigger, session?.user?.id, activeProfileId]);

  const handleNewCampaign = () => {
    if (hasProfile === false) {
      setIsProfileSheetOpen(true);
    } else {
      setIsCreateSheetOpen(true);
    }
  };

  const handleCampaignSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleProfileSuccess = () => {
    setHasProfile(true);
    setRefreshTrigger(prev => prev + 1);
    // Auto open campaign creation after profile setup
    setTimeout(() => {
      setIsCreateSheetOpen(true);
    }, 600);
  };

  return (
    <>
      <ScrollView
        style={styles.root}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        bounces={false}
      >
        <TopBanner key={refreshTrigger} onSwitchProfile={() => setIsSwitcherOpen(true)} />

        <View style={styles.body}>
          <ActionGrid onNewCampaign={handleNewCampaign} />
          <CampaignsSection onNewCampaign={handleNewCampaign} refreshTrigger={refreshTrigger} />
          <PendingReviewsSection />
          <SuggestedCreatorsSection />
        </View>
      </ScrollView>

      <CreateCampaignSheet
        isOpen={isCreateSheetOpen}
        onClose={() => setIsCreateSheetOpen(false)}
        onSuccess={handleCampaignSuccess}
      />

      <CreateBrandProfileSheet
        isOpen={isProfileSheetOpen}
        onClose={() => setIsProfileSheetOpen(false)}
        onSuccess={handleProfileSuccess}
        initialData={null}
      />

      <SwitchBrandProfileSheet
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        onSwitchSuccess={() => setRefreshTrigger(prev => prev + 1)}
        onAddNewProfile={() => setIsProfileSheetOpen(true)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.creamLite,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
});
