import Link from "next/link";
import { formatTimestamp } from "@/utils/formatter";
import { fetchTotalBlocks, fetchBlocks } from "@/utils/facet/blocks";
import {
  SectionContainer,
  Section,
  Heading,
  Card,
  Table,
  Pagination,
} from "@0xfacet/component-library";

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
    <div className="flex flex-1 flex-col divide-y divide-line">
      <SectionContainer>
        <Section>
          <Heading size="h2" className="py-4">
            Blocks
          </Heading>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1">
        <Section className="flex-1">
          <Card childrenClassName="px-4">
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
                    ? formatTimestamp(
                        new Date(Number(block.timestamp) * 1000).toISOString()
                      )
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
