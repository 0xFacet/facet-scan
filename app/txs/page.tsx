import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { Pagination } from "@/components/pagination";
import { fetchTotalTransactions, fetchTransactions } from "@/utils/data";
import { formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const totalTransactions = await fetchTotalTransactions();
  const transactions = await fetchTransactions({
    page: searchParams.page ? searchParams.page : 1,
    block: searchParams.block,
  });

  return (
    <div className="flex flex-col flex-1">
      <SectionContainer className="flex-1">
        <Section className="flex-1 justify-center gap-8">
          <div className="flex-1">
            <Heading size="h2" className="py-4">
              Transactions
            </Heading>
            <div className="flex flex-col flex-1 border border-line rounded-xl overflow-x-hidden divide-y divide-line px-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.transaction_hash}
                  className="flex flex-row gap justify-between py-4"
                >
                  <div>
                    <Link href={`/tx/${transaction.transaction_hash}`}>
                      <div className="font-bold">
                        {transaction.transaction_hash}
                      </div>
                    </Link>
                    <div className="opacity-50">
                      {`${formatDistanceToNowStrict(
                        new Date(transaction.timestamp)
                      )} ago`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination count={Math.ceil(totalTransactions / 20)} />
          </div>
        </Section>
      </SectionContainer>
    </div>
  );
}
