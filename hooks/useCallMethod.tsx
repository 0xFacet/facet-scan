import { useEffect, useState } from "react";
import { useToast } from "@/contexts/toast-context";
import {
  sendFacetBridgeAndCall,
  sendFacetBuddyCall,
  sendFacetCall,
  waitForTransactionResult,
} from "@/utils/facet/helpers";
import { cleanErrorMessage, truncateMiddle } from "@/utils/formatter";
import { fetchInternalTransactions } from "@/utils/facet/transactions";
import { sendStaticCall, storageGet } from "@/utils/facet/contracts";
import { InternalTransaction, Transaction } from "@/types/blocks";
import { useAccount, useBlockNumber } from "wagmi";
import { get } from "@/utils/api-client";

type SimulationResult = { [key: string]: any };
const fethContract = process.env
  .NEXT_PUBLIC_BRIDGED_ETHER_ADDRESS as `0x${string}`;

export const useCallMethod = () => {
  const { address } = useAccount();
  const [simulationResults, setSimulationResults] = useState<SimulationResult>(
    {}
  );
  const [_isMethodLoading, setIsMethodLoading] = useState<{
    [key: `0x${string}`]: { [key: string]: boolean };
  }>({});
  const { showToast } = useToast();
  const { data: latestBlockNumber } = useBlockNumber({ watch: true });
  const [blocksBehind, setBlocksBehind] = useState(0);

  useEffect(() => {
    (async () => {
      const indexerStatusRes = await get<{ blocks_behind: string }>(
        `${process.env.NEXT_PUBLIC_API_BASE_URI}/status`
      );
      setBlocksBehind(Number(indexerStatusRes.blocks_behind));
    })();
  }, [latestBlockNumber]);

  async function callMethod(
    toAddress: string,
    name: string,
    args: any,
    value?: bigint
  ) {
    setIsMethodLoading((loading) => ({ ...loading, [name]: true }));
    setSimulationResults((results) => ({ ...results, [name]: null }));

    let receipt: Transaction | InternalTransaction | null = null;

    try {
      if (blocksBehind > 5) {
        throw "The Facet Swap interface is temporarily paused due to high transaction volume. Thank you for your patience.";
      }

      let txHash: `0x${string}`;
      if (value) {
        const balance = await storageGet(fethContract, "balanceOf", [address]);
        if (value > BigInt(balance ?? 0)) {
          txHash = await sendFacetBridgeAndCall(toAddress, name, args, value);
        } else {
          txHash = await sendFacetBuddyCall(toAddress, name, args, value);
        }
      } else {
        txHash = await sendFacetCall(toAddress, name, args);
      }

      showToast({
        message: `Transaction pending (${truncateMiddle(txHash, 8, 8)})`,
        type: "info",
      });
      receipt = await waitForTransactionResult(txHash);
      if (value) {
        const buddy = await sendStaticCall(
          fethContract,
          "predictBuddyAddress",
          { forUser: address }
        );
        const { transactions: internalTransactions } =
          await fetchInternalTransactions({
            txHash,
          });
        const internalTransaction = internalTransactions.find(
          (txn) => txn.from === buddy && txn.to === toAddress
        );
        if (internalTransaction) {
          receipt = internalTransaction;
        }
      }
      if (receipt) {
        if (receipt.status === "success") {
          showToast({
            message: `Transaction succeeded (${truncateMiddle(
              receipt.transaction_hash,
              8,
              8
            )})`,
            type: "success",
          });
        } else {
          showToast({
            message: `${
              receipt.error ? receipt.error.message : "Transaction failed"
            } (${truncateMiddle(receipt.transaction_hash, 8, 8)})`,
            type: "error",
          });
        }
      }
    } catch (e) {
      if (!`${e}`.includes("User rejected the request")) {
        showToast({
          message: cleanErrorMessage(`${e}`),
          type: "error",
        });
      }
    }
    setIsMethodLoading((loading) => ({ ...loading, [name]: false }));
    return receipt;
  }

  const isMethodLoading = (to: `0x${string}`, methodName: string) =>
    !!_isMethodLoading[to]?.[methodName];

  return {
    callMethod,
    isMethodLoading,
    simulationResults,
  };
};
