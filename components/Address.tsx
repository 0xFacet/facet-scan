import { truncateMiddle } from "@/utils/formatter";
import Link from "next/link";

interface Props {
  address: string;
}

export const Address = ({ address }: Props) => {
  return (
    <Link href={`/address/${address}`}>{truncateMiddle(address, 8, 8)}</Link>
  );
};
