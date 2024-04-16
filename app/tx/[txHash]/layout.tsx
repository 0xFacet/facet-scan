import { fetchTransaction } from "@/utils/facet/transactions";
import {
  SectionContainer,
  Section,
  Heading,
  NavLink,
} from "@0xfacet/component-library";

export default async function TransactionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { txHash: string };
}) {
  const transaction = await fetchTransaction(params.txHash);
  if (!transaction) return;
  return (
    <div className="flex flex-1 flex-col divide-y divide-line">
      <SectionContainer>
        <Section>
          <Heading size="h2" className="py-4">
            Transaction Details
          </Heading>
        </Section>
      </SectionContainer>
      <SectionContainer>
        <Section className="py-0 sm:py-0">
          <div className="flex gap-4">
            <NavLink
              href={`/tx/${params.txHash}`}
              className="whitespace-nowrap"
            >
              Overview
            </NavLink>
            <NavLink
              href={`/tx/${params.txHash}/internal`}
              className="whitespace-nowrap"
            >
              Internal Transactions
            </NavLink>
            <NavLink
              href={`/tx/${params.txHash}/logs`}
              className="whitespace-nowrap"
            >
              Logs ({transaction.logs.length})
            </NavLink>
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1">
        <Section className="flex-1">{children}</Section>
      </SectionContainer>
    </div>
  );
}
