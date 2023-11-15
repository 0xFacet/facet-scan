"use client";

import { Button } from "@/components/Button";
import { Heading } from "@/components/Heading";
import { Modal } from "@/components/Modal";
import { NavLink } from "@/components/NavLink";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { DeployableContract } from "@/types/contracts";
import { parseTokenValue } from "@/utils/formatter";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toHex } from "viem";
import { useAccount, useSendTransaction, useWaitForTransaction } from "wagmi";
import { kebabCase, startCase } from "lodash";

interface Props {
  deployableContracts: DeployableContract[];
}

export default function Contracts({ deployableContracts }: Props) {
  const { openConnectModal } = useConnectModal();
  const { address, isDisconnected } = useAccount();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContract, setSelectedContract] =
    useState<DeployableContract | null>(null);
  const [constructorArgs, setConstructorArgs] = useState<{
    [key: string]: any;
  }>({});
  const searchParams = useSearchParams();
  const router = useRouter();
  const contractTypes = deployableContracts.map(({ name }) => name);
  const tab = searchParams.get("tab") ?? kebabCase(contractTypes[0] ?? "");

  const creationConstructorArgs =
    (selectedContract?.abi &&
      Object.keys(selectedContract.abi["constructor"]["args"])) ||
    [];

  const modifiedArgs: { [key: string]: any } = { ...constructorArgs };

  if (modifiedArgs.decimals) {
    for (let key in modifiedArgs) {
      modifiedArgs[key] = parseTokenValue(
        `${modifiedArgs[key]}`,
        modifiedArgs.decimals,
        key
      );
    }
  }

  const createContractData = {
    op: "create",
    data: {
      args: modifiedArgs,
      source_code: selectedContract?.source_code,
      init_code_hash: selectedContract?.init_code_hash,
    },
  };
  const createContractTx = useSendTransaction({
    to: "0x0000000000000000000000000000000000000000",
    data: toHex(
      `data:application/vnd.facet.tx+json;esip6=true,${JSON.stringify(
        createContractData
      )}`
    ),
  });
  const createContractWait = useWaitForTransaction({
    hash: createContractTx.data?.hash,
    confirmations: 1,
    onSuccess() {
      setShowCreateModal(false);
      setConstructorArgs({});
    },
  });

  const createLoading =
    createContractTx.isLoading ||
    createContractWait.isFetching ||
    createContractWait.isLoading;

  const createContract = async () => {
    try {
      if (selectedContract && address && !isDisconnected) {
        createContractTx.sendTransaction();
      } else if (openConnectModal) {
        openConnectModal();
      }
    } catch (e) {
      console.log(e);
    }
  };

  // const getTableRows = () => {
  //   const type = contractTypes.find((type) => kebabCase(type) === tab);
  //   if (!type) return [];
  //   return contracts.filter(
  //     (contract) => contract.current_state.contract_type === type
  //   );
  // };

  return (
    <div className="flex flex-col flex-1">
      <SectionContainer>
        <Section>
          <div className="flex flex-col p-0 md:p-8 gap-4 md:gap-8">
            <Heading>Dumb Contracts</Heading>
            <div className="text-xl">
              Dumb Contracts offers enhanced scalability and flexibility while
              reducing the constraints of on-chain gas fees and processing
              limitations.
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              Create Contract
            </Button>
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer>
        <Section className="py-0 sm:py-0">
          <div className="px-0 md:px-8 flex gap-8 items-center h-min-full">
            <div className="flex gap-8 h-min-full">
              {contractTypes.map((type) => (
                <NavLink
                  key={type}
                  href={`?tab=${kebabCase(type)}`}
                  isActive={tab === kebabCase(type)}
                  className="whitespace-nowrap"
                >
                  {startCase(type)}
                </NavLink>
              ))}
            </div>
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1">
        <Section className="flex-1">
          <div className="px-0 md:px-8">
            {/* <Table
              headers={["Contract Address"]}
              rows={getTableRows().map((row) => [
                <div
                  key={row.address}
                  className="max-w-[100px] sm:max-w-none truncate overflow-hidden"
                >
                  {row.address}
                </div>,
              ])}
              onRowClick={(rowIndex) =>
                router.push(`/contracts/${getTableRows()[rowIndex].address}`)
              }
            /> */}
          </div>
        </Section>
      </SectionContainer>
      <Modal
        show={contractTypes.length > 0 && showCreateModal}
        confirmText="Deploy Contract"
        title="Create New Contract"
        onClose={() => {
          setShowCreateModal(false);
        }}
        onConfirm={selectedContract ? createContract : undefined}
        loading={createLoading}
      >
        <label
          htmlFor="contract_type"
          className="block text-sm font-medium leading-6 mb-2"
        >
          Contract Type
        </label>
        <div className="mb-4">
          <select
            name="contract_type"
            id="contract_type"
            className="mt-2 block w-full rounded-none h-10 pl-3 pr-10 outline-none
                border-[1px] border-line bg-black focus:border-e-2 focus:border-primary sm:text-sm sm:leading-6"
            onChange={(e) =>
              setSelectedContract(
                deployableContracts.find(
                  ({ name }) => name === e.target.value
                ) || null
              )
            }
            value={selectedContract?.name}
          >
            <option value="">Select a Contract Type</option>
            {contractTypes.map((type) => (
              <option key={type} value={type}>
                {startCase(type)}
              </option>
            ))}
          </select>
        </div>
        {!!selectedContract && (
          <>
            <div className="border-t-[1px] border-line w-full my-6" />
            <div className="block text-sm font-medium leading-6 mb-2">
              Constructor Arguments
            </div>
            <div className="flex flex-col gap-4">
              {creationConstructorArgs.map((arg) => (
                <div key={arg}>
                  <label
                    className="block text-xs font-medium leading-6"
                    htmlFor={arg}
                  >
                    {startCase(arg)}
                  </label>
                  <input
                    id={arg}
                    type="text"
                    className="block w-full outline-none bg-black border-0 p-2 ring-1 ring-inset ring-line placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder={startCase(arg)}
                    name={arg}
                    onChange={(e) => {
                      setConstructorArgs({
                        ...constructorArgs,
                        [arg]: e.target.value,
                      });
                    }}
                    value={constructorArgs[arg]}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
