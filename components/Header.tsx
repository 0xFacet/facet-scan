import Link from "next/link";
import { CustomConnectButton } from "./CustomConnectButton";
import { NavLink } from "./NavLink";
import { Section } from "./Section";
import { SectionContainer } from "./SectionContainer";
import Image from "next/image";
import { usePathname } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import clsx from "clsx";

export const Header = () => {
  const path = usePathname();
  const [numEthscriptionsBehind, setNumEthscriptionsBehind] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        (async () => {
          const contractsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URI}/status`
          );
          setNumEthscriptionsBehind(contractsRes.data.ethscriptions_behind);
        })();
      } catch (e) {
        console.error(e);
        setNumEthscriptionsBehind(null)
      }
    };
    
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 12_000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
    <div
      className={clsx(
        "justify-center items-center z-20 flex p-1 text-xs bg-opacity-20",
        numEthscriptionsBehind == null || numEthscriptionsBehind <= 1 ? "hidden" : "",
        numEthscriptionsBehind != null && numEthscriptionsBehind < 5 ? "" : "bg-red-100",
      )}
    >
      <>
        VM Status: {numEthscriptionsBehind} transaction{numEthscriptionsBehind === 1 ? "" : "s"} behind
      </>
    </div>
    <SectionContainer>
      <Section className="py-0">
        <div className="flex justify-between items-center">
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
              <h1 className="text-2xl font-black text-black hidden sm:block">
                Ethscriptions VM
              </h1>
            </div>
          </Link>
          <div className="flex gap-8 items-center h-min-full">
            <div className="flex gap-8 h-min-full">
              <NavLink href="/contracts" isActive={path === "/contracts"}>
                Contracts
              </NavLink>
              <NavLink
                href="https://github.com/ethscriptions-protocol"
                target="_blank"
              >
                GitHub
              </NavLink>
            </div>
            <CustomConnectButton />
          </div>
        </div>
      </Section>
    </SectionContainer>
    </>
  );
};
