import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { Pagination } from "@/components/pagination";
import { Block } from "@/types/blocks";
import { formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";

function pluralize(count: number, word: string) {
  return `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;
}

interface Props {
  totalBlocks: number;
  blocks: Block[];
}

export default function Blocks({ totalBlocks, blocks }: Props) {
  return (
    <div className="flex flex-col flex-1">
      <SectionContainer className="flex-1">
        <Section className="flex-1 justify-center gap-8">
          <div className="flex-1">
            <Heading size="h5" className="py-4">
              Blocks
            </Heading>
            {blocks.map((block) => (
              <Link key={block.id} href={`/block/${block.block_number}`}>
                <div className="flex flex-row gap justify-between border-t border-line py-4">
                  <div>
                    <div className="font-bold">
                      Block #{block.block_number.toLocaleString()}
                    </div>
                    <div className="opacity-50">
                      {`${formatDistanceToNowStrict(
                        new Date(block.timestamp * 1000)
                      )} ago`}
                    </div>
                  </div>
                  <div>
                    {pluralize(block.ethscriptions?.length ?? 0, "transaction")}
                  </div>
                </div>
              </Link>
            ))}
            <Pagination count={Math.ceil(totalBlocks / 20)} />
          </div>
        </Section>
      </SectionContainer>
    </div>
  );
}
