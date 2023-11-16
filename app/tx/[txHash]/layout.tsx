import { Heading } from "@/components/Heading";
import { NavLink } from "@/components/NavLink";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { fetchTransaction } from "@/utils/data";

export default async function TransactionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { txHash: string };
}) {
  const transaction = await fetchTransaction(params.txHash);
  return (
    <div className="flex flex-col flex-1">
      <SectionContainer>
        <Section>
          <Heading size="h2" className="py-4">
            Transaction Details
          </Heading>
        </Section>
      </SectionContainer>
      <SectionContainer>
        <Section className="py-0 sm:py-0">
          <div className="flex gap-8">
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
              Internal Txns
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
