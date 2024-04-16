"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  trustWallet,
  ledgerWallet,
  okxWallet,
  tokenPocketWallet,
  coinbaseWallet,
  metaMaskWallet,
  walletConnectWallet,
  gateWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http, WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { ToastProvider } from "@/contexts/toast-context";
import { rainbowkitTheme } from "./rainbowkit-theme";
import { WalletModalProvider } from "@/contexts/wallet-modal-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const targetNetworkName =
  (process.env.NEXT_PUBLIC_NETWORK as "mainnet" | "sepolia" | undefined) ??
  "mainnet";

export const targetNetwork = { mainnet, sepolia }[targetNetworkName];

const projectId = "20caa1a70b33e26ff511865a7993d1d0";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [okxWallet, coinbaseWallet, metaMaskWallet, walletConnectWallet],
    },
    {
      groupName: "Other",
      wallets: [tokenPocketWallet, gateWallet, trustWallet, ledgerWallet],
    },
  ],
  {
    appName: "Facet Scan",
    projectId,
  }
);

export const wagmiConfig = createConfig({
  chains: [targetNetwork],
  connectors,
  transports: {
    [mainnet.id]: http("https://ethereum-rpc.publicnode.com"),
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
  },
  ssr: true,
});

export const isSupportedChain = (chainId: number) =>
  targetNetwork.id === chainId;

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowkitTheme}>
          <ToastProvider>
            <WalletModalProvider>{mounted && children}</WalletModalProvider>
          </ToastProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
