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
            <Heading size="h5" className="py-4">
              Transactions
            </Heading>
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-row gap justify-between border-t border-line py-4"
              >
                <div>
                  <div className="font-bold">{transaction.ethscription_id}</div>
                  <div className="opacity-50">
                    {`${formatDistanceToNowStrict(
                      new Date(transaction.creation_timestamp * 1000)
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
