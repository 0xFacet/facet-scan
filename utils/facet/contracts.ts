import { Contract, ContractArtifact } from "@/types/contracts";
import { get } from "../api-client";
import { Pair } from "@/types/pairs";

export const fetchContractArtifacts = async () => {
  const { result } = await get<{ result: ContractArtifact[] }>(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts/supported-contract-artifacts`,
    { next: { revalidate: 10 } }
  ).catch(() => ({
    result: [],
  }));
  return result;
};

export const fetchContracts = async ({
  page = 1,
  perPage = 20,
  hash,
}: {
  page?: string | number;
  perPage?: string | number;
  hash?: string | number;
} = {}) => {
  const params: { [key: string]: string } = {
    page: `${page}`,
    per_page: `${perPage}`,
  };
  if (hash) {
    params.init_code_hash = `${hash}`;
  }
  const { result, count } = await get<{
    result: Contract[];
    count: number;
  }>(`${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts`, {
    params,
    next: { revalidate: 10 },
  }).catch(() => ({
    result: [],
    count: 0,
  }));
  return { contracts: result, count };
};

export const fetchContract = async (address: string) => {
  const { result } = await get<{ result: Contract }>(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts/${address}`,
    {
      cache: "no-cache",
    }
  ).catch(() => ({
    result: null,
  }));
  return result;
};

export const sendStaticCall = async <T = any>(
  to: string,
  func: string,
  args?: any[] | { [key: string]: any }
) => {
  const params: { [key: string]: string } = {};
  if (args) {
    params.args = JSON.stringify(args);
  }
  const { result } = await get<{ result: T }>(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts/${to}/static-call/${func}`,
    {
      params,
      cache: "no-cache",
    }
  ).catch(() => ({
    result: null,
  }));
  return result;
};

export const storageGet = async <T = any>(
  to: string,
  func: string,
  args?: any[] | { [key: string]: any }
) => {
  const params: { [key: string]: string } = {};
  if (args) {
    params.args = JSON.stringify(args);
  }
  const { result } = await get<{ result: T }>(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts/${to}/storage-get/${func}`,
    {
      params,
      cache: "no-cache",
    }
  ).catch(() => ({
    result: null,
  }));
  return result;
};

export const getPools = async (userAddress?: `0x${string}`) => {
  const params: { [key: string]: string } = {};
  if (process.env.NEXT_PUBLIC_ROUTER_ADDRESS) {
    params.router = process.env.NEXT_PUBLIC_ROUTER_ADDRESS;
  }
  if (userAddress) {
    params.user_address = userAddress;
  }
  const result = await get(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts/pairs_for_router`,
    { params, next: { revalidate: 10 } }
  ).catch(() => ({}));
  return result as { [key: string]: Pair };
};
