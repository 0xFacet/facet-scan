import { Card } from "@/components/Card";
import { List } from "@/components/List";
import { Tooltip } from "@/components/Tooltip";
import {
  fetchTransaction,
  getAddressToName,
  lookupPrimaryName,
} from "@/utils/data";
import { formatDistanceToNowStrict } from "date-fns";
import { capitalize } from "lodash";
import Link from "next/link";
import { BiXCircle, BiCheckCircle } from "react-icons/bi";
import { HiOutlineClock, HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { formatEther, formatGwei } from "viem";

export default async function Page({ params }: { params: { txHash: string } }) {
  const transaction = await fetchTransaction(params.txHash);
  const addressToName = await getAddressToName([
    transaction.from,
    transaction.to_or_contract_address,
  ]);

  const renderStatus = () => {
    switch (transaction.status) {
      case "success":
        return (
          <div className="flex items-center gap-1 text-green-400 border border-green-700 bg-green-950 rounded-md px-2 py-1 text-sm">
            <BiCheckCircle className="text-lg" />
            {capitalize(transaction.status)}
          </div>
        );
      case "failure":
        return (
          <div className="flex flex-col gap-2 flex-wrap overflow-hidden">
            <div className="flex items-center gap-1 text-red-400 border border-red-700 bg-red-950 rounded-md px-2 py-1 text-sm w-fit">
              <BiXCircle className="text-lg" />
              {capitalize(transaction.status)}
            </div>
            {!!transaction?.error?.message && (
              <div className="w-full">
                <div className="truncate whitespace-break-spaces">
                  {transaction?.error?.message}
                </div>
              </div>
            )}
          </div>
        );
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <List
          items={[
            {
              label: (
                <div className="flex items-center gap-1">
                  <Tooltip label="A transaction hash is a random 66-character identifier that is generated whenever a transaction is executed.">
                    <HiOutlineQuestionMarkCircle className="text-xl" />
                  </Tooltip>
                  Transaction Hash
                </div>
              ),
              value: transaction.transaction_hash,
            },
            {
              label: (
                <div className="flex items-center gap-1">
                  <Tooltip label="The status of the transaction.">
                    <HiOutlineQuestionMarkCircle className="text-xl" />
                  </Tooltip>
                  Status
                </div>
              ),
              value: renderStatus(),
            },
            {
              label: (
                <div className="flex items-center gap-1">
                  <Tooltip label="The block number in which the transaction was recorded.">
                    <HiOutlineQuestionMarkCircle className="text-xl" />
                  </Tooltip>
                  Block
                </div>
              ),
              value: (
                <Link href={`/block/${transaction.block_number}`}>
                  {transaction.block_number}
                </Link>
              ),
            },
            {
              label: (
                <div className="flex items-center gap-1">
                  <Tooltip label="The date and time at which the transaction was produced.">
                    <HiOutlineQuestionMarkCircle className="text-xl" />
                  </Tooltip>
                  Timestamp
                </div>
              ),
              value: (
                <div className="flex items-center gap-1">
                  <HiOutlineClock className="text-xl" />
                  {`${formatDistanceToNowStrict(
                    new Date(Number(transaction.block_timestamp) * 1000)
                  )} ago (${new Date(
                    Number(transaction.block_timestamp) * 1000
                  ).toUTCString()})`}
                </div>
              ),
            },
            {
              label: (
                <div className="flex items-center gap-1">
                  <Tooltip label="Amount paid to process the transaction in Ether.">
                    <HiOutlineQuestionMarkCircle className="text-xl" />
                  </Tooltip>
                  Transaction Fee
                </div>
              ),
              value: `${
                transaction.transaction_fee
                  ? formatEther(
                      BigInt(transaction.transaction_fee.split(".")[0])
                    )
                  : 0
              } ETH`,
            },
            {
              label: (
                <div className="flex items-center gap-1">
                  <Tooltip label="Cost per unit of gas spent on the transaction.">
                    <HiOutlineQuestionMarkCircle className="text-xl" />
                  </Tooltip>
                  Gas Price
                </div>
              ),
              value: `${
                transaction.gas_price
                  ? formatGwei(BigInt(transaction.gas_price.split(".")[0]))
                  : 0
              } Gwei`,
            },
            {
              label: (
                <div className="flex items-center gap-1">
                  <Tooltip label="The amount of gas used on the transaction.">
                    <HiOutlineQuestionMarkCircle className="text-xl" />
                  </Tooltip>
                  Gas Used
                </div>
              ),
              value: Number(transaction.gas_used).toLocaleString(),
            },
          ]}
        />
      </Card>
      <Card>
        <List
          items={[
            {
              label: (
                <div className="flex items-center gap-1">
                  <Tooltip label="The sending party of the transaction.">
                    <HiOutlineQuestionMarkCircle className="text-xl" />
                  </Tooltip>
                  From
                </div>
              ),
              value: (
                <Link href={`/address/${transaction.from}`}>
                  {addressToName[transaction.from]
                    ? `${addressToName[transaction.from]} (${transaction.from})`
                    : transaction.from}
                </Link>
              ),
            },
            {
              label: (
                <div className="flex items-center gap-1">
                  <Tooltip label="The contract that was called.">
                    <HiOutlineQuestionMarkCircle className="text-xl" />
                  </Tooltip>
                  To (Contract)
                </div>
              ),
              value: (
                <Link href={`/address/${transaction.to_or_contract_address}`}>
                  {addressToName[transaction.to_or_contract_address]
                    ? `${addressToName[transaction.to_or_contract_address]} (${
                        transaction.to_or_contract_address
                      })`
                    : transaction.to_or_contract_address}
                </Link>
              ),
            },
            {
              label: (
                <div className="flex items-center gap-1">
                  <Tooltip label="The function that was executed.">
                    <HiOutlineQuestionMarkCircle className="text-xl" />
                  </Tooltip>
                  Function Name
                </div>
              ),
              value: transaction.function ?? "constructor",
            },
            {
              label: (
                <div className="flex items-center gap-1">
                  <Tooltip label="The arguments sent to the function that was executed.">
                    <HiOutlineQuestionMarkCircle className="text-xl" />
                  </Tooltip>
                  Function Args
                </div>
              ),
              value: (
                <Card>
                  <List
                    items={Object.entries(transaction.args).map(
                      ([label, value]) => ({ label, value })
                    )}
                  />
                </Card>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
