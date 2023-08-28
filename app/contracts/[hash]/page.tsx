import Contract from "./Contract";

function Page({ params }: { params: { hash: string } }) {
  return <Contract hash={params.hash} />;
}

export default Page;
