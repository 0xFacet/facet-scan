import {
  fetchContract,
  getCardDetails,
  lookupName,
  lookupPrimaryName,
} from "@/utils/data";
import AddressContract from "./AddressContract";
import { isCardName } from "@/lib/utils";
import { isAddress } from "viem";

export default async function Page({ params }: { params: { hash: string } }) {
  let cardOwner;
  let cardId;
  let cardDetails;
  let cardName;
  if (isAddress(params.hash)) {
    const { primaryName } = await lookupPrimaryName(params.hash);
    cardName = primaryName;
  } else if (isCardName(params.hash)) {
    cardName = params.hash;
  }
  if (cardName) {
    const card = await lookupName(cardName);
    cardOwner = card.address;
    cardId = card.id;
    if (cardOwner) {
      cardDetails = await getCardDetails(cardId);
    }
  }
  const address = cardOwner ?? params.hash;
  const contract = await fetchContract(address);
  return <AddressContract hash={params.hash} contract={contract} />;
}
