import { fetchDeployableContracts } from "@/utils/data";
import Contracts from "./Contracts";

export default async function Page() {
  const deployableContracts = await fetchDeployableContracts();

  return <Contracts deployableContracts={deployableContracts} />;
}
