import { fetchTotalBlocks, fetchBlocks } from "@/utils/data";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { Pagination } from "@/components/pagination";
import { formatDistanceToNowStrict } from "date-fns";
import { Heading } from "@/components/Heading";
import Link from "next/link";

function pluralize(count: number, word: string) {
  return `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;
}

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
      <SectionContainer className="flex-1">
        <Section className="flex-1 justify-center gap-8">
          <div className="flex-1">
            <Heading size="h2" className="py-4">
              Blocks
            </Heading>
            <div className="flex flex-col flex-1 border border-line rounded-xl overflow-x-hidden divide-y divide-line px-4">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="flex flex-row gap justify-between py-4"
                >
                  <div>
                    <Link href={`/block/${block.block_number}`}>
                      <div className="font-bold">
                        Block #{block.block_number}
                      </div>
                    </Link>
                    <div className="opacity-50">
                      {`${formatDistanceToNowStrict(
                        new Date(block.timestamp * 1000)
                      )} ago`}
                    </div>
                  </div>
                  <div>
                    <Link href={`/txs?block=${block.block_number}`}>
                      {pluralize(block.transaction_count ?? 0, "transaction")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <Pagination count={Math.ceil(totalBlocks / 20)} />
          </div>
        </Section>
      </SectionContainer>
    </div>
  );
}
