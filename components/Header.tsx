"use client";

import Link from "next/link";
import { CustomConnectButton } from "./CustomConnectButton";
import { NavLink } from "./NavLink";
import { Section } from "./Section";
import { SectionContainer } from "./SectionContainer";
import Image from "next/image";

export const Header = () => {
  return (
    <SectionContainer>
      <Section className="py-0 sm:py-0">
        <div className="flex justify-between items-center">
          <Link href="/">
            <Image
              src="/facet-scan-lockup.svg"
              alt="Facet Scan"
              width={167.7}
              height={32}
              priority
              className="hidden sm:block"
            />
            <Image
              src="/facet-brandmark.svg"
              alt="Facet Scan"
              width={32}
              height={32}
              priority
              className="block sm:hidden"
            />
          </Link>
          <div className="flex gap-8 items-center h-min-full">
            <div className="flex gap-4 h-min-full">
              <NavLink href="/txs">Transactions</NavLink>
              <NavLink href="/contracts">Contracts</NavLink>
            </div>
            <CustomConnectButton />
          </div>
        </div>
      </Section>
    </SectionContainer>
  );
};
