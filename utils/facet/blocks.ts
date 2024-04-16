import { Block } from "@/types/blocks";
import { get } from "../api-client";

export const fetchTotalBlocks = async () => {
  const { result } = await get<{ result: number }>(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/blocks/total`,
    { next: { revalidate: 10 } }
  ).catch(() => ({
    result: 0,
  }));
  return result as number;
};

export const fetchBlocks = async ({ page = 1, perPage = 20 } = {}) => {
  const { result } = await get<{ result: Block[] }>(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/blocks`,
    {
      params: {
        page: `${page}`,
        per_page: `${perPage}`,
      },
      next: { revalidate: 10 },
    }
  ).catch(() => ({
    result: [],
  }));
  return result;
};

export const fetchBlock = async (blockNumber: string) => {
  const { result } = await get<{ result: Block }>(
    `${process.env.NEXT_PUBLIC_API_BASE_URI}/blocks/${blockNumber}`,
    { next: { revalidate: 10 } }
  ).catch(() => ({
    result: null,
  }));
  return result;
};
