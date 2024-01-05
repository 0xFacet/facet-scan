import {
  fetchContractArtifacts,
  fetchContracts,
  getAddressToName,
} from "@/utils/data";
import Contracts from "./Contracts";
import { flatten } from "lodash";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const contractArtifacts = await fetchContractArtifacts();
  const { contracts, count } = await fetchContracts({
    page: searchParams.page ? Number(searchParams.page) : 1,
  });
  const addressToName = await getAddressToName(
    contracts
      .map((txn) => txn.deployment_transaction?.from)
      .filter((address) => !!address) as `0x${string}`[]
  );

  return (
    <Contracts
      contractArtifacts={contractArtifacts}
      contracts={contracts}
      totalContracts={count}
      addressToName={addressToName}
    />
  );
}
