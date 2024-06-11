import { Address } from "@/components/address";
import { getAddressToName } from "@/utils/facet/cards";
import { fetchTransactions } from "@/utils/facet/transactions";
import { truncateMiddle, formatTimestamp } from "@/utils/formatter";
import {
  SectionContainer,
  Section,
  Heading,
  Card,
  Table,
  Pagination,
} from "@0xfacet/component-library";
import { flatten, startCase } from "lodash";
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
  const addressToName = await getAddressToName(
    flatten(transactions.map((txn) => [txn.from, txn.to_or_contract_address]))
  );

  return (
    <div className="flex flex-1 flex-col divide-y divide-line">
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
          <Card childrenClassName="px-4">
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
                        new Date(
                          Number(transaction.block_timestamp) * 1000
                        ).toISOString()
                      )
                    : "--",
                  <Address
                    key={transaction.transaction_hash}
                    address={transaction.from}
                    name={addressToName[transaction.from]}
                  />,
                  <Address
                    key={transaction.transaction_hash}
                    address={transaction.to_or_contract_address}
                    name={
                      transaction.to_or_contract_address
                        ? addressToName[transaction.to_or_contract_address]
                        : null
                    }
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
