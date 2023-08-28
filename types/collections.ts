export interface ItemAttribute {
  value: string;
  trait_type: string;
}

export interface CollectionItem {
  background_color: string | null;
  collection_id: number;
  created_at: string;
  description: string | null;
  ethscription_id: string;
  external_url: string | null;
  id: number;
  item_attributes: ItemAttribute[];
  name: string;
  updated_at: string;
  item_index: number;
}

export interface Collection {
  id: number;
  background_color: string;
  banner_image_uri: string | null;
  description: string;
  discord_link: string | null;
  logo_image_uri: string;
  name: string;
  slug: string;
  total_supply: number;
  twitter_link: string | null;
  website_link: string;
  stats: {
    all_time_sale_count: number;
    all_time_volume: string;
    daily_sale_count: number;
    daily_volume: string;
    unique_holder_count: number;
    floor_price: string;
    number_listed: number;
  };
}
