import { fetchTotalBlocks, fetchBlocks } from "@/utils/data";
import Blocks from "./Blocks";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const totalBlocks = await fetchTotalBlocks();
  const blocks = await fetchBlocks({
    page: searchParams.page ? Number(searchParams.page) : 1,
  });

  return <Blocks totalBlocks={totalBlocks} blocks={blocks} />;
}
