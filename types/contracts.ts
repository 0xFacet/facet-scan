import { InternalTransaction, Transaction } from "./blocks";

export interface ContractArtifact {
  name: string;
  source_code: string;
  init_code_hash: string;
  abi: { [key: string]: { [key: string]: any } };
}

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
  transaction_hash: string;
  current_type: string;
  current_init_code_hash: string;
  abi: ContractAbi;
  call_receipts: InternalTransaction[];
  address: string;
  current_state: CurrentState;
  source_code: SourceCode[];
  deployment_transaction?: Transaction;
}
