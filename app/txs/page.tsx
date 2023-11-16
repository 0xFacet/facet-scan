import { Address } from "@/components/Address";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { Table } from "@/components/Table";
import { Pagination } from "@/components/pagination";
import { fetchTransactions } from "@/utils/data";
import { truncateMiddle, formatTimestamp } from "@/utils/formatter";
import { formatDistanceToNowStrict } from "date-fns";
import { capitalize } from "lodash";
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
          <div className="spacing-y-1 py-4">
            <Heading size="h2">Transactions</Heading>
            {!!searchParams.block && <div>Block #{searchParams.block}</div>}
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1">
        <Section className="flex-1">
          <div className="flex flex-col border border-line rounded-xl overflow-x-hidden divide-y divide-line px-4">
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
                    {truncateMiddle(transaction.transaction_hash, 6, 4)}
                  </Link>,
                  transaction.function ? (
                    <div
                      key={transaction.transaction_hash}
                      className="flex items-center gap-1 text-gray-400 border border-gray-700 bg-gray-950 rounded-md px-2 py-1 text-xs"
                    >
                      {capitalize(transaction.function)}
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
                  <Link
                    key={transaction.transaction_hash}
                    href={`/address/${transaction.from}`}
                  >
                    <Address
                      disableAddressLink={true}
                      noAvatar={true}
                      noCopy={true}
                      address={transaction.from}
                    />
                  </Link>,
                  !!transaction.to ? (
                    <Link
                      key={transaction.transaction_hash}
                      href={`/address/${transaction.to}`}
                    >
                      <Address
                        disableAddressLink={true}
                        noAvatar={true}
                        noCopy={true}
                        address={transaction.to}
                      />
                    </Link>
                  ) : (
                    "--"
                  ),
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
          </div>
          <Pagination count={count} />
        </Section>
      </SectionContainer>
    </div>
  );
}
