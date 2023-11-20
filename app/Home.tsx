"use client";

import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Block, Transaction } from "@/types/blocks";
import { truncateMiddle } from "@/utils/formatter";
import { formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BiSearch } from "react-icons/bi";
import { isAddress } from "viem";

function pluralize(count: number, word: string) {
  return `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;
}

function isCardNameWithAt(name: string) {
  const regex = /^@[a-zA-Z0-9]{1,31}$/;
  return regex.test(name);
}

function isCardName(name: string) {
  const regex = /^[a-zA-Z0-9]{1,31}$/;
  return regex.test(name);
}

function isTxHash(hash: string) {
  const regex = /^0x[a-fA-F0-9]{64}$/;
  return regex.test(hash);
}

interface Props {
  totalBlocks: number;
  blocks: Block[];
  totalTransactions: number;
  transactions: Transaction[];
  totalWallets: number;
}

export default function Home({
  totalBlocks,
  blocks,
  totalTransactions,
  transactions,
  totalWallets,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const submitSearch = () => {
    if (isCardNameWithAt(search)) {
      router.push(`/card/${search.replace("@", "").toLowerCase()}`);
    } else if (isAddress(search)) {
      router.push(`/address/${search}`);
    } else if (isTxHash(search)) {
      router.push(`/tx/${search}`);
    } else if (Number.isInteger(Number(search))) {
      router.push(`/block/${search}`);
    } else if (isCardName(search)) {
      router.push(`/card/${search.toLowerCase()}`);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <SectionContainer className="bg-[url(/card-bg.svg)] bg-no-repeat bg-cover xl:bg-[length:1536px] bg-center border-none">
        <Section className="flex-1 py-32 sm:py-40 gap-8 max-w-3xl mx-auto">
          <Heading size="h2">Facet Block Explorer</Heading>
          <div className="flex flex-wrap bg-transparent">
            <div className="flex-1 min-w-[150px]">
              <input
                className="w-full bg-black/20 text-md sm:text-lg md:text-2xl outline-none px-6 py-4 sm:px-12 sm:py-8 border-2 border-primary rounded-l-2xl sm:rounded-l-3xl rounded-r-none"
                placeholder="Search by card, address, transaction, or block"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
            </div>
            <button
              type="submit"
              className="disabled:opacity-50 opacity-90 hover:opacity-100 p-4 sm:p-8 text-md sm:text-lg md:text-2xl bg-primary text-black border-primary rounded-r-2xl sm:rounded-r-2xl rounded-l-none"
              onClick={submitSearch}
            >
              <BiSearch />
            </button>
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer className="border-t">
        <Section className="flex-1 py-8 gap-8 max-w-3xl mx-auto">
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
        <Section className="flex-1 justify-center gap-8">
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="flex flex-col flex-1 border border-line rounded-xl overflow-x-hidden">
              <div className="p-4 border-b border-line text-accent">
                Latest Blocks
              </div>
              <div className="px-4">
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex-1 flex flex-row gap justify-between border-b border-line py-4"
                  >
                    <div>
                      <Link href={`/block/${block.block_number}`}>
                        <div className="font-bold">
                          Block #{block.block_number}
                        </div>
                      </Link>
                      <div className="text-gray text-sm mt-1">
                        {`${formatDistanceToNowStrict(
                          new Date(Number(block.timestamp) * 1000)
                        )} ago`}
                      </div>
                    </div>
                    <div>
                      <Link href={`/txs?block=${block.block_number}`}>
                        {pluralize(block.transaction_count ?? 0, "transaction")}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/blocks")}
                >
                  View all blocks
                </Button>
              </div>
            </div>
            <div className="flex flex-col flex-1 border border-line rounded-xl overflow-x-hidden">
              <div className="p-4 border-b border-line text-accent">
                Latest Transactions
              </div>
              <div className="px-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.transaction_hash}
                    className="flex-1 flex flex-row gap-8 justify-between border-b border-line py-4"
                  >
                    <div className="flex flex-col flex-1">
                      <Link href={`/tx/${transaction.transaction_hash}`}>
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
                    <div className="flex flex-col">
                      <div className="flex gap-4 justify-between">
                        <span className="text-accent">{"From "}</span>
                        <Link href={`/address/${transaction.from}`}>
                          {truncateMiddle(transaction.from, 8, 8)}
                        </Link>
                      </div>
                      {!!transaction.to && (
                        <div className="flex gap-4 justify-between">
                          <span className="text-accent">{"To "}</span>
                          <Link href={`/address/${transaction.to}`}>
                            {truncateMiddle(transaction.to, 8, 8)}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4">
                <Button variant="outline" onClick={() => router.push("/txs")}>
                  View all transactions
                </Button>
              </div>
            </div>
          </div>
        </Section>
      </SectionContainer>
    </div>
  );
}
