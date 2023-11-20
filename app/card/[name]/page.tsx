import { fetchCard } from "@/utils/data";
import { List } from "@/components/List";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { truncateMiddle } from "@/utils/formatter";
import { HiOutlineClock } from "react-icons/hi2";
import { Card } from "@/components/Card";

export default async function Page({ params }: { params: { name: string } }) {
  const card = await fetchCard(params.name);

  return (
    <div className="flex flex-col flex-1">
      <SectionContainer>
        <Section>
          <div className="py-4">
            <Heading size="h2">Card</Heading>
            <div className="w-fit mt-1 text-accent">{card.name}</div>
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1">
        <Section className="flex-1">
          <Card>
            <List
              items={[
                {
                  label: "ID",
                  value: card.id,
                },
                {
                  label: "Name",
                  value: card.name,
                },
                {
                  label: "Owner",
                  value: (
                    <Link key={card.id} href={`/address/${card.owner}`}>
                      {truncateMiddle(card.owner, 8, 8)}
                    </Link>
                  ),
                },
                {
                  label: "Duration",
                  value: (
                    <div className="flex items-center gap-1">
                      <HiOutlineClock className="text-xl" />
                      {formatDistanceToNow(
                        new Date(Number(card.duration) * 1000 + Date.now())
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Section>
      </SectionContainer>
    </div>
  );
}
