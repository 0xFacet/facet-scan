"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { targetNetwork } from "@/app/providers";
import { BlockieAvatar, Button } from "@0xfacet/component-library";
import { IoWalletOutline } from "react-icons/io5";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@0xfacet/component-library/ui";
import Link from "next/link";
import {
  lookupPrimaryName,
  lookupName,
  getCardDetails,
} from "@/utils/facet/cards";
import { useEffect, useState } from "react";

interface FacetCardDetails {
  bio: string;
  displayName: string;
  imageURI: string;
  links: string[];
}

export const CustomConnectButton = () => {
  const { address } = useAccount();
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const [cardDetails, setCardDetails] = useState<FacetCardDetails | null>(null);

  useEffect(() => {
    (async () => {
      let newCardDetails: FacetCardDetails | null = null;
      if (address) {
        const { primaryName } = await lookupPrimaryName(address);
        if (primaryName) {
          const card = await lookupName(primaryName);
          if (card.id) {
            const cardDetailsRes = await getCardDetails(card.id);
            newCardDetails = cardDetailsRes;
          }
        }
      }
      setCardDetails(newCardDetails);
    })();
  }, [address]);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={openConnectModal}
                  >
                    <IoWalletOutline className="h-6 w-6" />
                    <span className="sr-only">Connect wallet</span>
                  </Button>
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return (
                  <Button
                    onClick={() => switchChain?.({ chainId: targetNetwork.id })}
                    variant="outline"
                  >
                    Switch to {targetNetwork.name}
                  </Button>
                );
              }

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex justify-end items-center text-white">
                      <div className="flex justify-center items-center border-1 rounded-md">
                        <div className="cursor-pointer">
                          <BlockieAvatar
                            address={account.address}
                            size={36}
                            profileImage={cardDetails?.imageURI}
                          />
                        </div>
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black mt-2">
                    <Link
                      href={`https://facetscan.com/address/${account.address}`}
                      target="_blank"
                    >
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                    </Link>
                    <Link href="#" onClick={() => disconnect()}>
                      <DropdownMenuItem
                        onClick={() =>
                          switchChain?.({ chainId: targetNetwork.id })
                        }
                      >
                        Disconnect
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
