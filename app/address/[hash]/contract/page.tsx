import { fetchContract } from "@/utils/data";
import AddressContract from "./AddressContract";

export default async function Page({ params }: { params: { hash: string } }) {
  const contract = await fetchContract(params.hash);
  return <AddressContract hash={params.hash} contract={contract} />;
}
