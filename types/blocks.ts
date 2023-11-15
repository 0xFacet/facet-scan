export interface Transaction {
  transaction_hash: string;
  caller: string;
  status: string;
  function_name: string;
  function_args: { [key: string]: any };
  logs: any[];
  timestamp: string;
  error_message?: string | null;
  contract_address: string;
  block_number: number;
  transaction_index: number;
  block_blockhash: string;
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
  transaction_count?: number;
}
