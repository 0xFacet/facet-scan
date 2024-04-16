"use client";

import {
  Heading,
  Modal,
  SegmentedControl,
  Button,
} from "@0xfacet/component-library";
import { Input } from "@0xfacet/component-library/ui";
import { sendStaticCall } from "@/utils/facet/contracts";
import { formatEther } from "@/utils/formatter";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { getAddress, parseEther } from "viem";
import { useAccount, useBalance, useBlockNumber } from "wagmi";
import { sendTransaction, writeContract } from "@wagmi/core";
import { waitForTransactionResult } from "@/utils/facet/helpers";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/toast-context";
import { useCallMethod } from "@/hooks/useCallMethod";
import { get } from "@/utils/api-client";
import { etherBridgeAbi } from "@/constants/abi";
import { targetNetwork, wagmiConfig } from "../app/providers";
import Link from "next/link";

const fethAddress = process.env.NEXT_PUBLIC_BRIDGED_ETHER_ADDRESS;
const bridgeAPIBaseURL = process.env.NEXT_PUBLIC_BRIDGE_API_BASE_URL;

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

export const WalletModal = ({ open, onClose }: WalletModalProps) => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("Wrap");
  const { address } = useAccount();
  const [fethBalance, setFethBalance] = useState(BigInt(0));
  const { data } = useBalance({
    address,
    query: { enabled: true, refetchInterval: 30000 },
  });
  const block = useBlockNumber({ watch: open });
  const ethBalance = useMemo(() => data?.value || BigInt(0), [data?.value]);
  const [pendingWithdrawalBalance, setPendingWithdrawalBalance] = useState(
    BigInt(0)
  );
  const [pendingWithdrawalId, setPendingWithdrawalId] = useState<string | null>(
    null
  );
  const [wrapAmountInput, setWrapAmountInput] = useState("");
  const wrapAmount = useMemo(() => {
    try {
      return parseEther(wrapAmountInput || "0");
    } catch (e) {
      return BigInt(0);
    }
  }, [wrapAmountInput]);
  const { showToast } = useToast();
  const { callMethod } = useCallMethod();

  const getPendingWithdrawals = useCallback(async () => {
    if (address && fethAddress && open) {
      const userWithdrawalId = await sendStaticCall(
        fethAddress,
        "userWithdrawalId",
        [address]
      );
      setPendingWithdrawalId(userWithdrawalId);
      const withdrawalIdAmount = await sendStaticCall(
        fethAddress,
        "withdrawalIdAmount",
        [userWithdrawalId]
      );
      setPendingWithdrawalBalance(BigInt(withdrawalIdAmount));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, block.data, open]);

  useEffect(() => {
    getPendingWithdrawals();
  }, [getPendingWithdrawals]);

  useEffect(() => {
    (async () => {
      let newFethBalance = BigInt(0);
      if (address && fethAddress && open) {
        const fethBalanceRes = await sendStaticCall<string>(
          fethAddress,
          "balanceOf",
          [address]
        );
        if (fethBalanceRes) {
          newFethBalance = BigInt(fethBalanceRes ?? 0);
        }
      }
      setFethBalance(newFethBalance);
    })();
  }, [address, block.data, open]);

  const handleWrapping = async () => {
    try {
      if (fethAddress) {
        const trustedSmartContract = await sendStaticCall(
          fethAddress,
          "trustedSmartContract"
        );
        const txHash = await sendTransaction(wagmiConfig, {
          value: wrapAmount,
          to: trustedSmartContract,
        });
        await waitForTransactionResult(txHash);
        router.refresh();
      }
    } catch (e: any) {
      const message = e.response?.data?.message ?? e.message ?? e;
      if (!`${e}`.includes("User rejected the request")) {
        showToast({
          message: `${message}`,
          type: "error",
        });
      }
    }
  };

  const handleUnwrapping = async () => {
    try {
      if (wrapAmount > 0 && wrapAmount <= maxWrapAmount && fethAddress) {
        const txn = await callMethod(fethAddress, "bridgeOut", {
          amount: wrapAmount.toString(),
        });
        if (txn) {
          setPendingWithdrawalBalance(wrapAmount);
          setPendingWithdrawalId(txn.transaction_hash);
        }
      }
    } catch (e: any) {
      const message = e.response?.data?.message ?? e.message ?? e;
      if (!`${e}`.includes("User rejected the request")) {
        showToast({
          message: `${message}`,
          type: "error",
        });
      }
    }
    router.refresh();
  };

  const handleFinalizeUnwrap = async () => {
    try {
      if (!address) throw "Not connected";
      if (bridgeAPIBaseURL && fethAddress && pendingWithdrawalId) {
        const sigRes = await get(
          `${bridgeAPIBaseURL}/withdrawals/confirm/${pendingWithdrawalId}`
        );
        const { signature, message } = sigRes;
        const withdrawReq = {
          recipient: getAddress(message.recipient),
          withdrawalId: message.withdrawalId,
          blockHash: message.blockHash,
          blockNumber: message.blockNumber,
          amount: message.amount,
          signature,
        };
        const trustedSmartContract = await sendStaticCall(
          fethAddress,
          "trustedSmartContract"
        );
        const txHash = await writeContract(wagmiConfig, {
          abi: etherBridgeAbi,
          address: getAddress(trustedSmartContract),
          chainId: targetNetwork.id,
          functionName: "withdraw",
          args: [withdrawReq],
        });
        await waitForTransactionResult(txHash);
        setPendingWithdrawalBalance(BigInt(0));
      }
    } catch (e: any) {
      const message = e.response?.data?.message ?? e.message ?? e;
      if (!`${e}`.includes("User rejected the request")) {
        showToast({
          message: `${message}`,
          type: "error",
        });
      }
    }
  };

  const maxWrapAmount = selectedTab === "Wrap" ? ethBalance : fethBalance;
  const hasPendingWithdraw =
    selectedTab === "Unwrap" && pendingWithdrawalBalance > 0;

  return (
    <Modal
      title="Wallet"
      open={open}
      onOpenChange={onClose}
      onCancel={onClose}
      className="max-w-lg"
      confirmText={selectedTab}
      onConfirm={() =>
        selectedTab === "Wrap" ? handleWrapping() : handleUnwrapping()
      }
      disabled={wrapAmount > maxWrapAmount || hasPendingWithdraw}
    >
      <div className="flex flex-col gap-4 text-white">
        <div className="flex p-4 flex-col gap-4 bg-line rounded-xl">
          <div className="flex p-4 flex-row items-center gap-3 ">
            <div className="flex-1 text-center">
              <Heading size="h3">{formatEther(ethBalance)} ETH</Heading>
              Balance
            </div>
            <div
              className="text-xl bg-black p-2 rounded-full cursor-pointer"
              onClick={() =>
                setSelectedTab(selectedTab === "Wrap" ? "Unwrap" : "Wrap")
              }
            >
              <HiOutlineArrowRight
                className={`transition-all duration-300 ${
                  selectedTab === "Wrap" ? "rotate-0" : "rotate-180"
                }`}
              />
            </div>
            <div className="flex-1 text-center">
              <Heading size="h3">{formatEther(fethBalance)} FETH</Heading>
              Balance
            </div>
          </div>
          <SegmentedControl
            options={["Wrap", "Unwrap"]}
            value={selectedTab}
            onChange={setSelectedTab}
          />
          {hasPendingWithdraw ? (
            <Button onClick={() => handleFinalizeUnwrap()}>
              Finalize ({formatEther(pendingWithdrawalBalance, false)} ETH)
            </Button>
          ) : (
            <div className="flex flex-row w-full border-line border rounded-lg items-center h-12 pr-2 gap-2">
              <Input
                placeholder="Amount"
                className="flex-1 h-12 border-0"
                value={wrapAmountInput}
                onChange={(e) => setWrapAmountInput(e.target.value)}
              />
              <div>{selectedTab === "Wrap" ? "ETH" : "FETH"}</div>
              <Button
                size="sm"
                variant="secondary"
                disabled={maxWrapAmount === BigInt(0)}
                onClick={() =>
                  setWrapAmountInput(formatEther(maxWrapAmount, false))
                }
              >
                MAX
              </Button>
            </div>
          )}
        </div>
        <div className="text-accent text-sm">
          {selectedTab === "Unwrap" && "Unwrapping requires two transactions. "}
          {"By accessing this website, you accept our "}
          <Link href="https://facet.org/terms.html" target="_blank">
            terms of service.
          </Link>
        </div>
      </div>
    </Modal>
  );
};
