import { Button } from "./Button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BiWalletAlt } from "react-icons/bi";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import { HiArrowLeftOnRectangle, HiArrowsRightLeft } from "react-icons/hi2";
import { targetNetwork } from "@/app/providers";
import { BlockieAvatar } from "./BlockieAvatar";

export const CustomConnectButton = () => {
  const { disconnect } = useDisconnect();
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
                  <BiWalletAlt
                    onClick={openConnectModal}
                    className="cursor-pointer text-secondary hover:text-primary"
                    size={24}
                  />
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return (
                  <Button onClick={() => switchNetwork?.(targetNetwork.id)}>
                    <span>Switch to {targetNetwork.name}</span>
                  </Button>
                );
              }

              return (
                <div className="flex justify-end items-center text-white">
                  <div className="flex justify-center items-center border-1 rounded-md">
                    <div className="flex flex-col items-center mr-1">
                      {/* <Balance address={account.address} className="min-h-0 h-auto" /> */}
                      {/* <span className="text-xs" style={{ color: networkColor }}>
                        {chain.name}
                      </span> */}
                    </div>
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
