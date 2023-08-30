"use client";

import { Button } from "@/components/Button";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import Image from "next/image";
import Link from "next/link";

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
                Revolutionizing computation with Dumb Contracts
              </div>
              <div className="flex flex-row gap-4">
                <Link href="/contracts">
                  <Button>Create Now</Button>
                </Link>
                <Link
                  href="https://docs.ethscriptions.com/v/ethscriptions-vm"
                  target="_blank"
                >
                  <Button primary={false}>Learn More</Button>
                </Link>
              </div>
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
      <Footer />
    </div>
  );
}
