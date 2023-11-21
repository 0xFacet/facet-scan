"use client";

import Link from "next/link";
import { CustomConnectButton } from "./CustomConnectButton";
import { NavLink } from "./NavLink";
import { Section } from "./Section";
import { SectionContainer } from "./SectionContainer";
import Image from "next/image";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";

export const Header = () => {
  return (
    <SectionContainer>
      <Section className="py-0 sm:py-0">
        <div className="flex justify-between items-center">
          <Link href="/">
            <Image
              src="/facet-scan-lockup.svg"
              alt="Facet Scan"
              width={150}
              height={30}
              priority
            />
          </Link>
          <div className="flex gap-4 sm:gap-6 items-center h-16">
            <div className="gap-4 h-min-full hidden lg:flex">
              <NavLink href="/blocks">Blocks</NavLink>
              <NavLink href="/txs">Transactions</NavLink>
              <NavLink href="/contracts">Contracts</NavLink>
            </div>
            <CustomConnectButton />
            <Sheet>
              <SheetTrigger asChild>
                <Button className="lg:hidden" size="icon" variant="outline">
                  <HamburgerMenuIcon className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="top">
                <div className="flex flex-1 flex-col gap-4 overflow-auto pt-16 px-4 pb-4 sm:pt-20 sm:px-8 sm:pb-8">
                  <SheetClose asChild>
                    <Link
                      className="group grid h-auto w-full items-center justify-start gap-1 rounded-md p-4 text-sm font-medium transition-colors border border-line hover:border-primary"
                      href="/blocks"
                    >
                      Blocks
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      className="group grid h-auto w-full items-center justify-start gap-1 rounded-md p-4 text-sm font-medium transition-colors border border-line hover:border-primary"
                      href="/txs"
                    >
                      Transactions
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      className="group grid h-auto w-full items-center justify-start gap-1 rounded-md p-4 text-sm font-medium transition-colors border border-line hover:border-primary"
                      href="/contracts"
                    >
                      Contracts
                    </Link>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Section>
    </SectionContainer>
  );
};
