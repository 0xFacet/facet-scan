import Link from "next/link";
import { Section } from "./Section";
import { SectionContainer } from "./SectionContainer";
import {NAVIGATION} from "@/app/Constant/navigation.constant"

export const Footer = () => {
  return (
    <SectionContainer className="border-none">
      <Section className="flex-1 items-center gap-4">
        <div>
          {"Built by "}
          <Link
            href="https://ethscriptions.com"
            target="_blank"
            className="text-secondary hover:text-primary"
          >
            {NAVIGATION.logo}
          </Link>
        </div>
      </Section>
    </SectionContainer>
  );
};
