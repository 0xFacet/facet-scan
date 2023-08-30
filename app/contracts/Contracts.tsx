"use client";

import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Heading } from "@/components/Heading";
import { Modal } from "@/components/Modal";
import { NavLink } from "@/components/NavLink";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { Table } from "@/components/Table";
import { Contract, ContractAbi } from "@/types/contracts";
import { formatTokenValue, parseTokenValue } from "@/utils/formatter";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { keccak256, toHex } from "viem";
import {
  useAccount,
  useBlockNumber,
  useSendTransaction,
  useWaitForTransaction,
} from "wagmi";
import { kebabCase, startCase } from "lodash";
import { Footer } from "@/components/Footer";

export default function Contracts() {
  const { data: latestBlockNumber } = useBlockNumber({ watch: true });
  const { openConnectModal } = useConnectModal();
  const { address, isDisconnected } = useAccount();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createContractType, setCreateContractType] = useState("");
  const [constructorArgs, setConstructorArgs] = useState<{
    [key: string]: any;
  }>({});
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractAbis, setContractAbis] = useState<{
    [key: string]: ContractAbi;
  }>({});
  const searchParams = useSearchParams();
  const router = useRouter();
  const contractTypes = (contractAbis && Object.keys(contractAbis)) || [];
  const tab =
    searchParams.get("tab") ??
    kebabCase(
      contractTypes.find((type) =>
        contracts.find(
          (contract) => contract.current_state.contract_type === type
        )
      ) ?? ""
    );

  useEffect(() => {
    if (latestBlockNumber) {
      (async () => {
        const contractsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts`
        );
        setContracts(contractsRes.data.result);
      })();

      (async () => {
        const contractsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts/deployable-contracts`
        );
        setContractAbis(contractsRes.data);
      })();
    }
  }, [latestBlockNumber]);

  const creationConstructorArgs =
    (contractAbis &&
      contractAbis[createContractType] &&
      Object.keys(contractAbis[createContractType]["constructor"]["args"])) ||
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

  const createContractSalt = keccak256(Buffer.from(`${Date.now()}`));
  const createContractData = {
    protocol: createContractType,
    constructorArgs: modifiedArgs,
    salt: createContractSalt,
  };
  const createContractTx = useSendTransaction({
    to: "0x0000000000000000000000000000000000000000",
    data: toHex(
      `data:application/vnd.esc.contract.deploy+json,${JSON.stringify(
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
      if (createContractType.length && address && !isDisconnected) {
        createContractTx.sendTransaction();
      } else if (openConnectModal) {
        openConnectModal();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getTableColumns = () => {
    const type = contractTypes.find((type) => kebabCase(type) === tab);
    if (!type) return [];
    const state = contracts.find(
      (contract) => contract.current_state.contract_type === type
    )?.current_state;
    if (!state) return [];
    const keys = Object.keys(state);
    return keys.filter(
      (key) =>
        (typeof state[key] === "number" || typeof state[key] === "string") &&
        kebabCase(key) !== "contract-type"
    );
  };

  const getTableRows = () => {
    const type = contractTypes.find((type) => kebabCase(type) === tab);
    if (!type) return [];
    return contracts.filter(
      (contract) => contract.current_state.contract_type === type
    );
  };

  return (
    <div className="min-h-[100vh] flex flex-col">
      <Header />
      <SectionContainer>
        <Section>
          <div className="flex flex-col p-0 md:p-8 gap-4 md:gap-8">
            <Heading>Dumb Contracts</Heading>
            <div className="text-xl">
              Dumb Contracts execute tasks off-chain, offering enhanced
              scalability and flexibility while reducing the constraints of
              on-chain gas fees and processing limitations.
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              Create Contract
            </Button>
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer>
        <Section className="py-0">
          <div className="px-0 md:px-8 flex gap-8 items-center h-min-full">
            <div className="flex gap-8 h-min-full">
              {contractTypes
                .filter(
                  (type) =>
                    !!contracts.find(
                      (contract) =>
                        contract.current_state.contract_type === type
                    )
                )
                .map((type) => (
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
            <Table
              headers={getTableColumns().map((key) => startCase(key))}
              rows={getTableRows().map((row) =>
                getTableColumns().map((column) => (
                  <div
                    key={`${row.contract_id}-${column}`}
                    className="max-w-[100px] sm:max-w-none truncate overflow-hidden"
                  >
                    {formatTokenValue(
                      row.current_state[column],
                      row.current_state.decimals ?? 0,
                      column,
                      true,
                      row.current_state.symbol
                    )}
                  </div>
                ))
              )}
              onRowClick={(rowIndex) =>
                router.push(
                  `/contracts/${getTableRows()[rowIndex].contract_id}`
                )
              }
            />
          </div>
        </Section>
      </SectionContainer>
      <Footer />
      <Modal
        show={contractTypes.length > 0 && showCreateModal}
        confirmText="Deploy Contract"
        title="Create New Contract"
        onClose={() => {
          setShowCreateModal(false);
        }}
        onConfirm={createContractType.length ? createContract : undefined}
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
            onChange={(e) => setCreateContractType(e.target.value)}
            value={createContractType}
          >
            <option value="">Select a Contract Type</option>
            {contractTypes.map((type) => (
              <option key={type} value={type}>
                {startCase(type)}
              </option>
            ))}
          </select>
        </div>
        {!!createContractType.length && (
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
