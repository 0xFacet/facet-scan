import Link from "next/link";
import { Section } from "./Section";
import { SectionContainer } from "./SectionContainer";

export const Footer = () => {
  return (
    <SectionContainer className="border-none">
      <Section className="flex-1 items-center gap-4">
        <div className="flex flex-row gap-2">
          <Link href="/contracts" className="text-secondary hover:text-primary">
            Contracts
          </Link>
          &bull;
          <Link
            href="https://github.com/0xfacet"
            target="_blank"
            className="text-secondary hover:text-primary"
          >
            GitHub
          </Link>
          &bull;
          <Link
            href="https://docs.ethscriptions.com/v/ethscriptions-vm"
            target="_blank"
            className="text-secondary hover:text-primary"
          >
            Docs
          </Link>
        </div>
        <div>
          {"Facet Computing, Inc. "}
          &copy;
          {` ${new Date().getFullYear()}`}
        </div>
      </Section>
    </SectionContainer>
  );
};
