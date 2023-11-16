import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { camelCase } from "lodash";
import { formatEther as formatEth, formatUnits, parseUnits } from "viem";

export const formatTimestamp = (date: Date) => {
  if (!date) return null;

  const timeAgo = formatDistanceToNowStrict(date, {
    roundingMethod: "floor",
  });

  return `${timeAgo} ago`;
};

export const formatEther = (wei: string | number, toLocaleString = true) => {
  try {
    if (toLocaleString) {
      return Number(formatEth(BigInt(wei)).toString()).toLocaleString();
    }
    return formatEth(BigInt(wei)).toString();
  } catch (e) {
    console.error(e);
  }
  return "0";
};

export const truncateMiddle = (
  str: string,
  frontLength: number,
  backLength: number
) => {
  if (str.length <= frontLength + backLength + 3) {
    return str;
  }

  const frontStr = str.substr(0, frontLength);
  const backStr = str.substr(str.length - backLength);
  return `${frontStr}...${backStr}`;
};

export const formatTokenValue = (
  value: string | number,
  decimals: number,
  key?: string,
  toLocaleString?: boolean,
  unit?: string
) => {
  const isToken =
    !key ||
    [
      "totalSupply",
      "maxSupply",
      "perMintLimit",
      "maxPerAddress",
      "amount",
      "value",
      "balance",
      "calculateOutputAmount",
      "tokenAAmount",
      "tokenBAmount",
      "inputAmount",
      "outputAmount",
      "allowance",
    ].includes(camelCase(key));
  if (!isToken) return value;
  let formattedValue = "";
  try {
    if (toLocaleString) {
      formattedValue = Number(
        formatUnits(BigInt(value), decimals).toString()
      ).toLocaleString();
    } else {
      formattedValue = formatUnits(BigInt(value), decimals).toString();
    }
    if (unit) {
      return `${formattedValue} ${unit}`;
    }
    return formattedValue;
  } catch (e) {
    console.error(e);
  }
  return "0";
};

export const parseTokenValue = (
  value: string,
  decimals: number,
  key?: string,
  toLocaleString?: boolean
) => {
  const isToken =
    !key ||
    ["totalSupply", "maxSupply", "perMintLimit", "amount", "value"].includes(
      camelCase(key)
    );
  if (!isToken) return value;
  let formattedValue = "";
  try {
    if (toLocaleString) {
      formattedValue = Number(
        parseUnits(value, decimals).toString()
      ).toLocaleString();
    } else {
      formattedValue = parseUnits(value, decimals).toString();
    }
    return formattedValue;
  } catch (e) {
    console.error(e);
  }
  return "0";
};
