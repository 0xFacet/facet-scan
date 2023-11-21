import { Address } from "@/components/Address";
import { Card } from "@/components/Card";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { Table } from "@/components/Table";
import { Pagination } from "@/components/pagination";
import { fetchTransactions } from "@/utils/data";
import { truncateMiddle, formatTimestamp } from "@/utils/formatter";
import { startCase } from "lodash";
import Link from "next/link";
import { IoAlertCircleOutline } from "react-icons/io5";
import { formatEther } from "viem";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const { transactions, count } = await fetchTransactions({
    page: searchParams.page ? searchParams.page : 1,
    block: searchParams.block,
  });

  return (
    <div className="flex flex-col flex-1">
      <SectionContainer>
        <Section>
          <div className="py-4">
            <Heading size="h2">Transactions</Heading>
            {!!searchParams.block && (
              <div className="text-accent mt-1">
                Block #{searchParams.block}
              </div>
            )}
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1">
        <Section className="flex-1">
          <Card>
            <Table
              headers={[
                "Transaction Hash",
                "Method",
                "Block",
                "Age",
                "From",
                "To",
                "Txn Fee",
              ]}
              rows={[
                ...transactions.map((transaction) => [
                  <Link
                    key={transaction.transaction_hash}
                    href={`/tx/${transaction.transaction_hash}`}
                    className="flex items-center gap-1"
                  >
                    {transaction.status === "failure" && (
                      <IoAlertCircleOutline className="text-xl text-red-500" />
                    )}
                    {truncateMiddle(transaction.transaction_hash, 8, 8)}
                  </Link>,
                  transaction.function ? (
                    <div
                      key={transaction.transaction_hash}
                      className="flex items-center gap-1 text-gray-400 border border-gray-700 bg-gray-950 rounded-md px-2 py-1 text-xs"
                    >
                      {startCase(transaction.function)}
                    </div>
                  ) : (
                    "--"
                  ),
                  <Link
                    key={transaction.transaction_hash}
                    href={`/block/${transaction.block_number}`}
                  >
                    {transaction.block_number}
                  </Link>,
                  transaction.block_timestamp
                    ? formatTimestamp(
                        new Date(Number(transaction.block_timestamp) * 1000)
                      )
                    : "--",
                  <Address
                    key={transaction.transaction_hash}
                    address={transaction.from}
                  />,
                  <Address
                    key={transaction.transaction_hash}
                    address={transaction.effective_contract_address}
                  />,
                  transaction.transaction_fee
                    ? Number(
                        Number(
                          formatEther(
                            BigInt(transaction.transaction_fee.split(".")[0])
                          )
                        ).toFixed(5)
                      )
                    : 0,
                ]),
              ]}
            />
            {!transactions.length && (
              <div className="py-4">No transactions</div>
            )}
          </Card>
          <Pagination count={count} />
        </Section>
      </SectionContainer>
    </div>
  );
}
