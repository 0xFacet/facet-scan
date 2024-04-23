import { uniq } from "lodash";
import { sendStaticCall } from "./contracts";

const cardsContractAddress = process.env.NEXT_PUBLIC_FACET_CARDS_ADDRESS!;

export const lookupPrimaryName = async (address: string) => {
  const primaryName = await sendStaticCall(
    cardsContractAddress,
    "lookupAddress",
    { user: address }
  );
  return { primaryName };
};

export const lookupName = async (name: string) => {
  const id = await sendStaticCall(cardsContractAddress, "nameToTokenId", [
    name,
  ]);
  return { id };
};

export const getCardDetails = async (tokenId: number) => {
  return sendStaticCall(cardsContractAddress, "getCardDetails", { tokenId });
};

export const getCardOwner = async (name: string) =>
  sendStaticCall(cardsContractAddress, "resolveName", [name]);

export const getAddressToName = async (addresses: `0x${string}`[]) =>
  (
    await Promise.all(
      uniq(addresses).map(async (address) => {
        const { primaryName } = await lookupPrimaryName(address);
        return { address, name: primaryName } as {
          address: `0x${string}`;
          name: string | null;
        };
      })
    )
  ).reduce(
    (previous, current) => ({ ...previous, [current.address]: current.name }),
    {} as { [key: `0x${string}`]: string }
  );
