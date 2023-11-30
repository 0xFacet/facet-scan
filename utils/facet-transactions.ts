import { FacetCallPayload, FacetCreatePayload } from "@/types/payloads";
import { fetchTransaction, simulateTransaction } from "./data";
import { getAccount, getNetwork, sendTransaction } from "@wagmi/core";
import { facetAddress } from "@/app/constants";
import { toHex } from "viem";

export const waitForTransactionResult = async (pendingCallTxnHash: string) => {
  let loops = 0;
  while (true) {
    const result = await fetchTransaction(pendingCallTxnHash);
    if (result) {
      return result;
    }
    if (loops === 10) {
      throw "Timeout";
    }
    loops++;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
};

export const sendFacetCall = async (
  to: string,
  func: string,
  args: any[] | { [key: string]: any }
) => {
  const { address, isDisconnected } = getAccount();
  const { chain } = getNetwork();
  if (!address || isDisconnected) throw "Not connected";
  if (!chain || chain.unsupported) throw "Wrong network";
  const payload: FacetCallPayload = {
    op: "call",
    data: {
      to,
      function: func,
      args,
    },
  };
  return sendFacetTransaction(address, payload);
};

export const sendFacetCreate = async (
  sourceCode: string | null,
  initCodeHash: string,
  args: any[] | { [key: string]: any }
) => {
  const { address, isDisconnected } = getAccount();
  const { chain } = getNetwork();
  if (!address || isDisconnected) throw "Not connected";
  if (!chain || chain.unsupported) throw "Wrong network";
  const payload: FacetCreatePayload = {
    op: "create",
    data: {
      init_code_hash: initCodeHash,
      args,
    },
  };
  if (sourceCode) payload.data.source_code = sourceCode;
  return sendFacetTransaction(address, payload);
};

const sendFacetTransaction = async (
  from: string,
  payload: FacetCallPayload | FacetCreatePayload
) => {
  const { transaction_receipt } = await simulateTransaction(from, payload);

  if (!transaction_receipt) throw "Transaction failed";

  if (transaction_receipt.error?.message)
    throw transaction_receipt.error?.message;

  const txn = await sendTransaction({
    to: facetAddress,
    data: toHex(
      `data:application/vnd.facet.tx+json;rule=esip6,${JSON.stringify(payload)}`
    ),
  });

  return txn;
};
