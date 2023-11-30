import { Block, Transaction, InternalTransaction } from "@/types/blocks";
import { Contract, ContractArtifact } from "@/types/contracts";
import { FacetCallPayload, FacetCreatePayload } from "@/types/payloads";

export const fetchTotalBlocks = async () => {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URI}/blocks/total`);
  const { result } = await fetch(url.href, { cache: "no-store" })
    .then((res) => res.json())
    .catch(() => ({
      result: 0,
    }));
  return result as string;
};

export const fetchBlocks = async ({ page = 1, perPage = 20 } = {}) => {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URI}/blocks`);
  url.search = new URLSearchParams({
    page: `${page}`,
    per_page: `${perPage}`,
  }).toString();
  const { result } = await fetch(url.href, { cache: "no-store" })
    .then((res) => res.json())
    .catch(() => ({
      result: [],
    }));
  return result as Block[];
};

export const fetchBlock = async (blockNumber: string) => {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/blocks/${blockNumber}`
  );
  const { result } = await fetch(url.href, { cache: "no-store" })
    .then((res) => res.json())
    .catch(() => ({
      result: null,
    }));
  return result as Block;
};

export const fetchTotalTransactions = async () => {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/transactions/total`
  );
  const { result } = await fetch(url.href, { cache: "no-store" })
    .then((res) => res.json())
    .catch(() => ({
      result: null,
    }));
  return result as {
    transaction_count: string;
    unique_from_address_count: string;
  };
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
  const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URI}/transactions`);
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
  url.search = new URLSearchParams(params).toString();
  const { result, count } = await fetch(url.href, { cache: "no-store" })
    .then((res) => res.json())
    .catch(() => ({
      result: [],
      count: 0,
    }));
  return { transactions: result, count } as {
    transactions: Transaction[];
    count: number;
  };
};

export const simulateTransaction = async (
  from: string,
  payload: FacetCallPayload | FacetCreatePayload
) => {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts/simulate`
  );
  const params = {
    from,
  };
  url.search = new URLSearchParams(params).toString();
  const { result } = await fetch(url.href, {
    method: "post",
    body: JSON.stringify(payload),
    cache: "no-store",
  })
    .then((res) => res.json())
    .catch(() => ({
      result: { transaction_receipt: null },
    }));
  return result as { transaction_receipt: Transaction | null };
};

export const fetchTransaction = async (txHash: string) => {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/transactions/${txHash}`
  );
  const { result } = await fetch(url.href, { cache: "no-store" })
    .then((res) => res.json())
    .catch(() => ({
      result: null,
    }));
  return result as Transaction;
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
  const { result, count } = await fetch(url.href, { cache: "no-store" })
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

export const fetchContractArtifacts = async () => {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts/supported-contract-artifacts`
  );
  const { result } = await fetch(url.href, { cache: "no-store" })
    .then((res) => res.json())
    .catch(() => ({
      result: [],
    }));
  return result as ContractArtifact[];
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
  const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts`);
  const params: { [key: string]: string } = {
    page: `${page}`,
    per_page: `${perPage}`,
  };
  if (hash) {
    params.init_code_hash = `${hash}`;
  }
  url.search = new URLSearchParams(params).toString();
  const { result, count } = await fetch(url.href, { cache: "no-store" })
    .then((res) => res.json())
    .catch(() => ({
      result: [],
      count: 0,
    }));
  return { contracts: result, count } as {
    contracts: Contract[];
    count: number;
  };
};

export const fetchContract = async (address: string) => {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts/${address}`
  );
  const { result } = await fetch(url.href, { cache: "no-store" })
    .then((res) => res.json())
    .catch(() => ({
      result: null,
    }));
  return result as Contract;
};

export const sendStaticCall = async (
  to: string,
  func: string,
  args?: any[] | { [key: string]: any }
) => {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts/${to}/static-call/${func}`
  );
  const params: { [key: string]: string } = {};
  if (args) {
    params.args = JSON.stringify(args);
  }
  url.search = new URLSearchParams(params).toString();
  const { result } = await fetch(url.href, { cache: "no-store" })
    .then((res) => res.json())
    .catch(() => ({
      result: null,
    }));
  return result;
};

export const getCardOwner = async (name: string) =>
  sendStaticCall(
    process.env.NEXT_PUBLIC_CARDS_CONTRACT_ADDRESS ??
      "0xde11257ac24e96b8e39df45dbd4d3cf32237d63d",
    "resolveName",
    [name]
  );
