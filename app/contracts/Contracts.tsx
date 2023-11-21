"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/Heading";
import { Modal } from "@/components/Modal";
import { NavLink } from "@/components/NavLink";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { Contract, ContractArtifact } from "@/types/contracts";
import {
  formatTimestamp,
  parseTokenValue,
  truncateMiddle,
} from "@/utils/formatter";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toHex } from "viem";
import { useAccount, useSendTransaction, useWaitForTransaction } from "wagmi";
import { kebabCase, startCase } from "lodash";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/Table";
import { Pagination } from "@/components/pagination";
import { Address } from "@/components/Address";
import Link from "next/link";
import { Card } from "@/components/Card";

interface Props {
  contractArtifacts: ContractArtifact[];
  contracts: Contract[];
  totalContracts: number;
}

export default function Contracts({
  contractArtifacts,
  contracts,
  totalContracts,
}: Props) {
  const { openConnectModal } = useConnectModal();
  const { address, isDisconnected } = useAccount();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContract, setSelectedContract] =
    useState<ContractArtifact | null>(null);
  const [constructorArgs, setConstructorArgs] = useState<{
    [key: string]: any;
  }>({});
  const searchParams = useSearchParams();
  const router = useRouter();
  const contractTypes = contractArtifacts.map(({ name }) => name);
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
      `data:application/vnd.facet.tx+json;rule=esip6,${JSON.stringify(
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

  return (
    <div className="flex flex-col flex-1">
      <SectionContainer className="bg-[url(/card-bg.svg)] bg-no-repeat bg-cover xl:bg-[length:1536px] bg-center border-none">
        <Section>
          <div className="flex flex-col py-0 md:py-16 gap-4 md:gap-8">
            <Heading>Contracts</Heading>
            <div className="text-xl">
              Contracts offers enhanced scalability and flexibility while
              reducing the constraints of on-chain gas fees and processing
              limitations.
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="w-fit">
              Create Contract
            </Button>
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1 border-t">
        <Section className="flex-1">
          <Card>
            <Table
              headers={[
                "Contract Address",
                "Contract Type",
                "Deployer",
                "Deployment Txn",
                "Age",
              ]}
              rows={contracts.map((row) => [
                <Address address={row.address} key={row.address} />,
                row.current_type,
                <Link
                  key={row.transaction_hash}
                  href={`/address/${row.deployment_transaction.from}`}
                >
                  {truncateMiddle(row.deployment_transaction.from, 8, 8)}
                </Link>,
                <Link
                  key={row.transaction_hash}
                  href={`/tx/${row.transaction_hash}`}
                >
                  {truncateMiddle(row.transaction_hash, 8, 8)}
                </Link>,
                row.deployment_transaction.block_timestamp
                  ? formatTimestamp(
                      new Date(
                        Number(row.deployment_transaction.block_timestamp) *
                          1000
                      )
                    )
                  : "--",
              ])}
            />
            {!contracts.length && (
              <div className="py-4">No contracts found</div>
            )}
          </Card>
          <Pagination count={totalContracts} />
        </Section>
      </SectionContainer>
      <Modal
        open={contractTypes.length > 0 && showCreateModal}
        onOpenChange={(open) => setShowCreateModal(open)}
        confirmText="Deploy Contract"
        title="Create New Contract"
        onCancel={() => {
          setShowCreateModal(false);
        }}
        onConfirm={selectedContract ? createContract : undefined}
        loading={createLoading}
      >
        <div className="space-y-2 relative">
          <Label>Contract Type</Label>
          <Select
            onValueChange={(value) =>
              setSelectedContract(
                contractArtifacts.find(({ name }) => name === value) || null
              )
            }
            value={selectedContract?.name ?? "-"}
          >
            <SelectTrigger className="relative w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="absolute z-[1000] py-1 mt-1 bg-black rounded-md shadow-lg max-h-60 overflow-auto">
              <SelectGroup>
                <SelectItem value="-">Select a Contract Type</SelectItem>
                {contractTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {!!selectedContract && !!creationConstructorArgs.length && (
          <>
            <div className="border-t-[1px] border-line w-full my-6" />
            <div className="block text-sm font-medium leading-6 mb-2">
              Constructor Arguments
            </div>
            <div className="flex flex-col gap-4">
              {creationConstructorArgs.map((arg) => (
                <div key={arg} className="space-y-2">
                  <Label htmlFor={arg}>{startCase(arg)}</Label>
                  <Input
                    id={arg}
                    placeholder={startCase(arg)}
                    name={arg}
                    onChange={(e) => {
                      setConstructorArgs({
                        ...constructorArgs,
                        [arg]: e.target.value,
                      });
                    }}
                    value={constructorArgs[arg]}
                    type="text"
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
