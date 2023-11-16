import Link from "next/link";
import { Section } from "./Section";
import { SectionContainer } from "./SectionContainer";

export const Footer = () => {
  return (
    <SectionContainer className="border-none">
      <Section className="flex-1 items-center gap-4">
        <div className="flex flex-row gap-2 flex-wrap justify-center">
          <Link href="/blocks">Blocks</Link>
          &bull;
          <Link href="/txs">Transactions</Link>
          &bull;
          <Link href="/contracts">Contracts</Link>
          &bull;
          <Link href="https://github.com/0xfacet" target="_blank">
            GitHub
          </Link>
          &bull;
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
