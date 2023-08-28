"use client";

import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-[100vh] flex flex-col">
      <Header />
      <SectionContainer className="flex-1">
        <Section className="flex-1">
          <div className="flex flex-1 flex-col md:flex-row py-16 md:px-16 gap-16 items-center">
            <div className="flex flex-1 flex-col gap-8 text-center md:text-left items-center md:items-start">
              <Heading>
                The future of{" "}
                <span className="text-primary">decentralized</span> processing
                is here
              </Heading>
              <div className="text-xl">
                Revolutionizing off-chain computation with Dumb Contracts
              </div>
              <Button>Learn More</Button>
            </div>
            <div className="flex flex-1">
              <div className="w-[50vw] md:w-auto">
                <Image
                  src="/assets/images/storage-art.png"
                  height={500}
                  width={500}
                  alt="Computer"
                />
              </div>
            </div>
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer className="border-none">
        <Section className="flex-1 items-center">
          &copy; {new Date().getFullYear()} Ethscriptions Inc.
        </Section>
      </SectionContainer>
    </div>
  );
}
