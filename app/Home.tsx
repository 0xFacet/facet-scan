"use client";

import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Block, Transaction } from "@/types/blocks";
import { formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BiSearch } from "react-icons/bi";
import { isAddress } from "viem";

function pluralize(count: number, word: string) {
  return `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;
}

function isCardName(name: string) {
  const regex = /^@[a-zA-Z0-9]{1,31}$/;
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
}

export default function Home({
  totalBlocks,
  blocks,
  totalTransactions,
  transactions,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const submitSearch = () => {
    if (isCardName(search)) {
      router.push(`/card/${search}`);
    } else if (isAddress(search)) {
      router.push(`/address/${search}`);
    } else if (isTxHash(search)) {
      router.push(`/tx/${search}`);
    } else if (Number.isInteger(Number(search))) {
      router.push(`/block/${search}`);
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
                className="w-full text-md sm:text-lg md:text-2xl bg-transparent outline-none px-6 py-4 sm:px-12 sm:py-8 border-2 border-primary rounded-l-2xl sm:rounded-l-3xl"
                placeholder="Search by card, address, transaction, or block"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
            </div>
            <button
              type="submit"
              className="disabled:opacity-50 opacity-90 hover:opacity-100 p-4 sm:p-8 text-md sm:text-lg md:text-2xl bg-primary text-black border-primary rounded-r-2xl sm:rounded-r-2xl"
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
            <div className="flex flex-col flex-1 items-center justify-center text-center gap-1 p-8 border-r-0 sm:border-r border-line">
              <Heading size="h3">{totalBlocks.toLocaleString()}</Heading>
              <div className="opacity-50">Total Blocks</div>
            </div>
            <div className="flex flex-col flex-1 items-center justify-center text-center gap-1 p-8 border-r-0 sm:border-r border-line">
              <Heading size="h3">{totalTransactions.toLocaleString()}</Heading>
              <div className="opacity-50">Total Transactions</div>
            </div>
            <div className="flex flex-col flex-1 items-center justify-center text-center gap-1 p-8">
              <Heading size="h3">{(84038).toLocaleString()}</Heading>
              <div className="opacity-50">Total Wallets</div>
            </div>
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1">
        <Section className="flex-1 justify-center gap-8">
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="flex flex-col flex-1 gap-8">
              <Heading size="h5">Latest Blocks</Heading>
              <div className="border-t border-line">
                {blocks.map((block) => (
                  <Link key={block.id} href={`/block/${block.block_number}`}>
                    <div className="flex flex-row gap justify-between border-b border-line py-4 hover:text-primary">
                      <div>
                        <div className="font-bold">
                          Block #{block.block_number.toLocaleString()}
                        </div>
                        <div className="opacity-50">
                          {`${formatDistanceToNowStrict(
                            new Date(block.timestamp * 1000)
                          )} ago`}
                        </div>
                      </div>
                      <div>
                        {pluralize(block.transaction_count ?? 0, "transaction")}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Button variant="outline" onClick={() => router.push("/blocks")}>
                View all blocks
              </Button>
            </div>
            <div className="flex flex-col flex-1 gap-8">
              <Heading size="h5">Latest Transactions</Heading>
              <div className="border-t border-line">
                {transactions.map((transaction) => (
                  <Link
                    key={transaction.transaction_hash}
                    href={`/tx/${transaction.transaction_hash}`}
                  >
                    <div className="flex flex-row gap justify-between border-b border-line py-4 hover:text-primary">
                      <div>
                        <div className="font-bold">
                          {transaction.transaction_hash}
                        </div>
                        <div className="opacity-50">
                          {`${formatDistanceToNowStrict(
                            new Date(transaction.timestamp)
                          )} ago`}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Button variant="outline" onClick={() => router.push("/txs")}>
                View all transactions
              </Button>
            </div>
          </div>
        </Section>
      </SectionContainer>
    </div>
  );
}
