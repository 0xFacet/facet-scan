export interface EthscriptionTransfer {
  id: number;
  ethscription_transaction_hash: string;
  transaction_hash: string;
  from_address: string;
  to_address: string;
  block_number: number;
  block_timestamp: number;
  block_blockhash: string;
  event_log_index: null | number;
  transfer_index: number;
  transaction_index: number;
  enforced_previous_owner: null | string;
  created_at: string;
  updated_at: string;
}

export interface Ethscription {
  id: number;
  transaction_hash: `0x${string}`;
  block_number: number;
  transaction_index: number;
  block_timestamp: number;
  block_blockhash: string;
  event_log_index: null | number;
  ethscription_number: number;
  creator: string;
  initial_owner: string;
  current_owner: string;
  previous_owner: string;
  content_uri: string;
  content_sha: string;
  esip6: boolean;
  mimetype: string;
  media_type: string;
  mime_subtype: string;
  gas_price: string;
  gas_used: number;
  transaction_fee: string;
  value: string;
  created_at: string;
  updated_at: string;
  latest_transfer?: EthscriptionTransfer;
}
