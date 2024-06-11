"use client";

import { Address } from "@/components/address";
import {
  isBlockNumber,
  isCardName,
  isCardNameWithAt,
  isTxHash,
  pluralize,
} from "@/lib/utils";
import { Block, Transaction } from "@/types/blocks";
import { truncateMiddle } from "@/utils/formatter";
import {
  SectionContainer,
  Section,
  Heading,
  Card,
  Button,
} from "@0xfacet/component-library";
import { formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { IoAlertCircleOutline } from "react-icons/io5";
import { isAddress } from "viem";

interface Props {
  totalBlocks: number;
  blocks: Block[];
  totalTransactions: number;
  transactions: Transaction[];
  totalWallets: number;
  addressToName: {
    [key: `0x${string}`]: string;
  };
}

export default function Home({
  totalBlocks,
  blocks,
  totalTransactions,
  transactions,
  totalWallets,
  addressToName,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const submitSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCardNameWithAt(search)) {
      router.push(`/address/${search.replace("@", "").toLowerCase()}`);
    } else if (isAddress(search)) {
      router.push(`/address/${search}`);
    } else if (isTxHash(search)) {
      router.push(`/tx/${search}`);
    } else if (isBlockNumber(search)) {
      router.push(`/block/${search}`);
    } else if (isCardName(search)) {
      router.push(`/address/${search.toLowerCase()}`);
    }
  };

  return (
    <div className="flex flex-1 flex-col divide-y divide-line">
      <SectionContainer className="bg-[url(/halftone_1.svg)] bg-black bg-no-repeat bg-[length:1536px] xl:bg-cover bg-center border-none">
        <Section className="flex-1 py-32 sm:py-40 gap-8 mx-auto">
          <Heading size="h2">Facet Block Explorer</Heading>
          <form
            className="flex flex-wrap bg-transparent"
            onSubmit={submitSearch}
          >
            <div className="flex-1 min-w-[150px]">
              <input
                className="w-full bg-black text-md sm:text-lg md:text-2xl outline-none px-6 py-4 sm:px-10 sm:py-8 border-4 border-primary rounded-l-xl sm:rounded-l-3xl rounded-r-none"
                placeholder="Search by card, address, transaction, or block"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
            </div>
            <button
              type="submit"
              className="p-4 sm:p-8 text-md sm:text-lg md:text-2xl bg-primary rounded-r-xl sm:rounded-r-3xl rounded-l-none"
            >
              <BiSearch />
            </button>
          </form>
        </Section>
      </SectionContainer>
      <SectionContainer>
        <Section className="flex-1 py-8 gap-8 mx-auto">
          <div className="flex flex-1 flex-col sm:flex-row flex-wrap">
            <div className="flex flex-col flex-1 items-center justify-center text-center gap-2 p-8">
              <Heading size="h2">
                {Number(totalBlocks).toLocaleString()}
              </Heading>
              <div className="text-accent">Total Blocks</div>
            </div>
            <div className="flex flex-col flex-1 items-center justify-center text-center gap-2 p-8">
              <Heading size="h2">{totalTransactions.toLocaleString()}</Heading>
              <div className="text-accent">Total Transactions</div>
            </div>
            <div className="flex flex-col flex-1 items-center justify-center text-center gap-2 p-8">
              <Heading size="h2">{totalWallets.toLocaleString()}</Heading>
              <div className="text-accent">Total Wallets</div>
            </div>
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1">
        <Section className="flex-1 flex-col sm:flex-row gap-4 sm:gap-8">
          <Card childrenClassName="px-4">
            <div className="py-4 text-accent">Latest Blocks</div>
            {blocks.map((block) => (
              <div
                key={block.id}
                className="flex-1 flex flex-row gap-8 justify-between py-4"
              >
                <div>
                  <Link href={`/block/${block.block_number}`}>
                    <div className="font-bold whitespace-nowrap">
                      Block #{block.block_number}
                    </div>
                  </Link>
                  <div className="text-gray text-sm mt-1">
                    {`${formatDistanceToNowStrict(
                      new Date(Number(block.timestamp) * 1000)
                    )} ago`}
                  </div>
                </div>
                <div className="whitespace-nowrap">
                  <Link href={`/txs?block=${block.block_number}`}>
                    {pluralize(block.transaction_count ?? 0, "transaction")}
                  </Link>
                </div>
              </div>
            ))}
            <div className="py-4">
              <Button variant="outline" onClick={() => router.push("/blocks")}>
                View all blocks
              </Button>
            </div>
          </Card>
          <Card childrenClassName="px-4">
            <div className="py-4 text-accent">Latest Transactions</div>
            {transactions.map((transaction) => (
              <div
                key={transaction.transaction_hash}
                className="flex-1 flex flex-row gap-8 justify-between py-4"
              >
                <div>
                  <Link
                    key={transaction.transaction_hash}
                    href={`/tx/${transaction.transaction_hash}`}
                    className="flex items-center gap-1"
                  >
                    {transaction.status === "failure" && (
                      <IoAlertCircleOutline className="text-xl text-red-500" />
                    )}

                    <div className="font-bold truncate">
                      {truncateMiddle(transaction.transaction_hash, 8, 8)}
                    </div>
                  </Link>
                  <div className="text-gray text-sm mt-1">
                    {`${formatDistanceToNowStrict(
                      new Date(Number(transaction.block_timestamp) * 1000)
                    )} ago`}
                  </div>
                </div>
                <div>
                  <div className="flex gap-4 justify-between">
                    <span className="text-accent">{"From "}</span>
                    <Address
                      address={transaction.from}
                      name={addressToName[transaction.from]}
                    />
                  </div>
                  <div className="flex gap-4 justify-between">
                    <span className="text-accent mr-6">{"To "}</span>
                    <Address
                      address={transaction.to_or_contract_address}
                      name={
                        transaction.to_or_contract_address
                          ? addressToName[transaction.to_or_contract_address]
                          : null
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="py-4">
              <Button variant="outline" onClick={() => router.push("/txs")}>
                View all transactions
              </Button>
            </div>
          </Card>
        </Section>
      </SectionContainer>
    </div>
  );
}
