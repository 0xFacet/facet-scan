"use client";

import { lookupPrimaryName } from "@/utils/facet/cards";
import { truncateMiddle } from "@/utils/formatter";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Props {
  address?: string | null;
  linkTarget?: string;
  size?: number;
  name?: string | null;
}

export const Address = ({ address, size = 16, name, linkTarget }: Props) => {
  const [primaryName, setPrimaryName] = useState<string>(name ?? "");

  useEffect(() => {
    if (!name && address) {
      (async () => {
        const res = await lookupPrimaryName(address);
        setPrimaryName(res.primaryName);
      })();
    } else if (name && address) {
      setPrimaryName(name);
    }
  }, [address, name]);

  if (!address) return "--";

  const href = linkTarget ? linkTarget : `/address/${primaryName || address}`;

  return (
    <Link href={href} target="_blank">
      {primaryName ||
        truncateMiddle(address, Math.ceil(size / 2), Math.ceil(size / 2))}
    </Link>
  );
};
