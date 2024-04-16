export interface CollectionItem {
  id: string;
  asset_contract: `0x${string}`;
  token_uri: {
    name: string;
    description: string;
    animation_url?: string;
    image: string;
    attributes?: {
      value: string;
      trait_type: string;
    }[];
  };
  owner: string;
  asset_id: string;
  asset_type: string;
  name: string;
  description: string;
  external_url: string | null;
  background_color: string | null;
  created_at: string;
  updated_at: string;
  composite_asset_id: string;
  offers: Offer[];
  highest_bid: Offer | null;
  lowest_listing: Offer | null;
}

export interface Offer {
  id: string;
  offer_id: string;
  offer_type: "Listing" | "Bid";
  offerer: string;
  asset_type: string;
  asset_contract: string;
  composite_asset_id: string;
  asset_id: string;
  asset_amount: string;
  consideration_token: string;
  consideration_amount: string;
  start_time: string;
  end_time: string;
  domain_name: string;
  verifying_contract: string;
  chain_id: string;
  domain_version: string;
  signature: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  symbol: string | null;
  slug: string;
  asset_type: string;
  asset_contract: `0x${string}`;
  logo_image_uri: string | null;
  banner_image_uri: string | null;
  total_supply: string;
  description: string | null;
  twitter_link: string | null;
  discord_link: string | null;
  website_link: string | null;
  background_color: string | null;
  stats: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  contract_type: string;
  daily_volume: string;
  all_time_volume: string;
  daily_sale_count: string;
  all_time_sale_count: string;
  unique_holder_count: string;
  number_listed: string;
  floor_price: string;
  verified: boolean;
  featured: boolean;
  attribute_counts: {
    [key: string]: { [key: string]: string };
  };
}
