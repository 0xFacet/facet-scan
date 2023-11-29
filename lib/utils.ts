import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pluralize(count: number, word: string) {
  return `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;
}

export function isCardNameWithAt(name: string) {
  const regex = /^@[a-zA-Z0-9]{1,31}$/;
  return regex.test(name);
}

export function isCardName(name: string) {
  const regex = /^[a-zA-Z0-9]{1,31}$/;
  return regex.test(name);
}

export function isTxHash(hash: string) {
  const regex = /^0x[a-fA-F0-9]{64}$/;
  return regex.test(hash);
}
