import { CopyText } from "@/components/CopyText";
import { Heading } from "@/components/Heading";
import { NavLink } from "@/components/NavLink";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { isCardName } from "@/lib/utils";
import {
  fetchContract,
  getCardDetails,
  lookupName,
  lookupPrimaryName,
} from "@/utils/data";
import { isAddress } from "viem";
import { Button } from "@/components/ui/button";
import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { truncateMiddle } from "@/utils/formatter";

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
    cardOwner = card.address;
    cardId = card.id;
    if (cardOwner) {
      cardDetails = await getCardDetails(cardId);
    }
  }

  const address = cardOwner ?? params.hash;
  const contract = await fetchContract(address);
  return (
    <div className="flex flex-col flex-1">
      <SectionContainer>
        <Section>
          <div className="py-4">
            {cardDetails ? (
              <div className="flex flex-1 flex-col items-center sm:items-start gap-4">
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
                <div className="flex flex-col items-center sm:items-start gap-1">
                  <Heading size="h2">
                    {cardDetails.displayName
                      ? cardDetails.displayName
                      : cardName}
                  </Heading>
                  {!!cardDetails.bio && (
                    <div className="w-fit text-accent">{cardDetails.bio}</div>
                  )}
                </div>
                {!!cardDetails.links.length && (
                  <div className="flex flex-wrap justify-center gap-4">
                    {cardDetails.links.map((link: string) => (
                      <Link href={link} target="_blank">
                        <Button variant="outline">
                          <div className="flex items-center gap-2">
                            {link.split("://")[1] ?? link}
                            <OpenInNewWindowIcon />
                          </div>
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap justify-center gap-4 w-fit text-accent">
                  <CopyText
                    text={address}
                    title={truncateMiddle(address, 8, 8)}
                  />
                  <CopyText text={`fac.et/${cardName}`} />
                </div>
              </div>
            ) : (
              <>
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
              </>
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
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1">
        <Section className="flex-1">{children}</Section>
      </SectionContainer>
    </div>
  );
}
