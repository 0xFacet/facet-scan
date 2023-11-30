"use client";

import { useEffect, useState } from "react";
import { useAccount, useBlockNumber } from "wagmi";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  sendFacetCall,
  waitForTransactionResult,
} from "@/utils/facet-transactions";
import { Transaction } from "@/types/blocks";
import { useToast } from "@/contexts/toast-context";
import { truncateMiddle } from "@/utils/formatter";

export default function AddressPageHeader({
  pageAddress,
}: {
  pageAddress: string;
}) {
  const [methodLoading, setMethodLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [simulationResults, setSimulationResults] = useState<{
    [key: string]: Transaction | null;
  }>({});
  const { address, isDisconnected } = useAccount();
  const { showToast } = useToast();

  const { data: latestBlockNumber } = useBlockNumber({ watch: true });

  const [userHasSunriseSticker, setUserHasSunriseSticker] = useState(false);
  const [userCanClaimSunriseSticker, setUserCanClaimSunriseSticker] =
    useState(false);
  const [userStickerDeadline, setUserStickerDeadline] = useState(0);
  const [userStickerSignature, setUserStickerSignature] = useState("");
  const [userSampleTokenId, setUserSampleTokenId] = useState(0);

  const isCurrentUsersPage =
    address && pageAddress!.toLowerCase() == address.toLowerCase();

  const claimCheckURL = `${process.env
    .NEXT_PUBLIC_FACET_SWAP_BASE_URL!}/stickers`;

  async function callMethodBasic(toAddress: string, name: string, args: any) {
    setMethodLoading((loading) => ({ ...loading, [name]: true }));
    setSimulationResults((results) => ({ ...results, [name]: null }));

    try {
      const txn = await sendFacetCall(toAddress, name, args);
      showToast({
        message: `Transaction pending (${truncateMiddle(txn.hash, 8, 8)})`,
        type: "info",
      });
      const receipt = await waitForTransactionResult(txn.hash);
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
            message: `Transaction failed (${truncateMiddle(
              receipt.transaction_hash,
              8,
              8
            )})`,
            type: "error",
          });
        }
      }
    } catch (e) {
      if (
        !`${e}`.includes("TransactionExecutionError: User rejected the request")
      ) {
        showToast({
          message: `${e}`,
          type: "error",
        });
      }
    }
    setMethodLoading((loading) => ({ ...loading, [name]: false }));
  }

  useEffect(() => {
    if (isDisconnected) {
      setUserCanClaimSunriseSticker(false);
    } else {
      const getSticker = async () => {
        try {
          const stickerRes = await axios.get(claimCheckURL, {
            params: {
              claimer: address,
            },
          });

          setUserStickerDeadline(stickerRes.data.message.deadline);
          setUserStickerSignature(stickerRes.data.signature);
          setUserSampleTokenId(stickerRes.data.sampleId);
          setUserCanClaimSunriseSticker(true);
        } catch (e) {
          console.log(e);
          setUserCanClaimSunriseSticker(false);
        }
      };
      getSticker();
    }
  }, [address, latestBlockNumber, isDisconnected]);

  useEffect(() => {
    if (isDisconnected) {
      setUserHasSunriseSticker(false);
    } else {
      const getSticker = async () => {
        const stickerRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts/${process.env.NEXT_PUBLIC_CARDS_CONTRACT_ADDRESS}/static-call/userToStickerIdsAwardedMap`,
          {
            params: {
              args: JSON.stringify([pageAddress, 1]),
            },
          }
        );

        setUserHasSunriseSticker(stickerRes.data.result);
      };
      getSticker();
    }
  }, [address, latestBlockNumber, isDisconnected]);

  const stickerParams = {
    stickerId: 1,
    deadline: userStickerDeadline,
    signature: userStickerSignature,
    tokenId: userSampleTokenId,
    position: [10, 10],
  };

  return (
    <div>
      {userHasSunriseSticker && (
        <div>This address has claimed their Sunrise Sticker!</div>
      )}

      {!userHasSunriseSticker &&
        userCanClaimSunriseSticker &&
        isCurrentUsersPage && (
          <div>
            <div>{"You don't have the sticker but you can claim it now!"}</div>
            <Button
              disabled={
                methodLoading.claimSticker || !userStickerSignature?.length
              }
              onClick={() =>
                callMethodBasic(
                  process.env.NEXT_PUBLIC_CARDS_CONTRACT_ADDRESS!,
                  "claimSticker",
                  stickerParams
                )
              }
            >
              Claim now!
            </Button>
          </div>
        )}

      {!userHasSunriseSticker &&
        !userCanClaimSunriseSticker &&
        isCurrentUsersPage && (
          <div>
            {
              "You don't have the Sunrise Sticker and unfortunately you can't claim it."
            }
          </div>
        )}
    </div>
  );
}
