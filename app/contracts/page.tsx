import { fetchContractArtifacts, fetchContracts } from "@/utils/data";
import Contracts from "./Contracts";
import { kebabCase } from "lodash";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const contractArtifacts = await fetchContractArtifacts();

  let hash = searchParams.tab
    ? contractArtifacts.find(
        (artifact) =>
          kebabCase(artifact.name) === kebabCase(`${searchParams.tab}`)
      )?.init_code_hash
    : contractArtifacts[0].init_code_hash;

  const { contracts, count } = await fetchContracts({
    hash: hash,
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
