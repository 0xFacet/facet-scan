import { InternalTransaction, Transaction } from "./blocks";

export type CurrentState = {
  [key: string]: any;
};

export interface ContractFunction {
  name: string;
  type: "function";
  inputs: FunctionInput[];
  outputs: FunctionOutput[];
  stateMutability: "pure" | "view" | "non_payable";
  visibility: "public" | "private" | "internal" | "external";
  overrideModifiers: string[];
  fromParent: boolean;
}

export interface FunctionInput {
  name: string;
  type: string;
  components?: FunctionInput[];
}

export interface FunctionOutput {
  name?: string;
  type: string;
}

export interface ContractConstructor {
  type: "constructor";
  inputs: FunctionInput[];
  stateMutability: "non_payable";
  visibility: null;
  overrideModifiers: string[];
  fromParent: boolean;
}

export type ContractABI = Array<ContractFunction | ContractConstructor>;

export interface ContractArtifact {
  name: string;
  source_code: string;
  init_code_hash: string;
  abi: ContractABI;
}

export type SourceCode = {
  code: string;
  language: string;
};

export interface Contract {
  transaction_hash: string;
  current_type: string;
  current_init_code_hash: string;
  abi: ContractABI;
  call_receipts: InternalTransaction[];
  address: `0x${string}`;
  current_state: CurrentState;
  source_code: SourceCode[];
  deployment_transaction?: Transaction;
}
