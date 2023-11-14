import Contract from "./Contract";

export default function Page({ params }: { params: { hash: string } }) {
  return <Contract hash={params.hash} />;
}
