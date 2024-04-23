import BigNumber from "bignumber.js";
import {
  formatDistanceToNowStrict,
  intervalToDuration,
  parseISO,
} from "date-fns";
import { formatEther as formatEth, formatUnits, parseUnits } from "viem";

export const maxDecimals = function (
  value: BigNumber | number | undefined,
  decimalPlaces = 4
) {
  let result = (value ?? 0).toFixed(decimalPlaces);
  result = result.replace(/\.?0+$/, "");
  return result;
};

export const dynamicRound = (value: number) => {
  if (value === 0) return 0;

  let count = 1;
  let scaledValue = Math.abs(value);

  while (scaledValue < 2) {
    scaledValue *= 10;
    count++;
  }

  let decimalPlaces = Math.max(2, count);

  return parseFloat(value.toFixed(decimalPlaces));
};

export const formatTimestamp = (dateStr: string) => {
  if (!dateStr) return null;

  const targetDate = parseISO(dateStr);
  const now = new Date();

  if (targetDate.getTime() > now.getTime()) {
    const duration = intervalToDuration({ start: now, end: targetDate });

    let output = "";
    if (duration.days) {
      output = `${duration.days}d ${duration.hours}h`;
    } else if (duration.hours) {
      output = `${duration.hours}h ${duration.minutes}m`;
    } else if (duration.minutes) {
      output = `${duration.minutes}m ${duration.seconds}s`;
    } else {
      output = `${duration.seconds}s`;
    }

    return `in ${output}`;
  } else {
    const formattedDistance = formatDistanceToNowStrict(targetDate, {
      roundingMethod: "floor",
    });

    return `${formattedDistance} ago`;
  }
};

export const formatEther = (
  wei: string | number | bigint,
  toLocaleString = true
) => {
  try {
    if (toLocaleString) {
      return formatLocaleString(Number(formatEth(BigInt(wei)).toString()));
    }
    return formatEth(BigInt(wei)).toString();
  } catch (e) {
    console.error(e);
  }
  return "0";
};

export const formatLocaleString = (value: number) =>
  dynamicRound(value).toLocaleString(undefined, {
    maximumFractionDigits: 20,
  });

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
  value: string | bigint,
  decimals = 0,
  toLocaleString?: boolean,
  unit?: string
) => {
  if (!value) return "0";
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

export const parseTokenValue = (value: string, decimals: number) => {
  try {
    return parseUnits(value, decimals).toString();
  } catch (e) {
    console.error(e);
  }
  return "0";
};

export const cleanErrorMessage = (error: string) => {
  const errorMessageRegex = /error:\s(.+?)\s\(\w+:\d+\)/;
  const match = error.match(errorMessageRegex);
  return match ? match[1] : error;
};

export const isJsonArray = (input: any) => {
  let isArray = false;
  try {
    const json = JSON.parse(input);
    isArray = Array.isArray(json);
  } catch (e) {
    //
  } finally {
    return isArray;
  }
};
