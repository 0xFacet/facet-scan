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
  runtime_ms: number;
  call_type: string;
  gas_price: string;
  gas_used: string;
  transaction_fee: string;
}

export interface InternalTransaction {
  transaction_hash: string;
  internal_transaction_index: string;
  from_address: string;
  to_contract_address: string;
  effective_contract_address: string;
  function: string;
  args: { [key: string]: any };
  call_type: string;
  return_value?: string | null;
  logs: any[];
  error?: string | null;
  status: string;
  block_number: string;
  transaction_index: string;
  runtime_ms: string;
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
