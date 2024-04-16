import { FacetCallPayload, FacetCreatePayload } from "@/types/payloads";
import {
  getAccount,
  sendTransaction,
  writeContract,
  estimateGas,
  getPublicClient,
} from "@wagmi/core";
import { toHex } from "viem";
import { fetchTransaction, simulateTransaction } from "./transactions";
import { storageGet, sendStaticCall } from "./contracts";
import { isSupportedChain, wagmiConfig } from "@/app/providers";
import { compressDataWithRatioCheck } from "../gzip";

const facetAddress =
  "0x00000000000000000000000000000000000face7" as `0x${string}`;
const buddyFactoryAddress = process.env
  .NEXT_PUBLIC_BUDDY_FACTORY as `0x${string}`;

export const payloadToHexDataUri = async (payload: any) => {
  let dataUri = `data:application/vnd.facet.tx+json;rule=esip6,${JSON.stringify(
    payload
  )}`;
  let response = toHex(dataUri);
  try {
    const compressedDataUri = await compressDataWithRatioCheck(dataUri);
    response = toHex(compressedDataUri);
  } finally {
    return response;
  }
};

export const waitForTransactionResult = async (pendingCallTxnHash: string) => {
  let loops = 0;
  while (true) {
    const result = await fetchTransaction(pendingCallTxnHash);
    if (result) {
      return result;
    }
    if (loops === 50) {
      throw "Timeout";
    }
    loops++;
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
};

export const sendFacetCall = async (
  to: string,
  func: string,
  args: any[] | { [key: string]: any }
) => {
  const { address, isDisconnected, chain } = getAccount(wagmiConfig);
  if (!address || isDisconnected) throw "Not connected";
  if (!chain || !isSupportedChain(chain.id)) throw "Wrong network";
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

export const sendFacetBuddyCall = async (
  to: string,
  func: string,
  args: any[] | { [key: string]: any },
  value: bigint
) => {
  const { address, isDisconnected, chain } = getAccount(wagmiConfig);
  if (!address || isDisconnected) throw "Not connected";
  if (!chain || !isSupportedChain(chain.id)) throw "Wrong network";
  if (!process.env.NEXT_PUBLIC_BRIDGED_ETHER_ADDRESS) throw "Unknown bridge";

  const buddy = await sendStaticCall(
    process.env.NEXT_PUBLIC_BRIDGED_ETHER_ADDRESS,
    "predictBuddyAddress",
    { forUser: address }
  );

  if (!Array.isArray(args)) {
    args = Object.values(args);
  }

  const payload: FacetCallPayload = {
    op: "call",
    data: {
      to: buddyFactoryAddress,
      function: "callBuddyForUser",
      args: {
        amountToSpend: value.toString(),
        addressToCall: to,
        calldata: JSON.stringify([func, ...(args as any[])]),
      },
    },
  };

  const { internal_transactions } = await simulateTransaction(address, payload);

  const transaction_receipt = internal_transactions.find(
    (txn) => txn.from === buddy && txn.to === to
  );

  if (!transaction_receipt) throw "Transaction failed";

  if (transaction_receipt.error?.message)
    throw transaction_receipt.error?.message;

  return sendFacetTransaction(address, payload);
};

export const sendFacetBridgeAndCall = async (
  to: string,
  func: string,
  args: any[] | { [key: string]: any },
  value: bigint
) => {
  const { address, isDisconnected, chain } = getAccount(wagmiConfig);
  if (!address || isDisconnected) throw "Not connected";
  if (!chain || !isSupportedChain(chain.id)) throw "Wrong network";
  if (!process.env.NEXT_PUBLIC_BRIDGED_ETHER_ADDRESS) throw "Unknown bridge";

  const buddy = await sendStaticCall(
    process.env.NEXT_PUBLIC_BRIDGED_ETHER_ADDRESS,
    "predictBuddyAddress",
    { forUser: address }
  );
  const trustedSmartContract = await storageGet(
    process.env.NEXT_PUBLIC_BRIDGED_ETHER_ADDRESS,
    "trustedSmartContract"
  );

  if (!Array.isArray(args)) {
    args = Object.values(args);
  }

  const payload: FacetCallPayload = {
    op: "call",
    data: {
      to: process.env.NEXT_PUBLIC_BRIDGED_ETHER_ADDRESS,
      function: "bridgeAndCall",
      args: {
        to: address,
        amount: value.toString(),
        addressToCall: to,
        base64Calldata: btoa(JSON.stringify([func, ...(args as any[])])),
      },
    },
  };

  const { internal_transactions } = await simulateTransaction(
    trustedSmartContract,
    payload
  );

  const transaction_receipt = internal_transactions.find(
    (txn) => txn.from === buddy && txn.to === to
  );

  if (!transaction_receipt) throw "Transaction failed";

  if (transaction_receipt.error?.message)
    throw transaction_receipt.error?.message;

  const publicClient = getPublicClient(wagmiConfig);

  const estimate = await publicClient.estimateContractGas({
    address: trustedSmartContract,
    abi: bridgeAbi,
    functionName: "bridgeAndCall",
    account: address,
    value,
    args: [
      address,
      to,
      JSON.stringify({
        function: func,
        args,
      }),
    ],
  });

  return writeContract(wagmiConfig, {
    address: trustedSmartContract,
    abi: bridgeAbi,
    functionName: "bridgeAndCall",
    account: address,
    value,
    args: [
      address,
      to,
      JSON.stringify({
        function: func,
        args,
      }),
    ],
    gas: estimate,
  });
};

export const sendFacetCreate = async (
  args: any[] | { [key: string]: any },
  initCodeHash: string,
  sourceCode?: string
) => {
  const { address, isDisconnected, chain } = getAccount(wagmiConfig);
  if (!address || isDisconnected) throw "Not connected";
  if (!chain || !isSupportedChain(chain.id)) throw "Wrong network";
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

  const data = await payloadToHexDataUri(payload);
  const estimate = await estimateGas(wagmiConfig, {
    to: facetAddress,
    data,
  });

  const txn = await sendTransaction(wagmiConfig, {
    to: facetAddress,
    data,
    gas: estimate,
  });

  return txn;
};

const bridgeAbi = [
  {
    inputs: [
      { internalType: "string", name: "recipient", type: "address" },
      { internalType: "string", name: "dumbContractToCall", type: "address" },
      { internalType: "string", name: "data", type: "string" },
    ],
    name: "bridgeAndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];
