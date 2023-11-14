import { fetchTotalTransactions, fetchTransactions } from "@/utils/data";
import Transactions from "./Transactions";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const totalTransactions = await fetchTotalTransactions();
  const transactions = await fetchTransactions({
    page: searchParams.page ? Number(searchParams.page) : 1,
  });

  return (
    <Transactions
      totalTransactions={totalTransactions}
      transactions={transactions}
    />
  );
}
