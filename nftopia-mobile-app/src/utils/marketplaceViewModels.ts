// Pure data-shaping helpers for the Marketplace listing screen. Kept
// side-effect free and decoupled from GraphQL/React so they're cheap to
// unit test independently of rendering.

import { formatXlmAmount } from './discoveryViewModels';

export interface MarketplaceListingRaw {
  id: string;
  price: string;
  currency: string;
  createdAt: string;
  nft?: {
    id: string;
    name: string;
    image?: string | null;
    creator?: {
      id: string;
      username?: string | null;
    } | null;
  } | null;
}

export interface MarketplaceListingCard {
  id: string;
  nftId: string;
  name: string;
  imageUrl: string;
  priceLabel: string;
  creatorName: string;
}

const FALLBACK_IMAGE = '';
const FALLBACK_CREATOR_NAME = 'Unknown';

/** Maps raw `listings` results into card view-models for the Marketplace grid. */
export function mapMarketplaceListings(
  listings: MarketplaceListingRaw[] | null | undefined,
): MarketplaceListingCard[] {
  if (!listings) return [];

  return listings
    .filter((listing): listing is MarketplaceListingRaw & { nft: NonNullable<MarketplaceListingRaw['nft']> } =>
      Boolean(listing.nft),
    )
    .map((listing) => ({
      id: listing.id,
      nftId: listing.nft.id,
      name: listing.nft.name,
      imageUrl: listing.nft.image || FALLBACK_IMAGE,
      priceLabel: `${formatXlmAmount(listing.price)} ${listing.currency}`,
      creatorName: listing.nft.creator?.username || FALLBACK_CREATOR_NAME,
    }));
}

export type MarketplaceSortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc';

export const MARKETPLACE_SORT_OPTIONS: MarketplaceSortOption[] = [
  'newest',
  'oldest',
  'price_asc',
  'price_desc',
];
