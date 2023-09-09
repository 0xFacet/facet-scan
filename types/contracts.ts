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
  contract_address: string;
  error_message: string;
  ethscription_id: string;
  function_args: { [key: string]: any };
  function_name: string;
  logs: { data: { [key: string]: any }; event: string }[];
  status: string;
  timestamp: string;
}

export interface ContractFunction {
  args: {
    [key: string]: string;
  };
  from_parent: boolean;
  override_modifier: string;
  parent_functions: ContractFunction[];
  returns: string;
  source: string;
  state_mutability: string;
  type: string;
  visibility: string;
}

export type ContractAbi = {
  [key: string]: ContractFunction;
};

export type SourceCode = {
  code: string;
  language: string;
};

export interface Contract {
  abi: ContractAbi;
  call_receipts: CallReceipt[];
  address: string;
  current_state: CurrentState;
  source_code: SourceCode[];
}
