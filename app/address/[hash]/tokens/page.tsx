import { isCardName } from "@/lib/utils";
import { formatEther, isAddress } from "viem";
import { getUsdPerEth } from "@/utils/usd";
import { lookupPrimaryName, getCardOwner } from "@/utils/facet/cards";
import { getTokenPrices, getFethBalance } from "@/utils/facet/tokens";
import { Card, Table } from "@0xfacet/component-library";
import { getPools } from "@/utils/facet/contracts";
import { Address } from "@/components/address";

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
  const pairs = await getPools(address);
  const fethContractAddress = "0x1673540243e793b0e77c038d4a88448eff524dce";
  const tokenBalances = Object.values(pairs)
    .filter((pair) => {
      const balance =
        pair.token0.address === fethContractAddress
          ? pair.user_balances?.token1
          : pair.user_balances?.token0;
      return !!Number(balance ?? 0);
    })
    .map((pair) => {
      let balance =
        pair.token0.address === fethContractAddress
          ? pair.user_balances?.token1
          : pair.user_balances?.token0;
      if (!balance) balance = "0";
      const token =
        pair.token0.address === fethContractAddress ? pair.token1 : pair.token0;
      return { ...token, balance };
    });

  const tokenPricesInEth = await getTokenPrices(
    tokenBalances.map((token) => token.address)
  );
  const fethBalance = await getFethBalance(address);

  const getEthValue = (token: {
    balance: string;
    address: `0x${string}`;
    name: string;
    symbol: string;
  }) =>
    BigInt(
      Math.round(
        Number(
          formatEther(
            BigInt(token.balance) *
              BigInt(
                tokenPricesInEth.find(
                  (price) => price.token_address === token.address
                )?.last_swap_price ?? "0"
              )
          )
        )
      )
    );

  const ethPrice = await getUsdPerEth();
  return (
    <>
      <Card childrenClassName="px-4">
        <Table
          headers={[
            "Token",
            "Balance",
            "Value (ETH)",
            "Value (USD)",
            "Contract Address",
          ]}
          rows={[
            ...(fethBalance > BigInt("0")
              ? [
                  [
                    "FETH",
                    Number(formatEther(BigInt(fethBalance))).toLocaleString(),
                    Number(formatEther(BigInt(fethBalance))).toLocaleString(),
                    Number(
                      formatEther(
                        BigInt(Math.round(ethPrice)) * BigInt(fethBalance)
                      )
                    ).toLocaleString(),
                    <Address
                      key="0x1673540243e793b0e77c038d4a88448eff524dce"
                      address="0x1673540243e793b0e77c038d4a88448eff524dce"
                    />,
                  ],
                ]
              : []),
            ...tokenBalances.map((token) => [
              token.symbol,
              Number(formatEther(BigInt(token.balance))).toLocaleString(),
              Number(formatEther(getEthValue(token))).toLocaleString(),
              Number(
                formatEther(BigInt(Math.round(ethPrice)) * getEthValue(token))
              ).toLocaleString(),
              <Address key={token.address} address={token.address} />,
            ]),
          ]}
        />
        {!tokenBalances.length && fethBalance == BigInt("0") && (
          <div className="py-4">No tokens</div>
        )}
      </Card>
    </>
  );
}
