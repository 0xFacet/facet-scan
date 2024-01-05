import { truncateMiddle } from "@/utils/formatter";
import Link from "next/link";

interface Props {
  address: string;
  name?: string;
}

export const Address = ({ address, name }: Props) => {
  return (
    <Link href={`/address/${address}`}>
      {name || truncateMiddle(address, 8, 8)}
    </Link>
  );
};
