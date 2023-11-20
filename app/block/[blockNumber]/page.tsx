import { fetchBlock } from "@/utils/data";
import { List } from "@/components/List";
import { formatDistanceToNowStrict } from "date-fns";
import { Button } from "@/components/ui/button";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import Link from "next/link";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { Card } from "@/components/Card";

function pluralize(count: number, word: string) {
  return `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;
}

export default async function Page({
  params,
}: {
  params: { blockNumber: string };
}) {
  const block = await fetchBlock(params.blockNumber);

  return (
    <div className="flex flex-col flex-1">
      <SectionContainer>
        <Section>
          <Heading size="h2" className="py-4">
            Block #{params.blockNumber}
          </Heading>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1">
        <Section className="flex-1">
          <Card>
            <List
              items={[
                {
                  label: "Block Height",
                  value: (
                    <div className="flex gap-4 justify-center">
                      <div>{block.block_number}</div>
                      <div className="flex gap-2">
                        <Link
                          href={`/block/${Number(params.blockNumber) - 1}`}
                          title="prev"
                        >
                          <Button variant="outline" className="px-0 py-0 h-fit">
                            <BiChevronLeft className="text-xl" />
                          </Button>
                        </Link>
                        <Link
                          href={`/block/${Number(params.blockNumber) + 1}`}
                          title="next"
                        >
                          <Button variant="outline" className="px-0 py-0 h-fit">
                            <BiChevronRight className="text-xl" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ),
                },
                {
                  label: "Timestamp",
                  value: `${formatDistanceToNowStrict(
                    new Date(Number(block.timestamp) * 1000)
                  )} ago (${new Date(
                    Number(block.timestamp) * 1000
                  ).toUTCString()})`,
                },
                {
                  label: "Transactions",
                  value: (
                    <Link href={`/txs?block=${block.block_number}`}>
                      {pluralize(block.transaction_count ?? 0, "transaction")}
                    </Link>
                  ),
                },
              ]}
            />
          </Card>
        </Section>
      </SectionContainer>
    </div>
  );
}
