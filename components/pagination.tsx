"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

interface Props {
  count: number;
}

export function Pagination({ count }: Props) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const params = new URLSearchParams(searchParams);
  const ITEM_PER_PAGE = 20;
  const lastPage = Math.ceil(count / ITEM_PER_PAGE);

  let page = Number(searchParams.get("page") || "1");
  if (page < 1) page = 1;
  if (page > lastPage) page = lastPage;

  const hasPrev = ITEM_PER_PAGE * (page - 1) > 0;
  const hasNext = ITEM_PER_PAGE * (page - 1) + ITEM_PER_PAGE < count;

  const handleChangePage = (type: "prev" | "next") => {
    type === "prev"
      ? params.set("page", `${page - 1}`)
      : params.set("page", `${page + 1}`);
    replace(`${pathname}?${params}`);
  };
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          disabled={!hasPrev}
          onClick={() => handleChangePage("prev")}
        >
          Previous
        </Button>
        <div className="text-base">
          Page {page.toLocaleString()} of{" "}
          {Math.ceil(count / ITEM_PER_PAGE).toLocaleString()}
        </div>
        <Button
          variant="outline"
          disabled={!hasNext}
          onClick={() => handleChangePage("next")}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
