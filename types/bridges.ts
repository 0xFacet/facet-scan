export interface BridgableToken {
  id: string;
  symbol: string;
  symbolWrapped: string;
  name: string;
  nameWrapped: string;
  decimals: number;
  decimalsWrapped: number;
  smartContract?: `0x${string}` | null;
  dumbContract: `0x${string}`;
  allowanceOfSmartContractToken?: bigint;
  evmBalance?: bigint;
  facetBalance?: bigint;
  tokenSmartContractAddress?: `0x${string}`;
  bridge: {
    type: BridgeType;
    smartContract: `0x${string}`;
    dumbContract: `0x${string}`;
    maxBridgeAmount?: null | bigint;
    mintAmount?: null | bigint;
  };
}

export interface BridgableTokenBridge {
  bridge_type: BridgeType;
  tick: string;
  smart_contract: `0x${string}`;
  dumb_contract: `0x${string}`;
  max_bridge_amount: null | string;
  mint_amount: null | string;
}

export type BridgeType =
  | "EtherBridge"
  | "EthscriptionsTokenBridge"
  | "ERC20Bridge";
