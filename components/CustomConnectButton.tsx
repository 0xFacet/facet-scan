import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSwitchNetwork } from "wagmi";
import { targetNetwork } from "@/app/providers";
import { BlockieAvatar } from "./BlockieAvatar";
import { Button } from "./ui/button";
import { IoWalletOutline } from "react-icons/io5";

export const CustomConnectButton = () => {
  const { switchNetwork } = useSwitchNetwork();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={openConnectModal}
                  >
                    <IoWalletOutline className="h-5 w-5" />
                    <span className="sr-only">Connect wallet</span>
                  </Button>
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return (
                  <Button
                    onClick={() => switchNetwork?.(targetNetwork.id)}
                    variant="outline"
                  >
                    Switch to {targetNetwork.name}
                  </Button>
                );
              }

              return (
                <div className="flex justify-end items-center text-white">
                  <div className="flex justify-center items-center border-1 rounded-md">
                    <div className="cursor-pointer" onClick={openAccountModal}>
                      <BlockieAvatar
                        address={account.address}
                        size={24}
                        ensImage={account.ensAvatar}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
