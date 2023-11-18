import { fetchContractArtifacts, fetchContracts } from "@/utils/data";
import Contracts from "./Contracts";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const contractArtifacts = await fetchContractArtifacts();

  const { contracts, count } = await fetchContracts({
    page: searchParams.page ? Number(searchParams.page) : 1,
  });

  return (
    <Contracts
      contractArtifacts={contractArtifacts}
      contracts={contracts}
      totalContracts={count}
    />
  );
}
