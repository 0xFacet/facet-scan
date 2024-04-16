import { InternalTransaction, Transaction } from "@/types/blocks";
import { get, post } from "../api-client";
import { FacetCallPayload, FacetCreatePayload } from "@/types/payloads";

export const fetchTotalTransactions = async () => {
  const { result } = await get<{
    result: {
      transaction_count: string;
      unique_from_address_count: string;
    };
  }>(`${process.env.NEXT_PUBLIC_API_BASE_URI}/transactions/total`, {
    next: { revalidate: 10 },
  }).catch(() => ({
    result: {
      transaction_count: "0",
      unique_from_address_count: "0",
    },
  }));
  return result;
};

export const fetchTransactions = async ({
  page = 1,
  perPage = 20,
  block,
  to,
  from,
  toOrFrom,
}: {
  page?: string | number;
  perPage?: string | number;
  block?: string | number;
  to?: string;
  from?: string;
  toOrFrom?: string;
} = {}) => {
  const params: { [key: string]: string } = {
    page: `${page}`,
    per_page: `${perPage}`,
  };
  if (block) {
    params.block_number = `${block}`;
  }
  if (to) {
    params.to = to;
  }
  if (from) {
    params.from = from;
  }
  if (toOrFrom) {
    params.to_or_from = toOrFrom;
  }
  const { result, count } = await get<{
    result: Transaction[];
    count: number;
  }>(`${process.env.NEXT_PUBLIC_API_BASE_URI}/transactions`, {
    params,
    next: { revalidate: 10 },
  }).catch(() => ({
    result: [],
    count: 0,
  }));
  return { transactions: result, count };
};

export const fetchTransaction = async (txn: string) => {
  const { result } = await get<{ result: Transaction }>(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/transactions/${txn}`,
    {
      next: { revalidate: 10 },
    }
  ).catch(() => ({ result: null }));
  return result;
};

export const fetchInternalTransactions = async ({
  page = 1,
  perPage = 20,
  txHash,
  to,
  from,
  toOrFrom,
}: {
  page?: string | number;
  perPage?: string | number;
  txHash?: string;
  to?: string;
  from?: string;
  toOrFrom?: string;
} = {}) => {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URI}/contract_calls`);
  const params: { [key: string]: string } = {
    page: `${page}`,
    per_page: `${perPage}`,
  };
  if (txHash) {
    params.transaction_hash = `${txHash}`;
  }
  if (to) {
    params.to = to;
  }
  if (from) {
    params.from = from;
  }
  if (toOrFrom) {
    params.to_or_from = toOrFrom;
  }
  url.search = new URLSearchParams(params).toString();
  const { result, count } = await fetch(url.href, { next: { revalidate: 10 } })
    .then((res) => res.json())
    .catch(() => ({
      result: [],
      count: 0,
    }));
  return { transactions: result, count } as {
    transactions: InternalTransaction[];
    count: number;
  };
};

export const simulateTransaction = async (
  from: string,
  payload: FacetCallPayload | FacetCreatePayload
) => {
  const params = {
    from,
  };
  interface SimulationResponse {
    transaction_receipt: Transaction | null;
    internal_transactions: Transaction[];
  }
  const { result } = await post<{
    result: SimulationResponse;
  }>(`${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts/simulate`, {
    params,
    body: JSON.stringify(payload),
    next: { revalidate: 10 },
  }).catch(() => ({
    result: {
      transaction_receipt: null,
      internal_transactions: [],
    } as SimulationResponse,
  }));
  return result;
};
