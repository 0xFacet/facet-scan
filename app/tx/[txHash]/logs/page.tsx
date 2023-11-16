import { List } from "@/components/List";
import { fetchTransaction } from "@/utils/data";

export default async function Page({ params }: { params: { txHash: string } }) {
  const transaction = await fetchTransaction(params.txHash);

  return (
    <div className="flex flex-col gap-8">
      <div className="border border-line rounded-xl px-4">
        <List
          items={transaction.logs.map((log) => ({ label: "Log", value: log }))}
        />
      </div>
    </div>
  );
}
