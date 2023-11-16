"use client";

import { Button } from "@/components/Button";
import { Heading } from "@/components/Heading";
import { NavLink } from "@/components/NavLink";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { Table } from "@/components/Table";
import { Contract } from "@/types/contracts";
import { formatTokenValue, parseTokenValue } from "@/utils/formatter";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { isAddress, toHex } from "viem";
import { useAccount, useBlockNumber } from "wagmi";
import { startCase } from "lodash";
import { sendTransaction } from "@wagmi/core";
import { Address } from "@/components/Address";
import SyntaxHighlighter from "react-syntax-highlighter";
import { stackoverflowDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Transaction } from "@/types/blocks";

interface Props {
  hash: string;
  contract?: Contract;
}

export default function WalletAddress({ hash, contract }: Props) {
  const { data: latestBlockNumber } = useBlockNumber({ watch: true });
  const { openConnectModal } = useConnectModal();
  const { address, isDisconnected } = useAccount();
  const [methodValues, setMethodValues] = useState<{
    [key: string]: { [key: string]: string };
  }>({});
  const [methodLoading, setMethodLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [simulationResults, setSimulationResults] = useState<{
    [key: string]: any;
  }>({});
  const [staticCallResults, setStaticCallResults] = useState<{
    [key: string]: any;
  }>({});
  const [pendingCallTxnHash, setPendingCallTxnHash] = useState<string | null>(
    null
  );
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "details";

  const writeMethods = useMemo(
    () =>
      contract
        ? Object.keys(contract.abi)
            .filter((name) => {
              return (
                Object.keys(contract.abi[name]).length &&
                contract.abi[name]["type"] !== "constructor" &&
                contract.abi[name].state_mutability !== "view"
              );
            })
            .map((name) => ({
              name,
              args: contract.abi[name]["args"],
            }))
        : [],
    [contract]
  );

  const readMethods = useMemo(
    () =>
      contract
        ? Object.keys(contract.abi)
            .filter((name) => {
              return (
                Object.keys(contract.abi[name]).length &&
                contract.abi[name].state_mutability === "view"
              );
            })
            .map((name) => ({
              name,
              args: contract.abi[name]["args"],
            }))
        : [],
    [contract]
  );

  useEffect(() => {
    if (pendingCallTxnHash && latestBlockNumber) {
      try {
        const fetchData = async () => {
          const callReceiptRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URI}/transactions/${pendingCallTxnHash}`
          );
          const receipt = callReceiptRes.data.result;

          if (receipt) {
            setPendingCallTxnHash(null);
            // setCallReceipt(receipt);
            setMethodLoading({});
          }
        };

        fetchData();
      } catch (e) {
        console.log(e);
      }
    }
  }, [latestBlockNumber, pendingCallTxnHash]);

  const staticCall = async (name: string) => {
    setStaticCallResults((results) => ({ ...results, [name]: null }));
    const callRes = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts/${hash}/static-call/${name}`,
      {
        params: {
          args: JSON.stringify(methodValues[name]),
        },
      }
    );
    setStaticCallResults((results) => ({
      ...results,
      [name]: callRes.data.result,
    }));
  };

  const callMethod = async (name: string) => {
    if (
      contract?.abi[name].state_mutability == "view" ||
      contract?.abi[name].state_mutability == "pure"
    ) {
      return staticCall(name);
    }
    setMethodLoading((loading) => ({ ...loading, [name]: true }));
    setSimulationResults((results) => ({ ...results, [name]: null }));
    try {
      if (address && !isDisconnected) {
        const txnData = {
          to: hash,
          data: {
            function: name,
            args: methodValues[name],
          },
        };

        const simulationRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts/simulate`,
          {
            params: {
              from: address,
              tx_payload: JSON.stringify(txnData),
            },
          }
        );

        setSimulationResults((results) => ({
          ...results,
          [name]: simulationRes.data.result,
        }));

        if (simulationRes.data.result.status != "success") {
          setMethodLoading((loading) => ({ ...loading, [name]: false }));
          return;
        }

        const txn = await sendTransaction({
          to: "0x0000000000000000000000000000000000000000",
          data: toHex(
            `data:application/vnd.esc;esip6=true,${JSON.stringify(txnData)}`
          ),
        });
        setPendingCallTxnHash(txn.hash);
      } else if (openConnectModal) {
        openConnectModal();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const renderStateDetails = () => {
    return contract ? (
      <Table
        rows={[
          ...Object.keys(contract.current_state)
            .filter(
              (key) =>
                typeof contract.current_state[key] === "string" ||
                typeof contract.current_state[key] === "number"
            )
            .map((key) =>
              isAddress(contract.current_state[key])
                ? [
                    startCase(key),
                    <Address
                      key={key}
                      address={contract.current_state[key]}
                      noAvatar
                      noCopy
                    />,
                  ]
                : [
                    startCase(key),
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
                    </div>,
                  ]
            ),
        ]}
      />
    ) : null;
  };

  const renderMethods = (
    methods: {
      name: string;
      args: {
        [key: string]: string;
      };
    }[]
  ) => {
    return contract ? (
      <div className="flex flex-col divide-y divide-line">
        {methods.map((method) => (
          <div key={method.name} className="flex flex-col gap-4 py-6">
            <Heading size="h5">{startCase(method.name)}</Heading>
            {Object.keys(method.args ?? {}).map((argument) => (
              <div key={argument} className="flex flex-col gap-1">
                <label
                  className="block text-sm font-medium leading-6"
                  htmlFor={argument}
                >
                  {startCase(argument)}
                </label>
                <input
                  id={argument}
                  type="text"
                  className="bg-black w-full block border-0 py-2 px-4 outline-none ring-1 ring-inset ring-line placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary"
                  placeholder={startCase(argument)}
                  onChange={(e) => {
                    setMethodValues((values) => ({
                      ...(values ?? {}),
                      [method.name]: {
                        ...(values[method.name] ?? {}),
                        [argument]: parseTokenValue(
                          e.target.value,
                          contract.current_state.decimals ?? 0,
                          argument
                        ),
                      },
                    }));
                  }}
                  value={formatTokenValue(
                    methodValues[method.name]?.[argument],
                    contract.current_state.decimals ?? 0,
                    argument
                  )}
                />
              </div>
            ))}
            <Button
              onClick={() => callMethod(method.name)}
              disabled={methodLoading[method.name]}
              loading={methodLoading[method.name]}
              primary={false}
              className="text-sm"
            >
              Call
            </Button>
            {simulationResults[method.name]?.status == "error" && (
              <div className="font-mono text-sm pl-3 border-l-4 border-red-300">
                {simulationResults[method.name].error_message}
              </div>
            )}
            {staticCallResults[method.name] !== null &&
              staticCallResults[method.name] !== undefined && (
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium leading-6">Result:</div>
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
          </div>
        ))}
      </div>
    ) : null;
  };

  const renderCode = () => {
    if (!contract?.source_code.length) return null;
    return (
      <div className="flex flex-col gap-8">
        {contract.source_code.map((sc) => (
          <>
            <SyntaxHighlighter
              key={sc.code}
              language={sc.language}
              style={stackoverflowDark}
            >
              {sc.code}
            </SyntaxHighlighter>
          </>
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
    <div className="flex flex-col border border-line rounded-xl overflow-x-hidden divide-y divide-line">
      <SectionContainer>
        <Section className="py-0 sm:py-0">
          <div className="flex gap-8 items-center">
            <div className="flex gap-8">
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
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1">
        <Section className="flex-1">{renderTab()}</Section>
      </SectionContainer>
    </div>
  );
}
