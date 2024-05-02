import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const publicClient = createPublicClient({
  chain: mainnet,
  transport:
    process.env.NEXT_PUBLIC_NETWORK === "mainnet"
      ? http("https://ethereum-rpc.publicnode.com")
      : http("https://ethereum-sepolia-rpc.publicnode.com"),
});

export const getUsdPerEth = async () => {
  if (process.env.NEXT_PUBLIC_NETWORK != 'mainnet') {
    return 0;
  }
  
  const usdContractRead = (await publicClient.readContract({
    address: "0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f",
    abi: reservesABI,
    functionName: "getReserves",
  })) as BigInt[];

  if (usdContractRead?.length) {
    const res = usdContractRead;
    const usdPerEth =
      res && parseFloat(res[0].toString()) / parseFloat(res[1].toString());

    return usdPerEth;
  }
  return 0;
};

const reservesABI = [
  {
    inputs: [],
    name: "getReserves",
    outputs: [
      {
        internalType: "uint112",
        name: "_reserve0",
        type: "uint112",
      },
      {
        internalType: "uint112",
        name: "_reserve1",
        type: "uint112",
      },
      {
        internalType: "uint32",
        name: "_blockTimestampLast",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
