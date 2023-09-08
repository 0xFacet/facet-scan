"use client";

import { Button } from "@/components/Button";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import Image from "next/image";
import Link from "next/link";
import Notification from "@/components/Notification";
import { HERO, BUTTON } from "./Constant/landing.constant"

export default function Home() {
  return (
    <div className="min-h-[100vh] flex flex-col">
      <Notification />
      <Header />
      <SectionContainer className="flex-1">
        <Section>
          <div className="flex flex-col md:flex-row py-16 items-center justify-between w-full">
            <div className="flex flex-1 flex-col text-center md:text-left items-center md:items-start">
              <div className="text-6xl leading-[72px] font-semibold -tracking-wider w-full flex items-start flex-col">
                {HERO.firstTitle} <h1 className="text-primary">{HERO.badge}</h1>
                {HERO.secondTitle}
              </div>
              <div className="text-xl w-full mt-6">
                {HERO.description}
              </div>
              <div className="flex flex-row gap-4 w-full items-center mt-12">
                <Link href="/contracts">
                  <Button className={'rounded-lg'}>{BUTTON.create}</Button>
                </Link>
                <Link
                  href="https://docs.ethscriptions.com/v/ethscriptions-vm"
                  target="_blank"
                >
                  <Button className={'rounded-lg'} primary={false}>{BUTTON.learn}</Button>
                </Link>
              </div>
            </div>
            <div className="w-fit">
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
