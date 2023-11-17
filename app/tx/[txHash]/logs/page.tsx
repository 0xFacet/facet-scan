import { Address } from "@/components/Address";
import { List } from "@/components/List";
import { fetchTransaction } from "@/utils/data";

export default async function Page({ params }: { params: { txHash: string } }) {
  const transaction = await fetchTransaction(params.txHash);

  console.log(transaction.logs);

  return (
    <div className="flex flex-col gap-8">
      {transaction.logs.map((log, i) => (
        <div key={i} className="border border-line rounded-xl px-4">
          <List
            items={[
              {
                label: "Event",
                value: log.event,
              },
              {
                label: "Contract Address",
                value: <Address address={log.contractAddress} />,
              },
              {
                label: "Data",
                value: (
                  <div className="border border-line rounded-xl px-4">
                    <List
                      items={Object.entries(log.data).map(([label, value]) => ({
                        label,
                        value,
                      }))}
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>
      ))}
    </div>
  );
}
