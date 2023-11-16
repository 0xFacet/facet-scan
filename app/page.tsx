import {
  fetchBlocks,
  fetchTransactions,
  fetchTotalBlocks,
  fetchTotalTransactions,
} from "@/utils/data";
import Home from "./Home";

export default async function Page() {
  const totalBlocks = await fetchTotalBlocks();
  const blocks = await fetchBlocks({ perPage: 10 });
  const { transactions, count } = await fetchTransactions({ perPage: 10 });

  return (
    <Home
      totalBlocks={totalBlocks}
      blocks={blocks}
      totalTransactions={count}
      transactions={transactions}
    />
  );
}
