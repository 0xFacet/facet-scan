"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { WalletModal } from "@/components/wallet-modal";

type WalletModalContextType = {
  setShowWalletModal: (show: boolean) => void;
};

const WalletModalContext = createContext<WalletModalContextType | undefined>(
  undefined
);

export const useWalletModal = () => {
  const context = useContext(WalletModalContext);
  if (!context) {
    throw new Error("useWalletModal must be used within a WalletModalProvider");
  }
  return context;
};

type WalletModalProviderProps = {
  children: ReactNode;
};

export const WalletModalProvider: React.FC<WalletModalProviderProps> = ({
  children,
}) => {
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <WalletModalContext.Provider value={{ setShowWalletModal }}>
      {children}
      <WalletModal
        open={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </WalletModalContext.Provider>
  );
};
