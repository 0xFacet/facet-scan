"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import {
  trustWallet,
  ledgerWallet,
  okxWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const targetNetworkName =
  (process.env.NEXT_PUBLIC_NETWORK as "mainnet" | "goerli" | undefined) ??
  "mainnet";

export const targetNetwork = { mainnet, goerli }[targetNetworkName];

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [targetNetwork],
  [publicProvider()]
);

const projectId = "174129d09efd705c1f5e32b53891075d";

const { wallets } = getDefaultWallets({
  appName: "FacetScan",
  projectId,
  chains,
});

const demoAppInfo = {
  appName: "FacetScan",
};

const connectors = connectorsForWallets([
  {
    groupName: "Popular",
    wallets: [...wallets[0].wallets, okxWallet({ projectId, chains })],
  },
  {
    groupName: "Other",
    wallets: [
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        appInfo={demoAppInfo}
        theme={darkTheme()}
      >
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
