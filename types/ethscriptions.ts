import { Collection, CollectionItem } from "./collections";

export interface Transfer {
  block_number: number;
  from: `0x${string}`;
  overall_order_number: string;
  overall_order_number_as_int: number;
  timestamp: string;
  to: `0x${string}`;
  transaction_hash: string;
  transaction_index: number;
  transfer_index: number;
  sale_price: string;
}

export interface Ethscription {
  block_confirmations: number;
  content_uri: string;
  creation_timestamp: string;
  creator: string;
  current_owner: string;
  mimetype: string;
  image_removed_by_request_of_rights_holder?: boolean | null;
  ethscription_number?: null | number;
  finalization_status: FinalizationStatus;
  min_block_confirmations: number;
  overall_order_number_as_int: number;
  transaction_hash: string;
  valid_data_uri: boolean;
  valid_transfers?: Transfer[];
  valid_listings?: Listing[];
  collection_items?: CollectionItem[];
  collections?: Collection[];
}

export enum FinalizationStatus {
  Pending = "pending",
  PartiallyConfirmed = "partially_confirmed",
  Safe = "safe",
  Finalized = "finalized",
}

export interface Listing {
  listing_id: string;
  seller: string;
  start_time: number;
  end_time: number;
  domain_name: string;
  verifying_contract: string;
  chain_id: number;
  version: string;
  signature: string;
  ethscription_id: string;
  price: string;
}
