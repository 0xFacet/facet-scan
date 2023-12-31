import { fetchTotalBlocks, fetchBlocks } from "@/utils/data";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { Pagination } from "@/components/pagination";
import { Heading } from "@/components/Heading";
import Link from "next/link";
import { Table } from "@/components/Table";
import { formatTimestamp } from "@/utils/formatter";
import { Card } from "@/components/Card";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const totalBlocks = await fetchTotalBlocks();
  const blocks = await fetchBlocks({
    page: searchParams.page ? Number(searchParams.page) : 1,
  });

  return (
    <div className="flex flex-col flex-1">
      <SectionContainer>
        <Section>
          <Heading size="h2" className="py-4">
            Blocks
          </Heading>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1">
        <Section className="flex-1">
          <Card>
            <Table
              headers={["Block", "Age", "Transactions"]}
              rows={[
                ...blocks.map((block) => [
                  <Link
                    key={block.block_number}
                    href={`/block/${block.block_number}`}
                  >
                    {block.block_number}
                  </Link>,
                  block.timestamp
                    ? formatTimestamp(new Date(Number(block.timestamp) * 1000))
                    : "--",
                  <Link
                    key={block.block_number}
                    href={`/txs?block=${block.block_number}`}
                  >
                    {block.transaction_count ?? 0}
                  </Link>,
                ]),
              ]}
            />
          </Card>
          <Pagination count={Math.ceil(Number(totalBlocks) / 20)} />
        </Section>
      </SectionContainer>
    </div>
  );
}
