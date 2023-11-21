import { fetchTransactions } from "@/utils/data";
import Link from "next/link";
import { Address } from "@/components/Address";
import { formatEther } from "viem";
import { Pagination } from "@/components/pagination";
import { Table } from "@/components/Table";
import { truncateMiddle, formatTimestamp } from "@/utils/formatter";
import { startCase } from "lodash";
import { IoAlertCircleOutline } from "react-icons/io5";
import { Card } from "@/components/Card";

export default async function Page({
  params,
  searchParams,
}: {
  params: { hash: string };
  searchParams: { [key: string]: string | undefined };
}) {
  const { transactions, count } = await fetchTransactions({
    page: searchParams.page ? searchParams.page : 1,
    toOrFrom: params.hash,
  });
  return (
    <>
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
        {!transactions.length && <div className="py-4">No transactions</div>}
      </Card>
      <Pagination count={count} />
    </>
  );
}
