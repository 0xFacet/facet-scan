import { isCardName } from "@/lib/utils";
import { formatEther, isAddress } from "viem";
import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { truncateMiddle } from "@/utils/formatter";
import {
  IoEllipsisHorizontal,
  IoShareOutline,
  IoWalletOutline,
} from "react-icons/io5";
import {
  lookupPrimaryName,
  lookupName,
  getCardDetails,
  getCardOwner,
} from "@/utils/facet/cards";
import { fetchContract, getPools } from "@/utils/facet/contracts";
import { getTokenPrices, getFethBalance } from "@/utils/facet/tokens";
import {
  SectionContainer,
  Section,
  Heading,
  Button,
  CopyText,
  NavLink,
} from "@0xfacet/component-library";
import { getUsdPerEth } from "@/utils/usd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@0xfacet/component-library/ui";

export default async function AddressLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { hash: string };
}) {
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
    cardOwner = await getCardOwner(cardName);
    cardId = card.id;
    if (cardOwner) {
      cardDetails = await getCardDetails(cardId);
    }
  }
  const address = cardOwner ?? params.hash;
  const contract = await fetchContract(address);
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

  const totalEth = tokenBalances.reduce(
    (previous, current) =>
      previous +
      BigInt(
        Math.round(
          Number(
            formatEther(
              BigInt(current.balance) *
                BigInt(
                  tokenPricesInEth.find(
                    (price) => price.token_address === current.address
                  )?.last_swap_price ?? "0"
                )
            )
          )
        )
      ),
    BigInt(fethBalance ?? 0)
  );
  const ethPrice = await getUsdPerEth();
  const totalValue = Number(
    formatEther(BigInt(Math.round(ethPrice)) * totalEth)
  );

  const hasBalanceOf =
    !!contract?.current_state?.balanceOf ||
    !!contract?.current_state?._balanceOf;

  return (
    <div className="flex flex-1 flex-col divide-y divide-line">
      <SectionContainer>
        <Section>
          <div className="py-4">
            {cardDetails ? (
              <div className="flex flex-1 flex-col items-center justify-between gap-4 sm:items-start sm:flex-row">
                <div className="flex flex-col gap-6 items-center sm:flex-row">
                  {!!cardDetails.imageURI && (
                    <img
                      src={cardDetails.imageURI}
                      className="h-28 w-28 rounded-full"
                      style={{
                        border: "1px solid rgba(255,255,255,0.5)",
                        imageRendering: "pixelated",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div className="flex flex-col gap-2 items-center sm:items-start">
                    <div className="flex flex-col gap-1 items-center sm:items-start">
                      <Heading size="h2" className="text-center">
                        {cardDetails.displayName
                          ? cardDetails.displayName
                          : cardName}
                      </Heading>
                      {!!cardDetails.bio && (
                        <div className="w-fit text-accent text-center">
                          {cardDetails.bio}
                        </div>
                      )}
                    </div>
                    {totalValue > 0 && (
                      <Link href={`/address/${params.hash}/tokens`}>
                        <div className="flex gap-2 items-center">
                          <IoWalletOutline />
                          <Heading size="h5">
                            ${totalValue.toLocaleString()} USD
                          </Heading>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  {!!cardDetails?.links?.length && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <IoEllipsisHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-black">
                        {cardDetails.links.map((link: string) => (
                          <Link key={link} href={link} target="_blank">
                            <DropdownMenuItem>
                              <div className="flex flex-1 items-center justify-between gap-2">
                                {link.split("://")[1] ?? link}
                                <OpenInNewWindowIcon />
                              </div>
                            </DropdownMenuItem>
                          </Link>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <IoShareOutline className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-black">
                      <DropdownMenuItem>
                        <CopyText
                          text={address}
                          title={truncateMiddle(address, 8, 8)}
                        />
                      </DropdownMenuItem>
                      {!!cardDetails && (
                        <DropdownMenuItem>
                          <CopyText text={`fac.et/${cardName}`} />
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ) : (
              <div>
                {cardOwner ? (
                  <Heading size="h2">{params.hash}</Heading>
                ) : (
                  <Heading size="h2">
                    {!!contract ? "Contract" : "Address"}
                  </Heading>
                )}
                <div className="w-fit mt-1 text-accent">
                  <CopyText text={address} />
                </div>
              </div>
            )}
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer>
        <Section className="py-0 sm:py-0">
          <div className="flex gap-4">
            <NavLink
              href={`/address/${params.hash}`}
              className="whitespace-nowrap"
            >
              Transactions
            </NavLink>
            <NavLink
              href={`/address/${params.hash}/internal`}
              className="whitespace-nowrap"
            >
              Internal Transactions
            </NavLink>
            {!!contract?.current_init_code_hash && (
              <NavLink
                href={`/address/${params.hash}/contract`}
                className="whitespace-nowrap"
              >
                Contract
              </NavLink>
            )}
            {totalValue > 0 && (
              <NavLink
                href={`/address/${params.hash}/tokens`}
                className="whitespace-nowrap"
              >
                Tokens
              </NavLink>
            )}
            {hasBalanceOf && (
              <NavLink
                href={`/address/${params.hash}/holders`}
                className="whitespace-nowrap"
              >
                Holders
              </NavLink>
            )}
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1">
        <Section className="flex-1">{children}</Section>
      </SectionContainer>
    </div>
  );
}
