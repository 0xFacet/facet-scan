import { List } from "@/components/List";
import { Tooltip } from "@/components/Tooltip";
import { InternalTransaction } from "@/types/blocks";
import { fetchInternalTransactions } from "@/utils/data";
import { capitalize } from "lodash";
import Link from "next/link";
import { BiXCircle, BiCheckCircle } from "react-icons/bi";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";

export default async function Page({ params }: { params: { txHash: string } }) {
  const transactions = await fetchInternalTransactions(params.txHash);

  const renderStatus = (transaction: InternalTransaction) => {
    switch (transaction.status) {
      case "success":
        return (
          <div className="flex items-center gap-1 text-green-400 border border-green-700 bg-green-950 rounded-md px-2 py-1 text-sm">
            <BiCheckCircle className="text-lg" />
            {capitalize(transaction.status)}
          </div>
        );
      case "error":
        return (
          <div className="flex flex-col gap-2 flex-wrap overflow-hidden">
            <div className="flex items-center gap-1 text-red-400 border border-red-700 bg-red-950 rounded-md px-2 py-1 text-sm w-fit">
              <BiXCircle className="text-lg" />
              {capitalize(transaction.status)}
            </div>
            {!!transaction.error && (
              <div className="w-full">
                <div className="truncate whitespace-break-spaces">
                  {transaction.error}
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
      {transactions.map((transaction) => (
        <div
          key={transaction.internal_transaction_index}
          className="border border-line rounded-xl px-4"
        >
          <List
            items={[
              {
                label: (
                  <div className="flex items-center gap-1">
                    <Tooltip label="The order in which the internal transaction was executed.">
                      <HiOutlineQuestionMarkCircle className="text-xl" />
                    </Tooltip>
                    Internal Transaction Index
                  </div>
                ),
                value: transaction.internal_transaction_index,
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
                value: renderStatus(transaction),
              },
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
                    {transaction.from}
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
                  <Link href={`/address/${transaction.to}`}>
                    {transaction.to}
                  </Link>
                ),
                hidden: !transaction.to,
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
                  <div className="border border-line rounded-xl px-4">
                    <List
                      items={Object.entries(transaction.args).map(
                        ([label, value]) => ({ label, value })
                      )}
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>
      ))}
    </div>
  );
}
