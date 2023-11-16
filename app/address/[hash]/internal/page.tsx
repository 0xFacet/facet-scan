import { fetchInternalTransactions } from "@/utils/data";
import Link from "next/link";
import { Address } from "@/components/Address";
import { formatEther } from "viem";
import { Pagination } from "@/components/pagination";
import { Table } from "@/components/Table";
import { truncateMiddle, formatTimestamp } from "@/utils/formatter";
import { capitalize } from "lodash";
import { IoAlertCircleOutline } from "react-icons/io5";

export default async function Page({
  params,
  searchParams,
}: {
  params: { hash: string };
  searchParams: { [key: string]: string | undefined };
}) {
  const { transactions, count } = await fetchInternalTransactions({
    page: searchParams.page ? searchParams.page : 1,
    toOrFrom: params.hash,
  });
  return (
    <>
      <div className="flex flex-col border border-line rounded-xl overflow-x-hidden divide-y divide-line px-4">
        <Table
          headers={["Parent Txn Hash", "Method", "Block", "Age", "From", "To"]}
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
            ]),
          ]}
        />
        {!transactions.length && <div className="py-4">No transactions</div>}
      </div>
      <Pagination count={count} />
    </>
  );
}
