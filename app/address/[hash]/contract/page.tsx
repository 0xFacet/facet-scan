import { fetchCard, fetchContract } from "@/utils/data";
import AddressContract from "./AddressContract";
import { isCardName } from "@/lib/utils";

export default async function Page({ params }: { params: { hash: string } }) {
  let cardOwner;
  if (isCardName(params.hash)) {
    cardOwner = await fetchCard(params.hash);
  }
  const address = cardOwner ?? params.hash;
  const contract = await fetchContract(address);
  return <AddressContract hash={params.hash} contract={contract} />;
}
