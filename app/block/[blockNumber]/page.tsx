import { fetchBlock } from "@/utils/data";
import Block from "./Block";

export default async function Page({
  params,
}: {
  params: { blockNumber: string };
}) {
  const block = await fetchBlock(params.blockNumber);

  return <Block block={block} />;
}
