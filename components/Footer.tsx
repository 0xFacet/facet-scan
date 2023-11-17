import Link from "next/link";
import { Section } from "./Section";
import { SectionContainer } from "./SectionContainer";

export const Footer = () => {
  return (
    <SectionContainer className="border-none">
      <Section className="flex-1 items-center gap-4 text-accent text-sm">
        <div className="flex flex-row gap-4 flex-wrap justify-center">
          <Link href="/blocks">Blocks</Link>
          <Link href="/txs">Transactions</Link>
          <Link href="/contracts">Contracts</Link>
          <Link href="https://github.com/0xfacet" target="_blank">
            GitHub
          </Link>
          <Link
            href="https://docs.ethscriptions.com/v/ethscriptions-vm"
            target="_blank"
          >
            Docs
          </Link>
        </div>
        <div>
          {"Facet Blockchain Technologies, LLC "}
          &copy;
          {` ${new Date().getFullYear()}`}
        </div>
      </Section>
    </SectionContainer>
  );
};
