export interface Transaction {
  block_blockhash: string;
  block_number: number;
  content_sha: string;
  content_uri: string;
  contract_actions_processed_at: string;
  created_at: string;
  creation_timestamp: number;
  creator: string;
  current_owner: string;
  ethscription_id: string;
  id: number;
  initial_owner: string;
  mimetype: string;
  previous_owner: string | null;
  transaction_index: number;
  updated_at: string;
}

export interface Block {
  block_number: number;
  blockhash: string;
  created_at: string;
  id: number;
  imported_at: string;
  parent_blockhash: string;
  processing_state: string;
  timestamp: number;
  updated_at: string;
  ethscriptions?: Transaction[];
}
