import { CopyText } from "@/components/CopyText";
import { Heading } from "@/components/Heading";
import { NavLink } from "@/components/NavLink";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { fetchContract } from "@/utils/data";

export default async function AddressLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { hash: string };
}) {
  const contract = await fetchContract(params.hash);
  return (
    <div className="flex flex-col flex-1">
      <SectionContainer>
        <Section>
          <div className="py-4">
            <Heading size="h2">{!!contract ? "Contract" : "Address"}</Heading>
            <div className="w-fit mt-1 text-accent">
              <CopyText text={params.hash} />
            </div>
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer>
        <Section className="py-0 sm:py-0">
          <div className="flex gap-4">
            <NavLink
              href={`/address/${params.hash}`}
              className="whitespace-nowrap"
            >
              Transactions
            </NavLink>
            <NavLink
              href={`/address/${params.hash}/internal`}
              className="whitespace-nowrap"
            >
              Internal Transactions
            </NavLink>
            {!!contract.current_init_code_hash && (
              <NavLink
                href={`/address/${params.hash}/contract`}
                className="whitespace-nowrap"
              >
                Contract
              </NavLink>
            )}
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1">
        <Section className="flex-1">{children}</Section>
      </SectionContainer>
    </div>
  );
}
