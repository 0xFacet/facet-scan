"use client";

import Link from "next/link";
import { CustomConnectButton } from "./connect-button";
import {
  Button,
  NavLink,
  Section,
  SectionContainer,
} from "@0xfacet/component-library";
import Image from "next/image";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@0xfacet/component-library/ui";
import { useEffect, useMemo, useState } from "react";
import { storageGet } from "@/utils/facet/contracts";
import { useAccount, useBalance, useBlockNumber } from "wagmi";
import { formatEther } from "@/utils/formatter";
import { IoWalletOutline } from "react-icons/io5";
import { useWalletModal } from "@/contexts/wallet-modal-context";

const fethAddress = process.env.NEXT_PUBLIC_BRIDGED_ETHER_ADDRESS;

export const Header = () => {
  const { address } = useAccount();
  const { setShowWalletModal } = useWalletModal();
  const [fethBalance, setFethBalance] = useState(BigInt(0));
  const { data } = useBalance({
    address,
    query: { enabled: true, refetchInterval: 30000 },
  });
  const block = useBlockNumber({ watch: true });
  const ethBalance = useMemo(() => data?.value || BigInt(0), [data?.value]);

  useEffect(() => {
    (async () => {
      let newFethBalance = BigInt(0);
      if (address && fethAddress) {
        const fethBalanceRes = await storageGet<string>(
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
  }, [address, block.data]);

  return (
    <SectionContainer className="border-b border-line">
      <Section className="py-0 sm:py-0">
        <div className="flex justify-between items-center">
          <Link href="/">
            <Image
              src="/facet-scan-lockup.svg"
              alt="Facet Scan"
              width={150}
              height={30}
              priority
            />
          </Link>
          <div className="flex gap-2 sm:gap-4 items-center h-16">
            <div className="gap-4 h-min-full hidden lg:flex">
              <NavLink href="/blocks">Blocks</NavLink>
              <NavLink href="/txs" parent>
                Transactions
              </NavLink>
              <NavLink href="/contracts" parent>
                Contracts
              </NavLink>
            </div>
            {!!address && (
              <>
                <div
                  className="bg-line hover:bg-line/20 transition-colors duration-300 py-2 px-4 text-sm rounded-md cursor-pointer flex-row gap-3 hidden sm:flex"
                  onClick={() => setShowWalletModal(true)}
                >
                  <span>{formatEther(ethBalance)} ETH</span>
                  <span className="text-accent">|</span>
                  <span>{formatEther(fethBalance)} FETH</span>
                </div>
                <Button
                  className="sm:hidden"
                  size="icon"
                  variant="outline"
                  onClick={() => setShowWalletModal(true)}
                >
                  <IoWalletOutline className="h-6 w-6" />
                  <span className="sr-only">View wallet</span>
                </Button>
              </>
            )}
            <CustomConnectButton />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="lg:hidden" size="icon" variant="outline">
                  <HamburgerMenuIcon className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black mt-2">
                <Link href="/blocks">
                  <DropdownMenuItem>Blocks</DropdownMenuItem>
                </Link>
                <Link href="/txs">
                  <DropdownMenuItem>Transactions</DropdownMenuItem>
                </Link>
                <Link href="/contracts">
                  <DropdownMenuItem>Contracts</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Section>
    </SectionContainer>
  );
};
