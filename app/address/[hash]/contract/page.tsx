import { fetchCard, fetchContract } from "@/utils/data";
import AddressContract from "./AddressContract";
import { isCardName } from "@/lib/utils";

export default async function Page({ params }: { params: { hash: string } }) {
  let card;
  if (isCardName(params.hash)) {
    card = await fetchCard(params.hash);
  }
  const address = card ? card.owner : params.hash;
  const contract = await fetchContract(address);
  return <AddressContract hash={params.hash} contract={contract} />;
}
