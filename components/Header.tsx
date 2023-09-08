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
      <Section className="py-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-10">
            <Link href="/">
              <div
                className="flex gap-4 items-center invert hover:sepia-[65%] hover:saturate-[3995%] hover:hue-rotate-[16deg] hover:brightness-[102%] hover:contrast-[105%]"
                style={{
                  filter:
                    "var(--tw-invert) var(--tw-sepia) var(--tw-saturate) var(--tw-hue-rotate) var(--tw-brightness) var(--tw-contrast)",
                }}
              >
                <Image
                  src="/assets/images/logo.svg"
                  height={34}
                  width={24}
                  alt="Logo"
                />
                <h1 className="text-xl font-black text-black hidden sm:block">
                  Ethscriptions VM
                </h1>
              </div>
            </Link>

            <div className="flex space-x-8 h-min-full">
              <NavLink className="font-semibold leading-6" href="/contracts" isActive={path === "/contracts"}>
                Contracts
              </NavLink>
              <NavLink
                href="https://github.com/ethscriptions-protocol"
                target="_blank"
                className="font-semibold leading-6"
              >
                GitHub
              </NavLink>
              <NavLink
                href="https://docs.ethscriptions.com/v/ethscriptions-vm"
                target="_blank"
                className="font-semibold leading-6"
              >
                Docs
              </NavLink>
            </div>
          </div>
          <div className="flex gap-8 items-center h-min-full">
            <CustomConnectButton />
          </div>
        </div>
      </Section>
    </SectionContainer>
  );
};
