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
import { mainnet, goerli, sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { ToastProvider } from "@/contexts/toast-context";
import { rainbowkitTheme } from "./rainbowkit-theme";

const targetNetworkName =
  (process.env.NEXT_PUBLIC_NETWORK as "mainnet" | "goerli" | "sepolia" | undefined) ??
  "mainnet";

export const targetNetwork = { mainnet, goerli, sepolia }[targetNetworkName];

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
    wallets: [okxWallet({ projectId, chains }), ...wallets[0].wallets],
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
        theme={rainbowkitTheme}
      >
        <ToastProvider>{mounted && children}</ToastProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
