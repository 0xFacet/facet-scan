import AddressContract from "./AddressContract";
import { isCardName } from "@/lib/utils";
import { lookupPrimaryName, getCardOwner } from "@/utils/facet/cards";
import { fetchContract } from "@/utils/facet/contracts";
import { isAddress } from "viem";

export default async function Page({ params }: { params: { hash: string } }) {
  let cardOwner;
  let cardName;
  if (isAddress(params.hash)) {
    const { primaryName } = await lookupPrimaryName(params.hash);
    cardName = primaryName;
  } else if (isCardName(params.hash)) {
    cardName = params.hash;
  }
  if (cardName) {
    cardOwner = await getCardOwner(cardName);
  }
  const address = cardOwner ?? params.hash;
  const contract = await fetchContract(address);

  if (!contract) return;

  return <AddressContract hash={params.hash} contract={contract} />;
}
