import {
  mapMarketplaceListings,
  MarketplaceListingRaw,
  MARKETPLACE_SORT_OPTIONS,
} from './marketplaceViewModels';

describe('mapMarketplaceListings', () => {
  const raw: MarketplaceListingRaw = {
    id: 'listing-1',
    price: '5.0000000',
    currency: 'XLM',
    createdAt: '2026-08-27T00:00:00.000Z',
    nft: {
      id: 'nft-1',
      name: 'Cosmic Cat',
      image: 'https://example.com/nft.png',
      creator: { id: 'creator-1', username: 'astro_artist' },
    },
  };

  it('maps raw listings into card view-models', () => {
    const [card] = mapMarketplaceListings([raw]);

    expect(card).toEqual({
      id: 'listing-1',
      nftId: 'nft-1',
      name: 'Cosmic Cat',
      imageUrl: 'https://example.com/nft.png',
      priceLabel: '5 XLM',
      creatorName: 'astro_artist',
    });
  });

  it('filters out listings with no attached nft', () => {
    const withoutNft: MarketplaceListingRaw = { ...raw, id: 'listing-2', nft: null };
    const cards = mapMarketplaceListings([raw, withoutNft]);
    expect(cards).toHaveLength(1);
    expect(cards[0].id).toBe('listing-1');
  });

  it('returns an empty array for null/undefined input', () => {
    expect(mapMarketplaceListings(null)).toEqual([]);
    expect(mapMarketplaceListings(undefined)).toEqual([]);
  });

  it('returns an empty array for an empty input array', () => {
    expect(mapMarketplaceListings([])).toEqual([]);
  });

  it('falls back to an empty image string when nft.image is missing', () => {
    const [card] = mapMarketplaceListings([
      { ...raw, nft: { ...raw.nft!, image: null } },
    ]);
    expect(card.imageUrl).toBe('');
  });

  it('falls back to "Unknown" when the creator has no username', () => {
    const [card] = mapMarketplaceListings([
      { ...raw, nft: { ...raw.nft!, creator: { id: 'creator-1', username: null } } },
    ]);
    expect(card.creatorName).toBe('Unknown');
  });

  it('falls back to "Unknown" when the nft has no creator at all', () => {
    const [card] = mapMarketplaceListings([
      { ...raw, nft: { ...raw.nft!, creator: null } },
    ]);
    expect(card.creatorName).toBe('Unknown');
  });

  it('preserves ordering from the input array', () => {
    const second: MarketplaceListingRaw = { ...raw, id: 'listing-2', nft: { ...raw.nft!, id: 'nft-2' } };
    const cards = mapMarketplaceListings([raw, second]);
    expect(cards.map((c) => c.id)).toEqual(['listing-1', 'listing-2']);
  });
});

describe('MARKETPLACE_SORT_OPTIONS', () => {
  it('lists every sort option the backend accepts, newest first', () => {
    expect(MARKETPLACE_SORT_OPTIONS).toEqual(['newest', 'oldest', 'price_asc', 'price_desc']);
  });
});
