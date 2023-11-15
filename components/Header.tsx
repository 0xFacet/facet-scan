"use client";

import Link from "next/link";
import { CustomConnectButton } from "./CustomConnectButton";
import { NavLink } from "./NavLink";
import { Section } from "./Section";
import { SectionContainer } from "./SectionContainer";
import Image from "next/image";
import { usePathname } from "next/navigation";

export const Header = () => {
  const path = usePathname();

  return (
    <SectionContainer>
      <Section className="py-0 sm:py-0">
        <div className="flex justify-between items-center">
          <Link href="/">
            <Image
              src="/facet-scan-lockup.svg"
              alt="Facet Scan"
              width={196}
              height={35}
              priority
              className="hidden sm:block"
            />
            <Image
              src="/facet-brandmark.svg"
              alt="Facet Scan"
              width={35}
              height={35}
              priority
              className="block sm:hidden"
            />
          </Link>
          <div className="flex gap-8 items-center h-min-full">
            <div className="flex gap-8 h-min-full">
              <NavLink href="/contracts" isActive={path === "/contracts"}>
                Contracts
              </NavLink>
              <NavLink href="https://github.com/0xfacet" target="_blank">
                GitHub
              </NavLink>
            </div>
            <CustomConnectButton />
          </div>
        </div>
      </Section>
    </SectionContainer>
  );
};
