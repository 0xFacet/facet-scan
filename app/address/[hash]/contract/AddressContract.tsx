"use client";

import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Contract, ContractABI, ContractFunction } from "@/types/contracts";
import {
  formatTokenValue,
  isJsonArray,
  parseTokenValue,
  truncateMiddle,
} from "@/utils/formatter";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { isAddress } from "viem";
import { startCase } from "lodash";
import SyntaxHighlighter from "react-syntax-highlighter";
import { stackoverflowDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Address } from "@/components/Address";
import { List } from "@/components/List";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/contexts/toast-context";
import { Transaction } from "@/types/blocks";
import { Card } from "@/components/Card";
import { sendStaticCall } from "@/utils/data";
import {
  sendFacetCall,
  waitForTransactionResult,
} from "@/utils/facet-transactions";

interface Props {
  hash: string;
  contract?: Contract;
}

export default function WalletAddress({ hash, contract }: Props) {
  const [methodValues, setMethodValues] = useState<{
    [key: string]: { [key: string]: string };
  }>({});
  const [methodLoading, setMethodLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [simulationResults, setSimulationResults] = useState<{
    [key: string]: Transaction | null;
  }>({});
  const [staticCallResults, setStaticCallResults] = useState<{
    [key: string]: any;
  }>({});
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "details";
  const { showToast } = useToast();

  const readMethods = useMemo(
    () =>
      (contract
        ? contract.abi.filter(
            (item) =>
              item.type === "function" &&
              item.visibility === "public" &&
              (item.stateMutability === "view" ||
                item.stateMutability === "pure")
          )
        : []) as unknown as ContractFunction[],
    [contract]
  );

  const writeMethods = useMemo(
    () =>
      (contract
        ? contract.abi.filter(
            (item) =>
              item.type === "function" &&
              item.visibility === "public" &&
              item.stateMutability === "non_payable"
          )
        : []) as unknown as ContractFunction[],
    [contract]
  );

  const staticCall = async (name: string) => {
    setStaticCallResults((results) => ({ ...results, [name]: null }));
    const result = await sendStaticCall(hash, name, methodValues[name]);
    setStaticCallResults((results) => ({
      ...results,
      [name]: result,
    }));
  };

  const callMethod = async (name: string) => {
    const contractFunction = contract?.abi.find(
      (contractFunction) =>
        contractFunction.type === "function" && contractFunction.name === name
    );
    if (
      contractFunction?.stateMutability == "view" ||
      contractFunction?.stateMutability == "pure"
    ) {
      return staticCall(name);
    }
    setMethodLoading((loading) => ({ ...loading, [name]: true }));
    setSimulationResults((results) => ({ ...results, [name]: null }));
    try {
      const txn = await sendFacetCall(hash, name, methodValues[name]);
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
    setMethodLoading((loading) => ({ ...loading, [name]: false }));
  };

  const renderStateDetails = () => {
    const contractState = contract?.current_state
      ? Object.keys(contract.current_state)
      : [];
    return contract ? (
      <List
        items={contractState
          .filter(
            (key) =>
              typeof contract.current_state[key] === "string" ||
              typeof contract.current_state[key] === "number"
          )
          .map((key) =>
            isAddress(contract.current_state[key])
              ? {
                  label: startCase(key),
                  value: (
                    <Address key={key} address={contract.current_state[key]} />
                  ),
                }
              : {
                  label: startCase(key),
                  value: (
                    <div
                      key={key}
                      className="max-w-full text-ellipsis overflow-hidden"
                    >
                      {formatTokenValue(
                        contract.current_state[key],
                        contract.current_state["decimals"] ?? 0,
                        key,
                        true,
                        contract.current_state.symbol
                      )}
                    </div>
                  ),
                }
          )}
      />
    ) : null;
  };

  const handleChange = (method: string, argName: string, value: string) => {
    let parsedValue = value;
    if (isJsonArray(value)) {
      parsedValue = JSON.parse(value);
    }

    setMethodValues((prevValues) => ({
      ...prevValues,
      [method]: {
        ...prevValues[method],
        [argName]: parsedValue,
      },
    }));
  };

  const renderMethods = (methods: ContractABI) => {
    return contract ? (
      <Accordion className="w-full" collapsible type="single">
        {methods
          .filter((method) => method.type === "function")
          .map((method) =>
            method.type === "function" ? (
              <AccordionItem key={method.name} value={method.name}>
                <AccordionTrigger>{method.name}</AccordionTrigger>
                <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 space-y-4">
                  {(method.inputs ?? {}).map((arg) =>
                    arg.name ? (
                      <div key={arg.name} className="space-y-2">
                        <Label htmlFor={arg.name}>
                          {arg.name} ({arg.type})
                        </Label>
                        <Input
                          id={arg.name}
                          placeholder={`${arg.name} (${arg.type})`}
                          name={arg.name}
                          onChange={(e) =>
                            handleChange(
                              method.name,
                              arg.name,
                              parseTokenValue(
                                e.target.value,
                                contract.current_state.decimals ?? 0,
                                arg.name
                              )
                            )
                          }
                          value={
                            Array.isArray(methodValues[method.name]?.[arg.name])
                              ? JSON.stringify(
                                  methodValues[method.name][arg.name]
                                )
                              : formatTokenValue(
                                  methodValues[method.name]?.[arg.name],
                                  contract.current_state.decimals ?? 0,
                                  arg.name
                                ) ?? ""
                          }
                          type="text"
                        />
                      </div>
                    ) : null
                  )}
                  <Button
                    onClick={() => callMethod(method.name)}
                    disabled={methodLoading[method.name]}
                    variant="outline"
                    className="w-fit"
                  >
                    Call
                  </Button>
                  {!!simulationResults[method.name]?.error?.message && (
                    <div className="font-mono text-sm pl-3 border-l-4 border-red-300">
                      {simulationResults[method.name]?.error?.message}
                    </div>
                  )}
                  {staticCallResults[method.name] !== null &&
                    staticCallResults[method.name] !== undefined && (
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium leading-6">
                          Result:
                        </div>
                        <div className="text-sm break-all">
                          {typeof staticCallResults[method.name] == "object"
                            ? JSON.stringify(staticCallResults[method.name])
                            : formatTokenValue(
                                staticCallResults[method.name],
                                contract.current_state.decimals ?? 0,
                                method.name,
                                false,
                                contract.current_state.symbol
                              )}
                        </div>
                      </div>
                    )}
                </AccordionContent>
              </AccordionItem>
            ) : null
          )}
      </Accordion>
    ) : null;
  };

  const renderCode = () => {
    if (!contract?.source_code.length) return null;
    return (
      <div className="flex flex-col gap-8">
        {contract.source_code.map((sc) => (
          <div key={sc.code} className="py-4">
            <SyntaxHighlighter
              language={sc.language}
              style={{
                ...stackoverflowDark,
                hljs: {
                  display: "block",
                  overflowX: "auto",
                  padding: "0.5em",
                  color: "#ffffff",
                  background: "transparent",
                },
              }}
            >
              {sc.code}
            </SyntaxHighlighter>
          </div>
        ))}
      </div>
    );
  };

  const renderTab = () => {
    switch (tab) {
      case "details":
        return renderStateDetails();
      case "write":
        return renderMethods(writeMethods);
      case "read":
        return renderMethods(readMethods);
      case "code":
        return renderCode();
      default:
        return null;
    }
  };

  return (
    <Card>
      <div className="flex gap-4">
        <NavLink
          href="?tab=details"
          isActive={tab === "details"}
          className="whitespace-nowrap"
        >
          Details
        </NavLink>
        <NavLink
          href="?tab=read"
          isActive={tab === "read"}
          className="whitespace-nowrap"
        >
          Read
        </NavLink>
        <NavLink
          href="?tab=write"
          isActive={tab === "write"}
          className="whitespace-nowrap"
        >
          Write
        </NavLink>
        <NavLink
          href="?tab=code"
          isActive={tab === "code"}
          className="whitespace-nowrap"
        >
          Code
        </NavLink>
      </div>
      {renderTab()}
    </Card>
  );
}
