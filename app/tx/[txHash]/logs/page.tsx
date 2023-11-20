import { Address } from "@/components/Address";
import { Card } from "@/components/Card";
import { List } from "@/components/List";
import { fetchTransaction } from "@/utils/data";

export default async function Page({ params }: { params: { txHash: string } }) {
  const transaction = await fetchTransaction(params.txHash);

  return (
    <div className="flex flex-col gap-8">
      {transaction.logs.map((log, i) => (
        <Card key={i}>
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
                  <Card>
                    <List
                      items={Object.entries(log.data).map(([label, value]) => ({
                        label,
                        value,
                      }))}
                    />
                  </Card>
                ),
              },
            ]}
          />
        </Card>
      ))}
    </div>
  );
}
