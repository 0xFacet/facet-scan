"use client";

import { Contract, ContractArtifact } from "@/types/contracts";
import {
  formatTimestamp,
  isJsonArray,
  truncateMiddle,
} from "@/utils/formatter";
import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/contexts/toast-context";
import {
  sendFacetCreate,
  waitForTransactionResult,
} from "@/utils/facet/helpers";
import {
  SectionContainer,
  Section,
  Heading,
  Button,
  Card,
  Table,
  Pagination,
  Modal,
} from "@0xfacet/component-library";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@0xfacet/component-library/ui";
import { Address } from "@/components/address";

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

  useEffect(() => {
    if (!showCreateModal) {
      setConstructorArgs({});
    }
  }, [showCreateModal]);

  const createContract = async () => {
    try {
      if (!selectedContract) throw "No contract selected";
      const txn = await sendFacetCreate(
        constructorArgs,
        selectedContract.init_code_hash,
        selectedContract.source_code
      );
      showToast({
        message: `Transaction pending (${truncateMiddle(txn, 8, 8)})`,
        type: "info",
      });
      const receipt = await waitForTransactionResult(txn);
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
    <div className="flex flex-1 flex-col divide-y divide-line">
      <SectionContainer className="bg-[url(/halftone_1.svg)] bg-no-repeat bg-[length:1536px] xl:bg-cover bg-center border-none">
        <Section>
          <div className="flex flex-col py-0 md:py-16 gap-4 md:gap-8">
            <Heading>Contracts</Heading>
            <Button onClick={() => setShowCreateModal(true)} className="w-fit">
              Create Contract
            </Button>
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1">
        <Section className="flex-1">
          <Card childrenClassName="px-4">
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
                      ).toISOString()
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
