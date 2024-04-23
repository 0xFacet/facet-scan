import { Collection, CollectionItem } from "@/types/collections";
import { get, post } from "./api-client";

interface CollectionOptions {
  featured?: "true" | "false";
  sort_by?:
    | "newest_first"
    | "daily_volume_desc"
    | "all_time_volume_desc"
    | "daily_sale_count_desc"
    | "all_time_sale_count_desc"
    | "unique_holder_count_desc"
    | "number_listed_desc"
    | "floor_price_asc";
  reverse?: "true" | "false";
}

export const fetchCollections = async (
  collectionOptions?: CollectionOptions
) => {
  const { result } = await get<{ result: Collection[] }>(
    `${process.env.NEXT_PUBLIC_FACET_SWAP_API_BASE_URI}/collections`,
    {
      params: { ...(collectionOptions || {}) },
      cache: "no-store",
    }
  ).catch(() => ({
    result: [] as Collection[],
  }));
  return result;
};

export const fetchCollection = async (slugOrContract: string) => {
  const { result } = await get<{ result: Collection }>(
    `${process.env.NEXT_PUBLIC_FACET_SWAP_API_BASE_URI}/collections/${slugOrContract}`,
    { cache: "no-store" }
  ).catch(() => ({
    result: null,
  }));
  return result;
};

export const fetchCollectionItems = async (contract: string) => {
  const { result } = await get<{ result: CollectionItem[] }>(
    `${process.env.NEXT_PUBLIC_FACET_SWAP_API_BASE_URI}/collection_items/${contract}`,
    { cache: "no-store" }
  ).catch(() => ({
    result: [] as CollectionItem[],
  }));
  return result;
};

export const fetchCollectionItem = async (
  contract: string,
  tokenId: string
) => {
  const { result } = await get<{ result: CollectionItem }>(
    `${process.env.NEXT_PUBLIC_FACET_SWAP_API_BASE_URI}/collection_items/${contract}/${tokenId}`,
    { cache: "no-store" }
  ).catch(() => ({
    result: null,
  }));
  return result;
};

export const createCollectionItemOffer = async (offer: any) => {
  const res = await post(
    `${process.env.NEXT_PUBLIC_FACET_SWAP_API_BASE_URI}/offers`,
    {
      body: JSON.stringify({ offer }),
    }
  ).catch(() => null);
  return res;
};
