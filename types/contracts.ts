export interface CurrentStateSimpleToken {
  contract_type: "SimpleToken";
  name: string;
  symbol: string;
  max_supply: number;
  per_mint_limit: number;
  total_supply: number;
  balances: { [key: string]: number };
}

export interface CurrentStateAllowanceToken {
  contract_type: "AllowanceToken";
  name: string;
  symbol: string;
  allowances: { [key: string]: number }[];
  pending_withdrawals: { [key: string]: number }[];
  trusted_smart_contract: string;
  total_supply: number;
  balances: { [key: string]: number };
}

export interface CurrentStateBridgeableToken {
  contract_type: "BridgeableToken";
  name: string;
  symbol: string;
  allowances: { [key: string]: number }[];
  pending_withdrawals: { [key: string]: number }[];
  trusted_smart_contract: string;
  total_supply: number;
  balances: { [key: string]: number };
}

export interface CurrentStateDexLiquidityPool {
  contract_type: "DexLiquidityPool";
  token0: string;
  token1: string;
}

export type CurrentState = (
  | CurrentStateSimpleToken
  | CurrentStateAllowanceToken
  | CurrentStateBridgeableToken
  | CurrentStateDexLiquidityPool
) & {
  [key: string]: any;
};

export interface CallReceipt {
  caller: `0x${string}`;
  contract_id: string;
  error_messages: string[];
  ethscription_id: string;
  function_args: { [key: string]: any };
  function_name: string;
  logs: string[];
  status: string;
  timestamp: string;
}

export type ContractAbi = { [key: string]: any };

export interface Contract {
  abi: ContractAbi;
  call_receipts: CallReceipt[];
  contract_id: string;
  current_state: CurrentState;
}
