export interface Pair {
  token0: PairToken;
  token1: PairToken;
  lp_reserves: LPReserves;
  tvl_in_weth: string;
  user_balances?: UserBalances | null;
  user_allowances?: UserAllowances | null;
}

export interface PairToken {
  address: `0x${string}`;
  name: string;
  symbol: string;
  decimals: string;
}

export interface LPReserves {
  token0: string;
  token1: string;
}

export interface UserBalances {
  lp: string;
  token0: string;
  token1: string;
}

export interface UserAllowances {
  lp: string;
  token0: string;
  token1: string;
}
