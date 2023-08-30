"use client";

import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Heading } from "@/components/Heading";
import { Modal } from "@/components/Modal";
import { NavLink } from "@/components/NavLink";
import { Section } from "@/components/Section";
import { SectionContainer } from "@/components/SectionContainer";
import { Table } from "@/components/Table";
import {
  CallReceipt,
  Contract,
  ContractAbi,
  CurrentState,
  SourceCode,
} from "@/types/contracts";
import {
  formatTimestamp,
  formatTokenValue,
  parseTokenValue,
  truncateMiddle,
} from "@/utils/formatter";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatUnits, isAddress, keccak256, toHex } from "viem";
import { useAccount, useBlockNumber } from "wagmi";
import { kebabCase, startCase } from "lodash";
import { sendTransaction } from "@wagmi/core";
import { waitForTransaction } from "wagmi/actions";
import Link from "next/link";
import { Address } from "@/components/Address";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoCopyOutline,
} from "react-icons/io5";
import { targetNetwork } from "@/app/providers";
import SyntaxHighlighter from "react-syntax-highlighter";
import { stackoverflowDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CopyToClipboard } from "react-copy-to-clipboard";

export default function Contract({ hash }: { hash: string }) {
  const { data: latestBlockNumber } = useBlockNumber({ watch: true });
  const { openConnectModal } = useConnectModal();
  const { address, isDisconnected } = useAccount();
  const [currentState, setCurrentState] = useState<CurrentState | null>(null);
  const [contractAbi, setContractAbi] = useState<ContractAbi>({});
  const [callReceipts, setCallReceipts] = useState<CallReceipt[]>([]);
  const [sourceCode, setSourceCode] = useState<SourceCode | null>(null);
  const [methodValues, setMethodValues] = useState<{
    [key: string]: { [key: string]: string };
  }>({});
  const [methodLoading, setMethodLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [staticCallResults, setStaticCallResults] = useState<{
    [key: string]: any;
  }>({});
  const [hasMoreCallReceipts, setHasMoreCallReceipts] = useState(true);
  const [callReceiptsPage, setCallReceiptsPage] = useState(1);
  const [callReceipt, setCallReceipt] = useState<CallReceipt | null>(null);
  const [pendingCallTxnHash, setPendingCallTxnHash] = useState<string | null>(
    null
  );
  const [addressCopied, setAddressCopied] = useState(false);
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "transactions";

  const writeMethods = useMemo(
    () =>
      Object.keys(contractAbi)
        .filter((name) => {
          return (
            Object.keys(contractAbi[name]).length &&
            contractAbi[name]["type"] !== "constructor" &&
            contractAbi[name].state_mutability !== "view"
          );
        })
        .map((name) => ({
          name,
          args: contractAbi[name]["args"],
        })),
    [contractAbi]
  );

  const readMethods = useMemo(
    () =>
      Object.keys(contractAbi)
        .filter((name) => {
          return (
            Object.keys(contractAbi[name]).length &&
            contractAbi[name].state_mutability === "view"
          );
        })
        .map((name) => ({
          name,
          args: contractAbi[name]["args"],
        })),
    [contractAbi]
  );

  useEffect(() => {
    if (hash && latestBlockNumber) {
      try {
        const fetchData = async () => {
          const contractRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts/${hash}`
          );
          const {
            current_state = {},
            abi = {},
            source_code = null,
          } = contractRes.data.result ?? {};
          setCurrentState(current_state);
          setContractAbi(abi);
          setSourceCode(source_code);
        };

        fetchData();
      } catch (e) {
        console.log(e);
      }
    }
  }, [hash, latestBlockNumber]);

  useEffect(() => {
    if (pendingCallTxnHash && latestBlockNumber) {
      try {
        const fetchData = async () => {
          const callReceiptRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts/call-receipts/${pendingCallTxnHash}`
          );
          const receipt = callReceiptRes.data.result;

          if (receipt) {
            setPendingCallTxnHash(null);
            setCallReceipt(receipt);
            setCallReceipts((receipts) => [receipt, ...receipts]);
            setMethodLoading({});
          }
        };

        fetchData();
      } catch (e) {
        console.log(e);
      }
    }
  }, [latestBlockNumber, pendingCallTxnHash]);

  const fetchCallReceipts = useCallback(async () => {
    if (hash) {
      try {
        const callReceiptsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URI}/contracts/${hash}/call-receipts`,
          {
            params: {
              page: callReceiptsPage,
              per_page: 20,
            },
          }
        );
        const receipts = callReceiptsRes.data.result ?? [];
        if (receipts.length < 20) {
          setHasMoreCallReceipts(false);
        }
        setCallReceipts((prevReceipts) => [...prevReceipts, ...receipts]);
        setCallReceiptsPage((page) => (page += 1));
      } catch (e) {
        console.log(e);
      }
    }
  }, [callReceiptsPage, hash]);

  useEffect(() => {
    fetchCallReceipts();
  }, []);

  if (!currentState) {
    return null;
  }

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
      contractAbi[name].state_mutability == "view" ||
      contractAbi[name].state_mutability == "pure"
    ) {
      return staticCall(name);
    }
    setMethodLoading((loading) => ({ ...loading, [name]: true }));
    try {
      if (address && !isDisconnected) {
        const txnSalt = keccak256(Buffer.from(`${hash}${name}${Date.now()}`));
        const txnData = {
          contractId: hash,
          functionName: name,
          args: methodValues[name],
          salt: txnSalt,
        };
        const txn = await sendTransaction({
          to: "0x0000000000000000000000000000000000000000",
          data: toHex(
            `data:application/vnd.esc.contract.call+json,${JSON.stringify(
              txnData
            )}`
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

  const renderState = () => {
    return (
      <Table
        rows={[
          ...Object.keys(currentState)
            .filter(
              (key) =>
                typeof currentState[key] === "string" ||
                typeof currentState[key] === "number"
            )
            .map((key) =>
              isAddress(currentState[key])
                ? [
                    startCase(key),
                    <Link
                      href={`/${currentState[key]}`}
                      className="text-secondary hover:text-primary transition-colors"
                    >
                      <Address
                        address={currentState[key]}
                        disableAddressLink
                        noAvatar
                        noCopy
                      />
                    </Link>,
                  ]
                : [
                    startCase(key),
                    <div className="max-w-full text-ellipsis overflow-hidden">
                      {formatTokenValue(
                        currentState[key],
                        currentState["decimals"] ?? 0,
                        key,
                        true,
                        currentState.symbol
                      )}
                    </div>,
                  ]
            ),
        ]}
      />
    );
  };

  const renderMethods = (
    methods: {
      name: string;
      args: {
        [key: string]: string;
      };
    }[]
  ) => {
    return (
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
                          currentState.decimals ?? 0,
                          argument
                        ),
                      },
                    }));
                  }}
                  value={formatTokenValue(
                    methodValues[method.name]?.[argument],
                    currentState.decimals ?? 0,
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
            {staticCallResults[method.name] !== null &&
              staticCallResults[method.name] !== undefined && (
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium leading-6">Result:</div>
                  <div className="text-sm break-all">
                    {typeof staticCallResults[method.name] == "object"
                      ? JSON.stringify(staticCallResults[method.name])
                      : formatTokenValue(
                          staticCallResults[method.name],
                          currentState.decimals ?? 0,
                          method.name,
                          false,
                          currentState.symbol
                        )}
                  </div>
                </div>
              )}
          </div>
        ))}
      </div>
    );
  };

  const renderTransactions = () => {
    return (
      <InfiniteScroll
        dataLength={callReceipts.length}
        next={() => fetchCallReceipts()}
        loader={<p>Loading...</p>}
        className="!overflow-visible"
        hasMore={hasMoreCallReceipts}
      >
        <div className="flex flex-col">
          <Table
            headers={["Event", "Amount", "From", "To", "Date"]}
            rows={[
              ...callReceipts.map((callReceipt) => [
                <div
                  key={callReceipt.ethscription_id}
                  onClick={() => setCallReceipt(callReceipt)}
                  className="flex flex-row items-center gap-2 text-secondary hover:text-primary transition-colors cursor-pointer"
                >
                  {callReceipt.status === "success" ? (
                    <IoCheckmarkCircleOutline className="text-xl text-primary" />
                  ) : (
                    <IoCloseCircleOutline className="text-xl text-red-500" />
                  )}
                  {startCase(callReceipt.function_name)}
                </div>,
                <div
                  key={callReceipt.ethscription_id}
                  className="flex flex-row gap-1"
                >
                  <div className="overflow-hidden text-ellipsis max-w-[200px]">
                    {formatUnits(
                      callReceipt.function_args.amount ||
                        callReceipt.function_args.token_a_amount ||
                        callReceipt.function_args.token_b_amount ||
                        callReceipt.function_args.input_amount ||
                        callReceipt.function_args.output_amount ||
                        callReceipt.function_args.value ||
                        0,
                      currentState.decimals ?? 0
                    )}
                  </div>
                  {currentState.symbol}
                </div>,
                <Link
                  key={callReceipt.ethscription_id}
                  href={`https://ethscriptions.com/${callReceipt.caller}`}
                  className="text-secondary hover:text-primary transition-colors"
                  target="_blank"
                >
                  <Address
                    disableAddressLink={true}
                    noAvatar={true}
                    noCopy={true}
                    address={callReceipt.caller}
                  />
                </Link>,
                !!callReceipt.function_args.to ? (
                  <Link
                    key={callReceipt.ethscription_id}
                    href={`https://ethscriptions.com/${callReceipt.function_args.to}`}
                    className="text-secondary hover:text-primary transition-colors"
                    target="_blank"
                  >
                    <Address
                      disableAddressLink={true}
                      noAvatar={true}
                      noCopy={true}
                      address={callReceipt.function_args.to}
                    />
                  </Link>
                ) : (
                  <Link
                    key={callReceipt.ethscription_id}
                    href={`https://ethscriptions.com/${callReceipt.caller}`}
                    className="text-secondary hover:text-primary transition-colors"
                    target="_blank"
                  >
                    <Address
                      disableAddressLink={true}
                      noAvatar={true}
                      noCopy={true}
                      address={callReceipt.caller}
                    />
                  </Link>
                ),
                formatTimestamp(callReceipt.timestamp) ? (
                  <div
                    key={callReceipt.ethscription_id}
                    onClick={() => setCallReceipt(callReceipt)}
                    className="flex flex-row items-center gap-2 text-secondary hover:text-primary transition-colors cursor-pointer"
                  >
                    {formatTimestamp(callReceipt.timestamp)}
                  </div>
                ) : (
                  "--"
                ),
              ]),
            ]}
          />
        </div>
      </InfiniteScroll>
    );
  };

  const renderCode = () => {
    if (!sourceCode) return null;
    return (
      <SyntaxHighlighter
        language={sourceCode.language}
        style={stackoverflowDark}
      >
        {sourceCode?.code}
      </SyntaxHighlighter>
    );
  };

  const renderOther = () => {
    const currentStateKeys = Object.keys(currentState);
    const selectedStateKey = currentStateKeys.find(
      (key) => kebabCase(key) === tab
    );
    const selectedState = selectedStateKey && currentState[selectedStateKey];
    if (!selectedState) return null;
    if (Array.isArray(selectedState)) {
      const tableHeaders = selectedState.length
        ? Object.keys(selectedState[0]).filter(
            (key) =>
              typeof selectedState[0][key] === "string" ||
              typeof selectedState[0][key] === "number"
          )
        : [];
      return (
        <Table
          headers={tableHeaders.map((header) => startCase(header))}
          rows={selectedState.map((row) =>
            tableHeaders.map((header) => row[header])
          )}
        />
      );
    }
    return (
      <Table
        rows={[
          ...Object.keys(selectedState)
            .filter(
              (key) =>
                typeof selectedState[key] === "string" ||
                typeof selectedState[key] === "number"
            )
            .map((key) =>
              isAddress(selectedState[key])
                ? [
                    `${key}`,
                    <Link
                      href={`/${selectedState[key]}`}
                      className="text-secondary hover:text-primary transition-colors"
                    >
                      <Address
                        address={selectedState[key]}
                        disableAddressLink
                        noAvatar
                        noCopy
                      />
                    </Link>,
                  ]
                : [
                    `${key}`,
                    <div className="max-w-full text-ellipsis overflow-hidden">
                      {formatTokenValue(
                        selectedState[key],
                        currentState.decimals ?? 0,
                        key,
                        true,
                        selectedState.symbol
                      )}
                    </div>,
                  ]
            ),
        ]}
      />
    );
  };

  const renderTab = () => {
    switch (tab) {
      case "transactions":
        return renderTransactions();
      case "state":
        return renderState();
      case "write":
        return renderMethods(writeMethods);
      case "read":
        return renderMethods(readMethods);
      case "code":
        return renderCode();
      default:
        return renderOther();
    }
  };

  return (
    <div className="min-h-[100vh] flex flex-col">
      <Header />
      <SectionContainer>
        <Section>
          <div className="flex flex-col p-0 md:p-8 gap-1">
            <Heading size="h5" className="text-primary">
              {startCase(currentState.contract_type)}
            </Heading>
            {currentState.contract_type === "DexLiquidityPool" ? (
              <Heading size="h1">Dex Liquidity Pool</Heading>
            ) : (
              <Heading size="h1">
                {currentState.name || "Contract"}
                {currentState.symbol ? ` (${currentState.symbol})` : ""}
              </Heading>
            )}
            <div className="w-fit mt-2">
              <CopyToClipboard
                text={hash}
                onCopy={() => {
                  setAddressCopied(true);
                  setTimeout(() => {
                    setAddressCopied(false);
                  }, 1500);
                }}
              >
                {addressCopied ? (
                  <div className="flex items-center gap-2 cursor-pointer text-primary">
                    <IoCheckmarkCircleOutline />
                    <div>Copied!</div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 cursor-pointer text-secondary hover:text-primary">
                    <IoCopyOutline />
                    <div>{truncateMiddle(hash, 6, 4)}</div>
                  </div>
                )}
              </CopyToClipboard>
            </div>
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer>
        <Section className="py-0">
          <div className="px-0 md:px-8 flex gap-8 items-center h-min-full">
            <div className="flex gap-8 h-min-full">
              <NavLink
                href="?tab=transactions"
                isActive={tab === "transactions"}
                className="whitespace-nowrap"
              >
                Transactions
              </NavLink>
              <NavLink
                href="?tab=state"
                isActive={tab === "state"}
                className="whitespace-nowrap"
              >
                State
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
              {Object.keys(currentState)
                .filter((key) => typeof currentState[key] === "object")
                .map((key) => (
                  <NavLink
                    key={key}
                    href={`?tab=${kebabCase(key)}`}
                    isActive={tab === kebabCase(key)}
                    className="whitespace-nowrap"
                  >
                    {startCase(key)}
                  </NavLink>
                ))}
            </div>
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer className="flex-1">
        <Section className="flex-1">
          <div className="px-0 md:px-8">{renderTab()}</div>
        </Section>
      </SectionContainer>
      <SectionContainer className="border-none">
        <Section className="flex-1 items-center">
          &copy; {new Date().getFullYear()} Ethscriptions Inc.
        </Section>
      </SectionContainer>
      <Modal
        title="Call Receipt"
        show={!!callReceipt}
        onClose={() => setCallReceipt(null)}
      >
        {callReceipt ? (
          <>
            <div className="flex flex-col gap-3">
              <Heading size="h6">Status</Heading>
              <div className="flex flex-row items-center gap-2">
                {callReceipt.status === "success" ? (
                  <IoCheckmarkCircleOutline
                    onClick={() => setCallReceipt(callReceipt)}
                    className="text-xl text-primary"
                  />
                ) : (
                  <IoCloseCircleOutline
                    onClick={() => setCallReceipt(callReceipt)}
                    className="text-xl text-red-500"
                  />
                )}
                {startCase(callReceipt.status)}
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-line mt-3 pt-3">
              <Heading size="h6">Function Name</Heading>
              <div className="flex flex-row items-center gap-2">
                {startCase(callReceipt.function_name)}
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-line mt-3 pt-3">
              <Heading size="h6">Function Arguments</Heading>
              <code className="pl-3 border-l-4 border-line overflow-auto max-w-full">
                {JSON.stringify(callReceipt.function_args, undefined, 2)}
              </code>
            </div>
            {!!callReceipt.logs.length && (
              <div className="flex flex-col gap-3 border-t border-line mt-3 pt-3">
                <Heading size="h6">Logs</Heading>
                {callReceipt.logs.map((log) => (
                  <code
                    key={JSON.stringify(log)}
                    className="pl-3 border-l-4 border-line overflow-auto max-w-full"
                  >
                    {`${log.event}: ${JSON.stringify(log.data, undefined, 2)}`}
                  </code>
                ))}
              </div>
            )}
            {!!callReceipt.error_message?.length && (
              <div className="flex flex-col gap-3 border-t border-line mt-3 pt-3">
                <Heading size="h6">Error Message</Heading>
                <code
                  key={callReceipt.error_message}
                  className="pl-3 border-l-4 border-red-300 overflow-auto max-w-full"
                >
                  {callReceipt.error_message}
                </code>
              </div>
            )}
            <div className="flex flex-col gap-3 border-t border-line mt-3 pt-3">
              <Heading size="h6">Timestamp</Heading>
              <Link
                key={callReceipt.ethscription_id}
                href={`${targetNetwork.blockExplorers.default.url}/tx/${callReceipt.ethscription_id}`}
                target="_blank"
                className="text-secondary hover:text-primary transition-colors"
              >
                {formatTimestamp(callReceipt.timestamp)}
              </Link>
            </div>
          </>
        ) : (
          <div />
        )}
      </Modal>
    </div>
  );
}
