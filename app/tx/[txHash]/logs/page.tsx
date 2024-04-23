import { Address } from "@/components/address";
import { fetchTransaction } from "@/utils/facet/transactions";
import { Card, List } from "@0xfacet/component-library";

export default async function Page({ params }: { params: { txHash: string } }) {
  const transaction = await fetchTransaction(params.txHash);

  if (!transaction) return;

  return (
    <div className="flex flex-col gap-8">
      {transaction.logs.map((log, i) => (
        <Card key={i} childrenClassName="px-4">
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
                  <Card childrenClassName="px-4">
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
