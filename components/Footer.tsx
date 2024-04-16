"use client";

import Link from "next/link";
import { SectionContainer, Section } from "@0xfacet/component-library";

export const Footer = () => {
  return (
    <SectionContainer className="border-t border-line">
      <Section className="flex-1 items-center gap-4 text-accent text-sm">
        <div className="flex flex-row gap-4 flex-wrap justify-center">
          <Link href="/">Swap</Link>
          <Link href="/pools">Pools</Link>
          <Link href="/wrap">Wrap</Link>
          <Link href="https://github.com/0xfacet" target="_blank">
            GitHub
          </Link>
          <Link href="https://docs.facet.org" target="_blank">
            Docs
          </Link>
          <Link href="https://facet.org/terms.html" target="_blank">
            Terms
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
