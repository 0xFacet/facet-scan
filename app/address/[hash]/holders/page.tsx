import {
  fetchContract,
  getAddressToName,
  getTokenHolders,
  lookupName,
} from "@/utils/data";
import { Address } from "@/components/Address";
import { Table } from "@/components/Table";
import { Card } from "@/components/Card";
import { isCardName } from "@/lib/utils";
import { formatUnits } from "viem";
import { Pagination } from "@/components/pagination";

const ITEMS_PER_PAGE = 30;

export default async function Page({
  params,
  searchParams,
}: {
  params: { hash: string };
  searchParams: { [key: string]: string | undefined };
}) {
  let cardOwner;
  if (isCardName(params.hash)) {
    const card = await lookupName(params.hash);
    cardOwner = card.address;
  }
  const address = cardOwner ?? params.hash;
  const tokenHolders = await getTokenHolders(address);
  const contract = await fetchContract(address);
  const totalSupply = contract.current_state.totalSupply || 0;
  const decimals = contract.current_state.decimals || 0;
  const sortedTokenHolders = Object.keys(tokenHolders).sort(
    (a, b) => Number(tokenHolders[b]) - Number(tokenHolders[a])
  ) as `0x${string}`[];
  const page = searchParams.page ?? "1";
  const startIndex = (Number(page) - 1) * ITEMS_PER_PAGE;
  const addressToName = await getAddressToName(
    sortedTokenHolders
      .slice(startIndex, startIndex + ITEMS_PER_PAGE)
      .map((holder) => holder)
  );

  return (
    <>
      <Card>
        <Table
          headers={["Rank", "Address", "Percentage", "Balance"]}
          rows={[
            ...sortedTokenHolders
              .slice(startIndex, startIndex + ITEMS_PER_PAGE)
              .map((holder, index) => [
                `#${index + startIndex + 1}`,
                <Address
                  key={holder}
                  address={holder}
                  name={addressToName[holder]}
                />,
                `${(
                  (Number(tokenHolders[holder]) / Number(totalSupply)) *
                  100
                ).toLocaleString()}%`,
                Number(
                  formatUnits(BigInt(tokenHolders[holder]), decimals)
                ).toLocaleString(),
              ]),
          ]}
        />
        {!sortedTokenHolders?.length && <div className="py-4">No tokens</div>}
      </Card>
      <Pagination count={sortedTokenHolders.length} perPage={ITEMS_PER_PAGE} />
    </>
  );
}
