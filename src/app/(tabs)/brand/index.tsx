import { Colors } from '@/constants/brand';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ActionGrid } from '@/components/brand/home/ActionGrid';
import { CampaignsSection } from '@/components/brand/home/CampaignsSection';
import { CreateBrandProfileSheet } from '@/components/brand/home/CreateBrandProfileSheet';
import { CreateCampaignSheet } from '@/components/brand/home/CreateCampaignSheet';
import { PendingReviewsSection } from '@/components/brand/home/PendingReviewsSection';
import { SuggestedCreatorsSection } from '@/components/brand/home/SuggestedCreatorsSection';
import { SwitchBrandProfileSheet } from '@/components/brand/home/SwitchBrandProfileSheet';
import { TopBanner } from '@/components/brand/home/TopBanner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useProfilesStore } from '@/store/profiles';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

export default function BrandHomeScreen() {
  const session = useAuthStore((s) => s.session);
  const loadProfiles = useProfilesStore((s) => s.loadProfiles);
  const activeProfileId = useProfilesStore((s) => s.activeProfileId);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: brandProfile } = useQuery({
    queryKey: ['brandProfile'],
    queryFn: () => api.brands.profile().catch(() => null),
  });

  const hasProfile = !!(brandProfile && (brandProfile as any).id);

  useEffect(() => {
    const userId = session?.user?.id;
    if (userId && brandProfile) {
      loadProfiles(userId, brandProfile);
    }
  }, [brandProfile, session?.user?.id, loadProfiles]);

  const handleNewCampaign = () => {
    if (hasProfile === false) {
      setIsProfileSheetOpen(true);
    } else {
      setIsCreateSheetOpen(true);
    }
  };

  const handleCampaignSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['brandCampaigns', activeProfileId] });
    queryClient.invalidateQueries({ queryKey: ['brandDashboard', activeProfileId] });
  };

  const handleProfileSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['brandProfile'] });
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
        <TopBanner onSwitchProfile={() => setIsSwitcherOpen(true)} />

        <View style={styles.body}>
          <ActionGrid onNewCampaign={handleNewCampaign} />
          <CampaignsSection onNewCampaign={handleNewCampaign} />
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
        onSwitchSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['brandProfile'] });
          queryClient.invalidateQueries({ queryKey: ['brandDashboard', activeProfileId] });
          queryClient.invalidateQueries({ queryKey: ['brandCampaigns', activeProfileId] });
        }}
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
