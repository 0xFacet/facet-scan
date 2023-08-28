import { useEffect, useState } from "react";
import Blockies from "react-blockies";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useEnsAvatar, useEnsName } from "wagmi";
import { HiCheckCircle, HiDocumentDuplicate } from "react-icons/hi2";
import { isAddress } from "viem";
import { targetNetwork } from "@/app/providers";

type TAddressProps = {
  address?: `0x${string}`;
  disableAddressLink?: boolean;
  noAvatar?: boolean;
  noCopy?: boolean;
  format?: "short" | "long";
};

/**
 * Displays an address (or ENS) with a Blockie image and option to copy address.
 */
export const Address = ({
  address,
  disableAddressLink,
  format,
  noAvatar,
  noCopy,
}: TAddressProps) => {
  const [ens, setEns] = useState<string | null>();
  const [ensAvatar, setEnsAvatar] = useState<string | null>();
  const [addressCopied, setAddressCopied] = useState(false);

  const { data: fetchedEns } = useEnsName({
    address,
    enabled: isAddress(address ?? ""),
    chainId: 1,
  });
  const { data: fetchedEnsAvatar } = useEnsAvatar({
    name: fetchedEns,
    enabled: isAddress(address ?? ""),
    chainId: 1,
    cacheTime: 30_000,
  });

  // We need to apply this pattern to avoid Hydration errors.
  useEffect(() => {
    setEns(fetchedEns);
  }, [fetchedEns]);

  useEffect(() => {
    setEnsAvatar(fetchedEnsAvatar);
  }, [fetchedEnsAvatar]);

  // Skeleton UI
  if (!address) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-md bg-slate-300 h-6 w-6"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAddress(address)) {
    return <span className="text-error">Wrong address</span>;
  }

  const blockExplorerAddressLink = `${targetNetwork.blockExplorers.default.url}/address/${address}`;
  let displayAddress = address?.slice(0, 5) + "..." + address?.slice(-4);

  if (ens) {
    displayAddress = ens;
  } else if (format === "long") {
    displayAddress = address;
  }

  if (
    address?.toLowerCase() ===
    process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS?.toLowerCase()
  ) {
    displayAddress = "Marketplace Contract";
  }

  return (
    <div className="flex items-center gap-1">
      <div className={`flex-shrink-0 ${noAvatar ? "hidden" : ""}`}>
        {ensAvatar ? (
          // Don't want to use nextJS Image here (and adding remote patterns for the URL)
          // eslint-disable-next-line
          <img
            className="rounded-full"
            src={ensAvatar}
            width={24}
            height={24}
            alt={`${address} avatar`}
          />
        ) : (
          <Blockies
            className="mx-auto rounded-full"
            size={8}
            seed={address.toLowerCase()}
            scale={3}
          />
        )}
      </div>
      {disableAddressLink ? (
        <span className="text-lg">{displayAddress}</span>
      ) : (
        <a
          className="text-lg font-normal"
          target="_blank"
          href={blockExplorerAddressLink}
          rel="noopener noreferrer"
        >
          {displayAddress}
        </a>
      )}
      {addressCopied ? (
        <HiCheckCircle
          className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
          aria-hidden="true"
        />
      ) : (
        !noCopy && (
          <CopyToClipboard
            text={address}
            onCopy={() => {
              setAddressCopied(true);
              setTimeout(() => {
                setAddressCopied(false);
              }, 800);
            }}
          >
            <HiDocumentDuplicate
              className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
              aria-hidden="true"
            />
          </CopyToClipboard>
        )
      )}
    </div>
  );
};
