import { Colors } from '@/constants/brand';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ActionGrid } from '@/components/brand/home/ActionGrid';
import { CampaignsSection } from '@/components/brand/home/CampaignsSection';
import { CreateCampaignSheet } from '@/components/brand/home/CreateCampaignSheet';
import { PendingReviewsSection } from '@/components/brand/home/PendingReviewsSection';
import { SuggestedCreatorsSection } from '@/components/brand/home/SuggestedCreatorsSection';
import { TopBanner } from '@/components/brand/home/TopBanner';

export default function BrandHomeScreen() {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNewCampaign = () => {
    setIsCreateSheetOpen(true);
  };

  const handleCampaignSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <ScrollView
        style={styles.root}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        bounces={false}
      >
        <TopBanner />

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
