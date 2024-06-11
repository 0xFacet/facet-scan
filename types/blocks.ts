export interface Log {
  data: { [key: string]: any };
  event: string;
  contractType: string;
  contractAddress: string;
}

export interface ErrorMessage {
  message: string;
}

export interface Transaction {
  transaction_hash: string;
  from: `0x${string}`;
  to?: `0x${string}` | null;
  contract_address?: `0x${string}` | null;
  to_or_contract_address?: `0x${string}` | null;
  status: "success" | "failure";
  function: string;
  args: { [key: string]: any };
  logs: Log[];
  block_timestamp: string;
  error?: ErrorMessage | null;
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
  from: `0x${string}`;
  to?: `0x${string}` | null;
  contract_address?: `0x${string}` | null;
  to_or_contract_address?: `0x${string}` | null;
  function: string;
  args: { [key: string]: any };
  call_type: string;
  return_value?: string | null;
  logs: Log[];
  block_timestamp: string;
  error?: ErrorMessage | null;
  status: "success" | "failure";
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
  timestamp: string;
  updated_at: string;
  transaction_count?: number;
}
