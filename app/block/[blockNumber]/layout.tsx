import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";

export default function BlockLayout({
  params,
  children,
}: {
  params: { blockNumber: string };
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1">
      <SectionContainer>
        <Section>
          <Heading size="h2" className="py-4">
            Block #{params.blockNumber}
          </Heading>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1">
        <Section className="flex-1">{children}</Section>
      </SectionContainer>
    </div>
  );
}
