import { CopyText } from "@/components/CopyText";
import { Heading } from "@/components/Heading";
import { NavLink } from "@/components/NavLink";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { isCardName } from "@/lib/utils";
import { fetchCard, fetchContract } from "@/utils/data";

export default async function AddressLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { hash: string };
}) {
  let card;
  if (isCardName(params.hash)) {
    card = await fetchCard(params.hash);
  }
  const address = card ? card.owner : params.hash;
  const contract = await fetchContract(address);
  return (
    <div className="flex flex-col flex-1">
      <SectionContainer>
        <Section>
          <div className="py-4">
            {card ? (
              <Heading size="h2">{params.hash}</Heading>
            ) : (
              <Heading size="h2">{!!contract ? "Contract" : "Address"}</Heading>
            )}
            <div className="w-fit mt-1 text-accent">
              <CopyText text={address} />
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
            {!!contract?.current_init_code_hash && (
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
