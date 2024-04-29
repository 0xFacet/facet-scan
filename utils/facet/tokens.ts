import { get } from "../api-client";
import { sendStaticCall, storageGet } from "./contracts";

const fethContractAddress = process.env.NEXT_PUBLIC_BRIDGED_ETHER_ADDRESS!;
const routerContractAddress = process.env.NEXT_PUBLIC_ROUTER_ADDRESS!;

export const getTokenVolume = async (tokenAddress: `0x${string}`) => {
  const params: { [key: string]: string } = {};
  if (fethContractAddress) {
    params.volume_contract = fethContractAddress;
  }
  if (routerContractAddress) {
    params.router_address = routerContractAddress;
  }
  const { result } = await get(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/tokens/${tokenAddress}/volume`,
    { params, next: { revalidate: 3600 } }
  ).catch(() => ({}));
  return result;
};

export const getTokenSwaps = async (
  tokenAddress: `0x${string}`,
  fromTimestamp: Date,
  toTimestamp: Date,
  revalidate?: number
) => {
  const params: { [key: string]: string } = {
    from_timestamp: Math.floor(fromTimestamp.getTime() / 1000).toString(),
    to_timestamp: Math.floor(toTimestamp.getTime() / 1000).toString(),
  };
  if (routerContractAddress) {
    params.router_address = routerContractAddress;
  }
  const { result } = await get(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/tokens/${tokenAddress}/swaps`,
    {
      params,
      next: { revalidate: revalidate ?? 10 },
    }
  ).catch(() => ({}));
  return result;
};

export const getFethBalance = async (userAddress: `0x${string}`) => {
  return storageGet(fethContractAddress, "balanceOf", [userAddress]);
};

export const getTokenPrices = async (tokenAddresses: `0x${string}`[]) => {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/tokens/token_prices`
  );
  const params: { [key: string]: string } = {
    token_addresses: tokenAddresses.join(","),
    eth_contract_address: fethContractAddress,
    router_address: routerContractAddress,
  };
  url.search = new URLSearchParams(params).toString();
  const { result } = await fetch(url.href, { cache: "no-store" })
    .then((res) => res.json())
    .catch(() => ({ result: {} }));
  return result as { token_address: string; last_swap_price: string }[];
};

export const getTokenHolders = async (tokenAddress: `0x${string}`) => {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/tokens/${tokenAddress}/holders`
  );
  const { result } = await fetch(url.href, { cache: "no-store" })
    .then((res) => res.json())
    .catch(() => ({ result: {} }));
  return result as { [key: string]: string };
};
