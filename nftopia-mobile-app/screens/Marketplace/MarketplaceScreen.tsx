import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/MainNavigator';
import { colors, spacing } from '@/constants/theme';
import { useMarketplaceListings } from '@/hooks/useMarketplaceListings';
import type { MarketplaceListingCard as MarketplaceListingCardVM, MarketplaceSortOption } from '@/src/utils/marketplaceViewModels';
import type { Category } from '@/constants/categories';
import { ErrorFallback } from '@/src/components/ErrorFallback';
import { withErrorBoundary } from '@/src/hoc/withErrorBoundary';
import { useAnalytics } from '@/src/hooks/useAnalytics';
import { usePullToRefresh } from '@/src/hooks/usePullToRefresh';
import { MarketplaceCardSkeleton } from '@/src/components/skeletons';
import { PullToRefresh } from '@/src/components/PullToRefresh';
import { ANALYTICS_EVENTS } from '@/src/analytics/config';
import { analyticsService } from '@/src/analytics/analytics.service';
import { errorLogger } from '@/src/errors/logger';
import MarketplaceListingCard from '@/components/ui/MarketplaceListingCard';
import MarketplaceSearchBar from '@/components/ui/MarketplaceSearchBar';
import MarketplaceSortBar from '@/components/ui/MarketplaceSortBar';
import CategorySelector from '@/components/ui/CategorySelector';

const GRID_COLUMNS = 2;

function MarketplaceContent() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainStackParamList, 'Marketplace'>>();
  const { track, trackScreenView, trackPerformance } = useAnalytics();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<MarketplaceSortOption>('newest');

  const activeCategoryId = route.params?.category;

  const { listings, loading, error, loadMore, refetch } = useMarketplaceListings({
    search: search || undefined,
    category: activeCategoryId,
    sortBy,
  });

  const {
    isRefreshing,
    error: refreshError,
    lastUpdated,
    handleRefresh,
    getLastUpdatedText,
    cooldownRemaining,
  } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
    },
    cooldown: 2000,
    hapticFeedback: true,
    trackAnalytics: true,
    analyticsEvent: 'marketplace_refresh',
  });

  const handleSelectCategory = (category: Category) => {
    const nextCategoryId = category.id === activeCategoryId ? undefined : category.id;
    track(ANALYTICS_EVENTS.SEARCH_FILTER, { screen: 'marketplace', categoryId: nextCategoryId });
    navigation.setParams({ category: nextCategoryId });
  };

  const handleSearchChange = (query: string) => {
    setSearch(query);
    if (query) {
      track(ANALYTICS_EVENTS.SEARCH, { screen: 'marketplace', query });
    }
  };

  const handleSortChange = (option: MarketplaceSortOption) => {
    setSortBy(option);
    track(ANALYTICS_EVENTS.SEARCH_FILTER, { screen: 'marketplace', sortBy: option });
  };

  useEffect(() => {
    trackScreenView('Marketplace');
  }, [trackScreenView]);

  const handleListingPress = (item: MarketplaceListingCardVM) => {
    track(ANALYTICS_EVENTS.NFT_VIEW, {
      nftId: item.nftId,
      nftName: item.name,
      source: 'marketplace_grid',
    });
    navigation.navigate('NFTDetail', { nftId: item.nftId });
  };

  const renderItem = ({ item }: { item: MarketplaceListingCardVM }) => (
    <MarketplaceListingCard
      item={item}
      onPress={handleListingPress}
      onImageLoad={(listing) => {
        trackPerformance('image_load_time', Date.now(), {
          nftId: listing.nftId,
          type: 'marketplace',
        });
      }}
      onImageError={(listing, err) => {
        errorLogger.log(err, 'MarketplaceImage', undefined, { nftId: listing.nftId });
        track(ANALYTICS_EVENTS.ERROR_OCCURRED, {
          component: 'MarketplaceImage',
          nftId: listing.nftId,
          error: err.message,
        });
      }}
    />
  );

  const renderFooter = () => {
    if (!loading || listings.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer} testID="marketplace-empty">
      <Text style={styles.emptyTitle}>{t('marketplace.noNFTs')}</Text>
      <Text style={styles.emptyMessage}>{t('marketplace.noNFTsMessage')}</Text>
    </View>
  );

  const showFullScreenError = error && listings.length === 0;
  const showInitialLoading = loading && listings.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            track('marketplace_back');
            navigation.goBack();
          }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('marketplace.title')}</Text>
      </View>

      <View style={styles.filters}>
        <MarketplaceSearchBar onSearchChange={handleSearchChange} testID="marketplace-search" />
        <CategorySelector
          selectedCategoryId={activeCategoryId}
          onSelectCategory={handleSelectCategory}
          testID="marketplace-category-selector"
        />
        <MarketplaceSortBar selected={sortBy} onSelect={handleSortChange} testID="marketplace-sort" />
      </View>

      {showFullScreenError ? (
        <ErrorFallback
          error={error}
          onRetry={() => {
            track('marketplace_refresh');
            handleRefresh();
          }}
          customMessage="Failed to load NFTs. Please check your connection and try again."
        />
      ) : showInitialLoading ? (
        <MarketplaceCardSkeleton count={4} animated variant="grid" />
      ) : (
        <PullToRefresh
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          loading={loading}
          error={refreshError}
          onRetry={handleRefresh}
          lastUpdated={lastUpdated}
          getLastUpdatedText={getLastUpdatedText}
          cooldownRemaining={cooldownRemaining}
          tintColor="#6C5CE7"
          title="Pull to refresh marketplace"
        >
          <FlatList
            data={listings}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={GRID_COLUMNS}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              track('marketplace_load_more', { currentCount: listings.length });
              loadMore();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
          />
        </PullToRefresh>
      )}
    </View>
  );
}

const MarketplaceScreen = withErrorBoundary(MarketplaceContent, {
  name: 'MarketplaceScreen',
  onError: (error, errorInfo) => {
    errorLogger.log(error, 'MarketplaceScreen', undefined, { componentStack: errorInfo.componentStack });
    analyticsService.trackError(error, { componentStack: errorInfo.componentStack });
  },
});

export default MarketplaceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  filters: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
    flexGrow: 1,
  },
  row: {
    gap: spacing.md,
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
