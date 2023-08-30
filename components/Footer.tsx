import Link from "next/link";
import { Section } from "./Section";
import { SectionContainer } from "./SectionContainer";

export const Footer = () => {
  return (
    <SectionContainer className="border-none">
      <Section className="flex-1 items-center">
        <div>
          Built by{" "}
          <Link
            href="https://ethscriptions.com"
            target="_blank"
            className="text-secondary hover:text-primary"
          >
            Ethscriptions
          </Link>
        </div>
      </Section>
    </SectionContainer>
  );
};
