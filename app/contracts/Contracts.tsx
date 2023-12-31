"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/Heading";
import { Modal } from "@/components/Modal";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { Contract, ContractArtifact } from "@/types/contracts";
import {
  formatTimestamp,
  isJsonArray,
  parseTokenValue,
  truncateMiddle,
} from "@/utils/formatter";
import { ChangeEvent, useEffect, useState } from "react";
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
import { useToast } from "@/contexts/toast-context";
import {
  sendFacetCreate,
  waitForTransactionResult,
} from "@/utils/facet-transactions";

interface Props {
  contractArtifacts: ContractArtifact[];
  contracts: Contract[];
  totalContracts: number;
  addressToName: {
    [key: `0x${string}`]: string;
  };
}

export default function Contracts({
  contractArtifacts,
  contracts,
  totalContracts,
  addressToName,
}: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContract, setSelectedContract] =
    useState<ContractArtifact | null>(null);
  const [constructorArgs, setConstructorArgs] = useState<{
    [key: string]: any;
  }>({});
  const contractTypes = contractArtifacts.map(({ name }) => name);
  const { showToast } = useToast();

  const creationConstructorArgs =
    (selectedContract?.abi &&
      (selectedContract.abi.find((method) => method.type === "constructor")
        ?.inputs ??
        [])) ||
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

  useEffect(() => {
    if (!showCreateModal) {
      setConstructorArgs({});
    }
  }, [showCreateModal]);

  const createContract = async () => {
    try {
      if (!selectedContract) throw "No contract selected";
      const txn = await sendFacetCreate(
        selectedContract.source_code,
        selectedContract.init_code_hash,
        modifiedArgs
      );
      showToast({
        message: `Transaction pending (${truncateMiddle(txn.hash, 8, 8)})`,
        type: "info",
      });
      const receipt = await waitForTransactionResult(txn.hash);
      if (receipt) {
        if (receipt.status === "success") {
          showToast({
            message: `Transaction succeeded (${truncateMiddle(
              receipt.transaction_hash,
              8,
              8
            )})`,
            type: "success",
          });
        } else {
          showToast({
            message: `Transaction failed (${truncateMiddle(
              receipt.transaction_hash,
              8,
              8
            )})`,
            type: "error",
          });
        }
      }
      setShowCreateModal(false);
    } catch (e) {
      if (
        !`${e}`.includes("TransactionExecutionError: User rejected the request")
      ) {
        showToast({
          message: `${e}`,
          type: "error",
        });
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue = value;

    if (isJsonArray(value)) {
      parsedValue = JSON.parse(value);
    }

    setConstructorArgs({
      ...constructorArgs,
      [name]: parsedValue,
    });
  };

  return (
    <div className="flex flex-col flex-1">
      <SectionContainer className="bg-[url(/card-bg.svg)] bg-no-repeat bg-cover xl:bg-[length:1536px] bg-center border-none">
        <Section>
          <div className="flex flex-col py-0 md:py-16 gap-4 md:gap-8">
            <Heading>Contracts</Heading>
            <div className="text-lg text-accent">
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
                <Address key={row.address} address={row.address} />,
                row.current_type,
                row.deployment_transaction?.from ? (
                  <Address
                    key={row.address}
                    address={row.deployment_transaction.from}
                    name={addressToName[row.deployment_transaction.from]}
                  />
                ) : null,
                <Link
                  key={row.transaction_hash}
                  href={`/tx/${row.transaction_hash}`}
                >
                  {truncateMiddle(row.transaction_hash, 8, 8)}
                </Link>,
                row.deployment_transaction?.block_timestamp
                  ? formatTimestamp(
                      new Date(
                        Number(row.deployment_transaction?.block_timestamp) *
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
                {contractTypes
                  .filter((type) => type !== "NameRegistry")
                  .map((type) => (
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
                <div key={arg.name} className="space-y-2">
                  <Label htmlFor={arg.name}>
                    {arg.name} ({arg.type})
                  </Label>
                  <Input
                    id={arg.name}
                    placeholder={`${arg.name} (${arg.type})`}
                    name={arg.name}
                    onChange={handleChange}
                    value={`${
                      (Array.isArray(constructorArgs[arg.name])
                        ? JSON.stringify(constructorArgs[arg.name])
                        : constructorArgs[arg.name]) ?? ""
                    }`}
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
