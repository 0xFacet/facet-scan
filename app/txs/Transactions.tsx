import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { Pagination } from "@/components/pagination";
import { Transaction } from "@/types/blocks";
import { formatDistanceToNowStrict } from "date-fns";

interface Props {
  totalTransactions: number;
  transactions: Transaction[];
}

export default function Transactions({
  totalTransactions,
  transactions,
}: Props) {
  return (
    <div className="flex flex-col flex-1">
      <SectionContainer className="flex-1">
        <Section className="flex-1 justify-center gap-8">
          <div className="flex-1">
            <Heading size="h5" className="py-4 border-b border-line">
              Transactions
            </Heading>
            {transactions.map((transaction) => (
              <div
                key={transaction.transaction_hash}
                className="flex flex-row gap justify-between border-b border-line py-4 hover:bg-[rgba(255,255,255,0.02)] hover:text-primary"
              >
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
            ))}
            <Pagination count={Math.ceil(totalTransactions / 20)} />
          </div>
        </Section>
      </SectionContainer>
    </div>
  );
}
