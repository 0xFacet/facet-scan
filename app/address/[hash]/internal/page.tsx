import Link from "next/link";
import { truncateMiddle, formatTimestamp } from "@/utils/formatter";
import { flatten, startCase } from "lodash";
import { IoAlertCircleOutline } from "react-icons/io5";
import { isCardName } from "@/lib/utils";
import { isAddress } from "viem";
import {
  lookupPrimaryName,
  getAddressToName,
  getCardOwner,
} from "@/utils/facet/cards";
import { fetchInternalTransactions } from "@/utils/facet/transactions";
import { Card, Table, Pagination } from "@0xfacet/component-library";
import { Address } from "@/components/address";

export default async function Page({
  params,
  searchParams,
}: {
  params: { hash: string };
  searchParams: { [key: string]: string | undefined };
}) {
  let cardOwner;
  let cardName;
  if (isAddress(params.hash)) {
    const { primaryName } = await lookupPrimaryName(params.hash);
    cardName = primaryName;
  } else if (isCardName(params.hash)) {
    cardName = params.hash;
  }
  if (cardName) {
    cardOwner = await getCardOwner(cardName);
  }
  const { transactions, count } = await fetchInternalTransactions({
    page: searchParams.page ? searchParams.page : 1,
    toOrFrom: cardOwner ?? params.hash,
  });
  const addressToName = await getAddressToName(
    flatten(transactions.map((txn) => [txn.from, txn.to_or_contract_address]))
  );
  return (
    <>
      <Card childrenClassName="px-4">
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
            ]),
          ]}
        />
        {!transactions.length && <div className="py-4">No transactions</div>}
      </Card>
      <Pagination count={count} />
    </>
  );
}
