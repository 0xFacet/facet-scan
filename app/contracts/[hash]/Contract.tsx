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
} from "@/types/contracts";
import { formatEther, formatTimestamp } from "@/utils/formatter";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isAddress, keccak256, parseEther, toHex } from "viem";
import {
  useAccount,
  useBlockNumber,
  useSendTransaction,
  useWaitForTransaction,
} from "wagmi";
import { startCase } from "lodash";
import { sendTransaction } from "@wagmi/core";
import { waitForTransaction } from "wagmi/actions";
import { List } from "@/components/List";
import Link from "next/link";
import { Address } from "@/components/Address";
import InfiniteScroll from "react-infinite-scroll-component";
import { Transfer } from "@/types/ethscriptions";
import { IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";
import { targetNetwork } from "@/app/providers";

export default function Contract({ hash }: { hash: string }) {
  const { data: latestBlockNumber } = useBlockNumber({ watch: true });
  const { openConnectModal } = useConnectModal();
  const { address, isDisconnected } = useAccount();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createContractType, setCreateContractType] =
    useState("AllowanceToken");
  const [constructorArgs, setConstructorArgs] = useState<{
    [key: string]: any;
  }>({});
  const [currentState, setCurrentState] = useState<CurrentState | null>(null);
  const [contractAbi, setContractAbi] = useState<ContractAbi>({});
  const [callReceipts, setCallReceipts] = useState<CallReceipt[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [methodValues, setMethodValues] = useState<{
    [key: string]: { [key: string]: string };
  }>({});
  const [methodLoading, setMethodLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [staticCallResults, setStaticCallResults] = useState<{
    [key: string]: any;
  }>({});
  const [amountToBridge, setAmountToBridge] = useState("");
  const [bridgeIsLoading, setBridgeIsLoading] = useState(false);
  const [hasMoreCallReceipts, setHasMoreCallReceipts] = useState(true);
  const [callReceiptsPage, setCallReceiptsPage] = useState(1);
  const [callReceipt, setCallReceipt] = useState<CallReceipt | null>(null);
  const [pendingCallTxnHash, setPendingCallTxnHash] = useState<string | null>(
    null
  );
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "details";

  const writeMethods = useMemo(
    () =>
      Object.keys(contractAbi)
        .filter((name) => {
          return (
            Object.keys(contractAbi[name]).length &&
            contractAbi[name]["type"] !== "constructor"
          );
        })
        .map((name) => ({
          name,
          arguments: contractAbi[name]["args"],
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
          const { current_state = {}, abi = {} } =
            contractRes.data.result ?? {};
          setCurrentState(current_state);
          setContractAbi(abi);
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
        await waitForTransaction({ confirmations: 2, hash: txn.hash });
        setPendingCallTxnHash(txn.hash);
      } else if (openConnectModal) {
        openConnectModal();
      }
    } catch (e) {
      console.log(e);
    }
    setMethodLoading((loading) => ({ ...loading, [name]: false }));
  };

  const renderDetails = () => {
    return (
      <List
        items={[
          ...Object.keys(currentState)
            .filter(
              (key) =>
                typeof currentState[key] === "string" ||
                typeof currentState[key] === "number"
            )
            .map((key) =>
              isAddress(currentState[key])
                ? {
                    label: startCase(key),
                    value: (
                      <Link
                        href={`/${currentState[key]}`}
                        className="text-secondary hover:text-primary transition-colors text-lg"
                      >
                        <Address
                          address={currentState[key]}
                          disableAddressLink
                          noAvatar
                          noCopy
                        />
                      </Link>
                    ),
                  }
                : {
                    label: startCase(key),
                    value: (
                      <div className="text-lg max-w-full text-ellipsis overflow-hidden">
                        {key === "total_supply" ||
                        key === "max_supply" ||
                        key === "per_mint_limit"
                          ? `${formatEther(currentState[key])} ${
                              currentState.symbol
                            }`
                          : currentState[key].toLocaleString()}
                      </div>
                    ),
                  }
            ),
        ]}
      />
    );
  };

  const renderMethods = () => {
    return (
      <div className="flex flex-col gap-6">
        {writeMethods.map((method) => (
          <div
            key={method.name}
            className="flex flex-col gap-3 border-b border-[rgba(255,255,255,0.2)] pb-6"
          >
            <Heading size="h5">{startCase(method.name)}</Heading>
            {Object.keys(method.arguments).map((argument) => (
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
                  className="bg-black w-full block border-0 py-2 px-4 text-gray-900 outline-none ring-1 ring-inset ring-[rgba(255,255,255,0.2)] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary"
                  placeholder={startCase(argument)}
                  onChange={(e) => {
                    setMethodValues((values) => ({
                      ...(values ?? {}),
                      [method.name]: {
                        ...(values[method.name] ?? {}),
                        [argument]:
                          (argument.includes("amount") ||
                            argument === "value") &&
                          e.target.value
                            ? parseEther(e.target.value, "wei").toString()
                            : e.target.value,
                      },
                    }));
                  }}
                  value={
                    (argument.includes("amount") || argument === "value") &&
                    methodValues[method.name]?.[argument]
                      ? formatEther(
                          methodValues[method.name]?.[argument],
                          false
                        )
                      : methodValues[method.name]?.[argument] ?? ""
                  }
                />
              </div>
            ))}
            <Button
              onClick={() => callMethod(method.name)}
              disabled={methodLoading[method.name]}
              loading={methodLoading[method.name]}
            >
              Call
            </Button>
            <div>
              {staticCallResults[method.name] !== null &&
                staticCallResults[method.name] !== undefined && (
                  <div>
                    <div className="text-sm font-medium leading-6 text-gray-900">
                      Result
                    </div>
                    <div className="text-sm">
                      {(method.name.includes("balance") ||
                        method.name.includes("calculate_output_amount") ||
                        method.name.includes("allowance")) && (
                        <div>
                          {formatEther(staticCallResults[method.name])}{" "}
                          {currentState.symbol}
                        </div>
                      )}
                      {!method.name.includes("balance") &&
                        !method.name.includes("calculate_output_amount") &&
                        !method.name.includes("allowance") && (
                          <div>
                            {typeof staticCallResults[method.name] == "object"
                              ? JSON.stringify(staticCallResults[method.name])
                              : staticCallResults[method.name]}
                          </div>
                        )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderActivity = () => {
    return (
      <InfiniteScroll
        dataLength={
          transfers[0] && !hasMoreCallReceipts
            ? callReceipts.length + 1
            : callReceipts.length
        }
        next={() => fetchCallReceipts()}
        loader={<p>Loading...</p>}
        className="!overflow-visible"
        hasMore={hasMoreCallReceipts}
      >
        <div className="flex flex-col">
          <Table
            headers={["Event", "Amount", "From", "To", "Date"]}
            rows={[
              ...callReceipts
                .filter(
                  (callReceipt) => callReceipt.function_name !== "constructor"
                )
                .map((callReceipt) => [
                  <div
                    key={callReceipt.ethscription_id}
                    onClick={() => setCallReceipt(callReceipt)}
                    className="flex flex-row items-center gap-2 text-secondary hover:text-primary transition-colors text-lg cursor-pointer"
                  >
                    {callReceipt.status === "success" ? (
                      <IoCheckmarkCircle className="text-xl text-green-700" />
                    ) : (
                      <IoCloseCircle className="text-xl text-red-700" />
                    )}
                    {startCase(callReceipt.function_name)}
                  </div>,
                  <div
                    key={callReceipt.ethscription_id}
                    className="text-lg flex flex-row gap-1"
                  >
                    <div className="overflow-hidden text-ellipsis max-w-[200px]">
                      {formatEther(
                        callReceipt.function_args.amount ||
                          callReceipt.function_args.token_a_amount ||
                          callReceipt.function_args.token_b_amount ||
                          callReceipt.function_args.input_amount ||
                          callReceipt.function_args.output_amount ||
                          callReceipt.function_args.value
                      )}
                    </div>
                    {currentState.symbol}
                  </div>,
                  <Link
                    key={callReceipt.ethscription_id}
                    href={`https://ethscriptions.com/${callReceipt.caller}`}
                    className="text-secondary hover:text-primary transition-colors text-lg"
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
                      className="text-secondary hover:text-primary transition-colors text-lg"
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
                      className="text-secondary hover:text-primary transition-colors text-lg"
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
                      className="flex flex-row items-center gap-2 text-secondary hover:text-primary transition-colors text-lg cursor-pointer"
                    >
                      {formatTimestamp(callReceipt.timestamp)}
                    </div>
                  ) : (
                    "--"
                  ),
                ]),
              ...(transfers[0] && !hasMoreCallReceipts
                ? [
                    [
                      <div
                        key={transfers[0].transaction_hash}
                        className="text-lg"
                      >
                        <>Create</>
                      </div>,
                      <div
                        key={transfers[0].transaction_hash}
                        className="text-lg"
                      >
                        {transfers[0].sale_price !== "0"
                          ? `${formatEther(transfers[0].sale_price)} ETH`
                          : "--"}
                      </div>,
                      <Link
                        key={transfers[0].transaction_hash}
                        href={`https://ethscriptions.com/${transfers[0].from}`}
                        className="text-secondary hover:text-primary transition-colors text-lg"
                        target="_blank"
                      >
                        <Address
                          disableAddressLink={true}
                          noAvatar={true}
                          noCopy={true}
                          address={transfers[0].from}
                        />
                      </Link>,
                      <Link
                        key={transfers[0].transaction_hash}
                        href={`https://ethscriptions.com/${transfers[0].to}`}
                        className="text-secondary hover:text-primary transition-colors text-lg"
                        target="_blank"
                      >
                        <Address
                          disableAddressLink={true}
                          noAvatar={true}
                          noCopy={true}
                          address={transfers[0].to}
                        />
                      </Link>,
                      formatTimestamp(transfers[0].timestamp) ? (
                        <Link
                          key={transfers[0].transaction_hash}
                          href={`${targetNetwork.blockExplorers.default.url}/txn/${transfers[0].transaction_hash}`}
                          target="_blank"
                          className="text-secondary hover:text-primary transition-colors text-lg"
                        >
                          {formatTimestamp(transfers[0].timestamp)}
                        </Link>
                      ) : (
                        "--"
                      ),
                    ],
                  ]
                : []),
            ]}
          />
        </div>
      </InfiniteScroll>
    );
  };

  const renderBalances = () => {
    return (
      <Table
        headers={["Address", "Amount"]}
        rows={Object.keys(currentState.balances).map((address) => [
          <Link
            key={address}
            href={`https://ethscriptions.com/${address}`}
            className="text-secondary hover:text-primary transition-colors text-lg"
            target="_blank"
          >
            <Address
              disableAddressLink={true}
              noAvatar={true}
              noCopy={true}
              address={address as `0x${string}`}
            />
          </Link>,
          <div key={address} className="text-lg">
            {formatEther(currentState.balances[address])} {currentState.symbol}
          </div>,
        ])}
      />
    );
  };

  const renderTab = () => {
    switch (tab) {
      case "methods":
        return renderMethods();
      case "activity":
        return renderActivity();
      case "balances":
        return renderBalances();
      default:
        return renderDetails();
    }
  };

  return (
    <div className="min-h-[100vh] flex flex-col">
      <Header />
      <SectionContainer>
        <Section>
          <div className="flex flex-col p-0 md:p-8 gap-4 md:gap-8">
            {currentState.contract_type === "DexLiquidityPool" ? (
              <Heading size="h2">Dex Liquidity Pool</Heading>
            ) : (
              <Heading size="h2">
                {currentState.name || "Contract"}{" "}
                {currentState.symbol ? ` (${currentState.symbol})` : ""}
              </Heading>
            )}
          </div>
        </Section>
      </SectionContainer>
      <SectionContainer>
        <Section className="py-0">
          <div className="px-0 md:px-8 flex gap-8 items-center h-min-full">
            <div className="flex gap-8 h-min-full">
              <NavLink href="?tab=details" isActive={tab === "details"}>
                Details
              </NavLink>
              <NavLink href="?tab=methods" isActive={tab === "methods"}>
                Methods
              </NavLink>
              <NavLink href="?tab=activity" isActive={tab === "activity"}>
                Activity
              </NavLink>
              <NavLink href="?tab=balances" isActive={tab === "balances"}>
                Balances
              </NavLink>
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
              <div className="text-lg flex flex-row items-center gap-2">
                {callReceipt.status === "success" ? (
                  <IoCheckmarkCircle
                    onClick={() => setCallReceipt(callReceipt)}
                    className="text-xl text-green-700"
                  />
                ) : (
                  <IoCloseCircle
                    onClick={() => setCallReceipt(callReceipt)}
                    className="text-xl text-red-700"
                  />
                )}
                {startCase(callReceipt.status)}
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-[rgba(255,255,255,0.2)] mt-3 pt-3">
              <Heading size="h6">Function Name</Heading>
              <div className="text-lg flex flex-row items-center gap-2">
                {startCase(callReceipt.function_name)}
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-[rgba(255,255,255,0.2)] mt-3 pt-3">
              <Heading size="h6">Function Arguments</Heading>
              <div className="text-lg flex flex-row items-center gap-2 overflow-auto max-w-full">
                {JSON.stringify(callReceipt.function_args, undefined, 2)}
              </div>
            </div>
            {!!callReceipt.logs.length && (
              <div className="flex flex-col gap-3 border-t border-[rgba(255,255,255,0.2)] mt-3 pt-3">
                <Heading size="h6">Logs</Heading>
                {callReceipt.logs.map((log) => (
                  <code
                    key={log}
                    className="pl-3 border-l-4 border-gray-300 overflow-auto max-w-full"
                  >
                    {log}
                  </code>
                ))}
              </div>
            )}
            {!!callReceipt.error_messages.length && (
              <div className="flex flex-col gap-3 border-t border-[rgba(255,255,255,0.2)] mt-3 pt-3">
                <Heading size="h6">Error Messages</Heading>
                {callReceipt.error_messages.map((message) => (
                  <code
                    key={message}
                    className="pl-3 border-l-4 border-red-300 overflow-auto max-w-full"
                  >
                    {message}
                  </code>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-3 border-t border-[rgba(255,255,255,0.2)] mt-3 pt-3">
              <Heading size="h6">Timestamp</Heading>
              <Link
                key={callReceipt.ethscription_id}
                href={`${targetNetwork.blockExplorers.default.url}/txn/${callReceipt.ethscription_id}`}
                target="_blank"
                className="text-secondary hover:text-primary transition-colors text-lg"
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
