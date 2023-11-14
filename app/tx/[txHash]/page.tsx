import { fetchTransaction } from "@/utils/data";
import Transaction from "./Transaction";

export default async function Page({ params }: { params: { txHash: string } }) {
  const transaction = await fetchTransaction(params.txHash);

  return <Transaction transaction={transaction} />;
}
